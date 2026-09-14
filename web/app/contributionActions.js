"use server";

import crypto from "crypto";
import {
  createContributor,
  getContributor,
  recoverContributorByCode,
  setContributorCategory,
  getNearbyStanding,
} from "@/lib/contributors";
import {
  appendSuggestion,
  appendSuggestions,
  findDuplicateCorrection,
  findDuplicatePhoto,
} from "@/lib/suggestions";
import { getBadge } from "@/lib/badges";
import { containsLinkOrPhone } from "@/lib/textFilter";
import { deleteMedia, uploadMedia } from "@/lib/mediaStorage";
import {
  MAX_CUSTOMER_MEDIA_PER_UPLOAD,
  processMediaFile,
} from "@/lib/mediaProcessing";
import { getLivePlaces } from "@/lib/redis";
import { getClosedPlace, replacementLocationOf } from "@/lib/closedPlaces";
import { createProposal } from "@/lib/proposals";
import { revalidatePath } from "next/cache";


export async function startContributorProfile(nickname) {
  const profile = await createContributor(nickname);
  return { anonId: profile.anonId, nickname: profile.nickname, recoveryCode: profile.recoveryCode };
}

export async function recoverContributorProfile(code) {
  const profile = await recoverContributorByCode(code);
  if (!profile) return { ok: false, error: "Không tìm thấy mã này. Kiểm tra lại." };
  return {
    ok: true,
    anonId: profile.anonId,
    nickname: profile.nickname,
    recoveryCode: profile.recoveryCode,
    categoryId: profile.categoryId,
  };
}

export async function chooseContributorCategory(anonId, categoryId) {
  await setContributorCategory(anonId, categoryId);
}

export async function getContributorStanding(anonId) {
  const profile = await getContributor(anonId);
  if (!profile) return null;
  const badge = profile.categoryId
    ? getBadge(profile.categoryId, profile.points, profile.legendaryBonus)
    : null;
  const standing = profile.categoryId
    ? await getNearbyStanding(profile.categoryId, anonId)
    : null;
  return { profile, badge, standing };
}

export async function submitCorrection({ anonId, placeId, placeName, fields, note }) {
  if (!anonId || !placeId) return { ok: false };
  const contributor = await getContributor(anonId);

  const cleanedFields = Object.fromEntries(
    Object.entries(fields ?? {}).filter(([, v]) => v !== null && v !== undefined && v !== "")
  );
  const cleanedNote = note?.trim() || null;
  if (Object.keys(cleanedFields).length === 0 && !cleanedNote) {
    return { ok: false, error: "Chưa có gì để gửi." };
  }
  if (cleanedFields.duplicateOfName && containsLinkOrPhone(cleanedFields.duplicateOfName)) {
    return { ok: false, error: "Không được chứa link hoặc số điện thoại." };
  }

  const duplicate = await findDuplicateCorrection(anonId, placeId, cleanedFields, cleanedNote);
  if (duplicate) {
    return {
      ok: false,
      error:
        duplicate.status === "approved"
          ? "Nội dung này đã được duyệt và áp dụng rồi."
          : "Nội dung này đang chờ duyệt rồi.",
    };
  }

  await appendSuggestion({
    id: `sugg-${crypto.randomUUID()}`,
    type: "correction",
    placeId,
    placeName,
    contributorId: anonId,
    contributorNickname: contributor?.nickname ?? "Người ẩn danh",
    status: "pending",
    fields: cleanedFields,
    note: cleanedNote,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });

  return { ok: true };
}

// Chỗ thay thế luôn là một proposal mới. Client chỉ gửi ID chỗ cũ và thông tin nhận diện của
// chỗ mới; vị trí được server đọc lại từ place/tombstone, không tin địa chỉ client tự gắn.
export async function submitReplacementProposal({ anonId, replacesPlaceId, name, type, note }) {
  if (!anonId || !replacesPlaceId) return { ok: false, error: "Thiếu thông tin." };
  const contributor = await getContributor(anonId);
  if (!contributor) return { ok: false, error: "Không tìm thấy hồ sơ đóng góp." };

  const livePlaces = await getLivePlaces();
  const oldPlace =
    livePlaces.find((place) => place.id === replacesPlaceId) ??
    (await getClosedPlace(replacesPlaceId));
  if (!oldPlace) return { ok: false, error: "Không tìm thấy địa điểm cũ." };

  const location = replacementLocationOf(oldPlace);
  const result = await createProposal({
    contributorId: anonId,
    name,
    type,
    ward: location.ward,
    address: location.address,
    localArea: location.localArea,
    coordinates: location.coordinates,
    note,
    replacesPlaceId,
    replacesPlaceName: oldPlace.name,
  });
  if (result.ok) revalidatePath("/admin");
  return result.ok ? { ok: true, proposalId: result.proposal.id } : result;
}

