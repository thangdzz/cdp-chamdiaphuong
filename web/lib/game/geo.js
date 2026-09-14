// Tính khoảng cách/ô lưới cho game layer. Thuần, dùng chung client + server.

const EARTH_RADIUS_M = 6371000;

export function distanceMeters(a, b) {
  const toRad = (deg) => (deg * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * EARTH_RADIUS_M * Math.asin(Math.sqrt(h));
}

// bounds = [[minLng, minLat], [maxLng, maxLat]] — cùng thứ tự MapLibre dùng.
export function isWithinBounds({ lat, lng }, bounds) {
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return false;
  if (!bounds) return Math.abs(lat) <= 90 && Math.abs(lng) <= 180;
  const [[minLng, minLat], [maxLng, maxLat]] = bounds;
  return lat >= minLat && lat <= maxLat && lng >= minLng && lng <= maxLng;
}

// Vị trí công khai làm tròn ~11m (4 chữ số thập phân): đủ để đi tìm mô hình, không đủ để lần
// ra từng bước chân của người báo (NOTE-04 §20).
export function roundPublicCoord(value) {
  return Math.round(value * 10000) / 10000;
}

// Ô ~110m cho thống kê "khu vực sôi động" (NOTE-04 §18 area_activity) — nền cho heatmap sau.
export function areaCell({ lat, lng }) {
  return `${lat.toFixed(3)},${lng.toFixed(3)}`;
}
