import { placeStatus } from "@/lib/placeDisplay";

// Dòng trạng thái hoạt động của một chỗ — CÙNG câu chữ ở trang địa điểm, thẻ /tim và thẻ trong Sổ
// (lib/placeDisplay.js placeStatus). Xanh lá chỉ dành cho "Còn mở · xác nhận …" (DESIGN.md §4).
// `suppressHydrationWarning`: câu "hôm nay / hôm qua" tính theo giờ lúc vẽ — máy chủ và điện thoại
// có thể lệch nhau đúng lúc qua nửa đêm.
export function PlaceStatusLine({ place, now, className = "" }) {
  const status = placeStatus(place, now);
  return (
    <p className={`text-[13px] leading-5 ${className}`} suppressHydrationWarning>
      <span className={status.tone === "green" ? "font-medium text-emerald-700" : "text-zinc-500"}>{status.text}</span>
      {status.note && <span className="text-zinc-400"> · {status.note}</span>}
    </p>
  );
}
