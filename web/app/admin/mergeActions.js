"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { ADMIN_COOKIE_NAME, verifySessionToken } from "@/lib/adminAuth";
import { getLivePlaces, setLivePlaces } from "@/lib/redis";
import { getSuggestions, saveSuggestions } from "@/lib/suggestions";
import { addContributorPoints } from "@/lib/contributors";
import { removeLatestCheckin } from "@/lib/checkins";
import { removePlaceAnswers } from "@/lib/answers";
import { findSimilarPlaces } from "@/lib/placeSearch";
import { assertValidPlaceType } from "@/lib/placeTypes";
import { formatPriceText } from "@/lib/priceFormat";
import { POINTS } from "@/lib/badges";
import { getReviewQueue, saveReviewQueue, getConfirmedDistinctPairs, appendConfirmedDistinctPair } from "@/lib/ingestion/store";
import { REVIEW_STATUS } from "@/lib/ingestion/schema";
import { candidateToLivePlace } from "@/lib/ingestion/toLivePlace";

async function requireAdmin() {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_COOKIE_NAME)?.value;
  if (!verifySessionToken(token)) {
    throw new Error("Chưa đăng nhập hoặc phiên đã hết hạn");
  }
}

function readMergedFieldsFromForm(formData) {
  const priceMin = formData.get("priceMin")?.toString();
  const priceMax = formData.get("priceMax")?.toString();
  const priceUnit = formData.get("priceUnit")?.toString().trim() || null;
  const parsedPriceMin = priceMin ? Number(priceMin) : null;
  const parsedPriceMax = priceMax ? Number(priceMax) : null;

  return {
    name: formData.get("name")?.toString().trim(),
    type: assertValidPlaceType(formData.get("type")?.toString()),
    address: formData.get("address")?.toString().trim(),
    ward: formData.get("ward")?.toString().trim() || null,
    localArea: formData.get("localArea")?.toString().trim() || null,
    phone: formData.get("phone")?.toString().trim() || null,
    priceMin: parsedPriceMin,
    priceMax: parsedPriceMax,
    priceUnit,
    priceText: formatPriceText({ priceMin: parsedPriceMin, priceMax: parsedPriceMax, priceUnit }),
  };
}

export async function getPlaceById(id) {
  await requireAdmin();
  if (!id) return null;
  const places = await getLivePlaces();
  return places.find((p) => p.id === id) ?? null;
}

// Dò chỗ tên gần giống — dùng khi admin xác định "chỗ B" cho công cụ gộp trùng lặp (nguồn
// khách báo, chỉ có tên tự do nên không khớp tuyệt đối được). Loại sẵn các chỗ đã được xác
// nhận là KHÁC chỗ A trước đó (xem confirmSuggestionNotDuplicate) — không gợi ý lại.
export async function searchDuplicateCandidates({ query, excludePlaceId }) {
  await requireAdmin();
  if (!query?.trim()) return [];
  const places = await getLivePlaces();
  const distinctIds = new Set();
  if (excludePlaceId) {
    const pairs = await getConfirmedDistinctPairs();
    for (const pair of pairs) {
      if (pair.a === excludePlaceId) distinctIds.add(pair.b);
      if (pair.b === excludePlaceId) distinctIds.add(pair.a);
    }
  }
  return findSimilarPlaces(query, places, excludePlaceId)
    .map((r) => r.place)
    .filter((p) => !distinctIds.has(p.id));
}

// Gộp 2 chỗ trùng lặp thành 1 — xoá dữ liệu thật đã công khai, nên LUÔN cần admin tự bấm
// xác nhận qua form này (không có đường tự động). Giữ đúng `id` của bên được chọn giữ để
// check-in/câu hỏi (Chặng 1-2) gắn với chỗ đó không bị đứt; bên bị xoá dọn theo đúng cơ chế
// deleteLive đang dùng (removeLatestCheckin + removePlaceAnswers) — sổ khách (Chặng 4) lỡ
// lưu chỗ bị xoá vẫn hiện được tên nhờ nameSnapshot, không cần dọn gì thêm ở đây.
export async function mergeDuplicatePlaces(formData) {
  await requireAdmin();

  const suggestionId = formData.get("suggestionId")?.toString();
  const keepId = formData.get("keepId")?.toString();
  const deleteId = formData.get("deleteId")?.toString();
  if (!keepId || !deleteId || keepId === deleteId) return;

  const keptFields = readMergedFieldsFromForm(formData);
  const keepPhotos = formData.getAll("keepPhoto").map((p) => p.toString());

  const live = await getLivePlaces();
  const next = live
    .filter((p) => p.id !== deleteId)
    .map((p) =>
      p.id === keepId
        ? { ...p, ...keptFields, photos: keepPhotos, lastUpdatedAt: new Date().toISOString() }
        : p
    );
  await setLivePlaces(next);
  await removeLatestCheckin(deleteId);
  await removePlaceAnswers(deleteId);

  if (suggestionId) {
    const suggestions = await getSuggestions();
    const index = suggestions.findIndex((s) => s.id === suggestionId);
    if (index !== -1 && suggestions[index].status === "pending") {
      const item = suggestions[index];
      suggestions[index] = { ...item, status: "approved", updatedAt: new Date().toISOString() };
      await saveSuggestions(suggestions);
      if (item.contributorId) {
        await addContributorPoints(item.contributorId, POINTS.correction);
      }
    }
  }

  revalidatePath("/admin");
  revalidatePath("/");
}

