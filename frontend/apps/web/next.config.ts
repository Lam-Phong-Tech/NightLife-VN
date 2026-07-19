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
      { protocol: 'https', hostname: 'api.qrserver.com' },
      { protocol: 'https', hostname: 'api.demonightlight.test9.io.vn' },
      { protocol: 'https', hostname: 'demonightlight.test9.io.vn' },
      { protocol: 'https', hostname: 'partner.demonightlight.test9.io.vn' },
      { protocol: 'https', hostname: 'admin.demonightlight.test9.io.vn' },
      { protocol: 'https', hostname: 'auth.demonightlight.test9.io.vn' },
      { protocol: 'http', hostname: 'localhost' },
      { protocol: 'http', hostname: '127.0.0.1' },
    ],
  },
  typescript: {
    // !! WARN !!
    // Dangerously allow production builds to successfully complete even if
    // your project has type errors.
    ignoreBuildErrors: true,
  },
  async redirects() {
    return [
      {
        source: '/v',
        destination: '/',
        permanent: false,
      },
    ];
  },
  async rewrites() {
    return [
      {
        source: '/api/documentation',
        destination: '/api/backend/api/documentation',
      },
      {
        source: '/api/documentation/:path*',
        destination: '/api/backend/api/documentation/:path*',
      },
    ];
  },
};

export default nextConfig;
