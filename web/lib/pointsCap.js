// Trần điểm CHUNG cho mọi nguồn điểm trong ngày (SPEC-chang-2.md §4.2) — 30 điểm/người/ngày.
// Đứng TRƯỚC lệnh cộng điểm thật (contributors.js addContributorPoints), không thay thế các
// trần riêng của từng tính năng (VD: Chặng 1 vẫn giữ trần riêng 3 lượt xác nhận/ngày).

import { redis } from "./redis.js";

const DAILY_CAP = 30;
const TTL_SECONDS = 48 * 60 * 60;

function key(anonId, dateStr) {
  return `points:day:${anonId}:${dateStr}`;
}

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

// Trừ trước, hỏi sau: cộng thử amount vào bộ đếm ngày; nếu tổng vẫn <= trần thì cho phép
// (true), không thì hoàn lại phần vừa cộng thử và từ chối (false) — không cộng điểm 1 phần.
export async function trySpendDailyPoints(anonId, amount) {
  const k = key(anonId, todayStr());
  const total = await redis.incrby(k, amount);
  if (total === amount) await redis.expire(k, TTL_SECONDS);
  if (total <= DAILY_CAP) return true;
  await redis.decrby(k, amount);
  return false;
}
