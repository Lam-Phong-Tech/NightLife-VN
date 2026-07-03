import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";
import { SiteChrome } from "@/components/layout/SiteChrome";
import { SocketProvider } from "@/components/providers/SocketProvider";
import { jsonLdGraph, organizationJsonLd } from "@/lib/seo/structured-data";
import { siteConfig } from "@/lib/site";

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: `${siteConfig.name} | ${siteConfig.tagline}`,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  openGraph: {
    siteName: siteConfig.name,
    title: `${siteConfig.name} | ${siteConfig.tagline}`,
    description: siteConfig.description,
    locale: "vi_VN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: `${siteConfig.name} | ${siteConfig.tagline}`,
    description: siteConfig.description,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <head>
        <Script src="/shared.js" strategy="beforeInteractive" />
        <Script src="/theme.js" strategy="beforeInteractive" />
        <Script src="/support.js" strategy="beforeInteractive" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(jsonLdGraph([organizationJsonLd()])),
          }}
        />
      </head>
      <body suppressHydrationWarning>
        <SocketProvider>
          <SiteChrome>{children}</SiteChrome>
        </SocketProvider>
      </body>
    </html>
  );
}
