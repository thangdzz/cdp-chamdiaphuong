import Link from "next/link";

// Màu footer: trang khách dùng token Cơ bản (A2-a). /admin cũng hiện footer này nhưng giữ đúng màu cũ (ngoại lệ
// DESIGN §2 — Admin không đổi màu), vì token khai trên :root nên dùng chung lớp thì Admin cũng đổi theo.
const STYLES = {
  site: { footer: "border-line bg-page", text: "text-ink-2", link: "decoration-line" },
  admin: { footer: "border-zinc-200 bg-zinc-50", text: "text-zinc-500", link: "decoration-zinc-300" },
};

export function SiteFooter({ aboutLabel = "CDP là gì?", variant = "site" }) {
  const style = STYLES[variant] ?? STYLES.site;
  return (
    <footer className={`mt-auto border-t ${style.footer}`}>
      <div className={`mx-auto w-full max-w-xl px-4 py-5 text-xs leading-5 sm:px-6 ${style.text}`}>
        <p>Thông tin địa điểm có thể thay đổi theo thời gian.</p>
        <nav aria-label="Thông tin về Chạm Địa Phương" className="mt-1.5 flex flex-wrap gap-x-4 gap-y-1">
          <Link href="/gioi-thieu" className={`underline underline-offset-2 ${style.link}`}>
            {aboutLabel}
          </Link>
          <Link href="/gioi-thieu#du-lieu" className={`underline underline-offset-2 ${style.link}`}>
            Dữ liệu &amp; cách cập nhật
          </Link>
        </nav>
      </div>
    </footer>
  );
}
