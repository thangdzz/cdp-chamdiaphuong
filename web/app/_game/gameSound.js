"use client";

// Bộ phát âm thanh game (NOTE-04 §11, NOTE-05 §14–§18, NOTE-06). Công thức (lớp nào, lúc nào, to
// bao nhiêu) nằm ở lib/game/sounds.js + file mùa; file này chỉ biết PHÁT: mẫu thật (.m4a CC0) qua
// AudioBuffer, hiệu ứng "synth:*" bằng oscillator. Không có tên mô hình nào ở đây.
//
// - Không autoplay, không nhạc nền: chỉ gọi sau hành động của người chơi (NOTE-06 §13).
// - Không tải trước cả thư viện: chọn mô hình nào thì tải tiếng mô hình đó (vài chục KB).
// - Mọi tiếng đi qua một bộ nén chung (limiter nhẹ) — lớp chồng nhau không vỡ, rồng không át thỏ.
// - Mạng chậm/không giải mã được: phát phần tổng hợp của công thức, hoặc chuông mặc định. Game vẫn chạy đủ.

import { useSyncExternalStore } from "react";
import {
  SOUND_SAMPLES,
  SYNTH_PREFIX,
  eventSoundRecipe,
  isSynthLayer,
  recipeSampleKeys,
  soundRecipeFor,
} from "@/lib/game/sounds";

const PREF_KEY = "cdp_game_sound";
const listeners = new Set();
let audioContext = null;
let masterInput = null;
let noiseBuffer = null;

// Chờ mẫu tải xong tối đa chừng này rồi phát với những gì đã có — tiếng trễ hơn nữa là lệch khỏi
// lúc icon bật lên.
const SAMPLE_WAIT_MS = 700;
// Synth được thiết kế nhỏ hơn mẫu thật: lớp hiệu ứng làm nền, không át tiếng "nhân vật" (NOTE-06 §12).
const SYNTH_LEVEL = 1.4;

function readPref() {
  try {
    return window.localStorage.getItem(PREF_KEY) !== "off";
  } catch {
    return true;
  }
}

export function setSoundEnabled(enabled) {
  try {
    window.localStorage.setItem(PREF_KEY, enabled ? "on" : "off");
  } catch {
    // Chế độ riêng tư chặn localStorage: chấp nhận không nhớ lựa chọn.
  }
  listeners.forEach((listener) => listener());
}

function subscribe(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function useSoundEnabled() {
  return useSyncExternalStore(subscribe, readPref, () => true);
}

function getContext() {
  if (typeof window === "undefined") return null;
  try {
    const AudioCtor = window.AudioContext ?? window.webkitAudioContext;
    if (!AudioCtor) return null;
    if (!audioContext) {
      audioContext = new AudioCtor();
      // Limiter mềm cho cả bus: chồng 3–4 lớp vẫn không clip, tiếng to bị ép nhẹ về cùng mặt bằng.
      const compressor = audioContext.createDynamicsCompressor();
      compressor.threshold.value = -14;
      compressor.knee.value = 8;
      compressor.ratio.value = 4;
      compressor.attack.value = 0.004;
      compressor.release.value = 0.2;
      const volume = audioContext.createGain();
      volume.gain.value = 0.9;
      compressor.connect(volume).connect(audioContext.destination);
      masterInput = compressor;
    }
    if (audioContext.state === "suspended") audioContext.resume().catch(() => {});
    return audioContext;
  } catch {
    return null;
  }
}

// ─── Mẫu thật ───

const sampleBuffers = new Map(); // khoá → AudioBuffer đã giải mã
const sampleLoads = new Map(); // khoá → Promise đang tải

function decode(ctx, data) {
  return new Promise((resolve) => {
    try {
      // Safari cũ chỉ có dạng callback; bản mới trả Promise — hỗ trợ cả hai.
      const maybe = ctx.decodeAudioData(data, resolve, () => resolve(null));
      maybe?.catch?.(() => resolve(null));
    } catch {
      resolve(null);
    }
  });
}

function loadSample(ctx, key) {
  if (sampleBuffers.has(key)) return Promise.resolve(sampleBuffers.get(key));
  if (sampleLoads.has(key)) return sampleLoads.get(key);
  const meta = SOUND_SAMPLES[key];
  if (!meta) return Promise.resolve(null);
  const load = fetch(meta.file)
    .then((response) => (response.ok ? response.arrayBuffer() : null))
    .then((data) => (data ? decode(ctx, data) : null))
    .catch(() => null)
    .then((buffer) => {
      sampleLoads.delete(key); // lỗi mạng thì lần sau thử lại
      if (buffer) sampleBuffers.set(key, buffer);
      return buffer;
    });
  sampleLoads.set(key, load);
  return load;
}

function prefetchRecipe(recipe) {
  if (!recipe || !readPref()) return;
  const ctx = getContext();
  if (!ctx) return;
  recipeSampleKeys(recipe).forEach((key) => loadSample(ctx, key));
}

export function prefetchObjectSound(object, event) {
  prefetchRecipe(soundRecipeFor(object, event));
}

// ─── Khối dựng synth (phát vào `dest` tại thời điểm tuyệt đối t0) ───

function tone(ctx, t0, dest, { freq, to, start = 0, duration, type = "sine", gain = 0.1, attack = 0.01 }) {
  const osc = ctx.createOscillator();
  const amp = ctx.createGain();
  const t = t0 + start;
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t);
  if (to) osc.frequency.exponentialRampToValueAtTime(to, t + duration * 0.85);
  amp.gain.setValueAtTime(0.0001, t);
  amp.gain.exponentialRampToValueAtTime(gain, t + attack);
  amp.gain.exponentialRampToValueAtTime(0.0001, t + duration);
  osc.connect(amp).connect(dest);
  osc.start(t);
  osc.stop(t + duration + 0.02);
}

