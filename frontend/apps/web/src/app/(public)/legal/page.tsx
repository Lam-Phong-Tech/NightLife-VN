import type { Metadata } from "next";
import Link from "next/link";
import { BreadcrumbJsonLd } from "@/components/seo/BreadcrumbJsonLd";
import { getPublishedLegalSections, legalPageDescription } from "@/lib/content/legal";
import { localizeLegalPage } from "@/lib/content/legal-localizations";
import { getServerSelectedLanguage } from "@/lib/i18n/server-language";
import { translateTextCore } from "@/lib/i18n/translation-core";
import type { LanguageCode } from "@/lib/i18n/locales";

export const revalidate = 0;
export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  let shouldNoindex = true;
  try {
    const legalSections = await getPublishedLegalSections();
    shouldNoindex = legalSections.length === 0 || legalSections.some((section) => section.noindex);
  } catch {
    // Metadata must remain build-safe when the backend is unavailable.
  }

  return {
    title: "Pháp lý và chính sách",
    description:
      "Các trang chính sách của Vietyoru: bảo mật, điều khoản sử dụng và chính sách hoạt động.",
    alternates: {
      canonical: "/legal",
    },
    robots: {
      index: !shouldNoindex,
      follow: !shouldNoindex,
    },
  };
}

const dateLocale: Record<LanguageCode, string> = {
  vi: "vi-VN",
  en: "en-US",
  ja: "ja-JP",
  ko: "ko-KR",
  zh: "zh-CN",
};

const formatDate = (value: string, language: LanguageCode) =>
  new Intl.DateTimeFormat(dateLocale[language], {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(value));

export default async function LegalPage() {
  const language = await getServerSelectedLanguage();
  const legalSections = (await getPublishedLegalSections()).map((section) =>
    localizeLegalPage(section, language),
  );
  const homeLabel = translateTextCore("Trang chủ", language);
  const legalLabel = translateTextCore("Pháp lý", language);
  const updatedLabel = translateTextCore("Cập nhật", language);

  return (
    <main
      className="notranslate"
      translate="no"
      data-no-translate="true"
      style={{
        minHeight: "auto",
        background: "var(--vy-bg)",
        color: "var(--vy-text)",
        padding: "clamp(22px, 5vw, 56px) clamp(16px, 5vw, 48px) clamp(24px, 4vw, 34px)",
      }}
    >
      <BreadcrumbJsonLd
        items={[
          { name: homeLabel, path: "/" },
          { name: legalLabel, path: "/legal" },
        ]}
        idPath="/legal"
      />
      <section style={{ maxWidth: "1060px", margin: "0 auto" }}>
        <p
          style={{
            margin: 0,
            color: "var(--vy-gold)",
            fontSize: "12px",
            fontWeight: 850,
            letterSpacing: "1.8px",
            textTransform: "uppercase",
          }}
        >
          {legalLabel}
        </p>
        <h1
          style={{
            margin: "8px 0 0",
            maxWidth: "760px",
            fontSize: "clamp(34px, 6vw, 58px)",
            lineHeight: 1.04,
            fontWeight: 950,
            letterSpacing: 0,
          }}
        >
          {translateTextCore("Pháp lý và chính sách vận hành", language)}
        </h1>
        <p style={{ maxWidth: "740px", margin: "16px 0 0", color: "var(--vy-text-2)", fontSize: "16px", lineHeight: 1.75 }}>
          {legalPageDescription[language]}
        </p>

        <section
          aria-label="Danh sách chính sách"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
            gap: "14px",
            marginTop: "28px",
          }}
        >
          {legalSections.map((section) => (
            <Link
              key={section.slug}
              href={`/legal/${section.slug}`}
              style={{
                color: "inherit",
                textDecoration: "none",
                border: "1px solid var(--vy-border-gold-22)",
                borderRadius: "8px",
                background: "var(--vy-surface)",
                padding: "18px",
              }}
            >
              <h2 style={{ margin: 0, fontSize: "20px", lineHeight: 1.25, fontWeight: 900 }}>
                {section.title}
              </h2>
              <p style={{ margin: "10px 0 0", color: "var(--vy-text-2)", fontSize: "14px", lineHeight: 1.65 }}>
                {section.excerpt || section.title}
              </p>
              <div style={{ marginTop: "14px", color: "var(--vy-muted)", fontSize: "12px", fontWeight: 800 }}>
                {updatedLabel}: {formatDate(section.updatedAt, language)}
              </div>
            </Link>
          ))}
        </section>

      </section>
    </main>
  );
}
