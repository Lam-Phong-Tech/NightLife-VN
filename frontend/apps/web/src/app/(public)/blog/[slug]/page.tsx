import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { blogPosts, getBlogPost } from "@/lib/content/blog";
import { absoluteSiteUrl } from "@/lib/site";

type PageProps = {
  params: Promise<{ slug: string }>;
};

const formatDate = (value: string) =>
  new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(value));

export function generateStaticParams() {
  return blogPosts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = getBlogPost(slug);

  if (!post) {
    return {
      title: "Không tìm thấy bài viết",
      description: "Bài viết này chưa tồn tại hoặc đã được gỡ khỏi Vietyoru.",
    };
  }

  const canonical = `/blog/${post.slug}`;

  return {
    title: post.title,
    description: post.description,
    alternates: {
      canonical,
    },
    openGraph: {
      title: `${post.title} | Vietyoru`,
      description: post.description,
      type: "article",
      url: absoluteSiteUrl(canonical),
      publishedTime: post.date,
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

export default async function BlogDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const post = getBlogPost(slug);

  if (!post) notFound();

  const relatedPosts = blogPosts
    .filter((item) => item.slug !== post.slug)
    .filter((item) => item.category === post.category || item.tags.some((tag) => post.tags.includes(tag)))
    .slice(0, 3);

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#0c0c0f",
        color: "#f3f0ea",
        padding: "clamp(20px, 5vw, 54px) clamp(16px, 5vw, 48px)",
      }}
    >
      <article style={{ maxWidth: "980px", margin: "0 auto" }}>
        <nav style={{ marginBottom: "18px", color: "#8c8679", fontSize: "13px", fontWeight: 700 }}>
          <Link href="/" style={{ color: "#8c8679", textDecoration: "none" }}>
            Trang chủ
          </Link>
          <span aria-hidden="true"> / </span>
          <Link href="/blog" style={{ color: "#d4b26a", textDecoration: "none" }}>
            Blog
          </Link>
        </nav>

        <header>
          <span
            style={{
              display: "inline-flex",
              borderRadius: "999px",
              padding: "6px 11px",
              background: "rgba(212,178,106,.14)",
              border: "1px solid rgba(212,178,106,.32)",
              color: "#f0dda8",
              fontSize: "11px",
              fontWeight: 900,
            }}
          >
            {post.category}
          </span>
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
          <p style={{ maxWidth: "760px", margin: "16px 0 0", color: "#c5c0b6", fontSize: "17px", lineHeight: 1.72 }}>
            {post.description}
          </p>
          <div
            style={{
              display: "flex",
              gap: "10px",
              flexWrap: "wrap",
              marginTop: "16px",
              color: "#8c8679",
              fontSize: "12.5px",
              fontWeight: 800,
            }}
          >
            <span>{post.author}</span>
            <span aria-hidden="true">·</span>
            <time dateTime={post.date}>{formatDate(post.date)}</time>
            <span aria-hidden="true">·</span>
            <span>{post.readTime}</span>
          </div>
        </header>

        <div
          role="img"
          aria-label={post.imageAlt}
          style={{
            minHeight: "clamp(260px, 48vw, 500px)",
            marginTop: "26px",
            borderRadius: "8px",
            border: "1px solid rgba(212,178,106,.22)",
            background: `linear-gradient(180deg,rgba(12,12,15,.04),rgba(12,12,15,.48)), url('${post.image}') center/cover`,
          }}
        />

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
                <p style={{ margin: "10px 0 0", color: "#d7d0c3", fontSize: "16px", lineHeight: 1.85 }}>
                  {section.body}
                </p>
              </section>
            ))}

            <aside
              style={{
                marginTop: "30px",
                border: "1px solid rgba(212,178,106,.26)",
                borderRadius: "8px",
                padding: "18px",
                background: "rgba(212,178,106,.08)",
                color: "#efe4c9",
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
              border: "1px solid rgba(255,255,255,.1)",
              borderRadius: "8px",
              padding: "16px",
              background: "rgba(255,255,255,.035)",
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
                      width: "64px",
                      height: "64px",
                      borderRadius: "8px",
                      background: `url('${item.image}') center/cover`,
                    }}
                  />
                  <span style={{ minWidth: 0 }}>
                    <strong style={{ display: "block", fontSize: "13px", lineHeight: 1.35 }}>
                      {item.title}
                    </strong>
                    <small style={{ display: "block", marginTop: "4px", color: "#8c8679", fontWeight: 700 }}>
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
