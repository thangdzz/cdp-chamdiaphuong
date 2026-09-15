"use client";

// Âm thanh game (NOTE-04 §11, NOTE-05 §14–§18). Tổng hợp bằng Web Audio — không có file âm thanh
// để tải, không nhạc nền. Chỉ gọi SAU hành động chủ động của người chơi (trình duyệt cũng chặn phát
// trước khi có tương tác). Máy không phát được thì im lặng, game vẫn chạy đủ.
//
// Âm thanh mở khoá chọn theo `object.soundKey` → `object.soundFamily` → chuông mặc định. Không có
// tên mô hình nào ở đây; thêm mô hình mới chỉ cần khai khoá trong file mùa (NOTE-05 §22).

import { useSyncExternalStore } from "react";

const PREF_KEY = "cdp_game_sound";
const listeners = new Set();
let audioContext = null;
let noiseBuffer = null;

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
    audioContext ??= new AudioCtor();
    if (audioContext.state === "suspended") audioContext.resume().catch(() => {});
    return audioContext;
  } catch {
    return null;
  }
}

// ─── Khối dựng âm ───

function tone(ctx, { freq, to, start = 0, duration, type = "sine", gain = 0.1, attack = 0.01 }) {
  const osc = ctx.createOscillator();
  const amp = ctx.createGain();
  const t0 = ctx.currentTime + start;
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t0);
  if (to) osc.frequency.exponentialRampToValueAtTime(to, t0 + duration * 0.85);
  amp.gain.setValueAtTime(0.0001, t0);
  amp.gain.exponentialRampToValueAtTime(gain, t0 + attack);
  amp.gain.exponentialRampToValueAtTime(0.0001, t0 + duration);
  osc.connect(amp).connect(ctx.destination);
  osc.start(t0);
  osc.stop(t0 + duration + 0.02);
}

// Chuông: một nốt + bồi âm lệch (tiếng kim loại), tắt dần.
function bell(ctx, { freq, start = 0, duration = 0.7, gain = 0.08 }) {
  tone(ctx, { freq, start, duration, gain, attack: 0.004 });
  tone(ctx, { freq: freq * 2.76, start, duration: duration * 0.5, gain: gain * 0.35, attack: 0.004 });
  tone(ctx, { freq: freq * 5.4, start, duration: duration * 0.25, gain: gain * 0.15, attack: 0.002 });
}

function getNoise(ctx) {
  if (noiseBuffer && noiseBuffer.sampleRate === ctx.sampleRate) return noiseBuffer;
  noiseBuffer = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
  const data = noiseBuffer.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
  return noiseBuffer;
}

// Tiếng xì/whoosh/gầm: nhiễu trắng qua bộ lọc có thể quét tần số.
function noise(ctx, { start = 0, duration, filter = "bandpass", freq = 800, to, q = 1, gain = 0.08 }) {
  const src = ctx.createBufferSource();
  src.buffer = getNoise(ctx);
  const biquad = ctx.createBiquadFilter();
  const amp = ctx.createGain();
  const t0 = ctx.currentTime + start;
  biquad.type = filter;
  biquad.Q.value = q;
  biquad.frequency.setValueAtTime(freq, t0);
  if (to) biquad.frequency.exponentialRampToValueAtTime(to, t0 + duration);
  amp.gain.setValueAtTime(0.0001, t0);
  amp.gain.exponentialRampToValueAtTime(gain, t0 + duration * 0.2);
  amp.gain.exponentialRampToValueAtTime(0.0001, t0 + duration);
  src.connect(biquad).connect(amp).connect(ctx.destination);
  src.start(t0);
  src.stop(t0 + duration + 0.02);
}

const arp = (ctx, freqs, { start = 0, step = 0.08, duration = 0.4, type = "sine", gain = 0.08 } = {}) =>
  freqs.forEach((freq, i) => tone(ctx, { freq, start: start + i * step, duration, type, gain }));

// ─── Âm mở khoá theo khoá / nhóm (≤ ~1 giây) ───

