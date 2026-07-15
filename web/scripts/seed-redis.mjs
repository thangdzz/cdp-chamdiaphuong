import { Redis } from "@upstash/redis";
import places from "../data/places.json" with { type: "json" };

const redis = new Redis({
  url: process.env.KV_REST_API_URL,
  token: process.env.KV_REST_API_TOKEN,
});

const existing = await redis.get("places:live");
if (existing) {
  console.log(
    `places:live đã có ${existing.length} chỗ — không ghi đè. Xoá key thủ công nếu muốn seed lại.`
  );
  process.exit(0);
}

await redis.set("places:live", places);
const pending = await redis.get("places:pending");
if (!pending) {
  await redis.set("places:pending", []);
}

console.log(`Đã đưa ${places.length} chỗ vào Redis (places:live).`);
