import crypto from "crypto";
import { parsePriceRangeText, formatPriceText } from "../priceFormat.js";

// Map 1 candidate (shape ingestion) sang shape place:live đang dùng trong app.
// Giá: cố gắng tách số từ price_range_text để dùng chung hệ thống định dạng đã có
// (tránh lặp lại lỗi "priceText tự do không đúng định dạng" đã gặp trước đây).
export function candidateToLivePlace(candidate) {
  const parsed = parsePriceRangeText(candidate.price_range_text);
  const priceMin = parsed?.priceMin ?? null;
  const priceMax = parsed?.priceMax ?? null;
  const priceUnit = parsed?.priceUnit ?? null;

  return {
    id: `live-${crypto.randomUUID()}`,
    name: candidate.name,
    type: candidate.category_primary,
    address: candidate.address_text ?? "",
    ward: candidate.area_preset ?? null,
    priceMin,
    priceMax,
    priceUnit,
    priceText: formatPriceText({ priceMin, priceMax, priceUnit }),
  };
}

// Áp 1 diff (field/newValue) lên place:live đã có. Nếu field là priceText, tách lại
// số/đơn vị để giữ đúng định dạng chuẩn thay vì chép nguyên chuỗi tự do.
export function applyDiffToLivePlace(place, diff) {
  const updated = { ...place };
  for (const { field, newValue } of diff) {
    if (field === "priceText") {
      const parsed = parsePriceRangeText(newValue);
      updated.priceMin = parsed?.priceMin ?? updated.priceMin;
      updated.priceMax = parsed?.priceMax ?? updated.priceMax;
      updated.priceUnit = parsed?.priceUnit ?? updated.priceUnit;
      updated.priceText = formatPriceText({
        priceMin: updated.priceMin,
        priceMax: updated.priceMax,
        priceUnit: updated.priceUnit,
      });
    } else {
      updated[field] = newValue;
    }
  }
  return updated;
}
