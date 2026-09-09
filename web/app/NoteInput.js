"use client";

import { useRef, useState } from "react";
import { submitTip, reportNoteAction } from "./noteActions";
import { submitQuestionAnswer } from "./answerActions";
import { loadLocalContributor, saveLocalContributor } from "./ContributionPanel";
import { noteContextsForPlace, noteContextLabel } from "@/lib/notes";
import { getQuestionForContext } from "@/lib/questions";
import { adminFilledFields, contributionPrompt } from "@/lib/transport";
import { QuestionOptions } from "./QuestionOptions";

const NOTE_MAX_LENGTH = 120;

// Ghi chú công khai bằng chữ (SPEC-chang-5.md §4) — Chặng này chỉ làm "Mẹo tự do" (§2.1),
// "Nên gọi món gì" (§2.2) làm sau. Hiện danh sách mẹo đã duyệt (dạng thuộc tính, không phải
// bài đăng — không tên người viết/thời gian) + ô gõ mẹo mới, luôn phải qua duyệt (§7 quy tắc 1).
//
// Sửa 2026-09-09 theo NOTE-04 §3–§4: trước đây chọn "Gửi xe" xong là mở thẳng ô gõ, trong khi
// hệ thống ĐÃ CÓ câu hỏi "Gửi xe ở đâu?" với đúng các đáp án đó ở cuối thẻ — khách phải gõ tay
// lại thứ chỉ cần bấm. Giờ ngữ cảnh nào có câu hỏi thì đưa nút ra bấm luôn (1 chạm, vào đồng
// thuận ngay, không cần duyệt); ô gõ chỉ mở khi thật sự cần.
// `onActiveQuestion` báo cho thẻ cha biết khối này đang bày sẵn câu hỏi nào, để QuestionPrompt
// ở cuối thẻ đừng hỏi lại đúng câu đó — "Gửi xe" vừa là chip đầu tiên vừa là câu hỏi đầu tiên
// nên trùng nhau là chuyện thường, không phải hiếm.
export function NoteInput({ place, onActiveQuestion }) {
  const [notes, setNotes] = useState(place.notes ?? []);
  const [reportedIds, setReportedIds] = useState([]);
  const [text, setText] = useState("");
  const [festivalOnly, setFestivalOnly] = useState(false);
  const [context, setContext] = useState(null);
  // Khách bấm "Không có ý nào đúng" -> bỏ qua bộ nút, mở ô gõ (NOTE-04 §4 trường hợp C).
  const [typing, setTyping] = useState(false);
  const [answerThanks, setAnswerThanks] = useState(null);
  const [answerBusy, setAnswerBusy] = useState(false);
  const answerBusyRef = useRef(false);
  const [status, setStatus] = useState("idle"); // idle | busy | sent
  const [errorMessage, setErrorMessage] = useState(null);

  // Chip và câu mời đổi theo loại hình: hỏi một nhà xe ghép về "Gửi xe / Lối vào" là sai
  // ngữ cảnh, và gọi nó là "chỗ này" cũng sai — nó không phải một chỗ để đến (NOTE-05 §8–§9).
  const contexts = noteContextsForPlace(place);
  const filledFields = adminFilledFields(place);
  const contextQuestion = context
    ? getQuestionForContext(context, place.type, place.transportSubtype ?? null, filledFields)
    : null;

  function pickContext(id) {
    const next = context === id ? null : id;
    setContext(next);
    setTyping(false);
    setAnswerThanks(null);
    setErrorMessage(null);
    const question = next
      ? getQuestionForContext(next, place.type, place.transportSubtype ?? null, filledFields)
      : null;
    onActiveQuestion?.(question?.id ?? null);
  }

  function startTyping() {
    setTyping(true);
    onActiveQuestion?.(null); // đã chuyển sang gõ tay -> nhường câu đó lại cho cuối thẻ
  }

  async function handleQuestionAnswer(value, followUpText) {
    if (answerBusyRef.current || !contextQuestion) return;
    answerBusyRef.current = true;
    setAnswerBusy(true);
    try {
      const local = loadLocalContributor();
      const result = await submitQuestionAnswer({
        anonId: local?.anonId,
        placeId: place.id,
        questionId: contextQuestion.id,
        answer: value,
        text: followUpText ?? null,
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
        setErrorMessage(result.capped ? "Hôm nay bạn góp đủ rồi, mai quay lại nhé." : "Chưa gửi được, thử lại sau.");
        return;
      }
      setAnswerThanks({ pointsAwarded: result.pointsAwarded });
      setContext(null);
      onActiveQuestion?.(null);
    } finally {
      setAnswerBusy(false);
      answerBusyRef.current = false;
    }
  }

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
      context,
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
      setErrorMessage(result.error ?? "Chưa gửi được, thử lại sau.");
      setStatus("idle");
      return;
    }
    setStatus("sent");
    setText("");
    setFestivalOnly(false);
    setContext(null);
    setTyping(false);
    onActiveQuestion?.(null);
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
                {noteContextLabel(note.context) ? (
                  <span className="mr-1.5 font-medium text-zinc-900">
                    {noteContextLabel(note.context)}
                  </span>
                ) : (
                  <span className="mr-1">💡</span>
                )}
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
          <p className="text-[13px] text-zinc-500">{contributionPrompt(place)}</p>
          {/* NOTE-03 §1.B: chọn ngữ cảnh TRƯỚC — "chọn là mặc định, gõ là ngoại lệ". */}
          <div className="flex flex-wrap gap-1.5">
            {contexts.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => pickContext(c.id)}
                className={`cdp-pressable cursor-pointer rounded-full border px-2.5 py-1 text-xs ${
                  context === c.id
                    ? "border-zinc-400 bg-zinc-100 font-medium text-zinc-900"
                    : "border-zinc-200 text-zinc-500"
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>

          {answerThanks && (
            <p className="cdp-fade-in text-[13px] text-emerald-700">
              ✓ Cảm ơn bạn{answerThanks.pointsAwarded ? " · +1 điểm" : " · +1 đang chờ xác nhận"}
            </p>
          )}

          {/* Ngữ cảnh đã có sẵn câu hỏi bấm chọn -> bấm 1 phát là xong, vào đồng thuận ngay,
              KHÔNG qua duyệt (NOTE-04 §5). Chỉ "Di chuyển"/"Khác" và các ngữ cảnh chưa có câu
              hỏi mới rơi xuống ô gõ bên dưới. */}
          {contextQuestion && !typing && (
            <div className="cdp-fade-in mt-1">
              <QuestionOptions
                key={contextQuestion.id}
                question={contextQuestion}
                busy={answerBusy}
                onAnswer={handleQuestionAnswer}
              >
                <button
                  type="button"
                  onClick={startTyping}
                  className="mt-2 cursor-pointer text-xs text-zinc-400 underline"
                >
                  Không có ý nào đúng — để tôi tự viết
                </button>
              </QuestionOptions>
              {errorMessage && <p className="mt-1.5 text-xs text-red-600">{errorMessage}</p>}
            </div>
          )}

          {/* Ô gõ chỉ mở khi đã chọn ngữ cảnh mà ngữ cảnh đó không có nút nào hợp (NOTE-04 §4
              trường hợp C–D). Mẹo gõ tay vẫn phải qua admin duyệt như cũ. */}
          {context && (!contextQuestion || typing) && (
            <div className="cdp-fade-in flex flex-col gap-1.5">
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
      )}
    </div>
  );
}
