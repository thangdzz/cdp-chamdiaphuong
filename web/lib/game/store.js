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
import { areaCell, distanceMeters, isWithinBounds } from "./geo.js";
import { HIDE_AFTER_FLAGS, buildMarkers, buildTonightStats } from "./mapLayer.js";
import {
  ACCURACY_WARN_M,
  BURST_PER_RISK_KEY,
  MANY_IDS_PER_IP,
  MANY_IDS_PER_RISK_KEY,
  REPEAT_SAME_MODEL,
  plausibleJumpMeters,
} from "./risk.js";
import { generateQuests } from "./quests.js";
import { resolveObjectStats } from "./progress.js";
import { computeRarity } from "./collections.js";
import { EVENT_PHASE, eventGameLiveAt, eventPhase, getGameEvent, withRuntimeConfig } from "./registry.js";
import { getDisplayNames } from "../contributors.js";
import { resolveDisplayName } from "../displayName.js";

const RECENT_FETCH_LIMIT = 600;
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
  // Cấu hình chạy admin đổi được không cần deploy (hiện có: gameLiveAt) — NOTE-05 §21.
  config: (e) => key(e, "config"),
  sightings: (e) => key(e, "sightings"),
  sightingsByTime: (e) => key(e, "sightings:by-time"),
  objectStats: (e) => key(e, "object-stats"),
  objectPhotos: (e) => key(e, "object-photos"),
  // Số lượt theo NGÀY giờ VN — nguồn cho "mô hình được nhìn thấy nhiều nhất" từng đêm.
  objectStatsDay: (e, day) => key(e, `object-stats:day:${day}`),
  // HyperLogLog: ước lượng số NGƯỜI khác nhau đã thấy một object, 12KB/object, không lưu ai.
  objectSeers: (e, objectId) => key(e, `object-seers:${objectId}`),
  firsts: (e) => key(e, "firsts"),
  flags: (e) => key(e, "flags"),
  counters: (e) => key(e, "counters"),
  areaActivity: (e) => key(e, "area-activity"),
  collection: (e, anonId) => key(e, `collection:${anonId}`),
  // Số lần MỘT người gặp từng object (collection chỉ tính 1, số lần gặp giữ riêng — NOTE-05 §9).
  collectionCounts: (e, anonId) => key(e, `collection-counts:${anonId}`),
  userSightings: (e, anonId) => key(e, `user-sightings:${anonId}`),
  cooldown: (e, anonId, objectId) => key(e, `cooldown:${anonId}:${objectId}`),
  rate: (e, anonId, bucket) => key(e, `rate:${anonId}:${bucket}`),
  flagLock: (e, sightingId, anonId) => key(e, `flag-lock:${sightingId}:${anonId}`),
  // Chống nhảy vị trí: lần đo gần nhất của một người (TTL 1 giờ) — rẻ hơn đọc lại lịch sử.
  lastFix: (e, anonId) => key(e, `last-fix:${anonId}`),
  // Dấu vết rủi ro (lib/game/risk.js). Gom theo NGÀY giờ VN rồi tự hết hạn.
  riskIds: (e, riskKey, day) => key(e, `risk-ids:${riskKey}:${day}`),
  riskIdsIp: (e, ipHash, day) => key(e, `risk-ids-ip:${ipHash}:${day}`),
  riskRate: (e, riskKey, bucket) => key(e, `risk-rate:${riskKey}:${bucket}`),
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

export class GameInputError extends Error {
  // `code` cho client phân biệt ca cần xử lý riêng (VD "pre_game" → hiện câu đùa, không báo lỗi).
  constructor(message, code = null) {
    super(message);
    this.code = code;
  }
}

const VN_DAY = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Ho_Chi_Minh" });

// "2026-09-20" theo giờ Việt Nam — một đêm hội qua 0h UTC vẫn tính cùng một ngày.
export function vnDayKey(iso) {
  return VN_DAY.format(new Date(iso));
}

// ───────────────────────────── Event runtime config ─────────────────────────────

export async function readEventRuntimeConfig(event) {
  const config = (await redis.hgetall(GAME_KEYS.config(event.id))) ?? {};
  const gameLiveAt = typeof config.gameLiveAt === "string" && Number.isFinite(Date.parse(config.gameLiveAt))
    ? config.gameLiveAt
    : null;
  return gameLiveAt ? { gameLiveAt } : {};
}

