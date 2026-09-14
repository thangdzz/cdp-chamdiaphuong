// Kho dữ liệu game layer trên Redis. Báo sighting là thao tác của KHÁCH, nhiều người bấm cùng
// lúc giữa phố — nên KHÔNG dùng kiểu đọc-cả-mảng/sửa/ghi-cả-mảng (ARCHITECTURE §6). Mỗi bước
// là một lệnh nguyên tử: HSETNX chống đếm trùng bộ sưu tập + first discovery, HINCRBY cho số
// đếm, ZADD cho dòng thời gian. Danh sách key xem ARCHITECTURE §2 "Game layer".

import crypto from "crypto";
import { redis } from "../redis.js";
import {
  OBJECT_KIND,
  aliasesOf,
  catalogIndex,
  mergeCatalog,
  normalizeObject,
  resolveObjectId,
} from "./catalog.js";
import { areaCell, isWithinBounds } from "./geo.js";
import { buildMarkers } from "./mapLayer.js";
import { generateQuests } from "./quests.js";
import { resolveObjectStats } from "./progress.js";
import { EVENT_PHASE, eventPhase } from "./registry.js";

const RECENT_FETCH_LIMIT = 400;
const HISTORY_LIMIT = 200;
const SAME_OBJECT_COOLDOWN_SECONDS = 3 * 60;
const RATE_WINDOW_SECONDS = 10 * 60;
const RATE_LIMIT_PER_WINDOW = 20;

// Test local dùng namespace riêng để không ghi vào dữ liệu thật (dev + production chung Redis).
function key(eventId, suffix) {
  const namespace = process.env.CDP_GAME_NAMESPACE?.trim();
  const base = `game:${eventId}:${suffix}`;
  return namespace ? `${namespace}:${base}` : base;
}

export const GAME_KEYS = {
  objects: (e) => key(e, "objects"),
  sightings: (e) => key(e, "sightings"),
  sightingsByTime: (e) => key(e, "sightings:by-time"),
  objectStats: (e) => key(e, "object-stats"),
  objectPhotos: (e) => key(e, "object-photos"),
  firsts: (e) => key(e, "firsts"),
  flags: (e) => key(e, "flags"),
  counters: (e) => key(e, "counters"),
  areaActivity: (e) => key(e, "area-activity"),
  collection: (e, anonId) => key(e, `collection:${anonId}`),
  userSightings: (e, anonId) => key(e, `user-sightings:${anonId}`),
  cooldown: (e, anonId, objectId) => key(e, `cooldown:${anonId}:${objectId}`),
  rate: (e, anonId, bucket) => key(e, `rate:${anonId}:${bucket}`),
  flagLock: (e, sightingId, anonId) => key(e, `flag-lock:${sightingId}:${anonId}`),
};

// @upstash/redis tự parse JSON khi đọc, nhưng giá trị cũ/ghi tay có thể vẫn là chuỗi.
function parseJson(value) {
  if (value && typeof value === "object") return value;
  if (typeof value !== "string") return null;
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}

function parseHash(hash) {
  const out = {};
  for (const [field, value] of Object.entries(hash ?? {})) {
    const parsed = parseJson(value);
    if (parsed) out[field] = parsed;
  }
  return out;
}

export class GameInputError extends Error {}

// ───────────────────────────── Catalog (Object) ─────────────────────────────

export async function readCatalog(event) {
  const stored = parseHash(await redis.hgetall(GAME_KEYS.objects(event.id)));
  return mergeCatalog(event.objects, stored, event.id);
}

async function writeObject(event, object) {
  await redis.hset(GAME_KEYS.objects(event.id), { [object.id]: JSON.stringify(object) });
}

function unknownCode() {
  return crypto.randomUUID().replace(/-/g, "").slice(0, 4).toUpperCase();
}

async function createUnknownObject(event) {
  const code = unknownCode();
  const now = new Date().toISOString();
  const object = normalizeObject(
    {
      id: `unk-${code.toLowerCase()}-${crypto.randomUUID().slice(0, 6)}`,
      kind: OBJECT_KIND.UNKNOWN,
      code,
      eventYear: event.year,
      source: "user_sighting",
      createdAt: now,
      updatedAt: now,
    },
    event.id
  );
  await writeObject(event, object);
  return object;
}

// ─────────────────────────────── Sighting ───────────────────────────────

function sanitizeLocation(event, input) {
  const lat = Number(input.lat);
  const lng = Number(input.lng);
  if (!isWithinBounds({ lat, lng }, event.map?.bounds)) {
    throw new GameInputError("Vị trí nằm ngoài khu vực lễ hội. Kéo bản đồ về đúng chỗ bạn thấy.");
  }
  const accuracy = Number(input.accuracy);
  return {
    lat,
    lng,
    accuracy: Number.isFinite(accuracy) && accuracy > 0 ? Math.min(Math.round(accuracy), 5000) : null,
    locationSource: ["gps", "map", "marker"].includes(input.locationSource)
      ? input.locationSource
      : "map",
  };
}

