import Link from "next/link";

export function SiteFooter({ aboutLabel = "CDP là gì?" }) {
  return (
    <footer className="mt-auto border-t border-zinc-200 bg-zinc-50">
      <div className="mx-auto w-full max-w-xl px-4 py-5 text-xs leading-5 text-zinc-500 sm:px-6">
        <p>Thông tin địa điểm có thể thay đổi theo thời gian.</p>
        <nav aria-label="Thông tin về Chạm Địa Phương" className="mt-1.5 flex flex-wrap gap-x-4 gap-y-1">
          <Link href="/gioi-thieu" className="underline decoration-zinc-300 underline-offset-2">
            {aboutLabel}
          </Link>
          <Link
            href="/gioi-thieu#du-lieu"
            className="underline decoration-zinc-300 underline-offset-2"
          >
            Dữ liệu &amp; cách cập nhật
          </Link>
        </nav>
      </div>
    </footer>
  );
}
