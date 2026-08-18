import Link from "next/link";

// Logo + "Sổ của tôi" luôn thấy được (position: sticky) dù khách lướt xuống cuối trang —
// trước đó chỉ có link CDP ở đầu trang chủ, không có đường nào tới /so nên khách không tự
// tìm lại được sổ đã tạo (phản hồi thật sau khi thử Chặng 4).
export function SiteHeader() {
  return (
    <header className="sticky top-0 z-20 -mx-4 mb-4 flex items-center justify-between border-b border-zinc-200 bg-zinc-50/95 px-4 py-3 backdrop-blur sm:-mx-6 sm:px-6">
      <Link href="/" className="inline-flex items-baseline gap-2">
        <span className="text-xl font-bold text-[#c8553d]">CDP</span>
        <span className="text-base font-bold text-zinc-900">Chạm Địa Phương</span>
      </Link>
      <Link
        href="/so"
        className="shrink-0 rounded-full border border-zinc-300 bg-white px-3 py-1.5 text-sm font-medium text-zinc-700"
      >
        Sổ của tôi
      </Link>
    </header>
  );
}
