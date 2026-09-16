// Tra toạ độ gần đúng từ địa chỉ chữ (NOTE-14 §6, mở rộng 2026-09-16 theo yêu cầu "xác nhận vị
// trí trên bản đồ"). Phần THUẦN của luồng đó: ghép câu tra, đọc kết quả, và mốc dự phòng.
//
// Vì sao kết quả tra chỉ là ĐIỂM KHỞI ĐẦU, không phải kết quả cuối:
//   Không nhà cung cấp nào (kể cả Google) có đủ số nhà ở Việt Nam. "63 Lê Duẩn, Minh Xuân,
//   Tuyên Quang" ra "Cong ty TNHH MTV Duy Hoa Dien, 321 Lê Duẩn" — đúng đường, sai nhà. Nên
//   luồng đúng là: tra ra một chỗ gần đúng → MỞ BẢN ĐỒ → người dùng kéo ghim tới đúng chỗ →
//   xác nhận. Toạ độ đã xác nhận mới là dữ liệu dẫn đường (lat/lng), tên điểm chỉ để hiển thị.
//
// Nhà cung cấp: Photon (komoot) — miễn phí, không cần khoá, dựng trên cùng dữ liệu OpenStreetMap
// với nền bản đồ dự án đang dùng (lib/game/mapStyle.js). KHÔNG dùng Nominatim dù nó cũng của OSM:
// test 16/9/2026 thấy nominatim.openstreetmap.org không kết nối được từ mạng gia đình ở VN, đúng
// như tile.openstreetmap.org đã gặp (DECISIONS 14/9). Không dùng Google Geocoding API: tính tiền
// theo lượt tra và dự án không có khoá. Đổi nhà cung cấp chỉ phải sửa file này + geocodeActions.

import { cleanCoordinates } from "./coordinates.js";
import { isValidProvince } from "./provinces.js";

/**
 * Tâm tra cứu của từng tỉnh/thành (34 đơn vị sau sắp xếp 01/7/2025). Dùng khi tra địa chỉ không
 * ra gì: bản đồ vẫn mở được ở đúng tỉnh người dùng đã chọn để họ tự kéo ghim, thay vì báo lỗi
 * rồi bỏ mặc. Lấy trung tâm tỉnh lỵ — sai vài km không sao, bước sau là kéo ghim.
 */
export const PROVINCE_CENTERS = {
  "Tuyên Quang": { lat: 21.8233, lng: 105.2142 },
  "An Giang": { lat: 10.3759, lng: 105.4186 },
  "Bắc Ninh": { lat: 21.1861, lng: 106.0763 },
  "Cà Mau": { lat: 9.1769, lng: 105.1524 },
  "Cao Bằng": { lat: 22.6657, lng: 106.257 },
  "Cần Thơ": { lat: 10.0452, lng: 105.7469 },
  "Đà Nẵng": { lat: 16.0544, lng: 108.2022 },
  "Đắk Lắk": { lat: 12.71, lng: 108.2378 },
  "Điện Biên": { lat: 21.386, lng: 103.0166 },
  "Đồng Nai": { lat: 10.9574, lng: 106.8426 },
  "Đồng Tháp": { lat: 10.4538, lng: 105.6332 },
  "Gia Lai": { lat: 13.9833, lng: 108.0 },
  "Hà Nội": { lat: 21.0278, lng: 105.8342 },
  "Hà Tĩnh": { lat: 18.3428, lng: 105.9057 },
  "Hải Phòng": { lat: 20.8449, lng: 106.6881 },
  "Huế": { lat: 16.4637, lng: 107.5909 },
  "Hưng Yên": { lat: 20.6464, lng: 106.0512 },
  "Khánh Hòa": { lat: 12.2388, lng: 109.1967 },
  "Lai Châu": { lat: 22.3964, lng: 103.4587 },
  "Lâm Đồng": { lat: 11.9404, lng: 108.4583 },
  "Lạng Sơn": { lat: 21.8537, lng: 106.7615 },
  "Lào Cai": { lat: 22.4856, lng: 103.9707 },
  "Nghệ An": { lat: 18.6796, lng: 105.6813 },
  "Ninh Bình": { lat: 20.2506, lng: 105.9745 },
  "Phú Thọ": { lat: 21.3227, lng: 105.4016 },
  "Quảng Ngãi": { lat: 15.1214, lng: 108.7922 },
  "Quảng Ninh": { lat: 20.9599, lng: 107.0448 },
  "Quảng Trị": { lat: 16.8163, lng: 107.0996 },
  "Sơn La": { lat: 21.3273, lng: 103.9141 },
  "Tây Ninh": { lat: 11.3352, lng: 106.1099 },
  "Thái Nguyên": { lat: 21.5942, lng: 105.8481 },
  "Thanh Hóa": { lat: 19.8069, lng: 105.7772 },
  "TP Hồ Chí Minh": { lat: 10.7769, lng: 106.7009 },
  "Vĩnh Long": { lat: 10.2539, lng: 105.9722 },
};

/** Mốc mở bản đồ khi chưa có gì để tra. Tỉnh lạ → Tuyên Quang (vùng chính của CDP). */
export function provinceCenter(province) {
  return PROVINCE_CENTERS[province] ?? PROVINCE_CENTERS["Tuyên Quang"];
}

function cleanPart(value) {
  return typeof value === "string" ? value.replace(/\s+/g, " ").trim() : "";
}

/**
 * Câu đem đi tra: "63 Lê Duẩn, Minh Xuân, Tuyên Quang". Bỏ phần chú thích trong ngoặc và cắt bớt
 * cụm quá dài — địa chỉ người ta gõ hay kèm chỉ dẫn ("đối diện cổng trường"), đưa nguyên vào thì
 * không khớp được gì. Bắt buộc có tỉnh: thiếu nó thì "31 Hàng Bún" ra nhầm tỉnh.
 * @returns {string|null}
 */
export function geocodeQueryOf({ addressLine, wardOrDistrict, province }) {
  const street = cleanPart(addressLine).split("(")[0].trim().replace(/[;,]+$/, "");
  if (!street || !isValidProvince(province)) return null;
  return [street.split(",").slice(0, 2).join(", "), cleanPart(wardOrDistrict), province]
    .filter(Boolean)
    .join(", ")
    .slice(0, 160);
}

/** "Phố Hàng Bún 31, Hà Nội" — nói cho người dùng biết đã tra ra CHỖ NÀO, để họ tự đối chiếu. */
export function geocodeResultLabel(properties) {
  const street = [cleanPart(properties?.street), cleanPart(properties?.housenumber)].filter(Boolean).join(" ");
  const parts = [cleanPart(properties?.name), street, cleanPart(properties?.district), cleanPart(properties?.city)];
  return [...new Set(parts.filter(Boolean))].slice(0, 3).join(", ") || null;
}

/**
 * Đọc kết quả Photon (GeoJSON FeatureCollection) thành toạ độ hợp lệ trong Việt Nam. Lấy kết quả
 * đầu tiên nằm trong khung Việt Nam — Photon xếp hạng sẵn, chỗ khớp nhất đứng đầu.
 * @returns {{lat:number,lng:number,label:string|null}|null}
 */
export function readGeocodeResults(payload) {
  const features = Array.isArray(payload?.features) ? payload.features : null;
  if (!features) return null;
  for (const feature of features) {
    const [lng, lat] = feature?.geometry?.coordinates ?? [];
    const coords = cleanCoordinates({ lat, lng });
    if (coords) return { lat: coords.lat, lng: coords.lng, label: geocodeResultLabel(feature.properties) };
  }
  return null;
}
