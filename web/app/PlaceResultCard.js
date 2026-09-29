import Link from "next/link";
import { PlaceStatusLine } from "@/app/PlaceStatusLine";

// Thẻ gọn của trang kết quả /tim (vNext). Thứ tự theo SCOPE-vNext "Kết quả ưu tiên hiển thị":
// trạng thái hoạt động + lần xác nhận gần nhất → giá (khi có) → địa chỉ → Xem chi tiết / Chỉ đường.
// Không bung tại chỗ như thẻ trang chủ cũ: mọi chi tiết và thao tác đóng góp nằm ở trang địa điểm.
//
// `item` là bản gọn từ lib/searchResults.js — không có ảnh, câu trả lời, mẹo.
export function PlaceResultCard({ item, now, onOpen }) {
  const href = `/dia-diem/${item.id}`;

  return (
    <li className="rounded-xl bg-white px-[18px] py-4 shadow-sm">
      <Link href={href} onClick={onOpen} className="block">
        <p className="text-[13px] text-zinc-500">{item.typeLabel}</p>
        <h2 className="mt-0.5 text-lg font-medium leading-snug tracking-tight text-zinc-900">{item.name}</h2>
        {/* Trạng thái nói thật: chỉ "Còn mở" khi có người xác nhận; không có thì nói chưa có ai,
            không đoán (DECISIONS 2026-09-29: đã bỏ nhãn "còn chỗ" suy theo lịch). */}
        <PlaceStatusLine place={item} now={now} className="mt-1" />
        {item.priceCompact && (
          <p className="mt-2 flex items-baseline gap-1">
            <span className="text-xl font-medium tracking-tight text-zinc-900">{item.priceCompact}</span>
            <span className="text-xs text-zinc-400">{item.priceUnitText}</span>
          </p>
        )}
        {item.subline && <p className="mt-1 text-[13px] text-zinc-500">{item.subline}</p>}
      </Link>

      <div className="mt-3 flex flex-wrap gap-2">
        <Link
          href={href}
          onClick={onOpen}
          className="cdp-pressable inline-flex min-h-11 items-center rounded-lg bg-[#c8553d] px-4 text-sm font-medium text-white active:bg-[#ad4832]"
        >
          Xem chi tiết
        </Link>
        {item.mapHref && (
          <a
            href={item.mapHref}
            target="_blank"
            rel="noopener noreferrer"
            className="cdp-pressable inline-flex min-h-11 items-center rounded-lg border border-zinc-200 px-3 text-[13px] font-medium text-zinc-600"
          >
            {item.mapLabel}
          </a>
        )}
      </div>
    </li>
  );
}
