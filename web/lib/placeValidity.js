// HIỆU LỰC THEO THỜI GIAN của một địa điểm (NOTE-15 §13).
//
// Vì sao cần: mùa lễ hội sinh ra những chỗ CÓ THẬT nhưng chỉ tồn tại vài ngày — bãi gửi xe lễ
// hội, điểm cấm đường, sân khấu tạm, chợ tạm, điểm xem mô hình. Đưa vào danh bạ như chỗ thường
// thì sang tháng sau khách vẫn thấy và vẫn được chỉ đường tới một bãi xe không còn tồn tại.
// Không đưa vào thì đúng tuần cần nhất lại không có.
//
// Nguyên tắc của §13: hết hạn thì **thôi ưu tiên**, KHÔNG xoá. Lộ trình và sổ của khách đã trỏ
// tới chỗ đó vẫn phải xem lại được — người ta còn nhớ "năm ngoái gửi xe ở đâu".
//
// Múi giờ: đi theo lib/events.js — ngày admin gõ ("2026-09-25") hiểu là trọn ngày đó theo giờ
// Việt Nam, không phải theo giờ máy chủ. Máy chủ Vercel chạy UTC, nên nếu so thô thì tối 25/9 ở
// Tuyên Quang đã bị coi là hết hạn.

const TZ_OFFSET = "+07:00";

/** @type {{PERMANENT: "permanent", UPCOMING: "upcoming", ACTIVE: "active", EXPIRED: "expired"}} */
export const PLACE_VALIDITY = {
  PERMANENT: "permanent",
  UPCOMING: "upcoming",
  ACTIVE: "active",
  EXPIRED: "expired",
};

/** "2026-09-25" -> mốc đầu ngày đó, giờ Việt Nam. Sai khuôn -> null. */
function startOfDay(dateStr) {
  if (typeof dateStr !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return null;
  const t = Date.parse(`${dateStr}T00:00:00${TZ_OFFSET}`);
  return Number.isFinite(t) ? t : null;
}

/** Mốc CUỐI ngày — "đến 25/9" phải tính hết cả ngày 25, không phải hết lúc 0h. */
function endOfDay(dateStr) {
  const start = startOfDay(dateStr);
  return start === null ? null : start + 24 * 60 * 60 * 1000 - 1;
}

/**
 * Chỗ này đang trong thời gian tồn tại hay không.
 *
 * @param place hồ sơ địa điểm (`temporary`, `validFrom`, `validUntil`)
 * @param now mốc hiện tại — truyền vào chứ không tự đọc, để hàm thuần và test được
 * @returns {{status: string, from: number|null, until: number|null, fromDate: string|null, untilDate: string|null}}
 */
export function placeValidity(place, now = Date.now()) {
  const temporary = place?.temporary === true;
  const fromDate = typeof place?.validFrom === "string" ? place.validFrom : null;
  const untilDate = typeof place?.validUntil === "string" ? place.validUntil : null;
  const from = startOfDay(fromDate);
  const until = endOfDay(untilDate);

  // Đánh dấu tạm mà không khai mốc nào thì coi như thường trực — thà hiện thừa còn hơn ẩn mất
  // một chỗ có thật vì admin quên điền ngày.
  if (!temporary || (from === null && until === null)) {
    return { status: PLACE_VALIDITY.PERMANENT, from, until, fromDate, untilDate };
  }
  if (until !== null && now > until) {
    return { status: PLACE_VALIDITY.EXPIRED, from, until, fromDate, untilDate };
  }
  if (from !== null && now < from) {
    return { status: PLACE_VALIDITY.UPCOMING, from, until, fromDate, untilDate };
  }
  return { status: PLACE_VALIDITY.ACTIVE, from, until, fromDate, untilDate };
}

/** Đã qua thời gian tồn tại — thôi bày ra chỗ tìm kiếm, nhưng KHÔNG xoá. */
export function isPlaceExpired(place, now = Date.now()) {
  return placeValidity(place, now).status === PLACE_VALIDITY.EXPIRED;
}

/** "25/9" — ngắn cho nhãn, không kèm năm vì nhãn chỉ dùng trong mùa. */
function shortDate(dateStr) {
  if (typeof dateStr !== "string") return null;
  const [, month, day] = dateStr.split("-");
  return month && day ? `${Number(day)}/${Number(month)}` : null;
}

/**
 * Câu ngắn hiện cho khách. null = chỗ thường trực, không cần nói gì.
 * Viết theo lối người ta nói, không phải "validUntil: 2026-09-25".
 */
export function placeValidityLabel(place, now = Date.now()) {
  const { status, fromDate, untilDate } = placeValidity(place, now);
  const from = shortDate(fromDate);
  const until = shortDate(untilDate);
  if (status === PLACE_VALIDITY.PERMANENT) return null;
  if (status === PLACE_VALIDITY.EXPIRED) return `Chỗ tạm — đã hết ngày ${until}`;
  if (status === PLACE_VALIDITY.UPCOMING) {
    return until ? `Chỗ tạm — có từ ${from} đến ${until}` : `Chỗ tạm — có từ ${from}`;
  }
  if (until) return `Chỗ tạm — chỉ có tới ${until}`;
  return "Chỗ tạm";
}
