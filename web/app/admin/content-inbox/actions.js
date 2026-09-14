"use server";

import crypto from "crypto";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { ADMIN_COOKIE_NAME, verifySessionToken } from "@/lib/adminAuth";
import {
  addContentInboxItem,
  analyzeStoredContentInboxItem,
  CONTENT_INBOX_STATUS,
  deleteContentInboxItem,
  getContentInboxItem,
  parseContentInboxInput,
  publishContentInboxEvent,
  saveContentInboxDraft,
  setContentInboxStatus,
} from "@/lib/contentInbox";
import { analyzeContentInboxInput } from "@/lib/contentAnalyzer";
import { getPostEvents } from "@/lib/postEvents";
import { postEventFromForm } from "@/lib/postEventForm";
import { FESTIVAL_EVENTS, POST_META } from "@/lib/postEvents/le-hoi-thanh-tuyen-2026";

function backWithError(message) {
  redirect(`/admin/content-inbox?error=${encodeURIComponent(message)}`);
}

async function requireAdmin() {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_COOKIE_NAME)?.value;
  if (!verifySessionToken(token)) redirect("/admin");
}

function inboxId(formData) {
  const id = formData.get("id")?.toString() ?? "";
  if (!id.startsWith("inbox-")) backWithError("Mục Content Inbox không hợp lệ.");
  return id;
}

export async function receiveContent(formData) {
  await requireAdmin();

  const parsed = parseContentInboxInput(formData.get("content")?.toString() ?? "");
  if (!parsed.ok) backWithError(parsed.error);

  let item;
  try {
    const events = await getPostEvents(POST_META.slug, FESTIVAL_EVENTS);
    const analysis = await analyzeContentInboxInput(parsed, events);
    item = await addContentInboxItem(parsed, analysis);
  } catch {
    backWithError("Chưa phân tích và lưu được nội dung. Dữ liệu cũ vẫn được giữ nguyên.");
  }
  revalidatePath("/admin/content-inbox");
  redirect(`/admin/content-inbox?analyzed=1#${item.id}`);
}

export async function analyzeWaitingContent(formData) {
  await requireAdmin();
  const id = inboxId(formData);

  let item;
  try {
    const events = await getPostEvents(POST_META.slug, FESTIVAL_EVENTS);
    item = await analyzeStoredContentInboxItem(id, (parsed) =>
      analyzeContentInboxInput(parsed, events)
    );
  } catch {
    backWithError("Chưa phân tích được mục này; nội dung gốc vẫn được giữ nguyên.");
  }
  revalidatePath("/admin/content-inbox");
  redirect(`/admin/content-inbox?analyzed=1#${item.id}`);
}

export async function ignoreContent(formData) {
  await requireAdmin();
  const id = inboxId(formData);
  try {
    await setContentInboxStatus(id, CONTENT_INBOX_STATUS.IGNORED);
  } catch {
    backWithError("Chưa gỡ được nội dung; dữ liệu vẫn được giữ nguyên.");
  }
  revalidatePath("/admin/content-inbox");
  redirect("/admin/content-inbox?removed=1");
}

export async function restoreContent(formData) {
  await requireAdmin();
  const id = inboxId(formData);
  try {
    await setContentInboxStatus(id, CONTENT_INBOX_STATUS.NEW);
  } catch {
    backWithError("Chưa khôi phục được nội dung.");
  }
  revalidatePath("/admin/content-inbox");
  redirect(`/admin/content-inbox?restored=1#${id}`);
}

export async function deleteContentPermanently(formData) {
  await requireAdmin();
  const id = inboxId(formData);
  try {
    const item = await getContentInboxItem(id);
    if (item.status !== CONTENT_INBOX_STATUS.IGNORED) {
      backWithError("Chỉ xóa hẳn nội dung đã được đưa vào tab Bỏ qua.");
    }
    await deleteContentInboxItem(id);
  } catch {
    backWithError("Chưa xóa được nội dung; dữ liệu vẫn được giữ nguyên.");
  }
  revalidatePath("/admin/content-inbox");
  redirect("/admin/content-inbox?tab=ignored&deleted=1");
}

function postSlugFrom(formData) {
  const postSlug = formData.get("postSlug")?.toString() ?? "";
  return postSlug === POST_META.slug ? postSlug : null;
}

function candidateId(item, formData, forPublish) {
  const matchedId = item.analysis?.comparison?.matchedEventId ?? null;
  const mode = formData.get("publishMode")?.toString();
  if (mode === "update" && matchedId) return matchedId;
  return forPublish ? `event-${crypto.randomUUID()}` : `draft-${item.id}`;
}

export async function saveDraft(formData) {
  await requireAdmin();
  const id = inboxId(formData);
  const postSlug = postSlugFrom(formData);
  if (!postSlug) backWithError("Hãy chọn Post phù hợp trước khi lưu bản nháp.");
  try {
    const item = await getContentInboxItem(id);
    const result = postEventFromForm(formData, candidateId(item, formData, false));
    if (!result.ok) backWithError(result.error);
    await saveContentInboxDraft(
      id,
      result.event,
      postSlug,
      formData.get("publishMode")?.toString()
    );
  } catch {
    backWithError("Chưa lưu được bản nháp; nội dung gốc vẫn được giữ nguyên.");
  }
  revalidatePath("/admin/content-inbox");
  redirect(`/admin/content-inbox?tab=draft&draftSaved=1#${id}`);
}

export async function publishContent(formData) {
  await requireAdmin();
  const id = inboxId(formData);
  const postSlug = postSlugFrom(formData);
  if (!postSlug) backWithError("Hãy chọn Post phù hợp trước khi Public.");

  try {
    const [item, events] = await Promise.all([
      getContentInboxItem(id),
      getPostEvents(POST_META.slug, FESTIVAL_EVENTS),
    ]);
    const eventId = candidateId(item, formData, true);
    const result = postEventFromForm(formData, eventId);
    if (!result.ok) backWithError(result.error);
    const index = events.findIndex((event) => event.id === eventId);
    const oldEvent = index >= 0 ? events[index] : null;
    const nextEvents = [...events];
    if (index >= 0) nextEvents[index] = result.event;
    else nextEvents.push(result.event);
    const publishedAt = new Date().toISOString();
    await publishContentInboxEvent({
      id,
      postSlug,
      events: nextEvents,
      event: result.event,
      revision: {
        id: `revision-${crypto.randomUUID()}`,
        eventId,
        changeType: oldEvent ? "updated_from_inbox" : "created_from_inbox",
        oldEvent,
        newEvent: result.event,
        inboxItemId: id,
        publishedBy: "admin",
        publishedAt,
      },
    });
  } catch {
    backWithError("Chưa Public được sự kiện; lịch và Inbox cũ vẫn được giữ nguyên.");
  }
  revalidatePath("/");
  revalidatePath("/le-hoi-thanh-tuyen");
  revalidatePath("/admin");
  revalidatePath("/admin/content-inbox");
  redirect(`/admin/content-inbox?tab=published&published=1#${id}`);
}
