"use client";

import { useEffect, useRef, useState } from "react";
import { getPersonalNote, savePersonalNote, deletePersonalNote, PERSONAL_NOTE_MAX_LENGTH } from "@/lib/personalNotes";
import { ShareNoteBox } from "./ShareNoteBox";

const HINT_SEEN_KEY = "cdp_personal_notes_hint_seen";
const SAVE_DEBOUNCE_MS = 1000;
const SAVED_FLASH_MS = 2000;

// Ghi chú riêng (SPEC-chang-6.md) — CHỈ lưu trên máy khách, không gửi lên máy chủ, không lọc,
// không duyệt, không điểm thưởng. Đặt ở TRÊN CÙNG phần bung thẻ (§3.1), trước cả thông tin
// công khai — đây là thứ của riêng khách.
export function PersonalNote({ place }) {
  const [text, setText] = useState("");
  const [expanded, setExpanded] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [saveError, setSaveError] = useState(null);
  const [justSaved, setJustSaved] = useState(false);
  const [sharing, setSharing] = useState(false);
  const saveTimer = useRef(null);
  const savedFlashTimer = useRef(null);

  useEffect(() => {
    // Đọc localStorage đồng bộ nhưng bọc qua .then() để tránh setState ngay trong thân
    // effect (đúng cách đã dùng ở CheckinButton.js — tránh render dồn dập).
    Promise.resolve().then(() => {
      const existing = getPersonalNote(place.id);
      if (existing) {
        setText(existing.text);
        setExpanded(true);
      }
    });
    return () => {
      clearTimeout(saveTimer.current);
      clearTimeout(savedFlashTimer.current);
    };
  }, [place.id]);

  function openEditor() {
    setExpanded(true);
    try {
      if (!window.localStorage.getItem(HINT_SEEN_KEY)) {
        setShowHint(true);
        window.localStorage.setItem(HINT_SEEN_KEY, "1");
      }
    } catch {
      // Không đọc/ghi được cờ này thì thôi, không quan trọng bằng chính ghi chú.
    }
  }

  function flashSaved() {
    clearTimeout(savedFlashTimer.current);
    setJustSaved(true);
    savedFlashTimer.current = setTimeout(() => setJustSaved(false), SAVED_FLASH_MS);
  }

  // Tự lưu sau khi ngừng gõ ~1 giây, không có nút "Lưu" bắt buộc (SPEC §3.1) — nhưng vẫn có
  // lưu ngay khi rời khỏi ô (onBlur) hoặc bấm nút "Lưu" để khách yên tâm thấy xác nhận ngay.
  function handleChange(value) {
    setText(value);
    setSaveError(null);
    clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => doSave(value), SAVE_DEBOUNCE_MS);
  }

  function doSave(value) {
    const result = savePersonalNote(place.id, value);
    if (!result.ok) {
      setSaveError(result.error);
      return false;
    }
    flashSaved();
    return true;
  }

  function handleBlur() {
    clearTimeout(saveTimer.current);
    doSave(text);
  }

  function handleSaveClick() {
    clearTimeout(saveTimer.current);
    doSave(text);
  }

  function handleDelete() {
    clearTimeout(saveTimer.current);
    const result = deletePersonalNote(place.id);
    if (!result.ok) {
      setSaveError(result.error);
      return;
    }
    setText("");
    setExpanded(false);
    setSharing(false);
  }

  if (!expanded) {
    return (
      <button
        type="button"
        onClick={openEditor}
        className="block w-fit cursor-pointer text-left text-[13px] text-zinc-400 underline"
      >
        + Ghi chú riêng
      </button>
    );
  }

  return (
    <div>
      <p className="mb-1.5 text-sm font-medium text-zinc-700">Ghi chú riêng của bạn</p>
      <textarea
        value={text}
        maxLength={PERSONAL_NOTE_MAX_LENGTH}
        onChange={(e) => handleChange(e.target.value)}
        onBlur={handleBlur}
        placeholder="Chỉ mình bạn thấy, ghi gì cũng được..."
        rows={3}
        className="w-full rounded-lg border border-zinc-300 bg-white px-2 py-1.5 text-sm text-zinc-900"
      />
      {showHint && (
        <p className="mt-1 text-[13px] text-zinc-500">
          Không nên ghi thông tin nhạy cảm (mật khẩu, số tài khoản, giấy tờ).
        </p>
      )}
      {saveError && <p className="mt-1 text-[13px] text-red-600">{saveError}</p>}
      {justSaved && !saveError && (
        <p className="cdp-fade-in mt-1 text-[13px] text-emerald-700">✓ Đã lưu</p>
      )}
      <p className="mt-1.5 text-xs text-zinc-400">
        Chỉ mình bạn thấy · Chỉ lưu trên máy này — đổi máy hoặc xoá dữ liệu duyệt web sẽ mất.
      </p>
      <div className="mt-2 flex items-center gap-3">
        <button type="button" onClick={handleDelete} className="cursor-pointer text-[13px] text-red-600 underline">
          Xoá
        </button>
        <button
          type="button"
          onClick={() => setSharing((v) => !v)}
          className="cursor-pointer text-[13px] text-zinc-500 underline"
        >
          Đăng công khai
        </button>
        <button
          type="button"
          onClick={handleSaveClick}
          className="cdp-pressable ml-auto cursor-pointer rounded-lg px-3 py-1.5 text-[13px] font-medium text-zinc-600"
        >
          Lưu
        </button>
      </div>

      {sharing && <ShareNoteBox placeId={place.id} initialText={text} onCancel={() => setSharing(false)} />}
    </div>
  );
}
