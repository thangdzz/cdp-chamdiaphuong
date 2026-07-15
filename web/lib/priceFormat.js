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

export function formatPriceText({ priceMin, priceMax, priceUnit }) {
  if (priceMin == null && priceMax == null) return null;

  const fmt = (n) => n.toLocaleString("vi-VN");
  const unitSuffix = priceUnit ? ` đ/${priceUnit}` : " đ";

  if (priceMin == null || priceMax == null || priceMin === priceMax) {
    return `${fmt(priceMin ?? priceMax)}${unitSuffix}`;
  }

  return `${fmt(priceMin)} – ${fmt(priceMax)}${unitSuffix}`;
}
