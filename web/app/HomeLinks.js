"use client";

import Form from "next/form";
import Link from "next/link";
import { track } from "./analytics";

// Hai lối vào từ trang chủ tới trang kết quả /tim (vNext). Tách thành Client Component chỉ để
// đếm bước "Search" của luồng Home → Search → Place → Save (lib/analytics/events.js).
// A4: màu theo token Cơ bản (DESIGN §2), 4 nhóm có biểu tượng nét theo mockup Trang chủ B.

/** Ô tìm ở trang chủ: gửi đi là sang /tim?q=… (next/form chuyển trang không tải lại). Không tự focus. */
export function HomeSearchForm() {
  return (
    <Form
      action="/tim"
      role="search"
      onSubmit={(e) => {
        if (new FormData(e.currentTarget).get("q")?.toString().trim()) track("search_use");
      }}
      className="mt-5 flex gap-2"
    >
      <div className="relative min-w-0 flex-1">
        <svg
          viewBox="0 0 24 24"
          width="18"
          height="18"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          aria-hidden="true"
          className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-2"
        >
          <circle cx="10.5" cy="10.5" r="6.5" />
          <path d="M20 20l-4.35-4.35" />
        </svg>
        <input
          type="search"
          name="q"
          enterKeyHint="search"
          placeholder="Tên quán, chỗ ngủ, địa chỉ…"
          aria-label="Tìm theo tên, địa chỉ"
          className="min-h-12 w-full rounded-[10px] border border-line-strong bg-surface py-3 pl-10 pr-3 text-base text-ink placeholder:text-ink-2"
        />
      </div>
      <button
        type="submit"
        className="cdp-pressable min-h-12 shrink-0 cursor-pointer rounded-[10px] bg-action px-5 text-base font-medium text-white hover:bg-action-hover active:bg-action-hover"
      >
        Tìm
      </button>
    </Form>
  );
}

// Biểu tượng nét 24px cho 4 nhóm (mockup Trang chủ B): bát, cờ, giường, xe. Trang trí — tên nhóm nằm ngay cạnh.
const CATEGORY_ICON_PATHS = {
  an: (
    <>
      <path d="M3 11h18a9 9 0 0 1-18 0Z" />
      <path d="M8 7c0-1.5 1-2 1-3.5M12 7c0-1.5 1-2 1-3.5M16 7c0-1.5 1-2 1-3.5" />
    </>
  ),
  choi: (
    <>
      <path d="M5 21V4" />
      <path d="M5 4h11l-2 4 2 4H5" />
    </>
  ),
  ngu: (
    <>
      <path d="M3 18V7" />
      <path d="M3 14h18v4" />
      <path d="M21 14v-2a3 3 0 0 0-3-3h-7v5" />
      <circle cx="7" cy="11" r="1.6" />
    </>
  ),
  dilai: (
    <>
      <rect x="5" y="3" width="14" height="14" rx="2" />
      <path d="M5 10h14M8 17v3M16 17v3" />
    </>
  ),
};

/** Một ô nhóm (Ăn/Chơi/Ngủ/Đi lại) — mở /tim đã lọc sẵn nhóm đó. */
export function HomeCategoryLink({ href, type, label, count }) {
  return (
    <Link
      href={href}
      onClick={() => track("category_pick")}
      className="cdp-pressable flex min-h-16 flex-wrap items-center gap-x-3 gap-y-1 rounded-xl border border-line bg-surface px-3 py-3 shadow-card"
    >
      {CATEGORY_ICON_PATHS[type] && (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
          className="h-6 w-6 shrink-0 text-ink"
        >
          {CATEGORY_ICON_PATHS[type]}
        </svg>
      )}
      {/* Chữ xuống dưới biểu tượng khi ô quá hẹp (phóng chữ lớn) thay vì tràn ngang. */}
      <span className="flex min-w-0 flex-1 basis-16 flex-col">
        <span className="text-base font-semibold leading-snug text-ink">{label}</span>
        <span className="text-[0.8125rem] leading-snug text-ink-2">{count} chỗ</span>
      </span>
    </Link>
  );
}
