"use server";

import crypto from "crypto";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { ADMIN_COOKIE_NAME, verifySessionToken } from "@/lib/adminAuth";
import { getLivePlaces, setLivePlaces } from "@/lib/redis";
import { getReviewQueue, saveReviewQueue, appendReviewEvent } from "@/lib/ingestion/store";
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
      const livePlaces = await getLivePlaces();
      livePlaces.push({ id: `live-${crypto.randomUUID()}`, ...placeFromFormData(formData) });
      await setLivePlaces(livePlaces);
      item.status = REVIEW_STATUS.APPROVED;
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
