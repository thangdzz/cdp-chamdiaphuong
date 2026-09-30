// Tách một ô "số điện thoại" thành TỪNG số gọi được (owner test 30/9).
//
// Dữ liệu thật có ô chứa nhiều số, vd "0393 083 596 - 0356 569 627". Trước đây trang tạo
// `tel:` từ nguyên chuỗi, iPhone bỏ hết dấu và gọi 03930835960356569627 — một số không tồn tại.
// Từ nay mọi link gọi đi qua đây: mỗi số một `tel:` riêng, KHÔNG bao giờ nối nhiều số vào nhau.
//
// Kiểu ngăn cách đã thấy trong dữ liệu (quét places:live 30/9, 127 số): " - " và " / " (có ô 3 số).
// Kiểu viết trong một số: dấu cách, dấu chấm ("0207.3.898.898"), "+84 38 932 1995", số ngắn
// tổng đài ("1055", "1900 2088"). Đỡ thêm "," ";" "|" xuống dòng và "hoặc" dù chưa gặp.

// Số điện thoại Việt Nam dài nhất: 11 chữ số (máy bàn 02xx xxx xxxx) hoặc +84 + 10 chữ số.
const MAX_DIGITS_ONE_NUMBER = 12;
const MIN_DIGITS = 3;

const SEPARATORS = /[\/,;|\n]|\s[-–—]\s|\s+(?:hoặc|or)\s+/i;

function digitsOf(text) {
  return text.replace(/\D/g, "");
}

// Phần còn quá dài sau khi tách theo dấu ngăn (vd "0393083596 0356569627" hoặc "0393083596-0356569627"):
// gom từng cụm chữ số lại, đủ độ dài một số thì cắt.
function splitRunOn(part) {
  const tokens = part.split(/[\s\-–—]+/).filter(Boolean);
  const numbers = [];
  let current = [];
  for (const token of tokens) {
    current.push(token);
    const digits = digitsOf(current.join(""));
    const target = digits.startsWith("84") ? 11 : digits.startsWith("02") ? 11 : 10;
    if (digits.length >= target) {
      numbers.push(current.join(" "));
      current = [];
    }
  }
  if (current.length > 0) numbers.push(current.join(" "));
  return numbers;
}

/**
 * @param {string | null | undefined} raw giá trị ô SĐT như đang lưu
 * @returns {{ display: string, tel: string }[]} `display` giữ cách viết dễ đọc; `tel` chỉ gồm chữ số
 *   (giữ dấu "+" đầu nếu có) để đặt sau `tel:`.
 */
export function splitPhoneNumbers(raw) {
  if (!raw) return [];
  const parts = String(raw)
    .split(SEPARATORS)
    .map((p) => p.trim())
    .filter(Boolean)
    .flatMap((p) => (digitsOf(p).length > MAX_DIGITS_ONE_NUMBER ? splitRunOn(p) : [p]));

  const seen = new Set();
  const numbers = [];
  for (const part of parts) {
    const digits = digitsOf(part);
    if (digits.length < MIN_DIGITS) continue;
    const tel = (part.startsWith("+") ? "+" : "") + digits;
    if (seen.has(tel)) continue;
    seen.add(tel);
    numbers.push({ display: part.replace(/\s+/g, " "), tel });
  }
  return numbers;
}

/** `tel:` cho MỘT số đã tách — không nhận nguyên chuỗi ô SĐT. */
export function telHref(number) {
  return `tel:${number.tel}`;
}
