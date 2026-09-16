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
 * - `google_place`   — chọn đúng một địa điểm có sẵn trên Google (kèm Place ID).
 * - `user_pin`       — khách tự ghim trên bản đồ rồi xác nhận.
 * - `admin_pin`      — admin/CDP ghim.
 * - `community_pin`  — NHIỀU khách độc lập cùng ghim về một chỗ (lib/locationVotes.js).
 * - `machine`        — máy tự suy: nguồn nhập, đọc từ link Maps, tra địa chỉ. CHƯA ai kiểm bằng mắt.
 * - `legacy_text`    — chưa có toạ độ, chỉ có chữ (phần lớn dữ liệu cũ).
 */
export const LOCATION_SOURCES = {
  GOOGLE_PLACE: "google_place",
  USER_PIN: "user_pin",
  ADMIN_PIN: "admin_pin",
  COMMUNITY_PIN: "community_pin",
  MACHINE: "machine",
  LEGACY_TEXT: "legacy_text",
};

/**
 * Mức tin của một vị trí, theo đúng thứ tự spec Consensus §8: CDP chốt > cộng đồng đồng thuận >
 * chưa ai xác nhận. Chỉ hai mức đầu được phép dẫn đường.
 */
export const LOCATION_STATUS = {
  ADMIN_VERIFIED: "admin_verified",
  COMMUNITY_VERIFIED: "community_verified",
  UNVERIFIED: "unverified",
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
  [LOCATION_SOURCES.COMMUNITY_PIN]: "nhiều khách cùng ghim một chỗ",
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
 * `verified` = ĐỦ TIN ĐỂ DẪN ĐƯỜNG, theo thứ tự tin cậy của spec Consensus §8:
 *
 *   1. Chính hồ sơ có Place ID, hoặc có toạ độ mà một người đã nhìn bản đồ và bấm xác nhận
 *      (admin ghim ở /admin/vi-tri, hoặc chủ lộ trình ghim điểm riêng của mình) → `admin_verified`.
 *   2. Chưa có gì, nhưng nhiều khách độc lập cùng ghim về một chỗ → `community_verified`
 *      (bảng đồng thuận gắn sẵn vào `entity.locationConsensus`, xem lib/locationVotes.js).
 *   3. Còn lại → `unverified`. Toạ độ máy tự suy (nguồn nhập, link Maps, tra địa chỉ) nằm ở đây:
 *      nó chỉ là điểm khởi đầu để người ta kéo ghim, không phải căn cứ dẫn đường.
 *
 * Phiếu cộng đồng KHÔNG BAO GIỜ đè lên vị trí CDP đã chốt — chỉ được dùng khi hồ sơ chưa có gì.
 * `conflict` chỉ là cảnh báo cho admin (có người báo chỗ khác), không chặn dẫn đường.
 *
 * @returns {{lat, lng, googlePlaceId, source, verified, status, voters, conflict}}
 */
export function locationOf(entity) {
  const googlePlaceId = googlePlaceIdOf(entity);
  const coords = coordinatesOf(entity);
  const consensus = entity?.locationConsensus ?? null;
  const conflict = consensus?.conflict === true;
  const ownVerified = Boolean(googlePlaceId) || coords?.confirmed === true;

  if (ownVerified) {
    return {
      lat: coords?.lat ?? null,
      lng: coords?.lng ?? null,
      googlePlaceId,
      source: googlePlaceId
        ? LOCATION_SOURCES.GOOGLE_PLACE
        : (SOURCE_GROUP[coords?.source] ?? LOCATION_SOURCES.MACHINE),
      verified: true,
      status: LOCATION_STATUS.ADMIN_VERIFIED,
      voters: 0,
      conflict,
    };
  }

  if (consensus?.status === "community_verified") {
    return {
      lat: consensus.lat,
      lng: consensus.lng,
      googlePlaceId: consensus.googlePlaceId ?? null,
      source: LOCATION_SOURCES.COMMUNITY_PIN,
      verified: true,
      status: LOCATION_STATUS.COMMUNITY_VERIFIED,
      voters: consensus.voters ?? 0,
      conflict,
    };
  }

  return {
    lat: coords?.lat ?? null,
    lng: coords?.lng ?? null,
    googlePlaceId: null,
    source: coords ? (SOURCE_GROUP[coords.source] ?? LOCATION_SOURCES.MACHINE) : LOCATION_SOURCES.LEGACY_TEXT,
    verified: false,
    status: LOCATION_STATUS.UNVERIFIED,
    voters: consensus?.voters ?? 0,
    conflict,
  };
}

/** Có dẫn đường tới chỗ này được không (§3 Priority 1–2). */
export function isLocationVerified(entity) {
  return locationOf(entity).verified;
}

/** Chỗ này đã được CDP chốt chưa — phiếu cộng đồng không tính (dùng cho bảng admin). */
export function isAdminVerified(entity) {
  return locationOf(entity).status === LOCATION_STATUS.ADMIN_VERIFIED;
}
