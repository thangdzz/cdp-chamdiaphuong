"use client";

import { useState } from "react";
import { playGameSound, playUnlockSound, unlockSoundKey } from "@/app/_game/gameSound";

// Nghe thử âm thanh cho admin/chủ dự án — người chơi chỉ nghe khi mở khoá thật (NOTE-05 §19).
const EVENT_SOUNDS = [
  { key: "troll", label: "Câu đùa pre-game" },
  { key: "secret-reveal", label: "Mở bộ sưu tập ẩn" },
  { key: "collection-complete", label: "Hoàn thành bộ / người đầu tiên" },
  { key: "combo", label: "Combo hoàn thành" },
  { key: "milestone", label: "Đạt mốc (5/10/20/30/trọn bộ)" },
  { key: "game-live", label: "Game chuyển sang live" },
  { key: "discovery-chime", label: "Mở khoá mô hình không có âm riêng" },
];

export function SoundPreviewList({ models }) {
  const [playing, setPlaying] = useState(null);

  function play(id, fn) {
    fn();
    setPlaying(id);
    window.setTimeout(() => setPlaying((current) => (current === id ? null : current)), 1200);
  }

  const buttonClass = (id) =>
    `flex min-h-11 w-full cursor-pointer items-center gap-2 rounded-lg px-3 text-left text-sm ${
      playing === id ? "bg-[#fbf0d9] text-[#8a5a10]" : "bg-zinc-50 text-zinc-800 hover:bg-zinc-100"
    }`;

  return (
    <div className="mt-3 flex flex-col gap-4">
      <div>
        <h3 className="text-sm font-medium text-zinc-700">Âm sự kiện</h3>
        <ul className="mt-2 grid gap-1.5 sm:grid-cols-2">
          {EVENT_SOUNDS.map((sound) => (
            <li key={sound.key}>
              <button type="button" className={buttonClass(sound.key)} onClick={() => play(sound.key, () => playGameSound(sound.key))}>
                <span aria-hidden="true">{playing === sound.key ? "🔊" : "▶"}</span>
                {sound.label}
              </button>
            </li>
          ))}
        </ul>
      </div>
      <div>
        <h3 className="text-sm font-medium text-zinc-700">Âm mở khoá từng mô hình</h3>
        <ul className="mt-2 grid gap-1.5 sm:grid-cols-2">
          {models.map((model) => (
            <li key={model.id}>
              <button type="button" className={buttonClass(model.id)} onClick={() => play(model.id, () => playUnlockSound(model))}>
                <span aria-hidden="true">{playing === model.id ? "🔊" : "▶"}</span>
                <span aria-hidden="true">{model.glyph}</span>
                <span className="min-w-0 flex-1 truncate">{model.name}</span>
                <span className="shrink-0 text-xs text-zinc-400">{unlockSoundKey(model) ?? "chuông"}</span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
