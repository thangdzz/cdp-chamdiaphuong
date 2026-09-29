// Xếp hạng kết quả tìm kiếm cho trang /tim (owner test 30/9: tìm "Phở" ra "Xe ghép Anh Huy" đầu).
//
// Nguyên nhân gốc: tìm kiếm cũ bỏ dấu rồi so CHUỖI CON trên cả tên + địa chỉ, và kết quả chỉ xếp
// theo độ tin cậy. "phở" bỏ dấu thành "pho" → khớp "phố" trong "Thành phố Tuyên Quang" ở địa chỉ
// của hầu hết mọi chỗ → chỗ nào đáng tin nhất lên đầu, bất kể tên là gì.
//
// Luật mới (Product Owner chốt): tên trùng khớp > tên chứa > nhóm/thẻ > địa chỉ > phần phụ.
//   - So theo ĐẦU TỪ, không so chuỗi con giữa từ.
//   - Gõ CÓ dấu thì khớp đúng dấu mới được hạng của trường đó; chỉ khớp khi bỏ dấu ("phở" với
//     "phố") thì bị đẩy xuống dưới cùng — vẫn hiện, nhưng không bao giờ đứng trên chỗ khớp đúng.
//   - Gõ KHÔNG dấu ("pho") thì không đoán được ý, mọi cách viết đều khớp như nhau.
// Hàm thuần — test ở tests/placeRank.test.js.

import { expandSearchWord, normalizeForSearch } from "./placeTextSearch.js";
import { getPlaceTypeLabel } from "./placeTypes.js";
import { transportSummary } from "./transport.js";

const TIER = { EXACT_NAME: 1000, NAME_PREFIX: 850, NAME_PHRASE: 750, NAME_WORDS: 650, CATEGORY: 450, ADDRESS: 250, SECONDARY: 100 };
// Chỉ khớp khi bỏ dấu dù khách gõ có dấu: tụt hẳn xuống dưới mọi kết quả khớp đúng.
const LOOSE_PENALTY = 900;

/** Viết thường, giữ dấu, gom mọi dấu câu thành một khoảng trắng. */
function accented(text) {
  return (text ?? "")
    .toString()
    .normalize("NFC")
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .trim();
}

/** Viết thường, bỏ dấu, gom dấu câu. */
function plain(text) {
  return normalizeForSearch(text).replace(/[^a-z0-9]+/g, " ").trim();
}

/** `word` đứng ở ĐẦU một từ trong `text` (cả hai đã chuẩn hoá cùng kiểu). */
function hasWordAt(text, word) {
  return word !== "" && ` ${text}`.includes(` ${word}`);
}

/** Các nhóm chữ của một địa điểm, theo thứ tự ưu tiên. Nhận cả bản ghi đầy đủ lẫn bản gọn /tim. */
function fieldsOf(place) {
  return {
    name: [place.name, ...(place.searchAliases ?? [])].filter(Boolean),
    category: [
      place.typeLabel ?? getPlaceTypeLabel(place.type),
      place.categoryText ?? transportSummary(place),
      ...(place.signatureDishes ?? []),
    ].filter(Boolean),
    address: [place.address, place.localArea, place.ward].filter(Boolean),
    secondary: [place.note].filter(Boolean),
  };
}

function prepare(texts) {
  return texts.map((t) => ({ a: accented(t), p: plain(t) }));
}

/**
 * Một từ khách gõ có khớp nhóm chữ này không.
 * strict: gõ có dấu thì phải khớp đúng dấu; gõ không dấu thì khớp bản bỏ dấu (kể cả từ đồng nghĩa).
 */
function wordMatches(fields, word, strict) {
  return fields.some((f) => {
    if (strict && word.hasAccent) return hasWordAt(f.a, word.a);
    return word.alts.some((alt) => hasWordAt(f.p, alt));
  });
}

function tierOf(groups, words, phrase, strict) {
  const name = groups.name;
  const same = (f) => (strict && phrase.hasAccent ? f.a === phrase.a : f.p === phrase.p);
  const starts = (f) => (strict && phrase.hasAccent ? f.a.startsWith(phrase.a) : f.p.startsWith(phrase.p));
  const phraseIn = (f) => (strict && phrase.hasAccent ? hasWordAt(f.a, phrase.a) : hasWordAt(f.p, phrase.p));

  if (name.some(same)) return TIER.EXACT_NAME;
  if (name.some(starts)) return TIER.NAME_PREFIX;
  if (name.some(phraseIn)) return TIER.NAME_PHRASE;

  const levels = [
    [TIER.NAME_WORDS, [...name]],
    [TIER.CATEGORY, [...name, ...groups.category]],
    [TIER.ADDRESS, [...name, ...groups.category, ...groups.address]],
    [TIER.SECONDARY, [...name, ...groups.category, ...groups.address, ...groups.secondary]],
  ];
  for (const [tier, fields] of levels) {
    if (words.every((w) => wordMatches(fields, w, strict))) return tier;
  }
  return null;
}

/** Chuẩn bị câu tìm một lần cho cả danh sách. `null` nếu ô tìm trống. */
export function parseQuery(query) {
  const a = accented(query);
  const p = plain(query);
  if (!p) return null;
  const aWords = a.split(" ");
  const words = p.split(" ").map((w, i) => ({
    a: aWords[i] ?? w,
    p: w,
    hasAccent: (aWords[i] ?? w) !== w,
    alts: expandSearchWord(w),
  }));
  return { phrase: { a, p, hasAccent: a !== p }, words };
}

/**
 * Điểm liên quan của một chỗ với câu tìm (càng cao càng lên đầu). `null` = không khớp, loại.
 * @param {object} place bản ghi đầy đủ hoặc bản gọn /tim
 * @param {ReturnType<typeof parseQuery>} parsed
 */
export function relevanceScore(place, parsed) {
  if (!parsed) return 0;
  const f = fieldsOf(place);
  const groups = {
    name: prepare(f.name),
    category: prepare(f.category),
    address: prepare(f.address),
    secondary: prepare(f.secondary),
  };
  const strict = tierOf(groups, parsed.words, parsed.phrase, true);
  if (strict !== null) return strict;
  const loose = tierOf(groups, parsed.words, parsed.phrase, false);
  return loose === null ? null : loose - LOOSE_PENALTY;
}

/**
 * Lọc + xếp theo mức liên quan. Cùng điểm thì GIỮ thứ tự đầu vào (đầu vào đã xếp theo độ tin
 * cậy), nên trong cùng một hạng, chỗ có người xác nhận gần đây vẫn lên trước.
 */
export function rankBySearch(places, query) {
  const parsed = parseQuery(query);
  if (!parsed) return places;
  return places
    .map((place, index) => ({ place, index, score: relevanceScore(place, parsed) }))
    .filter((r) => r.score !== null)
    .sort((x, y) => y.score - x.score || x.index - y.index)
    .map((r) => r.place);
}
