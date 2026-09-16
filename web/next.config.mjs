/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.public.blob.vercel-storage.com",
        pathname: "/**",
      },
    ],
    formats: ["image/avif", "image/webp"],
  },
  // Link cũ không được chết (DECISIONS 2026-09-16): game bỏ tầng `/cham/` và đổi slug.
  // Ai đã lưu/đã share link cũ vẫn vào đúng trang, trình duyệt nhớ luôn địa chỉ mới.
  async redirects() {
    return [
      { source: "/cham/thanh-tuyen-2026", destination: "/san-den-thanh-tuyen-2026", permanent: true },
      // Mùa khác lỡ còn link dạng cũ thì vẫn về đúng tầng gốc.
      { source: "/cham/:slug", destination: "/:slug", permanent: true },
    ];
  },
  turbopack: {
    root: import.meta.dirname,
  },
  experimental: {
    // Công tắc hiệu ứng chuyển trang (app/PageTransition.js). Có vấn đề thì đặt false.
    viewTransition: true,
    serverActions: {
      // Mặc định 1MB — ảnh đã nén phía trình duyệt nhưng khách có thể gửi 5 ảnh/lần, Admin
      // 10 ảnh/lần. Server vẫn chặn từng file 8MB và resize lại trước khi lưu.
      bodySizeLimit: "12mb",
    },
  },
};

export default nextConfig;
