"use client";

import Link from "next/link";
import { useSyncExternalStore } from "react";

const STORAGE_KEY = "cdp_about_intro_dismissed";
const CHANGE_EVENT = "cdp-about-intro-change";

let dismissedInMemory = false;

function subscribe(callback) {
  window.addEventListener("storage", callback);
  window.addEventListener(CHANGE_EVENT, callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener(CHANGE_EVENT, callback);
  };
}

function getSnapshot() {
  if (dismissedInMemory) return false;
  try {
    return window.localStorage.getItem(STORAGE_KEY) !== "1";
  } catch {
    return true;
  }
}

function getServerSnapshot() {
  // Không render card trong HTML ban đầu để tránh server và trình duyệt hiểu khác nhau về
  // localStorage. Sau khi trang sẵn sàng, người chưa từng đóng mới thấy card.
  return false;
}

export function FirstVisitIntroCard() {
  const visible = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  if (!visible) return null;

  function dismiss() {
    dismissedInMemory = true;
    try {
      window.localStorage.setItem(STORAGE_KEY, "1");
    } catch {
      // Vẫn đóng trong phiên hiện tại nếu trình duyệt không cho ghi localStorage.
    }
    window.dispatchEvent(new Event(CHANGE_EVENT));
  }

  return (
    <aside
      aria-labelledby="first-visit-intro-title"
      className="relative mb-6 rounded-xl bg-white p-4 pr-11 shadow-sm"
    >
      <button
        type="button"
        onClick={dismiss}
        aria-label="Đóng hướng dẫn lần đầu"
        className="cdp-pressable absolute right-3 top-3 inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg text-xl leading-none text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700"
      >
        ×
      </button>
      <h2 id="first-visit-intro-title" className="text-base font-medium text-zinc-900">
        Lần đầu dùng Chạm Địa Phương?
      </h2>
      <p className="mt-1.5 text-sm leading-6 text-zinc-600">
        CDP giúp bạn gom chỗ ăn, chơi, ngủ, đi lại thành một Sổ để tự dùng hoặc gửi cho người
        khác.
      </p>
      <Link
        href="/gioi-thieu#cach-hoat-dong"
        className="mt-2 inline-block text-sm font-medium text-[#c8553d] underline decoration-[#c8553d]/30 underline-offset-2"
      >
        CDP hoạt động thế nào →
      </Link>
    </aside>
  );
}
