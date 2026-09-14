// Primitive "Event" của game layer (NOTE-04 §19). Mọi mùa game đăng ký ở đây; route
// /cham/[eventSlug], trang admin và store đều tra qua getGameEvent(), không import thẳng file mùa.

import { THANH_TUYEN_2026 } from "./seasons/thanh-tuyen-2026.js";

const GAME_EVENTS = [THANH_TUYEN_2026];

export const EVENT_PHASE = {
  UPCOMING: "upcoming",
  LIVE: "live",
  ENDED: "ended",
};

export function listGameEvents() {
  return GAME_EVENTS;
}

export function getGameEvent(slug) {
  return GAME_EVENTS.find((event) => event.slug === slug) ?? null;
}

export function gameEventHref(event) {
  return `/cham/${event.slug}`;
}

export function eventPhase(event, now = Date.now()) {
  if (now < new Date(event.startAt).getTime()) return EVENT_PHASE.UPCOMING;
  if (now > new Date(event.endAt).getTime()) return EVENT_PHASE.ENDED;
  return EVENT_PHASE.LIVE;
}

// Phần cấu hình gửi xuống client — bỏ danh sách seed (client nhận catalog đã gộp từ snapshot).
export function publicEventConfig(event) {
  const { objects, ...rest } = event;
  void objects;
  return rest;
}
