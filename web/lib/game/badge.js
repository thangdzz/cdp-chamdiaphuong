// CDP Collectible Icon System (NOTE-07 §4–§9). Huy hiệu sưu tập 4 lớp:
//   1. base shape  — hình khối theo khung của nhóm (khiên, bát giác, lục giác…)
//   2. frame       — viền kim loại/men theo nhóm
//   3. hero symbol — MỘT biểu tượng duy nhất (không ghép hai hình như NOTE-05)
//   4. state       — chưa gặp / đã gặp / vừa mở / bí ẩn (class CSS `cdp-badge--*` trong globals.css)
//
// THUẦN, trả về chuỗi HTML (không id, không <defs>) để dùng chung cho React (bộ sưu tập, sheet),
// marker bản đồ (HTML thuần của MapLibre) và trang admin. Không có tên mô hình nào ở đây: mùa game
// khai `iconSet` (khoá → hình) và `categories[].frame`; mùa khác, địa điểm, chợ phiên dùng lại được.

import { OBJECT_KIND } from "./catalog.js";
import { ICON_ART } from "./iconArt.js";
import { CUSTOM_ICON_ART } from "./iconArtCustom.js";

export { ICON_ART_LICENSE } from "./iconArt.js";

const ART = { ...ICON_ART, ...CUSTOM_ICON_ART };
export const MYSTERY_ART = "mystery-lantern";

function polygonFromRadius(points, radiusAt) {
  const coords = [];
  for (let i = 0; i < points; i++) {
    const angle = -Math.PI / 2 + (i / points) * Math.PI * 2;
    const r = radiusAt(i, angle);
    coords.push(`${(50 + r * Math.cos(angle)).toFixed(2)}% ${(50 + r * Math.sin(angle)).toFixed(2)}%`);
  }
  return `polygon(${coords.join(",")})`;
}

// Khung theo nhóm (NOTE-07 §9). `shape` là clip-path; `hero` = tỉ lệ hình hero so với huy hiệu.
export const BADGE_FRAMES = {
  // Muông thú/linh vật: vành răng sắc, mạnh.
  creature: {
    label: "Linh vật — vành răng sắc",
    shape: polygonFromRadius(32, (i) => (i % 2 === 0 ? 50 : 45.5)),
    hero: 0.6,
    rim: ["#fff1b8", "#d9a232", "#8a5a12"],
    enamel: ["#e4623f", "#8e2414"],
  },
  // Lịch sử/anh hùng: khiên huy hiệu.
  heroic: {
    label: "Lịch sử — khiên huy hiệu",
    shape: "polygon(50% 0%,93% 11%,95% 50%,84% 76%,50% 100%,16% 76%,5% 50%,7% 11%)",
    hero: 0.54,
    heroOffsetY: -0.03,
    rim: ["#ffe2b0", "#c0823f", "#6b3d17"],
    enamel: ["#b8452f", "#4a160d"],
  },
  // Truyền thuyết: vành mềm gợn sóng, sắc tím huyền bí.
  legend: {
    label: "Truyền thuyết — vành mềm huyền bí",
    shape: polygonFromRadius(72, (i, angle) => 47.5 + 2.5 * Math.cos(angle * 12)),
    hero: 0.58,
    rim: ["#f4ecff", "#a58ddb", "#4d3a8c"],
    enamel: ["#8b6ad6", "#2c1f68"],
  },
  // Văn hoá/dân gian: bát giác như tem/đèn thủ công.
  folk: {
    label: "Văn hoá — bát giác thủ công",
    shape: "polygon(29% 0%,71% 0%,100% 29%,100% 71%,71% 100%,29% 100%,0% 71%,0% 29%)",
    hero: 0.58,
    rim: ["#fbe7a6", "#c79a3a", "#6e4d12"],
    enamel: ["#3fa06f", "#12432c"],
  },
  // Công nghệ: lục giác cắt cạnh, sạch, digital.
  tech: {
    label: "Công nghệ — lục giác cắt cạnh",
    shape: "polygon(25% 2%,75% 2%,100% 50%,75% 98%,25% 98%,0% 50%)",
    hero: 0.56,
    rim: ["#eef7ff", "#7fa3c6", "#2f4b66"],
    enamel: ["#3a86e0", "#0d2a5c"],
  },
  // Doanh nghiệp đồng hành: cùng khuôn công nghệ, men than chì.
  sponsor: {
    label: "Đồng hành — lục giác men than",
    shape: "polygon(25% 2%,75% 2%,100% 50%,75% 98%,25% 98%,0% 50%)",
    hero: 0.56,
    rim: ["#f5f7fa", "#9aa6b5", "#3b4552"],
    enamel: ["#4a5a70", "#161d28"],
  },
  // Bí ẩn/chưa rõ: tròn, bạc tím.
  mystery: {
    label: "Bí ẩn — tròn bạc tím",
    shape: "circle(50% at 50% 50%)",
    hero: 0.62,
    rim: ["#f1eefa", "#a9a2c4", "#565073"],
    enamel: ["#6f6699", "#27223f"],
  },
};

const HERO_COLOR = "#fff6dd";

