"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { NavigationIcon } from "@/app/NavigationIcon";
import { useHeightVar } from "@/app/SiteHeader";
import { isNavItemActive } from "@/lib/shellRoutes";

// Thanh điều hướng đáy mobile (< 1024px) — DESIGN §6, SPEC-A2 §4.
// - 4 mục lõi thứ tự cố định, chia đều bề ngang (320px → 80px/mục), cả ô là vùng chạm ≥ 56px.
// - Mục đang mở: chữ đậm + gạch chân màu hành động + aria-current (không chỉ dựa vào màu).
// - Nhãn lấy từ cấu hình Admin; nhãn dài thì xuống dòng, không bao giờ cắt “…”.
// - Vùng an toàn iOS: đệm đáy/2 bên bằng env(safe-area-inset-*) (layout.js bật viewport-fit=cover).
// - Chiều cao thật ghi vào --cdp-bottom-nav-h → AppShell chừa khoảng trống cuối trang, và
//   scroll-padding-bottom để phần tử đang focus (Tab) không bị thanh che.
// - Ẩn khi bàn phím ảo bật (xem useVirtualKeyboardOpen).

const TEXT_INPUT_TYPES = new Set([
  "text", "search", "email", "tel", "url", "number", "password",
  "date", "time", "datetime-local", "month", "week",
]);

function isTextEntry(el) {
  if (!el || el === document.body) return false;
  if (el.isContentEditable) return true;
  if (el.tagName === "TEXTAREA") return !el.readOnly && !el.disabled;
  if (el.tagName === "INPUT") {
    return TEXT_INPUT_TYPES.has((el.getAttribute("type") || "text").toLowerCase()) && !el.readOnly && !el.disabled;
  }
  return false;
}

// Bàn phím ảo bật hay không. Không đoán bằng một ngưỡng chiều cao cửa sổ (dễ nhầm với thanh địa chỉ co giãn):
// 1. Chính: trên màn cảm ứng, ô gõ chữ đang được focus = bàn phím đang lên. Rời ô thì chờ ngắn rồi xét lại, để
//    chuyển từ ô này sang ô khác không làm thanh nhấp nháy.
// 2. Dự phòng: Android đóng bàn phím bằng nút Quay lại mà ô vẫn giữ focus. Nếu có visualViewport và khung nhìn
//    đã co lại rồi giãn về gần cỡ lúc chưa gõ → coi là bàn phím đã đóng; chạm lại ô (khung co lại) → bật lại.
//    Trình duyệt không có visualViewport thì chỉ dùng cách 1.
// 3. Đổi trang: xét lại theo phần tử đang focus thực tế (ô cũ có thể đã biến mất mà không phát sự kiện blur).
function useVirtualKeyboardOpen(pathname) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const coarse = window.matchMedia?.("(pointer: coarse)");
    const isTouch = () => Boolean(coarse?.matches);
    const vv = window.visualViewport;
    let restHeight = vv ? vv.height : 0; // cỡ khung nhìn lúc không gõ
    let shrunk = false; // đã thấy khung nhìn co lại trong lần gõ này
    let blurTimer = null;

    const typing = () => isTouch() && isTextEntry(document.activeElement);

    function onFocusIn(event) {
      if (!isTouch() || !isTextEntry(event.target)) return;
      clearTimeout(blurTimer);
      shrunk = false;
      setOpen(true);
    }
    function onFocusOut() {
      clearTimeout(blurTimer);
      blurTimer = setTimeout(() => {
        if (!typing()) {
          shrunk = false;
          setOpen(false);
        }
      }, 120);
    }
    function onViewportResize() {
      if (!vv) return;
      if (!typing()) {
        // Không gõ: cỡ hiện tại là mốc (kể cả sau khi xoay màn hình hay thanh địa chỉ co giãn).
        restHeight = vv.height;
        return;
      }
      if (vv.height < restHeight - 120) {
        shrunk = true;
        setOpen(true);
      } else if (shrunk && vv.height >= restHeight - 60) {
        setOpen(false);
      }
    }

    document.addEventListener("focusin", onFocusIn);
    document.addEventListener("focusout", onFocusOut);
    vv?.addEventListener("resize", onViewportResize);
    return () => {
      clearTimeout(blurTimer);
      document.removeEventListener("focusin", onFocusIn);
      document.removeEventListener("focusout", onFocusOut);
      vv?.removeEventListener("resize", onViewportResize);
    };
  }, []);

  useEffect(() => {
    const coarse = window.matchMedia?.("(pointer: coarse)");
    // eslint-disable-next-line react-hooks/set-state-in-effect -- đồng bộ với DOM sau khi đổi trang
    setOpen(Boolean(coarse?.matches) && isTextEntry(document.activeElement));
  }, [pathname]);

  return open;
}

export function BottomNav({ items, pathname }) {
  const navRef = useRef(null);
  useHeightVar(navRef, "--cdp-bottom-nav-h");
  const keyboardOpen = useVirtualKeyboardOpen(pathname);

  // Tab tới phần tử ở cuối màn hình: trình duyệt cuộn nó lên trên thanh thay vì để thanh che.
  useEffect(() => {
    const root = document.documentElement;
    root.style.scrollPaddingBottom = "var(--cdp-bottom-nav-h, 0px)";
    return () => {
      root.style.scrollPaddingBottom = "";
    };
  }, []);

  if (items.length === 0) return null;

  return (
    <nav
      ref={navRef}
      id="cdp-bottom-navigation"
      aria-label="Điều hướng chính"
      inert={keyboardOpen}
      data-keyboard-open={keyboardOpen ? "true" : undefined}
      style={{
        viewTransitionName: "cdp-bottom-nav",
        paddingBottom: "env(safe-area-inset-bottom)",
        paddingLeft: "env(safe-area-inset-left)",
        paddingRight: "env(safe-area-inset-right)",
      }}
      className={`fixed inset-x-0 bottom-0 z-30 border-t border-line bg-surface transition-transform duration-200 motion-reduce:transition-none lg:hidden ${
        keyboardOpen ? "pointer-events-none translate-y-full" : "translate-y-0"
      }`}
    >
      <ul className="flex">
        {items.map((item) => {
          const active = isNavItemActive(item.href, pathname);
          return (
            <li key={item.key} className="flex min-w-0 flex-1 basis-0">
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={`cdp-pressable flex min-h-14 w-full flex-col items-center justify-center gap-0.5 px-1 py-1.5 text-center ${
                  active ? "text-ink" : "text-ink-2"
                }`}
              >
                <span className={active ? "text-action" : ""}>
                  <NavigationIcon itemKey={item.key} />
                </span>
                <span
                  className={`break-words text-[0.8125rem] leading-tight ${
                    active
                      ? "font-bold underline decoration-action decoration-2 underline-offset-4"
                      : "font-medium"
                  }`}
                >
                  {item.navLabel}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
