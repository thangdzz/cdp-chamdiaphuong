import { TIME_PRECISION, VERIFICATION, eventLocalDate } from "./events.js";

const LIMITS = {
  title: 160,
  description: 500,
  location: 200,
  whenText: 160,
  sourceName: 200,
  sourceUrl: 500,
};
const VALID_STATUSES = new Set(Object.values(VERIFICATION));
const VALID_TIME_PRECISIONS = new Set(Object.values(TIME_PRECISION));

function formText(formData, name, limit) {
  return (formData.get(name)?.toString() ?? "").trim().slice(0, limit);
}

function vietnamIso(value) {
  if (!value) return null;
  // datetime-local không mang múi giờ. Mọi lịch ở đây là giờ Việt Nam nên gắn +07:00 ngay
  // lúc nhận, tránh máy chủ Vercel hiểu thành UTC rồi làm lệch 7 tiếng.
  const iso = `${value.length === 16 ? `${value}:00` : value}+07:00`;
  return Number.isFinite(Date.parse(iso)) ? iso : null;
}

function validSourceUrl(value) {
  if (!value) return true;
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:";
  } catch {
    return false;
  }
}

function validDateOnly(value) {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const parsed = new Date(`${value}T00:00:00Z`);
  return Number.isFinite(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
}

export function dateTimeInputValue(value) {
  return typeof value === "string" ? value.slice(0, 16) : "";
}

export function eventDateInputValue(event) {
  return eventLocalDate(event) ?? "";
}

export function postEventFromForm(formData, id) {
  const title = formText(formData, "title", LIMITS.title);
  const startValue = formText(formData, "startAt", 30);
  const endValue = formText(formData, "endAt", 30);
  const startAt = vietnamIso(startValue);
  const endAt = vietnamIso(endValue);
  const date = formText(formData, "date", 10) || null;
  const timePrecision = formText(formData, "timePrecision", 20);
  const verificationStatus = formText(formData, "verificationStatus", 20);
  const sourceUrl = formText(formData, "sourceUrl", LIMITS.sourceUrl);
  const sourceUpdatedAt = formText(formData, "sourceUpdatedAt", 10);
  const whenText = formText(formData, "whenText", LIMITS.whenText);

  if (!title) return { ok: false, error: "Mốc lịch cần có tiêu đề." };
  if (!VALID_STATUSES.has(verificationStatus)) {
    return { ok: false, error: "Trạng thái mốc lịch không hợp lệ." };
  }
  if (!VALID_TIME_PRECISIONS.has(timePrecision)) {
    return { ok: false, error: "Mức chính xác thời gian không hợp lệ." };
  }
  if (date && !validDateOnly(date)) {
    return { ok: false, error: "Ngày diễn ra không hợp lệ." };
  }
  if (timePrecision === TIME_PRECISION.EXACT && !startValue) {
    return { ok: false, error: "Mốc có giờ chính xác cần giờ bắt đầu." };
  }
  if (timePrecision !== TIME_PRECISION.EXACT && !date && !whenText) {
    return { ok: false, error: "Hãy nhập ngày diễn ra hoặc chữ hiển thị thay ngày." };
  }
  if (timePrecision === TIME_PRECISION.EXACT && startValue && !startAt) {
    return { ok: false, error: "Giờ bắt đầu không hợp lệ." };
  }
  if (timePrecision === TIME_PRECISION.EXACT && endValue && !endAt) {
    return { ok: false, error: "Giờ kết thúc không hợp lệ." };
  }
  if (timePrecision === TIME_PRECISION.EXACT && startAt && endAt && Date.parse(endAt) < Date.parse(startAt)) {
    return { ok: false, error: "Giờ kết thúc phải sau giờ bắt đầu." };
  }
  if (!validSourceUrl(sourceUrl)) return { ok: false, error: "Link nguồn không hợp lệ." };
  if (sourceUpdatedAt && !/^\d{4}-\d{2}-\d{2}$/.test(sourceUpdatedAt)) {
    return { ok: false, error: "Ngày nguồn cập nhật không hợp lệ." };
  }

  return {
    ok: true,
    event: {
      id,
      title,
      description: formText(formData, "description", LIMITS.description) || null,
      location: formText(formData, "location", LIMITS.location) || null,
      startAt: timePrecision === TIME_PRECISION.EXACT ? startAt : null,
      endAt: timePrecision === TIME_PRECISION.EXACT ? endAt : null,
      date: timePrecision === TIME_PRECISION.EXACT ? null : date,
      whenText: whenText || null,
      allDay: timePrecision === TIME_PRECISION.DAY,
      timePrecision,
      highlight: formData.get("highlight") === "on",
      verificationStatus,
      source: {
        name: formText(formData, "sourceName", LIMITS.sourceName) || null,
        url: sourceUrl || null,
        updatedAt: sourceUpdatedAt || null,
      },
    },
  };
}
