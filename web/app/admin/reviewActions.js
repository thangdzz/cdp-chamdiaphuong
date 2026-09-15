"use server";

import crypto from "crypto";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { ADMIN_COOKIE_NAME, verifySessionToken } from "@/lib/adminAuth";
import { getLivePlaces, setLivePlaces } from "@/lib/redis";
import {
  getReviewQueue,
  saveReviewQueue,
  appendReviewEvent,
  appendConfirmedDistinctPair,
} from "@/lib/ingestion/store";
import { REVIEW_ITEM_TYPE, REVIEW_STATUS } from "@/lib/ingestion/schema";
import { placeFromFormData } from "@/lib/placeForm";
import { resolveStaleReferences } from "@/lib/ingestion/resolveStaleReferences";
import {
  archiveClosedPlace,
  getClosedPlace,
  getClosedPlaceLifecycleRecord,
  markClosedPlaceReopened,
  replacementLocationOf,
} from "@/lib/closedPlaces";
import { candidateToLivePlace } from "@/lib/ingestion/toLivePlace";
import { createProposal, getProposalQueue } from "@/lib/proposals";
import { matchPlaceAgainstClosedPlaces } from "@/lib/ingestion/match";
import { slugifyName } from "@/lib/ingestion/normalize";
import { getAllClosedPlaces } from "@/lib/closedPlaces";
import { appendSuggestion } from "@/lib/suggestions";
import { coordinatesOf } from "@/lib/coordinates";

async function requireAdmin() {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_COOKIE_NAME)?.value;
  if (!verifySessionToken(token)) {
    throw new Error("Chưa đăng nhập hoặc phiên đã hết hạn");
  }
}

// Ý nghĩa cụ thể của "duyệt"/"từ chối" tuỳ theo loại review item — xem
// REVIEW_ACTION_LABELS ở page.js để biết nút bấm hiển thị chữ gì cho từng loại.
// Với new_place/changed_place/low_confidence_place, dùng đúng dữ liệu anh đã SỬA trên form
// (không dùng lại dữ liệu thô AI tìm được) — cho phép chỉnh trước khi duyệt, không cần
// duyệt xong rồi kéo xuống mục "Đang công khai" sửa lại.
// Place sắp công khai từ một review item: dữ liệu Admin đã sửa trên form + toạ độ/metadata nguồn
// (form không có 2 thứ này — NOTE-14 §7, §19).
function publishablePlaceFrom(item, formData) {
  return {
    ...placeFromFormData(formData),
    coordinates: item.candidate?.coordinates ?? null,
    ...(item.candidate?.provider_meta ? { providerMeta: item.candidate.provider_meta } : {}),
  };
}

// NOTE-13 + NOTE-14 §4: guard lịch sử đóng cửa cho mọi lượt công khai từ hàng chờ. Khớp thì KHÔNG
// công khai — item chuyển thành closed_place_match (đã có sẵn nút Mở lại / Tạo thay thế) và vẫn chờ.
async function holdIfClosedHistory(item, place) {
  const closedHit = matchPlaceAgainstClosedPlaces(place, await getAllClosedPlaces());
  if (!closedHit) return false;
  item.type = REVIEW_ITEM_TYPE.CLOSED_PLACE_MATCH;
  item.matchedClosedPlaceId = closedHit.matchedClosedPlaceId;
  item.diff = closedHit.diff;
  item.candidate = {
    ...item.candidate,
    name: place.name,
    category_primary: place.type,
    address_text: place.address,
    area_preset: place.ward,
  };
  item.reasons = [
    ...(item.reasons ?? []),
    ...closedHit.reasons.filter((reason) => !(item.reasons ?? []).includes(reason)),
  ];
  return true;
}

