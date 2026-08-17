"use server";

import { createContributor } from "@/lib/contributors";
import {
  getNotebook,
  getNotebooksSummary,
  createNotebook,
  addItemToNotebook,
  removeItemFromNotebook,
  updateItemNote,
  updateNotebookTitle,
  reorderItems,
  copyNotebook,
  incrementNotebookView,
  resolveNotebookItems,
} from "@/lib/notebooks";

// SPEC-chang-4.md §5 quy tắc 1: không cần đăng nhập, chưa có hồ sơ thì tự tạo im lặng —
// giống hệt Chặng 1 §2.3.
async function ensureProfile(anonId) {
  if (anonId) return { anonId, newProfile: null };
  const profile = await createContributor();
  return {
    anonId: profile.anonId,
    newProfile: {
      anonId: profile.anonId,
      nickname: profile.nickname,
      recoveryCode: profile.recoveryCode,
    },
  };
}

export async function getMyNotebooks(anonId) {
  if (!anonId) return [];
  return getNotebooksSummary(anonId);
}

export async function addPlaceToNotebook({ anonId, slug, placeId, nameSnapshot }) {
  if (!slug || !placeId) return { ok: false };
  const { anonId: currentAnonId, newProfile } = await ensureProfile(anonId);
  const result = await addItemToNotebook({ anonId: currentAnonId, slug, placeId, nameSnapshot });
  return { ...result, anonId: currentAnonId, newProfile };
}

export async function createNotebookAndAddPlace({ anonId, title, placeId, nameSnapshot }) {
  if (!placeId) return { ok: false };
  const { anonId: currentAnonId, newProfile } = await ensureProfile(anonId);
  const created = await createNotebook(currentAnonId, title);
  if (!created.ok) return { ...created, anonId: currentAnonId, newProfile };
  const result = await addItemToNotebook({
    anonId: currentAnonId,
    slug: created.slug,
    placeId,
    nameSnapshot,
  });
  return { ...result, slug: created.slug, anonId: currentAnonId, newProfile };
}

export async function removePlaceFromNotebook({ anonId, slug, placeId }) {
  if (!anonId || !slug || !placeId) return { ok: false };
  return removeItemFromNotebook({ anonId, slug, placeId });
}

export async function updateNotebookItemNote({ anonId, slug, placeId, note }) {
  if (!anonId || !slug || !placeId) return { ok: false };
  return updateItemNote({ anonId, slug, placeId, note });
}

export async function renameNotebook({ anonId, slug, title }) {
  if (!anonId || !slug) return { ok: false };
  return updateNotebookTitle({ anonId, slug, title });
}

export async function reorderNotebookItems({ anonId, slug, orderedPlaceIds }) {
  if (!anonId || !slug || !Array.isArray(orderedPlaceIds)) return { ok: false };
  return reorderItems({ anonId, slug, orderedPlaceIds });
}

// §3.4 — "Lưu sổ này thành sổ của tôi". Người xem chưa có hồ sơ vẫn bấm được (tự tạo im lặng).
export async function saveNotebookAsMine({ anonId, sourceSlug }) {
  if (!sourceSlug) return { ok: false };
  const { anonId: currentAnonId, newProfile } = await ensureProfile(anonId);
  const result = await copyNotebook({ sourceSlug, newOwnerAnonId: currentAnonId });
  return { ...result, anonId: currentAnonId, newProfile };
}

// Gọi từ trình duyệt (không phải lúc server render) — bot quét link tạo preview (Zalo,
// Facebook...) không chạy JavaScript nên không bị tính vào đây (xem lib/notebooks.js).
export async function logNotebookView(slug) {
  if (!slug) return;
  await incrementNotebookView(slug);
}

// Trang sửa sổ — Server Action tự kiểm tra đúng chủ sổ, không tin giao diện chặn hộ (Next.js
// data-security: action luôn gọi được trực tiếp bất kể UI).
export async function getNotebookForEdit({ anonId, slug }) {
  if (!slug) return { ok: false, notFound: true };
  const notebook = await getNotebook(slug);
  if (!notebook) return { ok: false, notFound: true };
  if (!anonId || notebook.ownerAnonId !== anonId) return { ok: false, forbidden: true };
  const items = await resolveNotebookItems(notebook.items);
  return {
    ok: true,
    notebook: { slug: notebook.slug, title: notebook.title, items },
  };
}
