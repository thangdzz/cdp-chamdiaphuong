// Hàng chờ góp ý từ khách (báo sai / bổ sung ảnh) — tách riêng khỏi review_queue của AI
// quét dữ liệu, vì đây là góp ý CỦA NGƯỜI DÙNG THẬT cho 1 chỗ ĐÃ công khai, không phải
// ứng viên dữ liệu mới từ nguồn quét. Duyệt riêng trong /admin, mục "Góp ý từ khách".

import { redis } from "./redis.js";

const SUGGESTIONS_KEY = "user_suggestions";

export async function getSuggestions() {
  const data = await redis.get(SUGGESTIONS_KEY);
  return data ?? [];
}

export async function saveSuggestions(list) {
  await redis.set(SUGGESTIONS_KEY, list);
}

export async function appendSuggestion(item) {
  const list = await getSuggestions();
  list.push(item);
  await saveSuggestions(list);
  return item;
}

function fieldsEqual(a, b) {
  const keys = new Set([...Object.keys(a ?? {}), ...Object.keys(b ?? {})]);
  for (const key of keys) {
    if ((a?.[key] ?? null) !== (b?.[key] ?? null)) return false;
  }
  return true;
}

// Chỉ tính là "trùng" nếu bản cũ còn đang chờ hoặc đã được duyệt — bản `rejected` không chặn
// gửi lại nữa. Trước đây so trên TOÀN BỘ danh sách không lọc status, nên góp ý đã xử lý xong
// từ lâu vẫn chặn người dùng vĩnh viễn, trong khi admin không còn thấy gì trong hàng chờ để
// xử lý (lỗi thật phát hiện 2026-08-21, xem STATUS.md).
const BLOCKING_STATUSES = new Set(["pending", "approved"]);

// Chặn cùng 1 người gửi ĐÚNG y hệt 1 nội dung sửa cho cùng 1 chỗ lần nữa (để ăn điểm) — vẫn
// cho góp ý thêm về cùng chỗ đó nếu nội dung khác (field khác, hoặc thêm field mới).
export async function findDuplicateCorrection(contributorId, placeId, fields, note) {
  const list = await getSuggestions();
  return list.find(
    (s) =>
      s.type === "correction" &&
      s.contributorId === contributorId &&
      s.placeId === placeId &&
      fieldsEqual(s.fields, fields) &&
      (s.note ?? null) === (note ?? null) &&
      BLOCKING_STATUSES.has(s.status)
  );
}

// Chặn gửi lại ĐÚNG 1 file ảnh (so theo mã băm nội dung) cho cùng 1 chỗ — ảnh khác (dù cùng
// chỗ) vẫn tính bình thường.
export async function findDuplicatePhoto(contributorId, placeId, contentHash) {
  const list = await getSuggestions();
  return list.find(
    (s) =>
      s.type === "photo" &&
      s.contributorId === contributorId &&
      s.placeId === placeId &&
      s.contentHash === contentHash &&
      BLOCKING_STATUSES.has(s.status)
  );
}
