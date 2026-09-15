// Tín hiệu nguồn nhập ngoài tên/địa chỉ (NOTE-14 §3, §19): trạng thái kinh doanh, toạ độ, metadata
// của nhà cung cấp. Thuần dữ liệu — normalize.js gọi, ingestBatch.js quyết định dựa trên kết quả.

import { cleanCoordinates, parseMapsCoordinates } from "../coordinates.js";

export const SOURCE_BUSINESS_STATUS = {
  OPERATIONAL: "operational",
  CLOSED_TEMPORARILY: "closed_temporarily",
  CLOSED_PERMANENTLY: "closed_permanently",
};

// Giá trị enum kiểu Google Places (`businessStatus`) và các cách routine có thể viết lại.
const ENUM_MAP = {
  OPERATIONAL: SOURCE_BUSINESS_STATUS.OPERATIONAL,
  CLOSED_TEMPORARILY: SOURCE_BUSINESS_STATUS.CLOSED_TEMPORARILY,
  CLOSED_PERMANENTLY: SOURCE_BUSINESS_STATUS.CLOSED_PERMANENTLY,
  PERMANENTLY_CLOSED: SOURCE_BUSINESS_STATUS.CLOSED_PERMANENTLY,
};

// Chữ hiện trên Google Maps tiếng Việt/Anh. "Tạm đóng cửa" KHÔNG phải đóng vĩnh viễn — không chặn.
const PERMANENT_TEXT = /đóng(\s*cửa)?\s*vĩnh\s*viễn|ngừng\s*(hoạt\s*động|kinh\s*doanh)\s*vĩnh\s*viễn|permanently\s+closed|closed\s+permanently/i;
const TEMPORARY_TEXT = /tạm\s*(thời\s*)?đóng\s*cửa|temporarily\s+closed|closed\s+temporarily/i;

// Field chữ tự do nơi routine có thể chép nguyên dòng trạng thái của Google.
const TEXT_FIELDS = ["business_status", "business_status_text", "opening_hours_text", "map_note"];

/** Trạng thái kinh doanh nguồn báo, hoặc null nếu nguồn không nói gì. */
export function sourceBusinessStatusOf(raw) {
  const enumValue = String(raw?.business_status ?? raw?.businessStatus ?? "")
    .trim()
    .toUpperCase()
    .replace(/[\s-]+/g, "_");
  if (ENUM_MAP[enumValue]) return ENUM_MAP[enumValue];

  const texts = TEXT_FIELDS.map((field) => raw?.[field]).filter((value) => typeof value === "string");
  if (texts.some((text) => PERMANENT_TEXT.test(text))) return SOURCE_BUSINESS_STATUS.CLOSED_PERMANENTLY;
  if (texts.some((text) => TEMPORARY_TEXT.test(text))) return SOURCE_BUSINESS_STATUS.CLOSED_TEMPORARILY;
  return null;
}

const MAPS_URL_FIELDS = ["google_maps_url", "maps_url", "source_url"];

/** Toạ độ nguồn cung cấp: lat/lng rời, object coordinates, hoặc đọc từ link Google Maps. */
export function sourceCoordinatesOf(raw) {
  const direct =
    cleanCoordinates({ lat: raw?.lat, lng: raw?.lng }, "import") ??
    cleanCoordinates(raw?.coordinates, "import");
  if (direct) return direct;
  for (const field of MAPS_URL_FIELDS) {
    const fromUrl = parseMapsCoordinates(raw?.[field]);
    if (fromUrl) return { ...fromUrl, source: "import" };
  }
  return null;
}

function isGoogleMapsUrl(value) {
  return typeof value === "string" && /(google\.[a-z.]+\/maps|maps\.google\.|maps\.app\.goo\.gl|goo\.gl\/maps)/i.test(value);
}

/**
 * Metadata riêng của nhà cung cấp (NOTE-14 §19) — để trong `providerMeta.google`, không rải vào
 * field chung. Null khi nguồn không có gì của Google.
 */
export function sourceProviderMetaOf(raw, businessStatus) {
  const mapsUrl = MAPS_URL_FIELDS.map((field) => raw?.[field]).find(isGoogleMapsUrl) ?? null;
  const placeId = typeof raw?.google_place_id === "string" ? raw.google_place_id.trim().slice(0, 200) : null;
  const provider = String(raw?.provider ?? "").toLowerCase();
  if (!mapsUrl && !placeId && provider !== "google") return null;
  return {
    google: {
      placeId: placeId || null,
      mapsUrl: mapsUrl ? mapsUrl.slice(0, 500) : null,
      businessStatus: businessStatus ?? null,
    },
  };
}
