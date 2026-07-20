import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";
import { ClientLanguageTranslator } from "@/components/i18n/ClientLanguageTranslator";
import { SiteChrome } from "@/components/layout/SiteChrome";
import { CurrencyProvider } from "@/components/providers/CurrencyProvider";
import { SocketProvider } from "@/components/providers/SocketProvider";
import { GoogleAnalytics } from "@/components/seo/GoogleAnalytics";
import { jsonLdDocument, organizationJsonLd, websiteJsonLd } from "@/lib/seo/structured-data";
import { siteConfig } from "@/lib/site";

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  applicationName: siteConfig.name,
  title: {
    default: `${siteConfig.name} | ${siteConfig.tagline}`,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  icons: {
    icon: [{ url: "/favicon.svg", type: "image/svg+xml" }],
    shortcut: [{ url: "/favicon.svg", type: "image/svg+xml" }],
  },
  manifest: "/site.webmanifest",
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
    <html lang="vi" className="notranslate" suppressHydrationWarning>
      <head>
        <meta name="google" content="notranslate" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function () {
                try {
                  var isAdmin = window.location.pathname.startsWith('/admin');
                  var key = isAdmin ? 'vy-admin-theme' : 'vy-user-theme';
                  var t = localStorage.getItem(key);
                  if (t === 'light') document.documentElement.classList.add(isAdmin ? 'vy-admin-light' : 'vy-light');
                  if (sessionStorage.getItem('vy-brand-intro-seen') === '1') {
                    document.documentElement.classList.add('nl-brand-intro-seen');
                  }
                } catch (e) { /* private mode */ }
              })();
            `,
          }}
        />
        <Script src="/shared.js" strategy="beforeInteractive" />
        <Script src="/support.js" strategy="beforeInteractive" />
        <script
          id="organization-jsonld"
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(jsonLdDocument(organizationJsonLd())),
          }}
        />
        <script
          id="website-jsonld"
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(jsonLdDocument(websiteJsonLd())),
          }}
        />
      </head>
      <body suppressHydrationWarning>
        <GoogleAnalytics />
        <ClientLanguageTranslator>
          <CurrencyProvider>
            <SocketProvider>
              <SiteChrome>{children}</SiteChrome>
            </SocketProvider>
          </CurrencyProvider>
        </ClientLanguageTranslator>
      </body>
    </html>
  );
}