const MODEL_SOUNDS = {
  // Animal
  rabbit: (ctx) => {
    tone(ctx, { freq: 700, to: 1400, duration: 0.09, gain: 0.1 });
    tone(ctx, { freq: 900, to: 1800, start: 0.11, duration: 0.09, gain: 0.09 });
  },
  elephant: (ctx) => {
    tone(ctx, { freq: 233, to: 349, duration: 0.18, type: "sawtooth", gain: 0.05 });
    tone(ctx, { freq: 349, to: 262, start: 0.16, duration: 0.24, type: "sawtooth", gain: 0.045 });
  },
  tiger: (ctx) => {
    noise(ctx, { duration: 0.32, freq: 260, to: 140, q: 3, gain: 0.14 });
    tone(ctx, { freq: 120, to: 70, duration: 0.3, type: "sawtooth", gain: 0.035 });
  },
  bird: (ctx) => {
    arp(ctx, [1568, 1976, 2349, 2637], { step: 0.05, duration: 0.22, type: "triangle", gain: 0.05 });
    noise(ctx, { duration: 0.3, filter: "highpass", freq: 3000, gain: 0.03 });
  },
  fish: (ctx) => {
    [0, 0.08, 0.16].forEach((start, i) => tone(ctx, { freq: 500 + i * 150, to: 1100 + i * 250, start, duration: 0.08, gain: 0.07 }));
    tone(ctx, { freq: 2093, start: 0.26, duration: 0.3, type: "triangle", gain: 0.035 });
  },
  turtle: (ctx) => bell(ctx, { freq: 587, duration: 0.8, gain: 0.08 }),
  dragon: (ctx) => {
    noise(ctx, { duration: 0.45, freq: 220, to: 1800, q: 1.2, gain: 0.06 });
    [196, 294, 392].forEach((freq) => bell(ctx, { freq, start: 0.2, duration: 0.8, gain: 0.05 }));
  },
  horse: (ctx) => {
    [0, 0.11, 0.26, 0.37].forEach((start, i) =>
      tone(ctx, { freq: i % 2 ? 620 : 820, start, duration: 0.05, type: "square", gain: 0.03, attack: 0.002 })
    );
  },
  insect: (ctx) => {
    [0, 0.05, 0.1, 0.25, 0.3, 0.35].forEach((start) =>
      tone(ctx, { freq: 4200, start, duration: 0.03, type: "triangle", gain: 0.03, attack: 0.002 })
    );
  },
  // History
  drum: (ctx) => {
    tone(ctx, { freq: 110, to: 48, duration: 0.3, gain: 0.25, attack: 0.003 });
    noise(ctx, { duration: 0.06, filter: "lowpass", freq: 900, gain: 0.08 });
    tone(ctx, { freq: 110, to: 48, start: 0.18, duration: 0.25, gain: 0.18, attack: 0.003 });
  },
  heroic: (ctx) => {
    tone(ctx, { freq: 392, duration: 0.14, type: "square", gain: 0.035 });
    [523, 659, 784].forEach((freq) => tone(ctx, { freq, start: 0.14, duration: 0.45, type: "triangle", gain: 0.05 }));
  },
  // Folklore
  magic: (ctx) => {
    arp(ctx, [1047, 1319, 1568, 2093, 2637], { step: 0.045, duration: 0.3, type: "triangle", gain: 0.045 });
    noise(ctx, { start: 0.05, duration: 0.4, filter: "highpass", freq: 5000, gain: 0.02 });
  },
  "wooden-chime": (ctx) => arp(ctx, [523, 659, 784, 1047], { step: 0.07, duration: 0.14, type: "triangle", gain: 0.08 }),
  // Technology
  "digital-blip": (ctx) => arp(ctx, [880, 1320, 1760, 2640], { step: 0.05, duration: 0.05, type: "square", gain: 0.03 }),
  "synth-sparkle": (ctx) => {
    tone(ctx, { freq: 330, to: 1320, duration: 0.3, type: "sawtooth", gain: 0.025 });
    arp(ctx, [1760, 2217, 2637], { start: 0.2, step: 0.06, duration: 0.25, type: "sine", gain: 0.045 });
  },
  // Traditional / cultural
  bell: (ctx) => bell(ctx, { freq: 880, duration: 0.9, gain: 0.07 }),
  "small-drum": (ctx) => {
    tone(ctx, { freq: 220, to: 120, duration: 0.14, gain: 0.18, attack: 0.002 });
    tone(ctx, { freq: 240, to: 130, start: 0.16, duration: 0.14, gain: 0.14, attack: 0.002 });
  },
  bamboo: (ctx) => arp(ctx, [587, 659, 784], { step: 0.09, duration: 0.09, type: "square", gain: 0.03 }),
  wood: (ctx) => arp(ctx, [784, 659, 784, 988], { step: 0.07, duration: 0.07, type: "square", gain: 0.028 }),
};

const FAMILY_DEFAULT = {
  animal: "rabbit",
  history: "drum",
  folklore: "magic",
  technology: "digital-blip",
  traditional: "bell",
};

