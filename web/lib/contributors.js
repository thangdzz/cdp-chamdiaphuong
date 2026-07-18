// Hồ sơ người góp ý ẩn danh — không có tài khoản/đăng nhập, chỉ định danh bằng 1 mã lưu
// trên trình duyệt (localStorage). "Mã khôi phục" cho phép người dùng lấy lại đúng hồ sơ
// (điểm, huy hiệu) ở máy/trình duyệt khác — xem docs/DECISIONS.md 2026-07-18.

import crypto from "crypto";
import { redis } from "./redis.js";
import { TIER_THRESHOLDS } from "./badges.js";

const CONTRIBUTORS_KEY = "contributors:all";
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

export async function createContributor(nickname) {
  const list = await getAll();
  let recoveryCode = generateRecoveryCode();
  while (list.some((c) => c.recoveryCode === recoveryCode)) {
    recoveryCode = generateRecoveryCode();
  }
  const profile = {
    anonId: `c-${crypto.randomUUID()}`,
    nickname: nickname?.trim() || "Người ẩn danh",
    recoveryCode,
    categoryId: null,
    points: 0,
    createdAt: new Date().toISOString(),
  };
  list.push(profile);
  await saveAll(list);
  return profile;
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
