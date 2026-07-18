// Lưu trữ cho pipeline ingestion — dùng chung Redis client với app (lib/redis.js),
// nhưng để riêng key, không đụng vào places:live / places:pending đang chạy thật.
//
// place_sources KHÔNG tách key riêng: nhúng luôn trong từng review item / snapshot
// (mảng `sources`), vì Redis là key-value, không phải quan hệ — nhúng đơn giản hơn ở
// quy mô này (vài chục địa điểm). Nếu sau này cần truy vấn theo nguồn độc lập, tách ra
// sau cũng không khó vì dữ liệu đã có cấu trúc rõ.

import { redis } from "../redis.js";

export const KEYS = {
  REVIEW_QUEUE: "ingestion:review_queue",
  REVIEW_EVENTS: "ingestion:review_events",
  SOURCE_RUNS: "ingestion:source_runs",
  PLACE_SNAPSHOTS: "ingestion:place_snapshots",
  CONFIRMED_DISTINCT: "ingestion:confirmed_distinct",
};

async function getList(key) {
  const data = await redis.get(key);
  return data ?? [];
}

async function setList(key, list) {
  await redis.set(key, list);
}

export async function getReviewQueue() {
  return getList(KEYS.REVIEW_QUEUE);
}

export async function saveReviewQueue(items) {
  return setList(KEYS.REVIEW_QUEUE, items);
}

export async function appendReviewEvent(event) {
  const events = await getList(KEYS.REVIEW_EVENTS);
  events.push(event);
  await setList(KEYS.REVIEW_EVENTS, events);
}

export async function appendSourceRun(run) {
  const runs = await getList(KEYS.SOURCE_RUNS);
  runs.push(run);
  // Giữ tối đa 200 lần chạy gần nhất, tránh phình vô hạn.
  const trimmed = runs.slice(-200);
  await setList(KEYS.SOURCE_RUNS, trimmed);
  return run;
}

export async function appendPlaceSnapshot(snapshot) {
  const snapshots = await getList(KEYS.PLACE_SNAPSHOTS);
  snapshots.push(snapshot);
  // TODO(v2): trim theo placeKey (giữ N snapshot gần nhất/chỗ) thay vì trim toàn cục.
  const trimmed = snapshots.slice(-1000);
  await setList(KEYS.PLACE_SNAPSHOTS, trimmed);
  return snapshot;
}

export async function getPlaceSnapshotsFor(placeKey) {
  const all = await getList(KEYS.PLACE_SNAPSHOTS);
  return all.filter((s) => s.placeKey === placeKey);
}

// Cặp place:live đã được người duyệt xác nhận là 2 chỗ KHÁC NHAU (dù dữ liệu quét được
// có thể trông giống nhau — trùng địa chỉ/SĐT do nguồn quét nhầm). Dùng để match.js không
// hỏi lại mỗi lần quét ra dữ liệu giống hệt lần trước — xem DECISIONS.md 2026-07-18.
export async function getConfirmedDistinctPairs() {
  return getList(KEYS.CONFIRMED_DISTINCT);
}

export async function appendConfirmedDistinctPair(pair) {
  const pairs = await getConfirmedDistinctPairs();
  const exists = pairs.some(
    (p) => (p.a === pair.a && p.b === pair.b) || (p.a === pair.b && p.b === pair.a)
  );
  if (exists) return;
  pairs.push(pair);
  await setList(KEYS.CONFIRMED_DISTINCT, pairs);
}
