// Toạ độ địa điểm (NOTE-14 §5–§7). Một chỗ duy nhất quy định: toạ độ hợp lệ là gì, đọc từ link
// Google Maps thế nào, và lấy toạ độ của một place ra sao.
//
// Dạng lưu: `coordinates: { lat, lng, source }` — cùng tên field mà đề xuất của khách
// (lib/proposals.js) và hồ sơ đóng cửa (lib/closedPlaces.js) đã dùng. KHÔNG tạo object
// `location{}` như NOTE-14 §6 gợi ý: địa chỉ/phường đã có field riêng, gói lại lần nữa là hai
// nguồn cùng nói một thứ (DECISIONS 2026-09-16).
//
// Không bắt ai gõ toạ độ tay (NOTE-14 §6): toạ độ đến từ nguồn nhập hoặc từ link Google Maps.

// Khung Việt Nam nới rộng một chút. Toạ độ ngoài khung gần như chắc chắn là nhập nhầm thứ tự
// (lng,lat) hoặc link của nơi khác — thà bỏ còn hơn dẫn khách sang nước khác.
const VN_BOUNDS = { minLat: 8, maxLat: 24, minLng: 102, maxLng: 110 };

// `geocoded`   — máy tra từ địa chỉ chữ, CHƯA ai nhìn bản đồ xác nhận.
// `user_adjusted` — người dùng đã kéo ghim tới đúng chỗ (đè lên kết quả tra, 2026-09-16).
// `cdp_verified`  — CDP tự đối chiếu và xác nhận.
export const COORDINATE_SOURCES = [
  "import",
  "google_maps_link",
  "proposal",
  "admin",
  "geocoded",
  "user_adjusted",
  "cdp_verified",
];

/**
 * { lat, lng, source?, confirmed? } hợp lệ trong Việt Nam, làm tròn 6 chữ số (~10cm) — không thì null.
 *
 * `confirmed: true` = đã có người nhìn ghim trên bản đồ và bấm xác nhận. Toạ độ chưa xác nhận vẫn
 * dùng được để dẫn đường, chỉ là chưa ai kiểm tra bằng mắt.
 */
export function cleanCoordinates(value, source = null) {
  const lat = Number(value?.lat);
  const lng = Number(value?.lng);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
  if (lat < VN_BOUNDS.minLat || lat > VN_BOUNDS.maxLat || lng < VN_BOUNDS.minLng || lng > VN_BOUNDS.maxLng) {
    return null;
  }
  const round = (n) => Math.round(n * 1e6) / 1e6;
  const cleanSource = source ?? value?.source ?? null;
  return {
    lat: round(lat),
    lng: round(lng),
    ...(COORDINATE_SOURCES.includes(cleanSource) ? { source: cleanSource } : {}),
    ...(value?.confirmed === true ? { confirmed: true } : {}),
  };
}

/**
 * Đọc toạ độ từ link Google Maps hoặc chuỗi "lat, lng" — không gọi API nào.
 * Thứ tự ưu tiên: `!3d…!4d…` (đúng ghim địa điểm) → `?q=/query=/ll=/destination=lat,lng` →
 * `@lat,lng` (tâm khung nhìn, kém chính xác hơn) → chuỗi toạ độ trần.
 * Link rút gọn maps.app.goo.gl không chứa toạ độ → null (P1, cần gọi mạng để mở link).
 */
export function parseMapsCoordinates(text) {
  if (typeof text !== "string" || !text.trim()) return null;
  let input = text.trim();
  try {
    input = decodeURIComponent(input);
  } catch {
    // link lỗi mã hoá: đọc nguyên văn
  }
  const num = "(-?\\d{1,3}\\.\\d+)";
  const patterns = [
    new RegExp(`!3d${num}!4d${num}`),
    new RegExp(`[?&](?:q|query|ll|destination|center)=${num},\\s*${num}`),
    new RegExp(`@${num},${num}`),
    new RegExp(`^${num}\\s*,\\s*${num}$`),
  ];
  for (const pattern of patterns) {
    const match = input.match(pattern);
    if (!match) continue;
    const coords = cleanCoordinates({ lat: match[1], lng: match[2] }, "google_maps_link");
    if (coords) return coords;
  }
  return null;
}

/** Toạ độ của một place — đọc cả vài dạng cũ (lat/lng rời, latitude/longitude) lúc đọc. */
export function coordinatesOf(place) {
  if (!place) return null;
  return (
    cleanCoordinates(place.coordinates) ??
    cleanCoordinates({ lat: place.lat, lng: place.lng }) ??
    cleanCoordinates({ lat: place.latitude, lng: place.longitude })
  );
}

/** Chuỗi "lat,lng" cho Google Maps — dẫn đúng ghim, không để Google đoán theo tên. */
export function coordinatesQuery(coords) {
  return coords ? `${coords.lat},${coords.lng}` : null;
}
