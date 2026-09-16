// VỊ TRÍ ĐỊA LÝ của một địa điểm / điểm dừng — một chỗ duy nhất trả lời: chỗ này đã đủ chính xác
// để DẪN ĐƯỜNG chưa? (spec docs/CDP-Google-Maps-Location-Routing-v1.md §2, §3, §12)
//
// Nguyên tắc: **CDP xác định điểm, Google chỉ tính đường.** Chuỗi chữ "tên + phường + tỉnh" chỉ
// dùng để TÌM KIẾM, không bao giờ là định danh cuối cùng của nút Chỉ đường — cùng một cái tên có ở
// nhiều huyện, số nhà hay thiếu trong dữ liệu Google, địa giới thì vừa sáp nhập.
//
// KHÔNG migration: mọi thứ suy ra lúc đọc từ field đã có (`coordinates`, `providerMeta.google`).
// Dữ liệu cũ không có gì → `legacy_text`, `verified: false` — vẫn xem được, chỉ không giả vờ là
// đã chính xác.

import { coordinatesOf } from "./coordinates.js";

/**
 * Ai/cái gì đặt ra vị trí này. Quan trọng hơn "đặt bằng cách nào": có người nhìn bản đồ xác nhận
 * hay chưa mới là thứ quyết định được dẫn đường hay không.
 *
 * - `google_place`  — chọn đúng một địa điểm có sẵn trên Google (kèm Place ID).
 * - `user_pin`      — khách tự ghim trên bản đồ rồi xác nhận.
 * - `admin_pin`     — admin/CDP ghim.
 * - `machine`       — máy tự suy: nguồn nhập, đọc từ link Maps, tra địa chỉ. CHƯA ai kiểm bằng mắt.
 * - `legacy_text`   — chưa có toạ độ, chỉ có chữ (phần lớn dữ liệu cũ).
 */
export const LOCATION_SOURCES = {
  GOOGLE_PLACE: "google_place",
  USER_PIN: "user_pin",
  ADMIN_PIN: "admin_pin",
  MACHINE: "machine",
  LEGACY_TEXT: "legacy_text",
};

// Giá trị `coordinates.source` đã lưu trong dữ liệu → nhóm ở trên. `user_adjusted` là tên cũ của
// `user_pin` (đặt ngày 16/9 sáng, đã có trong lộ trình thật) — giữ để không phải migration.
const SOURCE_GROUP = {
  google_place: LOCATION_SOURCES.GOOGLE_PLACE,
  user_pin: LOCATION_SOURCES.USER_PIN,
  user_adjusted: LOCATION_SOURCES.USER_PIN,
  admin_pin: LOCATION_SOURCES.ADMIN_PIN,
  admin: LOCATION_SOURCES.ADMIN_PIN,
  cdp_verified: LOCATION_SOURCES.ADMIN_PIN,
  geocoded: LOCATION_SOURCES.MACHINE,
  import: LOCATION_SOURCES.MACHINE,
  google_maps_link: LOCATION_SOURCES.MACHINE,
  proposal: LOCATION_SOURCES.MACHINE,
};

const SOURCE_LABEL = {
  [LOCATION_SOURCES.GOOGLE_PLACE]: "chọn từ Google Maps",
  [LOCATION_SOURCES.USER_PIN]: "khách ghim trên bản đồ",
  [LOCATION_SOURCES.ADMIN_PIN]: "CDP ghim trên bản đồ",
  [LOCATION_SOURCES.MACHINE]: "máy tự suy, chưa ai kiểm",
  [LOCATION_SOURCES.LEGACY_TEXT]: "chưa có vị trí",
};

export function locationSourceLabel(source) {
  return SOURCE_LABEL[source] ?? SOURCE_LABEL[LOCATION_SOURCES.LEGACY_TEXT];
}

/** Place ID của Google nếu đã biết — nằm trong providerMeta từ NOTE-14 A, hoặc field phẳng. */
export function googlePlaceIdOf(entity) {
  const raw = entity?.googlePlaceId ?? entity?.providerMeta?.google?.placeId ?? null;
  return typeof raw === "string" && raw.trim() ? raw.trim().slice(0, 200) : null;
}

/**
 * Vị trí của một địa điểm hoặc một điểm dừng lộ trình.
 *
 * `verified` = ĐỦ TIN ĐỂ DẪN ĐƯỜNG: hoặc có Place ID của Google, hoặc có toạ độ mà một con người
 * đã nhìn bản đồ và bấm xác nhận. Toạ độ máy tự suy (nguồn nhập, link Maps, tra địa chỉ) KHÔNG
 * tính là đã xác minh — nó chỉ là điểm khởi đầu để người ta kéo ghim.
 *
 * @returns {{lat: number|null, lng: number|null, googlePlaceId: string|null, source: string, verified: boolean}}
 */
export function locationOf(entity) {
  const googlePlaceId = googlePlaceIdOf(entity);
  const coords = coordinatesOf(entity);
  if (!coords && !googlePlaceId) {
    return { lat: null, lng: null, googlePlaceId: null, source: LOCATION_SOURCES.LEGACY_TEXT, verified: false };
  }
  const source = googlePlaceId
    ? LOCATION_SOURCES.GOOGLE_PLACE
    : (SOURCE_GROUP[coords?.source] ?? LOCATION_SOURCES.MACHINE);
  return {
    lat: coords?.lat ?? null,
    lng: coords?.lng ?? null,
    googlePlaceId,
    source,
    verified: Boolean(googlePlaceId) || coords?.confirmed === true,
  };
}

/** Có dẫn đường tới chỗ này được không (§3 Priority 1–2). */
export function isLocationVerified(entity) {
  return locationOf(entity).verified;
}
