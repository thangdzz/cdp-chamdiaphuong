"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { ADMIN_COOKIE_NAME, verifySessionToken } from "@/lib/adminAuth";
import { ingestBatch } from "@/lib/ingestion/ingestBatch";

// Báo cáo routine thường có cả đoạn JSON lẫn phần tóm tắt tiếng Việt đi kèm — tự tách lấy
// đúng mảng JSON dù anh dán nguyên cả đoạn, không cần tự tay cắt.
function extractJsonArray(text) {
  const start = text.indexOf("[");
  const end = text.lastIndexOf("]");
  if (start === -1 || end === -1 || end < start) return null;
  try {
    const parsed = JSON.parse(text.slice(start, end + 1));
    return Array.isArray(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

export async function processIngestPaste(rawText) {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_COOKIE_NAME)?.value;
  if (!verifySessionToken(token)) {
    return { ok: false, error: "Chưa đăng nhập hoặc phiên đã hết hạn." };
  }

  const records = extractJsonArray(rawText ?? "");
  if (!records) {
    return {
      ok: false,
      error: "Không tìm thấy đoạn JSON hợp lệ trong nội dung dán vào — kiểm tra lại.",
    };
  }
  if (records.length === 0) {
    return { ok: false, error: "Danh sách rỗng, không có gì để xử lý." };
  }

  const summary = await ingestBatch({
    sourceId: "admin-paste",
    sourceType: "manual_inbox",
    records,
  });

  revalidatePath("/admin");
  revalidatePath("/");

  return { ok: true, summary };
}
