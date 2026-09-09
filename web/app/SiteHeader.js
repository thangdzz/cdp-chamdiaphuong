import Link from "next/link";

// Logo + "Sổ của tôi" luôn thấy được (position: sticky) dù khách lướt xuống cuối trang —
// trước đó chỉ có link CDP ở đầu trang chủ, không có đường nào tới /so nên khách không tự
// tìm lại được sổ đã tạo (phản hồi thật sau khi thử Chặng 4). "Ghi chú của tôi" (Chặng 6)
// thêm cùng lý do — tránh lặp lại đúng lỗi đó cho ghi chú riêng.
// `quiet`: hạ cấp thị giác 2 nút cá nhân (NOTE-02 §9) — dùng ở trang mở từ link chia sẻ, nơi
// người nhận cần hiểu NỘI DUNG trước, không để nút cá nhân cạnh tranh sự chú ý. Vẫn giữ nút,
// chỉ bỏ nền và làm nhạt chữ, không xoá khỏi trang.
export function SiteHeader({ quiet = false }) {
  const navClass = quiet
    ? "rounded-lg px-2 py-1.5 text-[13px] text-zinc-400"
    : "rounded-lg bg-zinc-100 px-3 py-1.5 text-sm font-medium text-zinc-600";

  return (
    <header className="sticky top-0 z-20 -mx-4 mb-4 flex items-center justify-between gap-2 border-b border-zinc-200 bg-zinc-50/95 px-4 py-3 backdrop-blur sm:-mx-6 sm:px-6">
      <Link href="/" className="inline-flex shrink-0 items-baseline gap-2">
        <span className="text-xl font-bold text-[#c8553d]">CDP</span>
        <span className="hidden text-base font-bold text-zinc-900 sm:inline">Chạm Địa Phương</span>
      </Link>
      <div className="flex shrink-0 gap-2">
        <Link href="/ghi-chu" className={navClass}>
          Ghi chú của tôi
        </Link>
        <Link href="/so" className={navClass}>
          Sổ của tôi
        </Link>
      </div>
    </header>
  );
}
