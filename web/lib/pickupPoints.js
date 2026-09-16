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
 * Toạ độ của một điểm đón, dạng PHẲNG `lat`/`lng`/`locationSource`/`locationConfirmed` đúng như
 * NOTE-14 §10 mô tả. (Place và điểm dừng lộ trình dùng `coordinates: {…}` — hai nơi hai quy ước,
 * vì mỗi bên đã theo spec của mình từ trước; lib/coordinates.js vẫn là chỗ duy nhất kiểm tra
 * toạ độ có hợp lệ hay không.)
 *
 * `locationConfirmed` = đã có người nhìn ghim trên bản đồ và bấm xác nhận (2026-09-16).
 */
export function cleanPickupLocation(raw) {
  const coords = cleanCoordinates({
    lat: raw?.lat,
    lng: raw?.lng,
    source: raw?.locationSource,
    confirmed: raw?.locationConfirmed === true,
  });
  if (!coords) return { lat: null, lng: null, locationSource: null, locationConfirmed: false, googlePlaceId: null };
  const placeId = typeof raw?.googlePlaceId === "string" ? raw.googlePlaceId.trim().slice(0, 200) : "";
  return {
    lat: coords.lat,
    lng: coords.lng,
    locationSource: coords.source ?? null,
    locationConfirmed: coords.confirmed === true,
    googlePlaceId: placeId || null,
  };
}

/**
 * Một điểm đón hợp lệ hoặc null. Bắt buộc có ĐỊA CHỈ + TỈNH/THÀNH hợp lệ (NOTE-14 §10: chỉ lưu
 * "31 Hàng Bún" thì Google đoán tỉnh theo ngữ cảnh service và dẫn sai).
 */
export function cleanPickupPoint(raw, order = 0) {
  const addressLine = cleanText(raw?.addressLine);
  const province = cleanText(raw?.province);
  if (!addressLine || !isValidProvince(province)) return null;
  const id = typeof raw?.id === "string" && /^pp-[a-z0-9]{4,40}$/.test(raw.id) ? raw.id : newPointId();
  return {
    id,
    name: cleanText(raw?.name) || addressLine,
    addressLine,
    wardOrDistrict: cleanText(raw?.wardOrDistrict) || null,
    province,
    ...cleanPickupLocation(raw),
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

// ─────────────── Điểm đón trong lộ trình (NOTE-14 §12–§17) ───────────────
//
// `stop.pickupSelection` là BẢN CHỤP lúc chọn (§14): nhà xe sửa/xoá điểm đón về sau thì lộ trình đã lập
// không gãy. Hai dạng:
//   { type: "pickup_point", pickupPointId, name, addressLine, wardOrDistrict, province, lat, lng }
//   { type: "custom", name, addressLine, wardOrDistrict, province }  ← "Đón tận nơi / Điểm khác" (§15):
//     chỉ thuộc lộ trình đó, KHÔNG bao giờ thành place công khai.

export const PICKUP_SELECTION_TYPES = { POINT: "pickup_point", CUSTOM: "custom" };

/**
 * Làm sạch lựa chọn khách gửi lên. Điểm cố định lấy dữ liệu từ PLACE (server đọc), không tin chữ
 * trình duyệt gửi — chỉ nhận id. @returns {object|null}
 */
export function cleanPickupSelection(selection, place) {
  if (selection?.type === PICKUP_SELECTION_TYPES.POINT) {
    const point = pickupPointsOf(place).find((candidate) => candidate.id === selection.pickupPointId);
    if (!point) return null;
    return {
      type: PICKUP_SELECTION_TYPES.POINT,
      pickupPointId: point.id,
      name: point.name,
      addressLine: point.addressLine,
      wardOrDistrict: point.wardOrDistrict ?? null,
      province: point.province,
      ...cleanPickupLocation(point),
    };
  }
  if (selection?.type === PICKUP_SELECTION_TYPES.CUSTOM) {
    const addressLine = cleanText(selection.addressLine);
    const province = cleanText(selection.province);
    if (!addressLine || !isValidProvince(province)) return null;
    return {
      type: PICKUP_SELECTION_TYPES.CUSTOM,
      name: cleanText(selection.name, 60) || "Điểm đón của tôi",
      addressLine,
      wardOrDistrict: cleanText(selection.wardOrDistrict) || null,
      province,
      // Điểm tự nhập cũng ghim được trên bản đồ (2026-09-16): địa chỉ nhà khách càng khó tra hơn
      // địa chỉ quán, để Google đoán là dẫn xe tới nhầm ngõ.
      ...cleanPickupLocation(selection),
    };
  }
  return null;
}

/** Bản chụp đọc lại từ link chia sẻ (không còn place để đối chiếu): chỉ giữ đúng các field đã biết. */
export function sanitizeStoredPickupSelection(selection) {
  if (!selection || typeof selection !== "object") return null;
  const addressLine = cleanText(selection.addressLine);
  const province = cleanText(selection.province);
  if (!addressLine || !isValidProvince(province)) return null;
  const isPoint = selection.type === PICKUP_SELECTION_TYPES.POINT;
  return {
    type: isPoint ? PICKUP_SELECTION_TYPES.POINT : PICKUP_SELECTION_TYPES.CUSTOM,
    ...(isPoint ? { pickupPointId: cleanText(selection.pickupPointId, 60) || null } : {}),
    name: cleanText(selection.name, 60) || addressLine,
    addressLine,
    wardOrDistrict: cleanText(selection.wardOrDistrict) || null,
    province,
    ...cleanPickupLocation(selection),
  };
}

/** Chuỗi Google Maps của điểm đón đã chọn (§16): toạ độ nếu có, không thì địa chỉ đầy đủ kèm tỉnh. */
export function pickupSelectionMapsQuery(selection) {
  if (!selection) return null;
  const coords = cleanCoordinates({ lat: selection.lat, lng: selection.lng });
  if (coords) return `${coords.lat},${coords.lng}`;
  return pickupPointFullAddress(selection) || null;
}

/** "Đón tại: Điểm đón Hàng Bún — 31 Hàng Bún, Ba Đình, Hà Nội". */
export function pickupSelectionLabel(selection) {
  if (!selection) return null;
  const address = pickupPointFullAddress(selection);
  return selection.name && selection.name !== selection.addressLine ? `${selection.name} — ${address}` : address;
}

/** Điểm dừng (đã resolve) là dịch vụ đón khách mà CHƯA chọn điểm đón → chưa mở/chia sẻ Maps được (§17). */
export function stopNeedsPickupSelection(stop) {
  return Boolean(stop?.place && !stop.deleted && isPickupService(stop.place) && !stop.pickupSelection);
}
