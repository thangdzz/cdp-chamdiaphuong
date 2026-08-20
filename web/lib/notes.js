import crypto from "crypto";
import { redis } from "./redis.js";

// Ghi chú công khai bằng chữ (SPEC-chang-5.md §5) — loại nội dung DUY NHẤT luôn phải qua
// admin duyệt (§7 quy tắc 1), nên cấu trúc lưu tách hẳn khỏi places:live.
const PUBLISHED_KEY = "place_notes:published"; // hash, field = placeId, value = mảng JSON
const QUEUE_KEY = "place_notes:queue"; // mảng chờ duyệt
const REPORTS_TTL_SECONDS = 90 * 24 * 60 * 60;

// Ghi chú "chỉ đúng dịp lễ hội" tự ẩn sau ngày này, không xoá (SPEC §7 quy tắc 5) — admin
// vẫn xem lại được trong place_notes:published, chỉ ẩn khỏi trang chủ.
const FESTIVAL_END_DATE = "2026-09-25";

export async function getPublishedNotesForPlace(placeId) {
  return (await redis.hget(PUBLISHED_KEY, placeId)) ?? [];
}

// Trang chủ đọc 1 lệnh HGETALL duy nhất, không tăng theo số địa điểm (SPEC §5).
export async function getAllPublishedNotes() {
  return (await redis.hgetall(PUBLISHED_KEY)) ?? {};
}

export async function getNoteQueue() {
  return (await redis.get(QUEUE_KEY)) ?? [];
}

async function saveNoteQueue(queue) {
  await redis.set(QUEUE_KEY, queue);
}

// `queue` truyền sẵn (nếu có) để tránh đọc lại place_notes:queue nhiều lần trong 1 lượt gửi
// (submitTip cần cả 3 hàm này — mỗi lệnh Redis mất ~300-800ms, gộp lại đỡ chậm hẳn).
export async function pushNoteToQueue(item, queue) {
  const list = queue ?? (await getNoteQueue());
  list.push(item);
  await saveNoteQueue(list);
}

// Chặn gửi hàng loạt — tối đa 3 ghi chú chờ duyệt cùng lúc/người (SPEC §7 quy tắc 3).
export async function countPendingNotesForContributor(contributorId, queue) {
  const list = queue ?? (await getNoteQueue());
  return list.filter((n) => n.contributorId === contributorId).length;
}

// Chặn gửi trùng y hệt nội dung cho cùng 1 chỗ (SPEC §7 quy tắc 4, cùng cách suggestions.js).
export async function findDuplicateNote(contributorId, placeId, text, queue) {
  const list = queue ?? (await getNoteQueue());
  if (list.some((n) => n.contributorId === contributorId && n.placeId === placeId && n.text === text)) {
    return true;
  }
  const published = await getPublishedNotesForPlace(placeId);
  return published.some((n) => n.text === text);
}

// Duyệt -> đẩy vào place_notes:published (HSET theo field, không ghi đè cả hash — SPEC §6
// cảnh báo). Trả lại contributorId để admin cộng điểm sau khi duyệt (quy tắc 2).
export async function approveNote(queueItemId) {
  const queue = await getNoteQueue();
  const index = queue.findIndex((n) => n.id === queueItemId);
  if (index === -1) return { ok: false };
  const item = queue[index];

  const published = await getPublishedNotesForPlace(item.placeId);
  published.push({
    id: item.id,
    text: item.text,
    festivalOnly: item.festivalOnly,
    approvedAt: new Date().toISOString(),
    reports: 0,
  });
  await redis.hset(PUBLISHED_KEY, { [item.placeId]: published });

  queue.splice(index, 1);
  await saveNoteQueue(queue);
  return { ok: true, contributorId: item.contributorId };
}

// Bỏ -> xoá, không cộng, không báo người gửi (SPEC §6).
export async function rejectNote(queueItemId) {
  const queue = await getNoteQueue();
  await saveNoteQueue(queue.filter((n) => n.id !== queueItemId));
}

// Lớp 5 (SPEC §3, §7 quy tắc 6) — "Ghi chú này không đúng". INCR + EXPIRE 90 ngày đúng như
// SPEC §5 mô tả; đạt 2 -> tự ẩn khỏi công khai + quay lại hàng chờ trong /admin.
export async function reportNote(placeId, noteId) {
  const key = `note_reports:${noteId}`;
  const count = await redis.incr(key);
  if (count === 1) await redis.expire(key, REPORTS_TTL_SECONDS);
  if (count < 2) return { ok: true, hidden: false };

  const published = await getPublishedNotesForPlace(placeId);
  const note = published.find((n) => n.id === noteId);
  if (!note) return { ok: true, hidden: false };

  await redis.hset(PUBLISHED_KEY, { [placeId]: published.filter((n) => n.id !== noteId) });
  await pushNoteToQueue({
    id: `note-${crypto.randomUUID()}`,
    placeId,
    questionId: null,
    text: note.text,
    festivalOnly: note.festivalOnly,
    contributorId: null, // không rõ ai gửi ban đầu -> duyệt lại không cộng điểm ai
    at: new Date().toISOString(),
    aiVerdict: "OK",
    reported: true,
  });

  return { ok: true, hidden: true };
}

// Lọc hiển thị cho khách: bỏ ghi chú lễ hội đã hết hạn, tối đa 3 mẹo ưu tiên mới nhất
// (SPEC §4.2). Dùng ở trang chủ sau khi đọc xong place_notes:published.
export function filterVisibleNotes(notes) {
  if (!notes || notes.length === 0) return [];
  const now = new Date();
  const festivalEnd = new Date(`${FESTIVAL_END_DATE}T23:59:59`);
  return notes.filter((n) => !n.festivalOnly || now <= festivalEnd).slice(-3).reverse();
}
