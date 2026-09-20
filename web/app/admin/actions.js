"use server";

import crypto from "crypto";
import { cookies, headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  ADMIN_COOKIE_NAME,
  checkPassword,
  createSessionToken,
  isHttpsRequest,
  verifySessionToken,
} from "@/lib/adminAuth";
import {
  getLivePlaces,
  getPendingPlaces,
  setLivePlaces,
  setPendingPlaces,
} from "@/lib/redis";
import { placeFromFormData } from "@/lib/placeForm";
import { getAllClosedPlaces } from "@/lib/closedPlaces";
import { matchPlaceAgainstClosedPlaces } from "@/lib/ingestion/match";
import { queueClosedHistoryHold } from "@/lib/ingestion/closedHold";
import { cleanCoordinates } from "@/lib/coordinates";
import { removeLatestCheckin } from "@/lib/checkins";
import { removePlaceAnswers } from "@/lib/answers";
import { removePlaceLocationVotes } from "@/lib/locationVotes";
import { recordLocationChange, removeLocationHistory } from "@/lib/locationHistory";
import { removePhoneConfirmations } from "@/lib/phoneConfirmations";

async function requireAdmin() {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_COOKIE_NAME)?.value;
  if (!verifySessionToken(token)) {
    throw new Error("Chưa đăng nhập hoặc phiên đã hết hạn");
  }
}

export async function login(formData) {
  "use server";
  const password = formData.get("password")?.toString() ?? "";

  if (!checkPassword(password)) {
    redirect("/admin?error=1");
  }

  const cookieStore = await cookies();
  const headerStore = await headers();
  cookieStore.set(ADMIN_COOKIE_NAME, createSessionToken(), {
    httpOnly: true,
    secure: isHttpsRequest(headerStore.get("x-forwarded-proto")),
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });

  redirect("/admin");
}

export async function logout() {
  "use server";
  const cookieStore = await cookies();
  cookieStore.delete(ADMIN_COOKIE_NAME);
  redirect("/admin");
}

export async function addPending(formData) {
  "use server";
  await requireAdmin();

  const place = placeFromFormData(formData);
  place.id = `pending-${crypto.randomUUID()}`;

  const pending = await getPendingPlaces();
  pending.push(place);
  await setPendingPlaces(pending);

  revalidatePath("/admin");
}

export async function approvePending(formData) {
  "use server";
  await requireAdmin();
  const id = formData.get("id")?.toString();

  const pending = await getPendingPlaces();
  const item = pending.find((p) => p.id === id);
  if (!item) return;

  // NOTE-13 + NOTE-14 §4: thêm tay cũng không được lách lịch sử đóng cửa. Khớp thì chuyển sang hàng
  // chờ tự động (có nút Mở lại / Tạo thay thế) và rời "Chờ duyệt" — không công khai.
  const closedHit = matchPlaceAgainstClosedPlaces(item, await getAllClosedPlaces());
  if (closedHit) {
    await queueClosedHistoryHold(item, closedHit, {
      sourceId: `pending:${item.id}`,
      note: `Admin định công khai "${item.name}" từ mục Chờ duyệt`,
    });
    await setPendingPlaces(pending.filter((p) => p.id !== id));
    revalidatePath("/admin");
    redirect(
      `/admin?notice=${encodeURIComponent(
        `Chưa công khai "${item.name}": trùng địa điểm đã đóng. Đã chuyển vào hàng chờ tự động — chọn "Mở lại địa điểm cũ" nếu đúng chỗ cũ, hoặc "Tạo địa điểm mới thay thế".`
      )}#review-queue`
    );
  }

  const remainingPending = pending.filter((p) => p.id !== id);
  const live = await getLivePlaces();
  live.push(item);

  await setPendingPlaces(remainingPending);
  await setLivePlaces(live);

  revalidatePath("/admin");
  revalidatePath("/");
}

export async function rejectPending(formData) {
  "use server";
  await requireAdmin();
  const id = formData.get("id")?.toString();

  const pending = await getPendingPlaces();
  await setPendingPlaces(pending.filter((p) => p.id !== id));

  revalidatePath("/admin");
}

export async function updateLive(formData) {
  "use server";
  await requireAdmin();
  const id = formData.get("id")?.toString();
  const updates = placeFromFormData(formData);

  const live = await getLivePlaces();
  const before = live.find((p) => p.id === id) ?? null;
  const next = live.map((p) => (p.id === id ? { ...p, ...updates, id } : p));
  await setLivePlaces(next);
  // §19: form sửa địa điểm cũng đổi được ghim, nên cũng phải vào nhật ký.
  await recordLocationChange({
    placeId: id,
    before,
    after: next.find((p) => p.id === id) ?? null,
    actor: "admin",
    reason: "sửa hồ sơ địa điểm",
  });

  revalidatePath("/admin");
  revalidatePath("/");
}

export async function deleteLive(formData) {
  "use server";
  await requireAdmin();
  const id = formData.get("id")?.toString();

  const live = await getLivePlaces();
  await setLivePlaces(live.filter((p) => p.id !== id));
  await removeLatestCheckin(id);
  await removePlaceAnswers(id);
  await removePhoneConfirmations(id);
  await removePlaceLocationVotes(id);
  await removeLocationHistory(id);

  revalidatePath("/admin");
  revalidatePath("/");
}

/**
 * Ghi vị trí đã ghim cho MỘT địa điểm (spec Location-Routing §13 — bảng xác minh hàng loạt).
 * Tách khỏi `updateLive` để bảng đó không phải gửi lại toàn bộ form của từng chỗ.
 */
export async function savePlaceLocation({ id, coordinates, googlePlaceId = null, reason = null }) {
  "use server";
  await requireAdmin();
  if (!id) return { ok: false, error: "Thiếu địa điểm." };
  const clean = coordinates === null ? null : cleanCoordinates(coordinates);
  if (coordinates && !clean) return { ok: false, error: "Toạ độ không hợp lệ." };

  const live = await getLivePlaces();
  const before = live.find((p) => p.id === id) ?? null;
  if (!before) return { ok: false, error: "Không tìm thấy địa điểm này." };
  const placeId = clean && typeof googlePlaceId === "string" ? googlePlaceId.trim().slice(0, 200) || null : null;
  await setLivePlaces(live.map((p) => (p.id === id ? { ...p, coordinates: clean, googlePlaceId: placeId } : p)));
  // §19: giữ lại toạ độ CŨ. Ghim đè ghim mà không có nhật ký thì đổi nhầm là không lùi được.
  await recordLocationChange({
    placeId: id,
    before,
    after: { ...before, coordinates: clean, googlePlaceId: placeId },
    actor: "admin",
    reason,
  });

  revalidatePath("/admin");
  revalidatePath("/admin/vi-tri");
  revalidatePath("/");
  return { ok: true };
}
