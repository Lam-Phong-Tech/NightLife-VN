import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Bật chế độ kiểm tra nghiêm của React: chạy một số logic 2 lần ở môi trường dev
  // để lộ ra các side-effect/bug tiềm ẩn. Không ảnh hưởng production.
  reactStrictMode: true,
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'img.icons8.com' },
    ],
  },
  output: 'standalone',
};

export default nextConfig;
