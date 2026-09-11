// Mốc thời gian của một Post (CDP_P1-P8 §P1 + "Dynamic Timeline").
//
// Đây là LOGIC CHUNG, không dính gì tới Trung thu: dữ liệu từng bài nằm riêng ở
// lib/postEvents/*.js. Bài "Cuối tuần đi đâu", "Nghỉ lễ 2/9" sau này dùng lại đúng file này.
//
// Vì sao tách ngày giờ ra khỏi giao diện: trước 2026-09-11 cả 12 mốc lịch nằm thẳng trong JSX
// của trang lễ hội. Muốn biết mốc nào đã qua thì phải tự đọc và tự nhẩm, mà sửa một giờ chiếu
// đèn cũng phải sửa mã giao diện.
//
// MÚI GIỜ: mọi mốc ghi kèm "+07:00" nên `new Date()` ra đúng một mốc tuyệt đối — máy chủ chạy
// giờ UTC hay khách ngồi ở Nhật thì "Đêm hội 20h tối 20/9" vẫn là đúng khoảnh khắc đó. Chữ
// hiện ra luôn format theo Asia/Ho_Chi_Minh, không theo giờ máy người xem.

const TZ = "Asia/Ho_Chi_Minh";

/**
 * Giờ hiện tại, đọc như một NGUỒN DỮ LIỆU chứ không phải hằng số trong lúc vẽ.
 *
 * Trang lễ hội là Server Component `force-dynamic`: mỗi lượt mở trang render một lần, nên
 * "bây giờ là mấy giờ" cũng là thứ phải đọc vào giống như đọc Redis. Gọi thẳng `Date.now()`
 * giữa lúc vẽ thì React coi là hàm không thuần khiết (cùng đầu vào có thể ra kết quả khác) —
 * đúng với giao diện chạy trên máy khách, nên cứ `await` ở đây cho rạch ròi.
 */
export async function readNow() {
  return Date.now();
}

export const EVENT_STATUS = {
  LIVE: "live", // đang diễn ra
  UPCOMING: "upcoming", // sắp tới
  PAST: "past", // đã diễn ra
  UNDATED: "undated", // biết có, chưa biết ngày
};

// Mức tin cậy của mốc — nguồn nói chắc hay mới chỉ là dự kiến. Khách đi xa mấy trăm cây số
// theo một cái lịch thì phải biết lịch đó chắc tới đâu.
export const VERIFICATION = {
  CONFIRMED: "confirmed", // nguồn chính thức, có ngày giờ rõ
  EXPECTED: "expected", // dự kiến, nguồn chưa chốt
  CANCELLED: "cancelled",
};

/**
 * @param {object} event mốc đã khai trong lib/postEvents/*
 * @param {number} now epoch ms — truyền vào được để test, mặc định lấy giờ hiện tại
 */
export function eventStatus(event, now = Date.now()) {
  if (event.verificationStatus === VERIFICATION.CANCELLED) return EVENT_STATUS.PAST;
  if (!event.startAt) return EVENT_STATUS.UNDATED;
  const start = new Date(event.startAt).getTime();
  // Không khai giờ kết thúc thì coi như kéo hết ngày hôm đó — mốc "20/9" không nên thành "đã
  // qua" ngay lúc 00:01 sáng 20/9.
  const end = event.endAt ? new Date(event.endAt).getTime() : start + 24 * 60 * 60 * 1000;
  if (now > end) return EVENT_STATUS.PAST;
  if (now >= start) return EVENT_STATUS.LIVE;
  return EVENT_STATUS.UPCOMING;
}

/** Sắp theo thời gian; mốc chưa có ngày xuống cuối vì không biết xếp vào đâu. */
export function sortEvents(events) {
  return [...events].sort((a, b) => {
    if (!a.startAt) return 1;
    if (!b.startAt) return -1;
    return new Date(a.startAt) - new Date(b.startAt);
  });
}

