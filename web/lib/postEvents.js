import { redis } from "./redis.js";
import { TIME_PRECISION, VERIFICATION, timePrecisionOf } from "./events.js";

const MAX_EVENTS_PER_POST = 100;
const MAX_REVISIONS_PER_POST = 100;
const VALID_VERIFICATION_STATUSES = new Set(Object.values(VERIFICATION));
const VALID_TIME_PRECISIONS = new Set(Object.values(TIME_PRECISION));

export function postEventsKey(slug) {
  const namespace = process.env.CDP_POST_EVENTS_NAMESPACE?.trim();
  const key = `post_events:${slug}`;
  return namespace ? `${namespace}:${key}` : key;
}

export function postEventRevisionsKey(slug) {
  const namespace = process.env.CDP_POST_EVENTS_NAMESPACE?.trim();
  const key = `post_event_revisions:${slug}`;
  return namespace ? `${namespace}:${key}` : key;
}

function optionalText(value) {
  const text = typeof value === "string" ? value.trim() : "";
  return text || null;
}

function validDate(value) {
  return value === null || (typeof value === "string" && Number.isFinite(Date.parse(value)));
}

function validDateOnly(value) {
  if (value === null) return true;
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const parsed = new Date(`${value}T00:00:00Z`);
  return Number.isFinite(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
}

/**
 * Không tin dữ liệu trong Redis chỉ vì nó do admin ghi: một lần sửa tay bằng script hoặc
 * dữ liệu cũ thiếu field không được phép làm vỡ cả trang lễ hội. Mảng sai khuôn trả về null
 * để tầng đọc dùng bản file đã deploy làm lưới an toàn.
 */
export function normalizePostEvents(value) {
  if (!Array.isArray(value) || value.length === 0 || value.length > MAX_EVENTS_PER_POST) {
    return null;
  }

  const ids = new Set();
  const events = [];
  for (const raw of value) {
    const id = optionalText(raw?.id);
    const title = optionalText(raw?.title);
    const verificationStatus = raw?.verificationStatus;
    const startAt = optionalText(raw?.startAt);
    const endAt = optionalText(raw?.endAt);
    const date = optionalText(raw?.date);
    const timePrecision = timePrecisionOf(raw ?? {});
    if (
      !id ||
      !title ||
      ids.has(id) ||
      !VALID_VERIFICATION_STATUSES.has(verificationStatus) ||
      !VALID_TIME_PRECISIONS.has(timePrecision) ||
      !validDate(startAt) ||
      !validDate(endAt) ||
      !validDateOnly(date)
    ) {
      return null;
    }
    if (startAt && endAt && Date.parse(endAt) < Date.parse(startAt)) return null;

    ids.add(id);
    events.push({
      id,
      title,
      description: optionalText(raw.description),
      location: optionalText(raw.location),
      startAt,
      endAt,
      date,
      whenText: optionalText(raw.whenText),
      allDay: raw.allDay === true,
      timePrecision,
      highlight: raw.highlight === true,
      verificationStatus,
      source: {
        name: optionalText(raw.source?.name),
        url: optionalText(raw.source?.url),
        updatedAt: optionalText(raw.source?.updatedAt),
      },
    });
  }
  return events;
}

export async function getPostEvents(slug, fallbackEvents) {
  try {
    const stored = normalizePostEvents(await redis.get(postEventsKey(slug)));
    return stored ?? fallbackEvents;
  } catch {
    // Lịch là nội dung gấp nhưng trang phải tiếp tục mở được nếu Redis tạm lỗi.
    return fallbackEvents;
  }
}

export async function setPostEvents(slug, events) {
  const normalized = normalizePostEvents(events);
  if (!normalized) throw new Error("Lịch sự kiện không hợp lệ.");
  await redis.set(postEventsKey(slug), normalized);
  return normalized;
}

async function readPostEventRevisions(slug) {
  const stored = await redis.get(postEventRevisionsKey(slug));
  return Array.isArray(stored) ? stored.slice(0, MAX_REVISIONS_PER_POST) : [];
}

export async function getPostEventRevisions(slug) {
  try {
    return await readPostEventRevisions(slug);
  } catch {
    // Lỗi lịch sử không được làm sập trang admin; thao tác GHI bên dưới vẫn dùng bản đọc
    // nghiêm ngặt để không vô tình xoá lịch sử cũ khi Redis chập chờn.
    return [];
  }
}

/** Lưu lịch và dấu vết thay đổi cùng một lượt mạng; log mới nhất đứng đầu. */
export async function setPostEventsWithRevision(slug, events, revision) {
  const normalized = normalizePostEvents(events);
  if (!normalized) throw new Error("Lịch sự kiện không hợp lệ.");
  const revisions = await readPostEventRevisions(slug);
  const nextRevisions = [revision, ...revisions].slice(0, MAX_REVISIONS_PER_POST);
  const pipeline = redis.pipeline();
  pipeline.set(postEventsKey(slug), normalized);
  pipeline.set(postEventRevisionsKey(slug), nextRevisions);
  await pipeline.exec();
  return normalized;
}

export function rollbackPostEvent(events, revision) {
  const currentIndex = events.findIndex((event) => event.id === revision.eventId);
  const currentEvent = currentIndex >= 0 ? events[currentIndex] : null;
  if (revision.oldEvent) {
    const next = [...events];
    if (currentIndex >= 0) next[currentIndex] = revision.oldEvent;
    else next.push(revision.oldEvent);
    return { next, currentEvent };
  }
  return {
    next: events.filter((event) => event.id !== revision.eventId),
    currentEvent,
  };
}
