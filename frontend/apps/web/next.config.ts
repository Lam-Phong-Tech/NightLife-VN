import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Bật chế độ kiểm tra nghiêm của React: chạy một số logic 2 lần ở môi trường dev
  // để lộ ra các side-effect/bug tiềm ẩn. Không ảnh hưởng production.
  reactStrictMode: true,
  devIndicators: false,
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'img.icons8.com' },
    ],
  },
  output: 'standalone',
  typescript: {
    // !! WARN !!
    // Dangerously allow production builds to successfully complete even if
    // your project has type errors.
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
