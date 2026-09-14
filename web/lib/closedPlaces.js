import { redis } from "./redis.js";
import { getSuggestions } from "./suggestions.js";
import { getReviewQueue } from "./ingestion/store.js";

// Hash để URL cũ đọc đúng một field thay vì tải toàn bộ kho đã đóng. `places:live` vẫn là
// danh sách public; archive này chỉ giữ tombstone và dữ liệu cũ để không biến URL thành 404.
export function closedPlacesKey() {
  const namespace = process.env.CDP_CLOSED_PLACES_NAMESPACE?.trim();
  const key = "places:closed";
  return namespace ? `${namespace}:${key}` : key;
}

function byNewest(a, b) {
  return new Date(b.closedAt ?? 0) - new Date(a.closedAt ?? 0);
}

function legacySuggestionTombstone(item) {
  return {
    id: item.placeId,
    name: item.placeName || "Địa điểm đã đóng cửa",
    type: null,
    address: null,
    ward: null,
    localArea: null,
    closed: true,
    closedAt: item.updatedAt ?? item.createdAt ?? null,
    closedSource: "user_suggestion_legacy",
    closedSourceId: item.id,
    legacyTombstone: true,
    replacedByPlaceId: null,
  };
}

function legacyReviewTombstone(item) {
  return {
    id: item.matchedLivePlaceId,
    name: item.candidate?.name || "Địa điểm đã đóng cửa",
    type: item.candidate?.category_primary ?? null,
    address: item.candidate?.address_text ?? null,
    ward: item.candidate?.area_preset ?? null,
    localArea: null,
    closed: true,
    closedAt: item.updatedAt ?? item.createdAt ?? null,
    closedSource: "stale_review_legacy",
    closedSourceId: item.id,
    legacyTombstone: true,
    replacedByPlaceId: null,
  };
}

async function getLegacyClosedPlaces() {
  // Test namespace phải hoàn toàn tách khỏi lịch sử production.
  if (process.env.CDP_CLOSED_PLACES_NAMESPACE?.trim()) return [];
  const [suggestions, reviewItems] = await Promise.all([getSuggestions(), getReviewQueue()]);
  const records = [
    ...suggestions
      .filter((item) => item.status === "approved" && item.type === "correction" && item.fields?.closed)
      .map(legacySuggestionTombstone),
    ...reviewItems
      .filter(
        (item) =>
          item.status === "rejected" &&
          item.type === "stale_place" &&
          item.matchedLivePlaceId,
      )
      .map(legacyReviewTombstone),
  ];

  // Có thể một chỗ được báo đóng cửa nhiều lần; bản mới nhất thắng nhưng không tạo bản sao.
  return [...new Map(records.sort(byNewest).map((record) => [record.id, record])).values()];
}

export async function getClosedPlaceLifecycleRecord(placeId) {
  if (!placeId) return null;
  const stored = await redis.hget(closedPlacesKey(), placeId);
  if (stored) return stored;
  const legacy = await getLegacyClosedPlaces();
  return legacy.find((place) => place.id === placeId) ?? null;
}

export async function getClosedPlace(placeId) {
  const stored = await getClosedPlaceLifecycleRecord(placeId);
  // Bản override `closed: false` giữ lịch sử mở lại và đồng thời chặn fallback legacy khỏi
  // biến URL thành "đã đóng" lần nữa. Không xoá record lịch sử khi mở lại (NOTE-13 §8).
  return stored?.closed === false ? null : stored;
}

export async function getAllClosedPlaces() {
  const [storedById, legacy] = await Promise.all([
    redis.hgetall(closedPlacesKey()),
    getLegacyClosedPlaces(),
  ]);
  const combined = new Map(legacy.map((place) => [place.id, place]));
  for (const place of Object.values(storedById ?? {})) combined.set(place.id, place);
  return [...combined.values()].filter((place) => place.closed !== false).sort(byNewest);
}

export async function archiveClosedPlace(place, { source, sourceId } = {}) {
  if (!place?.id) return null;
  const existing = await redis.hget(closedPlacesKey(), place.id);
  const now = new Date().toISOString();
  const wasAlreadyClosed = existing?.closed === true;
  const record = {
    ...place,
    closed: true,
    status: "closed",
    // Gọi lại archive cho cùng một lần đóng thì không đổi ngày; nếu địa điểm đã từng mở lại
    // rồi đóng lần nữa, mốc đóng mới phải phản ánh vòng đời mới.
    closedAt: wasAlreadyClosed ? existing.closedAt : now,
    closedSource: source ?? existing?.closedSource ?? null,
    closedSourceId: sourceId ?? existing?.closedSourceId ?? null,
    replacedByPlaceId: existing?.replacedByPlaceId ?? place.replacedByPlaceId ?? null,
    lifecycleHistory: [
      ...(existing?.lifecycleHistory ?? []),
      ...(!wasAlreadyClosed ? [{ status: "closed", at: now, source: source ?? null, sourceId: sourceId ?? null }] : []),
    ],
  };
  await redis.hset(closedPlacesKey(), { [place.id]: record });
  return record;
}

export async function recordClosedPlaceCrawlMatch(placeId, { matchedAt, sourceId } = {}) {
  const place = await getClosedPlace(placeId);
  if (!place) return false;
  await redis.hset(closedPlacesKey(), {
    [placeId]: {
      ...place,
      lastCrawlMatchAt: matchedAt ?? new Date().toISOString(),
      lastCrawlMatchSourceId: sourceId ?? null,
    },
  });
  return true;
}

export async function markClosedPlaceReopened(
  placeId,
  { reopenedAt, reopenedBy = "admin", reviewItemId = null } = {},
) {
  const place = await getClosedPlaceLifecycleRecord(placeId);
  if (!place) return null;
  // Retry sau lỗi mạng giữa nhiều lệnh không được thêm lặp sự kiện mở lại.
  if (place.closed === false) return place;
  const at = reopenedAt ?? new Date().toISOString();
  const record = {
    ...place,
    closed: false,
    status: "active",
    reopenedAt: at,
    reopenedBy,
    reopenedReviewItemId: reviewItemId,
    lifecycleHistory: [
      ...(place.lifecycleHistory ?? []),
      { status: "active", at, source: reopenedBy, sourceId: reviewItemId },
    ],
  };
  await redis.hset(closedPlacesKey(), { [placeId]: record });
  return record;
}

export async function setClosedPlaceReplacement(placeId, replacementPlaceId) {
  const place = await getClosedPlace(placeId);
  if (!place) return false;
  await redis.hset(closedPlacesKey(), {
    [placeId]: {
      ...place,
      replacedByPlaceId: replacementPlaceId,
      replacementLinkedAt: new Date().toISOString(),
    },
  });
  return true;
}

export function replacementLocationOf(place) {
  if (!place) return { ward: null, address: null, localArea: null, coordinates: null };
  const coordinates = place.coordinates ?? (
    Number.isFinite(place.lat) && Number.isFinite(place.lng)
      ? { lat: place.lat, lng: place.lng }
      : Number.isFinite(place.latitude) && Number.isFinite(place.longitude)
        ? { lat: place.latitude, lng: place.longitude }
        : null
  );
  return {
    ward: place.ward ?? null,
    address: place.address ?? null,
    localArea: place.localArea ?? null,
    coordinates,
  };
}