async function applyDecision(id, decision, formData) {
  await requireAdmin();

  const reviewQueue = await getReviewQueue();
  const index = reviewQueue.findIndex((i) => i.id === id);
  if (index === -1) return;
  const item = reviewQueue[index];

  // Chỗ thật (nếu có) mà mục này kết thúc thành — dùng để vá lại các mục KHÁC đang chờ
  // duyệt mà lỡ nghi trùng với chính mục này (xem resolveStaleReferences.js).
  let resultingLiveId = null;

  if (decision === "approve") {
    if (
      (item.type === REVIEW_ITEM_TYPE.NEW_PLACE || item.type === REVIEW_ITEM_TYPE.LOW_CONFIDENCE_PLACE) &&
      (await holdIfClosedHistory(item, publishablePlaceFrom(item, formData)))
    ) {
      // Giữ nguyên status pending; lưu type mới ở cuối hàm.
    } else if (item.type === REVIEW_ITEM_TYPE.NEW_PLACE || item.type === REVIEW_ITEM_TYPE.LOW_CONFIDENCE_PLACE) {
      const newId = `live-${crypto.randomUUID()}`;
      resultingLiveId = newId;
      const livePlaces = await getLivePlaces();
      livePlaces.push({ id: newId, ...publishablePlaceFrom(item, formData) });
      await setLivePlaces(livePlaces);
      item.status = REVIEW_STATUS.APPROVED;

      // Nếu chỗ này từng bị nghi trùng rồi anh xác nhận "không trùng" — nhớ lại cặp
      // (chỗ vừa đăng, chỗ đã nghi nhầm) để lần quét sau không hỏi lại nữa.
      if (item.confirmedNotDuplicateOf?.length) {
        for (const otherId of item.confirmedNotDuplicateOf) {
          await appendConfirmedDistinctPair({
            a: newId,
            b: otherId,
            decidedAt: new Date().toISOString(),
          });
        }
      }
    } else if (item.type === REVIEW_ITEM_TYPE.CHANGED_PLACE) {
      const edited = placeFromFormData(formData);
      const livePlaces = await getLivePlaces();
      const next = livePlaces.map((p) =>
        p.id === item.matchedLivePlaceId
          ? {
              ...p,
              ...edited,
              id: p.id,
              // Toạ độ nguồn chỉ điền khi chỗ đang công khai chưa có (NOTE-14 §7).
              coordinates: coordinatesOf(p) ? p.coordinates : item.candidate?.coordinates ?? null,
            }
          : p
      );
      await setLivePlaces(next);
      item.status = REVIEW_STATUS.APPROVED;
      resultingLiveId = item.matchedLivePlaceId ?? null;
    } else if (item.type === REVIEW_ITEM_TYPE.STALE_PLACE) {
      // "Duyệt" ở đây nghĩa là "đã kiểm tra, vẫn hoạt động" — chỉ cập nhật mốc thời gian.
      const livePlaces = await getLivePlaces();
      const next = livePlaces.map((p) =>
        p.id === item.matchedLivePlaceId ? { ...p, lastCheckedAt: new Date().toISOString() } : p
      );
      await setLivePlaces(next);
      item.status = REVIEW_STATUS.DISMISSED;
      resultingLiveId = item.matchedLivePlaceId ?? null;
    } else if (item.type === REVIEW_ITEM_TYPE.DUPLICATE_CANDIDATE) {
      // "Duyệt" = xác nhận đúng là trùng lặp -> không đăng, đánh dấu đã gộp.
      item.status = REVIEW_STATUS.MERGED;
    } else {
      // conflict_detected và các loại khác chưa có hành động tự động cụ thể — chỉ đóng lại.
      item.status = REVIEW_STATUS.DISMISSED;
    }
  } else if (item.type === REVIEW_ITEM_TYPE.STALE_PLACE) {
    // "Từ chối" ở đây nghĩa là đã đóng cửa. Giữ tombstone trước khi gỡ public để URL cũ
    // còn giải thích được chuyện gì xảy ra và sau này nối sang địa điểm thay thế.
    const livePlaces = await getLivePlaces();
    const closedPlace = livePlaces.find((p) => p.id === item.matchedLivePlaceId);
    if (closedPlace) {
      await archiveClosedPlace(closedPlace, {
        source: "stale_review",
        sourceId: item.id,
      });
    }
    await setLivePlaces(livePlaces.filter((p) => p.id !== item.matchedLivePlaceId));
    item.status = REVIEW_STATUS.REJECTED;
  } else if (item.type === REVIEW_ITEM_TYPE.DUPLICATE_CANDIDATE) {
    // "Không trùng" — KHÔNG được xoá/ẩn dữ liệu chỉ vì nó không phải bản sao. Chuyển
    // thành "địa điểm mới" (giữ nguyên trong hàng chờ, dùng dữ liệu anh vừa sửa) để
    // duyệt tiếp như bình thường, thay vì tự ý loại bỏ.
    const edited = placeFromFormData(formData);
    item.type = REVIEW_ITEM_TYPE.NEW_PLACE;
    // Giữ lại chỗ vừa bị nghi trùng nhầm — dùng để đăng ký "2 chỗ khác nhau" khi duyệt
    // xong (xem nhánh approve NEW_PLACE ở trên), tránh hệ thống hỏi lại lần sau.
    item.confirmedNotDuplicateOf = [
      ...(item.confirmedNotDuplicateOf ?? []),
      ...item.duplicateOfCandidates,
    ];
    item.duplicateOfCandidates = [];
    item.candidate = {
      ...item.candidate,
      name: edited.name,
      category_primary: edited.type,
      address_text: edited.address,
      area_preset: edited.ward,
      price_range_text: edited.priceText,
    };
    item.reasons = ["Anh xác nhận không trùng lặp — chuyển thành địa điểm mới chờ duyệt"];
    // status giữ nguyên "pending", không bị coi là đã xử lý xong.
  } else {
    item.status = REVIEW_STATUS.REJECTED;
  }

  item.updatedAt = new Date().toISOString();
  reviewQueue[index] = item;

  if (item.status !== REVIEW_STATUS.PENDING) {
    resolveStaleReferences(reviewQueue, item.id, resultingLiveId);
  }

  await saveReviewQueue(reviewQueue);

  await appendReviewEvent({
    id: `event-${crypto.randomUUID()}`,
    itemId: item.id,
    action: item.status,
    note: `Xử lý qua /admin (${decision})`,
    at: item.updatedAt,
  });

  revalidatePath("/admin");
  revalidatePath("/");
  if (item.matchedLivePlaceId) revalidatePath(`/dia-diem/${item.matchedLivePlaceId}`);
}

