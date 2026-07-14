import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { SystemStatusPage } from "@/components/ui/SystemStatusPage";
import { articleJsonLd, breadcrumbJsonLd, jsonLdGraph } from "@/lib/seo/structured-data";
import { getBlogPost, getPublishedBlogPosts } from "@/lib/content/blog";
import { absoluteSiteUrl } from "@/lib/site";

type PageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ preview?: string }>;
};

const formatDate = (value: string) =>
  new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(value));

export async function generateMetadata({ params, searchParams }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const { preview } = await searchParams;
  const isPreview = preview === "1";
  const post = await getBlogPost(slug, { preview: isPreview });

  if (!post) {
    return {
      title: "Không tìm thấy bài viết",
      description: "Bài viết này chưa tồn tại hoặc đã được gỡ khỏi Vietyoru.",
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  const canonical = `/blog/${post.slug}`;

  return {
    title: post.title,
    description: post.description,
    alternates: {
      canonical,
      languages: {
        vi: canonical,
        "x-default": canonical,
      },
    },
    robots: post.noindex
      ? {
          index: false,
          follow: false,
        }
      : undefined,
    openGraph: {
      title: `${post.title} | Vietyoru`,
      description: post.description,
      type: "article",
      url: absoluteSiteUrl(canonical),
      publishedTime: post.publishedAt,
      modifiedTime: post.updatedAt,
      authors: [post.author],
      tags: post.tags,
      images: [{ url: post.image, alt: post.imageAlt }],
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.description,
      images: [post.image],
    },
  };
}

export default async function BlogDetailPage({ params, searchParams }: PageProps) {
  const { slug } = await params;
  const { preview } = await searchParams;
  const isPreview = preview === "1";
  const post = await getBlogPost(slug, { preview: isPreview });

  if (!post) return <SystemStatusPage kind="not-found" />;

  const allPosts = await getPublishedBlogPosts();
  const relatedPosts = allPosts
    .filter((item) => item.slug !== post.slug && !item.noindex)
    .filter((item) => item.category === post.category || item.tags.some((tag) => post.tags.includes(tag)))
    .slice(0, 3);
  const structuredData = jsonLdGraph([
    articleJsonLd(post),
    breadcrumbJsonLd(
      [
        { name: "Trang chủ", path: "/" },
        { name: "Blog", path: "/blog" },
        { name: post.title, path: `/blog/${post.slug}` },
      ],
      `/blog/${post.slug}`,
    ),
  ]);

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "var(--vy-bg)",
        color: "var(--vy-text)",
        padding: "clamp(20px, 5vw, 54px) clamp(16px, 5vw, 48px)",
      }}
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      <article style={{ maxWidth: "980px", margin: "0 auto" }}>
        <nav style={{ marginBottom: "18px", color: "var(--vy-muted)", fontSize: "13px", fontWeight: 700 }}>
          <Link href="/" style={{ color: "var(--vy-muted)", textDecoration: "none" }}>
            Trang chủ
          </Link>
          <span aria-hidden="true"> / </span>
          <Link href="/blog" style={{ color: "var(--vy-gold)", textDecoration: "none" }}>
            Blog
          </Link>
        </nav>

        <header>
          <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
            <span
              style={{
                display: "inline-flex",
                borderRadius: "999px",
                padding: "6px 11px",
                background: "var(--vy-gold-soft-bg)",
                border: "1px solid var(--vy-border-gold-32)",
                color: "var(--vy-gold-pale)",
                fontSize: "11px",
                fontWeight: 900,
              }}
            >
              {post.category}
            </span>
            {post.status === "DRAFT" && (
              <span
                style={{
                  display: "inline-flex",
                  borderRadius: "999px",
                  padding: "6px 11px",
                  background: "rgba(239, 68, 68, 0.15)",
                  border: "1px solid rgba(239, 68, 68, 0.3)",
                  color: "#fca5a5",
                  fontSize: "11px",
                  fontWeight: 900,
                }}
              >
                Nháp
              </span>
            )}
          </div>
          <h1
            style={{
              maxWidth: "860px",
              margin: "14px 0 0",
              fontSize: "clamp(34px, 6vw, 62px)",
              lineHeight: 1.03,
              letterSpacing: 0,
              fontWeight: 950,
            }}
          >
            {post.title}
          </h1>
          <p style={{ maxWidth: "760px", margin: "16px 0 0", color: "var(--vy-text-2)", fontSize: "17px", lineHeight: 1.72 }}>
            {post.description}
          </p>
          <div
            style={{
              display: "flex",
              gap: "10px",
              flexWrap: "wrap",
              marginTop: "16px",
              color: "var(--vy-muted)",
              fontSize: "12.5px",
              fontWeight: 800,
            }}
          >
            <span>{post.author}</span>
            <span aria-hidden="true">·</span>
            <time dateTime={post.publishedAt}>{formatDate(post.publishedAt)}</time>
            <span aria-hidden="true">·</span>
            <span>{post.readTime}</span>
          </div>
        </header>

        <div
          style={{
            position: "relative",
            minHeight: "clamp(260px, 48vw, 500px)",
            marginTop: "26px",
            borderRadius: "8px",
            border: "1px solid var(--vy-border-gold-22)",
            overflow: "hidden",
          }}
        >
          <Image
            src={post.image}
            alt={post.imageAlt}
            fill
            priority
            sizes="(max-width: 767px) 100vw, 980px"
            style={{ objectFit: "cover" }}
          />
          <span
            aria-hidden="true"
            style={{
              position: "absolute",
              inset: 0,
              background: "linear-gradient(180deg, transparent, rgba(0,0,0,0.6))",
            }}
          />
        </div>

        <div
          className="nl-blog-detail-layout"
          style={{
            display: "grid",
            gridTemplateColumns: "minmax(0, 1fr) minmax(220px, 280px)",
            gap: "clamp(22px, 5vw, 44px)",
            marginTop: "32px",
            alignItems: "start",
          }}
        >
          <div>
            {post.sections.map((section) => (
              <section key={section.heading} style={{ marginTop: "0", marginBottom: "28px" }}>
                <h2 style={{ margin: 0, fontSize: "24px", lineHeight: 1.24, fontWeight: 900 }}>
                  {section.heading}
                </h2>
                <div 
                  style={{ margin: "10px 0 0", color: "var(--vy-text-2)", fontSize: "16px", lineHeight: 1.85 }}
                  dangerouslySetInnerHTML={{ __html: section.body }}
                  className="nl-blog-body"
                />
              </section>
            ))}

            <aside
              style={{
                marginTop: "30px",
                border: "1px solid var(--vy-border-gold-22)",
                borderRadius: "8px",
                padding: "18px",
                background: "var(--vy-gold-soft-bg)",
                color: "var(--vy-gold-pale)",
                lineHeight: 1.65,
              }}
            >
              Giá, tình trạng bàn, cast và ưu đãi trong bài chỉ là tham khảo. Thông tin
              cuối cùng sẽ được admin xác nhận khi khách gửi yêu cầu đặt chỗ.
            </aside>
          </div>

          <aside
            className="nl-blog-related"
            aria-label="Bài liên quan"
            style={{
              position: "sticky",
              top: "110px",
              border: "1px solid var(--vy-border)",
              borderRadius: "8px",
              padding: "16px",
              background: "var(--vy-surface-1)",
            }}
          >
            <h2 style={{ margin: 0, fontSize: "15px", fontWeight: 900 }}>Bài liên quan</h2>
            <div style={{ display: "grid", gap: "12px", marginTop: "14px" }}>
              {relatedPosts.map((item) => (
                <Link
                  key={item.slug}
                  href={`/blog/${item.slug}`}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "64px minmax(0, 1fr)",
                    gap: "10px",
                    alignItems: "center",
                    color: "inherit",
                    textDecoration: "none",
                  }}
                >
                  <span
                    aria-hidden="true"
                    style={{
                      position: "relative",
                      width: "64px",
                      height: "64px",
                      borderRadius: "8px",
                      overflow: "hidden",
                    }}
                  >
                    <Image
                      src={item.image}
                      alt=""
                      fill
                      sizes="64px"
                      style={{ objectFit: "cover" }}
                    />
                  </span>
                  <span style={{ minWidth: 0 }}>
                    <strong style={{ display: "block", fontSize: "13px", lineHeight: 1.35 }}>
                      {item.title}
                    </strong>
                    <small style={{ display: "block", marginTop: "4px", color: "var(--vy-muted)", fontWeight: 700 }}>
                      {item.readTime}
                    </small>
                  </span>
                </Link>
              ))}
            </div>
          </aside>
        </div>
      </article>
    </main>
  );
}
