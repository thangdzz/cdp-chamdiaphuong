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
  turbopack: {
    root: import.meta.dirname,
  },
  experimental: {
    serverActions: {
      // Mặc định 1MB — ảnh đã nén phía trình duyệt nhưng khách có thể gửi 5 ảnh/lần, Admin
      // 10 ảnh/lần. Server vẫn chặn từng file 8MB và resize lại trước khi lưu.
      bodySizeLimit: "12mb",
    },
  },
};

export default nextConfig;
