// Lộ trình (Route) — thực thể ĐỘC LẬP với Sổ, theo CDP_P1-P8 §P4.
//
// Trước 2026-09-10 lộ trình chỉ là `notebook.mode = "route"`. Đảo lại vì khi mỗi điểm mang
// thêm GIỜ DỰ KIẾN, THỜI LƯỢNG, GHI CHÚ CHẶNG và cả lộ trình có PHƯƠNG TIỆN, thì nó khác Sổ
// về cấu trúc chứ không còn là cách hiển thị — nhồi mấy trường đó vào item của Sổ sẽ để lại
// một đống trường rỗng cho mọi cuốn sổ thường. Xem DECISIONS.md 2026-09-10.
//
// Khác Sổ ở 2 điểm nữa:
//   - Một điểm dừng có thể KHÔNG phải địa điểm của CDP ("Khách sạn của tôi", "Nhà bạn") —
//     lộ trình thật hay bắt đầu từ chỗ như vậy. Dùng `customTitle` thay cho `placeId`.
//   - Chia sẻ đi bằng BẢN CHỤP, không phải link tới bản gốc (xem lib/routeShare.js).
//
// `route:{slug}` chỉ có ĐÚNG 1 người ghi (chủ lộ trình) nên đọc-sửa-ghi cả JSON là an toàn,
// cùng lý do với lib/notebooks.js.

import { redis } from "./redis.js";
import { getLivePlaces } from "./redis.js";
import { containsLinkOrPhone } from "./textFilter.js";

const SLUG_CHARS = "23456789abcdefghjkmnpqrstuvwxyz"; // bỏ 0 O 1 l I — không gây nhầm lẫn
const SLUG_LENGTH = 8;
const MAX_ROUTES_PER_OWNER = 10;
const MAX_STOPS_PER_ROUTE = 30;
const MAX_TITLE_LENGTH = 60;
const MAX_NOTE_LENGTH = 140;
const MAX_CUSTOM_TITLE_LENGTH = 60;

// Phương tiện của cả lộ trình (§P4). Chưa làm phương tiện riêng từng chặng — đó là P7, mà P7
// còn cần toạ độ địa điểm (hiện 0/210 chỗ có toạ độ).
export const TRANSPORT_MODES = [
  { id: "xe-may", label: "Xe máy", mapsMode: "driving" },
  { id: "o-to", label: "Ô tô", mapsMode: "driving" },
  { id: "di-bo", label: "Đi bộ", mapsMode: "walking" },
  { id: "hon-hop", label: "Kết hợp", mapsMode: "driving" },
];

export function transportModeLabel(id) {
  return TRANSPORT_MODES.find((m) => m.id === id)?.label ?? null;
}

function routeKey(slug) {
  return `route:${slug}`;
}

function ownerListKey(anonId) {
  return `routes:by-owner:${anonId}`;
}

function randomSlug() {
  let s = "";
  for (let i = 0; i < SLUG_LENGTH; i++) {
    s += SLUG_CHARS[Math.floor(Math.random() * SLUG_CHARS.length)];
  }
  return s;
}

function assertOwner(route, anonId) {
  return Boolean(route) && Boolean(anonId) && route.ownerAnonId === anonId;
}

function cleanText(value, maxLength) {
  const text = (value ?? "").toString().trim().slice(0, maxLength);
  return text || null;
}

// Giờ dự kiến lưu dạng "HH:MM", KHÔNG kèm ngày: một lộ trình như "Ăn tối → gửi xe → Đêm hội"
// dùng lại được cho bất kỳ ngày nào. Ngày cụ thể (nếu cần) là việc của Post gắn lộ trình đó.
function cleanPlannedAt(value) {
  const text = (value ?? "").toString().trim();
  if (!text) return null;
  const match = text.match(/^(\d{1,2}):(\d{2})$/);
  if (!match) return null;
  const [, h, m] = match;
  if (Number(h) > 23 || Number(m) > 59) return null;
  return `${h.padStart(2, "0")}:${m}`;
}

function cleanDuration(value) {
  const n = Number(value);
  if (!Number.isFinite(n) || n <= 0) return null;
  return Math.min(Math.round(n), 24 * 60);
}

export async function getOwnedRouteSlugs(anonId) {
  if (!anonId) return [];
  return (await redis.smembers(ownerListKey(anonId))) ?? [];
}

export async function getRoute(slug) {
  if (!slug) return null;
  return (await redis.get(routeKey(slug))) ?? null;
}