// ───────────────────── Bộ nhớ đệm dùng chung cho lượt ĐỌC công khai ─────────────────────
// PLAN-dem-18-9-redis §5 B1: Upstash tính TỪNG lệnh. Snapshot ~11 lệnh, mỗi người chơi tự làm mới
// định kỳ → số lệnh tăng theo số người đang mở game. Giữ kết quả 20 giây trong bộ nhớ máy chủ: bao
// nhiêu người hỏi trong 20 giây cũng chỉ đọc Redis một lần (mỗi máy chủ Vercel). Luồng GHI (báo,
// admin) không dùng bộ đệm — người vừa báo vẫn nhận snapshot mới từ reportSighting.
const SHARED_READ_TTL_MS = 20 * 1000;
const sharedReads = new Map();

function sharedRead(cacheKey, load) {
  const now = Date.now();
  const hit = sharedReads.get(cacheKey);
  if (hit && now - hit.at < SHARED_READ_TTL_MS) return hit.promise;
  const promise = load();
  sharedReads.set(cacheKey, { at: now, promise });
  // Lỗi thì bỏ khỏi bộ đệm ngay — lượt sau đọc lại, không giữ lỗi 20 giây.
  promise.catch(() => {
    if (sharedReads.get(cacheKey)?.promise === promise) sharedReads.delete(cacheKey);
  });
  return promise;
}

/** Như loadGameEvent nhưng dùng chung 20 giây — cho trang/ action chỉ ĐỌC. Admin đổi giờ mở game
 *  thì trang khách nhận giờ mới chậm tối đa 20 giây. */
export function loadGameEventShared(slug) {
  const event = getGameEvent(slug);
  if (!event) return Promise.resolve(null);
  return sharedRead(`event:${GAME_KEYS.config(event.id)}`, () => loadGameEvent(slug));
}

/** Snapshot công khai dùng chung 20 giây (B1). */
export function getSharedGameSnapshot(event) {
  return sharedRead(`snapshot:${GAME_KEYS.objects(event.id)}:${eventGameLiveAt(event)}`, () => getGameSnapshot(event));
}

/** Event + cấu hình chạy từ Redis. Mọi chỗ cần pha game (pre-game/live) đi qua đây. */
export async function loadGameEvent(slug) {
  const event = getGameEvent(slug);
  if (!event) return null;
  try {
    return withRuntimeConfig(event, await readEventRuntimeConfig(event));
  } catch {
    return event; // Redis lỗi: dùng giờ mở game trong file mùa
  }
}

export async function adminSetGameLiveAt(event, iso) {
  if (iso === null) {
    await redis.hdel(GAME_KEYS.config(event.id), "gameLiveAt");
    return;
  }
  if (!Number.isFinite(Date.parse(iso))) throw new GameInputError("Giờ mở game không hợp lệ.");
  await redis.hset(GAME_KEYS.config(event.id), { gameLiveAt: iso });
}

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

