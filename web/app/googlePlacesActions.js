"use server";

// Gọi Google Places Text Search (spec §4, §15, §16, §17). Phần thuần ở lib/googlePlaces.js.
//
// KHOÁ: chỉ dùng khoá MÁY CHỦ (`GOOGLE_MAPS_SERVER_KEY`), không bao giờ gửi xuống trình duyệt
// (§16). Dự án không nhúng thư viện JavaScript của Google (bản đồ dùng MapLibre + OSM) nên KHÔNG
// cần khoá trình duyệt — tạo thêm một khoá lộ ra ngoài chỉ để đó là tự rước rủi ro.
//
// CHI PHÍ (§17): chỉ chạy khi người dùng BẤM nút "Tìm trên Google", không chạy theo từng ký tự gõ.
// Thêm: chặn câu quá ngắn, giãn lượt, nhớ tạm kết quả trong tiến trình. Không có khoá thì tính năng
// tự tắt — phần còn lại của CDP chạy y nguyên.

import { headers } from "next/headers";
import {
  MAX_CANDIDATES,
  MIN_QUERY_LENGTH,
  PLACES_ENDPOINT,
  PLACES_FIELD_MASK,
  placesSearchBody,
  readPlacesResults,
} from "@/lib/googlePlaces";

const TIMEOUT_MS = 7000;
const MIN_GAP_MS = 300;
const CACHE_MAX = 200;
// Trần cứng cho mỗi tiến trình máy chủ: kể cả bị bấm liên tục cũng không thể thành hoá đơn bất ngờ.
const MAX_CALLS_PER_HOUR = 300;

const cache = new Map();
let lastCallAt = 0;
let windowStartedAt = Date.now();
let callsThisWindow = 0;

function overHourlyCap() {
  const now = Date.now();
  if (now - windowStartedAt > 3600_000) {
    windowStartedAt = now;
    callsThisWindow = 0;
  }
  if (callsThisWindow >= MAX_CALLS_PER_HOUR) return true;
  callsThisWindow += 1;
  return false;
}

/**
 * Tìm địa điểm trên Google để người dùng chọn đúng một cái.
 *
 * @param {{query: string, near?: {lat: number, lng: number}}} input
 * @returns {Promise<{ok: true, candidates: object[]}|{ok: false, error: string, disabled?: boolean}>}
 */
export async function searchGooglePlaces({ query, near }) {
  const apiKey = process.env.GOOGLE_MAPS_SERVER_KEY;
  if (!apiKey) {
    return { ok: false, disabled: true, error: "Chưa bật tra Google Maps trên máy chủ." };
  }
  const body = placesSearchBody(query, near);
  if (!body) return { ok: false, error: `Gõ ít nhất ${MIN_QUERY_LENGTH} ký tự để tìm.` };

  const key = `${body.textQuery}|${body.locationBias?.circle?.center?.latitude ?? ""}`;
  if (cache.has(key)) return { ok: true, candidates: cache.get(key) };

  if (overHourlyCap()) {
    return { ok: false, error: "Đã tra Google quá nhiều trong một giờ. Ghim tay trên bản đồ giúp em." };
  }
  const wait = MIN_GAP_MS - (Date.now() - lastCallAt);
  if (wait > 0) await new Promise((resolve) => setTimeout(resolve, wait));
  lastCallAt = Date.now();

  try {
    const response = await fetch(PLACES_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": apiKey,
        "X-Goog-FieldMask": PLACES_FIELD_MASK,
        // Google yêu cầu ghi rõ nơi gọi để khoá máy chủ hạn chế được theo ứng dụng.
        Referer: (await headers()).get("origin") ?? "https://chamdiaphuong.io.vn",
      },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    if (!response.ok) {
      // 400/403 gần như luôn là khoá sai hoặc chưa bật API — nói thẳng để còn sửa, đừng nuốt lỗi.
      return {
        ok: false,
        error: response.status === 403 || response.status === 400
          ? "Google từ chối khoá này (kiểm tra khoá và đã bật Places API chưa)."
          : "Google đang không trả kết quả. Ghim tay trên bản đồ vẫn dùng được.",
      };
    }
    const candidates = readPlacesResults(await response.json()).slice(0, MAX_CANDIDATES);
    if (cache.size >= CACHE_MAX) cache.delete(cache.keys().next().value);
    cache.set(key, candidates);
    return { ok: true, candidates };
  } catch {
    return { ok: false, error: "Không gọi được Google. Ghim tay trên bản đồ vẫn dùng được." };
  }
}