async function enforceRateLimit(event, anonId) {
  const bucket = Math.floor(Date.now() / (RATE_WINDOW_SECONDS * 1000));
  const rateKey = GAME_KEYS.rate(event.id, anonId, bucket);
  const count = await redis.incr(rateKey);
  if (count === 1) await redis.expire(rateKey, RATE_WINDOW_SECONDS * 2);
  if (count > RATE_LIMIT_PER_WINDOW) {
    throw new GameInputError("Bạn báo hơi nhanh. Nghỉ vài phút rồi báo tiếp nhé.");
  }
}

/**
 * Ghi một lượt "vừa thấy" (NOTE-04 §8, §18). Ảnh KHÔNG xử lý ở đây — action upload trước rồi
 * truyền `photo` vào, để lỗi ảnh không bao giờ làm mất lượt báo.
 */
export async function recordSighting(event, { anonId, nickname, objectId, location, photo }) {
  if (eventPhase(event) !== EVENT_PHASE.LIVE) {
    throw new GameInputError("Mùa săn này chưa mở hoặc đã khép lại.");
  }
  if (!anonId) throw new GameInputError("Thiếu hồ sơ người chơi.");
  const cleanLocation = sanitizeLocation(event, location ?? {});

  let catalog = await readCatalog(event);
  let index = catalogIndex(catalog);
  let target;
  if (objectId === "unknown") {
    await enforceRateLimit(event, anonId);
    target = await createUnknownObject(event);
    catalog = [...catalog, target];
    index = catalogIndex(catalog);
  } else {
    const resolvedId = resolveObjectId(objectId, index);
    target = index.get(resolvedId);
    if (!target || target.hidden) throw new GameInputError("Không tìm thấy mô hình này.");
    // Chặn bấm lặp cùng một object liên tục (NOTE-04 §21) TRƯỚC khi đốt hạn mức chung.
    const cooled = await redis.set(GAME_KEYS.cooldown(event.id, anonId, target.id), "1", {
      nx: true,
      ex: SAME_OBJECT_COOLDOWN_SECONDS,
    });
    if (cooled !== "OK") {
      throw new GameInputError("Bạn vừa báo mô hình này rồi. Vài phút nữa báo lại nhé.");
    }
    await enforceRateLimit(event, anonId);
  }

  const now = new Date().toISOString();
  const sighting = {
    id: `s-${crypto.randomUUID()}`,
    eventId: event.id,
    objectId: target.id,
    // Giữ đúng hai trường NOTE-04 §16 để đối chiếu dữ liệu về sau.
    modelId: target.kind === OBJECT_KIND.MODEL ? target.id : null,
    unknownModelId: target.kind === OBJECT_KIND.UNKNOWN ? target.id : null,
    anonId,
    ...cleanLocation,
    photo: photo ?? null,
    source: "user_sighting",
    createdAt: now,
  };

  const aliases = aliasesOf(target.id, catalog, index);
  const [collectionHash, firstsHash] = await Promise.all([
    redis.hmget(GAME_KEYS.collection(event.id, anonId), ...aliases),
    redis.hmget(GAME_KEYS.firsts(event.id), ...aliases),
  ]);
  const alreadyCollected = Object.values(collectionHash ?? {}).some(Boolean);
  const alreadyFirst = Object.values(firstsHash ?? {}).some(Boolean);

  const tx = redis.multi();
  tx.hset(GAME_KEYS.sightings(event.id), { [sighting.id]: JSON.stringify(sighting) });
  tx.zadd(GAME_KEYS.sightingsByTime(event.id), { score: Date.parse(now), member: sighting.id });
  tx.lpush(GAME_KEYS.userSightings(event.id, anonId), sighting.id);
  tx.ltrim(GAME_KEYS.userSightings(event.id, anonId), 0, HISTORY_LIMIT - 1);
  tx.hincrby(GAME_KEYS.objectStats(event.id), target.id, 1);
  tx.hincrby(GAME_KEYS.counters(event.id), "sightings", 1);
  tx.hincrby(GAME_KEYS.areaActivity(event.id), areaCell(cleanLocation), 1);
  if (photo) tx.hincrby(GAME_KEYS.objectPhotos(event.id), target.id, 1);
  await tx.exec();

  // HSETNX: hai lượt báo gần như đồng thời của cùng người chỉ một lượt được tính "mới gặp".
  const isNewForUser = alreadyCollected
    ? false
    : (await redis.hsetnx(GAME_KEYS.collection(event.id, anonId), target.id, now)) === 1;
  const isFirstDiscovery = alreadyFirst
    ? false
    : (await redis.hsetnx(
        GAME_KEYS.firsts(event.id),
        target.id,
        JSON.stringify({ anonId, nickname: nickname ?? null, at: now, sightingId: sighting.id })
      )) === 1;

  return { sighting, object: target, isNewForUser, isFirstDiscovery };
}

