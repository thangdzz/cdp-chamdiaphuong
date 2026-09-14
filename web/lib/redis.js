import { Redis } from "@upstash/redis";

// Vercel injects biến môi trường với tiền tố KV_ (không phải UPSTASH_REDIS_REST_*),
// nên khởi tạo thủ công thay vì dùng Redis.fromEnv().
export const redis = new Redis({
  url: process.env.KV_REST_API_URL,
  token: process.env.KV_REST_API_TOKEN,
});

export const LIVE_KEY = "places:live";
export const PENDING_KEY = "places:pending";

// Chỉ dùng khi chạy integration test: production không đặt biến này nên toàn bộ key giữ
// nguyên. Crawler test cần cả live + queue cùng namespace để không bao giờ ghi dữ liệu thật.
function dataKey(key) {
  const namespace = process.env.CDP_INGESTION_NAMESPACE?.trim();
  return namespace ? `${namespace}:${key}` : key;
}

export async function getLivePlaces() {
  const data = await redis.get(dataKey(LIVE_KEY));
  return data ?? [];
}

export async function getPendingPlaces() {
  const data = await redis.get(dataKey(PENDING_KEY));
  return data ?? [];
}

export async function setLivePlaces(places) {
  await redis.set(dataKey(LIVE_KEY), places);
}

export async function setPendingPlaces(places) {
  await redis.set(dataKey(PENDING_KEY), places);
}
