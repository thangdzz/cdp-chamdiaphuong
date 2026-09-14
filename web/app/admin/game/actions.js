"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ADMIN_COOKIE_NAME, verifySessionToken } from "@/lib/adminAuth";
import { getGameEvent } from "@/lib/game/registry";
import { OBJECT_KIND, VERIFICATION_STATUSES } from "@/lib/game/catalog";
import {
  GameInputError,
  adminDeleteSighting,
  adminMatchObject,
  adminSetSightingPhotoStatus,
  adminUpsertObject,
  getSighting,
} from "@/lib/game/store";

async function requireAdmin() {
  const cookieStore = await cookies();
  if (!verifySessionToken(cookieStore.get(ADMIN_COOKIE_NAME)?.value)) redirect("/admin");
}

function backTo(slug, params) {
  redirect(`/admin/game?event=${encodeURIComponent(slug)}&${new URLSearchParams(params)}`);
}

function eventFrom(formData) {
  const event = getGameEvent(formData.get("slug")?.toString() ?? "");
  if (!event) redirect("/admin/game?error=event");
  return event;
}

function text(formData, name) {
  const value = formData.get(name)?.toString().trim();
  return value ? value : null;
}

// Mọi action đều bọc cùng một khuôn: lỗi dữ liệu -> quay lại kèm thông báo, không ném trang lỗi.
async function run(formData, work) {
  await requireAdmin();
  const event = eventFrom(formData);
  let outcome;
  try {
    await work(event);
    outcome = { saved: "1" };
  } catch (error) {
    if (!(error instanceof GameInputError)) console.error("[admin/game]", error);
    outcome = { error: error instanceof GameInputError ? error.message : "Chưa lưu được. Thử lại." };
  }
  backTo(event.slug, outcome);
}

export async function saveGameObject(formData) {
  await run(formData, async (event) => {
    const name = text(formData, "name");
    const id = text(formData, "id") ?? `${event.id}-${crypto.randomUUID().slice(0, 8)}`;
    const status = text(formData, "verificationStatus");
    await adminUpsertObject(event, {
      id,
      // Đặt tên cho một bí ẩn = biến nó thành model, giữ nguyên id nên bộ sưu tập/sighting cũ
      // tự theo sang (NOTE-04 §16).
      kind: name ? OBJECT_KIND.MODEL : text(formData, "kind") ?? OBJECT_KIND.MODEL,
      name,
      icon: text(formData, "icon"),
      category: text(formData, "category"),
      ward: text(formData, "ward"),
      neighborhood: text(formData, "neighborhood"),
      description: text(formData, "description"),
      story: text(formData, "story"),
      hint: text(formData, "hint"),
      verificationStatus: VERIFICATION_STATUSES.includes(status) ? status : "admin_verified",
      hidden: formData.get("hidden") === "on",
    });
  });
}

export async function matchGameObject(formData) {
  await run(formData, (event) =>
    adminMatchObject(event, {
      sourceId: text(formData, "sourceId"),
      targetId: text(formData, "targetId"),
    })
  );
}

export async function unmatchGameObject(formData) {
  await run(formData, (event) => adminUpsertObject(event, { id: text(formData, "id"), matchedTo: null }));
}

export async function reviewSightingPhoto(formData) {
  await run(formData, async (event) => {
    const sightingId = text(formData, "sightingId");
    const decision = text(formData, "decision");
    if (decision === "reject") {
      await adminSetSightingPhotoStatus(event, { sightingId, status: "rejected" });
      return;
    }
    const sighting = await adminSetSightingPhotoStatus(event, { sightingId, status: "approved" });
    // "Dùng làm ảnh mô hình": ảnh đã duyệt mới được lên public (cùng nguyên tắc ảnh khách của CDP).
    if (decision === "cover") {
      await adminUpsertObject(event, { id: sighting.objectId, photoUrl: sighting.photo.url });
    }
  });
}

export async function deleteGameSighting(formData) {
  await run(formData, async (event) => {
    const sightingId = text(formData, "sightingId");
    if (!(await getSighting(event, sightingId))) throw new GameInputError("Lượt báo không còn.");
    await adminDeleteSighting(event, sightingId);
  });
}
