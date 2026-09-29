// Trang kết quả `/tim` (vNext bước 2): đọc/ghi bộ lọc trên URL + thu gọn mỗi địa điểm thành đúng
// những gì thẻ kết quả cần. Hàm thuần — test được bằng `node --test`.
//
// Vì sao thu gọn: trang chủ cũ gửi NGUYÊN bản ghi của 280+ chỗ xuống trình duyệt (ảnh, câu trả
// lời, mẹo…) chỉ để bày danh sách. Thẻ kết quả chỉ cần ~15 trường; phần nặng nằm ở trang chi tiết.

import { ALL, PRICE_BUCKETS } from "./placeFilter.js";
import { BROWSABLE_PLACE_TYPES, getPlaceTypeLabel } from "./placeTypes.js";
import { placeMapAction } from "./mapsUrl.js";
import { transportSummary } from "./transport.js";
import { formatPriceCompact } from "./priceFormat.js";
import { formatShortAddress } from "./placeDisplay.js";

export const RESULTS_PAGE_SIZE = 20;

const TYPE_IDS = new Set(BROWSABLE_PLACE_TYPES.map((t) => t.id));
const PRICE_IDS = new Set(PRICE_BUCKETS.map((b) => b.id));

function first(value) {
  return Array.isArray(value) ? value[0] : value;
}

/**
 * URL → bộ lọc. Giá trị lạ (gõ tay, link cũ) bị bỏ qua thay vì làm rỗng trang.
 * @param {{[key: string]: string | string[] | undefined}} params searchParams của trang
 */
export function filtersFromParams(params = {}) {
  const q = String(first(params.q) ?? "").slice(0, 100);
  const loai = first(params.loai);
  const gia = first(params.gia);
  const khuVuc = first(params.khu);
  return {
    search: q,
    type: TYPE_IDS.has(loai) ? loai : ALL,
    priceBucket: PRICE_IDS.has(gia) ? gia : ALL,
    ward: typeof khuVuc === "string" && khuVuc.trim() ? khuVuc.trim().slice(0, 60) : ALL,
  };
}

/** Bộ lọc → chuỗi query (không có dấu "?"), bỏ các tiêu chí đang là "tất cả". */
export function paramsFromFilters({ search = "", type = ALL, priceBucket = ALL, ward = ALL } = {}) {
  const params = new URLSearchParams();
  if (search.trim()) params.set("q", search.trim());
  if (type !== ALL) params.set("loai", type);
  if (ward !== ALL) params.set("khu", ward);
  if (priceBucket !== ALL) params.set("gia", priceBucket);
  return params.toString();
}

/**
 * Bản gọn của một địa điểm cho thẻ kết quả. Giữ đủ trường mà lib/placeFilter.js cần để lọc/tìm
 * (type, ward, giá, tên, tên dân hay gọi, địa chỉ, khu), cộng phần hiển thị tính sẵn ở máy chủ.
 */
export function toResultItem(place) {
  const mapAction = placeMapAction(place);
  const price = formatPriceCompact(place);
  return {
    id: place.id,
    name: place.name,
    type: place.type,
    typeLabel: getPlaceTypeLabel(place.type),
    ward: place.ward ?? null,
    address: place.address ?? null,
    localArea: place.localArea ?? null,
    searchAliases: place.searchAliases ?? [],
    priceMin: place.priceMin ?? null,
    priceMax: place.priceMax ?? null,
    // Dòng phụ: chỗ Đi lại đã chọn loại thì "Xe ghép · 7 chỗ" có ích hơn địa chỉ (NOTE-04 §2).
    subline: transportSummary(place) ?? formatShortAddress(place.address) ?? place.ward ?? null,
    // Tách số và đơn vị như thẻ cũ: số to, "đ/đêm" nhỏ bên cạnh (DESIGN.md §6b).
    priceCompact: price?.compact ?? null,
    priceUnitText: price?.unitText ?? null,
    lastCheckinAt: place.lastCheckinAt ?? null,
    mapHref: mapAction?.href ?? null,
    mapLabel: mapAction?.label ?? null,
  };
}
