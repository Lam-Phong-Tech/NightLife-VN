import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";
import { ClientLanguageTranslator } from "@/components/i18n/ClientLanguageTranslator";
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
    locale: "ja_JP",
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
    <html lang="ja" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function () {
                try {
                  var isAdmin = window.location.pathname.startsWith('/admin');
                  var key = isAdmin ? 'vy-admin-theme' : 'vy-user-theme';
                  var t = localStorage.getItem(key);
                  if (t === 'light') document.documentElement.classList.add(isAdmin ? 'vy-admin-light' : 'vy-light');
                } catch (e) { /* private mode */ }
              })();
            `,
          }}
        />
        <Script src="/shared.js" strategy="beforeInteractive" />
        <Script src="/support.js" strategy="beforeInteractive" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(jsonLdGraph([organizationJsonLd()])),
          }}
        />
      </head>
      <body suppressHydrationWarning>
        <ClientLanguageTranslator>
          <SocketProvider>
            <SiteChrome>{children}</SiteChrome>
          </SocketProvider>
        </ClientLanguageTranslator>
      </body>
    </html>
  );
}
