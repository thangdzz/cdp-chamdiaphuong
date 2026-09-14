import crypto from "crypto";
import { redis } from "./redis.js";
import {
  normalizePostEvents,
  postEventRevisionsKey,
  postEventsKey,
} from "./postEvents.js";

const MAX_ITEMS = 500;
export const MAX_INBOX_INPUT_LENGTH = 30000;

export const CONTENT_INPUT_TYPE = {
  URL: "url",
  MULTIPLE_URLS: "multiple_urls",
  TEXT: "text",
};

export const CONTENT_INBOX_STATUS = {
  NEW: "new",
  DRAFT: "draft",
  PUBLISHED: "published",
  IGNORED: "ignored",
};

export const CONTENT_PROCESSING_STATUS = {
  WAITING: "waiting",
  ANALYZED: "analyzed",
  NEEDS_CONTENT: "needs_content",
};

export function contentInboxKey() {
  const namespace = process.env.CDP_CONTENT_NAMESPACE?.trim();
  const key = "content_inbox:items";
  return namespace ? `${namespace}:${key}` : key;
}

function httpUrl(value) {
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:";
  } catch {
    return false;
  }
}

/** Chỉ nhận dạng kiểu đầu vào; phân tích chủ đề/Event thuộc bước pipeline sau. */
export function parseContentInboxInput(value) {
  const rawContent = typeof value === "string" ? value.trim() : "";
  if (!rawContent) return { ok: false, error: "Hãy dán link hoặc nội dung cần theo dõi." };
  if (rawContent.length > MAX_INBOX_INPUT_LENGTH) {
    return { ok: false, error: "Nội dung quá dài; tối đa 30.000 ký tự mỗi lần." };
  }

  const lines = rawContent.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  const onlyUrls = lines.length > 0 && lines.every(httpUrl);
  const sourceUrls = onlyUrls ? [...new Set(lines)] : [];
  if (sourceUrls.length > 20) {
    return { ok: false, error: "Mỗi lần nhận tối đa 20 đường link." };
  }

  return {
    ok: true,
    rawContent,
    inputType: onlyUrls
      ? sourceUrls.length === 1
        ? CONTENT_INPUT_TYPE.URL
        : CONTENT_INPUT_TYPE.MULTIPLE_URLS
      : CONTENT_INPUT_TYPE.TEXT,
    sourceUrls,
  };
}

function normalizeItems(value) {
  if (!Array.isArray(value)) return [];
  return value.filter((item) => item && typeof item.id === "string" && typeof item.rawContent === "string");
}

async function readContentInboxItems() {
  const stored = await redis.get(contentInboxKey());
  if (stored !== null && !Array.isArray(stored)) {
    throw new Error("Content Inbox sai định dạng.");
  }
  return normalizeItems(stored);
}

function findItem(items, id) {
  const index = items.findIndex((item) => item.id === id);
  if (index < 0) throw new Error("Không tìm thấy nội dung trong Inbox.");
  return { item: items[index], index };
}

async function replaceItem(id, update) {
  const items = await readContentInboxItems();
  const { item, index } = findItem(items, id);
  const next = [...items];
  next[index] = update(item);
  await redis.set(contentInboxKey(), next.slice(0, MAX_ITEMS));
  return next[index];
}

export async function getContentInboxItems() {
  try {
    return await readContentInboxItems();
  } catch {
    return [];
  }
}

export async function getContentInboxItem(id) {
  const items = await readContentInboxItems();
  return findItem(items, id).item;
}

