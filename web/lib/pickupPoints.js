// Điểm đón của dịch vụ đón khách (NOTE-14 §8–§12). File thuần — admin form, server lưu và lộ trình
// cùng đọc, để "một điểm đón hợp lệ là gì" chỉ định nghĩa ở MỘT chỗ.
//
// Nguyên tắc NOTE-14 §2: SERVICE KHÔNG PHẢI ĐIỂM ĐỊA LÝ. Địa chỉ của "Xe ghép Anh Huy" là chỗ đăng ký
// kinh doanh, không phải nơi khách lên xe — lộ trình phải dẫn tới điểm đón, không tới địa chỉ service.

import { transportFamilyOf } from "./transport.js";
import { isValidProvince } from "./provinces.js";
import { cleanCoordinates } from "./coordinates.js";

export const PICKUP_MODES = [
  { id: "fixed_points", label: "Điểm đón cố định" },
  { id: "door_to_door", label: "Đón tận nơi" },
  { id: "both", label: "Cả hai" },
  { id: "contact_first", label: "Liên hệ trước" },
];

export const MAX_PICKUP_POINTS = 20;
const MAX_TEXT = 120;
const MAX_NOTE = 160;

export function pickupModeLabel(id) {
  return PICKUP_MODES.find((mode) => mode.id === id)?.label ?? null;
}

export function isValidPickupMode(id) {
  return PICKUP_MODES.some((mode) => mode.id === id);
}

/** Chỉ family `pickup-service` (xe ghép, taxi, thuê xe có lái…) mới có điểm đón. */
export function isPickupService(place) {
  return transportFamilyOf(place) === "pickup-service";
}

function cleanText(value, max = MAX_TEXT) {
  return typeof value === "string" ? value.replace(/\s+/g, " ").trim().slice(0, max) : "";
}

// Không dùng crypto.randomUUID: trang admin mở qua http://MAdz.local (không https) không có hàm đó.
function newPointId() {
  return `pp-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
}

/**
 * Một điểm đón hợp lệ hoặc null. Bắt buộc có ĐỊA CHỈ + TỈNH/THÀNH hợp lệ (NOTE-14 §10: chỉ lưu
 * "31 Hàng Bún" thì Google đoán tỉnh theo ngữ cảnh service và dẫn sai).
 */
export function cleanPickupPoint(raw, order = 0) {
  const addressLine = cleanText(raw?.addressLine);
  const province = cleanText(raw?.province);
  if (!addressLine || !isValidProvince(province)) return null;
  const coords = cleanCoordinates({ lat: raw?.lat, lng: raw?.lng });
  const id = typeof raw?.id === "string" && /^pp-[a-z0-9]{4,40}$/.test(raw.id) ? raw.id : newPointId();
  return {
    id,
    name: cleanText(raw?.name) || addressLine,
    addressLine,
    wardOrDistrict: cleanText(raw?.wardOrDistrict) || null,
    province,
    lat: coords?.lat ?? null,
    lng: coords?.lng ?? null,
    note: cleanText(raw?.note, MAX_NOTE) || null,
    order,
    active: raw?.active !== false,
  };
}

/** Danh sách đã làm sạch: bỏ điểm thiếu địa chỉ/tỉnh, giữ thứ tự nhận vào, đánh lại `order`. */
export function cleanPickupPoints(list) {
  if (!Array.isArray(list)) return [];
  const out = [];
  const seenIds = new Set();
  for (const raw of list) {
    const point = cleanPickupPoint(raw, out.length);
    if (!point) continue;
    if (seenIds.has(point.id)) point.id = newPointId();
    seenIds.add(point.id);
    out.push(point);
    if (out.length >= MAX_PICKUP_POINTS) break;
  }
  return out;
}

/** Điểm đón của một place theo thứ tự; `activeOnly` cho phía khách. Dữ liệu cũ không có → []. */
export function pickupPointsOf(place, { activeOnly = true } = {}) {
  if (!Array.isArray(place?.pickupPoints)) return [];
  return [...place.pickupPoints]
    .filter((point) => point && (!activeOnly || point.active !== false))
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
}

/** "31 Hàng Bún, Ba Đình, Hà Nội" — luôn kèm tỉnh/thành. */
export function pickupPointFullAddress(point) {
  return [point?.addressLine, point?.wardOrDistrict, point?.province]
    .map((part) => cleanText(part))
    .filter(Boolean)
    .join(", ");
}
