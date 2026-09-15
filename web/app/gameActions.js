"use server";

import crypto from "crypto";
import { createContributor, getContributor } from "@/lib/contributors";
import {
  GameInputError,
  attachPhotoToSighting,
  flagSighting,
  getGameSnapshot,
  getPlayerState,
  loadGameEvent,
  recordSighting,
} from "@/lib/game/store";
import { EVENT_PHASE, eventPhase } from "@/lib/game/registry";
import { deleteMedia, uploadMedia } from "@/lib/mediaStorage";
import { processMediaFile } from "@/lib/mediaProcessing";

async function requireEvent(slug) {
  const event = await loadGameEvent(String(slug ?? ""));
  if (!event) throw new GameInputError("Không tìm thấy mùa săn này.");
  return event;
}

function isAnonId(value) {
  return typeof value === "string" && /^c-[0-9a-f-]{36}$/.test(value);
}

function errorResult(error) {
  if (error instanceof GameInputError) return { ok: false, error: error.message, code: error.code };
  console.error("[game]", error);
  return { ok: false, error: "Chưa gửi được. Kiểm tra mạng rồi thử lại." };
}

// Ảnh là TUỲ CHỌN (NOTE-04 §2): lỗi ảnh chỉ trả cảnh báo, không chặn lượt báo. Sharp xoay theo
// EXIF rồi xuất WebP không kèm metadata => toạ độ GPS trong ảnh gốc bị bỏ (NOTE-04 §20).
async function uploadSightingPhoto(event, file, anonId) {
  if (!(file instanceof File) || file.size === 0) return { photo: null, photoError: null };
  try {
    const image = await processMediaFile(file);
    const blob = await uploadMedia(image.buffer, {
      storageKey: `game-media/${event.id}/${crypto.randomUUID()}.webp`,
      mimeType: image.mimeType,
    });
    return {
      photo: {
        url: blob.url,
        storageKey: blob.storageKey,
        width: image.width,
        height: image.height,
        // Ảnh khách chờ duyệt như mọi ảnh khách khác của CDP — không public thẳng.
        status: "pending",
        uploadedBy: anonId,
        uploadedAt: new Date().toISOString(),
      },
      photoError: null,
    };
  } catch (error) {
    return { photo: null, photoError: error?.message || "Chưa lưu được ảnh." };
  }
}

export async function loadGameSnapshot(slug) {
  try {
    return { ok: true, snapshot: await getGameSnapshot(await requireEvent(slug)) };
  } catch (error) {
    return errorResult(error);
  }
}

export async function loadPlayerState({ slug, anonId }) {
  try {
    const event = await requireEvent(slug);
    return { ok: true, player: await getPlayerState(event, isAnonId(anonId) ? anonId : null) };
  } catch (error) {
    return errorResult(error);
  }
}

// "Login để submit" (NOTE-04 §21) theo đúng cách CDP định danh: không có tài khoản, hồ sơ ẩn
// danh được tạo im lặng ở lần báo đầu tiên — giống nút "Vẫn mở" (SPEC-chang-1 §2.3).
export async function reportSighting(formData) {
  let uploadedKey = null;
  try {
    const event = await requireEvent(formData.get("slug"));
    // Kiểm tra pha TRƯỚC mọi bước ghi: trước giờ rước không tạo cả hồ sơ ẩn danh (NOTE-05 §3).
    if (eventPhase(event) === EVENT_PHASE.PRE_GAME) {
      throw new GameInputError("Chưa tới giờ rước đèn, lượt báo chưa được ghi nhận.", "pre_game");
    }
    let anonId = formData.get("anonId")?.toString();
    let newProfile = null;
    let contributor = isAnonId(anonId) ? await getContributor(anonId) : null;
    if (!contributor) {
      contributor = await createContributor();
      anonId = contributor.anonId;
      newProfile = {
        anonId: contributor.anonId,
        nickname: contributor.nickname,
        recoveryCode: contributor.recoveryCode,
      };
    }

    const { photo, photoError } = await uploadSightingPhoto(event, formData.get("photo"), anonId);
    uploadedKey = photo?.storageKey ?? null;

    const result = await recordSighting(event, {
      anonId,
      nickname: contributor.nickname,
      objectId: formData.get("objectId")?.toString(),
      location: {
        lat: formData.get("lat"),
        lng: formData.get("lng"),
        accuracy: formData.get("accuracy"),
        locationSource: formData.get("locationSource")?.toString(),
      },
      photo,
    });
    uploadedKey = null;

    const [snapshot, player] = await Promise.all([
      getGameSnapshot(event),
      getPlayerState(event, anonId),
    ]);
    return {
      ok: true,
      newProfile,
      sightingId: result.sighting.id,
      objectId: result.object.id,
      isNewForUser: result.isNewForUser,
      isFirstDiscovery: result.isFirstDiscovery,
      hasPhoto: Boolean(photo),
      photoError,
      snapshot,
      player,
    };
  } catch (error) {
    // Lượt báo bị từ chối (cooldown, ngoài khu vực...) sau khi ảnh đã lên Blob: dọn đúng file đó.
    if (uploadedKey) await deleteMedia(uploadedKey).catch(() => {});
    return errorResult(error);
  }
}

export async function addPhotoToSighting(formData) {
  let uploadedKey = null;
  try {
    const event = await requireEvent(formData.get("slug"));
    const anonId = formData.get("anonId")?.toString();
    if (!isAnonId(anonId)) throw new GameInputError("Thiếu hồ sơ người chơi.");
    const { photo, photoError } = await uploadSightingPhoto(event, formData.get("photo"), anonId);
    if (!photo) throw new GameInputError(photoError ?? "Chưa chọn ảnh.");
    uploadedKey = photo.storageKey;
    await attachPhotoToSighting(event, {
      anonId,
      sightingId: formData.get("sightingId")?.toString(),
      photo,
    });
    uploadedKey = null;
    return { ok: true, player: await getPlayerState(event, anonId) };
  } catch (error) {
    if (uploadedKey) await deleteMedia(uploadedKey).catch(() => {});
    return errorResult(error);
  }
}

export async function reportWrongLocation({ slug, anonId, sightingId }) {
  try {
    const event = await requireEvent(slug);
    if (!isAnonId(anonId)) return { ok: true, counted: false };
    return { ok: true, counted: await flagSighting(event, { anonId, sightingId }) };
  } catch (error) {
    return errorResult(error);
  }
}
