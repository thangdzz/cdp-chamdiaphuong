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

async function requireAdmin() {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_COOKIE_NAME)?.value;
  if (!verifySessionToken(token)) {
    throw new Error("Chưa đăng nhập hoặc phiên đã hết hạn");
  }
}

export async function getPlaceById(id) {
  await requireAdmin();
  if (!id) return null;
  const places = await getLivePlaces();
  return places.find((p) => p.id === id) ?? null;
}

// Dò chỗ tên gần giống — dùng khi admin xác định "chỗ B" cho công cụ gộp trùng lặp. Khách
// báo trùng chỉ gõ tên tự do nên không thể khớp tuyệt đối được.
export async function searchDuplicateCandidates({ query, excludePlaceId }) {
  await requireAdmin();
  if (!query?.trim()) return [];
  const places = await getLivePlaces();
  return findSimilarPlaces(query, places, excludePlaceId).map((r) => r.place);
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

  const priceMin = formData.get("priceMin")?.toString();
  const priceMax = formData.get("priceMax")?.toString();
  const priceUnit = formData.get("priceUnit")?.toString().trim() || null;
  const parsedPriceMin = priceMin ? Number(priceMin) : null;
  const parsedPriceMax = priceMax ? Number(priceMax) : null;

  const keptFields = {
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