function escapeHtml(text) {
  return String(text).replace(/[&<>"']/g, (ch) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[ch]);
}

/**
 * Đặc tả huy hiệu của một object: hình hero + khung.
 * Thứ tự: khoá trong `event.iconSet` → emoji admin tự gõ → bí ẩn (object chưa biết tên) → biểu
 * tượng của nhóm. Không bao giờ rỗng.
 * @returns { key, art, emoji, frame }
 */
export function badgeSpec(object, event) {
  const category = event?.categories?.find((c) => c.id === object?.category);
  const unknown = object?.kind === OBJECT_KIND.UNKNOWN && !object?.icon;
  const frame = unknown ? "mystery" : BADGE_FRAMES[category?.frame] ? category.frame : "mystery";
  const entry = object?.icon ? event?.iconSet?.[object.icon] : null;
  if (!unknown && entry?.art && ART[entry.art]) {
    return { key: `${entry.art}|${frame}`, art: entry.art, emoji: entry.emoji ?? null, frame };
  }
  if (!unknown && object?.icon && !/^[a-z0-9-]+$/.test(object.icon)) {
    return { key: `emoji:${object.icon}|${frame}`, art: null, emoji: object.icon, frame };
  }
  if (unknown || !category?.icon) {
    return { key: `${MYSTERY_ART}|${frame}`, art: MYSTERY_ART, emoji: "❓", frame };
  }
  return { key: `emoji:${category.icon}|${frame}`, art: null, emoji: category.icon, frame };
}

// Tác giả các hình bên thứ ba đang dùng — dòng ghi công bắt buộc của CC BY 3.0.
export function artAuthors() {
  return [...new Set(Object.values(ICON_ART).map((art) => art.author))].sort();
}

export function artCredit(name) {
  return ART[name] ?? null;
}

/**
 * HTML huy hiệu. size: px. state: "plain" | "locked" | "met" | "unlocked" (NOTE-07 §6).
 * shape: ghi đè khung (marker bản đồ luôn tròn — NOTE-07 §7).
 */
export function badgeHtml(spec, { size = 64, state = "plain", shape = null, check = true } = {}) {
  const frame = BADGE_FRAMES[spec?.frame] ?? BADGE_FRAMES.mystery;
  const clip = shape === "circle" ? "circle(50% at 50% 50%)" : frame.shape;
  const rim = Math.max(2, Math.round(size * 0.075));
  const groove = rim + Math.max(1, Math.round(size * 0.022));
  const layer = (inset, background) =>
    `<span style="position:absolute;inset:${inset}px;clip-path:${clip};-webkit-clip-path:${clip};background:${background}"></span>`;

  const heroScale = shape === "circle" ? Math.min(frame.hero, 0.58) : frame.hero;
  const heroSize = Math.round(size * heroScale);
  const heroLeft = Math.round((size - heroSize) / 2);
  const heroTop = Math.round((size - heroSize) / 2 + size * (shape === "circle" ? 0 : frame.heroOffsetY ?? 0));
  const shadow = Math.max(1, Math.round(size * 0.02));
  const art = spec?.art ? ART[spec.art] : null;
  const hero = art
    ? `<svg viewBox="0 0 512 512" width="${heroSize}" height="${heroSize}" fill="${HERO_COLOR}"${
        art.fillRule ? ` fill-rule="${art.fillRule}"` : ""
      } style="position:absolute;left:${heroLeft}px;top:${heroTop}px;filter:drop-shadow(0 ${shadow}px 0 rgba(0,0,0,.4))">${art.paths
        .map((d) => `<path d="${d}"/>`)
        .join("")}</svg>`
    : `<span style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-size:${Math.round(
        size * 0.46
      )}px;line-height:1">${escapeHtml(spec?.emoji ?? "🏮")}</span>`;

  const met = state === "met" || state === "unlocked";
  const checkSize = Math.max(12, Math.round(size * 0.3));
  const checkMark =
    met && check
      ? `<span style="position:absolute;right:${-Math.round(checkSize * 0.12)}px;bottom:${-Math.round(
          checkSize * 0.12
        )}px;width:${checkSize}px;height:${checkSize}px;border-radius:9999px;background:#e0a526;color:#fff;box-shadow:0 0 0 2px #fff;display:flex;align-items:center;justify-content:center;font:700 ${Math.round(
          checkSize * 0.62
        )}px/1 system-ui,sans-serif">✓</span>`
      : "";

  return (
    `<span class="cdp-badge cdp-badge--${state}" style="width:${size}px;height:${size}px">` +
    layer(0, `linear-gradient(150deg,${frame.rim[0]} 0%,${frame.rim[1]} 45%,${frame.rim[2]} 100%)`) +
    layer(rim, `${frame.rim[2]}`) +
    layer(groove, `radial-gradient(circle at 34% 28%,${frame.enamel[0]} 0%,${frame.enamel[1]} 78%)`) +
    layer(groove, "linear-gradient(165deg,rgba(255,255,255,.32) 0%,rgba(255,255,255,0) 46%)") +
    hero +
    checkMark +
    `</span>`
  );
}
