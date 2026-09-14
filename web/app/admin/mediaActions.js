"use server";

import crypto from "crypto";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { ADMIN_COOKIE_NAME, verifySessionToken } from "@/lib/adminAuth";
import { getLivePlaces, setLivePlaces } from "@/lib/redis";
import {
  MEDIA_ROLES,
  normalizeEditableMedia,
  placeMedia,
  withPlaceMedia,
} from "@/lib/media";
import { deleteMedia, uploadMedia } from "@/lib/mediaStorage";
import { MAX_ADMIN_MEDIA_PER_UPLOAD, processMediaFile } from "@/lib/mediaProcessing";

const EDITABLE_ROLES = new Set([
  ...MEDIA_ROLES.map((role) => role.id),
  "cover",
  "navigation",
]);

async function requireAdmin() {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_COOKIE_NAME)?.value;
  if (!verifySessionToken(token)) throw new Error("Chưa đăng nhập hoặc phiên đã hết hạn");
}

function refreshMediaPages(placeId) {
  revalidatePath("/admin");
  revalidatePath("/");
  revalidatePath(`/dia-diem/${placeId}`);
  revalidatePath("/so");
  revalidatePath("/lo-trinh");
}

function updateOnePlace(places, placeId, nextMedia) {
  let found = false;
  const next = places.map((place) => {
    if (place.id !== placeId) return place;
    found = true;
    return withPlaceMedia(place, nextMedia);
  });
  return { found, next };
}

export async function uploadPlaceMedia(formData) {
  await requireAdmin();
  const placeId = formData.get("placeId")?.toString();
  const initialRole = formData.get("initialRole")?.toString();
  const role = MEDIA_ROLES.some((item) => item.id === initialRole) ? initialRole : "general";
  const files = formData.getAll("media").filter((file) => file instanceof File && file.size > 0);
  if (!placeId) return { ok: false, error: "Thiếu địa điểm." };
  if (!files.length) return { ok: false, error: "Chưa chọn ảnh nào." };
  if (files.length > MAX_ADMIN_MEDIA_PER_UPLOAD) {
    return { ok: false, error: `Admin tải tối đa ${MAX_ADMIN_MEDIA_PER_UPLOAD} ảnh mỗi lần.` };
  }

  const places = await getLivePlaces();
  const place = places.find((item) => item.id === placeId);
  if (!place) return { ok: false, error: "Không tìm thấy địa điểm." };

  const uploaded = [];
  let persisted = false;
  try {
    for (const file of files) {
      const image = await processMediaFile(file);
      const blob = await uploadMedia(image.buffer, {
        placeId,
        extension: "webp",
        mimeType: image.mimeType,
      });
      uploaded.push({
        id: `media-${crypto.randomUUID()}`,
        storageKey: blob.storageKey,
        url: blob.url,
        width: image.width,
        height: image.height,
        bytes: image.bytes,
        mimeType: image.mimeType,
        caption: null,
        order: placeMedia(place).length + uploaded.length,
        roles: [role],
        source: "admin",
        uploadedAt: new Date().toISOString(),
        uploadedBy: "admin",
        providerMeta: blob.providerMeta,
      });
    }

    const nextMedia = normalizeEditableMedia([...placeMedia(place), ...uploaded]);
    const updated = updateOnePlace(places, placeId, nextMedia);
    await setLivePlaces(updated.next);
    persisted = true;
    refreshMediaPages(placeId);
    return { ok: true, media: nextMedia };
  } catch (error) {
    // Chỉ rollback đúng file tạo trong lượt này. File đã gắn vào place từ trước không bị đụng.
    // Nếu Redis đã lưu xong mà bước revalidate phía sau lỗi, giữ Blob để dữ liệu không trỏ
    // tới file đã bị xoá; lượt tải trang sau vẫn đọc được media vừa lưu.
    if (!persisted) {
      await Promise.allSettled(uploaded.map((item) => deleteMedia(item.storageKey)));
    }
    return { ok: false, error: error?.message || "Chưa tải được ảnh." };
  }
}

export async function savePlaceMedia(payload) {
  await requireAdmin();
  const placeId = payload?.placeId?.toString();
  if (!placeId || !Array.isArray(payload?.items)) {
    return { ok: false, error: "Dữ liệu ảnh không hợp lệ." };
  }

  const places = await getLivePlaces();
  const place = places.find((item) => item.id === placeId);
  if (!place) return { ok: false, error: "Không tìm thấy địa điểm." };
  const current = placeMedia(place);
  const currentById = new Map(current.map((item) => [item.id, item]));
  const requestedIds = payload.items.map((item) => item?.id);
  if (
    requestedIds.length !== current.length ||
    new Set(requestedIds).size !== current.length ||
    requestedIds.some((id) => !currentById.has(id))
  ) {
    return { ok: false, error: "Danh sách ảnh đã thay đổi. Tải lại trang rồi thử lại." };
  }

  const proposed = payload.items.map((input, order) => {
    const original = currentById.get(input.id);
    const roles = Array.isArray(input.roles)
      ? [...new Set(input.roles.filter((role) => EDITABLE_ROLES.has(role)))]
      : original.roles;
    return {
      ...original,
      caption:
        typeof input.caption === "string" && input.caption.trim()
          ? input.caption.trim().slice(0, 160)
          : null,
      order,
      roles,
    };
  });
  const nextMedia = normalizeEditableMedia(proposed);
  const updated = updateOnePlace(places, placeId, nextMedia);
  await setLivePlaces(updated.next);
  refreshMediaPages(placeId);
  return { ok: true, media: nextMedia };
}

export async function removePlaceMedia({ placeId, mediaId }) {
  await requireAdmin();
  if (!placeId || !mediaId) return { ok: false, error: "Thiếu thông tin ảnh." };
  const places = await getLivePlaces();
  const place = places.find((item) => item.id === placeId);
  if (!place) return { ok: false, error: "Không tìm thấy địa điểm." };
  const current = placeMedia(place);
  if (!current.some((item) => item.id === mediaId)) {
    return { ok: false, error: "Ảnh không còn trong địa điểm." };
  }

  // Chỉ gỡ metadata. Blob có thể đã được chép vào route_share snapshot; xoá file ngay sẽ làm
  // link cũ vỡ. NOTE-11 P1 sẽ dọn orphan sau khi có reference index/dry-run.
  const nextMedia = normalizeEditableMedia(current.filter((item) => item.id !== mediaId));
  const updated = updateOnePlace(places, placeId, nextMedia);
  await setLivePlaces(updated.next);
  refreshMediaPages(placeId);
  return { ok: true, media: nextMedia };
}