export async function getSighting(event, sightingId) {
  if (typeof sightingId !== "string" || !sightingId.startsWith("s-")) return null;
  return parseJson(await redis.hget(GAME_KEYS.sightings(event.id), sightingId));
}

export async function attachPhotoToSighting(event, { anonId, sightingId, photo }) {
  const sighting = await getSighting(event, sightingId);
  if (!sighting || sighting.anonId !== anonId) throw new GameInputError("Không tìm thấy lượt báo này.");
  if (sighting.photo) throw new GameInputError("Lượt báo này đã có ảnh.");
  const updated = { ...sighting, photo };
  const tx = redis.multi();
  tx.hset(GAME_KEYS.sightings(event.id), { [sightingId]: JSON.stringify(updated) });
  tx.hincrby(GAME_KEYS.objectPhotos(event.id), sighting.objectId, 1);
  await tx.exec();
  return updated;
}

export async function flagSighting(event, { anonId, sightingId }) {
  if (!(await getSighting(event, sightingId))) return false;
  const locked = await redis.set(GAME_KEYS.flagLock(event.id, sightingId, anonId), "1", {
    nx: true,
    ex: 7 * 24 * 60 * 60,
  });
  if (locked !== "OK") return false;
  await redis.hincrby(GAME_KEYS.flags(event.id), sightingId, 1);
  return true;
}

async function readSightingsByIds(event, ids) {
  if (ids.length === 0) return [];
  const hash = await redis.hmget(GAME_KEYS.sightings(event.id), ...ids);
  return ids.map((id) => parseJson(hash?.[id])).filter(Boolean);
}

// ─────────────────────────────── Snapshot ───────────────────────────────

function publicFirsts(firsts, catalog) {
  // Gom first discovery về object đích, lấy lượt SỚM NHẤT trong các alias. Chỉ trả biệt danh —
  // không trả anonId ra public.
  const index = catalogIndex(catalog);
  const out = {};
  for (const [rawId, value] of Object.entries(firsts)) {
    const id = resolveObjectId(rawId, index);
    if (!out[id] || value.at < out[id].at) {
      out[id] = { nickname: value.nickname ?? null, at: value.at, anonIdHash: hashId(value.anonId) };
    }
  }
  return out;
}

// Client cần biết "người đầu tiên có phải mình không" mà không được thấy anonId của người khác.
export function hashId(anonId) {
  return anonId ? crypto.createHash("sha256").update(`cdp-game:${anonId}`).digest("hex").slice(0, 16) : null;
}

/** Dữ liệu công khai của một mùa — không chứa anonId hay lịch sử vị trí của ai. */
export async function getGameSnapshot(event) {
  const now = Date.now();
  const since = now - (event.recentWindowMinutes ?? 180) * 60 * 1000;

  const [storedObjects, recentIds, objectStats, photoCounts, firsts, flags, counters] =
    await Promise.all([
      redis.hgetall(GAME_KEYS.objects(event.id)),
      // REV để lấy MỚI NHẤT khi tối đông quá giới hạn — khi đó đảo thứ tự tham số max/min.
      redis.zrange(GAME_KEYS.sightingsByTime(event.id), "+inf", since, {
        byScore: true,
        rev: true,
        offset: 0,
        count: RECENT_FETCH_LIMIT,
      }),
      redis.hgetall(GAME_KEYS.objectStats(event.id)),
      redis.hgetall(GAME_KEYS.objectPhotos(event.id)),
      redis.hgetall(GAME_KEYS.firsts(event.id)),
      redis.hgetall(GAME_KEYS.flags(event.id)),
      redis.hgetall(GAME_KEYS.counters(event.id)),
    ]);

  const catalog = mergeCatalog(event.objects, parseHash(storedObjects), event.id);
  const index = catalogIndex(catalog);
  const recent = await readSightingsByIds(event, recentIds ?? []);
  const markers = buildMarkers(recent, index, flags ?? {});
  const stats = resolveObjectStats(objectStats ?? {}, catalog);
  const photos = resolveObjectStats(photoCounts ?? {}, catalog);

  return {
    generatedAt: new Date(now).toISOString(),
    phase: eventPhase(event, now),
    catalog: catalog.filter((object) => !object.hidden),
    objectStats: stats,
    markers,
    firsts: publicFirsts(parseHash(firsts), catalog),
    quests: generateQuests({
      catalog: catalog.filter((object) => !object.hidden),
      objectStats: stats,
      photoCounts: photos,
      markers,
      noun: event.copy.objectNoun,
    }),
    totalSightings: Number(counters?.sightings) || 0,
  };
}

