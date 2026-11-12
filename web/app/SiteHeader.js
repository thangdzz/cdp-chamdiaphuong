"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef } from "react";
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

function isActive(item, pathname) {
  if (item.href === "/") return pathname === "/";
  return pathname === item.href || pathname.startsWith(`${item.href}/`);
}

// Chiều cao thật của hàng header (không tính Menu thả xuống), ghi vào biến CSS dùng chung để hàng bám
// dính bên dưới (ô tìm ở /tim) bám đúng mép header kể cả khi tên xuống dòng hay khách phóng to chữ.
function useHeaderHeightVar(barRef) {
  useEffect(() => {
    const bar = barRef.current;
    if (!bar || typeof ResizeObserver === "undefined") return undefined;
    const root = document.documentElement;
    const update = () => {
      const header = bar.parentElement;
      const border = header ? parseFloat(getComputedStyle(header).borderBottomWidth) || 0 : 0;
      const height = bar.getBoundingClientRect().height;
      // Desktop: header ẩn (cao 0) → bỏ biến, các hàng bám dính dùng giá trị lg riêng.
      if (height > 0) root.style.setProperty("--cdp-header-h", `${Math.round((height + border) * 100) / 100}px`);
      else root.style.removeProperty("--cdp-header-h");
    };
    const observer = new ResizeObserver(update);
    observer.observe(bar);
    update();
    return () => {
      observer.disconnect();
      root.style.removeProperty("--cdp-header-h");
    };
  }, [barRef]);
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
  const visibleItems = navigation.filter((item) => item.enabled);
  const barRef = useRef(null);
  useHeaderHeightVar(barRef);

  return (
    <header style={{ viewTransitionName: "cdp-site-header" }} className="sticky top-0 z-40 border-b border-zinc-200 bg-zinc-50/95 backdrop-blur lg:hidden">
      <div ref={barRef} className="mx-auto flex min-h-[57px] w-full flex-wrap items-center gap-x-2 gap-y-1 px-4 py-2.5 sm:px-6">
        <Link href="/" onClick={() => onOpenChange(false)} className="flex flex-[1_1_0%] items-center gap-2">
          {/* alt rỗng: tên đã hiện ngay cạnh, trình đọc màn hình không đọc lặp “CDP Chạm Địa Phương”.
              `max-w-none`: ảnh có max-width % bị CSS coi là co được về 0 khi tính bề rộng tối thiểu → hàng không
              biết lúc nào phải cho nút Menu xuống dòng và tên tràn dưới nút (đo được ở 320px/150%, 390px/200%). */}
          <Image src="/cdp-logo.png" alt="" width={280} height={121} priority className="h-[26px] w-auto max-w-none shrink-0" />
          <BrandName className="text-sm font-bold leading-tight text-zinc-900 sm:text-base" />
        </Link>
        <button
          type="button"
          onClick={() => onOpenChange(!open)}
          aria-expanded={open}
          aria-controls="cdp-mobile-navigation"
          aria-label={open ? "Đóng menu" : "Mở menu"}
          className="cdp-pressable ml-auto flex min-h-11 shrink-0 cursor-pointer items-center gap-2 rounded-lg bg-zinc-100 px-2.5 text-sm font-medium text-zinc-700"
        >
          <span>{open ? "Đóng" : "Menu"}</span>
          <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
            {open ? <path d="M6 6l12 12M18 6 6 18" /> : <path d="M5 7h14M5 12h14M5 17h14" />}
          </svg>
        </button>
      </div>

      {open && (
        <nav id="cdp-mobile-navigation" aria-label="Điều hướng chính" className="border-t border-zinc-200 bg-white px-4 py-3 shadow-lg sm:px-6">
          <div className="mx-auto grid max-w-xl gap-1">
            {visibleItems.map((item) => {
              const active = isActive(item, pathname);
              return (
                <Link
                  key={item.key}
                  href={item.href}
                  onClick={() => onOpenChange(false)}
                  aria-current={active ? "page" : undefined}
                  className={`cdp-pressable flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm ${
                    active ? "bg-[#c8553d]/10 font-medium text-[#a83f2b]" : "text-zinc-700"
                  }`}
                >
                  <span className={`shrink-0 ${active ? "" : "text-zinc-500"}`}>
                    <NavigationIcon itemKey={item.key} />
                  </span>
                  {item.navLabel}
                </Link>
              );
            })}
          </div>
        </nav>
      )}
    </header>
  );
}
