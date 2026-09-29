// Lọc + tìm + sắp xếp danh sách địa điểm — DÙNG CHUNG cho trang chủ cũ (PlaceExplorer) và trang
// kết quả `/tim` (vNext bước 1–2). Hàm thuần, không React, để hai nơi không bao giờ lọc lệch nhau
// và test được bằng `node --test`. Tìm theo chữ vẫn đi qua lib/placeTextSearch.js như PlacePicker.

import { rankBySearch } from "./placeRank.js";
import { BROWSABLE_PLACE_TYPES } from "./placeTypes.js";
import { comparePlaceReliability } from "./placeReliability.js";

export const PRICE_BUCKETS = [
  { id: "all", label: "Tất cả mức giá" },
  { id: "duoi-100k", label: "Dưới 100.000đ", min: 0, max: 100000 },
  { id: "100k-500k", label: "100.000 – 500.000đ", min: 100000, max: 500000 },
  { id: "500k-1tr", label: "500.000 – 1.000.000đ", min: 500000, max: 1000000 },
  { id: "tren-1tr", label: "Trên 1.000.000đ", min: 1000000, max: Infinity },
];

export const ALL = "all";

export function matchesPriceBucket(place, bucketId) {
  if (!bucketId || bucketId === ALL) return true;
  const bucket = PRICE_BUCKETS.find((b) => b.id === bucketId);
  if (!bucket) return true; // mã lạ trên URL -> coi như không lọc, đừng trả rỗng
  if (place.priceMin == null || place.priceMax == null) return false;
  return place.priceMin <= bucket.max && place.priceMax >= bucket.min;
}

/** Các phường có trong danh sách, sắp theo chữ — cho ô chọn khu vực. */
export function wardsOf(places) {
  return Array.from(new Set(places.map((p) => p.ward).filter(Boolean))).sort();
}

/**
 * Lọc theo nhóm / khu vực / mức giá / chữ gõ. Giá trị rỗng hoặc "all" = không lọc theo tiêu chí đó.
 * Chỉ giữ loại "xem được" (BROWSABLE_PLACE_TYPES): "Chỗ quen gọi" có trong danh bạ nhưng không
 * phải chỗ để đi ăn/chơi/ngủ.
 *
 * Có chữ gõ thì kết quả XẾP THEO MỨC LIÊN QUAN (lib/placeRank.js: tên > nhóm > địa chỉ), cùng
 * mức thì giữ thứ tự đầu vào. Không có chữ gõ thì giữ nguyên thứ tự đầu vào.
 */
export function filterPlaces(places, { type = ALL, ward = ALL, priceBucket = ALL, search = "" } = {}) {
  const browsable = new Set(BROWSABLE_PLACE_TYPES.map((t) => t.id));
  const filtered = places.filter((p) => {
    if (!browsable.has(p.type)) return false;
    if (type && type !== ALL && p.type !== type) return false;
    if (ward && ward !== ALL && p.ward !== ward) return false;
    if (!matchesPriceBucket(p, priceBucket)) return false;
    return true;
  });
  return rankBySearch(filtered, search);
}

/** Chia theo 4 nhóm, mỗi nhóm xếp chỗ đáng tin lên trước — cách trang chủ cũ bày danh sách. */
export function groupByBrowsableType(places) {
  return BROWSABLE_PLACE_TYPES.map((t) => ({
    type: t,
    items: places.filter((p) => p.type === t.id).sort(comparePlaceReliability),
  }));
}

/** Một danh sách phẳng, chỗ đáng tin lên trước — cho trang kết quả. Không đổi mảng gốc. */
export function sortByReliability(places) {
  return [...places].sort(comparePlaceReliability);
}
