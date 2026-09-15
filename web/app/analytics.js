"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { SESSION_GAP_MS } from "@/lib/analytics/events";

// Ghi nhận hoạt động ẩn danh phía trình duyệt (NOTE-08 §8). Gom sự kiện rồi gửi theo đợt để giữ số
// lệnh Redis thấp (xem lib/analytics/store.js): đợt đầu của phiên gửi sau vài giây (khách vào xem rồi
// thoát nhanh vẫn được đếm), sau đó tối đa 30 giây một lần, và luôn gửi nốt khi rời/ẩn trang.

const VISITOR_KEY = "cdp_visitor_id";
const LAST_ACTIVE_KEY = "cdp_visitor_last_active";
// Khoá do nơi khác sở hữu — đọc thẳng localStorage thay vì import cả ContributionPanel/playerName vào
// layout (kéo theo server action và bảng góp ý vào mọi trang).
const CONTRIBUTOR_KEY = "cdp_contributor"; // app/ContributionPanel.js STORAGE_KEY
const DRAFT_NAME_KEY = "cdp_display_name_draft"; // app/_game/playerName.js

const FIRST_FLUSH_MS = 4000;
const FLUSH_MS = 30000;
const ENDPOINT = "/api/track";

let queue = { paths: [], counts: {}, sessionStart: false, referrer: "" };
let timer = null;
let listening = false;

function storage() {
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

// crypto.randomUUID chỉ có trên https — thử qua link http://MAdz.local trong mạng nhà vẫn phải chạy.
function randomUuid() {
  if (typeof crypto.randomUUID === "function") return crypto.randomUUID();
  const bytes = crypto.getRandomValues(new Uint8Array(16));
  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  const hex = [...bytes].map((b) => b.toString(16).padStart(2, "0")).join("");
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

function visitorId() {
  const store = storage();
  let id = store?.getItem(VISITOR_KEY);
  if (!id) {
    id = `v-${randomUuid()}`;
    store?.setItem(VISITOR_KEY, id);
  }
  return id;
}

function externalReferrer() {
  const params = new URLSearchParams(window.location.search);
  const utm = params.get("utm_source");
  if (utm) return `utm:${utm}`;
  try {
    const host = document.referrer ? new URL(document.referrer).host : "";
    return host && host !== window.location.host ? host : "";
  } catch {
    return "";
  }
}

// Phiên mới khi im lặng quá 30 phút. Mốc hoạt động lưu localStorage để mở tab mới ngay sau đó không
// bị tính thêm một phiên.
function touchSession() {
  const store = storage();
  const now = Date.now();
  const last = Number(store?.getItem(LAST_ACTIVE_KEY)) || 0;
  if (now - last > SESSION_GAP_MS) {
    queue.sessionStart = true;
    queue.referrer = externalReferrer();
  }
  store?.setItem(LAST_ACTIVE_KEY, String(now));
}

function identity() {
  const store = storage();
  try {
    const profile = JSON.parse(store?.getItem(CONTRIBUTOR_KEY) ?? "null");
    if (profile?.anonId) return { anonId: profile.anonId, name: profile.nickname ?? "" };
  } catch {
    // hồ sơ hỏng: coi như chưa có
  }
  return { anonId: "", name: store?.getItem(DRAFT_NAME_KEY) ?? "" };
}

function flush({ leaving = false } = {}) {
  if (timer) {
    window.clearTimeout(timer);
    timer = null;
  }
  if (queue.paths.length === 0 && Object.keys(queue.counts).length === 0) return;
  const { anonId, name } = identity();
  const payload = JSON.stringify({
    v: visitorId(),
    a: anonId,
    n: name,
    s: queue.sessionStart ? 1 : 0,
    r: queue.referrer,
    p: queue.paths,
    c: queue.counts,
  });
  queue = { paths: [], counts: {}, sessionStart: false, referrer: "" };
  try {
    if (leaving && navigator.sendBeacon?.(ENDPOINT, new Blob([payload], { type: "application/json" }))) return;
    fetch(ENDPOINT, { method: "POST", body: payload, keepalive: true, headers: { "content-type": "application/json" } }).catch(() => {});
  } catch {
    // Đo lường không bao giờ được làm hỏng trang.
  }
}

function listenForLeave() {
  if (listening) return;
  listening = true;
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") flush({ leaving: true });
  });
  window.addEventListener("pagehide", () => flush({ leaving: true }));
}

function schedule() {
  if (timer) return;
  timer = window.setTimeout(() => flush(), queue.sessionStart ? FIRST_FLUSH_MS : FLUSH_MS);
}

/** Ghi một sự kiện (tên trong lib/analytics/events.js). Không bao giờ ném lỗi. */
export function track(event, { path } = {}) {
  if (typeof window === "undefined") return;
  try {
    listenForLeave();
    touchSession();
    if (event === "page_view") {
      if (path) queue.paths.push(path);
    } else {
      queue.counts[event] = (queue.counts[event] ?? 0) + 1;
    }
    schedule();
  } catch {
    // bỏ qua
  }
}

/** Đặt một lần trong layout gốc: ghi page_view mỗi lần đổi trang (kể cả chuyển trang phía client). */
export function AnalyticsTracker() {
  const pathname = usePathname();
  useEffect(() => {
    if (pathname && !pathname.startsWith("/admin")) track("page_view", { path: pathname });
  }, [pathname]);
  return null;
}