// ─── Âm theo sự kiện ───

const EVENT_SOUNDS = {
  "tap-soft": (ctx) => tone(ctx, { freq: 740, duration: 0.09, type: "triangle", gain: 0.06 }),
  "discovery-chime": (ctx) => arp(ctx, [784, 988, 1319], { step: 0.09, duration: 0.42, gain: 0.1 }),
  // Hoàn thành một bộ nhỏ: 3 nốt thành công (NOTE-05 §17).
  "collection-complete": (ctx) => {
    arp(ctx, [523, 659, 784, 1047], { step: 0.08, duration: 0.5, gain: 0.09 });
    [1047, 1319].forEach((freq) => tone(ctx, { freq, start: 0.34, duration: 0.48, type: "triangle", gain: 0.05 }));
  },
  // Mở bộ sưu tập ẩn: lấp lánh đi lên như vừa phát hiện bí mật.
  "secret-reveal": (ctx) => {
    noise(ctx, { duration: 0.6, freq: 800, to: 6000, q: 2, gain: 0.03 });
    arp(ctx, [988, 1175, 1480, 1976], { step: 0.1, duration: 0.5, type: "triangle", gain: 0.06 });
  },
  // Combo: mạnh hơn hoàn thành thường.
  combo: (ctx) => {
    tone(ctx, { freq: 110, to: 55, duration: 0.3, gain: 0.2, attack: 0.003 });
    arp(ctx, [523, 659, 784, 1047, 1319], { start: 0.08, step: 0.07, duration: 0.5, type: "triangle", gain: 0.07 });
    [784, 1047, 1319].forEach((freq) => bell(ctx, { freq, start: 0.45, duration: 0.7, gain: 0.04 }));
  },
  // Mốc lớn: dài hơn một chút (~1,3 giây).
  milestone: (ctx) => {
    arp(ctx, [392, 523, 659, 784], { step: 0.09, duration: 0.35, type: "triangle", gain: 0.07 });
    [523, 659, 784, 1047].forEach((freq) => tone(ctx, { freq, start: 0.4, duration: 0.9, gain: 0.045 }));
    noise(ctx, { start: 0.4, duration: 0.8, filter: "highpass", freq: 6000, gain: 0.02 });
  },
  // Troll pre-game: "boing" trượt giọng + hai nốt tụt.
  troll: (ctx) => {
    tone(ctx, { freq: 260, to: 780, duration: 0.18, gain: 0.09 });
    tone(ctx, { freq: 494, start: 0.22, duration: 0.18, type: "triangle", gain: 0.07 });
    tone(ctx, { freq: 392, to: 330, start: 0.4, duration: 0.3, type: "triangle", gain: 0.07 });
  },
  // Game chuyển sang live khi trang đang mở.
  "game-live": (ctx) => {
    tone(ctx, { freq: 110, to: 60, duration: 0.25, gain: 0.18, attack: 0.003 });
    arp(ctx, [392, 523, 659, 784, 1047], { start: 0.1, step: 0.08, duration: 0.45, type: "triangle", gain: 0.07 });
  },
};

function play(fn) {
  if (!readPref() || !fn) return;
  const ctx = getContext();
  if (!ctx) return;
  try {
    fn(ctx);
  } catch {
    // Không phát được thì thôi — âm thanh chỉ là lớp phản hồi.
  }
}

export function playGameSound(name) {
  play(EVENT_SOUNDS[name] ?? MODEL_SOUNDS[name]);
}

export function unlockSoundKey(object) {
  if (object?.soundKey && MODEL_SOUNDS[object.soundKey]) return object.soundKey;
  return FAMILY_DEFAULT[object?.soundFamily] ?? null;
}

// Mở khoá mô hình mới: tiếng riêng của mô hình/nhóm + chuông nhỏ khép lại (NOTE-05 §16).
export function playUnlockSound(object) {
  const key = unlockSoundKey(object);
  if (!key) {
    playGameSound("discovery-chime");
    return;
  }
  play((ctx) => {
    MODEL_SOUNDS[key](ctx);
    arp(ctx, [1319, 1760], { start: 0.5, step: 0.08, duration: 0.35, gain: 0.05 });
  });
}

// Lớp ăn mừng phía sau tiếng mở khoá (bộ ẩn / combo / mốc) — chờ tiếng mở khoá xong mới phát.
export function playCelebrationAfter(name, delayMs = 750) {
  if (!name) return;
  window.setTimeout(() => playGameSound(name), delayMs);
}
