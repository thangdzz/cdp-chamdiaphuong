"use client";

import { useEffect, useRef } from "react";

// Bottom sheet dùng chung của game layer: trượt lên từ đáy, bấm nền hoặc Esc để đóng. Trên
// desktop thành hộp giữa màn hình để không kéo dài hết bề ngang.
export function BottomSheet({ open, onClose, title, children, labelledBy }) {
  const panelRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (event) => {
      if (event.key === "Escape") onClose?.();
    };
    window.addEventListener("keydown", onKey);
    panelRef.current?.focus({ preventScroll: true });
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center sm:items-center sm:p-6">
      <button
        type="button"
        aria-label="Đóng"
        onClick={onClose}
        className="cdp-game-sheet-backdrop absolute inset-0 cursor-default bg-zinc-950/40"
      />
      <div
        ref={panelRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelledBy}
        aria-label={labelledBy ? undefined : title}
        className="cdp-game-sheet relative flex max-h-[90dvh] w-full max-w-lg flex-col rounded-t-2xl bg-[#fffdf9] shadow-2xl outline-none sm:rounded-2xl"
      >
        <div className="flex shrink-0 justify-center pt-2.5 sm:hidden" aria-hidden="true">
          <span className="h-1 w-10 rounded-full bg-zinc-300" />
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-3">
          {children}
        </div>
      </div>
    </div>
  );
}
