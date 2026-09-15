// Sound identity của object (NOTE-06 §2–§9). THUẦN — client (phát tiếng) và admin (xem thời lượng,
// nguồn) dùng chung một cách hiểu. Không có tên mô hình nào ở đây: mùa game khai `soundSet` (công
// thức ghép lớp theo khoá) + `soundFamilies` (khoá mặc định theo nhóm); object chỉ trỏ `soundKey`.
//
// Một lớp (layer) = [âm, lúc bắt đầu (giây), độ to 0..1, tốc độ phát]. Âm là khoá mẫu thật trong
// SOUND_SAMPLES (file CC0 đã chuẩn hoá âm lượng) hoặc "synth:<tên>" — hiệu ứng tổng hợp bằng Web Audio
// để thêm cảm giác game (chuông, blip, pulse). Tốc độ < 1 = trầm hơn và dài hơn.

import { OBJECT_KIND } from "./catalog.js";
import { SOUND_SAMPLES } from "./soundSamples.js";

export { SOUND_SAMPLES };

export const SYNTH_PREFIX = "synth:";

// Thời lượng của các lớp tổng hợp (giây) — bộ phát nằm ở app/_game/gameSound.js, phải khớp tên.
export const SYNTH_DURATIONS = {
  "tap-soft": 0.1,
  "discovery-chime": 0.6,
  "seen-again": 0.35,
  "question-tone": 0.7,
  "magic-shimmer": 0.7,
  "regal-shimmer": 0.9,
  "rise-sweep": 0.6,
  "ceremonial-chime": 0.9,
  "digital-blip": 0.3,
  "digital-sweep": 0.6,
  "signal-pulse": 0.6,
  "cinematic-pulse": 0.8,
  "success-chime": 0.85,
  "celebration-chime": 1.2,
  "completion-chime": 1.3,
  "secret-reveal": 0.8,
  "combo": 1.15,
  "troll": 0.7,
  "game-live": 0.75,
};

// Khoá mà mọi nhóm thiếu công thức đều rơi về — không bao giờ im lặng vì thiếu cấu hình.
const DEFAULT_RECIPE = { key: "default", label: "Chuông mở khoá mặc định", layers: [["synth:discovery-chime"]] };

// Âm theo sự kiện, dùng chung mọi mùa (NOTE-06 §7, §8). Mốc lớn và trọn bộ dùng mẫu thật
// (trống hội, đám đông); âm giao diện ngắn giữ tổng hợp cho phản hồi tức thì.
export const EVENT_SOUND_RECIPES = {
  "tap-soft": { label: "Chạm nhẹ", layers: [["synth:tap-soft"]] },
  "discovery-chime": { label: "Mở khoá (không có âm riêng)", layers: [["synth:discovery-chime"]] },
  "seen-again": { label: "Gặp lại mô hình đã có", layers: [["synth:seen-again"]] },
  "collection-complete": { label: "Hoàn thành một bộ nhỏ / người đầu tiên", layers: [["synth:success-chime"]] },
  "secret-reveal": { label: "Mở bộ sưu tập ẩn", layers: [["whoosh", 0, 0.45], ["synth:secret-reveal", 0.05]] },
  combo: { label: "Combo hoàn thành", layers: [["big-tom", 0, 0.8], ["synth:combo", 0.05]] },
  milestone: {
    label: "Đạt mốc 5 / 10 / 20 / 30 / 40",
    layers: [["big-tom", 0, 0.85], ["big-tom", 0.3, 0.7, 1.12], ["crowd-cheer", 0.25, 0.4], ["synth:celebration-chime", 0.35]],
  },
  // 45/45: trống hội + đám đông reo nhẹ + chuông hoàn thành (NOTE-06 §8).
  "grand-complete": {
    label: "Trọn bộ (45 / 45)",
    layers: [["drum-loop", 0, 0.85], ["crowd-cheer", 0.45, 0.5], ["synth:completion-chime", 1.0]],
  },
  troll: { label: "Câu đùa pre-game", layers: [["synth:troll"]] },
  "game-live": { label: "Game chuyển sang live", layers: [["big-tom", 0, 0.7], ["synth:game-live", 0.08]] },
};

export function isSynthLayer(sound) {
  return typeof sound === "string" && sound.startsWith(SYNTH_PREFIX);
}

function layerDuration(sound, rate) {
  if (isSynthLayer(sound)) return SYNTH_DURATIONS[sound.slice(SYNTH_PREFIX.length)] ?? 0;
  return (SOUND_SAMPLES[sound]?.duration ?? 0) / rate;
}

/**
 * Chuẩn hoá lớp từ cấu hình: bỏ lớp trỏ tới âm không tồn tại (sửa tay nhầm khoá không làm vỡ tiếng).
 * @returns [{ sound, at, gain, rate, duration }]
 */
export function normalizeLayers(layers) {
  return (Array.isArray(layers) ? layers : [])
    .map((layer) => (Array.isArray(layer) ? layer : [layer]))
    .map(([sound, at = 0, gain = 1, rate = 1]) => ({
      sound,
      at: Math.max(0, Number(at) || 0),
      gain: Math.min(1, Math.max(0, Number(gain) || 0)),
      rate: Math.min(2, Math.max(0.5, Number(rate) || 1)),
    }))
    .filter(({ sound }) =>
      isSynthLayer(sound) ? sound.slice(SYNTH_PREFIX.length) in SYNTH_DURATIONS : Boolean(SOUND_SAMPLES[sound])
    )
    .map((layer) => ({ ...layer, duration: layerDuration(layer.sound, layer.rate) }));
}

export function recipeDuration(layers) {
  return layers.reduce((max, layer) => Math.max(max, layer.at + layer.duration), 0);
}

function buildRecipe(key, raw, source) {
  const layers = normalizeLayers(raw?.layers);
  if (layers.length === 0) return null;
  return { key, label: raw.label ?? key, layers, duration: recipeDuration(layers), source };
}

// Object chưa rõ danh tính (người chơi báo "không biết tên", hoặc slot chưa có tên) dùng âm bí ẩn
// thay vì tiếng một con vật cụ thể (NOTE-06 §9).
export function soundFamilyOf(object) {
  if (object?.soundFamily) return object.soundFamily;
  if (object?.kind === OBJECT_KIND.UNKNOWN) return "mystery";
  return null;
}

/**
 * Công thức âm mở khoá cho một object: soundKey riêng → khoá mặc định theo nhóm → chuông mặc định.
 * @returns { key, label, layers, duration, source: "model" | "family" | "default" }
 */
export function soundRecipeFor(object, event) {
  const set = event?.soundSet ?? {};
  const own = object?.soundKey ? buildRecipe(object.soundKey, set[object.soundKey], "model") : null;
  if (own) return own;
  const familyKey = event?.soundFamilies?.[soundFamilyOf(object)];
  const family = familyKey ? buildRecipe(familyKey, set[familyKey], "family") : null;
  return family ?? buildRecipe(DEFAULT_RECIPE.key, DEFAULT_RECIPE, "default");
}

export function eventSoundRecipe(name) {
  const raw = EVENT_SOUND_RECIPES[name];
  return raw ? buildRecipe(name, raw, "event") : null;
}

// Danh sách mẫu thật mà một công thức cần tải — để tải trước đúng thứ sắp phát (NOTE-06 §13).
export function recipeSampleKeys(recipe) {
  return [...new Set((recipe?.layers ?? []).filter((l) => !isSynthLayer(l.sound)).map((l) => l.sound))];
}
