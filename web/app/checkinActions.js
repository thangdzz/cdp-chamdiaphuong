"use server";

import { createContributor, addContributorPoints } from "@/lib/contributors";
import { submitCheckin, hasCheckedInRecently } from "@/lib/checkins";

const POINTS_PER_CHECKIN = 1;

// SPEC-chang-1.md §2.3: không hỏi biệt danh, chưa có hồ sơ thì tự tạo im lặng ngay lúc bấm.
export async function checkin({ anonId, placeId }) {
  if (!placeId) return { ok: false };

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

  const result = await submitCheckin(placeId, currentAnonId);
  if (!result.alreadyCheckedIn && result.pointsAwarded) {
    await addContributorPoints(currentAnonId, POINTS_PER_CHECKIN);
  }

  return {
    ok: true,
    anonId: currentAnonId,
    newProfile,
    alreadyCheckedIn: result.alreadyCheckedIn,
    pointsAwarded: !result.alreadyCheckedIn && result.pointsAwarded,
    at: result.at,
  };
}

export async function getCheckinStatus({ anonId, placeId }) {
  if (!anonId || !placeId) return { checkedIn: false };
  const checkedIn = await hasCheckedInRecently(placeId, anonId);
  return { checkedIn };
}
