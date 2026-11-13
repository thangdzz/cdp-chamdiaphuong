// Tiêu đề Trang chủ (H1) do Admin sửa — giới hạn 60 ký tự (DESIGN §7, SPEC-A4 §3.3).
//
// MỘT nguồn đếm dùng chung cho ô nhập Admin (bộ đếm trên trình duyệt) và lượt lưu trên máy chủ, để hai nơi không
// bao giờ đếm khác nhau. Hàm thuần, không phụ thuộc máy chủ → dùng được ở client.
//
// Đếm theo KÝ TỰ sau khi chuẩn hóa NFC, không theo byte hay theo đơn vị UTF-16: chữ Việt gõ kiểu tổ hợp (NFD,
// “e” + dấu rời) không bị đếm gấp đôi. Khoảng trắng thừa và ký tự điều khiển bị bỏ giống hệt lúc lưu
// (lib/navigation.js), nên con số Admin thấy đúng là con số được lưu.
//
// Chỉ áp cho tiêu đề Trang chủ. Tiêu đề các trang khác giữ giới hạn 120 như cũ (NAVIGATION_LIMITS).

export const HOME_TITLE_MAX = 60;
export const HOME_TITLE_KEY = "explore";
export const HOME_TITLE_DEFAULT = "Hôm nay bạn muốn ghé đâu?";

/** Chuẩn hóa như lúc lưu: NFC, bỏ ký tự điều khiển, gộp khoảng trắng, cắt hai đầu. */
export function normalizeHomeTitle(value) {
  if (typeof value !== "string") return "";
  return value
    .normalize("NFC")
    .replace(/[\u0000-\u001F\u007F]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

/** Số ký tự (code point) của tiêu đề sau khi chuẩn hóa. */
export function countHomeTitle(value) {
  return [...normalizeHomeTitle(value)].length;
}

/**
 * Kiểm tiêu đề Trang chủ trước khi lưu.
 * @returns {{ ok: boolean, text: string, length: number, max: number, over: number, message: string | null }}
 */
export function validateHomeTitle(value) {
  const text = normalizeHomeTitle(value);
  const length = [...text].length;
  const over = Math.max(0, length - HOME_TITLE_MAX);
  let message = null;
  if (length === 0) message = "Tiêu đề trang chủ không được để trống.";
  else if (over > 0) message = `Quá ${over} ký tự — rút gọn để lưu được.`;
  return { ok: message === null, text, length, max: HOME_TITLE_MAX, over, message };
}

/** Câu báo lỗi khi máy chủ từ chối lưu (đường không có JS, hoặc ai đó gửi thẳng form). */
export function homeTitleServerError(length) {
  return `Tiêu đề trang chủ đang có ${length} ký tự, tối đa ${HOME_TITLE_MAX}. Cấu hình cũ chưa bị thay đổi.`;
}
