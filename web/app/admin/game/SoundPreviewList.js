"use client";

import { useEffect, useRef, useState } from "react";
import { playGameSound, previewRecipe } from "@/app/_game/gameSound";

// Duyệt nhanh sound identity của cả 45 slot trước deploy (NOTE-06 §11). Công thức đã được server
// tính sẵn (lib/game/sounds.js) — ở đây chỉ phát và hiện thời lượng.

const SOURCE_NOTE = {
  model: null,
  family: "đang dùng tiếng mặc định của nhóm",
  default: "chưa có tiếng — chuông mặc định",
};

function seconds(value) {
  return `${value.toLocaleString("vi-VN", { maximumFractionDigits: 1 })} s`;
}

function BadgeGlyph({ html }) {
  return <span className="inline-flex shrink-0" aria-hidden="true" dangerouslySetInnerHTML={{ __html: html }} />;
}

export function SoundPreviewList({ models, eventSounds, compareGroups = [] }) {
  const [playing, setPlaying] = useState(null);
  const [queue, setQueue] = useState(null); // index đang phát khi "Nghe lần lượt"
  const timers = useRef([]);

  useEffect(() => () => timers.current.forEach((timer) => window.clearTimeout(timer)), []);

  function mark(id, durationMs) {
    setPlaying(id);
    timers.current.push(
      window.setTimeout(() => setPlaying((current) => (current === id ? null : current)), durationMs)
    );
  }

  function play(item) {
    previewRecipe(item.recipe);
    mark(item.id, item.recipe.duration * 1000 + 200);
  }

  function stopQueue() {
    timers.current.forEach((timer) => window.clearTimeout(timer));
    timers.current = [];
    setQueue(null);
    setPlaying(null);
  }

  // Phát lần lượt, cách nhau nửa giây — nghe một mạch để so độ to/độ dữ giữa các con.
  function playAll(list = models, from = 0, queueId = "all") {
    if (from >= list.length) {
      stopQueue();
      return;
    }
    const item = list[from];
    setQueue({ id: queueId, index: from, total: list.length });
    play(item);
    timers.current.push(window.setTimeout(() => playAll(list, from + 1, queueId), item.recipe.duration * 1000 + 600));
  }

  const rowClass = (id) =>
    `flex min-h-12 w-full min-w-0 items-center gap-2 rounded-lg px-3 py-1.5 text-left text-sm ${
      playing === id ? "bg-[#fbf0d9] text-[#8a5a10]" : "bg-zinc-50 text-zinc-800"
    }`;
  const playButton =
    "flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-full bg-white text-sm shadow-sm hover:bg-zinc-100";

  return (
    <div className="mt-3 flex flex-col gap-5">
      <div>
        <h3 className="text-sm font-medium text-zinc-700">Âm sự kiện</h3>
        <ul className="mt-2 grid grid-cols-1 gap-1.5 sm:grid-cols-2">
          {eventSounds.map((sound) => (
            <li key={sound.id} className={rowClass(sound.id)}>
              <button type="button" aria-label={`Nghe ${sound.label}`} className={playButton} onClick={() => play(sound)}>
                {playing === sound.id ? "🔊" : "▶"}
              </button>
              <span className="min-w-0 flex-1">{sound.label}</span>
              <span className="shrink-0 text-xs text-zinc-400">{seconds(sound.recipe.duration)}</span>
            </li>
          ))}
        </ul>
      </div>

      {compareGroups.length > 0 && (
        <div>
          <h3 className="text-sm font-medium text-zinc-700">Nghe so sánh cùng họ (NOTE-07)</h3>
          <ul className="mt-2 flex flex-col gap-2">
            {compareGroups.map((group, groupIndex) => {
              const queueId = `group-${groupIndex}`;
              return (
                <li key={queueId} className="rounded-lg bg-zinc-50 p-2">
                  <div className="flex flex-wrap items-center justify-between gap-2 px-1">
                    <span className="text-sm text-zinc-700">{group.label}</span>
                    <button
                      type="button"
                      onClick={() => {
                        stopQueue();
                        if (queue?.id !== queueId) playAll(group.items, 0, queueId);
                      }}
                      className="min-h-10 cursor-pointer rounded-lg bg-zinc-900 px-3 text-sm font-medium text-white"
                    >
                      {queue?.id === queueId ? `■ Dừng (${queue.index + 1}/${queue.total})` : "▶ Nghe cả nhóm"}
                    </button>
                  </div>
                  <div className="mt-1.5 flex flex-wrap gap-1.5">
                    {group.items.map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => play(item)}
                        className={`flex min-h-11 cursor-pointer items-center gap-2 rounded-lg px-2.5 text-left text-sm ${
                          playing === item.id ? "bg-[#fbf0d9] text-[#8a5a10]" : "bg-white text-zinc-800 shadow-sm"
                        }`}
                      >
                        <BadgeGlyph html={item.badge} />
                        <span>
                          {item.name}
                          <span className="block text-xs text-zinc-400">{seconds(item.recipe.duration)}</span>
                        </span>
                      </button>
                    ))}
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      <div>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 className="text-sm font-medium text-zinc-700">Âm mở khoá từng mô hình ({models.length})</h3>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => playGameSound("seen-again")}
              className="min-h-10 cursor-pointer rounded-lg border border-zinc-300 bg-white px-3 text-sm text-zinc-700"
            >
              ▶ Tiếng gặp lại
            </button>
            {queue?.id !== "all" ? (
              <button
                type="button"
                onClick={() => {
                  stopQueue();
                  playAll(models, 0, "all");
                }}
                className="min-h-10 cursor-pointer rounded-lg bg-zinc-900 px-3 text-sm font-medium text-white"
              >
                ▶ Nghe lần lượt
              </button>
            ) : (
              <button
                type="button"
                onClick={stopQueue}
                className="min-h-10 cursor-pointer rounded-lg bg-[#c8553d] px-3 text-sm font-medium text-white"
              >
                ■ Dừng ({queue.index + 1}/{queue.total})
              </button>
            )}
          </div>
        </div>
        <ul className="mt-2 grid grid-cols-1 gap-1.5 lg:grid-cols-2">
          {models.map((model) => (
            <li key={model.id} className={rowClass(model.id)}>
              <button type="button" aria-label={`Nghe ${model.name}`} className={playButton} onClick={() => play(model)}>
                {playing === model.id ? "🔊" : "▶"}
              </button>
              <BadgeGlyph html={model.badge} />
              <span className="min-w-0 flex-1">
                <span className="block truncate">{model.name}</span>
                <span className="block truncate text-xs text-zinc-500">
                  {model.soundFamily ?? "—"} · {model.recipe.label}
                  {SOURCE_NOTE[model.recipe.source] ? (
                    <span className="text-[#b4541f]"> · {SOURCE_NOTE[model.recipe.source]}</span>
                  ) : null}
                </span>
              </span>
              <span className="shrink-0 text-xs text-zinc-400">{seconds(model.recipe.duration)}</span>
              <a href={`#object-${model.id}`} className="shrink-0 text-xs text-zinc-500 underline">
                Sửa
              </a>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
