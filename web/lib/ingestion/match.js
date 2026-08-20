import { slugifyName, normalizePhone } from "./normalize.js";
import { REVIEW_ITEM_TYPE } from "./schema.js";

// So khớp chuỗi rất đơn giản (không thêm thư viện ngoài) — đủ dùng cho vài chục địa
// điểm. Nếu sau này nhiều dữ liệu hơn, thay bằng thư viện fuzzy-match chuyên dụng.
function nameSimilarity(a, b) {
  if (!a || !b) return 0;
  if (a === b) return 1;
  if (a.includes(b) || b.includes(a)) return 0.8;

  const setA = new Set(a.split(" "));
  const setB = new Set(b.split(" "));
  const overlap = [...setA].filter((w) => setB.has(w)).length;
  const union = new Set([...setA, ...setB]).size;
  return union === 0 ? 0 : overlap / union;
}

function addressSimilarity(a, b) {
  if (!a || !b) return 0;
  const na = slugifyName(a);
  const nb = slugifyName(b);
  if (na === nb) return 1;
  if (na.includes(nb) || nb.includes(na)) return 0.7;
  return 0;
}

/**
 * So khớp 1 NormalizedPlace với danh sách địa điểm hiện có (đang public + đang trong
 * review_queue) để quyết định loại review item.
 *
 * @param {import("./schema").NormalizedPlace} candidate
 * @param {Array} existingPlaces - places:live hiện tại (đã có id)
 * @param {Array} pendingReviewCandidates - review_queue hiện tại (chưa duyệt)
 * @param {Array} confirmedDistinctPairs - cặp {a,b} (id place:live) đã được người duyệt
 *   xác nhận là 2 chỗ khác nhau — không so khớp chéo giữa 2 chỗ này nữa.
 * @returns {{ type: string, matchedLivePlaceId: string|null, duplicateOfCandidates: string[], reasons: string[] }}
 */
export function matchAgainstExisting(
  candidate,
  existingPlaces,
  pendingReviewCandidates,
  confirmedDistinctPairs = []
) {
  const reasons = [];
  const candidatePhone = normalizePhone(candidate.phone);

  let bestMatch = null;
  let bestScore = 0;

  for (const existing of existingPlaces) {
    if (existing.type !== candidate.category_primary) continue;

    // Nếu tên ứng viên rõ ràng gần với 1 chỗ ĐÃ được xác nhận khác với "existing" —
    // bỏ qua existing, tránh so khớp chéo nhầm 2 chỗ đã biết là khác nhau.
    const excludedAsConfirmedDistinct = confirmedDistinctPairs.some((pair) => {
      if (pair.a !== existing.id && pair.b !== existing.id) return false;
      const otherId = pair.a === existing.id ? pair.b : pair.a;
      const other = existingPlaces.find((p) => p.id === otherId);
      if (!other) return false;
      return nameSimilarity(candidate.normalized_name, slugifyName(other.name)) >= 0.5;
    });
    if (excludedAsConfirmedDistinct) continue;

    const nameScore = nameSimilarity(candidate.normalized_name, slugifyName(existing.name));
    const addrScore = addressSimilarity(candidate.address_text, existing.address);
    const phoneMatch =
      candidatePhone && normalizePhone(existing.phone) === candidatePhone && !!candidatePhone;

    const score = phoneMatch ? 1 : Math.max(nameScore, (nameScore + addrScore) / 2);

    if (score > bestScore) {
      bestScore = score;
      bestMatch = { existing, nameScore, addrScore, phoneMatch };
    }
  }

  // Ngưỡng theo kiểu MVP, dễ chỉnh sau khi thấy dữ liệu thật:
  // >=0.9  -> coi là cùng 1 chỗ (kiểm tra xem có gì đổi không)
  // 0.55-0.9 -> nghi ngờ trùng, để người duyệt quyết định
  // <0.55  -> coi là chỗ mới
  if (bestMatch && bestScore >= 0.9) {
    const diff = computeDiff(candidate, bestMatch.existing);
    if (diff.length > 0) {
      reasons.push(`Khớp với "${bestMatch.existing.name}" nhưng có ${diff.length} trường khác nhau`);
      return {
        type: REVIEW_ITEM_TYPE.CHANGED_PLACE,
        matchedLivePlaceId: bestMatch.existing.id,
        duplicateOfCandidates: [],
        diff,
        reasons,
      };
    }
    reasons.push("Khớp với dữ liệu đang công khai, không có gì thay đổi — bỏ qua");
    return {
      type: null, // không cần tạo review item
      matchedLivePlaceId: bestMatch.existing.id,
      duplicateOfCandidates: [],
      diff: [],
      reasons,
    };
  }

  if (bestMatch && bestScore >= 0.55) {
    reasons.push(
      `Giống "${bestMatch.existing.name}" (điểm khớp ${bestScore.toFixed(2)}) — có thể trùng lặp`
    );
    return {
      type: REVIEW_ITEM_TYPE.DUPLICATE_CANDIDATE,
      matchedLivePlaceId: null,
      duplicateOfCandidates: [bestMatch.existing.id],
      diff: [],
      reasons,
    };
  }

  // Kiểm tra trùng với các review item CHỜ DUYỆT khác trong cùng lần quét (2 nguồn
  // cùng nhắc tới 1 chỗ mới, chưa có trong places:live).
  for (const pending of pendingReviewCandidates) {
    const score = nameSimilarity(candidate.normalized_name, pending.candidate?.normalized_name);
    if (score >= 0.8) {
      reasons.push(`Trùng với mục đang chờ duyệt "${pending.candidate?.name}"`);
      return {
        type: REVIEW_ITEM_TYPE.DUPLICATE_CANDIDATE,
        matchedLivePlaceId: null,
        duplicateOfCandidates: [pending.id],
        diff: [],
        reasons,
      };
    }
  }

  reasons.push("Không khớp với dữ liệu hiện có — có thể là địa điểm mới");
  return {
    type: REVIEW_ITEM_TYPE.NEW_PLACE,
    matchedLivePlaceId: null,
    duplicateOfCandidates: [],
    diff: [],
    reasons,
  };
}

function computeDiff(candidate, existing) {
  const fields = [
    ["address_text", "address"],
    ["phone", "phone"],
    ["price_range_text", "priceText"],
  ];
  const diff = [];
  for (const [candidateField, existingField] of fields) {
    const newValue = candidate[candidateField];
    const oldValue = existing[existingField];
    if (newValue && newValue !== oldValue) {
      diff.push({ field: existingField, oldValue: oldValue ?? null, newValue });
    }
  }

  // Món đặc trưng: mảng, không so sánh bằng !== được. Chỉ báo thay đổi khi ứng viên CÓ món
  // và khác nội dung đã lưu — quét lại mỗi ngày không tự nhiên báo "thay đổi" khi cả 2 bên
  // đều rỗng, hoặc khi ứng viên không tìm thấy món (không có nghĩa là chỗ đó hết món).
  const newDishes = candidate.signature_dishes;
  if (newDishes?.length) {
    const oldDishes = existing.signatureDishes ?? [];
    if (JSON.stringify(newDishes) !== JSON.stringify(oldDishes)) {
      diff.push({ field: "signatureDishes", oldValue: existing.signatureDishes ?? null, newValue: newDishes });
    }
  }

  return diff;
}
