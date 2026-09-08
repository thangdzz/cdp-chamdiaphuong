"use server";

import { createContributor, addContributorPoints } from "@/lib/contributors";
import { getPhoneStatus, submitPhoneConfirmation } from "@/lib/phoneConfirmations";
import { trySpendDailyPoints } from "@/lib/pointsCap";

const POINTS_PER_CONFIRMATION = 1;

export async function fetchPhoneStatus({ anonId, placeId, phone }) {
  return getPhoneStatus(placeId, phone, anonId);
}

// Giống check-in (SPEC-chang-1.md §2.3): không hỏi biệt danh, chưa có hồ sơ thì tự tạo im
// lặng ngay lúc bấm — xác nhận số điện thoại là thao tác 1 chạm, hỏi biệt danh sẽ làm khách bỏ.
export async function confirmPhone({ anonId, placeId, phone, status }) {
  if (!placeId || !phone) return { ok: false };

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

  const result = await submitPhoneConfirmation({ placeId, phone, anonId: currentAnonId, status });
  if (!result.ok) return { ok: false };

  // Chỉ thưởng điểm cho phiếu ĐẦU TIÊN của người này với số này — bấm lại hoặc đổi ý không
  // cộng thêm (NOTE-01 §6.5). Vẫn xin phép trần chung 30đ/ngày như mọi nguồn điểm khác.
  let pointsAwarded = false;
  if (!result.alreadyVoted) {
    pointsAwarded = await trySpendDailyPoints(currentAnonId, POINTS_PER_CONFIRMATION);
    if (pointsAwarded) await addContributorPoints(currentAnonId, POINTS_PER_CONFIRMATION);
  }

  const next = await getPhoneStatus(placeId, phone, currentAnonId);
  return { ok: true, anonId: currentAnonId, newProfile, pointsAwarded, ...next };
}
