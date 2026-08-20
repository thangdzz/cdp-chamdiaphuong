"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { ADMIN_COOKIE_NAME, verifySessionToken } from "@/lib/adminAuth";
import { approveNote, rejectNote } from "@/lib/notes";
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

// Duyệt -> đẩy lên công khai + cộng điểm (SPEC-chang-5.md §6, §7 quy tắc 2). Mục bị báo sai
// quay lại hàng chờ không có contributorId (không rõ ai gửi ban đầu) -> không cộng điểm ai.
export async function approveNoteAction(formData) {
  await requireAdmin();
  const id = formData.get("id")?.toString();
  if (!id) return;

  const result = await approveNote(id);
  if (result.ok && result.contributorId) {
    const allowed = await trySpendDailyPoints(result.contributorId, POINTS.note);
    if (allowed) await addContributorPoints(result.contributorId, POINTS.note);
  }

  revalidatePath("/admin");
  revalidatePath("/");
}

// Bỏ -> xoá, không cộng, không báo người gửi (SPEC §6).
export async function rejectNoteAction(formData) {
  await requireAdmin();
  const id = formData.get("id")?.toString();
  if (!id) return;
  await rejectNote(id);
  revalidatePath("/admin");
}
