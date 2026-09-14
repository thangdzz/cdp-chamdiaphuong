"use client";

import { ViewTransition, useEffect } from "react";

// Chuyển trang kiểu iOS bằng View Transitions có sẵn của trình duyệt (next.config.mjs
// `experimental.viewTransition` — tắt cờ đó là web về chuyển trang tức thì như cũ).
// Không thêm thư viện, trình duyệt tự vẽ; trình duyệt chưa hỗ trợ thì bỏ qua, không lỗi.
//
// - `key={pathname}`: đổi đường dẫn mới là "sang trang". Cùng trang mà làm mới dữ liệu (Server
//   Action, lọc, #anchor) không đổi key nên không trượt.
// - Chỉ trang MỚI chuyển động (enter); trang cũ không có exit nên biến mất ngay. Nhờ vậy chỉ
//   cần biết hướng ở lần render của trang mới.
// - Link quay lại gắn `transitionTypes={["nav-back"]}` → trượt từ trái.
// - Nút Back/vuốt Back của trình duyệt: không chạy hiệu ứng — Safari đã có hiệu ứng vuốt riêng,
//   chạy thêm là chuyển động chồng hai lần.
let lastNavigationFromHistory = false;

export function PageTransition({ pathname, children }) {
  useEffect(() => {
    const markHistory = () => {
      lastNavigationFromHistory = true;
    };
    const markInApp = () => {
      lastNavigationFromHistory = false;
    };
    window.addEventListener("popstate", markHistory);
    // Mọi lượt bấm trong trang (link, nút lưu rồi chuyển trang...) là điều hướng trong app.
    document.addEventListener("click", markInApp, true);
    return () => {
      window.removeEventListener("popstate", markHistory);
      document.removeEventListener("click", markInApp, true);
    };
  }, []);

  return (
    <ViewTransition
      key={pathname}
      enter={{
        "nav-back": "cdp-nav-back",
        default: lastNavigationFromHistory ? "none" : "cdp-nav-forward",
      }}
      exit="none"
      update="none"
      default="none"
    >
      {children}
    </ViewTransition>
  );
}
