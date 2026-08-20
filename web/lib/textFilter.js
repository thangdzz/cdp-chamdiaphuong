// Lọc lớp 1 (NOTEBOOK-DESIGN.md §7): chặn link và số điện thoại trong ô gõ ngắn — chặn dạng
// phá hoại phổ biến nhất (quảng cáo trá hình gài số/link), không phải chửi bậy. Dùng chung
// cho ghi chú trong sổ (SPEC-chang-4.md §4.4) và ô gõ điều kiện của câu hỏi bấm chọn
// (SPEC-chang-2.md §2.4).

const PROTOCOL_PATTERN = /(https?:\/\/|www\.)/i;

// Bắt cả kiểu lách luật: chèn khoảng trắng/ngoặc/dấu * giữa tên miền và đuôi (VD
// "tinhte(.)vn", "tinhte . vn", "tinhte*vn") — phát hiện được nhờ 2026-08-20. Bắt buộc phải
// có ít nhất 1 ký tự đặc biệt (không chỉ khoảng trắng) mới tính là lách luật, tránh bắt nhầm
// câu bình thường kiểu "...rất OK me lắm...".
const DOMAIN_PATTERN = /[a-z0-9]{2,}\s*[.()[\]*_-]+\s*(com|vn|net|org|me|io)\b/i;

export function containsLinkOrPhone(text) {
  if (!text) return false;
  if (PROTOCOL_PATTERN.test(text) || DOMAIN_PATTERN.test(text)) return true;
  // Cụm số liên tiếp (cho phép cách/chấm/gạch ngang xen giữa) mà bỏ hết ký tự không phải số
  // vẫn còn >= 8 chữ số — đủ dài để là số điện thoại thật, không bắt nhầm số nhà/giờ giấc.
  const digitRuns = text.match(/\d[\d\s.-]{6,}\d/g) ?? [];
  return digitRuns.some((run) => run.replace(/\D/g, "").length >= 8);
}