// Chuông: một nốt + bồi âm lệch (tiếng kim loại), tắt dần.
function bell(ctx, t0, dest, { freq, start = 0, duration = 0.7, gain = 0.08 }) {
  tone(ctx, t0, dest, { freq, start, duration, gain, attack: 0.004 });
  tone(ctx, t0, dest, { freq: freq * 2.76, start, duration: duration * 0.5, gain: gain * 0.35, attack: 0.004 });
  tone(ctx, t0, dest, { freq: freq * 5.4, start, duration: duration * 0.25, gain: gain * 0.15, attack: 0.002 });
}

function getNoise(ctx) {
  if (noiseBuffer && noiseBuffer.sampleRate === ctx.sampleRate) return noiseBuffer;
  noiseBuffer = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
  const data = noiseBuffer.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
  return noiseBuffer;
}

function noise(ctx, t0, dest, { start = 0, duration, filter = "bandpass", freq = 800, to, q = 1, gain = 0.08 }) {
  const src = ctx.createBufferSource();
  src.buffer = getNoise(ctx);
  const biquad = ctx.createBiquadFilter();
  const amp = ctx.createGain();
  const t = t0 + start;
  biquad.type = filter;
  biquad.Q.value = q;
  biquad.frequency.setValueAtTime(freq, t);
  if (to) biquad.frequency.exponentialRampToValueAtTime(to, t + duration);
  amp.gain.setValueAtTime(0.0001, t);
  amp.gain.exponentialRampToValueAtTime(gain, t + duration * 0.2);
  amp.gain.exponentialRampToValueAtTime(0.0001, t + duration);
  src.connect(biquad).connect(amp).connect(dest);
  src.start(t);
  src.stop(t + duration + 0.02);
}

const arp = (ctx, t0, dest, freqs, { start = 0, step = 0.08, duration = 0.4, type = "sine", gain = 0.08 } = {}) =>
  freqs.forEach((freq, i) => tone(ctx, t0, dest, { freq, start: start + i * step, duration, type, gain }));

