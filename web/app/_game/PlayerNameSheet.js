"use client";

import { useState } from "react";
import { BottomSheet } from "./BottomSheet";
import { saveDraftName, saveLocalNickname } from "./playerName";
import { loadLocalContributor } from "@/app/ContributionPanel";
import { changeDisplayName } from "@/app/contributionActions";
import { track } from "@/app/analytics";
import { DISPLAY_NAME_MAX, GENERATED_NAMES, generateDisplayName, validateDisplayName } from "@/lib/displayName";

/** Thẻ "tên săn đèn" đầu trang game (NOTE-08 §3–§4). Tên còn là tên máy sinh thì rủ đổi tên. */
export function PlayerNameCard({ name, onEdit }) {
  const generated = name ? GENERATED_NAMES.includes(name) : false;
  return (
    // Gọn 2–3 dòng: thẻ nằm trên bản đồ ở điện thoại, cao quá là đẩy bản đồ khỏi màn hình đầu.
    <section className="flex items-center gap-3 rounded-2xl bg-white px-4 py-2.5 shadow-sm">
      <div className="min-w-0 flex-1">
        <p className="text-[13px] text-zinc-500">🏮 Tên săn đèn của bạn</p>
        <p className="truncate text-[15px] font-medium text-zinc-900">{name ?? "…"}</p>
        {generated && <p className="truncate text-[13px] text-[#8a5a10]">Chưa đủ ngầu? Đổi cho oách xà lách 😎</p>}
      </div>
      <button
        type="button"
        onClick={onEdit}
        disabled={!name}
        className="cdp-pressable min-h-11 shrink-0 cursor-pointer rounded-lg px-3 text-sm font-medium text-[#c8553d] disabled:opacity-40"
      >
        Đổi tên
      </button>
    </section>
  );
}

/**
 * Bảng đổi tên. Chưa có hồ sơ → chỉ đổi tên nháp trên máy (không ghi server). Đã có hồ sơ → gửi server;
 * server kiểm tra lại đúng các luật như trình duyệt (lib/displayName.js).
 */
export function PlayerNameSheet({ open, onClose, currentName, avoidNames }) {
  const generated = currentName ? GENERATED_NAMES.includes(currentName) : false;
  const [value, setValue] = useState(currentName ?? "");
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);

  async function save(event) {
    event.preventDefault();
    if (busy) return;
    const checked = validateDisplayName(value, { avoidNames });
    if (!checked.ok) {
      setError(checked.error);
      return;
    }
    const anonId = loadLocalContributor()?.anonId;
    if (checked.name !== currentName) track("display_name_change");
    if (!anonId) {
      saveDraftName(checked.name);
      onClose();
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const result = await changeDisplayName({ anonId, nickname: checked.name });
      if (!result.ok) {
        setError(result.error);
        return;
      }
      saveLocalNickname(result.nickname);
      onClose();
    } catch {
      setError("Chưa đổi được tên. Kiểm tra mạng rồi thử lại.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <BottomSheet open={open} onClose={onClose} labelledBy="game-name-title">
      <form onSubmit={save} className="flex flex-col pb-2 pt-2">
        <h2 id="game-name-title" className="text-xl font-medium tracking-tight text-zinc-900">
          {generated ? "Tên này chưa đủ ngầu? Đổi tên cho oách xà lách 😎" : "Đặt một cái tên thật ngầu"}
        </h2>
        <p className="mt-1 text-sm leading-6 text-zinc-600">
          Tên này hiện khi bạn là người ghi nhận đầu tiên. Đổi lúc nào cũng được, lịch sử săn đèn vẫn giữ nguyên.
        </p>

        <label htmlFor="game-name-input" className="mt-4 text-[13px] text-zinc-500">
          Tên hiển thị
        </label>
        <div className="mt-1 flex gap-2">
          <input
            id="game-name-input"
            value={value}
            onChange={(e) => {
              setValue(e.target.value);
              setError(null);
            }}
            maxLength={DISPLAY_NAME_MAX + 5}
            autoComplete="off"
            enterKeyHint="done"
            className="min-h-12 min-w-0 flex-1 rounded-lg border border-zinc-300 bg-white px-3 text-[15px] text-zinc-900 outline-none focus:border-[#c8553d]"
          />
          <button
            type="button"
            onClick={() => {
              setValue(generateDisplayName({ avoidNames, exclude: value }));
              setError(null);
            }}
            className="cdp-pressable min-h-12 shrink-0 cursor-pointer rounded-lg bg-[#f7f0e6] px-3 text-sm font-medium text-zinc-700"
          >
            🎲 Tên khác
          </button>
        </div>
        <p className={`mt-1.5 text-[13px] ${error ? "text-[#b3432b]" : "text-zinc-500"}`} role={error ? "alert" : undefined}>
          {error ?? `3–${DISPLAY_NAME_MAX} ký tự. Không trùng tên mô hình, không giả làm Admin/CDP.`}
        </p>

        <button
          type="submit"
          disabled={busy}
          className="cdp-pressable mt-4 flex min-h-12 w-full cursor-pointer items-center justify-center rounded-xl bg-[#c8553d] text-[15px] font-medium text-white disabled:opacity-60"
        >
          {busy ? "Đang lưu…" : "Lưu tên"}
        </button>
      </form>
    </BottomSheet>
  );
}
