import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { SITE_URL } from "@/lib/siteUrl";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  // Neo mọi đường dẫn tương đối trong metadata (nhất là ảnh Open Graph) vào tên miền chính.
  // Thiếu dòng này thì Next.js suy ra host từ request — bot Zalo/Facebook quét link cũ sẽ
  // lấy ảnh preview mang địa chỉ cũ (cùng gốc với lỗi link chia sẻ 2026-09-09).
  metadataBase: new URL(SITE_URL),
  title: "Chạm Địa Phương – Ăn & Ngủ ở Tuyên Quang",
  description:
    "Tìm nhanh chỗ ăn, chỗ ngủ đáng tin ở TP Tuyên Quang, đặc biệt dịp Trung Thu.",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="vi"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-zinc-50">{children}</body>
    </html>
  );
}