export async function createRoute({ ownerAnonId, title, stops = [] }) {
  const owned = await getOwnedRouteSlugs(ownerAnonId);
  if (owned.length >= MAX_ROUTES_PER_OWNER) {
    return { ok: false, error: `Đã đủ ${MAX_ROUTES_PER_OWNER} lộ trình rồi bạn ơi.` };
  }
  const cleanTitle = cleanText(title, MAX_TITLE_LENGTH) ?? "Lộ trình của tôi";
  const now = new Date().toISOString();

  for (let attempt = 0; attempt < 5; attempt++) {
    const slug = randomSlug();
    const route = {
      slug,
      title: cleanTitle,
      ownerAnonId,
      transportMode: "xe-may",
      stops: stops.slice(0, MAX_STOPS_PER_ROUTE),
      copiedFrom: null,
      createdAt: now,
      updatedAt: now,
    };
    const created = await redis.set(routeKey(slug), route, { nx: true });
    if (created) {
      await redis.sadd(ownerListKey(ownerAnonId), slug);
      return { ok: true, slug };
    }
  }
  return { ok: false, error: "Không tạo được lộ trình, thử lại nhé." };
}

// "Tạo lộ trình từ sổ này" — lối vào chính ở chặng đầu: ai đã gom sẵn một cuốn sổ thì không
// phải bấm lại từng chỗ. Chép sang STOP, giữ nguyên thứ tự và ghi chú; sổ gốc không đổi.
export async function createRouteFromNotebook({ ownerAnonId, notebook, title }) {
  const stops = (notebook?.items ?? []).map((item) => ({
    placeId: item.placeId,
    customTitle: null,
    nameSnapshot: item.nameSnapshot ?? null,
    plannedAt: null,
    durationMinutes: null,
    note: item.note ?? null,
  }));
  return createRoute({ ownerAnonId, title: title ?? notebook?.title, stops });
}

export async function getRoutesSummary(anonId) {
  const slugs = await getOwnedRouteSlugs(anonId);
  if (slugs.length === 0) return [];
  const routes = await Promise.all(slugs.map((slug) => getRoute(slug)));
  return routes
    .filter(Boolean)
    .map((r) => ({ slug: r.slug, title: r.title, stopCount: r.stops.length, updatedAt: r.updatedAt }))
    .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
}

export async function addStopToRoute({ anonId, slug, placeId, nameSnapshot }) {
  const route = await getRoute(slug);
  if (!assertOwner(route, anonId)) return { ok: false, error: "Không tìm thấy lộ trình." };
  if (route.stops.some((s) => s.placeId === placeId)) return { ok: true, already: true };
  if (route.stops.length >= MAX_STOPS_PER_ROUTE) {
    return { ok: false, error: `Lộ trình đã đủ ${MAX_STOPS_PER_ROUTE} điểm rồi.` };
  }
  route.stops.push({
    placeId,
    customTitle: null,
    nameSnapshot: nameSnapshot ?? null,
    plannedAt: null,
    durationMinutes: null,
    note: null,
  });
  route.updatedAt = new Date().toISOString();
  await redis.set(routeKey(slug), route);
  return { ok: true };
}

// Điểm tự đặt tên: "Khách sạn của tôi", "Nhà bạn Nam" — thứ không có trong danh bạ CDP nhưng
// vẫn là một chặng thật của chuyến đi (§P4 lấy ví dụ "Khách sạn → Ăn tối → ...").
export async function addCustomStopToRoute({ anonId, slug, customTitle }) {
  const route = await getRoute(slug);
  if (!assertOwner(route, anonId)) return { ok: false, error: "Không tìm thấy lộ trình." };
  const cleanTitle = cleanText(customTitle, MAX_CUSTOM_TITLE_LENGTH);
  if (!cleanTitle) return { ok: false, error: "Chưa nhập tên điểm." };
  if (containsLinkOrPhone(cleanTitle)) {
    return { ok: false, error: "Không được chứa link hoặc số điện thoại." };
  }
  if (route.stops.length >= MAX_STOPS_PER_ROUTE) {
    return { ok: false, error: `Lộ trình đã đủ ${MAX_STOPS_PER_ROUTE} điểm rồi.` };
  }
  route.stops.push({
    placeId: null,
    customTitle: cleanTitle,
    nameSnapshot: null,
    plannedAt: null,
    durationMinutes: null,
    note: null,
  });
  route.updatedAt = new Date().toISOString();
  await redis.set(routeKey(slug), route);
  return { ok: true };
}

