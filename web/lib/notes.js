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

// Cùng một ngữ cảnh nhưng ở chỗ khác nhau thì ví dụ phải khác: "Tiện ích" ở quán ăn là wifi
// và chỗ ngồi, ở trên xe là điều hoà và ghế trẻ em; "Giờ chạy" của xe ghép là giờ chuyến, của
// taxi là giờ tổng đài trực. Khai theo 3 tầng, hẹp thắng rộng — cùng cách với câu hỏi và CTA
// (lib/questions.js, lib/transport.js) để 3 nơi không lệch nhau.
const HINTS_BY_SUBTYPE = {
  taxi: {
    "loai-xe": "VD: Chủ yếu xe 4 chỗ, gọi trước mới có xe 7 chỗ",
    "gio-chay": "VD: Tổng đài trực 24/7, khuya vẫn gọi được xe",
    "dat-xe": "VD: Giờ cao điểm gọi tổng đài phải chờ khá lâu",
    "cach-goi": "VD: Gọi tổng đài nhanh hơn hẳn gọi số lái xe",
    khac: "VD: Có nhận chở ra sân bay Nội Bài",
  },
  "thue-xe-co-lai": {
    "gio-chay": "VD: Nhận chạy cả đêm nếu báo trước",
    "dat-xe": "VD: Đi tỉnh nên đặt trước 2–3 ngày",
    khac: "VD: Giá đi tỉnh đã gồm tiền ăn ở của lái xe",
  },
};

const HINTS_BY_FAMILY = {
  "pickup-service": {
    "thanh-toan": "VD: Trả tiền mặt cho lái xe, có nhận chuyển khoản",
    "tien-ich": "VD: Xe có điều hoà, báo trước thì có ghế trẻ em",
    khac: "VD: Có nhận chở hàng kèm khách",
  },
  "scheduled-route": {
    "loai-xe": "VD: Tuyến này chạy xe 29 chỗ, có cả giường nằm",
    "thoi-diem": "VD: Giờ tan tầm xe rất đông, nên đi sớm hơn",
    "thanh-toan": "VD: Mua vé trên xe, có nhận chuyển khoản",
    "tien-ich": "VD: Xe có điều hoà, wifi và nước uống",
    khac: "VD: Có nhận gửi hàng theo xe",
  },
  // 3 nhóm dưới chưa hoàn thiện câu hỏi/CTA (NOTE-06 §11), nhưng ví dụ trong ô gõ thì sửa
  // được ngay — để một bãi đỗ xe gợi ý "wifi khoẻ" thì sai hẳn ngữ cảnh.
  "transport-place": {
    "thoi-diem": "VD: Dịp lễ hội đông từ chiều, nên tới sớm",
    "thanh-toan": "VD: Thu tiền mặt tại chỗ, có xé vé giữ xe",
    "tien-ich": "VD: Có mái che, có bảo vệ trông ban đêm",
    khac: "VD: Đóng cổng lúc 22h",
  },
  "self-drive": {
    "thoi-diem": "VD: Cuối tuần hết xe sớm, nên gọi giữ trước",
    "thanh-toan": "VD: Đặt cọc tiền mặt hoặc giữ giấy tờ",
    "tien-ich": "VD: Có kèm mũ bảo hiểm và áo mưa",
    khac: "VD: Cần CCCD và bằng lái khi thuê",
  },
};

const HINTS_BY_TYPE = {
  ngu: {
    "thoi-diem": "VD: Cuối tuần dịp lễ hội hết phòng từ sớm",
    "tien-ich": "VD: Có thang máy, nước nóng ổn định",
    khac: "VD: Nhận khách sau 22h nếu gọi báo trước",
  },
  choi: {
    "thoi-diem": "VD: Chiều muộn vắng người, chụp ảnh đẹp",
    "tien-ich": "VD: Có nhà vệ sinh sạch, chỗ ngồi có mái",
    khac: "VD: Trời mưa là đóng cửa sớm",
  },
};

/**
 * Ngữ cảnh mẹo hợp với một địa điểm, kèm ví dụ mờ đã chọn đúng theo chỗ đó.
 * @returns {{id: string, label: string, hint: string}[]}
 */
export function noteContextsForPlace(place, family = null) {
  const ids =
    (place?.type === "dilai" &&
      (SUBTYPE_CONTEXT_IDS[place.transportSubtype] ?? FAMILY_CONTEXT_IDS[family])) ||
    DEFAULT_CONTEXT_IDS;

  return ids
    .map((id) => {
      const context = NOTE_CONTEXTS.find((c) => c.id === id);
      if (!context) return null;
      const hint =
        HINTS_BY_SUBTYPE[place?.transportSubtype]?.[id] ??
        HINTS_BY_FAMILY[family]?.[id] ??
        HINTS_BY_TYPE[place?.type]?.[id] ??
        context.hint;
      return { ...context, hint };
    })
    .filter(Boolean);
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
