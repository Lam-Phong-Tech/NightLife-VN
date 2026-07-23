import type { NextConfig } from "next";

const readOrigin = (value: string | undefined) => {
  try {
    return value ? new URL(value).origin : null;
  } catch {
    return null;
  }
};

const configuredApiOrigin = (() => {
  return readOrigin(process.env.NEXT_PUBLIC_API_URL);
})();

const trustedPortalOrigins = Array.from(
  new Set(
    [
      "https://demonightlight.test9.io.vn",
      "https://partner.demonightlight.test9.io.vn",
      "https://admin.demonightlight.test9.io.vn",
      "https://auth.demonightlight.test9.io.vn",
      readOrigin(process.env.NEXT_PUBLIC_APP_URL),
      readOrigin(process.env.NEXT_PUBLIC_PARTNER_APP_URL),
      readOrigin(process.env.NEXT_PUBLIC_ADMIN_APP_URL),
      readOrigin(process.env.NEXT_PUBLIC_AUTH_APP_URL),
    ].filter((origin): origin is string => Boolean(origin)),
  ),
);

export function createContentSecurityPolicy(isProduction: boolean) {
  const scriptSources = [
    "'self'",
    "'unsafe-inline'",
    "https://accounts.google.com",
    "https://www.googletagmanager.com",
  ];
  const connectSources = [
    "'self'",
    "https://accounts.google.com",
    "https://www.googleapis.com",
    "https://*.google-analytics.com",
    "https://*.analytics.google.com",
    "https://*.googletagmanager.com",
    "https://open.er-api.com",
    "https://provinces.open-api.vn",
    "https://demonightlight.test9.io.vn",
    "https://*.demonightlight.test9.io.vn",
    "https://demonightlight.test9io.vn",
    "https://*.demonightlight.test9io.vn",
    "https://nightlife.lptech.info.vn",
    "https://vietoru.com",
    "https://www.vietoru.com",
    "wss:",
  ];

  if (configuredApiOrigin && !connectSources.includes(configuredApiOrigin)) {
    connectSources.push(configuredApiOrigin);
  }

  if (!isProduction) {
    scriptSources.push("'unsafe-eval'");
    connectSources.push(
      "http://localhost:*",
      "http://127.0.0.1:*",
      "ws://localhost:*",
      "ws://127.0.0.1:*",
    );
  }

  const directives = [
    "default-src 'self'",
    "base-uri 'self'",
    `connect-src ${connectSources.join(" ")}`,
    "font-src 'self' data: https://fonts.gstatic.com",
    `form-action 'self' ${trustedPortalOrigins.join(" ")}`,
    "frame-ancestors 'none'",
    [
      "frame-src 'self'",
      "https://accounts.google.com",
      "https://maps.google.com",
      "https://www.google.com",
      "https://www.youtube.com",
      "https://www.youtube-nocookie.com",
      "https://player.vimeo.com",
      "https://www.tiktok.com",
    ].join(" "),
    "img-src 'self' data: blob: https:",
    `manifest-src 'self' ${trustedPortalOrigins.join(" ")}`,
    "media-src 'self' blob: https:",
    "object-src 'none'",
    `script-src ${scriptSources.join(" ")}`,
    "script-src-attr 'none'",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "worker-src 'self' blob:",
  ];

  if (isProduction) {
    directives.push("upgrade-insecure-requests");
  }

  return directives.join("; ");
}

export function createSecurityHeaders(isProduction: boolean) {
  const headers = [
    {
      key: "Content-Security-Policy",
      value: createContentSecurityPolicy(isProduction),
    },
    { key: "X-Frame-Options", value: "DENY" },
    { key: "X-Content-Type-Options", value: "nosniff" },
    { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
    {
      key: "Permissions-Policy",
      value: "camera=(self), geolocation=(), microphone=()",
    },
  ];

  if (isProduction) {
    headers.push({
      key: "Strict-Transport-Security",
      value: "max-age=31536000; includeSubDomains; preload",
    });
  }

  return headers;
}

const nextConfig: NextConfig = {
  // Bật chế độ kiểm tra nghiêm của React: chạy một số logic 2 lần ở môi trường dev
  // để lộ ra các side-effect/bug tiềm ẩn. Không ảnh hưởng production.
  reactStrictMode: true,
  devIndicators: false,
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "img.icons8.com" },
      { protocol: "https", hostname: "api.qrserver.com" },
      { protocol: "https", hostname: "api.demonightlight.test9.io.vn" },
      { protocol: "https", hostname: "demonightlight.test9.io.vn" },
      { protocol: "https", hostname: "partner.demonightlight.test9.io.vn" },
      { protocol: "https", hostname: "admin.demonightlight.test9.io.vn" },
      { protocol: "https", hostname: "auth.demonightlight.test9.io.vn" },
      { protocol: "http", hostname: "localhost" },
      { protocol: "http", hostname: "127.0.0.1" },
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
        source: "/v",
        destination: "/",
        permanent: false,
      },
    ];
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: createSecurityHeaders(process.env.NODE_ENV === "production"),
      },
    ];
  },
  async rewrites() {
    return [
      {
        source: "/api/documentation",
        destination: "/api/backend/api/documentation",
      },
      {
        source: "/api/documentation/:path*",
        destination: "/api/backend/api/documentation/:path*",
      },
    ];
  },
};

export default nextConfig;
