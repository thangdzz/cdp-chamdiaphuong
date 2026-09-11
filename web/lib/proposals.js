// Địa điểm do khách ĐỀ XUẤT khi dựng lộ trình (NOTE-07 §6.B, §10, §11).
//
// Nguyên tắc gốc (§8): **Lộ trình thuộc về người tạo; danh bạ thuộc về CDP.**
// Khách gõ một chỗ chưa có trong danh bạ -> chỗ đó vào lộ trình của họ NGAY (kèm nhãn chưa
// xác minh), đồng thời xếp hàng chờ admin. CDP chỉ kiểm soát thứ gì được PUBLIC vào danh bạ,
// không kiểm soát lộ trình cá nhân của ai.
//
// Hai khoá:
//   place_proposals:queue  — mảng đang chờ duyệt, cho /admin đọc
//   place_proposals:index  — HASH, field = proposalId, value = { status, name, type, ward,
//                            address, livePlaceId }. Đây là thứ lộ trình tra lúc hiển thị.
//
// Vì sao tách `index` khỏi `queue`: lộ trình phải tra được proposal kể cả sau khi nó rời hàng
// chờ (đã duyệt hoặc đã từ chối) — 1 lệnh HGETALL, không phải quét cả hàng chờ.
//
// KHÔNG ghi lại route khi admin duyệt/từ chối. Trạng thái tra tại lúc ĐỌC (xem
// resolveRouteStops), nên duyệt 1 proposal là mọi lộ trình đang tham chiếu nó tự đổi theo —
// không phải đi sửa từng lộ trình của từng người (§10 "user không phải sửa route thủ công").

import crypto from "crypto";
import { redis } from "./redis.js";
import { assertValidPlaceType } from "./placeTypes.js";
import { containsLinkOrPhone } from "./textFilter.js";

const QUEUE_KEY = "place_proposals:queue";
const INDEX_KEY = "place_proposals:index";

export const PROPOSAL_STATUS = { PENDING: "pending", APPROVED: "approved", REJECTED: "rejected" };

const MAX_NAME = 80;
const MAX_ADDRESS = 120;
const MAX_NOTE = 200;
const MAX_PENDING_PER_CONTRIBUTOR = 5;

function clean(value, maxLength) {
  const text = (value ?? "").toString().trim().slice(0, maxLength);
  return text || null;
}

export async function getProposalQueue() {
  return (await redis.get(QUEUE_KEY)) ?? [];
}

async function saveQueue(queue) {
  await redis.set(QUEUE_KEY, queue);
}

/** Bảng tra cho lúc hiển thị lộ trình — 1 lệnh HGETALL, không tăng theo số điểm. */
export async function getProposalIndex() {
  return (await redis.hgetall(INDEX_KEY)) ?? {};
}

export async function createProposal({ contributorId, name, type, ward, address, note }) {
  const cleanName = clean(name, MAX_NAME);
  if (!cleanName) return { ok: false, error: "Chưa nhập tên địa điểm." };

  let cleanType;
  try {
    cleanType = assertValidPlaceType(type);
  } catch {
    return { ok: false, error: "Chưa chọn loại địa điểm." };
  }

  const cleanWard = clean(ward, MAX_ADDRESS);
  const cleanAddress = clean(address, MAX_ADDRESS);
  const cleanNote = clean(note, MAX_NOTE);
  // Cùng lớp lọc với mẹo địa phương: chặn link/số điện thoại trong chữ tự do, tránh biến ô đề
  // xuất thành chỗ rải quảng cáo.
  for (const text of [cleanName, cleanWard, cleanAddress, cleanNote]) {
    if (text && containsLinkOrPhone(text)) {
      return { ok: false, error: "Không được chứa link hoặc số điện thoại." };
    }
  }

  const queue = await getProposalQueue();
  if (contributorId) {
    const pending = queue.filter((p) => p.contributorId === contributorId).length;
    if (pending >= MAX_PENDING_PER_CONTRIBUTOR) {
      return { ok: false, error: `Bạn đang có ${MAX_PENDING_PER_CONTRIBUTOR} đề xuất chờ duyệt rồi.` };
    }
  }

  const id = `prop-${crypto.randomUUID()}`;
  const record = {
    id,
    name: cleanName,
    type: cleanType,
    ward: cleanWard,
    address: cleanAddress,
    note: cleanNote,
    contributorId: contributorId ?? null,
    createdAt: new Date().toISOString(),
  };

  queue.push(record);
  await saveQueue(queue);
  // HSET theo field, không ghi đè cả hash — nhiều người đề xuất cùng lúc không đè nhau.
  await redis.hset(INDEX_KEY, {
    [id]: {
      status: PROPOSAL_STATUS.PENDING,
      name: cleanName,
      type: cleanType,
      ward: cleanWard,
      address: cleanAddress,
      livePlaceId: null,
    },
  });

  return { ok: true, proposal: record };
}

/**
 * Duyệt: proposal trở thành địa điểm thật, và mọi lộ trình đang trỏ tới nó tự chuyển sang
 * địa điểm chính thức (§10) — chỉ nhờ ghi `livePlaceId` vào bảng tra, không đụng route nào.
 */
export async function approveProposal({ proposalId, livePlaceId }) {
  const entry = await redis.hget(INDEX_KEY, proposalId);
  if (!entry) return { ok: false, error: "Không tìm thấy đề xuất." };
  await redis.hset(INDEX_KEY, {
    [proposalId]: { ...entry, status: PROPOSAL_STATUS.APPROVED, livePlaceId },
  });
  const queue = await getProposalQueue();
  await saveQueue(queue.filter((p) => p.id !== proposalId));
  return { ok: true, contributorId: queue.find((p) => p.id === proposalId)?.contributorId ?? null };
}

/**
 * Từ chối: KHÔNG xoá điểm khỏi lộ trình của ai (§11). Điểm đó chỉ thôi là "đang chờ CDP xét"
 * và trở thành điểm riêng của người tạo — admin từ chối đưa vào danh bạ không có nghĩa nó vô
 * nghĩa với chuyến đi của họ.
 */
export async function rejectProposal({ proposalId }) {
  const entry = await redis.hget(INDEX_KEY, proposalId);
  if (!entry) return { ok: false, error: "Không tìm thấy đề xuất." };
  await redis.hset(INDEX_KEY, { [proposalId]: { ...entry, status: PROPOSAL_STATUS.REJECTED } });
  const queue = await getProposalQueue();
  await saveQueue(queue.filter((p) => p.id !== proposalId));
  return { ok: true };
}
