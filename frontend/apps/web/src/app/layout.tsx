import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";
import { Geist } from "next/font/google";
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});


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
    <html lang="vi" className={cn("font-sans", geist.variable)}>
      <head>
        <Script src="/shared.js" strategy="beforeInteractive" />
        <Script src="/theme.js" strategy="beforeInteractive" />
        <Script src="/support.js" strategy="beforeInteractive" />
      </head>
      <body>{children}</body>
    </html>
  );
}
