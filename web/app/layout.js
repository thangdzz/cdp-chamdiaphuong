import { Be_Vietnam_Pro } from "next/font/google";
import "./globals.css";
import { SITE_URL } from "@/lib/siteUrl";
import { AppShell } from "@/app/AppShell";
import { getNavigationConfig } from "@/lib/navigation";
import { AnalyticsTracker } from "@/app/analytics";
import { NavHistoryTracker } from "@/app/BackButton";

// Be Vietnam Pro cho toàn site, kể cả /admin (DESIGN.md v2.0 §3, PM duyệt Q1 12/11). Font này không có bản
// "variable" trên Google Fonts nên phải nêu đúng 4 độ đậm đang dùng. Next.js tải font lúc build và phục vụ cùng
// web — trình duyệt khách không gọi Google Fonts. Font dự phòng tự chỉnh cỡ (adjustFontFallback mặc định) để
// chữ không nhảy khi font tải xong.
const beVietnamPro = Be_Vietnam_Pro({
  variable: "--font-be-vietnam-pro",
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
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

export default async function RootLayout({ children }) {
  const navigation = await getNavigationConfig();

  return (
    <html
      lang="vi"
      className={`${beVietnamPro.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-zinc-50">
        <AnalyticsTracker />
        <NavHistoryTracker />
        <AppShell navigation={navigation}>{children}</AppShell>
      </body>
    </html>
  );
}
