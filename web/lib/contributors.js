// Hồ sơ người góp ý ẩn danh — không có tài khoản/đăng nhập, chỉ định danh bằng 1 mã lưu
// trên trình duyệt (localStorage). "Mã khôi phục" cho phép người dùng lấy lại đúng hồ sơ
// (điểm, huy hiệu) ở máy/trình duyệt khác — xem docs/DECISIONS.md 2026-07-18.

import crypto from "crypto";
import { redis } from "./redis.js";

const CONTRIBUTORS_KEY = "contributors:all";

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

export async function addContributorPoints(anonId, delta) {
  const list = await getAll();
  const idx = list.findIndex((c) => c.anonId === anonId);
  if (idx === -1) return null;
  list[idx] = { ...list[idx], points: (list[idx].points ?? 0) + delta };
  await saveAll(list);
  return list[idx];
}

// Trả về vị trí của contributor trong bảng xếp hạng CÙNG lĩnh vực, kèm vài người ngay
// trên/dưới (không trả cả danh sách — tránh làm nản người mới, xem DECISIONS.md).
export async function getNearbyStanding(categoryId, anonId, window = 2) {
  if (!categoryId) return null;
  const list = await getAll();
  const inCategory = list
    .filter((c) => c.categoryId === categoryId)
    .sort((a, b) => b.points - a.points);
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
