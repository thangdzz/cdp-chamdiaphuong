"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

// Nút "Quay lại" dùng chung cho các trang con (owner test 30/9): không bắt khách phải biết cử chỉ
// vuốt của iPhone, và không bao giờ đẩy khách RA KHỎI CDP.
//
// Cách biết có "trang trước trong CDP" hay không: tự ghi các trang đã đi qua trong lần mở này
// (`visited`). Có trang trước → `router.back()`, đúng như nút Back của trình duyệt (giữ vị trí cuộn,
// giữ bộ lọc /tim). Mở thẳng từ link Zalo/Facebook (chỉ có 1 trang) → về trang cha `fallback`.
// Dựa vào `history.length` thì sai: nó đếm cả trang của web khác trước khi vào CDP.

const visited = [];
let nextIsPop = false;
let nextIsReplace = false;

/** Gọi ngay trước `router.replace()` — thay trang tại chỗ thì không thành thêm một bước lùi. */
export function noteReplaceNavigation() {
  nextIsReplace = true;
}

/** Đặt một lần trong layout gốc: ghi lại từng lần đổi trang. */
export function NavHistoryTracker() {
  const pathname = usePathname();

  useEffect(() => {
    const onPop = () => {
      nextIsPop = true;
    };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  useEffect(() => {
    if (!pathname || visited.at(-1) === pathname) return;
    if (nextIsPop) {
      visited.pop();
      // Lùi quá điểm bắt đầu (vd. Back rồi Forward lẫn lộn) thì coi trang này là điểm mới.
      if (visited.at(-1) !== pathname) visited.push(pathname);
    } else if (nextIsReplace && visited.length > 0) {
      visited[visited.length - 1] = pathname;
    } else {
      visited.push(pathname);
    }
    nextIsPop = false;
    nextIsReplace = false;
  }, [pathname]);

  return null;
}

function hasPreviousPageInApp() {
  return visited.length > 1;
}

/**
 * @param {string} fallback trang cha khi không có trang trước trong CDP (mở thẳng link)
 * @param {string} label chữ trên nút
 */
export function BackButton({ fallback = "/", label = "Quay lại", className = "" }) {
  const router = useRouter();

  // Là một LINK thật tới trang cha: bấm trước khi trang tải xong JavaScript (mạng chậm) vẫn đi
  // được. Khi đã sẵn sàng và có trang trước trong CDP thì chặn link, lùi lại như nút Back.
  //
  // Về trang cha thì THAY trang hiện tại (replace), không thêm bước mới: mở thẳng trang địa điểm →
  // Quay lại → /tim → Quay lại phải về trang chủ, không vòng ngược lại trang địa điểm vừa rời.
  function goBack(event) {
    if (!hasPreviousPageInApp()) {
      noteReplaceNavigation();
      return; // để Link tự đi về `fallback`
    }
    event.preventDefault();
    router.back();
  }

  return (
    <Link
      href={fallback}
      replace
      transitionTypes={["nav-back"]}
      onClick={goBack}
      className={`cdp-pressable -ml-2 mb-2 inline-flex min-h-11 cursor-pointer items-center gap-1 rounded-lg px-2 text-sm font-medium text-zinc-600 hover:bg-zinc-100 ${className}`}
    >
      <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M15 18l-6-6 6-6" />
      </svg>
      {label}
    </Link>
  );
}
