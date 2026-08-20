"use client";

import { useEffect, useRef, useState } from "react";
import { getPersonalNote, savePersonalNote, deletePersonalNote, PERSONAL_NOTE_MAX_LENGTH } from "@/lib/personalNotes";
import { submitTip } from "./noteActions";
import { loadLocalContributor, saveLocalContributor } from "./ContributionPanel";

const SHARE_MAX_LENGTH = 120;
const HINT_SEEN_KEY = "cdp_personal_notes_hint_seen";
const SAVE_DEBOUNCE_MS = 1000;

// Ghi chú riêng (SPEC-chang-6.md) — CHỈ lưu trên máy khách, không gửi lên máy chủ, không lọc,
// không duyệt, không điểm thưởng. Đặt ở TRÊN CÙNG phần bung thẻ (§3.1), trước cả thông tin
// công khai — đây là thứ của riêng khách.
export function PersonalNote({ place }) {
  const [text, setText] = useState("");
  const [expanded, setExpanded] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [saveError, setSaveError] = useState(null);
  const [sharing, setSharing] = useState(false);
  const [shareText, setShareText] = useState("");
  const [shareStatus, setShareStatus] = useState("idle"); // idle | busy | sent
  const [shareError, setShareError] = useState(null);
  const saveTimer = useRef(null);

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
    return () => clearTimeout(saveTimer.current);
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

  // Tự lưu sau khi ngừng gõ ~1 giây, không có nút "Lưu" (SPEC §3.1).
  function handleChange(value) {
    setText(value);
    setSaveError(null);
    clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      const result = savePersonalNote(place.id, value);
      if (!result.ok) setSaveError(result.error);
    }, SAVE_DEBOUNCE_MS);
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

  function openShare() {
    setShareText(text.slice(0, SHARE_MAX_LENGTH));
    setSharing(true);
    setShareStatus("idle");
    setShareError(null);
  }

  // "Chia sẻ cho mọi người" — gửi qua ĐÚNG hàng chờ Mẹo tự do của Chặng 5 (đủ 5 lớp lọc +
  // admin duyệt + điểm), không có đường tắt. Ghi chú riêng giữ nguyên sau khi chia sẻ.
  async function handleShareSubmit() {
    if (shareStatus === "busy" || !shareText.trim()) return;
    setShareStatus("busy");
    setShareError(null);
    const local = loadLocalContributor();
    const result = await submitTip({
      anonId: local?.anonId,
      placeId: place.id,
      questionId: "tip",
      text: shareText,
      festivalOnly: false,
    });
    if (result.newProfile) {
      saveLocalContributor({
        anonId: result.newProfile.anonId,
        nickname: result.newProfile.nickname,
        recoveryCode: result.newProfile.recoveryCode,
        categoryId: local?.categoryId ?? null,
      });
    }
    if (!result.ok) {
      setShareError(result.error ?? "Chưa gửi được, thử lại nhé.");
      setShareStatus("idle");
      return;
    }
    setShareStatus("sent");
  }

  if (!expanded) {
    return (
      <button type="button" onClick={openEditor} className="mb-3 block text-left text-sm text-zinc-400 underline">
        + Ghi chú riêng
      </button>
    );
  }

  return (
    <div className="mb-3 rounded-xl border border-amber-200 bg-amber-50 p-3">
      <p className="mb-1.5 text-sm font-medium text-zinc-700">📝 Ghi chú riêng của bạn</p>
      <textarea
        value={text}
        maxLength={PERSONAL_NOTE_MAX_LENGTH}
        onChange={(e) => handleChange(e.target.value)}
        placeholder="Chỉ mình bạn thấy, ghi gì cũng được..."
        rows={3}
        className="w-full rounded-lg border border-zinc-300 bg-white px-2 py-1.5 text-sm text-zinc-900"
      />
      {showHint && (
        <p className="mt-1 text-xs text-amber-700">
          Không nên ghi thông tin nhạy cảm (mật khẩu, số tài khoản, giấy tờ).
        </p>
      )}
      {saveError && <p className="mt-1 text-xs text-red-600">{saveError}</p>}
      <p className="mt-1.5 text-xs text-zinc-500">
        Chỉ mình bạn thấy · Chỉ lưu trên máy này — đổi máy hoặc xoá dữ liệu duyệt web sẽ mất.
      </p>
      <div className="mt-2 flex gap-3">
        <button type="button" onClick={handleDelete} className="text-xs text-red-600 underline">
          Xoá
        </button>
        <button type="button" onClick={openShare} className="text-xs text-zinc-600 underline">
          Chia sẻ cho mọi người
        </button>
      </div>

      {sharing && (
        <div className="mt-2 rounded-lg border border-zinc-300 bg-white p-2">
          {shareStatus === "sent" ? (
            <p className="text-sm text-emerald-700">
              ✓ Cảm ơn bạn — mẹo sẽ hiện sau khi kiểm tra. +5 điểm đang chờ.
            </p>
          ) : (
            <>
              <p className="mb-1 text-xs text-zinc-500">Rút gọn còn tối đa {SHARE_MAX_LENGTH} ký tự trước khi gửi:</p>
              <textarea
                value={shareText}
                maxLength={SHARE_MAX_LENGTH}
                onChange={(e) => setShareText(e.target.value)}
                rows={2}
                className="w-full rounded-lg border border-zinc-300 px-2 py-1.5 text-sm text-zinc-900"
              />
              <div className="mt-1 flex items-center justify-between">
                <span className="text-xs text-zinc-400">
                  {shareText.length}/{SHARE_MAX_LENGTH}
                </span>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setSharing(false)}
                    className="rounded-full border border-zinc-300 px-3 py-1 text-xs text-zinc-700"
                  >
                    Thôi
                  </button>
                  <button
                    type="button"
                    onClick={handleShareSubmit}
                    disabled={shareStatus === "busy" || !shareText.trim()}
                    className="rounded-full bg-zinc-900 px-3 py-1 text-xs font-medium text-white disabled:opacity-40"
                  >
                    {shareStatus === "busy" ? "Đang gửi..." : "Gửi"}
                  </button>
                </div>
              </div>
              {shareError && <p className="mt-1 text-xs text-red-600">{shareError}</p>}
            </>
          )}
        </div>
      )}
    </div>
  );
}
