"use client";

import Form from "next/form";
import Link from "next/link";
import { track } from "./analytics";

// Hai lối vào từ trang chủ tới trang kết quả /tim (vNext). Tách thành Client Component chỉ để
// đếm bước "Search" của luồng Home → Search → Place → Save (lib/analytics/events.js).

/** Ô tìm ở trang chủ: gửi đi là sang /tim?q=… (next/form chuyển trang không tải lại). */
export function HomeSearchForm() {
  return (
    <Form
      action="/tim"
      role="search"
      onSubmit={(e) => {
        if (new FormData(e.currentTarget).get("q")?.toString().trim()) track("search_use");
      }}
      className="mt-6 flex gap-2"
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
          className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400"
        >
          <circle cx="10.5" cy="10.5" r="6.5" />
          <path d="M20 20l-4.35-4.35" />
        </svg>
        <input
          type="search"
          name="q"
          enterKeyHint="search"
          placeholder="Tìm quán, chỗ ngủ, địa chỉ..."
          aria-label="Tìm theo tên, địa chỉ"
          className="min-h-12 w-full rounded-lg border border-zinc-200 bg-white py-3 pl-10 pr-3 text-base text-zinc-800 shadow-sm"
        />
      </div>
      <button
        type="submit"
        className="cdp-pressable min-h-12 shrink-0 cursor-pointer rounded-lg bg-[#c8553d] px-5 text-base font-medium text-white active:bg-[#ad4832]"
      >
        Tìm
      </button>
    </Form>
  );
}

/** Một ô nhóm (Ăn/Chơi/Ngủ/Đi lại) — mở /tim đã lọc sẵn nhóm đó. */
export function HomeCategoryLink({ href, label, count }) {
  return (
    <Link
      href={href}
      onClick={() => track("category_pick")}
      className="cdp-pressable flex min-h-16 flex-col justify-center rounded-xl bg-white px-4 py-3 shadow-sm"
    >
      <span className="text-base font-medium text-zinc-900">{label}</span>
      <span className="text-[13px] text-zinc-500">{count} chỗ</span>
    </Link>
  );
}
