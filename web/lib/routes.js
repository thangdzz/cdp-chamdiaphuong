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
import { getProposalIndex, PROPOSAL_STATUS } from "./proposals.js";
import { DEFAULT_PROVINCE, PROVINCES, isValidProvince, normalizeProvince } from "./provinces.js";
import { routeStorageKey } from "./routeStorageKeys.js";
import { normalizeForSearch } from "./placeTextSearch.js";
import { cleanCoordinates } from "./coordinates.js";
import { getAllLocationConsensus } from "./locationVotes.js";
import { cleanPickupSelection, isPickupService, PICKUP_SELECTION_TYPES, sanitizeStoredPickupSelection } from "./pickupPoints.js";

const SLUG_CHARS = "23456789abcdefghjkmnpqrstuvwxyz"; // bỏ 0 O 1 l I — không gây nhầm lẫn
const SLUG_LENGTH = 8;
const MAX_ROUTES_PER_OWNER = 10;
const MAX_STOPS_PER_ROUTE = 30;
const MAX_TITLE_LENGTH = 60;
const MAX_NOTE_LENGTH = 140;
const MAX_CUSTOM_TITLE_LENGTH = 60;
const MAX_CUSTOM_ADDRESS_LENGTH = 120;

// Phương tiện của cả lộ trình (§P4). Chưa làm phương tiện riêng từng chặng — đó là P7, mà P7
// còn cần toạ độ địa điểm (hiện 0/210 chỗ có toạ độ).
export const TRANSPORT_MODES = [
  { id: "xe-may", label: "Xe máy", mapsMode: "driving" },
  { id: "o-to", label: "Ô tô", mapsMode: "driving" },
  { id: "di-bo", label: "Đi bộ", mapsMode: "walking" },
  { id: "hon-hop", label: "Kết hợp", mapsMode: "driving" },
];

// Ba loại điểm dừng (NOTE-07 §7). Route CŨ chỉ có `placeId`/`customTitle`, không có `type` —
// normalizeStop() suy ra, KHÔNG cần chạy migration cả Redis (§14).
export const STOP_TYPES = { CDP_PLACE: "cdp_place", PROPOSED: "proposed_place", CUSTOM: "custom_stop" };

export function normalizeStop(stop) {
  if (stop.type) return stop;
  return { ...stop, type: stop.placeId ? STOP_TYPES.CDP_PLACE : STOP_TYPES.CUSTOM };
}

export function transportModeLabel(id) {
  return TRANSPORT_MODES.find((m) => m.id === id)?.label ?? null;
}

function routeKey(slug) {
  return routeStorageKey(`route:${slug}`);
}

