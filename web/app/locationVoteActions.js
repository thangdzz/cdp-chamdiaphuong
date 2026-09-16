"use server";

import { revalidatePath } from "next/cache";
import { createContributor } from "@/lib/contributors";
import { getLivePlaces } from "@/lib/redis";
import { getMyLocationVote, submitLocationVote } from "@/lib/locationVotes";

// Khách xác nhận / sửa vị trí một địa điểm (spec Consensus §6, §16).
//
// Giống Chặng 1: KHÔNG hỏi biệt danh trước. Chưa có hồ sơ thì tạo im lặng ngay lúc bấm, để việc
// chỉ đúng chỗ quán không bị chặn bởi một bước đăng ký.

export async function voteLocation({ anonId, placeId, lat, lng, googlePlaceId = null }) {
  if (!placeId) return { ok: false, error: "Thiếu địa điểm." };

  // Chỉ nhận phiếu cho chỗ đang công khai — Server Action gọi thẳng được, không tin id từ client.
  const live = await getLivePlaces();
  if (!live.some((place) => place.id === placeId)) {
    return { ok: false, error: "Không tìm thấy địa điểm này." };
  }

  let newProfile = null;
  let currentAnonId = anonId;
  if (!currentAnonId) {
    const profile = await createContributor();
    currentAnonId = profile.anonId;
    newProfile = {
      anonId: profile.anonId,
      nickname: profile.nickname,
      recoveryCode: profile.recoveryCode,
    };
  }

  const result = await submitLocationVote({
    anonId: currentAnonId,
    placeId,
    lat,
    lng,
    googlePlaceId,
  });
  if (!result.ok) {
    return {
      ...result,
      anonId: currentAnonId,
      newProfile,
      error: result.capped ? "Hôm nay bạn đã gửi khá nhiều vị trí rồi, mai quay lại nhé." : result.error,
    };
  }

  // Đủ đồng thuận là nút của chỗ đó đổi từ "Tìm trên Google Maps" thành "Chỉ đường" — trang đang
  // mở phải thấy ngay, không đợi lượt tải sau.
  if (result.status === "community_verified") {
    revalidatePath(`/dia-diem/${placeId}`);
    revalidatePath("/");
  }

  return { ...result, anonId: currentAnonId, newProfile };
}

/** Người đang xem đã gửi phiếu cho chỗ này chưa — để nút không mời họ bấm lại lần nữa. */
export async function getMyLocationVoteStatus({ anonId, placeId }) {
  if (!anonId || !placeId) return { voted: false };
  const vote = await getMyLocationVote(anonId, placeId);
  return vote ? { voted: true, lat: vote.lat, lng: vote.lng } : { voted: false };
}
