"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { fetchNextQuestion, submitQuestionAnswer, submitSkip } from "./answerActions";
import { loadLocalContributor, saveLocalContributor } from "./ContributionPanel";
import { QuestionOptions } from "./QuestionOptions";
import { adminFilledFields } from "@/lib/transport";

// Khối hỏi 1 câu tại 1 thời điểm (SPEC-chang-2.md §3.1). Giống CheckinButton.js: chưa có hồ
// sơ ẩn danh thì tự tạo im lặng ngay lúc bấm (không phải lúc chỉ xem câu hỏi).
// `hideQuestionId`: khối Mẹo phía trên đang bày sẵn đúng câu này rồi (xem NoteInput.js) —
// hỏi lại lần nữa ngay dưới cùng một thẻ thì nhìn như hỏng.
export function QuestionPrompt({ place, hideQuestionId = null }) {
  const [question, setQuestion] = useState(null);
  const [loaded, setLoaded] = useState(false);
  const [thanks, setThanks] = useState(null);
  const [busy, setBusy] = useState(false);
  const busyRef = useRef(false);

  // useMemo để mảng này giữ nguyên identity giữa các lần render — nếu tạo mới mỗi lần thì
  // effect bên dưới sẽ chạy lại liên tục.
  const filledFields = useMemo(() => adminFilledFields(place), [place]);

  useEffect(() => {
    const local = loadLocalContributor();
    fetchNextQuestion({
      anonId: local?.anonId,
      placeId: place.id,
      type: place.type,
      subtype: place.transportSubtype ?? null,
      filledFields,
    }).then((res) => {
      setQuestion(res.question);
      setLoaded(true);
    });
  }, [place.id, place.type, place.transportSubtype, filledFields]);

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
        subtype: place.transportSubtype ?? null,
        filledFields,
      });
      saveProfileIfNew(result.newProfile, local);
      // key={question.id} ở QuestionOptions lo việc xoá lựa chọn dở dang của câu vừa bỏ qua.
      setQuestion(result.nextQuestion ?? null);
    } finally {
      setBusy(false);
      busyRef.current = false;
    }
  }

  if (!loaded || (!question && !thanks)) return null;

  if (thanks) {
    return (
      <p className="cdp-fade-in border-t border-zinc-100 pt-5 text-[13px] text-zinc-500">
        ✓ Cảm ơn bạn{thanks.pointsAwarded ? " · +1 điểm" : " · +1 đang chờ xác nhận"}
      </p>
    );
  }

  if (question.id === hideQuestionId) return null;

  return (
    <div className="cdp-fade-in border-t border-zinc-100 pt-5">
      <QuestionOptions
        key={question.id}
        question={question}
        busy={busy}
        onAnswer={handleAnswer}
      >
        <button
          type="button"
          disabled={busy}
          onClick={handleSkip}
          className="mt-2 cursor-pointer text-xs text-zinc-400 underline disabled:cursor-default disabled:opacity-50"
        >
          Không rõ
        </button>
      </QuestionOptions>
    </div>
  );
}
