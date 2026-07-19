import type { Metadata } from "next";
import Link from "next/link";
import { getPublishedLegalSections, legalPlaceholderNotice } from "@/lib/content/legal";

export async function generateMetadata(): Promise<Metadata> {
  const legalSections = await getPublishedLegalSections();
  const shouldNoindex = legalSections.length === 0 || legalSections.some((section) => section.noindex);

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
        background: "#0c0c0f",
        color: "#f3f0ea",
        padding: "clamp(22px, 5vw, 56px) clamp(16px, 5vw, 48px) clamp(24px, 4vw, 34px)",
      }}
    >
      <section style={{ maxWidth: "1060px", margin: "0 auto" }}>
        <p
          style={{
            margin: 0,
            color: "#d4b26a",
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
        <p style={{ maxWidth: "740px", margin: "16px 0 0", color: "#c5c0b6", fontSize: "16px", lineHeight: 1.75 }}>
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
                border: "1px solid rgba(212,178,106,.22)",
                borderRadius: "8px",
                background: "rgba(255,255,255,.04)",
                padding: "18px",
              }}
            >
              <h2 style={{ margin: 0, fontSize: "20px", lineHeight: 1.25, fontWeight: 900 }}>
                {section.title}
              </h2>
              <p style={{ margin: "10px 0 0", color: "#c5c0b6", fontSize: "14px", lineHeight: 1.65 }}>
                {section.description}
              </p>
              <div style={{ marginTop: "14px", color: "#8c8679", fontSize: "12px", fontWeight: 800 }}>
                Cập nhật: {formatDate(section.updatedAt)}
              </div>
            </Link>
          ))}
        </section>

        <section
          style={{
            marginTop: "30px",
            border: "1px solid rgba(255,255,255,.1)",
            borderRadius: "8px",
            padding: "clamp(18px, 4vw, 28px)",
            background: "rgba(255,255,255,.035)",
          }}
        >
          <h2 style={{ margin: 0, fontSize: "24px", lineHeight: 1.25, fontWeight: 900 }}>
            Tóm tắt placeholder
          </h2>
          <div style={{ display: "grid", gap: "18px", marginTop: "18px" }}>
            {legalSections.map((section) => (
              <section key={section.slug}>
                <h3 style={{ margin: 0, color: "#f0dda8", fontSize: "17px", fontWeight: 900 }}>
                  {section.title}
                </h3>
                <p style={{ margin: "8px 0 0", color: "#d7d0c3", fontSize: "15px", lineHeight: 1.75 }}>
                  {section.items[0]?.body}
                </p>
              </section>
            ))}
          </div>
        </section>
      </section>
    </main>
  );
}
