// Xác nhận "hôm nay vẫn mở" (Chặng 1) — thao tác của KHÁCH, nhiều người có thể bấm cùng
// lúc. Khác với phần lớn dự án (đọc-cả-mảng -> sửa -> ghi-cả-mảng, chỉ an toàn khi admin
// duyệt từng cái một), ở đây dùng lệnh Redis nguyên tử cho từng bước — xem ARCHITECTURE §6
// và docs/SPEC-chang-1.md §3.3.

import { redis } from "./redis.js";

// Hash: placeId -> ISO timestamp của lần xác nhận gần nhất. Không dùng 1 key/chỗ (sorted
// set) vì trang chủ force-dynamic cần đọc lần xác nhận gần nhất của MỌI chỗ mỗi lượt xem —
// 1 HGETALL luôn là 1 lệnh dù 25 hay 100 chỗ, còn N key riêng sẽ là N lệnh/lượt xem.
const LATEST_KEY = "place_checkins:latest";

const LOCK_TTL_SECONDS = 24 * 60 * 60;
const POINTS_CAP_PER_DAY = 3;
const POINTS_COUNTER_TTL_SECONDS = 2 * 24 * 60 * 60;

function lockKey(placeId, anonId) {
  return `checkin:lock:${placeId}:${anonId}`;
}

function pointsCounterKey(anonId, dateStr) {
  return `checkin:points-count:${anonId}:${dateStr}`;
}

function todayDateStr() {
  return new Date().toISOString().slice(0, 10);
}

export async function hasCheckedInRecently(placeId, anonId) {
  const exists = await redis.exists(lockKey(placeId, anonId));
  return exists === 1;
}

export async function getAllLatestCheckins() {
  const data = await redis.hgetall(LATEST_KEY);
  return data ?? {};
}

export async function removeLatestCheckin(placeId) {
  await redis.hdel(LATEST_KEY, placeId);
}

// Thứ tự bắt buộc: khoá trước, tính điểm sau. Nếu khoá thất bại (đã bấm trong 24h) thì dừng
// ngay, không chạm tới bộ đếm điểm — bấm lại nhiều lần trong ngày không được ghi thêm cũng
// không được đốt mất hạn mức 3 điểm/ngày của người đó.
export async function submitCheckin(placeId, anonId) {
  const locked = await redis.set(lockKey(placeId, anonId), Date.now(), {
    nx: true,
    ex: LOCK_TTL_SECONDS,
  });
  if (locked !== "OK") {
    return { ok: true, alreadyCheckedIn: true, pointsAwarded: false };
  }

  const at = new Date().toISOString();
  await redis.hset(LATEST_KEY, { [placeId]: at });

  const key = pointsCounterKey(anonId, todayDateStr());
  const count = await redis.incr(key);
  if (count === 1) {
    await redis.expire(key, POINTS_COUNTER_TTL_SECONDS);
  }

  return { ok: true, alreadyCheckedIn: false, pointsAwarded: count <= POINTS_CAP_PER_DAY, at };
}
