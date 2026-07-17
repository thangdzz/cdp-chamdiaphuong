import crypto from "crypto";
import { getLivePlaces, setLivePlaces } from "../redis.js";
import { SOURCES } from "./sources/index.js";
import { normalizeRecord } from "./normalize.js";
import { matchAgainstExisting } from "./match.js";
import { candidateToLivePlace, applyDiffToLivePlace } from "./toLivePlace.js";
import {
  getReviewQueue,
  saveReviewQueue,
  appendReviewEvent,
  appendSourceRun,
  appendPlaceSnapshot,
} from "./store.js";
import { REVIEW_ITEM_TYPE, REVIEW_STATUS } from "./schema.js";

const LOW_CONFIDENCE_THRESHOLD = 0.5;
const NEEDS_REVIEW_THRESHOLD = 0.6;
const STALE_DAYS = 90;

// Loại nào vẫn phải qua người duyệt trước khi công khai — chỉ khi hệ thống thấy dữ liệu
// "trùng nhau"/mâu thuẫn (nghi trùng lặp, hoặc 2 nguồn khác nhau cùng lúc). Các loại còn
// lại (chỗ mới, có thay đổi, kể cả độ tin cậy thấp) tự động công khai luôn — quyết định
// 2026-07-15, xem DECISIONS.md.
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

/**
 * Chạy 1 lần quét toàn bộ nguồn đã cấu hình -> chuẩn hoá -> so khớp -> công khai luôn
 * (trừ khi nghi trùng lặp/mâu thuẫn thì vào review_queue chờ duyệt).
 *
 * @param {{ includeStaleScan?: boolean }} options
 */
