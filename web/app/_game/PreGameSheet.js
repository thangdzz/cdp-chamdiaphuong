"use client";

import { useEffect } from "react";
import { BottomSheet } from "./BottomSheet";
import { playGameSound } from "./gameSound";
import { formatCountdownTo } from "@/lib/game/format";

// Đếm số lần "báo thử" trước giờ rước (NOTE-05 §3). Lưu trên máy người chơi (localStorage) chứ
// không ghi vào hồ sơ ẩn danh: trước giờ rước không được sinh dữ liệu server nào, kể cả tạo hồ sơ
// mới chỉ để đếm một câu đùa. Mất localStorage thì quay lại câu 1 — chấp nhận được.
const attemptsKey = (eventId) => `cdp_game_pregame_attempts:${eventId}`;

export function bumpPreGameAttempts(eventId) {
  try {
    const next = (Number(window.localStorage.getItem(attemptsKey(eventId))) || 0) + 1;
    window.localStorage.setItem(attemptsKey(eventId), String(next));
    return next;
  } catch {
    return 1;
  }
}

export function PreGameSheet({ open, onClose, event, attempt, now }) {
  const lines = event.copy.preGameTrolls ?? [];
  // Lần 1/2/3 → câu 1/2/3; từ lần 4 lặp câu cuối (NOTE-05 §2).
  const line = lines[Math.min(Math.max(attempt, 1), lines.length) - 1] ?? null;
  const countdown = formatCountdownTo(event.gameLiveAt, now);

  useEffect(() => {
    if (open) playGameSound("troll");
  }, [open]);

  if (!line) return null;

  return (
    <BottomSheet open={open} onClose={onClose} labelledBy="game-pregame-title">
      <div className="flex flex-col items-center pb-2 pt-4 text-center">
        <span className="cdp-game-wobble text-[72px] leading-none" aria-hidden="true">
          {line.emoji}
        </span>
        <h2 id="game-pregame-title" className="mt-4 max-w-xs text-xl font-medium leading-snug tracking-tight text-zinc-900">
          {line.text}
        </h2>
        <p className="mt-3 text-sm text-zinc-500">
          {event.copy.preGameBanner}
          {countdown ? ` · ${countdown}` : ""}
        </p>
        <p className="mt-1 text-[13px] text-zinc-400">Lượt báo thử này không được ghi lên bản đồ.</p>
        <button
          type="button"
          onClick={onClose}
          className="cdp-pressable mt-6 min-h-12 w-full cursor-pointer rounded-xl bg-[#c8553d] text-[15px] font-medium text-white"
        >
          {event.copy.preGameDismiss ?? "Được rồi, hẹn gặp lại"}
        </button>
      </div>
    </BottomSheet>
  );
}