async function createUnknownObject(event, guessedName = null) {
  const code = unknownCode();
  const now = new Date().toISOString();
  const object = normalizeObject(
    {
      id: `unk-${code.toLowerCase()}-${crypto.randomUUID().slice(0, 6)}`,
      kind: OBJECT_KIND.UNKNOWN,
      code,
      guessedName,
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

// Giờ đo cũ hơn ngần này thì không nhận: bắt buộc mỗi lượt báo là MỘT phép đo mới tại chỗ,
// không phải toạ độ nhặt lại của lần trước (chốt 2026-09-16).
const MAX_FIX_AGE_MS = 5 * 60 * 1000;

/**
 * Lượt báo chỉ hợp lệ khi có đủ: toạ độ trong vùng · nguồn rõ ràng · GIỜ ĐO mới · và sai số nếu
 * là GPS. Thiếu bất cứ thứ nào là từ chối — thà mất một lượt báo còn hơn có một chấm sai trên
 * bản đồ mà không ai biết nó sai.
 */
function sanitizeLocation(event, input) {
  const lat = Number(input.lat);
  const lng = Number(input.lng);
  if (!isWithinBounds({ lat, lng }, event.map?.bounds)) {
    throw new GameInputError("Vị trí nằm ngoài khu vực lễ hội. Kéo bản đồ về đúng chỗ bạn thấy.");
  }

  // "manual" = người chơi tự ghim vì máy không lấy được GPS. Chỉ hai nguồn này tồn tại; toạ độ
  // lấy sẵn từ marker của người khác đã bị bỏ hẳn ở phía giao diện.
  const locationSource = input.locationSource === "manual" ? "manual" : "gps";

  const accuracy = Number(input.accuracy);
  const hasAccuracy = Number.isFinite(accuracy) && accuracy > 0;
  if (locationSource === "gps" && !hasAccuracy) {
    throw new GameInputError("Chưa đo được vị trí. Bấm “Định vị lại” rồi thử lại nhé.", "need_fix");
  }

  // Máy chỉ gửi TUỔI của bản đo (mili giây), không gửi giờ theo đồng hồ của nó — máy để sai giờ
  // là chuyện thường, mà sai giờ thì không được phép làm hỏng lượt báo. Giờ đo do SERVER quy ra.
  const age = Number(input.measuredAgeMs);
  if (!Number.isFinite(age) || age < 0) {
    throw new GameInputError("Chưa đo được vị trí. Bấm “Định vị lại” rồi thử lại nhé.", "need_fix");
  }
  if (age > MAX_FIX_AGE_MS) {
    throw new GameInputError("Vị trí đo đã lâu rồi. Bấm “Định vị lại” để đo lại nhé.", "stale_fix");
  }
  const measuredAt = Date.now() - age;

  return {
    lat,
    lng,
    accuracy: hasAccuracy ? Math.min(Math.round(accuracy), 5000) : null,
    locationSource,
    measuredAt: new Date(measuredAt).toISOString(),
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

// Cùng một người, hai lượt cách nhau dưới ngần này thì vị trí phải đi được bằng chân.
const JUMP_WINDOW_MS = 60 * 1000;

/**
 * Từ chối lượt báo mà vị trí nhảy xa vô lý so với lần đo trước của CHÍNH người đó (chốt
 * 2026-09-16: không ghi rồi giấu — đã ghi là tin được). Lần đo trước lưu riêng, TTL 1 giờ.
 */
async function rejectImpossibleJump(event, anonId, fix) {
  const previous = parseJson(await redis.get(GAME_KEYS.lastFix(event.id, anonId)));
  if (!previous) return;
  const gap = Date.parse(fix.measuredAt) - Date.parse(previous.measuredAt ?? "");
  if (!Number.isFinite(gap) || gap < 0 || gap > JUMP_WINDOW_MS) return;
  const moved = distanceMeters(previous, fix);
  if (moved > plausibleJumpMeters(gap / 1000, previous.accuracy, fix.accuracy)) {
    throw new GameInputError(
      "Vị trí vừa đo nhảy quá xa so với lượt báo trước. Bấm “Định vị lại” rồi thử lại nhé.",
      "jump"
    );
  }
}

/**
 * Dấu vết rủi ro của lượt báo này (lib/game/risk.js §"giai đoạn 1"). CHỈ gắn cờ để chủ dự án xem,
 * không chặn ai — anonId đổi theo trình duyệt nên mọi tín hiệu ở đây đều là phỏng đoán.
 * @returns string[] mã cờ
 */
async function collectRiskFlags(event, { anonId, riskKey, ipHash, fix, objectId, day }) {
  const flags = [];
  if (fix.locationSource === "manual") flags.push("manual_location");
  if (fix.accuracy && fix.accuracy > ACCURACY_WARN_M) flags.push("low_accuracy");
  if (!riskKey) return flags;

  const idsKey = GAME_KEYS.riskIds(event.id, riskKey, day);
  const ipKey = ipHash ? GAME_KEYS.riskIdsIp(event.id, ipHash, day) : null;
  const rateKey = GAME_KEYS.riskRate(event.id, riskKey, Math.floor(Date.now() / (RATE_WINDOW_SECONDS * 1000)));

  // PHẢI đi theo thứ tự trong một lượt gửi: chạy song song thì lệnh đếm có thể về TRƯỚC lệnh thêm,
  // đếm thiếu mất chính danh tính vừa thêm (test bắt được 2026-09-16). Gộp một lượt cũng đỡ lệnh Redis.
  const tx = redis.multi();
  tx.sadd(idsKey, anonId);
  tx.scard(idsKey);
  tx.expire(idsKey, 36 * 3600); // hết ngày thì tự dọn, không để rác
  tx.incr(rateKey);
  tx.expire(rateKey, RATE_WINDOW_SECONDS * 2);
  tx.hget(GAME_KEYS.collectionCounts(event.id, anonId), objectId);
  if (ipKey) {
    tx.sadd(ipKey, anonId);
    tx.scard(ipKey);
    tx.expire(ipKey, 36 * 3600);
  }
  const res = await tx.exec();
  const [, ids, , bursts, , seenSameModel, , ipIds] = res;

  if (Number(ids) > MANY_IDS_PER_RISK_KEY) flags.push("many_ids");
  if (Number(ipIds) > MANY_IDS_PER_IP) flags.push("many_ids_ip");
  if (Number(bursts) > BURST_PER_RISK_KEY) flags.push("burst");
  if (Number(seenSameModel) + 1 > REPEAT_SAME_MODEL) flags.push("repeat_model");
  return flags;
}

/**
 * Ghi một lượt "vừa thấy" (NOTE-04 §8, §18). Ảnh KHÔNG xử lý ở đây — action upload trước rồi
 * truyền `photo` vào, để lỗi ảnh không bao giờ làm mất lượt báo.
 * `risk` = dấu vết phía server (riskContext trong lib/game/risk.js); thiếu cũng vẫn ghi được.
 */
export async function recordSighting(event, { anonId, nickname, objectId, location, photo, risk, guessedName }) {
  const phase = eventPhase(event);
  // Chặn ở server dù UI pre-game không gọi tới đây: trước giờ rước không được có sighting thật
  // (NOTE-05 §1, §3) — không collection, marker, số đếm hay first discovery.
  if (phase === EVENT_PHASE.PRE_GAME) {
    throw new GameInputError("Chưa tới giờ rước đèn, lượt báo chưa được ghi nhận.", "pre_game");
  }
  if (phase !== EVENT_PHASE.LIVE) {
    throw new GameInputError("Mùa săn này chưa mở hoặc đã khép lại.");
  }
  if (!anonId) throw new GameInputError("Thiếu hồ sơ người chơi.");
  const cleanLocation = sanitizeLocation(event, location ?? {});
  // Chặn TRƯỚC mọi bước ghi: nhảy vị trí vô lý thì không tạo gì cả.
  await rejectImpossibleJump(event, anonId, cleanLocation);

  let catalog = await readCatalog(event);
  let index = catalogIndex(catalog);
  let target;
  if (objectId === "unknown") {
    // Tên tạm: người chơi gõ tên mà tìm không ra thì được đặt tạm cho con bí ẩn này.
    const guess = typeof guessedName === "string" ? guessedName.trim().slice(0, 80) : "";
    // Đặt tên tạm thì BẮT BUỘC có ảnh (chốt 2026-09-17) — không có ảnh thì sau này không ai xác minh
    // được cái tên đó, chỉ tổ đẻ ra một đống tên không kiểm chứng nổi. Báo "không biết tên" trơn thì
    // vẫn gửi được không cần ảnh, để ai bị chặn camera vẫn chơi được.
    if (guess && !photo) {
      throw new GameInputError(
        "Đặt tên tạm thì cần một tấm ảnh để sau còn xác minh. Chụp giúp một kiểu nhé.",
        "need_photo"
      );
    }
    await enforceRateLimit(event, anonId);
    target = await createUnknownObject(event, guess || null);
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
  const riskFlags = await collectRiskFlags(event, {
    anonId,
    riskKey: risk?.riskKey ?? null,
    ipHash: risk?.ipHash ?? null,
    fix: cleanLocation,
    objectId: target.id,
    day: vnDayKey(now),
  });
  const sighting = {
    id: `s-${crypto.randomUUID()}`,
    eventId: event.id,
    objectId: target.id,
    // Giữ đúng hai trường NOTE-04 §16 để đối chiếu dữ liệu về sau.
    modelId: target.kind === OBJECT_KIND.MODEL ? target.id : null,
    unknownModelId: target.kind === OBJECT_KIND.UNKNOWN ? target.id : null,
    anonId,
    ...cleanLocation,
    // Dấu vết rủi ro — KHÔNG có IP thô, KHÔNG có chuỗi trình duyệt thô (lib/game/risk.js).
    device: risk?.device ?? null,
    ipHash: risk?.ipHash ?? null,
    uaHash: risk?.uaHash ?? null,
    riskKey: risk?.riskKey ?? null,
    riskFlags,
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
  tx.hincrby(GAME_KEYS.collectionCounts(event.id, anonId), target.id, 1);
  tx.ltrim(GAME_KEYS.userSightings(event.id, anonId), 0, HISTORY_LIMIT - 1);
  tx.hincrby(GAME_KEYS.objectStats(event.id), target.id, 1);
  tx.hincrby(GAME_KEYS.objectStatsDay(event.id, vnDayKey(now)), target.id, 1);
  tx.pfadd(GAME_KEYS.objectSeers(event.id, target.id), anonId);
  tx.hincrby(GAME_KEYS.counters(event.id), "sightings", 1);
  tx.hincrby(GAME_KEYS.areaActivity(event.id), areaCell(cleanLocation), 1);
  if (photo) tx.hincrby(GAME_KEYS.objectPhotos(event.id), target.id, 1);
  // Mốc để so cho lượt kế tiếp (rejectImpossibleJump). Chỉ giữ 1 giờ.
  tx.set(
    GAME_KEYS.lastFix(event.id, anonId),
    JSON.stringify({
      lat: cleanLocation.lat,
      lng: cleanLocation.lng,
      accuracy: cleanLocation.accuracy,
      measuredAt: cleanLocation.measuredAt,
    }),
    { ex: 3600 }
  );
  await tx.exec();

  // HSETNX: hai lượt báo gần như đồng thời của cùng người chỉ một lượt được tính "mới gặp".
  const isNewForUser = alreadyCollected
    ? false
    : (await redis.hsetnx(GAME_KEYS.collection(event.id, anonId), target.id, now)) === 1;
  // Ghim tay KHÔNG giành được danh hiệu "người đầu tiên" (chốt 2026-09-17).
  //
  // Vẫn ghi nhận lượt báo, vẫn lên bản đồ, vẫn tính vào bộ sưu tập — chỉ không cướp được danh hiệu.
  // Lý do: ghim tay là LỜI KHAI, không phải phép đo; ngồi nhà vẫn ghim được vào Quảng trường, mà
  // kiểm tra nhảy vị trí vô lý lại không áp dụng được cho nó (không có sai số để so). Danh hiệu là
  // thứ đáng gian lận nhất, nên chỉ trao cho lượt có phép đo thật.
  const measuredHere = cleanLocation.locationSource === "gps";
  const isFirstDiscovery = alreadyFirst || !measuredHere
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

function publicFirsts(firsts, catalog, names = {}) {
  // Gom first discovery về object đích, lấy lượt SỚM NHẤT trong các alias. Chỉ trả tên hiển thị —
  // không trả anonId ra public. Tên là tên HIỆN TẠI (NOTE-08 §3: đổi tên thì chỗ này đổi theo);
  // `value.nickname` lưu lúc báo chỉ còn là dự phòng khi tra tên lỗi.
  const index = catalogIndex(catalog);
  const out = {};
  for (const [rawId, value] of Object.entries(firsts)) {
    const id = resolveObjectId(rawId, index);
    if (!out[id] || value.at < out[id].at) {
      const nickname = names[value.anonId] ?? resolveDisplayName({ anonId: value.anonId, nickname: value.nickname });
      out[id] = { nickname, at: value.at, anonIdHash: hashId(value.anonId) };
    }
  }
  return out;
}

// Client cần biết "người đầu tiên có phải mình không" mà không được thấy anonId của người khác.
export function hashId(anonId) {
  return anonId ? crypto.createHash("sha256").update(`cdp-game:${anonId}`).digest("hex").slice(0, 16) : null;
}

/** Dữ liệu công khai của một mùa — không chứa anonId hay lịch sử vị trí của ai. */
// Nửa đêm giờ VN của ngày chứa `time` — "tối nay" cho thống kê/độ hiếm là cả ngày giờ VN.
function vnDayStart(time) {
  return Date.parse(`${vnDayKey(new Date(time).toISOString())}T00:00:00+07:00`);
}

/** Dữ liệu công khai của một mùa — không chứa anonId hay lịch sử vị trí của ai. */
export async function getGameSnapshot(event) {
  const now = Date.now();
  const windowStart = now - (event.recentWindowMinutes ?? 180) * 60 * 1000;
  // Lấy từ đầu ngày (hoặc đầu cửa sổ nếu cửa sổ lùi qua nửa đêm): marker chỉ dùng phần trong
  // cửa sổ, còn thống kê cuối đêm (số khu vực) dùng cả ngày. Cùng số lệnh Redis như trước.
  const since = Math.min(windowStart, vnDayStart(now));

  const [storedObjects, recentIds, objectStats, dayStats, photoCounts, firsts, flags, counters] =
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
      redis.hgetall(GAME_KEYS.objectStatsDay(event.id, vnDayKey(new Date(now).toISOString()))),
      redis.hgetall(GAME_KEYS.objectPhotos(event.id)),
      redis.hgetall(GAME_KEYS.firsts(event.id)),
      redis.hgetall(GAME_KEYS.flags(event.id)),
      redis.hgetall(GAME_KEYS.counters(event.id)),
    ]);

  const catalog = mergeCatalog(event.objects, parseHash(storedObjects), event.id);
  const index = catalogIndex(catalog);
  const firstsHash = parseHash(firsts);
  const [todays, firstNames] = await Promise.all([
    readSightingsByIds(event, recentIds ?? []),
    getDisplayNames(Object.values(firstsHash).map((value) => value.anonId)).catch(() => ({})),
  ]);
  const recent = todays.filter((s) => Date.parse(s.createdAt) >= windowStart);
  const markers = buildMarkers(recent, index, flags ?? {});
  const tonight = buildTonightStats(recent, index, flags ?? {});
  const stats = resolveObjectStats(objectStats ?? {}, catalog);
  const photos = resolveObjectStats(photoCounts ?? {}, catalog);
  const night = buildNightStats(todays, dayStats ?? {}, catalog, index, flags ?? {});
  const visibleCatalog = catalog.filter((object) => !object.hidden);

  return {
    generatedAt: new Date(now).toISOString(),
    phase: eventPhase(event, now),
    gameLiveAt: eventGameLiveAt(event),
    catalog: visibleCatalog,
    objectStats: stats,
    markers,
    tonight,
    night,
    rarity: computeRarity(visibleCatalog, Object.fromEntries(Object.entries(night).map(([id, n]) => [id, n.reports]))),
    firsts: publicFirsts(firstsHash, catalog, firstNames),
    quests: generateQuests({
      catalog: visibleCatalog,
      objectStats: stats,
      photoCounts: photos,
      markers,
      noun: event.copy.objectNoun,
    }),
    totalSightings: Number(counters?.sightings) || 0,
  };
}

// Theo đêm (ngày giờ VN): số lượt lấy từ hash đếm theo ngày (chính xác kể cả khi đông), số khu vực
// ~110m khác nhau đếm từ các sighting đọc được trong ngày (bỏ lượt bị báo sai quá ngưỡng).
function buildNightStats(todays, dayStats, catalog, index, flags) {
  const reports = resolveObjectStats(dayStats, catalog);
  const areas = new Map();
  for (const sighting of todays) {
    if ((Number(flags[sighting.id]) || 0) >= HIDE_AFTER_FLAGS) continue;
    const objectId = resolveObjectId(sighting.objectId, index);
    const cells = areas.get(objectId) ?? new Set();
    cells.add(areaCell(sighting));
    areas.set(objectId, cells);
  }
  const night = {};
  for (const [objectId, count] of Object.entries(reports)) {
    if (count > 0 && index.has(objectId) && !index.get(objectId).hidden) {
      night[objectId] = { reports: count, areas: areas.get(objectId)?.size ?? 0 };
    }
  }
  return night;
}

/**
 * Số lượt được nhìn thấy theo object — cả mùa hoặc một ngày (`day: "2026-09-20"`), kèm số người
 * khác nhau (ước lượng) cho các object được hỏi. Chưa có UI; dùng với progress.rankMostSeen().
 */
export async function readObjectSightingStats(event, { day = null, peopleFor = [] } = {}) {
  const [objectStats, people] = await Promise.all([
    redis.hgetall(day ? GAME_KEYS.objectStatsDay(event.id, day) : GAME_KEYS.objectStats(event.id)),
    Promise.all(peopleFor.map((id) => redis.pfcount(GAME_KEYS.objectSeers(event.id, id)))),
  ]);
  return {
    objectStats: objectStats ?? {},
    people: Object.fromEntries(peopleFor.map((id, i) => [id, Number(people[i]) || 0])),
  };
}

/**
 * Tóm tắt nhẹ cho khối game trên trang bài viết — 2 lệnh Redis; `tonight: true` đọc thêm số lượt báo
 * trong ngày giờ VN (thẻ game trang chủ NOTE-08 §1: "Y lượt nhìn thấy tối nay") — 3 lệnh.
 */
export async function getGameTeaser(event, { tonight = false } = {}) {
  const [storedObjects, objectStats, dayStats] = await Promise.all([
    redis.hgetall(GAME_KEYS.objects(event.id)),
    redis.hgetall(GAME_KEYS.objectStats(event.id)),
    tonight ? redis.hgetall(GAME_KEYS.objectStatsDay(event.id, vnDayKey(new Date().toISOString()))) : null,
  ]);
  const catalog = mergeCatalog(event.objects, parseHash(storedObjects), event.id);
  return {
    catalog: catalog.filter((o) => !o.hidden),
    objectStats: resolveObjectStats(objectStats ?? {}, catalog),
    tonightStats: tonight ? resolveObjectStats(dayStats ?? {}, catalog) : {},
  };
}

/** Teaser kèm số tối nay, dùng chung 20 giây — trang chủ là trang đông nhất (PLAN-dem-18-9 §5 B1). */
export function getSharedGameTeaser(event) {
  return sharedRead(`teaser:${GAME_KEYS.objects(event.id)}`, () => getGameTeaser(event, { tonight: true }));
}

/** Dữ liệu RIÊNG của một người: bộ sưu tập + lịch sử báo. Chỉ trả cho đúng anonId đó. */
export async function getPlayerState(event, anonId) {
  if (!anonId) return { collection: {}, counts: {}, history: [], anonIdHash: null, displayName: null };
  const [collection, counts, ids, names] = await Promise.all([
    redis.hgetall(GAME_KEYS.collection(event.id, anonId)),
    redis.hgetall(GAME_KEYS.collectionCounts(event.id, anonId)),
    redis.lrange(GAME_KEYS.userSightings(event.id, anonId), 0, 49),
    // Tên hiện tại theo server (NOTE-08 §4) — máy khác đổi tên hoặc hồ sơ cũ "Người ẩn danh" thì
    // trình duyệt cập nhật theo.
    getDisplayNames([anonId]).catch(() => ({})),
  ]);
  const sightings = await readSightingsByIds(event, ids ?? []);
  return {
    collection: collection ?? {},
    counts: counts ?? {},
    history: sightings.map((s) => ({
      id: s.id,
      objectId: s.objectId,
      createdAt: s.createdAt,
      photoStatus: s.photo ? s.photo.status ?? "pending" : null,
    })),
    anonIdHash: hashId(anonId),
    displayName: names[anonId] ?? null,
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
  tx.hincrby(GAME_KEYS.objectStatsDay(event.id, vnDayKey(sighting.createdAt)), sighting.objectId, -1);
  // HyperLogLog không gỡ được một người — số người khác nhau có thể dư 1 sau khi xoá, chấp nhận.
  tx.hincrby(GAME_KEYS.counters(event.id), "sightings", -1);
  tx.hincrby(GAME_KEYS.collectionCounts(event.id, sighting.anonId), sighting.objectId, -1);
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
