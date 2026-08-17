import crypto from "crypto";
import { getLivePlaces, setLivePlaces } from "../redis.js";
import { normalizeRecord } from "./normalize.js";
import { matchAgainstExisting } from "./match.js";
import { candidateToLivePlace, applyDiffToLivePlace } from "./toLivePlace.js";
import {
  getReviewQueue,
  saveReviewQueue,
  appendReviewEvent,
  appendPlaceSnapshot,
  getConfirmedDistinctPairs,
} from "./store.js";
import { REVIEW_ITEM_TYPE, REVIEW_STATUS } from "./schema.js";
import { InvalidPlaceTypeError } from "../placeTypes.js";

const LOW_CONFIDENCE_THRESHOLD = 0.5;
const NEEDS_REVIEW_THRESHOLD = 0.6;

// Loại nào vẫn phải qua người duyệt — chỉ khi nghi trùng lặp/mâu thuẫn (xem DECISIONS.md
// 2026-07-17). Dùng chung bởi runDailyIngest.js (nguồn cấu hình sẵn) và route API nộp bài
// trực tiếp (app/api/ingest/submit) — cùng 1 logic, không lặp code.
const GATED_TYPES = new Set([
  REVIEW_ITEM_TYPE.DUPLICATE_CANDIDATE,
  REVIEW_ITEM_TYPE.CONFLICT_DETECTED,
]);

function newId(prefix) {
  return `${prefix}-${crypto.randomUUID()}`;
}

function isSamePendingCandidate(item, candidate) {
  return (
    item.status === REVIEW_STATUS.PENDING &&
    item.candidate?.normalized_name === candidate.normalized_name &&
    item.candidate?.category_primary === candidate.category_primary
  );
}

// 2 trường quan trọng nhất để nhận ra 1 chỗ — nếu 2 nguồn cho giá trị khác nhau (đều có
// giá trị, không phải thiếu), coi là mâu thuẫn cần người xem lại, không tự ý ghi đè.
const CONFLICT_FIELDS = ["address_text", "phone"];

// Gộp candidate mới vào candidate cũ đang chờ duyệt: điền field còn thiếu, giữ nguyên
// field đã có nếu 2 bên khớp nhau; field trong CONFLICT_FIELDS mà 2 bên khác nhau thì
// KHÔNG ghi đè âm thầm — trả về trong `conflicts` để hiển thị cho người duyệt tự chọn.
function mergeCandidate(oldCandidate, newCandidate) {
  const conflicts = [];
  const merged = { ...oldCandidate };

  for (const key of Object.keys(newCandidate)) {
    if (key.startsWith("_")) continue;
    const newValue = newCandidate[key];
    if (newValue === null || newValue === undefined || newValue === "") continue;

    const oldValue = oldCandidate[key];
    if (oldValue === null || oldValue === undefined || oldValue === "") {
      merged[key] = newValue;
      continue;
    }
    if (oldValue === newValue) continue;

    if (CONFLICT_FIELDS.includes(key)) {
      conflicts.push({ field: key, oldValue, newValue });
    } else {
      merged[key] = newValue;
    }
  }

  return { merged, conflicts };
}

/**
 * Xử lý 1 lô bản ghi thô (từ 1 nguồn) -> chuẩn hoá -> so khớp -> tự công khai hoặc vào
 * hàng chờ duyệt. Tự đọc/ghi places:live + review_queue mới nhất mỗi lần gọi (an toàn khi
 * gọi từ nhiều nơi khác nhau — cron nội bộ, hoặc API nộp bài từ phiên AI đặt lịch).
 *
 * @param {{ sourceId: string, sourceType: string, records: object[] }} batch
 */
