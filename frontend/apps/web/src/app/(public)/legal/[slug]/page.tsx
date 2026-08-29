import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BreadcrumbJsonLd } from "@/components/seo/BreadcrumbJsonLd";
import { getLegalSection, LEGAL_PAGE_SLUGS } from "@/lib/content/legal";
import { localizeLegalPage, parseLegalBody } from "@/lib/content/legal-localizations";
import { getServerSelectedLanguage } from "@/lib/i18n/server-language";
import { translateTextCore } from "@/lib/i18n/translation-core";
import type { LanguageCode } from "@/lib/i18n/locales";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export const revalidate = 0;
export const dynamic = "force-dynamic";
export const dynamicParams = false;

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

export async function generateStaticParams() {
  return LEGAL_PAGE_SLUGS.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const language = await getServerSelectedLanguage();
  let section;
  try {
    section = await getLegalSection(slug);
  } catch {
    section = undefined;
  }

  if (!section) {
    return {
      title: "Không tìm thấy chính sách",
      description: "Trang chính sách này chưa tồn tại trên Vietyoru.",
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  section = localizeLegalPage(section, language);

  return {
    title: section.title,
    description: section.excerpt || section.title,
    alternates: {
      canonical: `/legal/${section.slug}`,
    },
    robots: {
      index: !section.noindex,
      follow: !section.noindex,
    },
  };
}

export default async function LegalDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const language = await getServerSelectedLanguage();
  const sourceSection = await getLegalSection(slug);

  if (!sourceSection) notFound();

  const section = localizeLegalPage(sourceSection, language);
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
          { name: section.title, path: `/legal/${section.slug}` },
        ]}
        idPath={`/legal/${section.slug}`}
      />
      <article style={{ maxWidth: "860px", margin: "0 auto" }}>
        <nav
          aria-label="Breadcrumb"
          style={{ marginBottom: "18px", color: "var(--vy-muted)", fontSize: "13px", fontWeight: 700 }}
        >
          <Link href="/" style={{ color: "var(--vy-muted)", textDecoration: "none" }}>
            {homeLabel}
          </Link>
          <span aria-hidden="true"> / </span>
          <Link href="/legal" style={{ color: "var(--vy-gold)", textDecoration: "none" }}>
            {legalLabel}
          </Link>
        </nav>

        <header>
          <h1
            style={{
              margin: 0,
              fontSize: "clamp(34px, 6vw, 58px)",
              lineHeight: 1.04,
              fontWeight: 950,
              letterSpacing: 0,
            }}
          >
            {section.title}
          </h1>
          <div style={{ marginTop: "14px", color: "var(--vy-muted)", fontSize: "12.5px", fontWeight: 800 }}>
            {updatedLabel}: {formatDate(section.updatedAt, language)}
          </div>
        </header>

        <div style={{ display: "grid", gap: "24px", marginTop: "28px" }}>
          {section.sections.map((item, index) => {
            const body = parseLegalBody(item.body);

            return (
              <section key={item.heading}>
                <h2 style={{ margin: 0, fontSize: "23px", lineHeight: 1.25, fontWeight: 900 }}>
                  {index + 1}. {item.heading}
                </h2>
                <div
                  style={{
                    marginTop: "10px",
                    color: "var(--vy-text-2)",
                    fontSize: "16px",
                    lineHeight: 1.75,
                  }}
                >
                  {body.paragraphs.map((paragraph) => (
                    <p key={paragraph} style={{ margin: "0 0 8px" }}>
                      {paragraph}
                    </p>
                  ))}
                  {body.bullets.length ? (
                    <ul
                      style={{
                        display: "grid",
                        gap: "6px",
                        margin: body.paragraphs.length ? "4px 0 0" : 0,
                        paddingInlineStart: "1.35em",
                      }}
                    >
                      {body.bullets.map((bullet) => (
                        <li key={bullet}>{bullet}</li>
                      ))}
                    </ul>
                  ) : null}
                </div>
              </section>
            );
          })}
        </div>
      </article>
    </main>
  );
}
