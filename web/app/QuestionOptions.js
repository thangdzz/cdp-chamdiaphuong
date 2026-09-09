"use client";

import { useState } from "react";

// Bộ nút đáp án của MỘT câu hỏi bấm chọn. Tách ra để dùng chung 2 chỗ:
//   - QuestionPrompt.js — hỏi tuần tự ở cuối thẻ (cách cũ, không đổi)
//   - NoteInput.js      — khi khách chọn ngữ cảnh mẹo mà ngữ cảnh đó đã có sẵn câu hỏi
//                         (NOTE-04 §4), để khách bấm 1 phát thay vì gõ lại thứ đã có nút
//
// Component này chỉ lo phần CHỌN và ô làm rõ; việc gửi lên máy chủ do nơi gọi quyết định qua
// `onAnswer(value, text)`. Nơi gọi nên đặt key={question.id} để đổi câu là xoá luôn lựa chọn
// dở dang, khỏi phải tự reset.
export function QuestionOptions({ question, busy, onAnswer, children }) {
  const [selected, setSelected] = useState([]);
  const [followUpText, setFollowUpText] = useState("");

  // Đáp án cần làm rõ (VD "Bãi gần, mất phí" -> "Bãi nào?") — NOTE-04 §4 trường hợp B: ô gõ
  // chỉ xuất hiện đúng lúc này, không mở sẵn từ đầu.
  const pendingFollowUp = !question.multi
    ? question.options.find((o) => o.value === selected[0] && o.followUp)
    : null;

  function handleOptionClick(opt) {
    if (busy) return;
    if (question.multi) {
      setSelected((prev) =>
        prev.includes(opt.value) ? prev.filter((v) => v !== opt.value) : [...prev, opt.value]
      );
      return;
    }
    if (opt.followUp) {
      setSelected([opt.value]);
      return;
    }
    onAnswer(opt.value);
  }

  if (pendingFollowUp) {
    return (
      <div className="cdp-fade-in">
        <p className="mb-2 text-sm text-zinc-700">{pendingFollowUp.followUp.label}</p>
        <div className="flex gap-2">
          <input
            className="flex-1 rounded-lg border border-zinc-300 px-2 py-1 text-sm text-zinc-900"
            maxLength={pendingFollowUp.followUp.maxLength}
            value={followUpText}
            onChange={(e) => setFollowUpText(e.target.value)}
          />
          <button
            type="button"
            disabled={busy}
            onClick={() => onAnswer(selected[0], followUpText.trim() || null)}
            className="cdp-pressable cursor-pointer rounded-lg bg-zinc-900 px-4 py-1.5 text-sm font-medium text-white disabled:cursor-default disabled:opacity-50"
          >
            Gửi
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <p className="mb-2 text-sm text-zinc-700">{question.text}</p>
      <div className="flex flex-wrap gap-2">
        {question.options.map((opt) => (
          <button
            key={opt.value}
            type="button"
            disabled={busy}
            onClick={() => handleOptionClick(opt)}
            className={`cdp-pressable min-h-11 cursor-pointer rounded-lg px-3 text-sm font-medium disabled:cursor-default disabled:opacity-50 ${
              question.multi && selected.includes(opt.value)
                ? "bg-zinc-900 text-white"
                : "bg-zinc-100 text-zinc-700"
            }`}
          >
            {opt.label}
          </button>
        ))}
        {question.multi && (
          <button
            type="button"
            disabled={busy || selected.length === 0}
            onClick={() => onAnswer(selected)}
            className="cdp-pressable min-h-11 cursor-pointer rounded-lg bg-zinc-900 px-4 text-sm font-medium text-white disabled:cursor-default disabled:opacity-50"
          >
            Xong
          </button>
        )}
      </div>
      {children}
    </div>
  );
}
