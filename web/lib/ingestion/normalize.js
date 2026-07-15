import { AREA_PRESETS, ACTIVITY_STATUS, AVAILABILITY_SIGNAL, SOURCE_WEIGHT } from "./schema.js";

export function stripDiacritics(text) {
  return text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D");
}

export function slugifyName(name) {
  return stripDiacritics(name || "")
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function normalizePhone(phone) {
  if (!phone) return null;
  const digits = phone.replace(/\D/g, "");
  if (digits.length < 8) return null;
  // So khớp theo 8-9 số cuối, vì số bàn có thể có/không mã vùng "0273".
  return digits.slice(-9);
}

function detectAreaPreset(addressText) {
  if (!addressText) return null;
  const found = AREA_PRESETS.find((preset) =>
    addressText.toLowerCase().includes(preset.toLowerCase())
  );
  return found ?? null;
}

/**
 * Chuyển 1 bản ghi thô từ nguồn (tuỳ format từng adapter) thành NormalizedPlace.
 * @param {object} raw - bản ghi thô, tối thiểu cần { name, category_primary }.
 * @param {object} sourceMeta - { sourceId, sourceType, observedAt }
 * @returns {import("./schema").NormalizedPlace}
 */
export function normalizeRecord(raw, sourceMeta) {
  const name = (raw.name ?? "").trim();
  const addressText = raw.address_text?.trim() || null;
  const phone = raw.phone?.trim() || null;

  const missingAddress = !addressText;
  const missingPhone = !phone;

  let confidence = SOURCE_WEIGHT[sourceMeta.sourceType] ?? SOURCE_WEIGHT.unknown;
  const reasons = [];

  if (missingAddress) {
    confidence -= 0.25;
    reasons.push("Thiếu địa chỉ");
  }
  if (missingPhone) {
    confidence -= 0.1;
    reasons.push("Thiếu số điện thoại");
  }
  if (!name) {
    confidence -= 0.4;
    reasons.push("Thiếu tên");
  }

  confidence = Math.max(0, Math.min(1, Number(confidence.toFixed(2))));

  return {
    name,
    normalized_name: slugifyName(name),
    category_primary: raw.category_primary === "an" ? "an" : "ngu",
    address_text: addressText,
    area_preset: detectAreaPreset(addressText),
    near_landmark: raw.near_landmark?.trim() || null,
    phone,
    opening_hours_text: raw.opening_hours_text?.trim() || null,
    price_range_text: raw.price_range_text?.trim() || null,
    map_note: raw.map_note?.trim() || null,
    source_summary: `${sourceMeta.sourceId} (${sourceMeta.observedAt})`,
    activity_status: ACTIVITY_STATUS.UNKNOWN, // chưa có tín hiệu xác nhận hoạt động
    availability_signal: AVAILABILITY_SIGNAL.UNKNOWN, // không tự khẳng định còn/hết chỗ
    confidence_score: confidence,
    needs_review: true, // mọi bản ghi mới từ ingestion đều qua review, không auto publish
    _reasons: reasons,
    _sourceMeta: sourceMeta,
  };
}
