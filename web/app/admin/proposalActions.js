"use server";

import crypto from "crypto";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { matchPlaceAgainstClosedPlaces } from "@/lib/ingestion/match";
import { queueClosedHistoryHold } from "@/lib/ingestion/closedHold";
import { ADMIN_COOKIE_NAME, verifySessionToken } from "@/lib/adminAuth";
import { getProposalQueue, approveProposal, createProposal, rejectProposal } from "@/lib/proposals";
import { getLivePlaces, setLivePlaces } from "@/lib/redis";
import {
  getAllClosedPlaces,
  getClosedPlace,
  replacementLocationOf,
  setClosedPlaceReplacement,
} from "@/lib/closedPlaces";
import { addContributorPoints } from "@/lib/contributors";
import { trySpendDailyPoints } from "@/lib/pointsCap";
import { POINTS } from "@/lib/badges";

async function requireAdmin() {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_COOKIE_NAME)?.value;
  if (!verifySessionToken(token)) {
    throw new Error("Chưa đăng nhập hoặc phiên đã hết hạn");
  }
}

/**
 * Duyệt đề xuất: tạo địa điểm thật trong danh bạ, rồi ghi `livePlaceId` vào bảng tra proposal.
 * Mọi lộ trình đang trỏ tới đề xuất này TỰ chuyển sang địa điểm chính thức lúc đọc — không đi
 * sửa route của ai (NOTE-07 §10).
 *
 * `confidenceScore: null` cố ý: đây là chỗ một người gửi lên, chưa đối chiếu nguồn nào — để
 * trống thì thẻ không hiện dòng "Độ tin cậy", đúng hơn là bịa ra một con số.
 */
export async function approveProposalAction(formData) {
  await requireAdmin();
  const id = formData.get("id")?.toString();
  if (!id) return;

  const queue = await getProposalQueue();
  const proposal = queue.find((p) => p.id === id);
  if (!proposal) return;

  // NOTE-13 + NOTE-14 §4: đề xuất thường trùng một chỗ đã đóng thì không công khai. Đề xuất THAY
  // THẾ đã gắn đúng chỗ cũ (replacesPlaceId) là chủ đích — chỉ bỏ qua đúng hồ sơ đó.
  const closedHit = matchPlaceAgainstClosedPlaces(proposal, await getAllClosedPlaces(), {
    excludeClosedIds: [proposal.replacesPlaceId],
  });
  if (closedHit) {
    // Đề xuất vẫn giữ nguyên chờ (lộ trình của khách đang trỏ tới nó) — quyết định mở lại/thay thế
    // làm ở hàng chờ tự động, xong thì Admin từ chối đề xuất trùng này.
    await queueClosedHistoryHold(proposal, closedHit, {
      sourceId: `proposal:${proposal.id}`,
      note: `Đề xuất của khách "${proposal.name}" trùng địa điểm đã đóng`,
    });
    revalidatePath("/admin");
    redirect(
      `/admin?notice=${encodeURIComponent(
        `Chưa duyệt đề xuất "${proposal.name}": trùng địa điểm đã đóng. Đã tạo mục trong hàng chờ tự động để chọn "Mở lại địa điểm cũ" hoặc "Tạo địa điểm mới thay thế"; xử lý xong thì từ chối đề xuất này.`
      )}#review-queue`
    );
  }

  const livePlaceId = `live-${crypto.randomUUID()}`;
  const places = await getLivePlaces();
  places.push({
    id: livePlaceId,
    name: proposal.name,
    type: proposal.type,
    address: proposal.address ?? "",
    ward: proposal.ward ?? null,
    localArea: proposal.localArea ?? null,
    coordinates: proposal.coordinates ?? null,
    phone: null,
    priceMin: null,
    priceMax: null,
    priceUnit: null,
    priceText: null,
    note: proposal.note ?? null,
    confidenceScore: null,
    sourceCount: 1,
    lastUpdatedAt: new Date().toISOString(),
    autoPublished: false,
    replacesPlaceId: proposal.replacesPlaceId ?? null,
  });
  await setLivePlaces(places);

  const result = await approveProposal({ proposalId: id, livePlaceId });
  // Cùng mức điểm với mẹo địa phương — cũng là một lần khách góp nội dung phải qua duyệt.
  if (result.ok && result.contributorId) {
    const allowed = await trySpendDailyPoints(result.contributorId, POINTS.note);
    if (allowed) await addContributorPoints(result.contributorId, POINTS.note);
  }
  if (result.ok && proposal.replacesPlaceId) {
    await setClosedPlaceReplacement(proposal.replacesPlaceId, livePlaceId);
    revalidatePath(`/dia-diem/${proposal.replacesPlaceId}`);
  }

  revalidatePath("/admin");
  revalidatePath("/");
}

// Admin chỉ tạo PROPOSAL thay thế, không public thẳng. Vị trí được điền sẵn từ tombstone;
// với bản đóng cửa cũ chỉ còn tên, Admin có thể bổ sung địa chỉ/khu vực trước khi gửi queue.
export async function createReplacementProposalAction(formData) {
  await requireAdmin();
  const replacesPlaceId = formData.get("replacesPlaceId")?.toString();
  if (!replacesPlaceId) return;

  const oldPlace = await getClosedPlace(replacesPlaceId);
  if (!oldPlace) return;
  const location = replacementLocationOf(oldPlace);
  await createProposal({
    contributorId: null,
    name: formData.get("name")?.toString(),
    type: formData.get("type")?.toString(),
    ward: formData.get("ward")?.toString() || location.ward,
    address: formData.get("address")?.toString() || location.address,
    localArea: formData.get("localArea")?.toString() || location.localArea,
    coordinates: location.coordinates,
    note: formData.get("note")?.toString(),
    replacesPlaceId,
    replacesPlaceName: oldPlace.name,
  });

  revalidatePath("/admin");
}

/**
 * Từ chối: KHÔNG xoá điểm khỏi lộ trình của ai (§11). Điểm đó chuyển thành "điểm riêng" của
 * người tạo — từ chối đưa vào danh bạ chung không có nghĩa nó vô nghĩa với chuyến đi của họ.
 */
export async function rejectProposalAction(formData) {
  await requireAdmin();
  const id = formData.get("id")?.toString();
  if (!id) return;
  await rejectProposal({ proposalId: id });
  revalidatePath("/admin");
}
