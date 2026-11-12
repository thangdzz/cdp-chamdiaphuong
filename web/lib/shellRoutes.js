// Quy tắc của khung trang (A2): trang nào có thanh điều hướng đáy, mục nào đang mở, mục nào thuộc nhóm lõi.
// Hàm thuần, không đọc DOM/Redis — dùng chung cho header, thanh đáy, sidebar và có test riêng
// (tests/shellRoutes.test.js). Bước sau (A6–A8) thêm thanh hành động cho màn nào thì sửa ở đây.

// 4 mục lõi, thứ tự cố định (DESIGN §6): thanh đáy mobile + nhóm trên của sidebar desktop.
// Ô "thứ tự" trong Admin không đổi thứ tự nhóm này, chỉ xếp các mục phụ.
export const CORE_NAVIGATION_KEYS = ["explore", "search", "notebooks", "routes"];

// Trang đã có thanh bám đáy riêng → ẩn thanh điều hướng để không bao giờ chồng 2 thanh.
//   /dia-diem/[id]                 thanh "Lưu vào Sổ + Chỉ đường" (PlaceDetail)
//   /so/[slug]/sua, /lo-trinh/[slug]/sua   thanh "Lưu thay đổi" (SaveChanges)
// Sổ chi tiết, Lộ trình chi tiết, Lộ trình chia sẻ VẪN có thanh đáy cho tới khi A7/A8 làm thanh hành động
// (PM Q2 PLAN A2, 12/11).
const ROUTES_WITH_OWN_BOTTOM_BAR = [/^\/dia-diem\/[^/]+\/?$/, /^\/so\/[^/]+\/sua\/?$/, /^\/lo-trinh\/[^/]+\/sua\/?$/];

export function showsBottomNav(pathname) {
  if (typeof pathname !== "string" || !pathname.startsWith("/")) return true;
  if (pathname === "/admin" || pathname.startsWith("/admin/")) return false;
  return !ROUTES_WITH_OWN_BOTTOM_BAR.some((pattern) => pattern.test(pathname));
}

// Mục đang mở: Trang chủ chỉ khi đúng "/"; mục khác sáng ở chính nó và mọi trang con
// (/so/abc → Sổ, /lo-trinh/xem/token → Lộ trình). "/sổ-tay" không được tính là con của "/so".
export function isNavItemActive(href, pathname) {
  if (typeof href !== "string" || typeof pathname !== "string") return false;
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

// Tách cấu hình điều hướng (đã lọc mục Admin tắt) thành nhóm lõi (thứ tự cố định) và nhóm phụ (thứ tự Admin).
export function splitNavigation(navigation) {
  const enabled = (navigation ?? []).filter((item) => item?.enabled);
  const byKey = new Map(enabled.map((item) => [item.key, item]));
  const core = CORE_NAVIGATION_KEYS.map((key) => byKey.get(key)).filter(Boolean);
  const secondary = enabled.filter((item) => !CORE_NAVIGATION_KEYS.includes(item.key));
  return { core, secondary };
}

// Lễ hội (lưu trữ): liên kết cố định của Menu và sidebar (DESIGN §6), không nằm trong cấu hình Admin.
export const FESTIVAL_ARCHIVE_LINK = {
  key: "festival",
  href: "/le-hoi-thanh-tuyen",
  navLabel: "Lễ hội (lưu trữ)",
};

// Mục phụ hiện trong Menu mobile và nhóm dưới của sidebar: mục phụ của cấu hình (thứ tự Admin) + Lễ hội.
// “Góp một chỗ mới” chưa có ở A2 (PM Q4 — INBOX §9).
export function secondaryNavigation(navigation) {
  return [...splitNavigation(navigation).secondary, FESTIVAL_ARCHIVE_LINK];
}