export async function ingestBatch(batch) {
  const livePlaces = await getLivePlaces();
  const reviewQueue = await getReviewQueue();
  const confirmedDistinctPairs = await getConfirmedDistinctPairs();
  let livePlacesChanged = false;

  const summary = {
    recordsFetched: 0,
    newPlacesPublished: 0,
    changedPlacesApplied: 0,
    duplicateCandidatesForReview: 0,
    lowConfidencePublished: 0,
    updatedExistingPending: 0,
    skippedNoChange: 0,
    skippedInvalidType: 0,
  };

  for (const raw of batch.records) {
    summary.recordsFetched++;
    const observedAt = new Date().toISOString();

    let candidate;
    try {
      candidate = normalizeRecord(raw, {
        sourceId: batch.sourceId,
        sourceType: batch.sourceType,
        observedAt,
      });
    } catch (err) {
      // Loại địa điểm sai (SPEC-chang-3.md §2) không được âm thầm quy về "ngu" — nhưng cũng
      // không để 1 bản ghi hỏng làm hỏng cả lô quét (routine hằng ngày gửi nhiều chỗ/lần).
      // Bỏ qua đúng bản ghi này, các bản ghi khác trong lô vẫn xử lý bình thường.
      if (err instanceof InvalidPlaceTypeError) {
        summary.skippedInvalidType++;
        continue;
      }
      throw err;
    }

    if (candidate.confidence_score < NEEDS_REVIEW_THRESHOLD) {
      candidate.needs_review = true;
    }

    await appendPlaceSnapshot({
      placeKey: candidate.normalized_name,
      observedAt,
      sourceId: batch.sourceId,
      candidate,
    });

    const existingPendingIndex = reviewQueue.findIndex((item) =>
      isSamePendingCandidate(item, candidate)
    );
    if (existingPendingIndex !== -1) {
      const existingItem = reviewQueue[existingPendingIndex];
      const { merged, conflicts } = mergeCandidate(existingItem.candidate, candidate);
      existingItem.candidate = merged;
      existingItem.sources = [
        ...(existingItem.sources ?? []),
        { sourceId: batch.sourceId, sourceType: batch.sourceType, observedAt },
      ];
      existingItem.updatedAt = observedAt;

      if (conflicts.length > 0) {
        existingItem.conflicts = [...(existingItem.conflicts ?? []), ...conflicts];
        existingItem.needs_review = true;
      }

      reviewQueue[existingPendingIndex] = existingItem;
      summary.updatedExistingPending++;
      continue;
    }

    const pendingCandidatesOnly = reviewQueue.filter((i) => i.status === REVIEW_STATUS.PENDING);
    const match = matchAgainstExisting(candidate, livePlaces, pendingCandidatesOnly, confirmedDistinctPairs);

    if (match.type === null) {
      summary.skippedNoChange++;
      continue;
    }

    let type = match.type;
    if (type === REVIEW_ITEM_TYPE.NEW_PLACE && candidate.confidence_score < LOW_CONFIDENCE_THRESHOLD) {
      type = REVIEW_ITEM_TYPE.LOW_CONFIDENCE_PLACE;
    }

    const reasons = [...(candidate._reasons ?? []), ...(match.reasons ?? [])];
    delete candidate._reasons;
    delete candidate._sourceMeta;

    if (!GATED_TYPES.has(type)) {
      if (type === REVIEW_ITEM_TYPE.CHANGED_PLACE) {
        const idx = livePlaces.findIndex((p) => p.id === match.matchedLivePlaceId);
        if (idx !== -1) {
          livePlaces[idx] = applyDiffToLivePlace(livePlaces[idx], match.diff, { observedAt });
          livePlacesChanged = true;
          summary.changedPlacesApplied++;
        }
      } else {
        livePlaces.push(candidateToLivePlace(candidate, { observedAt }));
        livePlacesChanged = true;
        if (type === REVIEW_ITEM_TYPE.LOW_CONFIDENCE_PLACE) {
          summary.lowConfidencePublished++;
        } else {
          summary.newPlacesPublished++;
        }
      }

      await appendReviewEvent({
        id: newId("event"),
        itemId: null,
        action: "auto_published",
        note: `${candidate.name} (${type}) từ ${batch.sourceId}: ${reasons.join("; ")}`,
        at: observedAt,
      });
      continue;
    }

    const item = {
      id: newId("review"),
      type,
      status: REVIEW_STATUS.PENDING,
      candidate,
      matchedLivePlaceId: match.matchedLivePlaceId,
      duplicateOfCandidates: match.duplicateOfCandidates ?? [],
      diff: match.diff ?? [],
      confidence_score: candidate.confidence_score,
      needs_review: true,
      reasons,
      sources: [{ sourceId: batch.sourceId, sourceType: batch.sourceType, observedAt }],
      sourceRunId: null,
      createdAt: observedAt,
      updatedAt: observedAt,
    };

    reviewQueue.push(item);
    await appendReviewEvent({
      id: newId("event"),
      itemId: item.id,
      action: "created",
      note: `Tạo từ ${batch.sourceId}: ${item.reasons.join("; ")}`,
      at: observedAt,
    });
    summary.duplicateCandidatesForReview++;
  }

  await saveReviewQueue(reviewQueue);
  if (livePlacesChanged) {
    await setLivePlaces(livePlaces);
  }

  return summary;
}
