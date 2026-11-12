"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef } from "react";
import { useScrollLock } from "@/app/useScrollLock";
import { isNavItemActive, secondaryNavigation } from "@/lib/shellRoutes";
import { NavigationIcon } from "@/app/NavigationIcon";

// Tên thương hiệu dùng chung cho header mobile và sidebar desktop. Chỉ có MỘT chỗ được xuống dòng:
// “Chạm Địa / Phương” — tối đa 2 dòng, không bao giờ mỗi từ một dòng, không bao giờ “…”.
// Nội dung chữ vẫn là “Chạm Địa Phương” liền (trình đọc màn hình, tìm trong trang).
export function BrandName({ className = "" }) {
  return (
    <span className={`[text-wrap:balance] ${className}`}>
      <span className="whitespace-nowrap">Chạm Địa</span> <span className="whitespace-nowrap">Phương</span>
    </span>
  );
}

// Đo chiều cao thật của một phần tử khung và ghi vào biến CSS trên <html>. Dùng cho:
//   --cdp-header-h      hàng header (không tính Menu thả xuống) → hàng bám dính bên dưới (ô tìm ở /tim) bám đúng
//                       mép header kể cả khi tên xuống dòng hay khách phóng to chữ;
//   --cdp-bottom-nav-h  thanh đáy (gồm vùng an toàn iOS) → khoảng trống cuối trang để thanh không che nội dung.
// Phần tử ẩn (cao 0, ví dụ desktop) → bỏ biến, nơi dùng tự rơi về giá trị dự phòng.
const measureBox = (el) => el.getBoundingClientRect().height;

export function useHeightVar(ref, varName, measure = measureBox) {
  useEffect(() => {
    const el = ref.current;
    if (!el || typeof ResizeObserver === "undefined") return undefined;
    const root = document.documentElement;
    const update = () => {
      const height = measure(el);
      if (height > 0) root.style.setProperty(varName, `${Math.round(height * 100) / 100}px`);
      else root.style.removeProperty(varName);
    };
    const observer = new ResizeObserver(update);
    observer.observe(el);
    update();
    return () => {
      observer.disconnect();
      root.style.removeProperty(varName);
    };
  }, [ref, varName, measure]);
}

// Hàng header + viền dưới của <header> (viền nằm dưới Menu thả xuống nên không đo cả <header>).
function measureHeaderBar(bar) {
  const header = bar.parentElement;
  const border = header ? parseFloat(getComputedStyle(header).borderBottomWidth) || 0 : 0;
  const height = bar.getBoundingClientRect().height;
  return height > 0 ? height + border : 0;
}

