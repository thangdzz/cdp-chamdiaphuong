// Sổ chia sẻ được (Chặng 4) — SPEC-chang-4.md. `notebook:{slug}` chỉ có ĐÚNG 1 người ghi
// (chủ sổ), nên đọc-sửa-ghi cả JSON là an toàn (khác Chặng 1-2, thao tác của nhiều người lạ
// cùng lúc). Riêng danh sách sổ theo chủ (`notebooks:by-owner`) và bộ đếm view/copy
// (`notebook:stats`) dùng lệnh nguyên tử vì lý do khác nhau — xem chú thích tại chỗ.

import { redis } from "./redis.js";
import { getLivePlaces } from "./redis.js";
import { containsLinkOrPhone } from "./textFilter.js";

const SLUG_CHARS = "23456789abcdefghjkmnpqrstuvwxyz"; // bỏ 0 O 1 l I — không gây nhầm lẫn
const SLUG_LENGTH = 8;
const MAX_NOTEBOOKS_PER_OWNER = 10;
const MAX_ITEMS_PER_NOTEBOOK = 30;
const MAX_TITLE_LENGTH = 60;
const MAX_NOTE_LENGTH = 140;
const STATS_KEY = "notebook:stats";
const TOTAL_COUNT_KEY = "notebook:count:total";

function notebookKey(slug) {
  return `notebook:${slug}`;
}

function ownerListKey(anonId) {
  return `notebooks:by-owner:${anonId}`;
}

function randomSlug() {
  let s = "";
  for (let i = 0; i < SLUG_LENGTH; i++) {
    s += SLUG_CHARS[Math.floor(Math.random() * SLUG_CHARS.length)];
  }
  return s;
}

// SADD/SMEMBERS (không phải mảng-1-key) — dù chỉ 1 người ghi vào key này, dùng lệnh nguyên
// tử để 2 tab của cùng 1 người tạo sổ gần như đồng thời không đè mất lượt của nhau.
export async function getOwnedSlugs(anonId) {
  if (!anonId) return [];
  const slugs = await redis.smembers(ownerListKey(anonId));
  return slugs ?? [];
}

export async function getNotebook(slug) {
  if (!slug) return null;
  return (await redis.get(notebookKey(slug))) ?? null;
}

export async function createNotebook(ownerAnonId, title) {
  const owned = await getOwnedSlugs(ownerAnonId);
  if (owned.length >= MAX_NOTEBOOKS_PER_OWNER) {
    return { ok: false, error: `Đã đủ ${MAX_NOTEBOOKS_PER_OWNER} sổ rồi bạn ơi.` };
  }
  const cleanTitle = (title ?? "").toString().trim().slice(0, MAX_TITLE_LENGTH) || "Sổ của tôi";
  const now = new Date().toISOString();

  for (let attempt = 0; attempt < 5; attempt++) {
    const slug = randomSlug();
    const notebook = {
      slug,
      title: cleanTitle,
      ownerAnonId,
      items: [],
      copiedFrom: null,
      createdAt: now,
      updatedAt: now,
    };
    const created = await redis.set(notebookKey(slug), notebook, { nx: true });
    if (created === "OK") {
      await redis.sadd(ownerListKey(ownerAnonId), slug);
      await redis.incr(TOTAL_COUNT_KEY);
      return { ok: true, slug };
    }
  }
  return { ok: false, error: "Không tạo được sổ, thử lại sau." };
}

export async function getNotebooksSummary(anonId) {
  const slugs = await getOwnedSlugs(anonId);
  if (slugs.length === 0) return [];
  const notebooks = await redis.mget(...slugs.map(notebookKey));
  return notebooks
    .filter(Boolean)
    .map((nb) => ({ slug: nb.slug, title: nb.title, itemCount: nb.items.length }));
}

function assertOwner(notebook, anonId) {
  return notebook && anonId && notebook.ownerAnonId === anonId;
}

export async function addItemToNotebook({ anonId, slug, placeId, nameSnapshot }) {
  const notebook = await getNotebook(slug);
  if (!assertOwner(notebook, anonId)) return { ok: false, error: "Không tìm thấy sổ." };
  if (notebook.items.some((it) => it.placeId === placeId)) {
    return { ok: true, alreadyAdded: true };
  }
  if (notebook.items.length >= MAX_ITEMS_PER_NOTEBOOK) {
    return { ok: false, error: `Sổ đã đủ ${MAX_ITEMS_PER_NOTEBOOK} chỗ rồi.` };
  }
  notebook.items.push({ placeId, nameSnapshot: nameSnapshot ?? null, note: null });
  notebook.updatedAt = new Date().toISOString();
  await redis.set(notebookKey(slug), notebook);
  return { ok: true, alreadyAdded: false };
}

export async function removeItemFromNotebook({ anonId, slug, placeId }) {
  const notebook = await getNotebook(slug);
  if (!assertOwner(notebook, anonId)) return { ok: false, error: "Không tìm thấy sổ." };
  notebook.items = notebook.items.filter((it) => it.placeId !== placeId);
  notebook.updatedAt = new Date().toISOString();
  await redis.set(notebookKey(slug), notebook);
  return { ok: true };
}

