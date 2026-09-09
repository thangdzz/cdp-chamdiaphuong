// Tên miền chính thức của CDP. Mọi link đem đi CHIA SẺ phải dựng từ đây, KHÔNG dùng
// `window.location.origin` — nếu người dùng đang mở web bằng địa chỉ cũ
// (web-five-xi-28.vercel.app, hoặc link deploy tạm của Vercel) thì origin sẽ là địa chỉ đó và
// link chia sẻ ra cũng mang địa chỉ cũ (lỗi anh gặp 2026-09-09).
//
// Cố ý hard-code thay vì đọc biến môi trường: giá trị này gần như không đổi, còn để ở biến
// môi trường thì mỗi lần thiếu cấu hình là link chia sẻ lại sai âm thầm, rất khó phát hiện.
export const SITE_URL = "https://chamdiaphuong.io.vn";

export function placeShareUrl(placeId) {
  return `${SITE_URL}/dia-diem/${placeId}`;
}

export function notebookShareUrl(slug) {
  return `${SITE_URL}/so/${slug}`;
}
