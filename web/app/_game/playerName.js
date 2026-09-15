"use client";

import { useSyncExternalStore } from "react";
import { loadLocalContributor, saveLocalContributor } from "@/app/ContributionPanel";
import { generateDisplayName, resolveDisplayName } from "@/lib/displayName";

// Tên hiển thị của người chơi trên máy này (NOTE-08 §2, §10). Chưa có hồ sơ ẩn danh thì giữ một
// TÊN NHÁP trong localStorage: vào game là có tên ngay mà không ghi gì lên server — hồ sơ vẫn chỉ tạo
// ở lần báo đầu tiên (NOTE-04 §21) và mang theo đúng tên nháp này.
const DRAFT_KEY = "cdp_display_name_draft";
const listeners = new Set();

function notify() {
  listeners.forEach((listener) => listener());
}

function subscribe(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function readDraftName() {
  try {
    return window.localStorage.getItem(DRAFT_KEY);
  } catch {
    return null;
  }
}

export function saveDraftName(name) {
  try {
    window.localStorage.setItem(DRAFT_KEY, name);
  } catch {
    // Chế độ riêng tư chặn localStorage: tên chỉ sống tới khi đóng tab.
  }
  notify();
}

export function clearDraftName() {
  try {
    window.localStorage.removeItem(DRAFT_KEY);
  } catch {
    // bỏ qua
  }
  notify();
}

/** Tên đang dùng: tên trong hồ sơ nếu đã có hồ sơ, không thì tên nháp. `null` khi chưa có gì. */
export function readPlayerName() {
  const local = loadLocalContributor();
  if (local?.anonId) return resolveDisplayName(local);
  return readDraftName();
}

/** Lần đầu vào game: gán tên nháp ngẫu nhiên, tránh tên mô hình trong catalog đang chạy. */
export function ensureDraftName(avoidNames) {
  if (readPlayerName()) return;
  saveDraftName(generateDisplayName({ avoidNames }));
}

/** Server báo tên khác (đổi ở máy khác, hoặc vừa đổi xong) → cập nhật hồ sơ trên máy này. */
export function saveLocalNickname(name) {
  const local = loadLocalContributor();
  if (!local?.anonId || !name || resolveDisplayName(local) === name) return;
  saveLocalContributor({ ...local, nickname: name });
  notify();
}

export function usePlayerName() {
  return useSyncExternalStore(subscribe, readPlayerName, () => null);
}
