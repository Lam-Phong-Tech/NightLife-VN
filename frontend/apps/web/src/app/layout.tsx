import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ClientLanguageTranslator } from "@/components/i18n/ClientLanguageTranslator";
import { PublicTranslationFallback } from "@/components/i18n/PublicTranslationFallback";
import { SiteChrome } from "@/components/layout/SiteChrome";
import { AppearanceFavicon } from "@/components/providers/AppearanceFavicon";
import { CurrencyProvider } from "@/components/providers/CurrencyProvider";
import { SocketProvider } from "@/components/providers/SocketProvider";
import { GoogleAnalytics } from "@/components/seo/GoogleAnalytics";
import { jsonLdDocument, organizationJsonLd, websiteJsonLd } from "@/lib/seo/structured-data";
import { SITE_FAVICON_URL } from "@/lib/appearance-favicon";
import { siteConfig } from "@/lib/site";
import { headers } from "next/headers";
import { getNightlifeHostKind } from "@/lib/auth/hosts";
import { isLanguageCode, languageHtmlLang } from "@/lib/i18n/locales";

// Font Inter được next/font tự download lúc build — self-hosted cùng origin, không còn
// DNS lookup / request chặn render tới fonts.googleapis.com (~750ms).
// Load 4 weights thiết yếu (400/500/600/700), bỏ 300/800/900 ít dùng.
// Giảm file WOFF2 Vietnamese từ ~86 KiB (7 weights) xuống ~49 KiB (~43% nhỏ hơn).
const inter = Inter({
  subsets: ["vietnamese"],
  weight: "variable",
  display: "swap",
  variable: "--font-inter",
  preload: true,
});

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
  verification: {
    google:
      process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION ||
      "k2G7d4aXbHBXvPwmwAcrbROHHxhC8rCVvUvvpjUAiK4",
  },
};

/* Bill-upload CSS is route-scoped in gui-hoa-don and partner.
const criticalBillUploadStyles = `
  .nl-bill-page,
  .nl-bill-page .nl-bill-shell,
  .nl-bill-page .nl-bill-layout,
  .nl-bill-page .nl-bill-form,
  .nl-bill-page .nl-linked-booking,
  .nl-bill-page .nl-receipt-ticket,
  .nl-bill-page .nl-receipt-header,
  .nl-bill-page .nl-receipt-body,
  .nl-bill-page .nl-receipt-row,
  .nl-bill-page .nl-field,
  .nl-bill-page .nl-upload-zone-wrapper,
  .nl-bill-page .nl-upload-preview-card,
  .nl-bill-page .nl-preview-info,
  .nl-bill-page .nl-preview-actions {
    box-sizing: border-box !important;
    min-width: 0 !important;
    max-width: 100% !important;
  }

  .nl-bill-page,
  .nl-bill-page .nl-bill-shell,
  .nl-bill-page .nl-bill-layout {
    overflow-x: clip !important;
  }

  .nl-bill-page .nl-bill-form,
  .nl-bill-page .nl-receipt-ticket,
  .nl-bill-page .nl-upload-zone-wrapper,
  .nl-bill-page .nl-upload-preview-card {
    width: 100% !important;
    overflow: hidden !important;
  }

  .nl-bill-page .nl-receipt-store {
    min-width: 0 !important;
    max-width: 100% !important;
    overflow-wrap: anywhere !important;
    word-break: break-word !important;
  }

  .nl-bill-page .nl-receipt-label {
    min-width: 0 !important;
    max-width: 42% !important;
    flex: 0 1 auto !important;
  }

  .nl-bill-page .nl-receipt-line {
    min-width: 0 !important;
    flex: 1 1 10px !important;
  }

  .nl-bill-page .nl-receipt-value,
  .nl-bill-page .nl-receipt-value-wrap {
    min-width: 0 !important;
    max-width: 58% !important;
    flex: 0 1 58% !important;
    white-space: normal !important;
    overflow: hidden !important;
    overflow-wrap: anywhere !important;
    word-break: break-word !important;
    text-align: right !important;
    line-height: 1.35 !important;
  }

  .nl-bill-page .nl-preview-info {
    flex: 1 1 0 !important;
    width: 0 !important;
    overflow: hidden !important;
  }

  .nl-bill-page .nl-preview-filename {
    display: block !important;
    width: 100% !important;
    min-width: 0 !important;
    max-width: 100% !important;
    overflow: hidden !important;
    text-overflow: ellipsis !important;
    white-space: nowrap !important;
  }

  @media (max-width: 620px) {
    .nl-bill-page .nl-receipt-row {
      display: grid !important;
      grid-template-columns: minmax(0, 40%) minmax(8px, 1fr) minmax(0, 55%) !important;
      align-items: center !important;
      column-gap: 8px !important;
      width: 100% !important;
    }

    .nl-bill-page .nl-receipt-label {
      grid-column: 1 !important;
      max-width: 100% !important;
    }

    .nl-bill-page .nl-receipt-line {
      grid-column: 2 !important;
      width: 100% !important;
      margin: 0 !important;
    }

    .nl-bill-page .nl-receipt-value,
    .nl-bill-page .nl-receipt-value-wrap,
    .nl-bill-page .nl-status-tag {
      grid-column: 3 !important;
      width: auto !important;
      min-width: 0 !important;
      max-width: 100% !important;
      justify-self: end !important;
    }

    .nl-bill-page .nl-upload-preview-card {
      display: grid !important;
      grid-template-columns: 48px minmax(0, 1fr) !important;
      grid-template-areas: "thumb info" "actions actions" !important;
      align-items: center !important;
      gap: 10px 12px !important;
    }

    .nl-bill-page .nl-preview-thumb-container,
    .nl-bill-page .nl-preview-file-icon {
      grid-area: thumb !important;
    }

    .nl-bill-page .nl-preview-info {
      grid-area: info !important;
      width: 100% !important;
    }

    .nl-bill-page .nl-preview-actions {
      grid-area: actions !important;
      display: grid !important;
      grid-template-columns: minmax(0, 1fr) auto !important;
      gap: 8px !important;
      width: 100% !important;
    }

    .nl-bill-page .nl-ocr-btn-premium,
    .nl-bill-page .nl-delete-file-btn {
      min-width: 0 !important;
      max-width: 100% !important;
      justify-content: center !important;
    }

    .nl-bill-page .nl-ocr-btn-premium span,
    .nl-bill-page .nl-delete-file-btn span {
      min-width: 0 !important;
      overflow: hidden !important;
      text-overflow: ellipsis !important;
      white-space: nowrap !important;
    }
  }
`;
void criticalBillUploadStyles;
*/

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
    <html
      lang={languageHtmlLang[documentLanguage]}
      className={inter.variable}
      suppressHydrationWarning
    >
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
                  if (t === 'light') {
                    document.documentElement.classList.add(isAdmin ? 'vy-admin-light' : 'vy-light');
                  } else if (t === 'dark') {
                    document.documentElement.classList.remove(isAdmin ? 'vy-admin-light' : 'vy-light');
                  }
                } catch (e) { /* private mode */ }
              })();
            `,
          }}
        />
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
        <AppearanceFavicon />
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
