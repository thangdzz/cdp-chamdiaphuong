// Tra địa điểm trên Google Places (spec Google-Maps-Location-Routing §4, §15). Phần THUẦN: ghép
// yêu cầu, đọc kết quả. Phần gọi mạng ở app/googlePlacesActions.js.
//
// Vì sao cần, khi đã có bản đồ kéo ghim: chỗ nào Google ĐÃ CÓ thì chọn một phát là xong — có luôn
// Place ID, toạ độ chuẩn và địa chỉ Google tự chuẩn hoá, khỏi kéo. Place ID còn bền hơn toạ độ:
// quán dời vài mét hay đổi tên phường thì ID vẫn trỏ đúng chỗ đó.
//
// Chỉ gọi lúc THÊM / SỬA / XÁC MINH (§14). Xem trang, mở lộ trình, mở link chia sẻ thì KHÔNG gọi —
// vị trí đã nằm trong dữ liệu CDP rồi.

import { cleanCoordinates } from "./coordinates.js";

// Places API (New) — Text Search. Trả đúng các field cần, không lấy thừa: Google tính tiền theo
// nhóm field, xin thừa là trả tiền thừa.
export const PLACES_ENDPOINT = "https://places.googleapis.com/v1/places:searchText";
export const PLACES_FIELD_MASK = "places.id,places.displayName,places.formattedAddress,places.location";

export const MIN_QUERY_LENGTH = 3;
export const MAX_CANDIDATES = 5;
// Bán kính ưu tiên quanh tâm tỉnh. Đủ rộng để phủ một tỉnh, đủ hẹp để không lôi kết quả tỉnh khác lên đầu.
const BIAS_RADIUS_M = 40000;

/** Thân yêu cầu Text Search. `near` là tâm ưu tiên (thường là tâm tỉnh đang chọn). */
export function placesSearchBody(query, near) {
  const textQuery = typeof query === "string" ? query.replace(/\s+/g, " ").trim().slice(0, 200) : "";
  if (textQuery.length < MIN_QUERY_LENGTH) return null;
  const body = {
    textQuery,
    languageCode: "vi",
    regionCode: "VN",
    maxResultCount: MAX_CANDIDATES,
  };
  if (Number.isFinite(near?.lat) && Number.isFinite(near?.lng)) {
    body.locationBias = {
      circle: { center: { latitude: near.lat, longitude: near.lng }, radius: BIAS_RADIUS_M },
    };
  }
  return body;
}

/**
 * Đọc kết quả Text Search thành danh sách ứng viên cho người dùng chọn.
 * Bỏ chỗ thiếu toạ độ hoặc nằm ngoài Việt Nam — chọn phải xong là có vị trí dùng được ngay.
 * @returns {{placeId: string, name: string, address: string|null, lat: number, lng: number}[]}
 */
export function readPlacesResults(payload) {
  const places = Array.isArray(payload?.places) ? payload.places : [];
  return places
    .map((place) => {
      const coords = cleanCoordinates({ lat: place?.location?.latitude, lng: place?.location?.longitude });
      const placeId = typeof place?.id === "string" ? place.id.trim() : "";
      if (!coords || !placeId) return null;
      return {
        placeId: placeId.slice(0, 200),
        name: (place?.displayName?.text ?? "").toString().trim().slice(0, 200) || placeId,
        address: (place?.formattedAddress ?? "").toString().trim().slice(0, 300) || null,
        lat: coords.lat,
        lng: coords.lng,
      };
    })
    .filter(Boolean)
    .slice(0, MAX_CANDIDATES);
}
