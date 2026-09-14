import "server-only";

import { redis } from "./redis.js";

const NAVIGATION_KEY = "site_config:navigation";

export const NAVIGATION_LIMITS = {
  navLabel: 48,
  pageTitle: 120,
};

// NOTE-10 §6: key và route là cấu hình hệ thống, không phải nội dung. Admin chỉ được sửa
// chữ hiển thị, trạng thái và thứ tự; dữ liệu Redis không bao giờ được quyền đổi href.
export const NAVIGATION_DEFINITIONS = [
  {
    key: "explore",
    href: "/",
    navLabel: "Khám phá",
    pageTitle: "Khám phá Tuyên Quang",
    enabled: true,
    order: 1,
  },
  {
    key: "notes",
    href: "/ghi-chu",
    navLabel: "Ghi chú của tôi",
    pageTitle: "Ghi chú của tôi",
    enabled: true,
    order: 2,
  },
  {
    key: "notebooks",
    href: "/so",
    navLabel: "Sổ của tôi",
    pageTitle: "Sổ của tôi",
    enabled: true,
    order: 3,
  },
  {
    key: "routes",
    href: "/lo-trinh",
    navLabel: "Lộ trình của tôi",
    pageTitle: "Lộ trình của tôi",
    enabled: true,
    order: 4,
  },
  {
    key: "about",
    href: "/gioi-thieu",
    navLabel: "CDP là gì?",
    pageTitle: "Chạm Địa Phương là gì?",
    enabled: true,
    order: 5,
  },
];
// Lưu ý khi thêm key: normalizeNavigation() bắt đúng số mục, nên bản Admin đã lưu với số mục cũ
// sẽ bị bỏ và rơi về mặc định. Lúc thêm "routes" (2026-09-14) production chưa lưu bản nào.

export function navigationKey() {
  const namespace = process.env.CDP_SITE_CONTENT_NAMESPACE?.trim();
  return namespace ? `${namespace}:${NAVIGATION_KEY}` : NAVIGATION_KEY;
}

function defaultNavigation() {
  return NAVIGATION_DEFINITIONS.map((item) => ({ ...item }));
}

function cleanText(value, maxLength) {
  if (typeof value !== "string") return null;
  const text = value
    .replace(/[\u0000-\u001F\u007F]/g, "")
    .replace(/\s+/g, " ")
    .trim();
  if (!text || text.length > maxLength) return null;
  return text;
}

export function normalizeNavigation(value) {
  if (!Array.isArray(value) || value.length !== NAVIGATION_DEFINITIONS.length) return null;

  const storedByKey = new Map(value.map((item) => [item?.key, item]));
  if (storedByKey.size !== NAVIGATION_DEFINITIONS.length) return null;

  const normalized = NAVIGATION_DEFINITIONS.map((definition) => {
    const stored = storedByKey.get(definition.key);
    const navLabel = cleanText(stored?.navLabel, NAVIGATION_LIMITS.navLabel);
    const pageTitle = cleanText(stored?.pageTitle, NAVIGATION_LIMITS.pageTitle);
    const order = Number(stored?.order);

    if (
      !navLabel ||
      !pageTitle ||
      typeof stored?.enabled !== "boolean" ||
      !Number.isInteger(order) ||
      order < 1 ||
      order > NAVIGATION_DEFINITIONS.length
    ) {
      return null;
    }

    return {
      ...definition,
      navLabel,
      pageTitle,
      enabled: stored.enabled,
      order,
    };
  });

  if (normalized.some((item) => !item)) return null;
  if (new Set(normalized.map((item) => item.order)).size !== normalized.length) return null;

  return normalized.sort((a, b) => a.order - b.order);
}

function formText(formData, name) {
  return formData.get(name)?.toString() ?? "";
}

export function navigationFromFormData(formData) {
  const candidate = NAVIGATION_DEFINITIONS.map((definition) => ({
    key: definition.key,
    // Không đọc href từ FormData: route luôn lấy lại từ NAVIGATION_DEFINITIONS.
    navLabel: formText(formData, `navLabel_${definition.key}`),
    pageTitle: formText(formData, `pageTitle_${definition.key}`),
    enabled: formData.get(`enabled_${definition.key}`) === "on",
    order: Number(formText(formData, `order_${definition.key}`)),
  }));

  return normalizeNavigation(candidate);
}

export async function getNavigationConfig() {
  try {
    return normalizeNavigation(await redis.get(navigationKey())) ?? defaultNavigation();
  } catch {
    // Navigation là đường đi chính: Redis tạm lỗi vẫn phải mở được site bằng bản trong code.
    return defaultNavigation();
  }
}

export async function setNavigationConfig(value) {
  const normalized = normalizeNavigation(value);
  if (!normalized) throw new Error("Cấu hình menu không hợp lệ.");
  await redis.set(navigationKey(), normalized);
  return normalized;
}
