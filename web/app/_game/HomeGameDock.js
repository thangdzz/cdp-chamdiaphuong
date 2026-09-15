"use client";

import Link from "next/link";
import { useEffect, useState, useSyncExternalStore } from "react";

// Thẻ game nổi bám cạnh phải trang chủ (NOTE-08 §1, sửa 2026-09-16):
//  - Lần đầu trong NGÀY (giờ VN) mở trang chủ: thẻ đầy đủ tự trượt vào (huy hiệu, lời mời, nút vào chơi).
//  - Các lượt sau trong ngày: chỉ còn tab nhỏ dính mép phải — không che nội dung, bấm để mở.
//  - Thu gọn / mở: chỉ đổi trên màn hình đang xem, không lưu.
//  - "Ẩn hôm nay": ẩn hẳn tới hết ngày; hôm sau (một đêm hội khác) hiện lại.
// localStorage chỉ lưu { eventId, day, state: "seen" | "dismissed" }. Server không render gì (không biết
// localStorage) — thẻ chỉ hiện sau khi trang sẵn sàng.

const STORAGE_KEY = "cdp_home_game_dock";
const CHANGE_EVENT = "cdp-home-game-dock-change";
const VN_DAY = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Ho_Chi_Minh" });

let memoryState = null; // khi localStorage bị chặn (duyệt riêng tư)
// Lượt xem đang giữ thẻ tự mở. Về trang chủ lần nữa (kể cả chuyển trang phía client) thì không tự mở lại.
let autoOpenedThisView = false;

function today() {
  return VN_DAY.format(new Date());
}

function readStored(eventId) {
  try {
    const stored = JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? "null");
    if (stored?.eventId === eventId && stored.day === today()) return stored.state;
  } catch {
    // bỏ qua
  }
  return memoryState;
}

function writeState(eventId, state) {
  memoryState = state;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ eventId, day: today(), state }));
  } catch {
    // vẫn đổi trong phiên hiện tại
  }
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

function subscribe(callback) {
  window.addEventListener("storage", callback);
  window.addEventListener(CHANGE_EVENT, callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener(CHANGE_EVENT, callback);
  };
}

function ChevronRight() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M9 6l6 6-6 6" />
    </svg>
  );
}

function Badge({ html }) {
  return <span aria-hidden="true" className="inline-flex shrink-0" dangerouslySetInnerHTML={{ __html: html }} />;
}

export function HomeGameDock({ href, eventId, title, cta, icon, status, heroBadge, tabBadge, tabLabel }) {
  // null = server/chưa hydrate · "first" = hôm nay chưa thấy · "seen" · "dismissed"
  const stored = useSyncExternalStore(subscribe, () => readStored(eventId) ?? "first", () => null);
  const [userOpen, setUserOpen] = useState(null); // khách vừa bấm mở (true) / thu gọn (false)

  useEffect(() => {
    if (stored !== "first") return;
    autoOpenedThisView = true;
    writeState(eventId, "seen");
  }, [stored, eventId]);
  useEffect(() => () => {
    autoOpenedThisView = false;
  }, []);

  if (!stored || stored === "dismissed") return null;
  const expanded = userOpen ?? (stored === "first" || autoOpenedThisView);

  // Đặt trên cặp nút "lên/xuống đầu trang" của danh sách (bottom-3, 2 nút 44px) để không đè nhau.
  const position = "fixed z-30 bottom-[calc(7.25rem+env(safe-area-inset-bottom))] lg:bottom-24";

  if (!expanded) {
    return (
      <button
        type="button"
        onClick={() => setUserOpen(true)}
        aria-label={`Mở thẻ game ${title}`}
        className={`${position} right-0 cdp-home-dock-in cdp-pressable flex cursor-pointer flex-col items-center gap-0.5 rounded-l-xl bg-[linear-gradient(165deg,#1b1733_0%,#3a2230_100%)] py-2 pl-2.5 pr-2 shadow-lg ring-1 ring-white/10`}
      >
        {tabBadge && <Badge html={tabBadge} />}
        <span className="text-[11px] font-medium leading-tight text-[#f3c77a]">{tabLabel}</span>
      </button>
    );
  }

  return (
    // Gọn (~130px cao) để trên điện thoại chỉ che một góc: 1 huy hiệu + tên + trạng thái + nút vào chơi.
    <aside
      aria-labelledby="home-game-dock-title"
      className={`${position} cdp-home-dock-in right-3 w-[min(21rem,calc(100vw-1.5rem))] overflow-hidden rounded-xl bg-[linear-gradient(165deg,#1b1733_0%,#2a1d3c_58%,#3a2230_100%)] shadow-2xl ring-1 ring-white/10 lg:right-6`}
    >
      {/* Vầng trăng thở chậm sau huy hiệu — chỉ opacity, tắt theo prefers-reduced-motion (SPEC-giao-dien §7). */}
      <span
        aria-hidden="true"
        className="cdp-game-banner-halo pointer-events-none absolute -left-6 -top-8 h-32 w-32 rounded-full bg-[radial-gradient(closest-side,rgba(255,206,120,0.42),rgba(255,206,120,0.1)_60%,transparent)]"
      />

      <div className="relative flex items-start gap-3 py-3 pl-3 pr-1">
        {heroBadge && (
          <Link href={href} tabIndex={-1} className="mt-0.5 flex">
            <Badge html={heroBadge} />
          </Link>
        )}
        <Link href={href} className="min-w-0 flex-1">
          <p className="text-[12px] font-medium leading-4 text-[#f3c77a]">{icon} Game của lễ hội</p>
          <h2 id="home-game-dock-title" className="text-[15px] font-medium leading-snug text-[#fff6dd]">
            {title}
          </h2>
          <p className="mt-0.5 text-[13px] leading-5 text-white/75">{status}</p>
        </Link>
        <button
          type="button"
          onClick={() => setUserOpen(false)}
          aria-label="Thu gọn thẻ game"
          className="cdp-pressable -mt-1 flex h-11 w-11 shrink-0 cursor-pointer items-center justify-center rounded-lg text-white/60 hover:bg-white/10 hover:text-white"
        >
          <ChevronRight />
        </button>
      </div>

      <div className="relative flex items-center gap-2 px-3 pb-3">
        <Link
          href={href}
          className="cdp-pressable flex min-h-11 flex-1 items-center justify-center gap-1.5 rounded-lg bg-[#c8553d] text-[15px] font-medium text-white shadow-[0_6px_18px_-6px_rgba(200,85,61,0.7)]"
        >
          {icon} {cta}
        </Link>
        <button
          type="button"
          onClick={() => writeState(eventId, "dismissed")}
          className="cdp-pressable min-h-11 shrink-0 cursor-pointer rounded-lg px-2.5 text-[13px] text-white/60 hover:bg-white/10 hover:text-white"
        >
          Ẩn hôm nay
        </button>
      </div>
    </aside>
  );
}
