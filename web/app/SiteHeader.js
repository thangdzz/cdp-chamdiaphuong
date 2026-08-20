import Link from "next/link";

// Logo + "Sổ của tôi" luôn thấy được (position: sticky) dù khách lướt xuống cuối trang —
// trước đó chỉ có link CDP ở đầu trang chủ, không có đường nào tới /so nên khách không tự
// tìm lại được sổ đã tạo (phản hồi thật sau khi thử Chặng 4). "Ghi chú của tôi" (Chặng 6)
// thêm cùng lý do — tránh lặp lại đúng lỗi đó cho ghi chú riêng.
export function SiteHeader() {
  return (
    <header className="sticky top-0 z-20 -mx-4 mb-4 flex items-center justify-between gap-2 border-b border-zinc-200 bg-zinc-50/95 px-4 py-3 backdrop-blur sm:-mx-6 sm:px-6">
      <Link href="/" className="inline-flex shrink-0 items-baseline gap-2">
        <span className="text-xl font-bold text-[#c8553d]">CDP</span>
        <span className="hidden text-base font-bold text-zinc-900 sm:inline">Chạm Địa Phương</span>
      </Link>
      <div className="flex shrink-0 gap-2">
        <Link
          href="/ghi-chu"
          className="rounded-full border border-zinc-300 bg-white px-3 py-1.5 text-sm font-medium text-zinc-700"
        >
          Ghi chú của tôi
        </Link>
        <Link
          href="/so"
          className="rounded-full border border-zinc-300 bg-white px-3 py-1.5 text-sm font-medium text-zinc-700"
        >
          Sổ của tôi
        </Link>
      </div>
    </header>
  );
}