export async function submitPhotos(formData) {
  const anonId = formData.get("anonId")?.toString();
  const placeId = formData.get("placeId")?.toString();
  const placeName = formData.get("placeName")?.toString();
  const photoTag = formData.get("photoTag")?.toString() === "menu" ? "menu" : null;
  if (!anonId || !placeId) return { ok: false, error: "Thiếu thông tin." };

  const contributor = await getContributor(anonId);
  const files = formData.getAll("photos").filter((f) => f instanceof File && f.size > 0);
  if (files.length === 0) return { ok: false, error: "Chưa chọn ảnh nào." };
  if (files.length > MAX_CUSTOMER_MEDIA_PER_UPLOAD) {
    return {
      ok: false,
      error: `Bạn đã chọn ${files.length} ảnh. Mỗi lần chỉ gửi tối đa ${MAX_CUSTOMER_MEDIA_PER_UPLOAD} ảnh.`,
    };
  }

  // So mã băm nội dung ảnh — chặn gửi đúng 1 ảnh y hệt lần nữa cho cùng chỗ để ăn điểm,
  // vẫn cho gửi ảnh khác dù cùng chỗ. Ảnh trùng với bản đã `rejected` thì không chặn nữa —
  // findDuplicatePhoto() chỉ khớp bản `pending`/`approved` (xem lib/suggestions.js).
  let processed;
  try {
    processed = await Promise.all(files.map((file) => processMediaFile(file)));
  } catch (error) {
    return { ok: false, error: error?.message || "Không đọc được ảnh đã chọn." };
  }
  const toUpload = [];
  const duplicates = [];
  for (let i = 0; i < files.length; i++) {
    const duplicate = await findDuplicatePhoto(anonId, placeId, processed[i].contentHash);
    if (duplicate) duplicates.push(duplicate);
    else toUpload.push({ file: files[i], processed: processed[i] });
  }
  const skippedCount = duplicates.length;

  if (toUpload.length === 0) {
    return {
      ok: false,
      error: duplicates.some((d) => d.status === "approved")
        ? "Ảnh này đã được duyệt và áp dụng rồi."
        : "Ảnh này đang chờ duyệt rồi.",
    };
  }

  const uploaded = [];
  try {
    for (const { processed: image } of toUpload) {
      const blob = await uploadMedia(image.buffer, {
        placeId,
        extension: "webp",
        mimeType: image.mimeType,
      });
      const now = new Date().toISOString();
      uploaded.push({
        storageKey: blob.storageKey,
        suggestion: {
          id: `sugg-${crypto.randomUUID()}`,
          type: "photo",
          placeId,
          placeName,
          contributorId: anonId,
          contributorNickname: contributor?.nickname ?? "Người ẩn danh",
          status: "pending",
          media: {
            id: `media-${crypto.randomUUID()}`,
            storageKey: blob.storageKey,
            url: blob.url,
            width: image.width,
            height: image.height,
            bytes: image.bytes,
            mimeType: image.mimeType,
            caption: null,
            order: 0,
            roles: photoTag === "menu" ? ["menu"] : ["general"],
            source: "user",
            uploadedAt: now,
            uploadedBy: anonId,
            providerMeta: blob.providerMeta,
          },
          photoTag,
          contentHash: image.contentHash,
          note: null,
          createdAt: now,
          updatedAt: now,
        },
      });
    }
    await appendSuggestions(uploaded.map((item) => item.suggestion));
  } catch {
    // Nếu upload Blob xong nhưng Redis chưa nhận metadata, dọn đúng các file vừa tạo để
    // không sinh orphan. Không đụng các blob cũ hoặc file của lượt khác.
    await Promise.allSettled(uploaded.map((item) => deleteMedia(item.storageKey)));
    return { ok: false, error: "Chưa lưu được ảnh. Thử lại sau." };
  }

  return { ok: true, count: uploaded.length, skipped: skippedCount };
}