export async function approveReviewItem(formData) {
  "use server";
  const id = formData.get("id")?.toString();
  await applyDecision(id, "approve", formData);
}

export async function rejectReviewItem(formData) {
  "use server";
  const id = formData.get("id")?.toString();
  await applyDecision(id, "reject", formData);
}

async function getPendingClosedMatch(id) {
  const reviewQueue = await getReviewQueue();
  const index = reviewQueue.findIndex((item) => item.id === id);
  const item = reviewQueue[index];
  if (
    index === -1 ||
    item?.status !== REVIEW_STATUS.PENDING ||
    item?.type !== REVIEW_ITEM_TYPE.CLOSED_PLACE_MATCH ||
    !item.matchedClosedPlaceId
  ) {
    return null;
  }
  return { reviewQueue, index, item };
}

async function finishClosedMatchReview({ reviewQueue, index, item, status, resolution, note }) {
  const at = new Date().toISOString();
  item.status = status;
  item.resolution = resolution;
  item.updatedAt = at;
  reviewQueue[index] = item;
  await saveReviewQueue(reviewQueue);
  await appendReviewEvent({
    id: `event-${crypto.randomUUID()}`,
    itemId: item.id,
    action: resolution,
    note,
    at,
  });
  revalidatePath("/admin");
  revalidatePath("/");
  revalidatePath(`/dia-diem/${item.matchedClosedPlaceId}`);
}

