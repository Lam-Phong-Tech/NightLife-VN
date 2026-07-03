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
    ],
  },
  typescript: {
    // !! WARN !!
    // Dangerously allow production builds to successfully complete even if
    // your project has type errors.
    ignoreBuildErrors: true,
  },
  async rewrites() {
    const backendUrl = process.env.BACKEND_API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    return [
      {
        source: '/api/documentation',
        destination: `${backendUrl}/api/documentation`,
      },
      {
        source: '/api/documentation/:path*',
        destination: `${backendUrl}/api/documentation/:path*`,
      },
    ];
  },
};

export default nextConfig;
