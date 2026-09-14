"use client";

import Link from "next/link";

function isActive(item, pathname) {
  if (item.href === "/") return pathname === "/";
  return pathname === item.href || pathname.startsWith(`${item.href}/`);
}

// NOTE-10 §5: mobile không dùng sidebar fixed. Header gọn và menu này đọc đúng cùng config
// với desktop, nên Admin đổi nhãn/thứ tự/bật tắt ở một chỗ là cả hai bề mặt cùng thay đổi.
export function SiteHeader({ navigation, pathname, open, onOpenChange }) {
  const visibleItems = navigation.filter((item) => item.enabled);

  return (
    <header className="sticky top-0 z-40 border-b border-zinc-200 bg-zinc-50/95 backdrop-blur lg:hidden">
      <div className="mx-auto flex min-h-[57px] w-full items-center justify-between gap-3 px-4 py-2.5 sm:px-6">
        <Link href="/" onClick={() => onOpenChange(false)} className="inline-flex min-w-0 items-baseline gap-2">
          <span className="shrink-0 text-xl font-bold text-[#c8553d]">CDP</span>
          <span className="truncate text-sm font-bold text-zinc-900 sm:text-base">Chạm Địa Phương</span>
        </Link>
        <button
          type="button"
          onClick={() => onOpenChange(!open)}
          aria-expanded={open}
          aria-controls="cdp-mobile-navigation"
          aria-label={open ? "Đóng menu" : "Mở menu"}
          className="cdp-pressable flex min-h-11 cursor-pointer items-center gap-2 rounded-lg bg-zinc-100 px-3 text-sm font-medium text-zinc-700"
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
                  className={`cdp-pressable rounded-lg px-3 py-2.5 text-sm ${
                    active ? "bg-[#c8553d]/10 font-medium text-[#a83f2b]" : "text-zinc-700"
                  }`}
                >
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
