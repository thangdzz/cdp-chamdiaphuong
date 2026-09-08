// Xác nhận số điện thoại (NOTE-01 §6) — thao tác của KHÁCH, nhiều người có thể bấm cùng lúc.
// Dùng lệnh Redis nguyên tử theo field, KHÔNG đọc-cả-mảng-rồi-ghi-lại (giống lib/checkins.js
// và lib/answers.js, xem ARCHITECTURE §6).

import { redis } from "./redis.js";

// Hash mỗi chỗ: field = "{số đã chuẩn hoá}:{anonId}" -> { status, at }.
// Số nằm TRONG khoá là có chủ đích: khi số của địa điểm đổi, mọi xác nhận cho số cũ tự động
// không còn được tính cho số mới (NOTE-01 §6.4), mà vẫn giữ lại được lịch sử.
function confirmationsKey(placeId) {
  return `place_phone_confirmations:${placeId}`;
}

// Bỏ mọi thứ không phải chữ số để "096 283 7837", "0962.837.837" và "0962837837" không bị
// tính thành 3 số khác nhau. Giữ dấu + đầu số quốc tế.
export function normalizePhone(phone) {
  if (!phone) return null;
  const cleaned = String(phone).trim().replace(/[^\d+]/g, "");
  return cleaned || null;
}

// Phiếu quá hạn này thì bỏ hẳn, không tính nữa. Đơn giản hoá có chủ đích so với NOTE-01 §6.5
// (trọng số giảm dần như voteWeight() ở lib/answers.js): nhãn hiển thị là SỐ NGƯỜI nguyên
// ("3 người đã xác nhận") nên trọng số phân số không thể hiện ra được, chỉ làm khó hiểu.
const VOTE_MAX_AGE_DAYS = 365;

function isStillValid(at) {
  if (!at) return false;
  const ageDays = (Date.now() - new Date(at).getTime()) / 86400000;
  return ageDays >= 0 && ageDays < VOTE_MAX_AGE_DAYS;
}

export const PHONE_STATUS = {
  NONE: "none", // chưa ai xác nhận
  CONFIRMED: "confirmed", // có người xác nhận, không có báo sai mới hơn
  DISPUTED: "disputed", // có báo sai mới hơn lần xác nhận gần nhất
};

/**
 * Tình trạng xác nhận của ĐÚNG số điện thoại đang hiển thị cho chỗ đó.
 * @returns {{status: string, confirmCount: number, myVote: "correct"|"incorrect"|null}}
 */
export async function getPhoneStatus(placeId, phone, anonId) {
  const normalized = normalizePhone(phone);
  if (!placeId || !normalized) {
    return { status: PHONE_STATUS.NONE, confirmCount: 0, myVote: null };
  }

  const all = (await redis.hgetall(confirmationsKey(placeId))) ?? {};
  const prefix = `${normalized}:`;

  let confirmCount = 0;
  let newestConfirmAt = null;
  let newestIncorrectAt = null;
  let myVote = null;

  for (const [field, vote] of Object.entries(all)) {
    if (!field.startsWith(prefix)) continue; // phiếu của số khác (số cũ) — không tính
    if (!isStillValid(vote?.at)) continue;

    const voterId = field.slice(prefix.length);
    if (anonId && voterId === anonId) myVote = vote.status;

    if (vote.status === "correct") {
      confirmCount += 1;
      if (!newestConfirmAt || new Date(vote.at) > new Date(newestConfirmAt)) newestConfirmAt = vote.at;
    } else if (vote.status === "incorrect") {
      if (!newestIncorrectAt || new Date(vote.at) > new Date(newestIncorrectAt)) newestIncorrectAt = vote.at;
    }
  }

  // Báo sai MỚI HƠN lần xác nhận gần nhất thì cảnh báo được ưu tiên (NOTE-01 §6.5) — kể cả
  // khi số lượt xác nhận đúng đang nhiều hơn.
  let status = PHONE_STATUS.NONE;
  if (newestIncorrectAt && (!newestConfirmAt || new Date(newestIncorrectAt) > new Date(newestConfirmAt))) {
    status = PHONE_STATUS.DISPUTED;
  } else if (confirmCount > 0) {
    status = PHONE_STATUS.CONFIRMED;
  }

  return { status, confirmCount, myVote };
}

/**
 * Ghi 1 phiếu. Trả về `alreadyVoted: true` nếu người này đã từng bỏ phiếu cho ĐÚNG số này —
 * dùng để không cộng điểm lần hai (đổi ý vẫn ghi nhận, chỉ không thưởng thêm).
 */
export async function submitPhoneConfirmation({ placeId, phone, anonId, status }) {
  const normalized = normalizePhone(phone);
  if (!placeId || !normalized || !anonId) return { ok: false };
  if (status !== "correct" && status !== "incorrect") return { ok: false };

  const key = confirmationsKey(placeId);
  const field = `${normalized}:${anonId}`;
  const existing = await redis.hget(key, field);

  // Đổi ý thì cập nhật `at` mới — nhánh "báo sai mới hơn" ở getPhoneStatus() dựa vào mốc này.
  await redis.hset(key, { [field]: { status, at: new Date().toISOString() } });

  return { ok: true, alreadyVoted: Boolean(existing) };
}

// Dọn theo chỗ bị xoá/gộp, gọi cùng removeLatestCheckin/removePlaceAnswers.
export async function removePhoneConfirmations(placeId) {
  await redis.del(confirmationsKey(placeId));
}
