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
import { appendSuggestion } from "@/lib/suggestions";
import { getBadge } from "@/lib/badges";

const MAX_PHOTOS_PER_SUBMIT = 3;
const MAX_PHOTO_BYTES = 8 * 1024 * 1024; // 8MB/ảnh

export async function startContributorProfile(nickname) {
  const profile = await createContributor(nickname);
  return { anonId: profile.anonId, nickname: profile.nickname, recoveryCode: profile.recoveryCode };
}

export async function recoverContributorProfile(code) {
  const profile = await recoverContributorByCode(code);
  if (!profile) return { ok: false, error: "Không tìm thấy mã này. Kiểm tra lại giúp em nhé." };
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
  const badge = profile.categoryId ? getBadge(profile.categoryId, profile.points) : null;
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
  if (Object.keys(cleanedFields).length === 0 && !note) {
    return { ok: false, error: "Chưa có gì để gửi." };
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
    note: note?.trim() || null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });

  return { ok: true };
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

  const uploaded = [];
  for (const file of files) {
    const blob = await put(`place-photos/${placeId}/${crypto.randomUUID()}-${file.name}`, file, {
      access: "public",
    });
    uploaded.push(blob.url);
  }

  for (const url of uploaded) {
    await appendSuggestion({
      id: `sugg-${crypto.randomUUID()}`,
      type: "photo",
      placeId,
      placeName,
      contributorId: anonId,
      contributorNickname: contributor?.nickname ?? "Người ẩn danh",
      status: "pending",
      photoUrl: url,
      note: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  }

  return { ok: true, count: uploaded.length };
}