function ownerListKey(anonId) {
  return routeStorageKey(`routes:by-owner:${anonId}`);
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

export async function createRoute({
  ownerAnonId,
  title,
  stops = [],
  transportMode = "xe-may",
  copiedFrom = null,
}) {
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
      transportMode: TRANSPORT_MODES.some((mode) => mode.id === transportMode)
        ? transportMode
        : "xe-may",
      stops: stops.slice(0, MAX_STOPS_PER_ROUTE),
      copiedFrom,
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

function provinceFromSharedStop(stop) {
  if (isValidProvince(stop.customProvince)) return stop.customProvince;
  const mapsQuery = (stop.mapsQuery ?? "").toString();
  return PROVINCES.find((province) => mapsQuery.includes(province)) ?? DEFAULT_PROVINCE;
}

// Pure mapper để test backward compatibility mà không ghi Redis. Snapshot mới giữ đủ field;
// snapshot cũ thiếu proposalId/customProvince được hạ thành điểm riêng có tên + mapsQuery,
// không tạo một proposed stop rỗng rồi gãy lúc mở trang sửa.
export function routeStopsFromShareSnapshot(stops) {
  return (stops ?? []).slice(0, MAX_STOPS_PER_ROUTE).map((rawStop) => {
    const stop = rawStop ?? {};
    const common = {
      plannedAt: cleanPlannedAt(stop.plannedAt),
      durationMinutes: cleanDuration(stop.durationMinutes),
      note: cleanText(stop.note, MAX_NOTE_LENGTH),
    };

    if ((!stop.type || stop.type === STOP_TYPES.CDP_PLACE) && stop.placeId) {
      const pickupSelection = sanitizeStoredPickupSelection(stop.pickupSelection);
      return {
        type: STOP_TYPES.CDP_PLACE,
        placeId: stop.placeId,
        customTitle: null,
        nameSnapshot: cleanText(stop.nameSnapshot ?? stop.title, MAX_CUSTOM_TITLE_LENGTH),
        // NOTE-14 §14: điểm đón đã chọn đi theo bản copy — người nhận không phải chọn lại.
        ...(pickupSelection ? { pickupSelection } : {}),
        ...common,
      };
    }

    if (stop.type === STOP_TYPES.PROPOSED && stop.proposalId) {
      return {
        type: STOP_TYPES.PROPOSED,
        placeId: null,
        proposalId: stop.proposalId,
        customTitle: null,
        customAddress: cleanText(stop.customAddress ?? stop.address, MAX_CUSTOM_ADDRESS_LENGTH),
        customProvince: provinceFromSharedStop(stop),
        nameSnapshot: cleanText(stop.nameSnapshot ?? stop.title, MAX_CUSTOM_TITLE_LENGTH),
        ...common,
      };
    }

    // Ghim đã xác nhận đi theo bản copy: người nhận khỏi phải kéo lại đúng chỗ đó lần nữa.
    const coordinates = cleanCoordinates(stop.coordinates);
    return {
      type: STOP_TYPES.CUSTOM,
      placeId: null,
      customTitle: cleanText(stop.customTitle ?? stop.title, MAX_CUSTOM_TITLE_LENGTH) ?? "Điểm riêng",
      customAddress: cleanText(
        stop.customAddress ?? stop.address ?? stop.mapsQuery,
        MAX_CUSTOM_ADDRESS_LENGTH,
      ),
      customProvince: provinceFromSharedStop(stop),
      ...(coordinates ? { coordinates } : {}),
      nameSnapshot: null,
      ...common,
    };
  });
}

export async function copyRouteFromShare({ ownerAnonId, shareToken, snapshot }) {
  if (!snapshot?.stops?.length) {
    return { ok: false, error: "Lộ trình chia sẻ không có điểm nào để lưu." };
  }
  return createRoute({
    ownerAnonId,
    title: snapshot.title,
    transportMode: snapshot.transportMode,
    stops: routeStopsFromShareSnapshot(snapshot.stops),
    // Route copy bắt nguồn từ BẢN CHỤP, không phải route sống: route gốc có thể đã đổi/xoá.
    copiedFrom: `route_share:${shareToken}`,
  });
}

// "Tạo lộ trình từ sổ này" — lối vào chính ở chặng đầu: ai đã gom sẵn một cuốn sổ thì không
// phải bấm lại từng chỗ. Chép sang STOP, giữ nguyên thứ tự và ghi chú; sổ gốc không đổi.
export async function createRouteFromNotebook({ ownerAnonId, notebook, title }) {
  const stops = (notebook?.items ?? []).map((item) => ({
    type: STOP_TYPES.CDP_PLACE,
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

// Cùng một chỗ được phép nằm trong lộ trình NHIỀU LẦN (2026-09-11): "về khách sạn nghỉ trưa
// rồi tối lại về ngủ" là một chặng thật, không phải thao tác thừa. Trước đây bấm lần hai bị
// bỏ qua im lặng, khách tưởng nút hỏng.
export async function addStopToRoute({ anonId, slug, placeId, nameSnapshot }) {
  const route = await getRoute(slug);
  if (!assertOwner(route, anonId)) return { ok: false, error: "Không tìm thấy lộ trình." };
  const repeat = route.stops.some((s) => s.placeId === placeId);
  if (route.stops.length >= MAX_STOPS_PER_ROUTE) {
    return { ok: false, error: `Lộ trình đã đủ ${MAX_STOPS_PER_ROUTE} điểm rồi.` };
  }
  route.stops.push({
    type: STOP_TYPES.CDP_PLACE,
    placeId,
    customTitle: null,
    nameSnapshot: nameSnapshot ?? null,
    plannedAt: null,
    durationMinutes: null,
    note: null,
  });
  route.updatedAt = new Date().toISOString();
  await redis.set(routeKey(slug), route);
  return { ok: true, repeat };
}

// Thêm NHIỀU địa điểm trong một lượt — PlacePicker chọn xong mới bấm "Thêm N điểm" (§5).
// Chỗ đã có trong lộ trình vẫn thêm được lần nữa (xem addStopToRoute) — bộ chọn có nhãn báo
// trước "đã có trong lộ trình" để khách biết mình đang thêm lần hai, chứ không chặn.
export async function addPlacesToRoute({ anonId, slug, places }) {
  const route = await getRoute(slug);
  if (!assertOwner(route, anonId)) return { ok: false, error: "Không tìm thấy lộ trình." };
  let added = 0;
  for (const place of places ?? []) {
    if (!place?.id) continue;
    if (route.stops.length >= MAX_STOPS_PER_ROUTE) break;
    route.stops.push({
      type: STOP_TYPES.CDP_PLACE,
      placeId: place.id,
      customTitle: null,
      nameSnapshot: place.name ?? null,
      plannedAt: null,
      durationMinutes: null,
      note: null,
    });
    added++;
  }
  if (added === 0) return { ok: true, added: 0 };
  route.updatedAt = new Date().toISOString();
  await redis.set(routeKey(slug), route);
  return { ok: true, added };
}

// Địa điểm khách ĐỀ XUẤT (NOTE-07 §6.B): vào lộ trình NGAY, đồng thời xếp hàng chờ admin.
// Lộ trình chỉ giữ `proposalId` — trạng thái (chờ / đã duyệt / bị từ chối) tra lúc đọc, nên
// admin duyệt là mọi lộ trình tự đổi theo, không phải sửa từng cái.
export async function addProposedStopToRoute({ anonId, slug, proposalId, name }) {
  const route = await getRoute(slug);
  if (!assertOwner(route, anonId)) return { ok: false, error: "Không tìm thấy lộ trình." };
  if (route.stops.length >= MAX_STOPS_PER_ROUTE) {
    return { ok: false, error: `Lộ trình đã đủ ${MAX_STOPS_PER_ROUTE} điểm rồi.` };
  }
  route.stops.push({
    type: STOP_TYPES.PROPOSED,
    placeId: null,
    proposalId,
    // Giữ tên ngay trên điểm dừng: bảng tra proposal có mất thì lộ trình vẫn hiện được tên,
    // không thành dòng trống.
    customTitle: null,
    nameSnapshot: name ?? null,
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
//
// `customAddress` (2026-09-11) giúp Google tra chính xác hơn và KHÔNG hiện thay tên. Để trống
// vẫn được: Maps sẽ dùng tên + tỉnh người dùng chọn, đủ cho chỗ công cộng như Winmart Hàng
// Bún; tên riêng kiểu "Nhà Tuấn" thì người dùng nên khai địa chỉ (xem stopMapsQuery).
//
// `customProvince` đi kèm địa chỉ: điểm riêng của khách nằm ở tỉnh nào cũng được ("31 Hàng Bún"
// là Hà Nội chứ không phải Tuyên Quang), nên tỉnh phải do khách chọn chứ không suy từ CDP.
//
// `coordinates` / `googlePlaceId` (NOTE-15 §2, §5): điểm riêng sinh ra từ một kết quả Google mà
// khách vừa CHỌN tận mắt thì đã có vị trí chuẩn ngay lúc thêm — khỏi bắt họ mở trang sửa rồi kéo
// ghim thêm một lượt nữa. Không truyền thì vẫn là điểm chỉ có chữ như trước.
export async function addCustomStopToRoute({
  anonId,
  slug,
  customTitle,
  customAddress,
  customProvince,
  coordinates,
  googlePlaceId,
}) {
  const route = await getRoute(slug);
  if (!assertOwner(route, anonId)) return { ok: false, error: "Không tìm thấy lộ trình." };
  const cleanTitle = cleanText(customTitle, MAX_CUSTOM_TITLE_LENGTH);
  if (!cleanTitle) return { ok: false, error: "Chưa nhập tên điểm." };
  if (!isValidProvince(customProvince)) {
    return { ok: false, error: "Hãy chọn tỉnh/thành của điểm ngoài danh bạ CDP." };
  }
  const cleanAddress = cleanText(customAddress, MAX_CUSTOM_ADDRESS_LENGTH);
  if (containsLinkOrPhone(cleanTitle) || (cleanAddress && containsLinkOrPhone(cleanAddress))) {
    return { ok: false, error: "Không được chứa link hoặc số điện thoại." };
  }
  if (route.stops.length >= MAX_STOPS_PER_ROUTE) {
    return { ok: false, error: `Lộ trình đã đủ ${MAX_STOPS_PER_ROUTE} điểm rồi.` };
  }
  const cleanLocation = coordinates === undefined ? null : cleanCoordinates(coordinates);
  const cleanGooglePlaceId =
    cleanLocation && typeof googlePlaceId === "string"
      ? googlePlaceId.trim().slice(0, 200) || null
      : null;
  route.stops.push({
    type: STOP_TYPES.CUSTOM,
    placeId: null,
    customTitle: cleanTitle,
    customAddress: cleanAddress,
    customProvince: normalizeProvince(customProvince),
    nameSnapshot: null,
    plannedAt: null,
    durationMinutes: null,
    note: null,
    ...(cleanLocation ? { coordinates: cleanLocation } : {}),
    ...(cleanGooglePlaceId ? { googlePlaceId: cleanGooglePlaceId } : {}),
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

/**
 * ĐỔI CHỖ tại đúng vị trí đang đứng (2026-09-11). Trước đây muốn thay một điểm phải xoá rồi
 * thêm lại — mà thêm thì rơi xuống cuối, kèm mất luôn giờ và ghi chú của chặng đó.
 *
 * GIỮ NGUYÊN `plannedAt` / `durationMinutes` / `note`: đó là kế hoạch của CHẶNG ("19:00, ở 2
 * tiếng"), không phải thuộc tính của địa điểm. Riêng ghi chú thì có thể đã nói về chỗ cũ, nên
 * giao diện nhắc xem lại — nhắc vẫn hơn tự ý xoá chữ người ta đã gõ.
 *
 * @param {{id: string, name: string}} [place] đổi sang một địa điểm CDP
 * @param {{title: string, address: string|null, province: string|null,
 *          coordinates?: object, googlePlaceId?: string}} [custom] hoặc đổi thành điểm riêng
 *        (kèm sẵn vị trí nếu khách chọn từ kết quả Google — NOTE-15 §2)
 */
export async function replaceStop({ anonId, slug, index, place, custom }) {
  const route = await getRoute(slug);
  if (!assertOwner(route, anonId)) return { ok: false, error: "Không tìm thấy lộ trình." };
  const current = route.stops[index];
  if (!current) return { ok: false, error: "Không tìm thấy điểm này." };

  const kept = {
    plannedAt: current.plannedAt ?? null,
    durationMinutes: current.durationMinutes ?? null,
    note: current.note ?? null,
  };

  if (place?.id) {
    route.stops[index] = {
      type: STOP_TYPES.CDP_PLACE,
      placeId: place.id,
      customTitle: null,
      customAddress: null,
      customProvince: null,
      nameSnapshot: place.name ?? null,
      ...kept,
    };
  } else {
    const cleanTitle = cleanText(custom?.title, MAX_CUSTOM_TITLE_LENGTH);
    if (!cleanTitle) return { ok: false, error: "Chưa chọn chỗ thay thế." };
    if (!isValidProvince(custom?.province)) {
      return { ok: false, error: "Hãy chọn tỉnh/thành của điểm ngoài danh bạ CDP." };
    }
    const cleanAddress = cleanText(custom?.address, MAX_CUSTOM_ADDRESS_LENGTH);
    if (containsLinkOrPhone(cleanTitle) || (cleanAddress && containsLinkOrPhone(cleanAddress))) {
      return { ok: false, error: "Không được chứa link hoặc số điện thoại." };
    }
    const cleanLocation = cleanCoordinates(custom?.coordinates);
    const cleanGooglePlaceId =
      cleanLocation && typeof custom?.googlePlaceId === "string"
        ? custom.googlePlaceId.trim().slice(0, 200) || null
        : null;
    route.stops[index] = {
      type: STOP_TYPES.CUSTOM,
      placeId: null,
      customTitle: cleanTitle,
      customAddress: cleanAddress,
      customProvince: normalizeProvince(custom?.province),
      nameSnapshot: null,
      ...(cleanLocation ? { coordinates: cleanLocation } : {}),
      ...(cleanGooglePlaceId ? { googlePlaceId: cleanGooglePlaceId } : {}),
      ...kept,
    };
  }

  route.updatedAt = new Date().toISOString();
  await redis.set(routeKey(slug), route);
  return { ok: true };
}

/**
 * Chọn điểm đón cho một điểm dừng là dịch vụ đón khách (NOTE-14 §13–§15). Server đọc place thật để
 * lấy điểm đón — client chỉ gửi id (điểm cố định) hoặc địa chỉ tự nhập (đón tận nơi/điểm khác).
 * Điểm tự nhập chỉ nằm trong lộ trình này, không tạo place/proposal.
 */
export async function setStopPickupSelection({ anonId, slug, index, selection }) {
  const route = await getRoute(slug);
  if (!assertOwner(route, anonId)) return { ok: false, error: "Không tìm thấy lộ trình." };
  const stop = route.stops[index];
  if (!stop || normalizeStop(stop).type !== STOP_TYPES.CDP_PLACE) {
    return { ok: false, error: "Điểm này không phải dịch vụ đón khách." };
  }
  const place = (await getLivePlaces()).find((candidate) => candidate.id === stop.placeId);
  if (!place || !isPickupService(place)) return { ok: false, error: "Điểm này không phải dịch vụ đón khách." };

  if (selection?.type === PICKUP_SELECTION_TYPES.CUSTOM) {
    for (const text of [selection.name, selection.addressLine, selection.wardOrDistrict]) {
      if (typeof text === "string" && containsLinkOrPhone(text)) {
        return { ok: false, error: "Điểm đón không được chứa link hoặc số điện thoại." };
      }
    }
  }
  const clean = cleanPickupSelection(selection, place);
  if (!clean) {
    return {
      ok: false,
      error: selection?.type === PICKUP_SELECTION_TYPES.CUSTOM
        ? "Nhập địa chỉ và chọn tỉnh/thành của điểm đón."
        : "Điểm đón này không còn — chọn điểm khác.",
    };
  }
  stop.pickupSelection = { ...clean, selectedAt: new Date().toISOString() };
  route.updatedAt = new Date().toISOString();
  await redis.set(routeKey(slug), route);
  return { ok: true, pickupSelection: stop.pickupSelection };
}

export async function updateStop({
  anonId,
  slug,
  index,
  plannedAt,
  durationMinutes,
  note,
  customTitle,
  customAddress,
  customProvince,
  coordinates,
  googlePlaceId,
}) {
  const route = await getRoute(slug);
  if (!assertOwner(route, anonId)) return { ok: false, error: "Không tìm thấy lộ trình." };
  const stop = route.stops[index];
  if (!stop) return { ok: false, error: "Không tìm thấy điểm này." };
  if (
    normalizeStop(stop).type === STOP_TYPES.CUSTOM &&
    customProvince !== undefined &&
    !isValidProvince(customProvince)
  ) {
    return { ok: false, error: "Hãy chọn tỉnh/thành của điểm ngoài danh bạ CDP." };
  }

  const cleanNote = cleanText(note, MAX_NOTE_LENGTH);
  if (cleanNote && containsLinkOrPhone(cleanNote)) {
    return { ok: false, error: "Ghi chú không được chứa link hoặc số điện thoại." };
  }
  const cleanAddress = cleanText(customAddress, MAX_CUSTOM_ADDRESS_LENGTH);
  if (cleanAddress && containsLinkOrPhone(cleanAddress)) {
    return { ok: false, error: "Địa chỉ không được chứa link hoặc số điện thoại." };
  }
  const cleanTitle = cleanText(customTitle, MAX_CUSTOM_TITLE_LENGTH);
  if (cleanTitle && containsLinkOrPhone(cleanTitle)) {
    return { ok: false, error: "Tên điểm không được chứa link hoặc số điện thoại." };
  }
  if (plannedAt !== undefined) stop.plannedAt = cleanPlannedAt(plannedAt);
  if (durationMinutes !== undefined) stop.durationMinutes = cleanDuration(durationMinutes);
  if (note !== undefined) stop.note = cleanNote;
  // Chỉ điểm riêng mới sửa được tên và địa chỉ tại đây — địa điểm CDP lấy tên/địa chỉ từ danh
  // bạ, cho sửa thì mỗi lộ trình lại giữ một phiên bản khác nhau cho cùng một chỗ. Muốn thay
  // hẳn địa điểm CDP thì dùng replaceStop ("Đổi chỗ").
  if (normalizeStop(stop).type === STOP_TYPES.CUSTOM) {
    // Tên rỗng thì giữ tên cũ: điểm riêng mà mất tên là thành một dòng trống trong lộ trình.
    if (customTitle !== undefined && cleanTitle) stop.customTitle = cleanTitle;
    // Đổi địa chỉ thì ghim đã xác nhận trước đó là của địa chỉ CŨ. Giữ lại toạ độ (vẫn gần hơn
    // nhiều so với để Google đoán) nhưng bỏ dấu "đã xác nhận" để giao diện nhắc kiểm tra lại.
    const addressChanged =
      (customAddress !== undefined && cleanAddress !== (stop.customAddress ?? null)) ||
      (customProvince !== undefined && normalizeProvince(customProvince) !== stop.customProvince);
    if (customAddress !== undefined) stop.customAddress = cleanAddress;
    if (customProvince !== undefined) stop.customProvince = normalizeProvince(customProvince);
    if (coordinates === undefined && addressChanged && stop.coordinates?.confirmed) {
      const { confirmed, ...rest } = stop.coordinates;
      stop.coordinates = rest;
    }
  }

  // Ghim toạ độ áp dụng cho MỌI loại điểm, kể cả địa điểm CDP (16/9, spec Consensus §6).
  // Vì sao: danh bạ mới ghim được 8/234 chỗ, mà chủ lộ trình thì đang cần đi ngay. Ghim ở đây
  // sửa ĐÚNG lộ trình của họ; cùng lúc trang sửa gửi một phiếu cho danh bạ (app/StopPlaceLocation.js)
  // để chỗ đó dần đủ đồng thuận cho mọi khách khác. Tên/địa chỉ của địa điểm CDP vẫn KHÔNG sửa
  // được ở đây — chỉ toạ độ.
  if (coordinates !== undefined) {
    stop.coordinates = cleanCoordinates(coordinates);
    // Place ID chỉ có nghĩa khi đi kèm toạ độ hợp lệ của chính chỗ đó.
    stop.googlePlaceId = stop.coordinates && typeof googlePlaceId === "string"
      ? googlePlaceId.trim().slice(0, 200) || null
      : null;
  }

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
  const normalized = (stops ?? []).map(normalizeStop);
  const hasProposal = normalized.some((s) => s.type === STOP_TYPES.PROPOSED);
  // Chỉ đọc bảng đề xuất khi lộ trình thật sự có điểm đề xuất — lộ trình thường vẫn đúng 1
  // lệnh Redis như trước.
  const [places, proposals, locationConsensus] = await Promise.all([
    getLivePlaces(),
    hasProposal ? getProposalIndex() : Promise.resolve({}),
    // Vị trí do khách cùng xác nhận (spec Consensus §6): lộ trình dẫn tới đó được, nên phải đọc
    // cùng lúc — 1 lệnh cho cả lộ trình, không phải mỗi điểm một lệnh.
    getAllLocationConsensus(),
  ]);
  const placeMap = new Map(
    places.map((p) => [p.id, { ...p, locationConsensus: locationConsensus[p.id] ?? null }])
  );

  return normalized.map((stop) => {
    if (stop.type === STOP_TYPES.CUSTOM) return { ...stop, place: null, deleted: false };

    if (stop.type === STOP_TYPES.PROPOSED) {
      const proposal = proposals[stop.proposalId];
      // §10 Đã duyệt -> tự trở thành địa điểm chính thức, nhãn "chưa xác minh" biến mất.
      if (proposal?.status === PROPOSAL_STATUS.APPROVED && proposal.livePlaceId) {
        const place = placeMap.get(proposal.livePlaceId);
        if (place) return { ...stop, type: STOP_TYPES.CDP_PLACE, place, deleted: false };
      }
      // §11 Bị từ chối -> thành điểm riêng, KHÔNG biến mất khỏi lộ trình.
      if (proposal?.status === PROPOSAL_STATUS.REJECTED) {
        return {
          ...stop,
          type: STOP_TYPES.CUSTOM,
          customTitle: stop.customTitle ?? proposal.name ?? stop.nameSnapshot,
          // Giữ lại địa chỉ đã khai lúc đề xuất: CDP không đưa chỗ này vào danh bạ, nhưng
          // người tạo vẫn phải chỉ đường tới được nó.
          customAddress: stop.customAddress ?? proposal.address ?? proposal.ward ?? null,
          // Proposal chỉ nhận chỗ trong vùng CDP (Tuyên Quang). Khi bị từ chối và trở thành
          // điểm riêng, giữ tỉnh đã biết thay vì bắt người tạo khai lại.
          customProvince: stop.customProvince ?? DEFAULT_PROVINCE,
          place: null,
          deleted: false,
        };
      }
      // Còn đang chờ -> hiện kèm nhãn chưa xác minh (§9).
      //
      // Vị trí khách đã ghim lúc đề xuất theo sang lộ trình của CHÍNH HỌ ngay (NOTE-15 §9):
      // chỗ này chưa vào danh bạ, nhưng người tạo vẫn phải dẫn đường tới được đúng chỗ thay vì
      // để Google đoán lại theo tên. Ghim trên điểm dừng (nếu có) vẫn đứng trước.
      return {
        ...stop,
        coordinates: stop.coordinates ?? proposal?.coordinates ?? null,
        googlePlaceId: stop.googlePlaceId ?? proposal?.googlePlaceId ?? null,
        place: null,
        deleted: false,
        proposal: proposal ?? { name: stop.nameSnapshot, ward: null, address: null },
      };
    }

    const place = placeMap.get(stop.placeId);
    if (place) return { ...stop, place, deleted: false };
    return { ...stop, place: null, deleted: true };
  });
}

/** Tên hiển thị của một điểm dừng, dù nó là địa điểm CDP hay điểm tự đặt tên. */
export function stopTitle(stop) {
  return (
    stop.customTitle ?? stop.place?.name ?? stop.proposal?.name ?? stop.nameSnapshot ?? "Điểm đã bị xoá"
  );
}

/**
 * Địa chỉ đầy đủ của ĐIỂM RIÊNG để hiện trên trang xem: "63 Lê Duẩn, Minh Xuân, Tuyên Quang".
 * Tên điểm ("Khu đình dốc Bà The") chỉ để nhận ra chỗ đó; địa chỉ mới là thứ người đi cần đọc —
 * và là thứ Google nhận khi chưa có toạ độ, nên phải nhìn thấy để biết nó có đúng không.
 * Địa chỉ đã tự nói tỉnh rồi thì không lặp lại. @returns {string|null}
 */
export function stopFullAddress(stop) {
  const address = cleanText(stop?.customAddress, MAX_CUSTOM_ADDRESS_LENGTH);
  // Chỉ có tỉnh mà không có số nhà/tên đường thì KHÔNG phải địa chỉ — hiện "📍 Hà Nội" trần chẳng
  // chỉ đường cho ai được. Trả null để trang xem nhắc là chưa khai địa chỉ.
  if (!address) return null;
  const province = isValidProvince(stop?.customProvince) ? stop.customProvince : null;
  if (!province || normalizeForSearch(address).includes(normalizeForSearch(province))) return address;
  return `${address}, ${province}`;
}
