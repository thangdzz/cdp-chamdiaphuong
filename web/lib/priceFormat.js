// Tách số + đơn vị từ 1 chuỗi giá tự do (vd "40.000 – 55.000 đ/bát") — dùng khi duyệt dữ
// liệu từ ingestion, để tránh lưu lại priceText tự do không đúng định dạng chuẩn.
// Best-effort: không chắc thì trả về null, không đoán bừa.
export function parsePriceRangeText(text) {
  if (!text) return null;

  const numberMatches = text.match(/\d[\d.]*\d|\d/g);
  if (!numberMatches || numberMatches.length === 0) return null;

  const numbers = numberMatches
    .map((m) => Number(m.replace(/\./g, "")))
    .filter((n) => Number.isFinite(n) && n > 0);
  if (numbers.length === 0) return null;

  const priceMin = Math.min(...numbers);
  const priceMax = Math.max(...numbers);

  const unitMatch = text.match(/đ\s*\/\s*([^\s,;]+)/i);
  const priceUnit = unitMatch ? unitMatch[1].trim() : null;

  return { priceMin, priceMax, priceUnit };
}

// Rút gọn số cho thẻ gấp (SPEC-giao-dien.md §6b mục 1) — 1.000 trở lên dùng "k", 1.000.000
// trở lên dùng "tr" (giữ tối đa 1 chữ số thập phân, dấu phẩy kiểu Việt Nam). Không dùng cho
// giá trị lưu trữ, chỉ dùng lúc hiển thị.
function compactNumber(n) {
  if (n >= 1_000_000) {
    const rounded = Math.round((n / 1_000_000) * 10) / 10;
    const digits = Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(1).replace(".", ",");
    return { digits, suffix: "tr" };
  }
  if (n >= 1000) return { digits: String(Math.round(n / 1000)), suffix: "k" };
  return { digits: String(n), suffix: "" };
}

// Bản rút gọn của formatPriceText cho thẻ gấp — trả về số rút gọn (`text-2xl`) tách riêng
// khỏi đơn vị (`text-xs`, xám) để 2 phần chênh cỡ chữ được. Đọc thẳng priceMin/priceMax/
// priceUnit, không parse lại priceText đã lưu (SPEC-giao-dien.md §6b mục 1: không sửa
// priceText, chỉ đổi cách hiển thị).
export function formatPriceCompact({ priceMin, priceMax, priceUnit }) {
  if (priceMin == null && priceMax == null) return null;

  const unitText = priceUnit ? `đ/${priceUnit}` : "đ";

  if (priceMin == null || priceMax == null || priceMin === priceMax) {
    const one = compactNumber(priceMin ?? priceMax);
    return { compact: `${one.digits}${one.suffix}`, unitText };
  }

  const min = compactNumber(priceMin);
  const max = compactNumber(priceMax);
  // Cùng đơn vị rút gọn (cùng "k" hoặc cùng "tr") thì chỉ ghi hậu tố 1 lần ở cuối, kiểu
  // "150–300k" thay vì "150k–300k" (ví dụ mẫu SPEC §6b).
  const minPart = min.suffix === max.suffix ? min.digits : `${min.digits}${min.suffix}`;
  return { compact: `${minPart}–${max.digits}${max.suffix}`, unitText };
}

export function formatPriceText({ priceMin, priceMax, priceUnit }) {
  if (priceMin == null && priceMax == null) return null;

  const fmt = (n) => n.toLocaleString("vi-VN");
  const unitSuffix = priceUnit ? ` đ/${priceUnit}` : " đ";

  if (priceMin == null || priceMax == null || priceMin === priceMax) {
    return `${fmt(priceMin ?? priceMax)}${unitSuffix}`;
  }

  return `${fmt(priceMin)} – ${fmt(priceMax)}${unitSuffix}`;
}
