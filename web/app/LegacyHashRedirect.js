"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

// Link cũ trỏ vào một thẻ trên trang chủ bằng "#" — "/#<mã chỗ>" (từ /ghi-chu, link đã gửi đi)
// và "/#dia-diem" (trang Giới thiệu). Từ vNext trang chủ không còn bày danh sách, nên chuyển
// những link đó tới đúng nơi thay vì để khách đứng ở trang chủ không thấy gì.
// Phần "#" không bao giờ được gửi lên máy chủ, nên chỉ làm được ở trình duyệt.
export function LegacyHashRedirect() {
  const router = useRouter();

  useEffect(() => {
    const hash = decodeURIComponent(window.location.hash.slice(1));
    if (!hash) return;
    if (hash === "dia-diem") router.replace("/tim");
    else if (/^[\w-]{3,80}$/.test(hash)) router.replace(`/dia-diem/${hash}`);
  }, [router]);

  return null;
}
