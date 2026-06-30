import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";
import { SiteChrome } from "@/components/layout/SiteChrome";
import { SocketProvider } from "@/components/providers/SocketProvider";

// metadata: Next.js đọc object này để sinh ra thẻ <title>, <meta> trong <head>.
// Đây là tính năng của App Router (không cần tự viết thẻ <head>).
export const metadata: Metadata = {
  title: "NightLife VN",
  description: "Khám phá nhịp sống về đêm tại Việt Nam",
};

// RootLayout bọc TOÀN BỘ ứng dụng. Mọi page sẽ được render vào {children}.
// Đây là Server Component (mặc định trong App Router) — chạy trên server.
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <head>
        <Script src="/shared.js" strategy="beforeInteractive" />
        <Script src="/theme.js" strategy="beforeInteractive" />
        <Script src="/support.js" strategy="beforeInteractive" />
      </head>
      <body>
        <SocketProvider>
          <SiteChrome>{children}</SiteChrome>
        </SocketProvider>
      </body>
    </html>
  );
}
