"use server";

import crypto from "crypto";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
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
async function applyDecision(id, decision, formData) {
  await requireAdmin();

  const reviewQueue = await getReviewQueue();
  const index = reviewQueue.findIndex((i) => i.id === id);
  if (index === -1) return;
  const item = reviewQueue[index];

  if (decision === "approve") {
    if (item.type === REVIEW_ITEM_TYPE.NEW_PLACE || item.type === REVIEW_ITEM_TYPE.LOW_CONFIDENCE_PLACE) {
      const newId = `live-${crypto.randomUUID()}`;
      const livePlaces = await getLivePlaces();
      livePlaces.push({ id: newId, ...placeFromFormData(formData) });
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
        p.id === item.matchedLivePlaceId ? { ...p, ...edited, id: p.id } : p
      );
      await setLivePlaces(next);
      item.status = REVIEW_STATUS.APPROVED;
    } else if (item.type === REVIEW_ITEM_TYPE.STALE_PLACE) {
      // "Duyệt" ở đây nghĩa là "đã kiểm tra, vẫn hoạt động" — chỉ cập nhật mốc thời gian.
      const livePlaces = await getLivePlaces();
      const next = livePlaces.map((p) =>
        p.id === item.matchedLivePlaceId ? { ...p, lastCheckedAt: new Date().toISOString() } : p
      );
      await setLivePlaces(next);
      item.status = REVIEW_STATUS.DISMISSED;
    } else if (item.type === REVIEW_ITEM_TYPE.DUPLICATE_CANDIDATE) {
      // "Duyệt" = xác nhận đúng là trùng lặp -> không đăng, đánh dấu đã gộp.
      item.status = REVIEW_STATUS.MERGED;
    } else {
      // conflict_detected và các loại khác chưa có hành động tự động cụ thể — chỉ đóng lại.
      item.status = REVIEW_STATUS.DISMISSED;
    }
  } else if (item.type === REVIEW_ITEM_TYPE.STALE_PLACE) {
    // "Từ chối" ở đây nghĩa là "đã đóng cửa/không còn hoạt động" -> gỡ khỏi công khai.
    const livePlaces = await getLivePlaces();
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