// NOTE-13: đây là action RIÊNG, không đi qua approveReviewItem. Nhờ vậy một closed match
// không thể bị nút generic hiểu thành new_place rồi tạo ID mới ngoài ý muốn.
export async function reopenClosedPlaceFromReview(formData) {
  await requireAdmin();
  const id = formData.get("id")?.toString();
  if (!id) return;
  const pending = await getPendingClosedMatch(id);
  if (!pending) return;

  const { reviewQueue, index, item } = pending;
  // Đọc cả override reopened để retry được nếu lần trước đã ghi live/archive nhưng lỗi trước
  // khi đóng review item. Public getter vẫn ẩn record `closed:false` như bình thường.
  const closedPlace = await getClosedPlaceLifecycleRecord(item.matchedClosedPlaceId);
  if (!closedPlace) return;

  const now = new Date().toISOString();
  const candidatePlace = candidateToLivePlace(item.candidate, {
    id: closedPlace.id,
    basePlace: closedPlace,
    observedAt: now,
    autoPublished: false,
  });
  const edited = placeFromFormData(formData);
  const reopenedPlace = {
    ...candidatePlace,
    id: closedPlace.id,
    // Review card chỉ cho sửa các field này. Không spread toàn `edited`: form không có
    // localArea/transport fields sẽ trả null/[] và làm mất dữ liệu cũ khi mở lại.
    name: edited.name,
    type: edited.type,
    address: edited.address,
    ward: edited.ward,
    priceMin: edited.priceMin,
    priceMax: edited.priceMax,
    priceUnit: edited.priceUnit,
    priceText: edited.priceText,
    closed: false,
    status: "active",
    reopenedAt: now,
    reopenedBy: "admin",
    lastCheckedAt: now,
  };

  const livePlaces = await getLivePlaces();
  const existingIndex = livePlaces.findIndex((place) => place.id === closedPlace.id);
  if (existingIndex === -1) livePlaces.push(reopenedPlace);
  else livePlaces[existingIndex] = reopenedPlace;
  await setLivePlaces(livePlaces);
  await markClosedPlaceReopened(closedPlace.id, {
    reopenedAt: now,
    reopenedBy: "admin",
    reviewItemId: item.id,
  });
  await finishClosedMatchReview({
    reviewQueue,
    index,
    item,
    status: REVIEW_STATUS.APPROVED,
    resolution: "reopened_closed_place",
    note: `Mở lại địa điểm cũ ${closedPlace.id}; giữ nguyên ID và lịch sử đóng cửa`,
  });
}

// Candidate là business mới ở vị trí cũ: chỉ tạo PROPOSAL chờ duyệt, không public thẳng.
export async function createReplacementFromClosedMatch(formData) {
  await requireAdmin();
  const id = formData.get("id")?.toString();
  if (!id) return;
  const pending = await getPendingClosedMatch(id);
  if (!pending) return;

  const { reviewQueue, index, item } = pending;
  const closedPlace = await getClosedPlace(item.matchedClosedPlaceId);
  if (!closedPlace) return;
  const edited = placeFromFormData(formData);
  const location = replacementLocationOf(closedPlace);
  const proposalQueue = await getProposalQueue();
  const existingProposal = proposalQueue.find(
    (proposal) =>
      proposal.replacesPlaceId === closedPlace.id &&
      proposal.name?.toLocaleLowerCase("vi") === edited.name.toLocaleLowerCase("vi"),
  );
  const result = existingProposal
    ? { ok: true, proposal: existingProposal }
    : await createProposal({
        contributorId: null,
        name: edited.name,
        type: edited.type,
        ward: edited.ward || location.ward,
        address: edited.address || location.address,
        localArea: location.localArea,
        coordinates: location.coordinates,
        note: null,
        replacesPlaceId: closedPlace.id,
        replacesPlaceName: closedPlace.name,
      });
  if (!result.ok) return result;

  item.replacementProposalId = result.proposal.id;
  await finishClosedMatchReview({
    reviewQueue,
    index,
    item,
    status: REVIEW_STATUS.DISMISSED,
    resolution: "replacement_proposed",
    note: `Tạo proposal ${result.proposal.id} thay cho địa điểm đã đóng ${closedPlace.id}`,
  });
  return { ok: true, proposalId: result.proposal.id };
}

