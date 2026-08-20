"use client";

import { useState } from "react";
import { submitTip } from "./noteActions";
import { loadLocalContributor, saveLocalContributor } from "./ContributionPanel";

const SHARE_MAX_LENGTH = 120;

// Ghi chú riêng cho phép nhiều dòng, Mẹo công khai chỉ 1 dòng — gộp xuống dòng thành " · "
// trước khi đưa vào ô rút gọn, tránh khách dán y nguyên rồi bị chặn "chỉ được viết 1 dòng"
// (lỗi thật phát hiện lúc anh tự test 2026-08-20).
function toSingleLine(text) {
  return (text ?? "").replace(/\r?\n+/g, " · ").trim();
}

// Dùng chung cho cả PersonalNote.js (nút trong thẻ) và PersonalNotesList.js (nút ở /ghi-chu)
// — "Đăng công khai" luôn đi qua ĐÚNG hàng chờ Mẹo tự do của Chặng 5, không có đường tắt.
export function ShareNoteBox({ placeId, initialText, onCancel }) {
  const [shareText, setShareText] = useState(toSingleLine(initialText).slice(0, SHARE_MAX_LENGTH));
  const [status, setStatus] = useState("idle"); // idle | busy | sent
  const [error, setError] = useState(null);

  async function handleSubmit() {
    if (status === "busy" || !shareText.trim()) return;
    setStatus("busy");
    setError(null);
    const local = loadLocalContributor();
    const result = await submitTip({
      anonId: local?.anonId,
      placeId,
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
      setError(result.error ?? "Chưa đăng được, thử lại nhé.");
      setStatus("idle");
      return;
    }
    setStatus("sent");
  }

  if (status === "sent") {
    return (
      <p className="mt-2 text-sm text-emerald-700">
        ✓ Cảm ơn bạn — mẹo sẽ hiện sau khi kiểm tra. +5 điểm đang chờ.
      </p>
    );
  }

  return (
    <div className="mt-2 rounded-lg border border-zinc-300 bg-white p-2">
      <p className="mb-1 text-xs text-zinc-500">Rút gọn còn tối đa {SHARE_MAX_LENGTH} ký tự trước khi đăng:</p>
      {/* input 1 dòng CỐ Ý, không phải textarea — Mẹo công khai chỉ nhận 1 dòng, input
          không cho gõ/dán Enter được nên chặn được tận gốc, không cần lọc lại sau (lỗi thật
          gặp khi chỉ lọc initialText mà chưa chặn lúc khách tự gõ thêm Enter). */}
      <input
        type="text"
        value={shareText}
        maxLength={SHARE_MAX_LENGTH}
        onChange={(e) => setShareText(e.target.value)}
        className="w-full rounded-lg border border-zinc-300 px-2 py-1.5 text-sm text-zinc-900"
      />
      <div className="mt-1 flex items-center justify-between">
        <span className="text-xs text-zinc-400">
          {shareText.length}/{SHARE_MAX_LENGTH}
        </span>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="cursor-pointer rounded-full border border-zinc-300 px-3 py-1 text-xs text-zinc-700"
          >
            Thôi
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={status === "busy" || !shareText.trim()}
            className="cursor-pointer rounded-full bg-zinc-900 px-3 py-1 text-xs font-medium text-white disabled:cursor-default disabled:opacity-40"
          >
            {status === "busy" ? "Đang đăng..." : "Đăng"}
          </button>
        </div>
      </div>
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}
