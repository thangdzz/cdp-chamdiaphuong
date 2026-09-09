"use server";

import { createContributor } from "@/lib/contributors";
import { getNextQuestion, submitAnswer, skipQuestion } from "@/lib/answers";

// SPEC-chang-2.md §6 quy tắc 5: không cần đăng nhập, chưa có hồ sơ thì tự tạo im lặng —
// giống hệt Chặng 1 §2.3.
// `subtype` (transportSubtype) chỉ quyết định HỎI CÂU NÀO — cùng mức tin cậy với `type` vốn
// đã nhận từ client từ đầu. Phiếu gửi lên vẫn được submitAnswer tự kiểm tra riêng theo
// questionId, không phụ thuộc tham số này.
export async function fetchNextQuestion({ anonId, placeId, type, subtype = null }) {
  if (!placeId || !type) return { question: null };
  // Chưa có hồ sơ (khách lần đầu) vẫn cho xem câu hỏi bình thường — coi như chưa trả lời gì,
  // chưa bấm "Không rõ" gì. Chỉ tạo hồ sơ thật lúc họ THỰC SỰ bấm trả lời (§2.3), không phải
  // lúc chỉ xem.
  const question = await getNextQuestion({ type, placeId, anonId: anonId ?? null, subtype });
  return { question };
}

export async function submitQuestionAnswer({ anonId, placeId, questionId, answer, text }) {
  if (!placeId || !questionId || answer == null) return { ok: false };

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

  const result = await submitAnswer({ anonId: currentAnonId, placeId, questionId, answer, text });
  return { ...result, anonId: currentAnonId, newProfile };
}

export async function submitSkip({ anonId, placeId, questionId, type, subtype = null }) {
  if (!placeId || !questionId) return { ok: false };

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

  await skipQuestion({ anonId: currentAnonId, placeId, questionId });
  const question = await getNextQuestion({ type, placeId, anonId: currentAnonId, subtype });
  return { ok: true, anonId: currentAnonId, newProfile, nextQuestion: question };
}
