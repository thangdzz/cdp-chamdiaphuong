import { stripDiacritics } from "./ingestion/normalize.js";

function nameSimilarity(a, b) {
  const na = stripDiacritics(a ?? "").toLowerCase().trim();
  const nb = stripDiacritics(b ?? "").toLowerCase().trim();
  if (!na || !nb) return 0;
  if (na === nb) return 1;
  if (na.includes(nb) || nb.includes(na)) return 0.8;
  const wordsA = new Set(na.split(/\s+/).filter(Boolean));
  const wordsB = new Set(nb.split(/\s+/).filter(Boolean));
  const intersection = [...wordsA].filter((w) => wordsB.has(w)).length;
  const union = new Set([...wordsA, ...wordsB]).size;
  return union === 0 ? 0 : intersection / union;
}

// Dò tên gần giống trong places:live — dùng cho công cụ gộp trùng lặp ở /admin. Khách báo
// trùng chỉ gõ tên tự do (không chọn từ danh sách), nên cần dò gần đúng thay vì khớp tuyệt
// đối. Không dùng chung logic với lib/ingestion/match.js vì đó là so khớp NormalizedPlace
// (dữ liệu quét thô), khác dữ liệu places:live đã công khai ở đây.
export function findSimilarPlaces(query, places, excludeId) {
  return places
    .filter((p) => p.id !== excludeId)
    .map((p) => ({ place: p, score: nameSimilarity(query, p.name) }))
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 5);
}
