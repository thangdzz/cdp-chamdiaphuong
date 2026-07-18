"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { ADMIN_COOKIE_NAME, verifySessionToken } from "@/lib/adminAuth";
import { getLivePlaces, setLivePlaces } from "@/lib/redis";
import { getSuggestions, saveSuggestions } from "@/lib/suggestions";
import { addContributorPoints } from "@/lib/contributors";
import { POINTS } from "@/lib/badges";

async function requireAdmin() {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_COOKIE_NAME)?.value;
  if (!verifySessionToken(token)) {
    throw new Error("Chưa đăng nhập hoặc phiên đã hết hạn");
  }
}

const FIELD_MAP = {
  address: "address",
  phone: "phone",
  priceMin: "priceMin",
  priceMax: "priceMax",
  priceUnit: "priceUnit",
};

async function applyDecision(id, decision) {
  await requireAdmin();

  const suggestions = await getSuggestions();
  const index = suggestions.findIndex((s) => s.id === id);
  if (index === -1) return;
  const item = suggestions[index];
  if (item.status !== "pending") return;

  if (decision === "approve") {
    const livePlaces = await getLivePlaces();
    const placeIndex = livePlaces.findIndex((p) => p.id === item.placeId);

    if (item.type === "correction" && item.fields?.closed && placeIndex !== -1) {
      // Chỗ báo đã đóng cửa — gỡ khỏi công khai, giống nhánh stale_place (luôn cần duyệt).
      await setLivePlaces(livePlaces.filter((p) => p.id !== item.placeId));
    } else if (item.type === "correction" && placeIndex !== -1) {
      const place = livePlaces[placeIndex];
      const updates = {};
      for (const [suggestionField, placeField] of Object.entries(FIELD_MAP)) {
        if (item.fields?.[suggestionField] !== undefined) {
          updates[placeField] = item.fields[suggestionField];
        }
      }
      livePlaces[placeIndex] = { ...place, ...updates, lastUpdatedAt: new Date().toISOString() };
      await setLivePlaces(livePlaces);
    } else if (item.type === "photo" && placeIndex !== -1) {
      const place = livePlaces[placeIndex];
      const photos = [...(place.photos ?? []), item.photoUrl];
      livePlaces[placeIndex] = { ...place, photos };
      await setLivePlaces(livePlaces);
    }

    if (item.contributorId) {
      await addContributorPoints(item.contributorId, POINTS[item.type] ?? 0);
    }
    item.status = "approved";
  } else {
    item.status = "rejected";
  }

  item.updatedAt = new Date().toISOString();
  suggestions[index] = item;
  await saveSuggestions(suggestions);

  revalidatePath("/admin");
  revalidatePath("/");
}

export async function approveSuggestion(formData) {
  "use server";
  const id = formData.get("id")?.toString();
  await applyDecision(id, "approve");
}

export async function rejectSuggestion(formData) {
  "use server";
  const id = formData.get("id")?.toString();
  await applyDecision(id, "reject");
}
