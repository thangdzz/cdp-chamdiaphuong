"use server";

import { createContributor } from "@/lib/contributors";
import {
  getRoute,
  getRoutesSummary,
  createRoute,
  createRouteFromNotebook,
  addStopToRoute,
  addPlacesToRoute,
  addCustomStopToRoute,
  addProposedStopToRoute,
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
import { getLivePlaces } from "@/lib/redis";
import { createProposal } from "@/lib/proposals";

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
        // `type` đã được resolveRouteStops() giải xong: đề xuất đã duyệt trả về "cdp_place",
        // bị từ chối trả về "custom_stop" — trang sửa chỉ việc vẽ theo, không tự suy lại.
        type: s.type,
        placeId: s.placeId,
        customTitle: s.customTitle,
        deleted: s.deleted,
        nameSnapshot: s.nameSnapshot,
        plannedAt: s.plannedAt,
        durationMinutes: s.durationMinutes,
        note: s.note,
        name: s.place?.name ?? s.proposal?.name ?? null,
        typeLabel: s.place?.type ?? s.proposal?.type ?? null,
        ward: s.place?.ward ?? s.proposal?.ward ?? null,
      })),
    },
  };
}

export async function checkRouteOwnership({ anonId, slug }) {
  if (!anonId || !slug) return { isOwner: false };
  const route = await getRoute(slug);
  return { isOwner: route?.ownerAnonId === anonId };
}

// PlacePicker tải danh bạ MỘT LẦN lúc mở rồi lọc ngay trên máy khách (NOTE-07 §13 muốn tìm
// kiếm mượt). Cắt còn 5 trường: ~210 chỗ × ~90 byte ≈ 20KB, rẻ hơn hẳn việc gọi máy chủ theo
// từng ký tự gõ, và chỉ tốn đúng 1 lệnh Redis.
export async function fetchPickerPlaces() {
  const places = await getLivePlaces();
  return places.map((p) => ({
    id: p.id,
    name: p.name,
    type: p.type,
    ward: p.ward ?? null,
    address: p.address ?? null,
    localArea: p.localArea ?? null,
  }));
}

// "Tạo lộ trình từ đây" (§4) — tạo lộ trình mới với TẤT CẢ chỗ vừa chọn trong PlacePicker.
export async function createRouteWithPlaces({ anonId, title, places, customStops = [] }) {
  if (!places?.length && !customStops.length) return { ok: false, error: "Chưa chọn chỗ nào." };
  const { anonId: currentAnonId, newProfile } = await ensureProfile(anonId);
  const created = await createRoute({ ownerAnonId: currentAnonId, title });
  if (!created.ok) return { ...created, anonId: currentAnonId, newProfile };
  if (places?.length) {
    await addPlacesToRoute({ anonId: currentAnonId, slug: created.slug, places });
  }
  // Điểm riêng khách gõ ngay trong bộ chọn lúc chưa có lộ trình — giữ tạm ở đó rồi ghi một
  // lượt tại đây, xếp SAU các địa điểm đã chọn (khách sắp lại thứ tự ở trang sửa).
  for (const customTitle of customStops) {
    await addCustomStopToRoute({ anonId: currentAnonId, slug: created.slug, customTitle });
  }
  return { ok: true, slug: created.slug, anonId: currentAnonId, newProfile };
}

// "+ Thêm địa điểm" trong trang sửa lộ trình (§5) — thêm cả loạt, không đóng picker sau mỗi lần chọn.
export async function addPlacesToMyRoute({ anonId, slug, places }) {
  if (!anonId || !slug) return { ok: false };
  return addPlacesToRoute({ anonId, slug, places });
}

// §6.B: đề xuất một chỗ chưa có trong danh bạ. Vào lộ trình NGAY (kèm nhãn chưa xác minh),
// đồng thời xếp hàng chờ admin — hai việc trong một lượt bấm.
export async function proposePlaceForRoute({ anonId, slug, name, type, ward, address, note }) {
  if (!slug) return { ok: false };
  const { anonId: currentAnonId, newProfile } = await ensureProfile(anonId);
  const route = await getRoute(slug);
  if (!route || route.ownerAnonId !== currentAnonId) {
    return { ok: false, error: "Không tìm thấy lộ trình.", anonId: currentAnonId, newProfile };
  }
  const proposal = await createProposal({ contributorId: currentAnonId, name, type, ward, address, note });
  if (!proposal.ok) return { ...proposal, anonId: currentAnonId, newProfile };

  const added = await addProposedStopToRoute({
    anonId: currentAnonId,
    slug,
    proposalId: proposal.proposal.id,
    name: proposal.proposal.name,
  });
  return { ...added, anonId: currentAnonId, newProfile };
}