// ─────────────────── NOTE-14 §3: nguồn nhập báo đóng vĩnh viễn ───────────────────
// "Không thêm" dùng rejectReviewItem (applyDecision nhánh reject → REJECTED, không đụng dữ liệu).
// Các action dưới đây KHÔNG đi qua approveReviewItem để nút chung không thể công khai nhầm.

async function getPendingSourceClosed(id) {
  const reviewQueue = await getReviewQueue();
  const index = reviewQueue.findIndex((item) => item.id === id);
  const item = reviewQueue[index];
  if (index === -1 || item?.status !== REVIEW_STATUS.PENDING || item?.type !== REVIEW_ITEM_TYPE.SOURCE_CLOSED) {
    return null;
  }
  return { reviewQueue, index, item };
}

async function saveSourceClosedReview({ reviewQueue, index, item, resolution, note, resultingLiveId = null }) {
  const at = new Date().toISOString();
  item.updatedAt = at;
  if (resolution) item.resolution = resolution;
  reviewQueue[index] = item;
  if (item.status !== REVIEW_STATUS.PENDING) resolveStaleReferences(reviewQueue, item.id, resultingLiveId);
  await saveReviewQueue(reviewQueue);
  await appendReviewEvent({ id: `event-${crypto.randomUUID()}`, itemId: item.id, action: resolution ?? item.status, note, at });
  revalidatePath("/admin");
  revalidatePath("/");
}

function adminNotice(message) {
  redirect(`/admin?notice=${encodeURIComponent(message)}#review-queue`);
}

// "Đề xuất địa điểm mới tại đây": business mới ở vị trí cũ là CHỦ THỂ KHÁC — tạo proposal chờ
// duyệt (luồng NOTE-12), không sửa/tái dùng record nguồn. Bắt đổi tên để không đề xuất lại đúng
// business đã đóng.
export async function proposeNewPlaceAtSourceClosed(formData) {
  await requireAdmin();
  const pending = await getPendingSourceClosed(formData.get("id")?.toString());
  if (!pending) return;
  const { item } = pending;
  const edited = placeFromFormData(formData);
  if (!edited.name || slugifyName(edited.name) === slugifyName(item.candidate?.name ?? "")) {
    adminNotice(`Đổi ô "Tên" thành tên business mới trước khi tạo đề xuất (đang là tên của chỗ đã đóng "${item.candidate?.name ?? ""}").`);
  }
  const result = await createProposal({
    contributorId: null,
    name: edited.name,
    type: edited.type,
    ward: edited.ward,
    address: edited.address,
    localArea: null,
    coordinates: item.candidate?.coordinates ?? null,
    note: `Tạo từ nguồn nhập báo "${item.candidate?.name}" đã đóng vĩnh viễn`,
    replacesPlaceId: null,
    replacesPlaceName: null,
  });
  if (!result.ok) adminNotice(result.error ?? "Chưa tạo được đề xuất.");
  item.status = REVIEW_STATUS.DISMISSED;
  item.newPlaceProposalId = result.proposal.id;
  await saveSourceClosedReview({
    ...pending,
    resolution: "new_place_proposed",
    note: `Tạo proposal ${result.proposal.id} cho business mới tại vị trí "${item.candidate?.name}"`,
  });
}

