import { containsLinkOrPhone } from "./textFilter.js";

// Lớp 2 (SPEC-chang-5.md §3) — rác rõ ràng, loại thẳng không vào hàng chờ. Danh sách khởi
// điểm, mở rộng dần khi gặp thực tế (không cần hoàn hảo — lớp 3 (AI) + lớp 4 (admin) vẫn
// còn phía sau để bắt phần lọt lưới).
const BAD_WORDS = ["đm", "dm", "vcl", "vl", "clm", "đcm", "fuck", "shit", "porn", "sex"];

function hasRepeatedChars(text) {
  return /(.)\1{3,}/.test(text); // 1 ký tự lặp từ 4 lần liền trở lên, VD "aaaa"
}

// Chuỗi gõ bậy kiểu bàn phím (asdfgh, qwerty...) — 1 dãy dài toàn phụ âm, không có nguyên âm.
function looksLikeGibberish(text) {
  const stripped = text.replace(/[^a-zA-Zà-ỹ]/gi, "");
  if (stripped.length < 6) return false;
  return /[bcdfghjklmnpqrstvwxyzđ]{6,}/i.test(stripped);
}

function isAllUppercase(text) {
  const letters = text.replace(/[^a-zA-ZÀ-Ỹ]/g, "");
  return letters.length >= 8 && letters === letters.toUpperCase() && letters !== letters.toLowerCase();
}

function containsBadWord(text) {
  const lower = text.toLowerCase();
  return BAD_WORDS.some((w) => new RegExp(`\\b${w}\\b`, "i").test(lower));
}

// Lớp 1 + 2 gộp chung (SPEC-chang-5.md §3) — trả về chuỗi lỗi nếu bị chặn, null nếu qua
// được. Cả 2 lớp đều chặn ngay tại đây, không vào hàng chờ.
export function checkNoteText(text, maxLength) {
  const trimmed = (text ?? "").trim();
  if (!trimmed) return "Chưa gõ gì cả.";
  if (trimmed.length > maxLength) return `Ghi chú tối đa ${maxLength} ký tự.`;
  if (/[\r\n]/.test(trimmed)) return "Ghi chú chỉ được viết 1 dòng.";
  if (containsLinkOrPhone(trimmed)) return "Ghi chú không được chứa link hay số điện thoại.";
  if (hasRepeatedChars(trimmed) || looksLikeGibberish(trimmed) || isAllUppercase(trimmed) || containsBadWord(trimmed)) {
    return "Ghi chú chưa phù hợp, thử viết lại.";
  }
  return null;
}
