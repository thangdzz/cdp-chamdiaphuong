import { Redis } from "@upstash/redis";

// Vercel injects biến môi trường với tiền tố KV_ (không phải UPSTASH_REDIS_REST_*),
// nên khởi tạo thủ công thay vì dùng Redis.fromEnv().
export const redis = new Redis({
  url: process.env.KV_REST_API_URL,
  token: process.env.KV_REST_API_TOKEN,
});

export const LIVE_KEY = "places:live";
export const PENDING_KEY = "places:pending";

export async function getLivePlaces() {
  const data = await redis.get(LIVE_KEY);
  return data ?? [];
}

export async function getPendingPlaces() {
  const data = await redis.get(PENDING_KEY);
  return data ?? [];
}

export async function setLivePlaces(places) {
  await redis.set(LIVE_KEY, places);
}

export async function setPendingPlaces(places) {
  await redis.set(PENDING_KEY, places);
}
