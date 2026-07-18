/** @type {import('next').NextConfig} */
const nextConfig = {
  turbopack: {
    root: import.meta.dirname,
  },
  experimental: {
    serverActions: {
      // Mặc định 1MB — ảnh khách gửi (đã nén phía trình duyệt, nhưng có thể tới 3 ảnh/lần
      // và đôi khi nén không tác dụng) cần rộng rãi hơn để không bị chặn oan.
      bodySizeLimit: "8mb",
    },
  },
};

export default nextConfig;
