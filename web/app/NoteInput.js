"use client";

import { useState } from "react";
import { submitTip, reportNoteAction } from "./noteActions";
import { loadLocalContributor, saveLocalContributor } from "./ContributionPanel";

const NOTE_MAX_LENGTH = 120;

// Ghi chú công khai bằng chữ (SPEC-chang-5.md §4) — Chặng này chỉ làm "Mẹo tự do" (§2.1),
// "Nên gọi món gì" (§2.2) làm sau. Hiện danh sách mẹo đã duyệt (dạng thuộc tính, không phải
// bài đăng — không tên người viết/thời gian) + ô gõ mẹo mới, luôn phải qua duyệt (§7 quy tắc 1).
export function NoteInput({ place }) {
  const [notes, setNotes] = useState(place.notes ?? []);
  const [reportedIds, setReportedIds] = useState([]);
  const [text, setText] = useState("");
  const [festivalOnly, setFestivalOnly] = useState(false);
  const [status, setStatus] = useState("idle"); // idle | busy | sent
  const [errorMessage, setErrorMessage] = useState(null);

  async function handleReport(noteId) {
    if (reportedIds.includes(noteId)) return;
    setReportedIds((ids) => [...ids, noteId]);
    const result = await reportNoteAction({ placeId: place.id, noteId });
    if (result.hidden) {
      setNotes((list) => list.filter((n) => n.id !== noteId));
    }
  }

  async function handleSubmit() {
    if (status === "busy" || !text.trim()) return;
    setStatus("busy");
    setErrorMessage(null);
    const local = loadLocalContributor();
    const result = await submitTip({
      anonId: local?.anonId,
      placeId: place.id,
      questionId: "tip",
      text,
      festivalOnly,
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
      setErrorMessage(result.error ?? "Chưa gửi được, thử lại nhé.");
      setStatus("idle");
      return;
    }
    setStatus("sent");
    setText("");
    setFestivalOnly(false);
  }

  // Tối đa 3 mẹo hiện trên thẻ — nhiều hơn dễ rối, thẻ không phải nơi đọc hết mọi mẹo
  // (SPEC-giao-dien.md §6). Không xoá dữ liệu, chỉ giới hạn hiển thị.
  const visibleNotes = notes.slice(0, 3);

  return (
    <div className="flex flex-col gap-3">
      {visibleNotes.length > 0 && (
        <div className="flex flex-col gap-2 text-sm text-zinc-700">
          {visibleNotes.map((note) => (
            <div key={note.id} className="flex items-start justify-between gap-2">
              <p>
                <span className="mr-1">💡</span>
                {note.text}
              </p>
              <button
                type="button"
                onClick={() => handleReport(note.id)}
                disabled={reportedIds.includes(note.id)}
                className="shrink-0 text-xs text-zinc-300 underline disabled:no-underline disabled:text-zinc-200"
              >
                {reportedIds.includes(note.id) ? "Đã báo" : "Báo sai"}
              </button>
            </div>
          ))}
        </div>
      )}

      {status === "sent" ? (
        <p className="cdp-fade-in text-[13px] text-emerald-700">
          ✓ Cảm ơn bạn — ghi chú sẽ hiện sau khi kiểm tra. +5 điểm đang chờ.
        </p>
      ) : (
        <div className="flex flex-col gap-1.5">
          <p className="text-[13px] text-zinc-500">Bạn có mẹo gì cho chỗ này không?</p>
          <textarea
            value={text}
            maxLength={NOTE_MAX_LENGTH}
            onChange={(e) => setText(e.target.value)}
            placeholder="VD: Gửi xe ở ngõ cạnh số 12"
            rows={2}
            className="w-full rounded-lg border border-zinc-300 px-2 py-1.5 text-sm text-zinc-900"
          />
          <div className="flex items-center justify-between gap-2">
            <label className="flex items-center gap-1.5 text-xs text-zinc-500">
              <input
                type="checkbox"
                checked={festivalOnly}
                onChange={(e) => setFestivalOnly(e.target.checked)}
              />
              Chỉ đúng dịp lễ hội
            </label>
            <span className="text-xs text-zinc-400">
              {text.length}/{NOTE_MAX_LENGTH}
            </span>
          </div>
          {errorMessage && <p className="text-xs text-red-600">{errorMessage}</p>}
          <button
            type="button"
            onClick={handleSubmit}
            disabled={status === "busy" || !text.trim()}
            className="cdp-pressable self-end rounded-lg bg-zinc-900 px-4 py-1.5 text-xs font-medium text-white disabled:opacity-40"
          >
            {status === "busy" ? "Đang gửi..." : "Gửi"}
          </button>
        </div>
      )}
    </div>
  );
}
