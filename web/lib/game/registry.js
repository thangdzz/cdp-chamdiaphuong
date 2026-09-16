// Primitive "Event" của game layer (NOTE-04 §19). Mọi mùa game đăng ký ở đây; route
// /[eventSlug] (tầng gốc), trang admin và store đều tra qua getGameEvent(), không import thẳng file mùa.

import { THANH_TUYEN_2026 } from "./seasons/thanh-tuyen-2026.js";

const GAME_EVENTS = [THANH_TUYEN_2026];

export const EVENT_PHASE = {
  UPCOMING: "upcoming",
  // Đã mở trang chơi thử nhưng CHƯA nhận lượt báo thật (NOTE-05 §1–§4): trước giờ `gameLiveAt`.
  PRE_GAME: "pre_game",
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
  return `/${event.slug}`;
}

function timeOf(iso) {
  const time = new Date(iso ?? "").getTime();
  return Number.isFinite(time) ? time : null;
}

// Giờ mở game thật. Admin có thể đổi trong Redis (store.readEventRuntimeConfig) mà không cần
// deploy — NOTE-05 §21; không có thì dùng giá trị trong file mùa.
export function eventGameLiveAt(event) {
  return event.runtime?.gameLiveAt ?? event.gameLiveAt ?? event.startAt;
}

export function eventPhase(event, now = Date.now()) {
  const start = timeOf(event.startAt);
  const end = timeOf(event.endAt);
  const liveAt = timeOf(eventGameLiveAt(event));
  if (start !== null && now < start) return EVENT_PHASE.UPCOMING;
  if (end !== null && now > end) return EVENT_PHASE.ENDED;
  if (liveAt !== null && now < liveAt) return EVENT_PHASE.PRE_GAME;
  return EVENT_PHASE.LIVE;
}

// Cấu hình chạy (đọc từ Redis) gắn vào bản sao event — không mutate object mùa dùng chung.
export function withRuntimeConfig(event, runtime) {
  return runtime && Object.keys(runtime).length > 0 ? { ...event, runtime } : event;
}

// Phần cấu hình gửi xuống client — bỏ danh sách seed (client nhận catalog đã gộp từ snapshot).
export function publicEventConfig(event) {
  const { objects, ...rest } = event;
  void objects;
  return { ...rest, gameLiveAt: eventGameLiveAt(event) };
}

// Pha hiển thị phía client: snapshot đang pre-game mà đồng hồ đã qua giờ mở thì coi như live ngay
// (trang đang mở không phải tải lại); lượt báo thật vẫn do server kiểm tra lại.
export function livePhaseAt(snapshot, now) {
  if (snapshot?.phase === EVENT_PHASE.PRE_GAME && snapshot.gameLiveAt && now >= Date.parse(snapshot.gameLiveAt)) {
    return EVENT_PHASE.LIVE;
  }
  return snapshot?.phase ?? EVENT_PHASE.LIVE;
}
