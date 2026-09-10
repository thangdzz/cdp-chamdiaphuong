"use server";

import { createContributor } from "@/lib/contributors";
import {
  getRoute,
  getRoutesSummary,
  createRoute,
  createRouteFromNotebook,
  addStopToRoute,
  addCustomStopToRoute,
  removeStopFromRoute,
  updateStop,
  reorderStops,
  updateRouteTitle,
  updateTransportMode,
  deleteRoute,
  resolveRouteStops,
} from "@/lib/routes";
import { createShareSnapshot } from "@/lib/routeShare";
import { getNotebook } from "@/lib/notebooks";

// Không cần đăng nhập, chưa có hồ sơ thì tự tạo im lặng — giống hệt Sổ (SPEC-chang-4 §5 quy
// tắc 1). Chỉ tạo lúc khách THỰC SỰ tạo/sửa gì, không phải lúc chỉ xem.
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

export async function getMyRoutes(anonId) {
  if (!anonId) return [];
  return getRoutesSummary(anonId);
}

export async function createEmptyRoute({ anonId, title }) {
  const { anonId: currentAnonId, newProfile } = await ensureProfile(anonId);
  const result = await createRoute({ ownerAnonId: currentAnonId, title });
  return { ...result, anonId: currentAnonId, newProfile };
}

// "Tạo lộ trình từ sổ này" — chép sang lộ trình mới, SỔ GỐC KHÔNG ĐỔI. Chỉ chủ sổ mới làm
// được: nội dung sổ người khác không phải thứ để tự lấy về đứng tên mình.
export async function createRouteFromNotebookAction({ anonId, slug, title }) {
  if (!anonId || !slug) return { ok: false };
  const notebook = await getNotebook(slug);
  if (!notebook || notebook.ownerAnonId !== anonId) {
    return { ok: false, error: "Không tìm thấy sổ." };
  }
  if ((notebook.items ?? []).length === 0) {
    return { ok: false, error: "Sổ chưa có chỗ nào." };
  }
  return createRouteFromNotebook({ ownerAnonId: anonId, notebook, title });
}

export async function addPlaceToRoute({ anonId, slug, placeId, nameSnapshot }) {
  if (!slug || !placeId) return { ok: false };
  const { anonId: currentAnonId, newProfile } = await ensureProfile(anonId);
  const result = await addStopToRoute({ anonId: currentAnonId, slug, placeId, nameSnapshot });
  return { ...result, anonId: currentAnonId, newProfile };
}

export async function createRouteAndAddPlace({ anonId, title, placeId, nameSnapshot }) {
  if (!placeId) return { ok: false };
  const { anonId: currentAnonId, newProfile } = await ensureProfile(anonId);
  const created = await createRoute({ ownerAnonId: currentAnonId, title });
  if (!created.ok) return { ...created, anonId: currentAnonId, newProfile };
  const result = await addStopToRoute({
    anonId: currentAnonId,
    slug: created.slug,
    placeId,
    nameSnapshot,
  });
  return { ...result, slug: created.slug, anonId: currentAnonId, newProfile };
}

export async function addCustomStop({ anonId, slug, customTitle }) {
  if (!anonId || !slug) return { ok: false };
  return addCustomStopToRoute({ anonId, slug, customTitle });
}

export async function removeStop({ anonId, slug, index }) {
  if (!anonId || !slug) return { ok: false };
  return removeStopFromRoute({ anonId, slug, index });
}

export async function saveStopDetails({ anonId, slug, index, plannedAt, durationMinutes, note }) {
  if (!anonId || !slug) return { ok: false };
  return updateStop({ anonId, slug, index, plannedAt, durationMinutes, note });
}

export async function reorderRouteStops({ anonId, slug, order }) {
  if (!anonId || !slug) return { ok: false };
  return reorderStops({ anonId, slug, order });
}

export async function renameRoute({ anonId, slug, title }) {
  if (!anonId || !slug) return { ok: false };
  return updateRouteTitle({ anonId, slug, title });
}

export async function setTransportMode({ anonId, slug, transportMode }) {
  if (!anonId || !slug) return { ok: false };
  return updateTransportMode({ anonId, slug, transportMode });
}

export async function deleteMyRoute({ anonId, slug }) {
  if (!anonId || !slug) return { ok: false };
  return deleteRoute({ anonId, slug });
}

// §P5: chia sẻ là hành động ĐỘC LẬP — không bắt lưu hay đặt tên trước. §P6: mỗi lần bấm là
// một bản chụp mới, link cũ vẫn giữ nội dung cũ.
export async function shareRoute({ anonId, slug }) {
  if (!anonId || !slug) return { ok: false };
  const route = await getRoute(slug);
  if (!route || route.ownerAnonId !== anonId) return { ok: false, error: "Không tìm thấy lộ trình." };
  const resolvedStops = await resolveRouteStops(route.stops);
  return createShareSnapshot({ route, resolvedStops });
}

// Trang sửa — Server Action tự kiểm tra đúng chủ, không tin giao diện chặn hộ (Next.js
// data-security: action luôn gọi được trực tiếp bất kể UI).
export async function getRouteForEdit({ anonId, slug }) {
  if (!slug) return { ok: false, notFound: true };
  const route = await getRoute(slug);
  if (!route) return { ok: false, notFound: true };
  if (!anonId || route.ownerAnonId !== anonId) return { ok: false, forbidden: true };
  const stops = await resolveRouteStops(route.stops);
  return {
    ok: true,
    route: {
      slug: route.slug,
      title: route.title,
      transportMode: route.transportMode,
      stops: stops.map((s) => ({
        placeId: s.placeId,
        customTitle: s.customTitle,
        deleted: s.deleted,
        nameSnapshot: s.nameSnapshot,
        plannedAt: s.plannedAt,
        durationMinutes: s.durationMinutes,
        note: s.note,
        name: s.place?.name ?? null,
        typeLabel: s.place?.type ?? null,
        ward: s.place?.ward ?? null,
      })),
    },
  };
}

export async function checkRouteOwnership({ anonId, slug }) {
  if (!anonId || !slug) return { isOwner: false };
  const route = await getRoute(slug);
  return { isOwner: route?.ownerAnonId === anonId };
}
