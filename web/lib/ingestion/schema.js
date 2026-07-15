// Định nghĩa "shape" dữ liệu tối thiểu cho pipeline quét dữ liệu hằng ngày.
// Không dùng TypeScript trong dự án này -> để dạng hằng số + JSDoc cho rõ ràng.

export const REVIEW_ITEM_TYPE = {
  NEW_PLACE: "new_place",
  CHANGED_PLACE: "changed_place",
  CONFLICT_DETECTED: "conflict_detected",
  DUPLICATE_CANDIDATE: "duplicate_candidate",
  STALE_PLACE: "stale_place",
  LOW_CONFIDENCE_PLACE: "low_confidence_place",
};

export const REVIEW_STATUS = {
  PENDING: "pending",
  APPROVED: "approved",
  REJECTED: "rejected",
  MERGED: "merged", // đã gộp vào 1 place khác (trường hợp duplicate_candidate)
  DISMISSED: "dismissed", // xem rồi, không cần làm gì (vd stale_place chấp nhận được)
};

export const ACTIVITY_STATUS = {
  ACTIVE: "active",
  UNKNOWN: "unknown",
  STALE: "stale", // lâu không có tín hiệu mới
  CLOSED_SUSPECTED: "closed_suspected",
};

export const AVAILABILITY_SIGNAL = {
  LIKELY_AVAILABLE: "likely_available",
  LIKELY_BUSY: "likely_busy",
  UNKNOWN: "unknown",
};

// Khu vực (phường) đã biết trong app hiện tại — dùng để chuẩn hoá address_text về 1 preset.
// Khớp với các phường đã xuất hiện trong web/data/places.json.
export const AREA_PRESETS = [
  "Tân Quang",
  "Minh Xuân",
  "Phan Thiết",
  "Hưng Thành",
  "Hà Giang 1", // xuất hiện trong bài viết lễ hội, chừa sẵn
];

// Trọng số tin cậy theo loại nguồn — cơ sở để tính confidence_score.
// "manual_inbox" = nguồn công khai được thả vào thư mục ingestion-inbox (JSON), coi như
// tương đương "trang tổng hợp/web du lịch" cho tới khi có nguồn cụ thể hơn.
export const SOURCE_WEIGHT = {
  official_gov: 0.9,
  booking_platform: 0.75, // Traveloka, Agoda, Booking.com...
  manual_inbox: 0.55,
  screenshot_ocr: 0.4, // để sẵn cho sau này, chưa dùng
  unknown: 0.4,
};

/**
 * @typedef {Object} NormalizedPlace
 * @property {string} name
 * @property {string} normalized_name
 * @property {"an"|"ngu"} category_primary
 * @property {string|null} address_text
 * @property {string|null} area_preset
 * @property {string|null} near_landmark
 * @property {string|null} phone
 * @property {string|null} opening_hours_text
 * @property {string|null} price_range_text
 * @property {string|null} map_note
 * @property {string} source_summary
 * @property {string} activity_status
 * @property {string} availability_signal
 * @property {number} confidence_score
 * @property {boolean} needs_review
 */
