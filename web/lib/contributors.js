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

const CONTRIBUTORS_KEY = "contributors:all";
// Hash anonId → tên hiện tại (NOTE-08 §4). Chỗ cần hiện tên của người khác (first discovery…) tra
// đúng vài anonId bằng HMGET thay vì đọc cả mảng `contributors:all`. Hồ sơ cũ chưa có trong hash
// thì đọc mảng một lần rồi ghi bù (sửa lúc đọc, không migration).
const NAMES_KEY = "contributors:names";

// Tên mô hình trong các file mùa — tên ngẫu nhiên không được trùng (NOTE-08 §2). Tên admin sửa trong
// Redis không có ở đây; phía game trình duyệt tự tránh theo catalog đầy đủ.
function modelNames() {
  return listGameEvents().flatMap((event) => (event.objects ?? []).map((object) => object.name).filter(Boolean));
}
const LEGENDARY_THRESHOLD = TIER_THRESHOLDS[TIER_THRESHOLDS.length - 1];

async function getAll() {
  const data = await redis.get(CONTRIBUTORS_KEY);
  return data ?? [];
}

async function saveAll(list) {
  await redis.set(CONTRIBUTORS_KEY, list);
}

function generateRecoveryCode() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

// Không truyền tên, hoặc tên không hợp lệ → tự sinh tên vui (NOTE-08 §2) thay cho "Người ẩn danh".
export async function createContributor(nickname) {
  const list = await getAll();
  let recoveryCode = generateRecoveryCode();
  while (list.some((c) => c.recoveryCode === recoveryCode)) {
    recoveryCode = generateRecoveryCode();
  }
  const avoidNames = modelNames();
  const chosen = nickname ? validateDisplayName(nickname, { avoidNames }) : null;
  const profile = {
    anonId: `c-${crypto.randomUUID()}`,
    nickname: chosen?.ok ? chosen.name : generateDisplayName({ avoidNames }),
    recoveryCode,
    categoryId: null,
    points: 0,
    createdAt: new Date().toISOString(),
  };
  list.push(profile);
  await saveAll(list);
  await redis.hset(NAMES_KEY, { [profile.anonId]: profile.nickname });
  return profile;
}

/**
 * Đổi tên hiển thị (NOTE-08 §3). Lịch sử không mất vì mọi thứ gắn với anonId, không gắn với tên.
 * @returns {{ ok: true, profile } | { ok: false, error }}
 */
export async function renameContributor(anonId, nickname) {
  const checked = validateDisplayName(nickname, { avoidNames: modelNames() });
  if (!checked.ok) return checked;
  const list = await getAll();
  const idx = list.findIndex((c) => c.anonId === anonId);
  if (idx === -1) return { ok: false, error: "Không tìm thấy hồ sơ của bạn." };
  const current = list[idx];
  if (current.nickname === checked.name) return { ok: true, profile: current };
  list[idx] = {
    ...current,
    nickname: checked.name,
    nameChangedCount: (current.nameChangedCount ?? 0) + 1,
    nameChangedAt: new Date().toISOString(),
  };
  await saveAll(list);
  await redis.hset(NAMES_KEY, { [anonId]: checked.name });
  return { ok: true, profile: list[idx] };
}

/** Tên hiện tại của nhiều người một lúc: { anonId: tên }. Luôn có tên (hồ sơ cũ/không rõ → tên suy ra). */
export async function getDisplayNames(anonIds) {
  const ids = [...new Set(anonIds.filter(Boolean))];
  if (ids.length === 0) return {};
  const stored = await redis.hmget(NAMES_KEY, ...ids);
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
    await redis.hset(NAMES_KEY, backfill);
  }
  // Hồ sơ cũ lưu "Người ẩn danh" → đổi thành tên suy ra lúc trả về, không sửa dữ liệu gốc.
  for (const id of ids) names[id] = resolveDisplayName({ anonId: id, nickname: names[id] });
  return names;
}

export async function getContributor(anonId) {
  const list = await getAll();
  return list.find((c) => c.anonId === anonId) ?? null;
}

export async function recoverContributorByCode(code) {
  const list = await getAll();
  return list.find((c) => c.recoveryCode === code?.trim()) ?? null;
}

export async function setContributorCategory(anonId, categoryId) {
  const list = await getAll();
  const idx = list.findIndex((c) => c.anonId === anonId);
  if (idx === -1) return null;
  list[idx] = { ...list[idx], categoryId };
  await saveAll(list);
  return list[idx];
}

// Đã đạt bậc cao nhất (Huyền thoại) rồi mà vẫn góp ý thêm — giữ nguyên biểu tượng bậc 5,
// chỉ đếm dồn thêm "legendaryBonus" để hiện số nhỏ góc icon (xem BadgeIcon.js), thay vì cố
// tính ra 1 bậc 6 không tồn tại.
export async function addContributorPoints(anonId, delta) {
  const list = await getAll();
  const idx = list.findIndex((c) => c.anonId === anonId);
  if (idx === -1) return null;
  const current = list[idx];
  const wasAlreadyLegendary = (current.points ?? 0) >= LEGENDARY_THRESHOLD;
  list[idx] = {
    ...current,
    points: (current.points ?? 0) + delta,
    legendaryBonus: wasAlreadyLegendary
      ? (current.legendaryBonus ?? 0) + 1
      : (current.legendaryBonus ?? 0),
  };
  await saveAll(list);
  return list[idx];
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
