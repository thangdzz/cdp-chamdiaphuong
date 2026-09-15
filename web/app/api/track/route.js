import { recordAnalyticsBatch } from "@/lib/analytics/store";
import {
  ANALYTICS_EVENTS,
  MAX_COUNT_PER_EVENT,
  MAX_PATHS_PER_BATCH,
  VISITOR_ID_PATTERN,
} from "@/lib/analytics/events";
import { validateDisplayName } from "@/lib/displayName";
import { listGameEvents } from "@/lib/game/registry";

// Nhận đợt sự kiện ẩn danh từ trình duyệt (NOTE-08 §8). Trình duyệt gửi bằng sendBeacon khi rời
// trang nên KHÔNG trả lỗi chi tiết — mọi gói không hợp lệ đều bị bỏ im lặng (204).

const BOT_UA = /bot|crawl|spider|slurp|facebookexternalhit|zalo.*preview|headless|lighthouse|pagespeed|preview/i;
const ANON_ID = /^c-[0-9a-f-]{36}$/;

// "Loại máy" ở mức thô (NOTE-08 §5) — đủ biết khách dùng iPhone hay Android, trình duyệt thường hay
// trình duyệt trong app Zalo/Facebook. Không lưu nguyên chuỗi user-agent.
function coarseDevice(ua) {
  const os = /iphone|ipad|ipod/i.test(ua)
    ? "iOS"
    : /android/i.test(ua)
      ? "Android"
      : /macintosh|mac os/i.test(ua)
        ? "Mac"
        : /windows/i.test(ua)
          ? "Windows"
          : "Khác";
  const browser = /zalo/i.test(ua)
    ? "Zalo"
    : /fban|fbav|fb_iab|instagram|messenger/i.test(ua)
      ? "Facebook"
      : /crios|chrome/i.test(ua)
        ? "Chrome"
        : /fxios|firefox/i.test(ua)
          ? "Firefox"
          : /safari/i.test(ua)
            ? "Safari"
            : "Khác";
  return `${os} · ${browser}`;
}

function cleanPath(value) {
  if (typeof value !== "string" || !value.startsWith("/") || value.startsWith("/admin")) return null;
  return value.split(/[?#]/)[0].slice(0, 120);
}

function cleanReferrer(value) {
  if (typeof value !== "string") return "";
  return value.replace(/[^\w.:\-/ ]/g, "").slice(0, 80);
}

export async function POST(request) {
  const empty = new Response(null, { status: 204 });
  // Công tắc tắt khẩn cấp nếu số lệnh Redis tăng quá dự tính (đặt biến rồi deploy lại).
  if (process.env.CDP_ANALYTICS_DISABLED === "1") return empty;
  // `npm run dev` không namespace mà ghi thì lượt bấm thử của chủ dự án lẫn vào số liệu thật.
  const namespaced = Boolean((process.env.CDP_ANALYTICS_NAMESPACE ?? process.env.CDP_GAME_NAMESPACE)?.trim());
  if (process.env.NODE_ENV !== "production" && !namespaced) return empty;

  const ua = request.headers.get("user-agent") ?? "";
  if (!ua || BOT_UA.test(ua)) return empty;

  let body;
  try {
    body = JSON.parse(await request.text());
  } catch {
    return empty;
  }
  if (!body || typeof body.v !== "string" || !VISITOR_ID_PATTERN.test(body.v)) return empty;

  const paths = (Array.isArray(body.p) ? body.p : [])
    .slice(0, MAX_PATHS_PER_BATCH)
    .map(cleanPath)
    .filter(Boolean);
  const counts = {};
  for (const name of ANALYTICS_EVENTS) {
    if (name === "page_view") continue;
    const n = Math.floor(Number(body.c?.[name]));
    if (Number.isFinite(n) && n > 0) counts[name] = Math.min(n, MAX_COUNT_PER_EVENT);
  }
  if (paths.length === 0 && Object.keys(counts).length === 0) return empty;

  const name = body.n ? validateDisplayName(body.n) : null;
  const postHrefs = new Set(listGameEvents().map((event) => event.postHref).filter(Boolean));

  try {
    await recordAnalyticsBatch({
      visitorId: body.v,
      anonId: typeof body.a === "string" && ANON_ID.test(body.a) ? body.a : "",
      // Tên chỉ để admin nhận ra khách; sai luật (hay "Người ẩn danh" cũ) thì bỏ, admin tự suy tên lúc đọc.
      displayName: name?.ok ? name.name : "",
      device: coarseDevice(ua),
      referrer: body.s ? cleanReferrer(body.r) : "",
      sessionStart: body.s === 1,
      postView: paths.some((path) => postHrefs.has(path)),
      paths,
      counts,
    });
  } catch (error) {
    console.error("[analytics]", error);
  }
  return empty;
}