// "Gửi xác minh mở lại": chưa công khai gì cả — chỉ đánh dấu đang đi xác minh. Nút công khai chỉ hiện
// sau bước này, để việc công khai một chỗ nguồn báo đã đóng luôn là hai lần bấm có chủ đích.
export async function requestSourceClosedReopenVerification(formData) {
  await requireAdmin();
  const pending = await getPendingSourceClosed(formData.get("id")?.toString());
  if (!pending) return;
  pending.item.reopenVerification = { requestedAt: new Date().toISOString(), by: "admin" };
  await saveSourceClosedReview({ ...pending, resolution: "reopen_verification_requested", note: "Gửi xác minh mở lại" });
}

// Đã xác minh còn hoạt động. Khớp chỗ đang công khai → chỉ ghi mốc kiểm tra. Chỗ mới → công khai
// với dữ liệu trên form, vẫn qua guard lịch sử đóng cửa (NOTE-13).
export async function publishVerifiedSourceClosed(formData) {
  await requireAdmin();
  const pending = await getPendingSourceClosed(formData.get("id")?.toString());
  if (!pending?.item.reopenVerification) return;
  const { item } = pending;
  const now = new Date().toISOString();

  if (item.matchedLivePlaceId) {
    const livePlaces = await getLivePlaces();
    await setLivePlaces(livePlaces.map((p) => (p.id === item.matchedLivePlaceId ? { ...p, lastCheckedAt: now } : p)));
    item.status = REVIEW_STATUS.DISMISSED;
    await saveSourceClosedReview({
      ...pending,
      resolution: "verified_still_open",
      note: "Đã xác minh chỗ đang công khai vẫn hoạt động",
      resultingLiveId: item.matchedLivePlaceId,
    });
    revalidatePath(`/dia-diem/${item.matchedLivePlaceId}`);
    return;
  }

  const place = publishablePlaceFrom(item, formData);
  if (await holdIfClosedHistory(item, place)) {
    await saveSourceClosedReview({ ...pending, resolution: "held_closed_history", note: "Khớp hồ sơ đã đóng — chuyển sang xác minh mở lại/thay thế" });
    return;
  }
  const newId = `live-${crypto.randomUUID()}`;
  const livePlaces = await getLivePlaces();
  livePlaces.push({ id: newId, ...place, autoPublished: false, lastCheckedAt: now });
  await setLivePlaces(livePlaces);
  item.status = REVIEW_STATUS.APPROVED;
  await saveSourceClosedReview({
    ...pending,
    resolution: "verified_reopened_published",
    note: `Đã xác minh còn hoạt động — công khai ${newId}`,
    resultingLiveId: newId,
  });
}

// Nguồn báo đóng vĩnh viễn một chỗ ĐANG công khai: không tự gỡ (CLAUDE.md quy tắc 6) — tạo một báo
// đóng cửa vào đúng hàng chờ góp ý đã có, Admin duyệt ở đó như báo của khách.
export async function reportLiveClosedFromSource(formData) {
  await requireAdmin();
  const pending = await getPendingSourceClosed(formData.get("id")?.toString());
  if (!pending?.item.matchedLivePlaceId) return;
  const { item } = pending;
  const livePlace = (await getLivePlaces()).find((p) => p.id === item.matchedLivePlaceId);
  if (!livePlace) return;
  const now = new Date().toISOString();
  await appendSuggestion({
    id: `sugg-${crypto.randomUUID()}`,
    type: "correction",
    placeId: livePlace.id,
    placeName: livePlace.name,
    contributorId: null,
    contributorNickname: "Nguồn nhập tự động",
    status: "pending",
    fields: { closed: true },
    note: `Nguồn ${(item.sources ?? []).map((source) => source.sourceId).join(", ") || "nhập"} báo đã đóng vĩnh viễn`,
    createdAt: now,
    updatedAt: now,
  });
  item.status = REVIEW_STATUS.DISMISSED;
  await saveSourceClosedReview({ ...pending, resolution: "closure_report_created", note: `Tạo báo đóng cửa cho ${livePlace.id}` });
}