// Tên + thời lượng phải khớp SYNTH_DURATIONS trong lib/game/sounds.js.
const SYNTHS = {
  "tap-soft": (c, t, d) => tone(c, t, d, { freq: 740, duration: 0.09, type: "triangle", gain: 0.06 }),
  "discovery-chime": (c, t, d) => arp(c, t, d, [784, 988, 1319], { step: 0.09, duration: 0.42, gain: 0.1 }),
  // Gặp lại: hai nốt ngắn, nhẹ — khác hẳn tiếng mở khoá (NOTE-06 §7).
  "seen-again": (c, t, d) => arp(c, t, d, [988, 1319], { step: 0.07, duration: 0.22, type: "triangle", gain: 0.07 }),
  // Bí ẩn: nốt đi lên như câu hỏi "hửm?" + lấp lánh mờ (NOTE-06 §9).
  "question-tone": (c, t, d) => {
    tone(c, t, d, { freq: 392, to: 523, duration: 0.28, type: "triangle", gain: 0.07, attack: 0.03 });
    tone(c, t, d, { freq: 466, to: 698, start: 0.3, duration: 0.38, type: "triangle", gain: 0.06, attack: 0.03 });
    noise(c, t, d, { start: 0.1, duration: 0.55, filter: "highpass", freq: 5500, gain: 0.015 });
  },
  "magic-shimmer": (c, t, d) => {
    arp(c, t, d, [1047, 1319, 1568, 2093, 2637], { step: 0.05, duration: 0.35, type: "triangle", gain: 0.04 });
    noise(c, t, d, { start: 0.05, duration: 0.6, filter: "highpass", freq: 5000, gain: 0.018 });
  },
  // Lấp lánh vàng kiểu "showpiece": hợp âm trưởng đi lên sáng rực (NOTE-07 §2.3 Rồng vàng).
  "regal-shimmer": (c, t, d) => {
    arp(c, t, d, [784, 988, 1175, 1568, 1976], { step: 0.06, duration: 0.5, type: "triangle", gain: 0.045 });
    [1568, 1976].forEach((freq) => bell(c, t, d, { freq, start: 0.3, duration: 0.6, gain: 0.03 }));
  },
  // Luồng vút đi lên (cá chép vượt vũ môn): nhiễu quét cao dần + nốt trượt lên.
  "rise-sweep": (c, t, d) => {
    noise(c, t, d, { duration: 0.55, freq: 400, to: 5000, q: 1.4, gain: 0.07 });
    tone(c, t, d, { freq: 330, to: 1320, duration: 0.5, type: "triangle", gain: 0.04, attack: 0.05 });
  },
  "ceremonial-chime": (c, t, d) => {
    bell(c, t, d, { freq: 523, duration: 0.9, gain: 0.07 });
    bell(c, t, d, { freq: 784, start: 0.18, duration: 0.7, gain: 0.05 });
  },
  "digital-blip": (c, t, d) => arp(c, t, d, [880, 1320, 1760, 2640], { step: 0.05, duration: 0.06, type: "square", gain: 0.03 }),
  "digital-sweep": (c, t, d) => {
    tone(c, t, d, { freq: 300, to: 2400, duration: 0.45, type: "sawtooth", gain: 0.022 });
    arp(c, t, d, [1760, 2217, 2637], { start: 0.3, step: 0.06, duration: 0.25, gain: 0.04 });
  },
  "signal-pulse": (c, t, d) => {
    [0, 0.16, 0.32].forEach((start, i) => tone(c, t, d, { freq: 1200 + i * 200, start, duration: 0.12, gain: 0.05, attack: 0.003 }));
    tone(c, t, d, { freq: 220, duration: 0.5, type: "triangle", gain: 0.04 });
  },
  "cinematic-pulse": (c, t, d) => {
    tone(c, t, d, { freq: 70, to: 42, duration: 0.7, gain: 0.22, attack: 0.005 });
    noise(c, t, d, { duration: 0.35, filter: "lowpass", freq: 500, gain: 0.05 });
    bell(c, t, d, { freq: 1568, start: 0.15, duration: 0.6, gain: 0.03 });
  },
  "success-chime": (c, t, d) => {
    arp(c, t, d, [523, 659, 784, 1047], { step: 0.08, duration: 0.5, gain: 0.09 });
    [1047, 1319].forEach((freq) => tone(c, t, d, { freq, start: 0.34, duration: 0.48, type: "triangle", gain: 0.05 }));
  },
  "celebration-chime": (c, t, d) => {
    arp(c, t, d, [392, 523, 659, 784], { step: 0.09, duration: 0.35, type: "triangle", gain: 0.07 });
    [523, 659, 784, 1047].forEach((freq) => tone(c, t, d, { freq, start: 0.4, duration: 0.8, gain: 0.045 }));
    noise(c, t, d, { start: 0.4, duration: 0.8, filter: "highpass", freq: 6000, gain: 0.02 });
  },
  "completion-chime": (c, t, d) => {
    [784, 988, 1175, 1568].forEach((freq, i) => bell(c, t, d, { freq, start: i * 0.1, duration: 0.9, gain: 0.05 }));
    [523, 659, 784].forEach((freq) => tone(c, t, d, { freq, start: 0.4, duration: 0.9, type: "triangle", gain: 0.04 }));
  },
  "secret-reveal": (c, t, d) => {
    noise(c, t, d, { duration: 0.6, freq: 800, to: 6000, q: 2, gain: 0.03 });
    arp(c, t, d, [988, 1175, 1480, 1976], { step: 0.1, duration: 0.5, type: "triangle", gain: 0.06 });
  },
  combo: (c, t, d) => {
    arp(c, t, d, [523, 659, 784, 1047, 1319], { start: 0.08, step: 0.07, duration: 0.5, type: "triangle", gain: 0.07 });
    [784, 1047, 1319].forEach((freq) => bell(c, t, d, { freq, start: 0.45, duration: 0.7, gain: 0.04 }));
  },
  // Troll pre-game: "boing" trượt giọng + hai nốt tụt.
  troll: (c, t, d) => {
    tone(c, t, d, { freq: 260, to: 780, duration: 0.18, gain: 0.09 });
    tone(c, t, d, { freq: 494, start: 0.22, duration: 0.18, type: "triangle", gain: 0.07 });
    tone(c, t, d, { freq: 392, to: 330, start: 0.4, duration: 0.3, type: "triangle", gain: 0.07 });
  },
  "game-live": (c, t, d) =>
    arp(c, t, d, [392, 523, 659, 784, 1047], { start: 0.1, step: 0.08, duration: 0.45, type: "triangle", gain: 0.07 }),
};