export async function updateItemNote({ anonId, slug, placeId, note }) {
  const notebook = await getNotebook(slug);
  if (!assertOwner(notebook, anonId)) return { ok: false, error: "Không tìm thấy sổ." };
  const cleanNote = (note ?? "").toString().trim().slice(0, MAX_NOTE_LENGTH) || null;
  if (cleanNote && containsLinkOrPhone(cleanNote)) {
    return { ok: false, error: "Ghi chú không được chứa link hoặc số điện thoại." };
  }
  const item = notebook.items.find((it) => it.placeId === placeId);
  if (!item) return { ok: false, error: "Chỗ này không có trong sổ." };
  item.note = cleanNote;
  notebook.updatedAt = new Date().toISOString();
  await redis.set(notebookKey(slug), notebook);
  return { ok: true };
}

export async function updateNotebookTitle({ anonId, slug, title }) {
  const notebook = await getNotebook(slug);
  if (!assertOwner(notebook, anonId)) return { ok: false, error: "Không tìm thấy sổ." };
  const cleanTitle = (title ?? "").toString().trim().slice(0, MAX_TITLE_LENGTH);
  if (!cleanTitle) return { ok: false, error: "Tên sổ không được để trống." };
  notebook.title = cleanTitle;
  notebook.updatedAt = new Date().toISOString();
  await redis.set(notebookKey(slug), notebook);
  return { ok: true };
}

export async function reorderItems({ anonId, slug, orderedPlaceIds }) {
  const notebook = await getNotebook(slug);
  if (!assertOwner(notebook, anonId)) return { ok: false, error: "Không tìm thấy sổ." };
  const byId = new Map(notebook.items.map((it) => [it.placeId, it]));
  const reordered = orderedPlaceIds.map((id) => byId.get(id)).filter(Boolean);
  if (reordered.length !== notebook.items.length) {
    return { ok: false, error: "Danh sách thứ tự không khớp." };
  }
  notebook.items = reordered;
  notebook.updatedAt = new Date().toISOString();
  await redis.set(notebookKey(slug), notebook);
  return { ok: true };
}

// "Lưu sổ này thành sổ của tôi" (§3.4) — mắt xích của vòng lan truyền: người nhận thành
// người gửi. Sổ gốc không đổi, sổ mới có copiedFrom trỏ về sổ gốc.
export async function copyNotebook({ sourceSlug, newOwnerAnonId }) {
  const source = await getNotebook(sourceSlug);
  if (!source) return { ok: false, error: "Không tìm thấy sổ." };
  const owned = await getOwnedSlugs(newOwnerAnonId);
  if (owned.length >= MAX_NOTEBOOKS_PER_OWNER) {
    return { ok: false, error: `Đã đủ ${MAX_NOTEBOOKS_PER_OWNER} sổ rồi bạn ơi.` };
  }
  const now = new Date().toISOString();
  for (let attempt = 0; attempt < 5; attempt++) {
    const slug = randomSlug();
    const notebook = {
      slug,
      title: source.title,
      ownerAnonId: newOwnerAnonId,
      items: source.items.map((it) => ({ ...it })),
      copiedFrom: sourceSlug,
      createdAt: now,
      updatedAt: now,
    };
    const created = await redis.set(notebookKey(slug), notebook, { nx: true });
    if (created === "OK") {
      await redis.sadd(ownerListKey(newOwnerAnonId), slug);
      await redis.incr(TOTAL_COUNT_KEY);
      await redis.hincrby(STATS_KEY, `${sourceSlug}:copies`, 1);
      return { ok: true, slug };
    }
  }
  return { ok: false, error: "Không tạo được sổ, thử lại sau." };
}

// §7: đếm bằng HINCRBY trên key riêng, không đọc-sửa-ghi cả JSON sổ mỗi lượt xem — vừa tốn
// lệnh vừa mất dữ liệu khi nhiều người mở cùng lúc. Gọi từ trình duyệt (không phải lúc
// server render trang) để không đếm nhầm lượt bot Zalo/Facebook quét link tạo preview.
export async function incrementNotebookView(slug) {
  await redis.hincrby(STATS_KEY, `${slug}:views`, 1);
}

export async function getAdminNotebookStats() {
  const totalNotebooks = (await redis.get(TOTAL_COUNT_KEY)) ?? 0;
  const stats = (await redis.hgetall(STATS_KEY)) ?? {};
  let totalViews = 0;
  let totalCopies = 0;
  for (const [field, value] of Object.entries(stats)) {
    if (field.endsWith(":views")) totalViews += Number(value) || 0;
    else if (field.endsWith(":copies")) totalCopies += Number(value) || 0;
  }
  return { totalNotebooks, totalViews, totalCopies };
}

// Tra sang places:live MỘT LẦN (không đụng dữ liệu chỗ, chỉ đọc) rồi ghép vào items — chỗ đổi
// giá/địa chỉ thì sổ tự cập nhật theo (§4.3). Chỗ bị xoá thì dùng nameSnapshot làm phao cứu.
export async function resolveNotebookItems(items) {
  const places = await getLivePlaces();
  const placeMap = new Map(places.map((p) => [p.id, p]));
  return items.map((item) => {
    const place = placeMap.get(item.placeId);
    if (place) return { ...item, place, deleted: false };
    return { ...item, place: null, deleted: true };
  });
}
