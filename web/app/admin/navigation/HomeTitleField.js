"use client";

import { useEffect, useId, useRef, useState } from "react";
import { HOME_TITLE_MAX, validateHomeTitle } from "@/lib/homeTitle";

// Ô “Tiêu đề trang” của riêng mục Trang chủ (A4, SPEC-A4 §3.3). Các ô khác trong form giữ nguyên.
//
// - KHÔNG đặt `maxLength`: trình duyệt sẽ cắt im lặng câu dán vào. Chữ Admin gõ/dán luôn giữ nguyên.
// - Bộ đếm “n/60” đếm đúng như lúc lưu (NFC, bỏ khoảng trắng thừa) bằng chung một hàm với máy chủ.
// - Quá 60 (hoặc để trống): báo đỏ, đánh dấu ô không hợp lệ và khóa nút Lưu của form (nút có `data-navigation-save`).
//   Máy chủ vẫn kiểm lại (actions.js) cho trường hợp tắt JS.
export function HomeTitleField({ name, defaultValue, inputClassName }) {
  const [value, setValue] = useState(defaultValue ?? "");
  const inputRef = useRef(null);
  const counterId = useId();
  const messageId = useId();
  const result = validateHomeTitle(value);

  useEffect(() => {
    const input = inputRef.current;
    if (!input) return;
    input.setCustomValidity(result.message ?? "");
    const save = input.form?.querySelector("[data-navigation-save]");
    if (save) save.disabled = !result.ok;
  }, [result.ok, result.message]);

  return (
    <div className="block text-sm font-medium text-zinc-700">
      <label htmlFor={`${name}-input`}>Tiêu đề trang</label>
      <input
        ref={inputRef}
        id={`${name}-input`}
        name={name}
        value={value}
        onChange={(event) => setValue(event.target.value)}
        required
        aria-invalid={!result.ok}
        aria-describedby={`${counterId} ${messageId}`}
        className={`${inputClassName} ${result.ok ? "" : "border-red-600 focus:border-red-600 focus:ring-red-600/15"}`}
      />
      <p className="mt-1 flex flex-wrap items-baseline justify-between gap-x-3 text-[0.8125rem] font-normal">
        <span id={messageId} aria-live="polite" className={result.ok ? "text-zinc-500" : "font-medium text-red-700"}>
          {result.message ?? `Tiêu đề trang chủ tối đa ${HOME_TITLE_MAX} ký tự.`}
        </span>
        <span
          id={counterId}
          data-home-title-count
          className={`tabular-nums ${result.ok ? "text-zinc-500" : "font-medium text-red-700"}`}
        >
          {result.length}/{HOME_TITLE_MAX}
        </span>
      </p>
    </div>
  );
}