// ─── Phát công thức ───

const wait = (ms) => new Promise((resolve) => window.setTimeout(resolve, ms));

function layerOutput(ctx, gain) {
  const node = ctx.createGain();
  node.gain.value = gain;
  node.connect(masterInput ?? ctx.destination);
  return node;
}

async function playRecipe(recipe, { waitMs = SAMPLE_WAIT_MS } = {}) {
  if (!recipe || !readPref()) return;
  // Lấy context NGAY trong lượt chạm (iOS chỉ cho mở âm thanh trong hành động của người dùng),
  // chờ tải mẫu sau.
  const ctx = getContext();
  if (!ctx) return;
  const keys = recipeSampleKeys(recipe);
  if (keys.some((key) => !sampleBuffers.has(key))) {
    await Promise.race([Promise.all(keys.map((key) => loadSample(ctx, key))), wait(waitMs)]);
    if (!readPref()) return; // vừa bấm tắt tiếng trong lúc chờ
  }
  try {
    const t0 = ctx.currentTime + 0.02;
    let samplesPlayed = 0;
    let synthPlayed = 0;
    for (const layer of recipe.layers) {
      if (isSynthLayer(layer.sound)) {
        const synth = SYNTHS[layer.sound.slice(SYNTH_PREFIX.length)];
        if (!synth) continue;
        synth(ctx, t0 + layer.at, layerOutput(ctx, layer.gain * SYNTH_LEVEL));
        synthPlayed += 1;
        continue;
      }
      const buffer = sampleBuffers.get(layer.sound);
      if (!buffer) continue;
      const source = ctx.createBufferSource();
      source.buffer = buffer;
      source.playbackRate.value = layer.rate;
      source.connect(layerOutput(ctx, layer.gain));
      source.start(t0 + layer.at);
      samplesPlayed += 1;
    }
    // Mẫu chính không tải kịp và công thức không có lớp synth: vẫn phải có tiếng phản hồi.
    if (keys.length > 0 && samplesPlayed === 0 && synthPlayed === 0) {
      SYNTHS["discovery-chime"](ctx, t0, layerOutput(ctx, SYNTH_LEVEL));
    }
  } catch {
    // Không phát được thì thôi — âm thanh chỉ là lớp phản hồi.
  }
}

export function playGameSound(name) {
  playRecipe(eventSoundRecipe(name), { waitMs: 400 });
}

// Mở khoá mô hình mới: tiếng riêng của mô hình/nhóm (NOTE-06 §7).
export function playUnlockSound(object, event) {
  playRecipe(soundRecipeFor(object, event));
}

// Gặp lại mô hình đã có: chỉ tiếng xác nhận ngắn, không phát lại tiếng mở khoá (NOTE-06 §7).
export function playSeenAgainSound() {
  playGameSound("seen-again");
}

export function unlockSoundDurationMs(object, event) {
  return Math.round(soundRecipeFor(object, event).duration * 1000);
}

// Lớp ăn mừng phía sau tiếng mở khoá (bộ ẩn / combo / mốc) — chờ tiếng mở khoá gần xong mới phát.
export function playCelebrationAfter(name, delayMs = 750) {
  if (!name) return;
  prefetchRecipe(eventSoundRecipe(name));
  window.setTimeout(() => playGameSound(name), delayMs);
}

// Trang admin nghe thử một công thức bất kỳ (NOTE-06 §11).
export function previewRecipe(recipe) {
  playRecipe(recipe, { waitMs: 1500 });
}
