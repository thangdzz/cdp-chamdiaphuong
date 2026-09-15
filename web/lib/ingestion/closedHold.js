// NOTE-13 + NOTE-14 §4: một lượt công khai KHÔNG đi qua crawler (Chờ duyệt nhập tay, đề xuất của
// khách) mà trùng hồ sơ đã đóng thì không công khai — dựng một closed_place_match trong hàng chờ tự
// động, nơi DUY NHẤT có sẵn "Mở lại địa điểm cũ" (giữ ID) và "Tạo địa điểm mới thay thế".

import crypto from "crypto";
import { getReviewQueue, saveReviewQueue, appendReviewEvent } from "./store.js";
import { REVIEW_ITEM_TYPE, REVIEW_STATUS } from "./schema.js";
import { slugifyName } from "./normalize.js";

/** place: dạng places:live/proposal. closedHit: kết quả matchPlaceAgainstClosedPlaces. */
export async function queueClosedHistoryHold(place, closedHit, { sourceId, note }) {
  const now = new Date().toISOString();
  const reviewQueue = await getReviewQueue();
  const existing = reviewQueue.find(
    (item) =>
      item.status === REVIEW_STATUS.PENDING &&
      item.type === REVIEW_ITEM_TYPE.CLOSED_PLACE_MATCH &&
      item.matchedClosedPlaceId === closedHit.matchedClosedPlaceId &&
      item.candidate?.normalized_name === slugifyName(place.name),
  );
  if (existing) return existing;

  const item = {
    id: `review-${crypto.randomUUID()}`,
    type: REVIEW_ITEM_TYPE.CLOSED_PLACE_MATCH,
    status: REVIEW_STATUS.PENDING,
    candidate: {
      name: place.name,
      normalized_name: slugifyName(place.name),
      category_primary: place.type,
      address_text: place.address || null,
      area_preset: place.ward ?? null,
      phone: place.phone ?? null,
      price_range_text: place.priceText ?? null,
      coordinates: place.coordinates ?? null,
      confidence_score: 0,
    },
    matchedLivePlaceId: null,
    matchedClosedPlaceId: closedHit.matchedClosedPlaceId,
    duplicateOfCandidates: [],
    diff: closedHit.diff ?? [],
    confidence_score: 0,
    needs_review: true,
    reasons: [note, ...closedHit.reasons],
    sources: [{ sourceId, sourceType: "admin_publish_guard", observedAt: now }],
    sourceRunId: null,
    createdAt: now,
    updatedAt: now,
  };
  reviewQueue.push(item);
  await saveReviewQueue(reviewQueue);
  await appendReviewEvent({ id: `event-${crypto.randomUUID()}`, itemId: item.id, action: "created", note, at: now });
  return item;
}
