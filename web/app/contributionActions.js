"use server";

import crypto from "crypto";
import { put } from "@vercel/blob";
import {
  createContributor,
  getContributor,
  recoverContributorByCode,
  setContributorCategory,
  getNearbyStanding,
} from "@/lib/contributors";
import { appendSuggestion, findDuplicateCorrection, findDuplicatePhoto } from "@/lib/suggestions";
import { getBadge } from "@/lib/badges";
import { containsLinkOrPhone } from "@/lib/textFilter";

const MAX_PHOTOS_PER_SUBMIT = 3;
const MAX_PHOTO_BYTES = 8 * 1024 * 1024; // 8MB/ảnh

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

function hashFile(buffer) {
  return crypto.createHash("sha256").update(buffer).digest("hex");
}

export async function submitPhotos(formData) {
  const anonId = formData.get("anonId")?.toString();
  const placeId = formData.get("placeId")?.toString();
  const placeName = formData.get("placeName")?.toString();
  if (!anonId || !placeId) return { ok: false, error: "Thiếu thông tin." };

  const contributor = await getContributor(anonId);
  const files = formData.getAll("photos").filter((f) => f instanceof File && f.size > 0);
  if (files.length === 0) return { ok: false, error: "Chưa chọn ảnh nào." };
  if (files.length > MAX_PHOTOS_PER_SUBMIT) {
    return { ok: false, error: `Gửi tối đa ${MAX_PHOTOS_PER_SUBMIT} ảnh mỗi lần.` };
  }
  for (const file of files) {
    if (file.size > MAX_PHOTO_BYTES) {
      return { ok: false, error: `Ảnh "${file.name}" quá lớn (tối đa 8MB).` };
    }
  }

  // So mã băm nội dung ảnh — chặn gửi đúng 1 ảnh y hệt lần nữa cho cùng chỗ để ăn điểm,
  // vẫn cho gửi ảnh khác dù cùng chỗ. Ảnh trùng với bản đã `rejected` thì không chặn nữa —
  // findDuplicatePhoto() chỉ khớp bản `pending`/`approved` (xem lib/suggestions.js).
  const buffers = await Promise.all(files.map(async (f) => Buffer.from(await f.arrayBuffer())));
  const hashes = buffers.map(hashFile);
  const toUpload = [];
  const duplicates = [];
  for (let i = 0; i < files.length; i++) {
    const duplicate = await findDuplicatePhoto(anonId, placeId, hashes[i]);
    if (duplicate) duplicates.push(duplicate);
    else toUpload.push({ file: files[i], buffer: buffers[i], hash: hashes[i] });
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
  for (const { file, buffer, hash } of toUpload) {
    const blob = await put(`place-photos/${placeId}/${crypto.randomUUID()}-${file.name}`, buffer, {
      access: "public",
      contentType: file.type || "image/jpeg",
    });
    uploaded.push({ url: blob.url, hash });
  }

  for (const { url, hash } of uploaded) {
    await appendSuggestion({
      id: `sugg-${crypto.randomUUID()}`,
      type: "photo",
      placeId,
      placeName,
      contributorId: anonId,
      contributorNickname: contributor?.nickname ?? "Người ẩn danh",
      status: "pending",
      photoUrl: url,
      contentHash: hash,
      note: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  }

  return { ok: true, count: uploaded.length, skipped: skippedCount };
}
