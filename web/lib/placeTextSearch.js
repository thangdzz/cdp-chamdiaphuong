// Tìm địa điểm theo chữ gõ vào — DÙNG CHUNG cho bộ lọc ở trang chủ (PlaceExplorer) và cho
// PlacePicker (chọn địa điểm khi tạo/sửa lộ trình). Tách ra khỏi PlaceExplorer.js từ
// 2026-09-11 để 2 nơi không trôi lệch nhau: gõ "cafe" ở trang chủ ra 12 chỗ mà trong bộ chọn
// lộ trình ra 3 chỗ thì khách tưởng web hỏng (NOTE-07 §3 "không tạo logic trùng").

import { stripDiacritics } from "./ingestion/normalize.js";

// Nhóm từ đồng nghĩa — gõ 1 trong các từ này đều ra kết quả như nhau. Đã qua stripDiacritics
// + lowercase nên viết không dấu (VD "cà phê" -> "ca phe").
const SEARCH_SYNONYM_GROUPS = [
  ["cafe", "coffee", "ca phe", "caphe"],
  ["khach san", "hotel"],
  ["nha nghi", "motel", "nha tro", "guesthouse"],
  ["nha hang", "restaurant", "quan an"],
  ["an sang", "breakfast"],
  ["an trua", "lunch"],
  ["an toi", "dinner"],
];

function expandSearchWord(word) {
  const group = SEARCH_SYNONYM_GROUPS.find((g) =>
    g.some((term) => term.startsWith(word) || word.startsWith(term))
  );
  return group ? [word, ...group] : [word];
}

/**
 * Khớp từng từ trong ô tìm kiếm với một chuỗi đã chuẩn hoá — mỗi từ phải khớp (đúng chữ hoặc
 * 1 từ đồng nghĩa của nó), cho phép gõ nhiều từ cùng lúc (VD "cafe minh xuan").
 * @param {string} haystack đã qua normalizeForSearch()
 * @param {string} query đã qua normalizeForSearch()
 */
export function matchesSearchQuery(haystack, query) {
  const words = query.split(/\s+/).filter(Boolean);
  if (words.length === 0) return true;
  return words.every((word) => expandSearchWord(word).some((alt) => haystack.includes(alt)));
}

/** Bỏ dấu + viết thường, để so khớp không phụ thuộc gõ có dấu hay không. */
export function normalizeForSearch(text) {
  return stripDiacritics(text ?? "").toLowerCase();
}

/** Chuỗi đem đi so khớp của một địa điểm — gộp tên, địa chỉ, khu và phường. */
export function placeSearchHaystack(place) {
  return normalizeForSearch(
    [place.name, place.address, place.localArea, place.ward].filter(Boolean).join(" ")
  );
}
