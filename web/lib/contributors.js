// Hồ sơ người góp ý ẩn danh — không có tài khoản/đăng nhập, chỉ định danh bằng 1 mã lưu
// trên trình duyệt (localStorage). "Mã khôi phục" cho phép người dùng lấy lại đúng hồ sơ
// (điểm, huy hiệu) ở máy/trình duyệt khác — xem docs/DECISIONS.md 2026-07-18.

import crypto from "crypto";
import { redis } from "./redis.js";
import { TIER_THRESHOLDS } from "./badges.js";
import {
  generateDisplayName,
  resolveDisplayName,
  validateDisplayName,
} from "./displayName.js";
import { listGameEvents } from "./game/registry.js";

// Namespace test: mọi khoá hồ sơ đi qua đây. Trước 17/9/2026 khoá hồ sơ KHÔNG có namespace, nên
// chạy thử ở máy cá nhân là ghi thẳng vào hồ sơ thật (tự vấp khi audit). Mặc định rơi về
// CDP_GAME_NAMESPACE để mọi thiết lập test sẵn có được cách ly luôn, không phải khai thêm biến.
function contributorKey(suffix) {
  const namespace = (process.env.CDP_CONTRIBUTORS_NAMESPACE ?? process.env.CDP_GAME_NAMESPACE)?.trim();
  return namespace ? `${namespace}:contributors:${suffix}` : `contributors:${suffix}`;
}
const CONTRIBUTORS_KEY = () => contributorKey("all");
// Hash anonId → hồ sơ. ĐÂY là chỗ ghi của mọi hồ sơ mới từ 17/9/2026. Mảng `contributors:all` cũ
// vẫn được ĐỌC (hồ sơ trước đó) nhưng không bao giờ bị ghi đè nữa — không cần migration.
const BY_ID_KEY = () => contributorKey("by-id");
// Hash mã khôi phục → anonId. Giữ mã không trùng bằng HSETNX (nguyên tử), thay cho việc dò cả mảng.
const CODES_KEY = () => contributorKey("codes");
// Hash anonId → tên hiện tại (NOTE-08 §4). Chỗ cần hiện tên của người khác (first discovery…) tra
// đúng vài anonId bằng HMGET thay vì đọc cả mảng. Hồ sơ cũ chưa có trong hash thì đọc bù một lần.
const NAMES_KEY = () => contributorKey("names");

// Tên mô hình trong các file mùa — tên ngẫu nhiên không được trùng (NOTE-08 §2). Tên admin sửa trong
// Redis không có ở đây; phía game trình duyệt tự tránh theo catalog đầy đủ.
function modelNames() {
  return listGameEvents().flatMap((event) => (event.objects ?? []).map((object) => object.name).filter(Boolean));
}
const LEGENDARY_THRESHOLD = TIER_THRESHOLDS[TIER_THRESHOLDS.length - 1];

function parseProfile(value) {
  if (value && typeof value === "object") return value;
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}

/**
 * Toàn bộ hồ sơ: mảng cũ + hash mới, hash thắng khi trùng anonId.
 * CHỈ dùng cho bảng xếp hạng / admin — đường nóng (mỗi lượt báo đèn) phải dùng getContributor.
 */
async function getAll() {
  const [legacy, byId] = await Promise.all([redis.get(CONTRIBUTORS_KEY()), redis.hgetall(BY_ID_KEY())]);
  const merged = new Map();
  for (const profile of legacy ?? []) if (profile?.anonId) merged.set(profile.anonId, profile);
  for (const value of Object.values(byId ?? {})) {
    const profile = parseProfile(value);
    if (profile?.anonId) merged.set(profile.anonId, profile);
  }
  return [...merged.values()];
}

/** Ghi MỘT hồ sơ — một lệnh, không đụng hồ sơ của ai khác. */
async function saveProfile(profile) {
  await redis.hset(BY_ID_KEY(), { [profile.anonId]: JSON.stringify(profile) });
  return profile;
}

// Ghi một ô hồ sơ CHỈ KHI ô đó chưa ai đổi từ lúc mình đọc. Cộng điểm và đổi tên có thể tới cùng
// lúc từ hai luồng khác nhau (trả lời câu hỏi, điểm danh…) — không có bước này thì cái sau xoá cái trước.
const FIELD_CAS_SCRIPT = `
local cur = redis.call('HGET', KEYS[1], ARGV[1])
if cur == false then cur = '' end
if cur ~= ARGV[3] then return -1 end
redis.call('HSET', KEYS[1], ARGV[1], ARGV[2])
return 1
`;