// Admin xác nhận "không trùng" cho báo cáo của khách — nhớ luôn cặp chỗ này là 2 chỗ KHÁC
// NHAU (dùng chung confirmed_distinct_pairs với luồng AI quét) để lần sau không gợi ý lại
// hay hỏi lại nữa. Đóng báo cáo, không cộng điểm (báo không đúng thì không thưởng, nhưng
// cũng không trừ — đúng nguyên tắc "không bao giờ trừ điểm").
export async function confirmSuggestionNotDuplicate(formData) {
  await requireAdmin();
  const suggestionId = formData.get("suggestionId")?.toString();
  const placeAId = formData.get("placeAId")?.toString();
  const placeBId = formData.get("placeBId")?.toString();
  if (!suggestionId || !placeAId || !placeBId) return;

  await appendConfirmedDistinctPair({ a: placeAId, b: placeBId, decidedAt: new Date().toISOString() });

  const suggestions = await getSuggestions();
  const index = suggestions.findIndex((s) => s.id === suggestionId);
  if (index !== -1 && suggestions[index].status === "pending") {
    suggestions[index] = { ...suggestions[index], status: "rejected", updatedAt: new Date().toISOString() };
    await saveSuggestions(suggestions);
  }

  revalidatePath("/admin");
}

// Chuẩn bị dữ liệu so sánh cho 1 "Nghi trùng lặp" do AI quét phát hiện — candidate (bản ghi
// mới, dạng NormalizedPlace) CHƯA từng lên web, nên không có "chỗ A" thật để xoá; chỉ tra ra
// hình dạng place:live tương đương (để hiện cùng khuôn với chỗ B) và chỗ B thật đã công khai
// (máy đã biết sẵn ID, khỏi cần bước tìm kiếm như luồng khách báo).
export async function getReviewCandidateForMerge(reviewItemId) {
  await requireAdmin();
  const reviewQueue = await getReviewQueue();
  const item = reviewQueue.find((i) => i.id === reviewItemId);
  if (!item?.candidate) return { placeA: null, placeB: null };

  const placeA = candidateToLivePlace(item.candidate);
  const placeBId = item.duplicateOfCandidates?.[0];
  const places = await getLivePlaces();
  const placeB = placeBId ? (places.find((p) => p.id === placeBId) ?? null) : null;
  return { placeA, placeB };
}

// Gộp bản ghi AI quét vào chỗ đã công khai (chỗ B) — chỉ CẬP NHẬT field đã chọn cho B, không
// có gì để xoá khỏi places:live vì candidate chưa từng được đăng. Đóng review item (đánh dấu
// đã gộp, không đăng bản ghi mới).
export async function mergeReviewCandidate(formData) {
  await requireAdmin();

  const reviewItemId = formData.get("reviewItemId")?.toString();
  const keepId = formData.get("keepId")?.toString();
  if (!reviewItemId || !keepId) return;

  const updates = readMergedFieldsFromForm(formData);
  const keepPhotos = formData.getAll("keepPhoto").map((p) => p.toString());

  const live = await getLivePlaces();
  const next = live.map((p) =>
    p.id === keepId
      ? {
          ...p,
          ...updates,
          photos: keepPhotos,
          lastUpdatedAt: new Date().toISOString(),
          sourceCount: (p.sourceCount ?? 1) + 1,
        }
      : p
  );
  await setLivePlaces(next);

  const reviewQueue = await getReviewQueue();
  const index = reviewQueue.findIndex((i) => i.id === reviewItemId);
  if (index !== -1) {
    reviewQueue[index] = {
      ...reviewQueue[index],
      status: REVIEW_STATUS.MERGED,
      updatedAt: new Date().toISOString(),
    };
    await saveReviewQueue(reviewQueue);
  }

  revalidatePath("/admin");
  revalidatePath("/");
}