/**
 * Chia mốc theo trạng thái để giao diện khỏi tự lọc mỗi nơi một kiểu.
 * `next` = mốc sắp tới GẦN NHẤT, thứ khách mở trang ra là muốn biết trước tiên (§"Phần 2").
 */
export function groupEvents(events, now = Date.now()) {
  const sorted = sortEvents(events);
  const live = sorted.filter((e) => eventStatus(e, now) === EVENT_STATUS.LIVE);
  const upcoming = sorted.filter((e) => eventStatus(e, now) === EVENT_STATUS.UPCOMING);
  const past = sorted.filter((e) => eventStatus(e, now) === EVENT_STATUS.PAST);
  const undated = sorted.filter((e) => eventStatus(e, now) === EVENT_STATUS.UNDATED);
  return { live, upcoming, past, undated, next: upcoming[0] ?? null };
}

const WEEKDAYS = ["Chủ nhật", "thứ Hai", "thứ Ba", "thứ Tư", "thứ Năm", "thứ Sáu", "thứ Bảy"];

function parts(iso) {
  const fmt = new Intl.DateTimeFormat("en-CA", {
    timeZone: TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    weekday: "short",
    hour12: false,
  });
  const out = {};
  for (const p of fmt.formatToParts(new Date(iso))) out[p.type] = p.value;
  // weekday theo giờ VN: tự tính từ ngày đã đổi múi giờ, tránh phụ thuộc chữ viết tắt tiếng Anh
  const dayIndex = new Date(`${out.year}-${out.month}-${out.day}T12:00:00+07:00`).getUTCDay();
  return {
    day: Number(out.day),
    month: Number(out.month),
    year: Number(out.year),
    hour: out.hour,
    minute: out.minute,
    weekday: WEEKDAYS[dayIndex],
  };
}

/** "20/9 (chủ nhật) · 20:00" · "19 – 25/9" · "Tháng 9 — chưa có ngày cụ thể". */
export function formatEventWhen(event) {
  if (!event.startAt) return event.whenText ?? "Chưa có ngày cụ thể";
  const s = parts(event.startAt);
  const e = event.endAt ? parts(event.endAt) : null;
  const sameDay = e && s.day === e.day && s.month === e.month;

  if (e && !sameDay) {
    const left = s.month === e.month ? `${s.day}` : `${s.day}/${s.month}`;
    return `${left} – ${e.day}/${e.month}`;
  }

  const date = `${s.day}/${s.month} (${s.weekday})`;
  // Mốc cả ngày khai 00:00 — hiện "0:00" thì khách tưởng có hoạt động lúc nửa đêm.
  if (event.allDay) return date;
  const time = e && sameDay ? `${s.hour}:${s.minute} – ${e.hour}:${e.minute}` : `${s.hour}:${s.minute}`;
  return `${date} · ${time}`;
}

/** Ngày theo lịch VIỆT NAM, dạng "2026-09-12" — để đếm ngược theo ngày chứ không theo số giờ. */
function dayKey(time) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(time));
}

/**
 * "hôm nay" / "ngày mai" / "còn 3 ngày" — cho mốc sắp tới gần nhất.
 *
 * Đếm theo NGÀY LỊCH, không phải số giờ chia 24: 15h chiều nay tới 0h sáng mai chỉ cách 9
 * tiếng, chia 24 ra 0 và thành "hôm nay" — sai hẳn một ngày với người đang xem.
 */
export function formatCountdown(event, now = Date.now()) {
  if (!event?.startAt) return null;
  const diffDays = Math.round(
    (Date.parse(`${dayKey(event.startAt)}T00:00:00Z`) - Date.parse(`${dayKey(now)}T00:00:00Z`)) /
      (24 * 60 * 60 * 1000)
  );
  if (diffDays <= 0) return "hôm nay";
  if (diffDays === 1) return "ngày mai";
  return `còn ${diffDays} ngày`;
}
