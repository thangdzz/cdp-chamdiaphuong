"use server";

import crypto from "crypto";
import { revalidatePath } from "next/cache";
import { createContributor } from "@/lib/contributors";
import { checkNoteText } from "@/lib/noteFilters";
import { checkNoteWithAi } from "@/lib/noteAiCheck";
import { getNoteQueue, pushNoteToQueue, countPendingNotesForContributor, findDuplicateNote, reportNote } from "@/lib/notes";

const NOTE_MAX_LENGTH = 120;
const MAX_PENDING_PER_CONTRIBUTOR = 3; // SPEC-chang-5.md §7 quy tắc 3

// Không cần đăng nhập, chưa có hồ sơ thì tự tạo im lặng — giống hệt Chặng 1/4
// (SPEC-chang-4.md §5 quy tắc 1).
async function ensureProfile(anonId) {
  if (anonId) return { anonId, newProfile: null };
  const profile = await createContributor();
  return {
    anonId: profile.anonId,
    newProfile: { anonId: profile.anonId, nickname: profile.nickname, recoveryCode: profile.recoveryCode },
  };
}

// "Mẹo tự do" (SPEC-chang-5.md §2.1) — luôn phải qua duyệt, không có ngoại lệ (§7 quy tắc 1).
// Điểm +5 chỉ cộng SAU KHI admin duyệt (quy tắc 2), không cộng ở đây.
export async function submitTip({ anonId, placeId, questionId, text, festivalOnly }) {
  if (!placeId || !questionId) return { ok: false, error: "Thiếu thông tin." };

  const filterError = checkNoteText(text ?? "", NOTE_MAX_LENGTH);
  if (filterError) return { ok: false, error: filterError };
  const cleanText = text.trim();

  const { anonId: currentAnonId, newProfile } = await ensureProfile(anonId);
  const queue = await getNoteQueue();

  const pendingCount = await countPendingNotesForContributor(currentAnonId, queue);
  if (pendingCount >= MAX_PENDING_PER_CONTRIBUTOR) {
    return {
      ok: false,
      error: `Đang có ${MAX_PENDING_PER_CONTRIBUTOR} ghi chú chờ duyệt rồi, đợi admin duyệt xong đã.`,
      anonId: currentAnonId,
      newProfile,
    };
  }

  if (await findDuplicateNote(currentAnonId, placeId, cleanText, queue)) {
    return { ok: false, error: "Bạn đã gửi đúng nội dung này cho chỗ này rồi.", anonId: currentAnonId, newProfile };
  }

  const aiResult = await checkNoteWithAi({
    question: "Bạn có mẹo gì cho chỗ này không?",
    text: cleanText,
  });
  if (aiResult.verdict === "LOAI") {
    return { ok: false, error: "Ghi chú chưa phù hợp, thử viết lại.", anonId: currentAnonId, newProfile };
  }

  await pushNoteToQueue(
    {
      id: `note-${crypto.randomUUID()}`,
      placeId,
      questionId,
      text: cleanText,
      festivalOnly: !!festivalOnly,
      contributorId: currentAnonId,
      at: new Date().toISOString(),
      aiVerdict: aiResult.verdict,
    },
    queue
  );

  revalidatePath("/admin");
  return { ok: true, anonId: currentAnonId, newProfile };
}

// Lớp 5 — "Ghi chú này không đúng" (SPEC-chang-5.md §3 lớp 5).
export async function reportNoteAction({ placeId, noteId }) {
  if (!placeId || !noteId) return { ok: false };
  const result = await reportNote(placeId, noteId);
  if (result.hidden) {
    revalidatePath("/");
    revalidatePath("/admin");
  }
  return result;
}
