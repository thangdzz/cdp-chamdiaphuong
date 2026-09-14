"use client";

import { useCallback, useEffect, useRef } from "react";

// Bottom sheet dùng chung của game layer: trượt lên từ đáy; đóng bằng chạm nền, Esc, hoặc VUỐT
// XUỐNG (sheet đi theo tay, qua ngưỡng thì đóng, chưa qua thì bật về). Desktop thành hộp giữa
// màn hình, kéo bằng chuột ở thanh nắm.
//
// Kéo được viết bằng touch event gắn tay (passive:false) chứ không qua React state: mỗi frame
// chỉ đổi `transform` của panel => mượt trên Safari iOS, không render lại cây con (bản đồ chọn
// vị trí nằm bên trong sheet).

const CLOSE_DISTANCE_RATIO = 0.25; // kéo quá 1/4 chiều cao sheet…
const CLOSE_DISTANCE_MAX = 160; // …hoặc quá 160px thì đóng
const CLOSE_VELOCITY = 0.55; // px/ms — vuốt nhanh thì đóng dù kéo ngắn
const SNAP_MS = 260;
const EXIT_MS = 220;

// ─── Khoá cuộn trang phía sau ───
// `overflow:hidden` trên body KHÔNG chặn được Safari iOS cuộn/nảy trang phía sau. Ghim body bằng
// position:fixed + top âm rồi trả lại đúng vị trí cuộn khi đóng. Đếm số sheet đang mở để khi
// sheet này đóng và sheet khác mở ngay (báo xong → màn "Đã Chạm!") trang không bị nhảy.
let lockCount = 0;
let savedScrollY = 0;
let savedStyle = null;

function lockPageScroll() {
  lockCount += 1;
  if (lockCount > 1) return;
  const body = document.body;
  savedScrollY = window.scrollY;
  savedStyle = {
    position: body.style.position,
    top: body.style.top,
    left: body.style.left,
    right: body.style.right,
    width: body.style.width,
    overflow: body.style.overflow,
  };
  Object.assign(body.style, {
    position: "fixed",
    top: `-${savedScrollY}px`,
    left: "0",
    right: "0",
    width: "100%",
    overflow: "hidden",
  });
}

function unlockPageScroll() {
  lockCount = Math.max(0, lockCount - 1);
  if (lockCount > 0 || !savedStyle) return;
  Object.assign(document.body.style, savedStyle);
  savedStyle = null;
  window.scrollTo(0, savedScrollY);
}

function prefersReducedMotion() {
  return window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
}

