import "server-only";

import { redis } from "./redis.js";
import { createSharedRead } from "./sharedRead.js";
import { HOME_TITLE_DEFAULT, HOME_TITLE_KEY, normalizeHomeTitle, validateHomeTitle } from "./homeTitle.js";

const NAVIGATION_KEY = "site_config:navigation";

// Giới hạn khi ĐỌC bản đã lưu. Riêng tiêu đề Trang chủ, khi LƯU còn 60 ký tự (lib/homeTitle.js, A4); đọc vẫn nhận tới
// 120 để bản lưu cũ dài hơn (nếu có) vẫn hiện đủ, không làm hỏng trang và không tự sửa dữ liệu.
export const NAVIGATION_LIMITS = {
  navLabel: 48,
  pageTitle: 120,
};

// NOTE-10 §6: key và route là cấu hình hệ thống, không phải nội dung. Admin chỉ được sửa
// chữ hiển thị, trạng thái và thứ tự; dữ liệu Redis không bao giờ được quyền đổi href.
export const NAVIGATION_DEFINITIONS = [
  // 4 mục lõi (thanh đáy mobile + nhóm trên của sidebar), thứ tự cố định theo DESIGN §6. Nhãn ngắn để vừa ô
  // 80px của thanh đáy ở 320px (PM Q1 PLAN A2, 12/11). H1 Trang chủ đổi theo DESIGN §7 ở A4 (13/11).
  {
    key: HOME_TITLE_KEY,
    href: "/",
    navLabel: "Trang chủ",
    pageTitle: HOME_TITLE_DEFAULT,
    enabled: true,
    order: 1,
  },
  {
    key: "search",
    href: "/tim",
    navLabel: "Tìm chỗ",
    pageTitle: "Tìm chỗ",
    enabled: true,
    order: 2,
  },
  {
    key: "notebooks",
    href: "/so",
    navLabel: "Sổ",
    pageTitle: "Sổ của tôi",
    enabled: true,
    order: 3,
  },
  {
    key: "routes",
    href: "/lo-trinh",
    navLabel: "Lộ trình",
    pageTitle: "Lộ trình của tôi",
    enabled: true,
    order: 4,
  },
  // Mục phụ: nằm trong Menu (mobile) và nhóm dưới của sidebar. Ô "thứ tự" của Admin chỉ xếp nhóm này.
  {
    key: "notes",
    href: "/ghi-chu",
    navLabel: "Ghi chú của tôi",
    pageTitle: "Ghi chú của tôi",
    enabled: true,
    order: 5,
  },
  {
    key: "about",
    href: "/gioi-thieu",
    navLabel: "CDP là gì?",
    pageTitle: "Chạm Địa Phương là gì?",
    enabled: true,
    order: 6,
  },
];
// Lưu ý khi thêm key: normalizeNavigation() bắt đúng số mục, nên bản Admin đã lưu với số mục cũ
// sẽ bị bỏ và rơi về mặc định. Lúc thêm "routes" (2026-09-14) và "search" (2026-11-12, A2) production chưa
// lưu bản nào (12/11 đã quét toàn bộ khóa bằng token chỉ đọc: không có khóa site_config:navigation nào).
// Nhóm lõi/phụ và quy tắc hiện thanh đáy: lib/shellRoutes.js (dùng được ở client).

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
  const candidate = NAVIGATION_DEFINITIONS.map((definition) => {
    const pageTitle = formText(formData, `pageTitle_${definition.key}`);
    return {
      key: definition.key,
      // Không đọc href từ FormData: route luôn lấy lại từ NAVIGATION_DEFINITIONS.
      navLabel: formText(formData, `navLabel_${definition.key}`),
      // Tiêu đề Trang chủ lưu dạng NFC (A4) để đếm và hiển thị nhất quán.
      pageTitle: definition.key === HOME_TITLE_KEY ? normalizeHomeTitle(pageTitle) : pageTitle,
      enabled: formData.get(`enabled_${definition.key}`) === "on",
      order: Number(formText(formData, `order_${definition.key}`)),
    };
  });

  const navigation = normalizeNavigation(candidate);
  if (navigation && !homeTitleSavable(navigation)) return null;
  return navigation;
}

// Giới hạn 60 chỉ chặn lúc LƯU (A4). Bản đã lưu trước đó dài hơn vẫn đọc được qua normalizeNavigation.
function homeTitleSavable(navigation) {
  const home = navigation.find((item) => item.key === HOME_TITLE_KEY);
  return validateHomeTitle(home?.pageTitle).ok;
}

// Menu nằm trong Root Layout nên MỌI lượt mở trang của cả web đều đọc nó. Đo ngày 16/9 (bắn 10.000
// lượt): 8.791/8.817 lệnh Redis là đúng lệnh này. Menu cả tháng mới đổi một lần nên đệm 60 giây —
// admin lưu xong thấy ngay trên máy chủ vừa lưu, máy chủ khác chậm nhất 60 giây.
const NAVIGATION_TTL_MS = 60 * 1000;
const readShared = createSharedRead(NAVIGATION_TTL_MS);

export async function getNavigationConfig() {
  try {
    const key = navigationKey();
    return normalizeNavigation(await readShared(key, () => redis.get(key))) ?? defaultNavigation();
  } catch {
    // Navigation là đường đi chính: Redis tạm lỗi vẫn phải mở được site bằng bản trong code.
    return defaultNavigation();
  }
}

export async function setNavigationConfig(value) {
  const normalized = normalizeNavigation(value);
  if (!normalized || !homeTitleSavable(normalized)) throw new Error("Cấu hình menu không hợp lệ.");
  await redis.set(navigationKey(), normalized);
  readShared.forget(navigationKey());
  return normalized;
}
