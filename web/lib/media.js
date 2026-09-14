const VALID_ROLES = new Set([
  "general",
  "cover",
  "navigation",
  "entrance",
  "parking",
  "menu",
  "interior",
]);

export const MEDIA_ROLES = [
  { id: "general", label: "Ảnh thường" },
  { id: "entrance", label: "Lối vào / mặt tiền" },
  { id: "parking", label: "Bãi đỗ" },
  { id: "menu", label: "Menu" },
  { id: "interior", label: "Không gian bên trong" },
];

export const SPECIAL_MEDIA_ROLES = ["cover", "navigation"];

function textOrNull(value) {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function positiveNumberOrNull(value) {
  const number = Number(value);
  return Number.isFinite(number) && number > 0 ? number : null;
}

function stableHash(value) {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index++) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(36);
}

export function mediaStorageKeyFromUrl(url) {
  try {
    const parsed = new URL(url);
    if (!parsed.hostname.endsWith(".public.blob.vercel-storage.com")) return null;
    return decodeURIComponent(parsed.pathname.replace(/^\//, ""));
  } catch {
    return null;
  }
}

function normalizeRoles(item, fallbackRole) {
  const values = Array.isArray(item?.roles)
    ? item.roles
    : item?.role
      ? [item.role]
      : fallbackRole
        ? [fallbackRole]
        : [];
  const roles = [...new Set(values.filter((role) => VALID_ROLES.has(role)))];
  if (!roles.some((role) => !SPECIAL_MEDIA_ROLES.includes(role))) roles.unshift("general");
  return roles;
}

export function normalizeMediaItem(value, options = {}) {
  const object = typeof value === "string" ? { url: value } : value;
  const url = textOrNull(object?.url);
  if (!url) return null;
  const roles = normalizeRoles(object, options.fallbackRole);
  if (options.coverUrl === url && !roles.includes("cover")) roles.push("cover");

  return {
    id: textOrNull(object?.id) ?? `legacy-${stableHash(url)}`,
    storageKey: textOrNull(object?.storageKey) ?? mediaStorageKeyFromUrl(url),
    url,
    width: positiveNumberOrNull(object?.width),
    height: positiveNumberOrNull(object?.height),
    bytes: positiveNumberOrNull(object?.bytes),
    mimeType: textOrNull(object?.mimeType),
    caption: textOrNull(object?.caption),
    order: Number.isFinite(Number(object?.order)) ? Number(object.order) : (options.order ?? 0),
    roles,
    source: textOrNull(object?.source) ?? options.source ?? "legacy",
    uploadedAt: textOrNull(object?.uploadedAt) ?? textOrNull(options.uploadedAt),
    uploadedBy: textOrNull(object?.uploadedBy),
    providerMeta:
      object?.providerMeta && typeof object.providerMeta === "object" ? object.providerMeta : null,
  };
}

function dedupeAndSort(items) {
  const byUrl = new Map();
  for (const item of items.filter(Boolean)) {
    const previous = byUrl.get(item.url);
    if (!previous) {
      byUrl.set(item.url, item);
      continue;
    }
    byUrl.set(item.url, {
      ...previous,
      ...item,
      roles: [...new Set([...previous.roles, ...item.roles])],
      uploadedAt: previous.uploadedAt ?? item.uploadedAt,
    });
  }
  return [...byUrl.values()]
    .sort((a, b) => a.order - b.order || a.id.localeCompare(b.id))
    .map((item, order) => ({ ...item, order }));
}

// Chỉ chuẩn hoá trong bộ nhớ. Nơi đọc dữ liệu cũ không được vô tình ghi lại toàn bộ
// places:live theo schema mới; chỉ action sửa media của đúng một place mới gọi withPlaceMedia().
export function placeMedia(place) {
  if (!place) return [];
  if (Array.isArray(place.media)) {
    return dedupeAndSort(place.media.map((item, order) => normalizeMediaItem(item, { order })));
  }

  const legacy = [];
  for (const [order, photo] of (place.photos ?? []).entries()) {
    legacy.push(
      normalizeMediaItem(photo, {
        order,
        fallbackRole: "general",
        coverUrl: place.coverPhoto,
      }),
    );
  }
  for (const [index, photo] of (place.menuPhotos ?? []).entries()) {
    legacy.push(
      normalizeMediaItem(photo, {
        order: legacy.length + index,
        fallbackRole: "menu",
        coverUrl: place.coverPhoto,
        uploadedAt: photo?.addedAt,
      }),
    );
  }
  return dedupeAndSort(legacy);
}

export function withPlaceMedia(place, media) {
  const next = { ...place, media: dedupeAndSort(media.map((item, order) => normalizeMediaItem(item, { order }))) };
  delete next.photos;
  delete next.menuPhotos;
  delete next.coverPhoto;
  return next;
}

export function mediaHasRole(item, role) {
  return item?.roles?.includes(role) ?? false;
}

export function placeGeneralMedia(place) {
  return placeMedia(place).filter((item) => !mediaHasRole(item, "menu"));
}

export function placeMenuMedia(place) {
  return placeMedia(place).filter((item) => mediaHasRole(item, "menu"));
}

export function placeCoverMedia(place) {
  const media = placeMedia(place);
  return media.find((item) => mediaHasRole(item, "cover")) ?? media[0] ?? null;
}

export function placeNavigationMedia(place) {
  const media = placeMedia(place);
  return (
    media.find((item) => mediaHasRole(item, "navigation")) ??
    media.find((item) => mediaHasRole(item, "entrance")) ??
    media.find((item) => mediaHasRole(item, "cover")) ??
    media[0] ??
    null
  );
}

export function normalizeEditableMedia(media) {
  const normalized = dedupeAndSort(media.map((item, order) => normalizeMediaItem(item, { order })));
  for (const specialRole of SPECIAL_MEDIA_ROLES) {
    let found = false;
    for (const item of normalized) {
      if (!mediaHasRole(item, specialRole)) continue;
      if (!found) found = true;
      else item.roles = item.roles.filter((role) => role !== specialRole);
    }
  }
  return normalized;
}

export function mergeMediaSets(...places) {
  return dedupeAndSort(places.flatMap((place) => placeMedia(place)));
}
