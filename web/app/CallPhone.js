"use client";

import { useEffect, useRef, useState } from "react";
import { splitPhoneNumbers, telHref } from "@/lib/phone";

// Mọi chỗ gọi điện trong CDP đi qua đây (owner test 30/9): ô SĐT có nhiều số thì tách từng số
// (lib/phone.js), mỗi số một `tel:` riêng — không để iPhone tự đoán dấu "-" giữa hai số.

/**
 * Hiện từng số dạng chữ, mỗi số bấm là gọi đúng số đó. Dùng khi số được bày ra để đọc
 * (dòng liên hệ ở trang địa điểm).
 */
export function PhoneLinks({ phone, linkClassName = "" }) {
  const numbers = splitPhoneNumbers(phone);
  return numbers.map((number, i) => (
    <span key={number.tel} className="whitespace-nowrap">
      {i > 0 && <span className="px-1 text-zinc-400" aria-hidden="true">·</span>}
      <a href={telHref(number)} className={linkClassName}>
        {number.display}
      </a>
    </span>
  ));
}

/**
 * Nút "Gọi". Một số → gọi luôn. Nhiều số → mở lựa chọn ngắn "Chọn số để gọi", bấm số nào gọi số đó.
 */
export function CallButton({ phone, className = "", children }) {
  const numbers = splitPhoneNumbers(phone);
  const [open, setOpen] = useState(false);
  const boxRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    const onPointer = (event) => {
      if (!boxRef.current?.contains(event.target)) setOpen(false);
    };
    const onKey = (event) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  if (numbers.length === 0) return null;
  if (numbers.length === 1) {
    return (
      <a href={telHref(numbers[0])} className={className}>
        {children}
      </a>
    );
  }

  return (
    <div ref={boxRef} className="relative">
      <button type="button" aria-expanded={open} onClick={() => setOpen((v) => !v)} className={className}>
        {children}
      </button>
      {open && (
        <div
          role="menu"
          aria-label="Chọn số để gọi"
          className="cdp-fade-in absolute left-0 top-full z-30 mt-1 min-w-56 rounded-xl bg-white p-1.5 shadow-lg ring-1 ring-zinc-200"
        >
          <p className="px-2.5 pb-1 pt-1.5 text-[13px] text-zinc-500">Chọn số để gọi</p>
          {numbers.map((number) => (
            <a
              key={number.tel}
              role="menuitem"
              href={telHref(number)}
              onClick={() => setOpen(false)}
              className="flex min-h-11 items-center rounded-lg px-2.5 text-base tabular-nums text-zinc-900 hover:bg-zinc-50 active:bg-zinc-100"
            >
              {number.display}
            </a>
          ))}
        </div>
      )}
    </div>
  );
}

/** Các số viết liền để đọc, vd "0393 083 596 · 0356 569 627". */
export function phoneDisplayText(phone) {
  return splitPhoneNumbers(phone)
    .map((n) => n.display)
    .join(" · ");
}
