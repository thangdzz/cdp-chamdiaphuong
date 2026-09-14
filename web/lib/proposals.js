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
//                            address, livePlaceId, replacesPlaceId? }. Đây là thứ lộ trình
//                            và flow thay thế tra lúc hiển thị.
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

export function proposalQueueKey() {
  const namespace = process.env.CDP_PROPOSALS_NAMESPACE?.trim();
  const key = "place_proposals:queue";
  return namespace ? `${namespace}:${key}` : key;
}

export function proposalIndexKey() {
  const namespace = process.env.CDP_PROPOSALS_NAMESPACE?.trim();
  const key = "place_proposals:index";
  return namespace ? `${namespace}:${key}` : key;
}

export const PROPOSAL_STATUS = { PENDING: "pending", APPROVED: "approved", REJECTED: "rejected" };

const MAX_NAME = 80;
const MAX_ADDRESS = 120;
const MAX_NOTE = 200;
const MAX_PENDING_PER_CONTRIBUTOR = 5;

function clean(value, maxLength) {
  const text = (value ?? "").toString().trim().slice(0, maxLength);
  return text || null;
}

function cleanCoordinates(value) {
  const lat = Number(value?.lat);
  const lng = Number(value?.lng);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
  if (lat < -90 || lat > 90 || lng < -180 || lng > 180) return null;
  return { lat, lng };
}

export async function getProposalQueue() {
  return (await redis.get(proposalQueueKey())) ?? [];
}

async function saveQueue(queue) {
  await redis.set(proposalQueueKey(), queue);
}

/** Bảng tra cho lúc hiển thị lộ trình — 1 lệnh HGETALL, không tăng theo số điểm. */
export async function getProposalIndex() {
  return (await redis.hgetall(proposalIndexKey())) ?? {};
}

export async function createProposal({
  contributorId,
  name,
  type,
  ward,
  address,
  localArea,
  coordinates,
  note,
  replacesPlaceId,
  replacesPlaceName,
}) {
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
  const cleanLocalArea = clean(localArea, MAX_ADDRESS);
  const cleanReplacesPlaceId = clean(replacesPlaceId, MAX_ADDRESS);
  const cleanReplacesPlaceName = clean(replacesPlaceName, MAX_NAME);
  const cleanLocation = cleanCoordinates(coordinates);
  const cleanNote = clean(note, MAX_NOTE);
  // Cùng lớp lọc với mẹo địa phương: chặn link/số điện thoại trong chữ tự do, tránh biến ô đề
  // xuất thành chỗ rải quảng cáo.
  for (const text of [cleanName, cleanWard, cleanAddress, cleanLocalArea, cleanNote]) {
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
  if (
    cleanReplacesPlaceId &&
    queue.some(
      (proposal) =>
        proposal.replacesPlaceId === cleanReplacesPlaceId &&
        proposal.name?.toLocaleLowerCase("vi") === cleanName.toLocaleLowerCase("vi"),
    )
  ) {
    return { ok: false, error: "Địa điểm thay thế này đang chờ duyệt rồi." };
  }

  const id = `prop-${crypto.randomUUID()}`;
  const record = {
    id,
    name: cleanName,
    type: cleanType,
    ward: cleanWard,
    address: cleanAddress,
    localArea: cleanLocalArea,
    coordinates: cleanLocation,
    note: cleanNote,
    replacesPlaceId: cleanReplacesPlaceId,
    replacesPlaceName: cleanReplacesPlaceName,
    contributorId: contributorId ?? null,
    createdAt: new Date().toISOString(),
  };

  queue.push(record);
  await saveQueue(queue);
  // HSET theo field, không ghi đè cả hash — nhiều người đề xuất cùng lúc không đè nhau.
  await redis.hset(proposalIndexKey(), {
    [id]: {
      status: PROPOSAL_STATUS.PENDING,
      name: cleanName,
      type: cleanType,
      ward: cleanWard,
      address: cleanAddress,
      localArea: cleanLocalArea,
      coordinates: cleanLocation,
      livePlaceId: null,
      replacesPlaceId: cleanReplacesPlaceId,
    },
  });

  return { ok: true, proposal: record };
}

/**
 * Duyệt: proposal trở thành địa điểm thật, và mọi lộ trình đang trỏ tới nó tự chuyển sang
 * địa điểm chính thức (§10) — chỉ nhờ ghi `livePlaceId` vào bảng tra, không đụng route nào.
 */
export async function approveProposal({ proposalId, livePlaceId }) {
  const entry = await redis.hget(proposalIndexKey(), proposalId);
  if (!entry) return { ok: false, error: "Không tìm thấy đề xuất." };
  await redis.hset(proposalIndexKey(), {
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
  const entry = await redis.hget(proposalIndexKey(), proposalId);
  if (!entry) return { ok: false, error: "Không tìm thấy đề xuất." };
  await redis.hset(proposalIndexKey(), { [proposalId]: { ...entry, status: PROPOSAL_STATUS.REJECTED } });
  const queue = await getProposalQueue();
  await saveQueue(queue.filter((p) => p.id !== proposalId));
  return { ok: true };
}
