import crypto from "crypto";
import { getLivePlaces } from "../redis.js";
import { SOURCES } from "./sources/index.js";
import { ingestBatch } from "./ingestBatch.js";
import { appendSourceRun, getReviewQueue, saveReviewQueue } from "./store.js";
import { REVIEW_ITEM_TYPE, REVIEW_STATUS } from "./schema.js";

const STALE_DAYS = 90;

function newId(prefix) {
  return `${prefix}-${crypto.randomUUID()}`;
}

function addSummary(total, part) {
  for (const key of Object.keys(part)) {
    total[key] = (total[key] ?? 0) + part[key];
  }
}

/**
 * Chạy 1 lần quét toàn bộ nguồn đã cấu hình (SOURCES) -> chuẩn hoá -> so khớp -> công khai
 * luôn (trừ khi nghi trùng lặp/mâu thuẫn thì vào review_queue chờ duyệt).
 * Dùng chung logic xử lý bản ghi với route API nộp bài trực tiếp — xem `ingestBatch.js`.
 *
 * @param {{ includeStaleScan?: boolean }} options
 */
export async function runDailyIngest(options = {}) {
  const runStartedAt = new Date().toISOString();

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
      counts: {},
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
        summary.errors++;
        continue;
      }
      const batchSummary = await ingestBatch(batch);
      addSummary(summary, batchSummary);
      addSummary(sourceRun.counts, batchSummary);
    }

    sourceRun.finishedAt = new Date().toISOString();
    await appendSourceRun(sourceRun);
  }

  if (options.includeStaleScan) {
    summary.staleFlagged = await runStaleScan();
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
async function runStaleScan() {
  const livePlaces = await getLivePlaces();
  const reviewQueue = await getReviewQueue();
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

  await saveReviewQueue(reviewQueue);
  return flagged;
}
