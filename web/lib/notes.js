import crypto from "crypto";
import { redis } from "./redis.js";

// Ghi chú công khai bằng chữ (SPEC-chang-5.md §5) — loại nội dung DUY NHẤT luôn phải qua
// admin duyệt (§7 quy tắc 1), nên cấu trúc lưu tách hẳn khỏi places:live.
const PUBLISHED_KEY = "place_notes:published"; // hash, field = placeId, value = mảng JSON
const QUEUE_KEY = "place_notes:queue"; // mảng chờ duyệt

// Mẹo địa phương phải giúp người sau làm được MỘT VIỆC CỤ THỂ (NOTE-03 §1.B). Bắt chọn ngữ
// cảnh trước khi gõ vừa đúng nguyên tắc "chọn là mặc định, gõ là ngoại lệ", vừa cho phép hiển
// thị mẹo dưới dạng FIELD ("Gửi xe — ...") thay vì như một dòng bình luận.
// Note cũ (trước 2026-09-09) không có context — đọc ra `null` và hiện như trước, KHÔNG cần
// migration.
// `hint` là ví dụ mờ trong ô gõ, ĐỔI THEO ngữ cảnh vừa chọn. Trước đây mọi ngữ cảnh đều dùng
// chung câu "VD: Gửi xe ở ngõ cạnh số 12", nên chọn "Loại xe" xong lại thấy ví dụ về gửi xe —
// vừa lạc đề vừa dễ làm khách gõ nhầm nội dung. Mỗi ví dụ phải là một mẹo giúp người sau LÀM
// ĐƯỢC MỘT VIỆC cụ thể (NOTE-03 §1.B), không phải mô tả lại chính cái nhãn.
export const NOTE_CONTEXTS = [
  { id: "gui-xe", label: "Gửi xe", hint: "VD: Tối lễ hội nên gửi xe phía sau chợ" },
  { id: "loi-vao", label: "Lối vào", hint: "VD: Cửa nhỏ, đi qua cổng sắt xanh cạnh số 12" },
  { id: "thoi-diem", label: "Thời điểm", hint: "VD: Trưa cuối tuần rất đông, nên đến trước 11h" },
  { id: "di-chuyen", label: "Di chuyển", hint: "VD: Từ quảng trường đi bộ 5 phút theo đường Trần Phú" },
  { id: "thanh-toan", label: "Thanh toán", hint: "VD: Chỉ nhận tiền mặt, không quẹt thẻ" },
  { id: "tien-ich", label: "Tiện ích", hint: "VD: Có chỗ ngồi ngoài trời, wifi khoẻ" },
  { id: "khac", label: "Khác", hint: "VD: Nghỉ thứ Hai hằng tuần" },

  // Riêng dịch vụ đi xe (NOTE-05 §8). Để chung một danh sách để noteContextLabel() đọc được
  // nhãn của MỌI mẹo đã lưu, kể cả khi chỗ đó sau này bị đổi loại hình.
  { id: "diem-don", label: "Điểm đón", hint: "VD: Đón ở đầu cầu Nông Tiến, gọi trước 15 phút" },
  { id: "diem-tra", label: "Điểm trả", hint: "VD: Trả tận nhà trong nội thành Hà Nội" },
  { id: "gio-chay", label: "Giờ chạy", hint: "VD: Chuyến sớm nhất 5h, chuyến cuối 18h" },
  { id: "loai-xe", label: "Loại xe", hint: "VD: Xe 4 chỗ và 7 chỗ, có cả xe Limousine" },
  { id: "dat-xe", label: "Đặt xe", hint: "VD: Cuối tuần nên đặt trước 1 ngày" },
  { id: "hanh-ly", label: "Hành lý", hint: "VD: Nhận chở xe máy, tính thêm phí" },
  { id: "cach-goi", label: "Cách gọi", hint: "VD: Gọi tổng đài nhanh hơn gọi số lái xe" },
];

// "Gửi xe / Lối vào" vô nghĩa với một nhà xe ghép, còn "Điểm đón / Giờ chạy" thì vô nghĩa với
// quán ăn — nên danh sách chip đổi theo family, subtype nào cần khác thì override (NOTE-05 §8,
// NOTE-06 §9). Cùng cách khai báo với lib/questions.js để 2 bên không lệch nhau.
const DEFAULT_CONTEXT_IDS = ["gui-xe", "loi-vao", "thoi-diem", "di-chuyen", "thanh-toan", "tien-ich", "khac"];

const FAMILY_CONTEXT_IDS = {
  "pickup-service": ["loai-xe", "diem-don", "diem-tra", "gio-chay", "dat-xe", "thanh-toan", "hanh-ly", "tien-ich", "khac"],
};

const SUBTYPE_CONTEXT_IDS = {
  // Taxi đón đúng chỗ khách đứng và trả đúng chỗ khách bảo — bỏ 2 chip điểm đón/điểm trả,
  // thêm "Cách gọi" (tổng đài / app / vẫy dọc đường) theo NOTE-06 §6.
  taxi: ["loai-xe", "cach-goi", "gio-chay", "dat-xe", "thanh-toan", "tien-ich", "khac"],
  "xe-khach": ["loai-xe", "diem-don", "diem-tra", "gio-chay", "dat-xe", "thanh-toan", "hanh-ly", "tien-ich", "khac"],
};

export function noteContextsForPlace(place, family = null) {
  const ids =
    (place?.type === "dilai" &&
      (SUBTYPE_CONTEXT_IDS[place.transportSubtype] ?? FAMILY_CONTEXT_IDS[family])) ||
    DEFAULT_CONTEXT_IDS;
  return ids.map((id) => NOTE_CONTEXTS.find((c) => c.id === id)).filter(Boolean);
}

export function noteContextLabel(contextId) {
  return NOTE_CONTEXTS.find((c) => c.id === contextId)?.label ?? null;
}

export function isValidNoteContext(contextId) {
  return NOTE_CONTEXTS.some((c) => c.id === contextId);
}
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
    context: item.context ?? null, // note cũ không có -> null, hiển thị như trước
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
