import type { Metadata } from "next";
import Link from "next/link";
import { BreadcrumbJsonLd } from "@/components/seo/BreadcrumbJsonLd";
import { getPublishedLegalSections, legalPlaceholderNotice } from "@/lib/content/legal";

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

const formatDate = (value: string) =>
  new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(value));

export default async function LegalPage() {
  const legalSections = await getPublishedLegalSections();

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
          Legal
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
          Pháp lý và chính sách vận hành
        </h1>
        <p style={{ maxWidth: "740px", margin: "16px 0 0", color: "var(--vy-text-2)", fontSize: "16px", lineHeight: 1.75 }}>
          {legalPlaceholderNotice}
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
                Cập nhật: {formatDate(section.updatedAt)}
              </div>
            </Link>
          ))}
        </section>

      </section>
    </main>
  );
}
