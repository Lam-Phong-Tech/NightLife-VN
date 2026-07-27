import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BreadcrumbJsonLd } from "@/components/seo/BreadcrumbJsonLd";
import {
  getLegalSection,
  getPublishedLegalSections,
  legalPlaceholderNotice,
} from "@/lib/content/legal";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export const revalidate = 300;
export const dynamicParams = false;

const formatDate = (value: string) =>
  new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(value));

export async function generateStaticParams() {
  const legalSections = await getPublishedLegalSections();
  return legalSections.map((section) => ({ slug: section.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const section = await getLegalSection(slug);

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

  return {
    title: section.title,
    description: section.description,
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
  const section = await getLegalSection(slug);

  if (!section) notFound();

  return (
    <main
      style={{
        minHeight: "auto",
        background: "var(--vy-bg)",
        color: "var(--vy-text)",
        padding: "clamp(22px, 5vw, 56px) clamp(16px, 5vw, 48px) clamp(24px, 4vw, 34px)",
      }}
    >
      <BreadcrumbJsonLd
        items={[
          { name: "Trang chủ", path: "/" },
          { name: "Pháp lý", path: "/legal" },
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
            Trang chủ
          </Link>
          <span aria-hidden="true"> / </span>
          <Link href="/legal" style={{ color: "var(--vy-gold)", textDecoration: "none" }}>
            Pháp lý
          </Link>
        </nav>

        <header>
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
            Placeholder
          </p>
          <h1
            style={{
              margin: "8px 0 0",
              fontSize: "clamp(34px, 6vw, 58px)",
              lineHeight: 1.04,
              fontWeight: 950,
              letterSpacing: 0,
            }}
          >
            {section.title}
          </h1>
          <p style={{ margin: "14px 0 0", color: "var(--vy-text-2)", fontSize: "16px", lineHeight: 1.75 }}>
            {section.description}
          </p>
          <div style={{ marginTop: "14px", color: "var(--vy-muted)", fontSize: "12.5px", fontWeight: 800 }}>
            Cập nhật: {formatDate(section.updatedAt)}
          </div>
        </header>

        <aside
          style={{
            marginTop: "24px",
            border: "1px solid var(--vy-border-gold-32)",
            borderRadius: "8px",
            background: "var(--vy-gold-soft-bg)",
            color: "var(--vy-text-2)",
            padding: "16px 18px",
            lineHeight: 1.65,
          }}
        >
          {legalPlaceholderNotice}
        </aside>

        <div style={{ display: "grid", gap: "24px", marginTop: "28px" }}>
          {section.items.map((item, index) => (
            <section key={item.heading}>
              <h2 style={{ margin: 0, fontSize: "23px", lineHeight: 1.25, fontWeight: 900 }}>
                {index + 1}. {item.heading}
              </h2>
              <p
                style={{ margin: "10px 0 0", color: "var(--vy-text-2)", fontSize: "16px", lineHeight: 1.85 }}
              >
                {item.body}
              </p>
            </section>
          ))}
        </div>
      </article>
    </main>
  );
}