/**
 * Sửa một hồ sơ đã có. Hồ sơ còn nằm ở mảng cũ thì bản sửa được ghi sang hash và từ đó hash thắng.
 *
 * Vì sao không còn "đọc cả mảng → ghi đè cả mảng": đo ngày 17/9/2026, 40 người đăng ký cùng lúc
 * thì **chỉ 1 hồ sơ sống sót, mất 39** — người ghi sau xoá mất người ghi trước, kể cả hồ sơ cũ.
 * Thử cách ghi-kiểm-phiên-bản thì hết mất dữ liệu nhưng 60 người cùng lúc là phần lớn bị "đang
 * bận". Mỗi hồ sơ một ô riêng thì đăng ký là MỘT lệnh, không ai phải chờ ai.
 */
async function updateProfile(anonId, change, attempts = 5) {
  for (let i = 0; i < attempts; i++) {
    const raw = await redis.hget(BY_ID_KEY(), anonId);
    let current = parseProfile(raw);
    if (!current) {
      // Hồ sơ tạo trước 17/9/2026 còn nằm ở mảng cũ: bản sửa được ghi sang hash, từ đó hash thắng.
      const legacy = await redis.get(CONTRIBUTORS_KEY());
      current = (legacy ?? []).find((c) => c.anonId === anonId) ?? null;
      if (!current) return null;
    }
    const next = change(current);
    if (!next) return current;
    const written = await redis.eval(
      FIELD_CAS_SCRIPT,
      [BY_ID_KEY()],
      [anonId, JSON.stringify(next), typeof raw === "string" ? raw : raw == null ? "" : JSON.stringify(raw)]
    );
    if (written === 1) return next;
    // Có thay đổi khác vừa vào hồ sơ NÀY: đọc lại rồi làm lại, không đè mất thay đổi đó.
  }
  throw new Error("Hồ sơ đang bận, thử lại sau.");
}

function generateRecoveryCode() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

// Không truyền tên, hoặc tên không hợp lệ → tự sinh tên vui (NOTE-08 §2) thay cho "Người ẩn danh".
export async function createContributor(nickname) {
  const avoidNames = modelNames();
  const chosen = nickname ? validateDisplayName(nickname, { avoidNames }) : null;
  const anonId = `c-${crypto.randomUUID()}`;

  // Mã khôi phục chỉ 6 chữ số: với hàng nghìn người một đêm thì trùng là chuyện SẼ xảy ra. HSETNX
  // giành mã một cách nguyên tử — ai giành được thì giữ, người sau bốc mã khác.
  let recoveryCode = null;
  for (let i = 0; i < 12 && !recoveryCode; i++) {
    const candidate = generateRecoveryCode();
    if (await redis.hsetnx(CODES_KEY(), candidate, anonId)) recoveryCode = candidate;
  }

  const profile = {
    anonId,
    nickname: chosen?.ok ? chosen.name : generateDisplayName({ avoidNames }),
    // Hết cách bốc mã không trùng (cực hiếm) thì vẫn cho chơi, chỉ là không khôi phục được máy khác.
    recoveryCode,
    categoryId: null,
    points: 0,
    createdAt: new Date().toISOString(),
  };
  await saveProfile(profile);
  await redis.hset(NAMES_KEY(), { [profile.anonId]: profile.nickname });
  return profile;
}

/**
 * Đổi tên hiển thị (NOTE-08 §3). Lịch sử không mất vì mọi thứ gắn với anonId, không gắn với tên.
 * @returns {{ ok: true, profile } | { ok: false, error }}
 */
export async function renameContributor(anonId, nickname) {
  const checked = validateDisplayName(nickname, { avoidNames: modelNames() });
  if (!checked.ok) return checked;
  const profile = await updateProfile(anonId, (current) => {
    if (current.nickname === checked.name) return null; // không đổi gì thì khỏi ghi
    return {
      ...current,
      nickname: checked.name,
      nameChangedCount: (current.nameChangedCount ?? 0) + 1,
      nameChangedAt: new Date().toISOString(),
    };
  });
  if (!profile) return { ok: false, error: "Không tìm thấy hồ sơ của bạn." };
  await redis.hset(NAMES_KEY(), { [anonId]: checked.name });
  return { ok: true, profile };
}

