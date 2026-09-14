"use client";

// Âm thanh game (NOTE-04 §11): 3 tiếng rất ngắn, tổng hợp bằng Web Audio — không có file âm
// thanh để tải, không có nhạc nền. Chỉ gọi SAU hành động chủ động của người chơi (trình duyệt
// cũng chặn phát trước khi có tương tác). Máy không phát được thì im lặng, game vẫn chạy.

import { useSyncExternalStore } from "react";

const PREF_KEY = "cdp_game_sound";
const listeners = new Set();
let audioContext = null;

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

function tone(ctx, { freq, start, duration, type = "sine", gain = 0.12 }) {
  const osc = ctx.createOscillator();
  const amp = ctx.createGain();
  const t0 = ctx.currentTime + start;
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t0);
  amp.gain.setValueAtTime(0.0001, t0);
  amp.gain.exponentialRampToValueAtTime(gain, t0 + 0.012);
  amp.gain.exponentialRampToValueAtTime(0.0001, t0 + duration);
  osc.connect(amp).connect(ctx.destination);
  osc.start(t0);
  osc.stop(t0 + duration + 0.02);
}

const SOUNDS = {
  // ~100ms — bấm chọn trong bảng báo.
  "tap-soft": (ctx) => tone(ctx, { freq: 740, start: 0, duration: 0.09, type: "triangle", gain: 0.06 }),
  // ~600ms — vừa Chạm: ba nốt đi lên như chuông gió.
  "discovery-chime": (ctx) => {
    [784, 988, 1319].forEach((freq, i) =>
      tone(ctx, { freq, start: i * 0.09, duration: 0.42, gain: 0.1 })
    );
  },
  // ~800ms — milestone: người đầu tiên / đủ bộ sưu tập.
  "collection-complete": (ctx) => {
    [523, 659, 784, 1047].forEach((freq, i) =>
      tone(ctx, { freq, start: i * 0.08, duration: 0.5, gain: 0.09 })
    );
    [1047, 1319].forEach((freq) =>
      tone(ctx, { freq, start: 0.34, duration: 0.48, type: "triangle", gain: 0.05 })
    );
  },
};

export function playGameSound(name) {
  if (!readPref()) return;
  const ctx = getContext();
  if (!ctx || !SOUNDS[name]) return;
  try {
    SOUNDS[name](ctx);
  } catch {
    // Không phát được thì thôi — âm thanh chỉ là lớp trang trí.
  }
}
