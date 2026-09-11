"use server";

import crypto from "crypto";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { ADMIN_COOKIE_NAME, verifySessionToken } from "@/lib/adminAuth";
import { getProposalQueue, approveProposal, rejectProposal } from "@/lib/proposals";
import { getLivePlaces, setLivePlaces } from "@/lib/redis";
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

  const livePlaceId = `live-${crypto.randomUUID()}`;
  const places = await getLivePlaces();
  places.push({
    id: livePlaceId,
    name: proposal.name,
    type: proposal.type,
    address: proposal.address ?? "",
    ward: proposal.ward ?? null,
    localArea: null,
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
  });
  await setLivePlaces(places);

  const result = await approveProposal({ proposalId: id, livePlaceId });
  // Cùng mức điểm với mẹo địa phương — cũng là một lần khách góp nội dung phải qua duyệt.
  if (result.ok && result.contributorId) {
    const allowed = await trySpendDailyPoints(result.contributorId, POINTS.note);
    if (allowed) await addContributorPoints(result.contributorId, POINTS.note);
  }

  revalidatePath("/admin");
  revalidatePath("/");
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
