import { placeMedia } from "./media.js";

function numericValue(value, fallback = -1) {
  if (value === null || value === undefined || value === "") return fallback;
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

function timestamp(value) {
  if (!value) return 0;
  const time = new Date(value).getTime();
  return Number.isFinite(time) ? time : 0;
}

const RECENT_CHECKIN_MS = 30 * 24 * 60 * 60 * 1000;

function hasText(value) {
  return typeof value === "string" && value.trim() !== "";
}

function hasAcceptedConsensus(consensus) {
  return Object.values(consensus ?? {}).some((item) => {
    const value = item?.value;
    return Array.isArray(value) ? value.length > 0 : value !== null && value !== undefined && value !== "";
  });
}

/**
 * Sáu NHÓM thông tin hữu ích, không đếm từng field rời. Nhờ vậy một bản ghi nhiều field cũ
 * không thể tích điểm vô hạn để lấn át xác nhận mới của người dùng.
 */
export function placeCompleteness(place) {
  const hasPrice = place?.priceMin != null || place?.priceMax != null;
  const hasVisual = placeMedia(place).length > 0;
  const hasLocation = hasText(place?.address) || hasText(place?.ward) || hasText(place?.localArea);
  const hasContactOrHours =
    hasText(place?.phone) ||
    hasText(place?.openingHours) ||
    hasText(place?.openingHoursText) ||
    hasText(place?.opening_hours_text) ||
    hasText(place?.hours);
  const hasPracticalFacts = hasAcceptedConsensus(place?.consensus);
  const hasTypeSpecific =
    (place?.signatureDishes?.length ?? 0) > 0 ||
    hasText(place?.transportSubtype) ||
    (place?.vehicleTypes?.length ?? 0) > 0 ||
    hasText(place?.vehicleSeats) ||
    hasText(place?.mainRoute) ||
    hasText(place?.serviceArea);

  return [
    hasPrice,
    hasVisual,
    hasLocation,
    hasContactOrHours,
    hasPracticalFacts,
    hasTypeSpecific,
  ].filter(Boolean).length;
}

/**
 * Xác nhận mới là tín hiệu mạnh nhất. Sau 30 ngày (cùng ngưỡng UI đổi sang "lâu chưa ai xác
 * nhận"), mức đầy đủ trở thành tín hiệu chính; xác nhận cũ chỉ giúp phá hoà với nơi chưa từng
 * được xác nhận. Không cần thêm key Redis hay migration.
 */
export function comparePlaceReliability(a, b) {
  const now = Date.now();
  const aCheckin = timestamp(a?.lastCheckinAt);
  const bCheckin = timestamp(b?.lastCheckinAt);
  const aRecent = aCheckin > 0 && now - aCheckin >= 0 && now - aCheckin <= RECENT_CHECKIN_MS;
  const bRecent = bCheckin > 0 && now - bCheckin >= 0 && now - bCheckin <= RECENT_CHECKIN_MS;

  if (aRecent !== bRecent) return bRecent ? 1 : -1;
  if (aRecent && aCheckin !== bCheckin) return bCheckin - aCheckin;

  const completenessDiff = placeCompleteness(b) - placeCompleteness(a);
  if (completenessDiff !== 0) return completenessDiff;

  // Tới đây hai chỗ đều không có xác nhận mới: xác nhận cũ vẫn hơn chưa từng có nếu mức đầy
  // đủ bằng nhau, rồi trong nhóm đó cái ít cũ hơn đứng trước.
  if ((aCheckin > 0) !== (bCheckin > 0)) return bCheckin > 0 ? 1 : -1;
  if (aCheckin !== bCheckin) return bCheckin - aCheckin;

  const updatedDiff = timestamp(b?.lastUpdatedAt) - timestamp(a?.lastUpdatedAt);
  if (updatedDiff !== 0) return updatedDiff;

  const confidenceDiff = numericValue(b?.confidenceScore) - numericValue(a?.confidenceScore);
  if (confidenceDiff !== 0) return confidenceDiff;

  const sourceDiff = numericValue(b?.sourceCount, 0) - numericValue(a?.sourceCount, 0);
  if (sourceDiff !== 0) return sourceDiff;

  return (a?.name ?? "").localeCompare(b?.name ?? "", "vi");
}
