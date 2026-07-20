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

const formatDateTime = (value: string) =>
  new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Ho_Chi_Minh",
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
  const latestPosts = allPosts
    .filter((item) => item.slug !== post.slug && !item.noindex)
    .sort(
      (first, second) => new Date(second.createdAt).getTime() - new Date(first.createdAt).getTime(),
    )
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
        minHeight: "auto",
        background: "var(--vy-bg)",
        color: "var(--vy-text)",
        padding: "clamp(20px, 5vw, 54px) clamp(16px, 5vw, 48px) clamp(24px, 4vw, 34px)",
      }}
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      <article style={{ width: "100%", maxWidth: "980px", minWidth: 0, margin: "0 auto" }}>
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
              overflowWrap: "anywhere",
              wordBreak: "break-word",
            }}
          >
            {post.title}
          </h1>
          <p
            style={{
              maxWidth: "760px",
              margin: "16px 0 0",
              color: "var(--vy-text-2)",
              fontSize: "17px",
              lineHeight: 1.72,
              overflowWrap: "anywhere",
              wordBreak: "break-word",
            }}
          >
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
            <time dateTime={post.createdAt}>{formatDateTime(post.createdAt)}</time>
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
          <div style={{ minWidth: 0 }}>
            {post.sections.map((section) => (
              <section key={section.heading} style={{ marginTop: "0", marginBottom: "28px" }}>
                <h2
                  style={{
                    margin: 0,
                    fontSize: "24px",
                    lineHeight: 1.24,
                    fontWeight: 900,
                    overflowWrap: "anywhere",
                    wordBreak: "break-word",
                  }}
                >
                  {section.heading}
                </h2>
                <div
                  style={{
                    margin: "10px 0 0",
                    color: "var(--vy-text-2)",
                    fontSize: "16px",
                    lineHeight: 1.85,
                    maxWidth: "100%",
                    overflowWrap: "anywhere",
                    wordBreak: "break-word",
                  }}
                  dangerouslySetInnerHTML={{ __html: section.body }}
                  className="nl-blog-body"
                />
              </section>
            ))}
          </div>

          <aside
            className="nl-blog-related"
            aria-label="Bài viết mới nhất"
            style={{
              position: "sticky",
              top: "110px",
              border: "1px solid var(--vy-border)",
              borderRadius: "8px",
              padding: "16px",
              background: "var(--vy-surface-1)",
            }}
          >
            <h2 style={{ margin: 0, fontSize: "15px", fontWeight: 900 }}>Bài viết mới nhất</h2>
            <div style={{ display: "grid", gap: "12px", marginTop: "14px" }}>
              {latestPosts.map((item) => (
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
                    <time
                      dateTime={item.createdAt}
                      style={{
                        display: "block",
                        marginTop: "4px",
                        color: "var(--vy-muted)",
                        fontSize: "12px",
                        fontWeight: 700,
                      }}
                    >
                      {formatDateTime(item.createdAt)}
                    </time>
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
