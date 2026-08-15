"use client";

import { useEffect, useRef, useState } from "react";
import { fetchNextQuestion, submitQuestionAnswer, submitSkip } from "./answerActions";
import { loadLocalContributor, saveLocalContributor } from "./ContributionPanel";

// Khối hỏi 1 câu tại 1 thời điểm (SPEC-chang-2.md §3.1). Giống CheckinButton.js: chưa có hồ
// sơ ẩn danh thì tự tạo im lặng ngay lúc bấm (không phải lúc chỉ xem câu hỏi).
export function QuestionPrompt({ place }) {
  const [question, setQuestion] = useState(null);
  const [loaded, setLoaded] = useState(false);
  const [selected, setSelected] = useState([]);
  const [followUpText, setFollowUpText] = useState("");
  const [thanks, setThanks] = useState(null);
  const [busy, setBusy] = useState(false);
  const busyRef = useRef(false);

  useEffect(() => {
    const local = loadLocalContributor();
    fetchNextQuestion({ anonId: local?.anonId, placeId: place.id, type: place.type }).then((res) => {
      setQuestion(res.question);
      setLoaded(true);
    });
  }, [place.id, place.type]);

  function saveProfileIfNew(newProfile, local) {
    if (!newProfile) return;
    saveLocalContributor({
      anonId: newProfile.anonId,
      nickname: newProfile.nickname,
      recoveryCode: newProfile.recoveryCode,
      categoryId: local?.categoryId ?? null,
    });
  }

  async function handleAnswer(value, textValue) {
    if (busyRef.current || !question) return;
    busyRef.current = true;
    setBusy(true);
    try {
      const local = loadLocalContributor();
      const result = await submitQuestionAnswer({
        anonId: local?.anonId,
        placeId: place.id,
        questionId: question.id,
        answer: value,
        text: textValue ?? null,
      });
      saveProfileIfNew(result.newProfile, local);
      if (result.ok) {
        setThanks({ pointsAwarded: result.pointsAwarded });
      }
    } finally {
      setBusy(false);
      busyRef.current = false;
    }
  }

  async function handleOptionClick(opt) {
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
    await handleAnswer(opt.value);
  }

  async function handleFollowUpSubmit() {
    if (selected.length === 0) return;
    await handleAnswer(selected[0], followUpText.trim() || null);
  }

  async function handleSkip() {
    if (busyRef.current || !question) return;
    busyRef.current = true;
    setBusy(true);
    try {
      const local = loadLocalContributor();
      const result = await submitSkip({
        anonId: local?.anonId,
        placeId: place.id,
        questionId: question.id,
        type: place.type,
      });
      saveProfileIfNew(result.newProfile, local);
      setQuestion(result.nextQuestion ?? null);
      setSelected([]);
      setFollowUpText("");
    } finally {
      setBusy(false);
      busyRef.current = false;
    }
  }

  if (!loaded || (!question && !thanks)) return null;

  if (thanks) {
    return (
      <p className="mt-2 text-sm text-zinc-500">
        ✓ Cảm ơn bạn{thanks.pointsAwarded ? " · +1 điểm" : " · +1 đang chờ xác nhận"}
      </p>
    );
  }

  const pendingFollowUp = !question.multi
    ? question.options.find((o) => o.value === selected[0] && o.followUp)
    : null;

  if (pendingFollowUp) {
    return (
      <div className="mt-2 rounded-xl border border-zinc-200 bg-zinc-50 p-3">
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
            onClick={handleFollowUpSubmit}
            className="rounded-full bg-zinc-900 px-4 py-1.5 text-sm font-medium text-white disabled:opacity-50"
          >
            Gửi
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-2 rounded-xl border border-zinc-200 bg-zinc-50 p-3">
      <p className="mb-2 text-sm text-zinc-700">{question.text}</p>
      <div className="flex flex-wrap gap-2">
        {question.options.map((opt) => (
          <button
            key={opt.value}
            type="button"
            disabled={busy}
            onClick={() => handleOptionClick(opt)}
            className={`rounded-full border px-3 py-1.5 text-sm font-medium disabled:opacity-50 ${
              question.multi && selected.includes(opt.value)
                ? "border-zinc-900 bg-zinc-900 text-white"
                : "border-zinc-300 bg-white text-zinc-700"
            }`}
          >
            {opt.label}
          </button>
        ))}
        {question.multi && (
          <button
            type="button"
            disabled={busy || selected.length === 0}
            onClick={() => handleAnswer(selected)}
            className="rounded-full bg-zinc-900 px-4 py-1.5 text-sm font-medium text-white disabled:opacity-50"
          >
            Xong
          </button>
        )}
      </div>
      <button
        type="button"
        disabled={busy}
        onClick={handleSkip}
        className="mt-2 text-xs text-zinc-400 underline disabled:opacity-50"
      >
        Không rõ
      </button>
    </div>
  );
}
