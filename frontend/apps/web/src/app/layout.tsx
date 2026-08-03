import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";
import { ClientLanguageTranslator } from "@/components/i18n/ClientLanguageTranslator";
import { PublicTranslationFallback } from "@/components/i18n/PublicTranslationFallback";
import { SiteChrome } from "@/components/layout/SiteChrome";
import { CurrencyProvider } from "@/components/providers/CurrencyProvider";
import { SocketProvider } from "@/components/providers/SocketProvider";
import { GoogleAnalytics } from "@/components/seo/GoogleAnalytics";
import { jsonLdDocument, organizationJsonLd, websiteJsonLd } from "@/lib/seo/structured-data";
import { SITE_FAVICON_URL } from "@/lib/appearance-favicon";
import { siteConfig } from "@/lib/site";
import { headers } from "next/headers";
import { getNightlifeHostKind } from "@/lib/auth/hosts";
import {
  isLanguageCode,
  languageHtmlLang,
} from "@/lib/i18n/locales";

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  applicationName: siteConfig.name,
  title: {
    default: `${siteConfig.name} | ${siteConfig.tagline}`,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  icons: {
    icon: [{ url: SITE_FAVICON_URL }],
  },
  manifest: "/site.webmanifest",
  openGraph: {
    siteName: siteConfig.name,
    title: `${siteConfig.name} | ${siteConfig.tagline}`,
    description: siteConfig.description,
    locale: "vi_VN",
    type: "website",
    images: [
      {
        url: "/seo/og-cover-bar-1200x630.jpg",
        width: 1200,
        height: 630,
        alt: "Không gian quầy bar về đêm tại Vietyoru",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${siteConfig.name} | ${siteConfig.tagline}`,
    description: siteConfig.description,
    images: ["/seo/og-cover-bar-1200x630.jpg"],
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const headersList = await headers();
  const hostHeader = headersList.get("host") || "";
  const hostKind = getNightlifeHostKind(hostHeader);
  const requestedLocale = headersList.get("x-vietyoru-locale");
  const documentLanguage = isLanguageCode(requestedLocale) ? requestedLocale : "vi";

  return (
    <html lang={languageHtmlLang[documentLanguage]} suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function () {
                try {
                  var host = window.location.hostname.toLowerCase();
                  var isAdmin = window.location.pathname.startsWith('/admin') || host.startsWith('admin.');
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
        <ClientLanguageTranslator hostKind={hostKind}>
          <PublicTranslationFallback hostKind={hostKind} />
          <CurrencyProvider>
            <SocketProvider>
              <SiteChrome hostKind={hostKind}>{children}</SiteChrome>
            </SocketProvider>
          </CurrencyProvider>
        </ClientLanguageTranslator>
      </body>
    </html>
  );
}