export function BottomSheet({ open, onClose, title, children, labelledBy }) {
  const panelRef = useRef(null);
  const backdropRef = useRef(null);
  const scrollerRef = useRef(null);
  const closingRef = useRef(false);
  const onCloseRef = useRef(onClose);

  useEffect(() => {
    onCloseRef.current = onClose;
  });

  // Mọi kiểu đóng (nền, Esc, vuốt) đều trượt xuống rồi mới gỡ khỏi cây.
  const requestClose = useCallback((fromOffset = 0) => {
    const panel = panelRef.current;
    if (closingRef.current) return;
    closingRef.current = true;
    if (!panel || prefersReducedMotion()) {
      onCloseRef.current?.();
      return;
    }
    const height = panel.getBoundingClientRect().height;
    const remaining = Math.max(0.35, 1 - fromOffset / Math.max(height, 1));
    const duration = Math.round(EXIT_MS * remaining);
    panel.style.transition = `transform ${duration}ms cubic-bezier(0.4, 0, 1, 1)`;
    panel.style.transform = `translate3d(0, ${height + 24}px, 0)`;
    if (backdropRef.current) {
      backdropRef.current.style.transition = `opacity ${duration}ms ease-in`;
      backdropRef.current.style.opacity = "0";
    }
    window.setTimeout(() => onCloseRef.current?.(), duration);
  }, []);

  useEffect(() => {
    if (!open) return undefined;
    closingRef.current = false;
    lockPageScroll();
    const onKey = (event) => {
      if (event.key === "Escape") requestClose();
    };
    window.addEventListener("keydown", onKey);
    panelRef.current?.focus({ preventScroll: true });
    return () => {
      window.removeEventListener("keydown", onKey);
      unlockPageScroll();
    };
  }, [open, requestClose]);

  // ─── Kéo để đóng ───
  useEffect(() => {
    const panel = panelRef.current;
    if (!open || !panel) return undefined;

    let drag = null; // { startY, startX, lastY, lastT, velocity, active, fromHandle }

    const setOffset = (offset) => {
      panel.style.transform = `translate3d(0, ${offset}px, 0)`;
      if (backdropRef.current) {
        const height = panel.getBoundingClientRect().height || 1;
        backdropRef.current.style.opacity = String(Math.max(0, 1 - offset / height));
      }
    };

    const begin = (clientX, clientY, target) => {
      if (closingRef.current) return;
      // Kéo bên trong bản đồ là để di chuyển bản đồ, không phải đóng sheet.
      if (target.closest?.(".maplibregl-map, input, textarea, select")) return;
      drag = {
        startX: clientX,
        startY: clientY,
        lastY: clientY,
        lastT: performance.now(),
        velocity: 0,
        active: false,
        fromHandle: Boolean(target.closest?.("[data-sheet-handle]")),
      };
    };

    // Trả true nếu đang kéo sheet (để chặn cuộn mặc định).
    const move = (clientX, clientY) => {
      if (!drag) return false;
      const dy = clientY - drag.startY;
      const dx = clientX - drag.startX;
      if (!drag.active) {
        if (dy === 0 && dx === 0) return false;
        // Không có vùng chết: Safari iOS quyết định "cuộn hay không" ngay ở touchmove ĐẦU TIÊN —
        // bỏ lỡ lần đó thì preventDefault về sau không còn tác dụng, nội dung/trang sẽ nảy theo.
        const scrolledToTop = (scrollerRef.current?.scrollTop ?? 0) <= 0;
        // Chỉ nhận kéo XUỐNG theo chiều dọc, và chỉ khi nội dung đã ở đầu (hoặc nắm thanh kéo) —
        // còn lại nhường cho cuộn nội dung bên trong sheet.
        if (dy > 0 && Math.abs(dy) > Math.abs(dx) && (scrolledToTop || drag.fromHandle)) {
          drag.active = true;
          panel.style.transition = "none";
          if (backdropRef.current) backdropRef.current.style.transition = "none";
        } else {
          drag = null;
          return false;
        }
      }
      const now = performance.now();
      const offset = Math.max(0, clientY - drag.startY);
      const dt = Math.max(1, now - drag.lastT);
      drag.velocity = 0.8 * ((clientY - drag.lastY) / dt) + 0.2 * drag.velocity;
      drag.lastY = clientY;
      drag.lastT = now;
      setOffset(offset);
      return true;
    };

    const end = () => {
      if (!drag?.active) {
        drag = null;
        return;
      }
      const offset = Math.max(0, drag.lastY - drag.startY);
      // Dừng tay rồi mới thả thì không tính là "vuốt nhanh" nữa.
      const velocity = performance.now() - drag.lastT > 120 ? 0 : drag.velocity;
      const height = panel.getBoundingClientRect().height || 1;
      const threshold = Math.min(height * CLOSE_DISTANCE_RATIO, CLOSE_DISTANCE_MAX);
      const shouldClose = offset > threshold || (velocity > CLOSE_VELOCITY && offset > 24);
      drag = null;
      if (shouldClose) {
        requestClose(offset);
        return;
      }
      panel.style.transition = `transform ${SNAP_MS}ms cubic-bezier(0.22, 1, 0.36, 1)`;
      if (backdropRef.current) backdropRef.current.style.transition = `opacity ${SNAP_MS}ms ease-out`;
      setOffset(0);
    };

    const onTouchStart = (event) => {
      if (event.touches.length !== 1) {
        drag = null;
        return;
      }
      const touch = event.touches[0];
      begin(touch.clientX, touch.clientY, event.target);
    };
    const onTouchMove = (event) => {
      const touch = event.touches[0];
      if (touch && move(touch.clientX, touch.clientY) && event.cancelable) event.preventDefault();
    };

    // Chuột (desktop): chỉ kéo bằng thanh nắm.
    const onMouseMove = (event) => move(event.clientX, event.clientY);
    const onMouseUp = () => {
      end();
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };
    const onMouseDown = (event) => {
      if (event.button !== 0 || !event.target.closest?.("[data-sheet-handle]")) return;
      begin(event.clientX, event.clientY, event.target);
      window.addEventListener("mousemove", onMouseMove);
      window.addEventListener("mouseup", onMouseUp);
    };

    panel.addEventListener("touchstart", onTouchStart, { passive: true });
    panel.addEventListener("touchmove", onTouchMove, { passive: false });
    panel.addEventListener("touchend", end);
    panel.addEventListener("touchcancel", end);
    panel.addEventListener("mousedown", onMouseDown);
    return () => {
      panel.removeEventListener("touchstart", onTouchStart);
      panel.removeEventListener("touchmove", onTouchMove);
      panel.removeEventListener("touchend", end);
      panel.removeEventListener("touchcancel", end);
      panel.removeEventListener("mousedown", onMouseDown);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };
  }, [open, requestClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center sm:items-center sm:p-6">
      <div
        ref={backdropRef}
        aria-hidden="true"
        onClick={() => requestClose()}
        // touch-action:none + chặn touchmove: vuốt trên nền mờ không cuộn/nảy trang phía sau.
        onTouchMove={(event) => event.cancelable && event.preventDefault()}
        className="cdp-game-sheet-backdrop absolute inset-0 touch-none bg-zinc-950/40"
      />
      <div
        ref={panelRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelledBy}
        aria-label={labelledBy ? undefined : title}
        // Hiệu ứng mở là CSS animation; gỡ class khi chạy xong để transform do tay kéo không bị
        // animation fill-mode đè lên.
        onAnimationEnd={(event) => {
          if (event.target === panelRef.current) panelRef.current.classList.remove("cdp-game-sheet");
        }}
        className="cdp-game-sheet relative flex max-h-[90svh] w-full max-w-lg flex-col rounded-t-2xl bg-[#fffdf9] shadow-2xl outline-none will-change-transform sm:rounded-2xl"
      >
        <div
          data-sheet-handle
          className="flex shrink-0 cursor-grab touch-none justify-center pb-1.5 pt-2.5 active:cursor-grabbing"
          aria-hidden="true"
        >
          <span className="h-1 w-10 rounded-full bg-zinc-300" />
        </div>
        <button
          type="button"
          onClick={() => requestClose()}
          className="sr-only focus:not-sr-only focus:absolute focus:right-3 focus:top-3 focus:rounded-lg focus:bg-white focus:px-3 focus:py-1 focus:text-sm"
        >
          Đóng
        </button>
        <div
          ref={scrollerRef}
          className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-1.5"
        >
          {children}
        </div>
      </div>
    </div>
  );
}
