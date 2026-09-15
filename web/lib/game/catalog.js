// Primitive "Object" của game layer (NOTE-03 §2.3, NOTE-04 §13). Một object là thứ có thể
// tìm/gặp/sưu tầm trong một Event — mô hình đèn Trung thu hôm nay, sạp chợ phiên hay cây hoa
// mùa sau. File này THUẦN (không đọc Redis) để client và server dùng chung một cách hiểu dữ liệu.

export const OBJECT_KIND = {
  MODEL: "model",
  // Người chơi gặp nhưng không biết tên (NOTE-04 §16). Vẫn là object thật, có id riêng, để
  // nhiều người báo cùng một "bí ẩn" và admin ghép vào model đúng về sau.
  UNKNOWN: "unknown",
};

export const VERIFICATION_STATUSES = [
  "unverified",
  "community_verified",
  "admin_verified",
  "official_verified",
];

export const VERIFICATION_LABEL = {
  unverified: "Chưa xác minh",
  community_verified: "Cộng đồng xác nhận",
  admin_verified: "CDP đã xác minh",
  official_verified: "Nguồn chính thức",
};

export const UNKNOWN_ICON = "❓";
const DEFAULT_ICON = "🏮";

// Tên hiển thị khi thiếu tên (NOTE-04 §13 "Fallback"). Không bao giờ để UI hiện chuỗi rỗng.
export function objectDisplayName(object, noun = "mô hình") {
  if (object?.name) return object.name;
  if (object?.kind === OBJECT_KIND.UNKNOWN) {
    return `${capitalize(noun)} chưa biết tên${object.code ? ` #${object.code}` : ""}`;
  }
  return `${capitalize(noun)} chưa xác định`;
}

const DEFAULT_TINT = "#fbf3e6";

// Icon của object là một KHOÁ tra trong `event.iconSet` (NOTE-05 §12, §22): { glyph, badge?, tint? }
// — glyph là hình chính, badge là hình phụ nhỏ ở góc để phân biệt các mô hình cùng con vật (rồng
// LED vs rồng cuốn nước). Không có khoá hợp lệ thì: icon tự do (emoji admin gõ) → icon nhóm →
// đèn lồng. Không bao giờ trả rỗng.
export function objectIconSpec(object, event) {
  const category = event?.categories?.find((c) => c.id === object?.category);
  const tint = category?.tint ?? DEFAULT_TINT;
  if (object?.kind === OBJECT_KIND.UNKNOWN && !object?.icon) {
    return { glyph: UNKNOWN_ICON, badge: null, tint: DEFAULT_TINT };
  }
  const fromSet = object?.icon ? event?.iconSet?.[object.icon] : null;
  if (fromSet) return { glyph: fromSet.glyph, badge: fromSet.badge ?? null, tint: fromSet.tint ?? tint };
  if (object?.icon && !/^[a-z0-9-]+$/.test(object.icon)) return { glyph: object.icon, badge: null, tint };
  return { glyph: category?.icon ?? DEFAULT_ICON, badge: null, tint };
}

// Chuỗi ngắn cho chỗ chỉ hiện được chữ (admin, nhãn marker).
export function objectIcon(object, event) {
  const spec = objectIconSpec(object, event);
  return spec.badge ? `${spec.glyph}${spec.badge}` : spec.glyph;
}

function cleanSlugList(value, max = 12) {
  const list = Array.isArray(value) ? value : typeof value === "string" ? value.split(",") : [];
  return [...new Set(list.map((item) => String(item).trim().toLowerCase()).filter((item) => /^[a-z0-9_-]{1,32}$/.test(item)))].slice(0, max);
}

function capitalize(text) {
  return text ? text.charAt(0).toUpperCase() + text.slice(1) : text;
}

function cleanText(value, max = 200) {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed ? trimmed.slice(0, max) : null;
}