/** Tóm tắt nhẹ cho khối game trên trang bài viết — 2 lệnh Redis. */
export async function getGameTeaser(event) {
  const [storedObjects, objectStats] = await Promise.all([
    redis.hgetall(GAME_KEYS.objects(event.id)),
    redis.hgetall(GAME_KEYS.objectStats(event.id)),
  ]);
  const catalog = mergeCatalog(event.objects, parseHash(storedObjects), event.id);
  return { catalog: catalog.filter((o) => !o.hidden), objectStats: resolveObjectStats(objectStats ?? {}, catalog) };
}

/** Dữ liệu RIÊNG của một người: bộ sưu tập + lịch sử báo. Chỉ trả cho đúng anonId đó. */
export async function getPlayerState(event, anonId) {
  if (!anonId) return { collection: {}, history: [], anonIdHash: null };
  const [collection, ids] = await Promise.all([
    redis.hgetall(GAME_KEYS.collection(event.id, anonId)),
    redis.lrange(GAME_KEYS.userSightings(event.id, anonId), 0, 49),
  ]);
  const sightings = await readSightingsByIds(event, ids ?? []);
  return {
    collection: collection ?? {},
    history: sightings.map((s) => ({
      id: s.id,
      objectId: s.objectId,
      createdAt: s.createdAt,
      photoStatus: s.photo ? s.photo.status ?? "pending" : null,
    })),
    anonIdHash: hashId(anonId),
  };
}

// ─────────────────────────────── Admin ───────────────────────────────

export async function adminReadEverything(event) {
  const [catalog, sightingsHash, objectStats, flags] = await Promise.all([
    readCatalog(event),
    redis.hgetall(GAME_KEYS.sightings(event.id)),
    redis.hgetall(GAME_KEYS.objectStats(event.id)),
    redis.hgetall(GAME_KEYS.flags(event.id)),
  ]);
  const sightings = Object.values(parseHash(sightingsHash)).sort((a, b) =>
    b.createdAt.localeCompare(a.createdAt)
  );
  return { catalog, sightings, objectStats: objectStats ?? {}, flags: flags ?? {} };
}

export async function adminUpsertObject(event, patch) {
  const catalog = await readCatalog(event);
  const existing = catalog.find((object) => object.id === patch.id);
  const now = new Date().toISOString();
  const object = normalizeObject(
    { ...(existing ?? { createdAt: now, source: "admin" }), ...patch, updatedAt: now },
    event.id
  );
  if (!object) throw new GameInputError("Dữ liệu mô hình không hợp lệ.");
  await writeObject(event, object);
  return object;
}

// Ghép object nguồn vào object đích (NOTE-04 §16). Không ghi lại sighting/bộ sưu tập nào —
// resolveObjectId() lo phần còn lại lúc đọc, nên ghép nhầm thì bỏ ghép là hoàn tác sạch.
export async function adminMatchObject(event, { sourceId, targetId }) {
  const catalog = await readCatalog(event);
  const index = catalogIndex(catalog);
  if (!index.has(sourceId) || !index.has(targetId) || sourceId === targetId) {
    throw new GameInputError("Chọn hai mô hình khác nhau.");
  }
  if (resolveObjectId(targetId, index) === sourceId) {
    throw new GameInputError("Không ghép vòng tròn được.");
  }
  return adminUpsertObject(event, { id: sourceId, matchedTo: targetId });
}

export async function adminDeleteSighting(event, sightingId) {
  const sighting = await getSighting(event, sightingId);
  if (!sighting) return false;
  const tx = redis.multi();
  tx.hdel(GAME_KEYS.sightings(event.id), sightingId);
  tx.zrem(GAME_KEYS.sightingsByTime(event.id), sightingId);
  tx.hincrby(GAME_KEYS.objectStats(event.id), sighting.objectId, -1);
  tx.hincrby(GAME_KEYS.counters(event.id), "sightings", -1);
  tx.hdel(GAME_KEYS.flags(event.id), sightingId);
  if (sighting.photo) tx.hincrby(GAME_KEYS.objectPhotos(event.id), sighting.objectId, -1);
  await tx.exec();
  return true;
}

export async function adminSetSightingPhotoStatus(event, { sightingId, status }) {
  const sighting = await getSighting(event, sightingId);
  if (!sighting?.photo) throw new GameInputError("Lượt báo này không có ảnh.");
  const updated = { ...sighting, photo: { ...sighting.photo, status } };
  await redis.hset(GAME_KEYS.sightings(event.id), { [sightingId]: JSON.stringify(updated) });
  return updated;
}