export async function runDailyIngest(options = {}) {
  const runStartedAt = new Date().toISOString();
  const livePlaces = await getLivePlaces();
  const reviewQueue = await getReviewQueue();
  let livePlacesChanged = false;

  const summary = {
    sourcesRun: 0,
    recordsFetched: 0,
    newPlacesPublished: 0,
    changedPlacesApplied: 0,
    duplicateCandidatesForReview: 0,
    lowConfidencePublished: 0,
    updatedExistingPending: 0,
    skippedNoChange: 0,
    errors: 0,
  };

  for (const source of SOURCES) {
    const sourceRun = {
      id: newId("run"),
      sourceId: source.id,
      sourceType: source.type,
      startedAt: new Date().toISOString(),
      finishedAt: null,
      status: "ok",
      counts: { fetched: 0, new: 0, changed: 0, duplicate: 0, lowConfidence: 0, errors: 0 },
      errorMessage: null,
    };
    summary.sourcesRun++;

    let batches = [];
    try {
      batches = await source.fetch();
    } catch (err) {
      sourceRun.status = "error";
      sourceRun.errorMessage = String(err.message ?? err);
      sourceRun.finishedAt = new Date().toISOString();
      await appendSourceRun(sourceRun);
      summary.errors++;
      continue;
    }

    for (const batch of batches) {
      if (batch.error) {
        sourceRun.counts.errors++;
        summary.errors++;
        continue;
      }

      for (const raw of batch.records) {
        sourceRun.counts.fetched++;
        summary.recordsFetched++;

        const observedAt = new Date().toISOString();
        const candidate = normalizeRecord(raw, {
          sourceId: batch.sourceId,
          sourceType: batch.sourceType,
          observedAt,
        });

        if (candidate.confidence_score < NEEDS_REVIEW_THRESHOLD) {
          candidate.needs_review = true;
        }

        await appendPlaceSnapshot({
          placeKey: candidate.normalized_name,
          observedAt,
          sourceId: batch.sourceId,
          candidate,
        });

        // 1) Đã có mục CHỜ DUYỆT giống hệt (cùng tên + loại hình) -> cập nhật thay vì
        // tạo mục mới, tránh spam hàng đợi mỗi ngày với cùng 1 chỗ nghi trùng lặp.
        const existingPendingIndex = reviewQueue.findIndex((item) =>
          isSamePendingCandidate(item, candidate)
        );
        if (existingPendingIndex !== -1) {
          const existingItem = reviewQueue[existingPendingIndex];
          existingItem.candidate = candidate; // dữ liệu mới nhất
          existingItem.sources = [
            ...(existingItem.sources ?? []),
            { sourceId: batch.sourceId, sourceType: batch.sourceType, observedAt },
          ];
          existingItem.updatedAt = observedAt;
          reviewQueue[existingPendingIndex] = existingItem;
          summary.updatedExistingPending++;
          continue;
        }

        // 2) So khớp với dữ liệu đang công khai (livePlaces cập nhật ngay trong vòng lặp
        // này, để 2 nguồn cùng nhắc 1 chỗ mới trong cùng 1 lần chạy không bị đăng trùng)
        // + các mục đang chờ duyệt khác.
        const pendingCandidatesOnly = reviewQueue.filter(
          (i) => i.status === REVIEW_STATUS.PENDING
        );
        const match = matchAgainstExisting(candidate, livePlaces, pendingCandidatesOnly);

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
          // Công khai luôn — không qua review_queue.
          if (type === REVIEW_ITEM_TYPE.CHANGED_PLACE) {
            const idx = livePlaces.findIndex((p) => p.id === match.matchedLivePlaceId);
            if (idx !== -1) {
              livePlaces[idx] = applyDiffToLivePlace(livePlaces[idx], match.diff, { observedAt });
              livePlacesChanged = true;
              sourceRun.counts.changed++;
              summary.changedPlacesApplied++;
            }
          } else {
            // new_place hoặc low_confidence_place — đều công khai luôn theo quyết định
            // 2026-07-15. Độ tin cậy vẫn hiển thị cho khách thấy (không giấu), không phải
            // không hiển thị gì.
            const livePlace = candidateToLivePlace(candidate, { observedAt });
            livePlaces.push(livePlace);
            livePlacesChanged = true;
            if (type === REVIEW_ITEM_TYPE.LOW_CONFIDENCE_PLACE) {
              sourceRun.counts.lowConfidence++;
              summary.lowConfidencePublished++;
            } else {
              sourceRun.counts.new++;
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

        // Còn lại (nghi trùng lặp / mâu thuẫn) — vẫn phải qua review_queue chờ duyệt.
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
          sourceRunId: sourceRun.id,
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

        sourceRun.counts.duplicate++;
        summary.duplicateCandidatesForReview++;
      }
    }

    sourceRun.finishedAt = new Date().toISOString();
    await appendSourceRun(sourceRun);
  }

  if (options.includeStaleScan) {
    const staleCount = await runStaleScan(livePlaces, reviewQueue);
    summary.staleFlagged = staleCount;
  }

  await saveReviewQueue(reviewQueue);
  if (livePlacesChanged) {
    await setLivePlaces(livePlaces);
  }

  return {
    runStartedAt,
    runFinishedAt: new Date().toISOString(),
    ...summary,
  };
}

// Quét places:live tìm chỗ lâu không được xác nhận lại (không có last_checked_at, hoặc
// đã quá STALE_DAYS). Tắt mặc định (options.includeStaleScan) vì lần chạy đầu tiên sẽ
// gắn cờ TOÀN BỘ dữ liệu cũ (chưa từng có last_checked_at) — cần bật có chủ đích.
// Việc gỡ 1 chỗ khỏi công khai vẫn luôn cần người duyệt xác nhận (không tự động xoá).
async function runStaleScan(livePlaces, reviewQueue) {
  const now = Date.now();
  let flagged = 0;

  for (const place of livePlaces) {
    const alreadyQueued = reviewQueue.some(
      (i) =>
        i.type === REVIEW_ITEM_TYPE.STALE_PLACE &&
        i.matchedLivePlaceId === place.id &&
        i.status === REVIEW_STATUS.PENDING
    );
    if (alreadyQueued) continue;

    const lastChecked = place.lastCheckedAt ? new Date(place.lastCheckedAt).getTime() : null;
    const isStale = !lastChecked || now - lastChecked > STALE_DAYS * 24 * 60 * 60 * 1000;
    if (!isStale) continue;

    const observedAt = new Date().toISOString();
    reviewQueue.push({
      id: newId("review"),
      type: REVIEW_ITEM_TYPE.STALE_PLACE,
      status: REVIEW_STATUS.PENDING,
      candidate: null,
      matchedLivePlaceId: place.id,
      duplicateOfCandidates: [],
      diff: [],
      confidence_score: 0.3,
      needs_review: true,
      reasons: [
        lastChecked
          ? `Chưa xác nhận lại hơn ${STALE_DAYS} ngày`
          : "Chưa từng có ngày xác nhận (last_checked_at)",
      ],
      sources: [],
      sourceRunId: null,
      createdAt: observedAt,
      updatedAt: observedAt,
    });
    flagged++;
  }

  return flagged;
}
