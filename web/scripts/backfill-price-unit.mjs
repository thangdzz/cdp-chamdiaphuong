import { Redis } from "@upstash/redis";
import { formatPriceText } from "../lib/priceFormat.js";

const redis = new Redis({
  url: process.env.KV_REST_API_URL,
  token: process.env.KV_REST_API_TOKEN,
});

const UNIT_BY_ID = {
  "ngu-01": "đêm",
  "ngu-02": "đêm",
  "an-06": "bát",
  "an-07": "bát",
};

function guessUnit(place) {
  if (UNIT_BY_ID[place.id]) return UNIT_BY_ID[place.id];
  if (place.type === "ngu") return "đêm";
  const name = place.name.toLowerCase();
  if (name.includes("cafe") || name.includes("coffee") || name.includes("cà phê")) {
    return "ly";
  }
  return null;
}

async function backfill(key) {
  const places = await redis.get(key);
  if (!places) return;

  let changed = 0;
  const updated = places.map((p) => {
    if (p.priceMin == null && p.priceMax == null) return p;
    if (p.priceUnit) return p;

    const priceUnit = guessUnit(p);
    const priceText = formatPriceText({ ...p, priceUnit });
    changed++;
    return { ...p, priceUnit, priceText };
  });

  if (changed > 0) {
    await redis.set(key, updated);
  }
  console.log(`${key}: đã cập nhật ${changed}/${places.length} chỗ.`);
}

await backfill("places:live");
await backfill("places:pending");