// Điểm nhận diện bằng VỊ TRÍ trong mảng, không phải placeId: một lộ trình được phép đi qua
// cùng một chỗ 2 lần (ăn sáng rồi tối quay lại), và điểm tự đặt tên thì không có placeId.
export async function removeStopFromRoute({ anonId, slug, index }) {
  const route = await getRoute(slug);
  if (!assertOwner(route, anonId)) return { ok: false, error: "Không tìm thấy lộ trình." };
  if (!Number.isInteger(index) || index < 0 || index >= route.stops.length) {
    return { ok: false, error: "Không tìm thấy điểm này." };
  }
  route.stops.splice(index, 1);
  route.updatedAt = new Date().toISOString();
  await redis.set(routeKey(slug), route);
  return { ok: true };
}

export async function updateStop({ anonId, slug, index, plannedAt, durationMinutes, note }) {
  const route = await getRoute(slug);
  if (!assertOwner(route, anonId)) return { ok: false, error: "Không tìm thấy lộ trình." };
  const stop = route.stops[index];
  if (!stop) return { ok: false, error: "Không tìm thấy điểm này." };

  const cleanNote = cleanText(note, MAX_NOTE_LENGTH);
  if (cleanNote && containsLinkOrPhone(cleanNote)) {
    return { ok: false, error: "Ghi chú không được chứa link hoặc số điện thoại." };
  }
  if (plannedAt !== undefined) stop.plannedAt = cleanPlannedAt(plannedAt);
  if (durationMinutes !== undefined) stop.durationMinutes = cleanDuration(durationMinutes);
  if (note !== undefined) stop.note = cleanNote;

  route.updatedAt = new Date().toISOString();
  await redis.set(routeKey(slug), route);
  return { ok: true };
}

export async function reorderStops({ anonId, slug, order }) {
  const route = await getRoute(slug);
  if (!assertOwner(route, anonId)) return { ok: false, error: "Không tìm thấy lộ trình." };
  if (!Array.isArray(order) || order.length !== route.stops.length) {
    return { ok: false, error: "Danh sách thứ tự không khớp." };
  }
  const seen = new Set(order);
  if (seen.size !== order.length || order.some((i) => !Number.isInteger(i) || !route.stops[i])) {
    return { ok: false, error: "Danh sách thứ tự không khớp." };
  }
  route.stops = order.map((i) => route.stops[i]);
  route.updatedAt = new Date().toISOString();
  await redis.set(routeKey(slug), route);
  return { ok: true };
}

export async function updateRouteTitle({ anonId, slug, title }) {
  const route = await getRoute(slug);
  if (!assertOwner(route, anonId)) return { ok: false, error: "Không tìm thấy lộ trình." };
  const cleanTitle = cleanText(title, MAX_TITLE_LENGTH);
  if (!cleanTitle) return { ok: false, error: "Tên lộ trình không được để trống." };
  route.title = cleanTitle;
  route.updatedAt = new Date().toISOString();
  await redis.set(routeKey(slug), route);
  return { ok: true };
}

export async function updateTransportMode({ anonId, slug, transportMode }) {
  const route = await getRoute(slug);
  if (!assertOwner(route, anonId)) return { ok: false, error: "Không tìm thấy lộ trình." };
  if (!TRANSPORT_MODES.some((m) => m.id === transportMode)) {
    return { ok: false, error: "Phương tiện không hợp lệ." };
  }
  route.transportMode = transportMode;
  route.updatedAt = new Date().toISOString();
  await redis.set(routeKey(slug), route);
  return { ok: true };
}

export async function deleteRoute({ anonId, slug }) {
  const route = await getRoute(slug);
  if (!assertOwner(route, anonId)) return { ok: false, error: "Không tìm thấy lộ trình." };
  await redis.del(routeKey(slug));
  await redis.srem(ownerListKey(anonId), slug);
  return { ok: true };
}

/**
 * Gắn dữ liệu địa điểm mới nhất vào từng điểm dừng.
 * Chỗ đã bị xoá khỏi danh bạ -> `deleted: true` + tên đã lưu lúc thêm, giống cách Sổ làm:
 * khách vẫn thấy tên chứ không phải một dòng trống.
 */
export async function resolveRouteStops(stops) {
  const places = await getLivePlaces();
  const placeMap = new Map(places.map((p) => [p.id, p]));
  return (stops ?? []).map((stop) => {
    if (!stop.placeId) return { ...stop, place: null, deleted: false }; // điểm tự đặt tên
    const place = placeMap.get(stop.placeId);
    if (place) return { ...stop, place, deleted: false };
    return { ...stop, place: null, deleted: true };
  });
}

/** Tên hiển thị của một điểm dừng, dù nó là địa điểm CDP hay điểm tự đặt tên. */
export function stopTitle(stop) {
  return stop.customTitle ?? stop.place?.name ?? stop.nameSnapshot ?? "Điểm đã bị xoá";
}