export async function addContentInboxItem(parsed, analysis) {
  if (!parsed?.ok) throw new Error("Nội dung Content Inbox không hợp lệ.");
  // Khi ghi phải đọc nghiêm ngặt: Redis lỗi không được biến thành [] rồi ghi đè mất Inbox cũ.
  const items = await readContentInboxItems();
  const item = {
    id: `inbox-${crypto.randomUUID()}`,
    inputType: parsed.inputType,
    rawContent: parsed.rawContent,
    sourceUrls: parsed.sourceUrls,
    status: CONTENT_INBOX_STATUS.NEW,
    processingStatus: analysis?.candidate
      ? CONTENT_PROCESSING_STATUS.ANALYZED
      : CONTENT_PROCESSING_STATUS.NEEDS_CONTENT,
    analysis: analysis ?? null,
    createdBy: "admin",
    createdAt: new Date().toISOString(),
  };
  await redis.set(contentInboxKey(), [item, ...items].slice(0, MAX_ITEMS));
  return item;
}

export async function analyzeStoredContentInboxItem(id, analyze) {
  const items = await readContentInboxItems();
  const { item, index } = findItem(items, id);
  const parsed = parseContentInboxInput(item.rawContent);
  if (!parsed.ok) throw new Error(parsed.error);
  const analysis = await analyze(parsed);
  const next = [...items];
  next[index] = {
    ...item,
    processingStatus: analysis?.candidate
      ? CONTENT_PROCESSING_STATUS.ANALYZED
      : CONTENT_PROCESSING_STATUS.NEEDS_CONTENT,
    analysis,
    analyzedAt: new Date().toISOString(),
  };
  await redis.set(contentInboxKey(), next.slice(0, MAX_ITEMS));
  return next[index];
}

export async function setContentInboxStatus(id, status) {
  if (!Object.values(CONTENT_INBOX_STATUS).includes(status)) {
    throw new Error("Trạng thái Content Inbox không hợp lệ.");
  }
  return replaceItem(id, (item) => ({
    ...item,
    status,
    statusUpdatedAt: new Date().toISOString(),
  }));
}

export async function saveContentInboxDraft(id, event, postSlug, publishMode) {
  if (!event?.title) throw new Error("Bản nháp sự kiện không hợp lệ.");
  return replaceItem(id, (item) => ({
    ...item,
    status: CONTENT_INBOX_STATUS.DRAFT,
    draftEvent: event,
    draftPostSlug: postSlug,
    draftPublishMode: publishMode === "update" ? "update" : "create",
    statusUpdatedAt: new Date().toISOString(),
  }));
}

export async function deleteContentInboxItem(id) {
  const items = await readContentInboxItems();
  findItem(items, id);
  await redis.set(contentInboxKey(), items.filter((item) => item.id !== id));
}

/** Public lịch + audit log + trạng thái Inbox trong một Redis pipeline để không lệch nửa chừng. */
export async function publishContentInboxEvent({ id, postSlug, events, event, revision }) {
  const normalizedEvents = normalizePostEvents(events);
  if (!normalizedEvents) throw new Error("Lịch sau khi cập nhật không hợp lệ.");
  const [items, storedRevisions] = await Promise.all([
    readContentInboxItems(),
    redis.get(postEventRevisionsKey(postSlug)),
  ]);
  if (storedRevisions !== null && !Array.isArray(storedRevisions)) {
    throw new Error("Lịch sử sự kiện sai định dạng.");
  }
  const { item, index } = findItem(items, id);
  const publishedAt = new Date().toISOString();
  const nextItems = [...items];
  nextItems[index] = {
    ...item,
    status: CONTENT_INBOX_STATUS.PUBLISHED,
    draftEvent: event,
    draftPostSlug: postSlug,
    publishedEventId: event.id,
    publishedAt,
    statusUpdatedAt: publishedAt,
  };
  const nextRevisions = [revision, ...(storedRevisions ?? [])].slice(0, 100);
  const pipeline = redis.pipeline();
  pipeline.set(postEventsKey(postSlug), normalizedEvents);
  pipeline.set(postEventRevisionsKey(postSlug), nextRevisions);
  pipeline.set(contentInboxKey(), nextItems.slice(0, MAX_ITEMS));
  await pipeline.exec();
  return nextItems[index];
}
