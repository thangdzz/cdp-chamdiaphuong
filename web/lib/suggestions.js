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