// NOTE-10 §5: mobile không dùng sidebar fixed. Header gọn và menu này đọc đúng cùng config
// với desktop, nên Admin đổi nhãn/thứ tự/bật tắt ở một chỗ là cả hai bề mặt cùng thay đổi.
//
// A2-0 — tên “Chạm Địa Phương” KHÔNG BAO GIỜ bị cắt (quyết định chủ dự án 12/11; cấm truncate/ellipsis/
// line-clamp/“CDP”). Ba nấc, trình duyệt tự chọn, không thu nhỏ chữ hay logo:
//   1. đủ chỗ → logo · tên · Menu một hàng, tên một dòng (320px chữ thường: ~284/288px);
//   2. hơi chật → vẫn một hàng, tên xuống 2 dòng THEO TỪ;
//   3. rất chật (phóng chữ lớn) → nút Menu xuống hàng dưới, căn phải; tên vẫn đủ.
// Cơ chế: liên kết logo+tên có flex-basis 0 nên hàng chỉ xuống dòng khi bề rộng tối thiểu của nó (logo +
// cụm “Chạm Địa”) cộng nút Menu không vừa. Không dùng `overflow-wrap:anywhere` vì nó cho ngắt giữa từ.
export function SiteHeader({ navigation, pathname, open, onOpenChange }) {
  const barRef = useRef(null);
  const buttonRef = useRef(null);
  useHeightVar(barRef, "--cdp-header-h", measureHeaderBar);

  // Đóng bằng Esc hoặc chạm ra ngoài → trả focus về nút Menu (không để focus rơi về đầu trang).
  function closeAndRefocus() {
    onOpenChange(false);
    buttonRef.current?.focus();
  }

  return (
    <>
      {/* Lớp mờ dưới header khi Menu mở: chạm ra ngoài là đóng. Nằm ngoài <header> vì backdrop-blur của header
          làm phần tử fixed bên trong bị giới hạn trong header. z-35: trên thanh đáy (z-30), dưới header (z-40). */}
      {open && (
        <div aria-hidden="true" onClick={closeAndRefocus} className="fixed inset-0 z-[35] bg-ink/20 lg:hidden" />
      )}
      <header style={{ viewTransitionName: "cdp-site-header" }} className="sticky top-0 z-40 border-b border-line bg-page/95 backdrop-blur lg:hidden">
        <div ref={barRef} className="mx-auto flex min-h-[57px] w-full flex-wrap items-center gap-x-2 gap-y-1 px-4 py-2.5 sm:px-6">
          <Link href="/" onClick={() => onOpenChange(false)} className="flex flex-[1_1_0%] items-center gap-2">
            {/* alt rỗng: tên đã hiện ngay cạnh, trình đọc màn hình không đọc lặp “CDP Chạm Địa Phương”.
                `max-w-none`: ảnh có max-width % bị CSS coi là co được về 0 khi tính bề rộng tối thiểu → hàng không
                biết lúc nào phải cho nút Menu xuống dòng và tên tràn dưới nút (đo được ở 320px/150%, 390px/200%). */}
            <Image src="/cdp-logo.png" alt="" width={280} height={121} priority className="h-[26px] w-auto max-w-none shrink-0" />
            <BrandName className="text-sm font-bold leading-tight text-ink sm:text-base" />
          </Link>
          <button
            ref={buttonRef}
            type="button"
            onClick={() => onOpenChange(!open)}
            aria-expanded={open}
            aria-controls="cdp-mobile-navigation"
            aria-label={open ? "Đóng menu" : "Mở menu"}
            className="cdp-pressable ml-auto flex min-h-11 shrink-0 cursor-pointer items-center gap-2 rounded-lg bg-surface-2 px-2.5 text-sm font-medium text-ink-2"
          >
            <span>{open ? "Đóng" : "Menu"}</span>
            <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
              {open ? <path d="M6 6l12 12M18 6 6 18" /> : <path d="M5 7h14M5 12h14M5 17h14" />}
            </svg>
          </button>
        </div>

        {open && (
          <MobileMenu
            items={secondaryNavigation(navigation)}
            pathname={pathname}
            onNavigate={() => onOpenChange(false)}
            onEscape={closeAndRefocus}
          />
        )}
      </header>
    </>
  );
}

// Menu mobile (DESIGN §6): Ghi chú của tôi · Giới thiệu · Lễ hội (lưu trữ). 4 mục lõi nằm ở thanh đáy.
// Chỉ gắn khi đang mở: khóa cuộn trang nền (dùng chung bộ đếm với các lớp phủ khác) và nghe phím Esc.
// Tự đóng khi đổi trang: AppShell gắn trạng thái mở với đường dẫn đang xem.
function MobileMenu({ items, pathname, onNavigate, onEscape }) {
  useScrollLock();

  useEffect(() => {
    function onKeyDown(event) {
      if (event.key === "Escape") onEscape();
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [onEscape]);

  return (
    // Nổi ngay dưới header (absolute), không chiếm chỗ trong trang: mở/đóng Menu không đẩy nội dung và không làm
    // vị trí cuộn nhảy (Safari không tự bù như Chromium).
    <nav id="cdp-mobile-navigation" aria-label="Menu" className="absolute inset-x-0 top-full border-y border-line bg-surface px-4 py-3 shadow-lg sm:px-6">
      <ul className="mx-auto grid max-w-xl gap-1">
        {items.map((item) => {
          const active = isNavItemActive(item.href, pathname);
          return (
            <li key={item.key}>
              <Link
                href={item.href}
                onClick={onNavigate}
                aria-current={active ? "page" : undefined}
                className={`cdp-pressable flex min-h-11 items-center gap-3 rounded-lg px-3 py-2.5 text-sm ${
                  active ? "bg-action/10 font-medium text-action-hover" : "text-ink-2"
                }`}
              >
                <span className="shrink-0">
                  <NavigationIcon itemKey={item.key} />
                </span>
                {item.navLabel}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