/** Tên hiện tại của nhiều người một lúc: { anonId: tên }. Luôn có tên (hồ sơ cũ/không rõ → tên suy ra). */
export async function getDisplayNames(anonIds) {
  const ids = [...new Set(anonIds.filter(Boolean))];
  if (ids.length === 0) return {};
  const stored = await redis.hmget(NAMES_KEY(), ...ids);
  const names = {};
  const missing = [];
  for (const id of ids) {
    if (stored?.[id]) names[id] = stored[id];
    else missing.push(id);
  }
  if (missing.length > 0) {
    const list = await getAll();
    const backfill = {};
    for (const id of missing) {
      const profile = list.find((c) => c.anonId === id);
      // Ghi bù cả khi không tìm thấy hồ sơ (tên suy ra) — lần sau khỏi đọc lại cả mảng.
      names[id] = resolveDisplayName({ anonId: id, nickname: profile?.nickname });
      backfill[id] = profile?.nickname || names[id];
    }
    await redis.hset(NAMES_KEY(), backfill);
  }
  // Hồ sơ cũ lưu "Người ẩn danh" → đổi thành tên suy ra lúc trả về, không sửa dữ liệu gốc.
  for (const id of ids) names[id] = resolveDisplayName({ anonId: id, nickname: names[id] });
  return names;
}

/** Đường NÓNG (mỗi lượt báo đèn gọi một lần): một lệnh HGET, không kéo cả danh sách về. */
export async function getContributor(anonId) {
  if (!anonId) return null;
  const stored = parseProfile(await redis.hget(BY_ID_KEY(), anonId));
  if (stored) return stored;
  // Hồ sơ tạo trước 17/9/2026 còn nằm trong mảng cũ.
  const legacy = await redis.get(CONTRIBUTORS_KEY());
  return (legacy ?? []).find((c) => c.anonId === anonId) ?? null;
}

export async function recoverContributorByCode(code) {
  const clean = code?.trim();
  if (!clean) return null;
  const anonId = await redis.hget(CODES_KEY(), clean);
  if (anonId) return getContributor(String(anonId));
  const legacy = await redis.get(CONTRIBUTORS_KEY());
  return (legacy ?? []).find((c) => c.recoveryCode === clean) ?? null;
}

export async function setContributorCategory(anonId, categoryId) {
  return updateProfile(anonId, (current) => ({ ...current, categoryId }));
}

// Đã đạt bậc cao nhất (Huyền thoại) rồi mà vẫn góp ý thêm — giữ nguyên biểu tượng bậc 5,
// chỉ đếm dồn thêm "legendaryBonus" để hiện số nhỏ góc icon (xem BadgeIcon.js), thay vì cố
// tính ra 1 bậc 6 không tồn tại.
export async function addContributorPoints(anonId, delta) {
  return updateProfile(anonId, (current) => {
    const wasAlreadyLegendary = (current.points ?? 0) >= LEGENDARY_THRESHOLD;
    return {
      ...current,
      points: (current.points ?? 0) + delta,
      legendaryBonus: wasAlreadyLegendary
        ? (current.legendaryBonus ?? 0) + 1
        : (current.legendaryBonus ?? 0),
    };
  });
}

// TẠM THỜI (2026-07-18): khi chưa đủ người dùng thật trong 1 lĩnh vực, chèn thêm vài "hạt
// giống" ẩn danh để bảng "gần bạn" không trống trơn — người góp ý đầu tiên đỡ cảm giác cô
// đơn. Không lưu vào Redis, chỉ chèn lúc tính toán hiển thị. XOÁ đoạn này khi 1 lĩnh vực đã
// có đủ người dùng thật (đề xuất mốc: từ 5 người thật trở lên) — xem DECISIONS.md.
const SEED_ENTRIES = [
  { anonId: "seed-1", nickname: "Người góp ý ẩn danh", points: 12 },
  { anonId: "seed-2", nickname: "Bạn đồng hành phố Tuyên", points: 4 },
];
const SEED_THRESHOLD = 3;

// Trả về vị trí của contributor trong bảng xếp hạng CÙNG lĩnh vực, kèm vài người ngay
// trên/dưới (không trả cả danh sách — tránh làm nản người mới, xem DECISIONS.md).
export async function getNearbyStanding(categoryId, anonId, window = 2) {
  if (!categoryId) return null;
  const list = await getAll();
  let inCategory = list
    .filter((c) => c.categoryId === categoryId)
    .sort((a, b) => b.points - a.points);

  if (inCategory.length < SEED_THRESHOLD) {
    inCategory = [...inCategory, ...SEED_ENTRIES].sort((a, b) => b.points - a.points);
  }

  const idx = inCategory.findIndex((c) => c.anonId === anonId);
  if (idx === -1) return { rank: null, total: inCategory.length, nearby: [] };
  const start = Math.max(0, idx - window);
  const end = Math.min(inCategory.length, idx + window + 1);
  return {
    rank: idx + 1,
    total: inCategory.length,
    nearby: inCategory.slice(start, end).map((c) => ({
      anonId: c.anonId,
      nickname: c.nickname,
      points: c.points,
      isYou: c.anonId === anonId,
    })),
  };
}