// Dữ liệu seed, admin nhập và object do người chơi sinh ra đều đi qua đây. Thiếu trường nào
// thì để null — UI tự ẩn dòng đó, không vỡ (NOTE-04 §13).
export function normalizeObject(raw, eventId) {
  if (!raw || typeof raw !== "object" || typeof raw.id !== "string") return null;
  const kind = raw.kind === OBJECT_KIND.UNKNOWN ? OBJECT_KIND.UNKNOWN : OBJECT_KIND.MODEL;
  return {
    id: raw.id,
    eventId: raw.eventId ?? eventId,
    kind,
    code: cleanText(raw.code, 12),
    name: cleanText(raw.name, 80),
    slug: cleanText(raw.slug, 80),
    icon: cleanText(raw.icon, 40),
    // Tag sinh bộ sưu tập theo nhóm; soundFamily/soundKey chọn âm thanh mở khoá (NOTE-05 §22).
    tags: cleanSlugList(raw.tags),
    soundFamily: cleanText(raw.soundFamily, 32),
    soundKey: cleanText(raw.soundKey, 40),
    photoUrl: cleanText(raw.photoUrl, 500),
    category: cleanText(raw.category, 40),
    ward: cleanText(raw.ward, 60),
    neighborhood: cleanText(raw.neighborhood, 80),
    description: cleanText(raw.description, 400),
    story: cleanText(raw.story, 800),
    hint: cleanText(raw.hint, 120),
    eventYear: Number.isInteger(raw.eventYear) ? raw.eventYear : null,
    verificationStatus: VERIFICATION_STATUSES.includes(raw.verificationStatus)
      ? raw.verificationStatus
      : "unverified",
    // Object đã được ghép vào object khác (unknown -> model, hoặc 2 model trùng). Sighting cũ
    // KHÔNG bị ghi lại; mọi chỗ đọc tự đi theo con trỏ này (AGENTS §3.6 "suy ra lúc đọc").
    matchedTo: cleanText(raw.matchedTo, 80),
    hidden: raw.hidden === true,
    source: cleanText(raw.source, 60),
    createdAt: cleanText(raw.createdAt, 40),
    updatedAt: cleanText(raw.updatedAt, 40),
  };
}

// Seed trong code là lớp nền; bản ghi trong Redis cùng id sẽ ghi đè từng trường (admin sửa tên
// hay gắn ảnh không cần deploy). Object chỉ có trong Redis (unknown, admin thêm) nối vào sau.
export function mergeCatalog(seedObjects, storedObjects, eventId) {
  const byId = new Map();
  for (const seed of seedObjects ?? []) {
    const normalized = normalizeObject(seed, eventId);
    if (normalized) byId.set(normalized.id, normalized);
  }
  for (const stored of Object.values(storedObjects ?? {})) {
    const base = byId.get(stored?.id);
    const normalized = normalizeObject(base ? { ...base, ...stored } : stored, eventId);
    if (normalized) byId.set(normalized.id, normalized);
  }
  return [...byId.values()];
}

export function catalogIndex(catalog) {
  return new Map(catalog.map((object) => [object.id, object]));
}

// Đi theo chuỗi matchedTo tới object cuối. Chặn vòng lặp và con trỏ hỏng: gặp là dừng ở object
// cuối cùng còn hợp lệ thay vì làm mất sighting.
export function resolveObjectId(id, index) {
  let current = id;
  const seen = new Set();
  while (current && !seen.has(current)) {
    seen.add(current);
    const next = index.get(current)?.matchedTo;
    if (!next || !index.has(next)) return current;
    current = next;
  }
  return current;
}

export function aliasesOf(objectId, catalog, index) {
  return catalog
    .filter((object) => resolveObjectId(object.id, index) === objectId)
    .map((object) => object.id);
}

// "Tổng số đã biết" (NOTE-03 §1 "Bộ sưu tập của tôi"): model có tên, chưa bị ghép đi, không ẩn.
export function knownModels(catalog) {
  return catalog.filter(
    (object) => object.kind === OBJECT_KIND.MODEL && !object.matchedTo && !object.hidden
  );
}

export function openMysteries(catalog) {
  return catalog.filter(
    (object) => object.kind === OBJECT_KIND.UNKNOWN && !object.matchedTo && !object.hidden
  );
}
