"use server";

import crypto from "crypto";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { ADMIN_COOKIE_NAME, verifySessionToken } from "@/lib/adminAuth";
import {
  getPostEventRevisions,
  getPostEvents,
  rollbackPostEvent,
  setPostEventsWithRevision,
} from "@/lib/postEvents";
import { postEventFromForm } from "@/lib/postEventForm";
import {
  FESTIVAL_EVENTS,
  POST_META,
} from "@/lib/postEvents/le-hoi-thanh-tuyen-2026";

async function requireAdmin() {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_COOKIE_NAME)?.value;
  if (!verifySessionToken(token)) throw new Error("Chưa đăng nhập hoặc phiên đã hết hạn");
}

function backWithError(message) {
  redirect(`/admin?festivalError=${encodeURIComponent(message)}#festival-events`);
}

function revision({ eventId, changeType, oldEvent, newEvent, revertedRevisionId = null }) {
  return {
    id: `revision-${crypto.randomUUID()}`,
    eventId,
    changeType,
    oldEvent,
    newEvent,
    revertedRevisionId,
    publishedBy: "admin",
    publishedAt: new Date().toISOString(),
  };
}

async function saveAndReturn(events, eventRevision) {
  try {
    await setPostEventsWithRevision(POST_META.slug, events, eventRevision);
  } catch {
    backWithError("Không lưu được lịch. Dữ liệu cũ vẫn được giữ nguyên.");
  }
  revalidatePath("/");
  revalidatePath("/le-hoi-thanh-tuyen");
  revalidatePath("/admin");
  redirect("/admin?festivalSaved=1#festival-events");
}

export async function updateFestivalEvent(formData) {
  await requireAdmin();
  const id = formData.get("id")?.toString().trim() ?? "";
  const events = await getPostEvents(POST_META.slug, FESTIVAL_EVENTS);
  const index = events.findIndex((event) => event.id === id);
  if (index === -1) backWithError("Không tìm thấy mốc lịch cần sửa.");

  const result = postEventFromForm(formData, id);
  if (!result.ok) backWithError(result.error);
  const next = [...events];
  next[index] = result.event;
  await saveAndReturn(next, revision({
    eventId: id,
    changeType: "updated",
    oldEvent: events[index],
    newEvent: result.event,
  }));
}

export async function addFestivalEvent(formData) {
  await requireAdmin();
  const result = postEventFromForm(formData, `event-${crypto.randomUUID()}`);
  if (!result.ok) backWithError(result.error);
  const events = await getPostEvents(POST_META.slug, FESTIVAL_EVENTS);
  await saveAndReturn([...events, result.event], revision({
    eventId: result.event.id,
    changeType: "created",
    oldEvent: null,
    newEvent: result.event,
  }));
}

export async function rollbackFestivalEvent(formData) {
  await requireAdmin();
  const revisionId = formData.get("revisionId")?.toString().trim() ?? "";
  const [events, revisions] = await Promise.all([
    getPostEvents(POST_META.slug, FESTIVAL_EVENTS),
    getPostEventRevisions(POST_META.slug),
  ]);
  const target = revisions.find((item) => item.id === revisionId);
  if (!target) backWithError("Không tìm thấy bản thay đổi cần hoàn tác.");

  const { next, currentEvent } = rollbackPostEvent(events, target);

  await saveAndReturn(next, revision({
    eventId: target.eventId,
    changeType: "rollback",
    oldEvent: currentEvent,
    newEvent: target.oldEvent,
    revertedRevisionId: target.id,
  }));
}
