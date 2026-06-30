import type { Metadata } from "next";
import Link from "next/link";
import { blogPosts, featuredBlogPost } from "@/lib/content/blog";
import { absoluteSiteUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: "Blog và cẩm nang nightlife",
  description:
    "Cẩm nang đi đêm, đặt chỗ, ưu đãi và văn hóa nightlife tại Hà Nội, TP.HCM trên Vietyoru.",
  alternates: {
    canonical: "/blog",
  },
  openGraph: {
    title: "Blog và cẩm nang nightlife | Vietyoru",
    description:
      "Cập nhật hướng dẫn chọn quán, đặt bàn và dùng ưu đãi nightlife tại Việt Nam.",
    url: absoluteSiteUrl("/blog"),
    images: [{ url: featuredBlogPost.image, alt: featuredBlogPost.imageAlt }],
  },
};

const categories = ["Tất cả", ...Array.from(new Set(blogPosts.map((post) => post.category)))];

const formatDate = (value: string) =>
  new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(value));

export default function BlogPage() {
  const posts = blogPosts.filter((post) => post.slug !== featuredBlogPost.slug);

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#0c0c0f",
        color: "#f3f0ea",
        padding: "clamp(22px, 5vw, 56px) clamp(16px, 5vw, 48px)",
      }}
    >
      <section style={{ maxWidth: "1180px", margin: "0 auto" }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "minmax(0, 1fr)",
            gap: "20px",
          }}
        >
          <div>
            <p
              style={{
                margin: 0,
                color: "#d4b26a",
                fontSize: "12px",
                fontWeight: 800,
                letterSpacing: "1.8px",
                textTransform: "uppercase",
              }}
            >
              Blog
            </p>
            <h1
              style={{
                margin: "8px 0 0",
                maxWidth: "760px",
                fontSize: "clamp(32px, 6vw, 58px)",
                lineHeight: 1.04,
                fontWeight: 900,
                letterSpacing: 0,
              }}
            >
              Cẩm nang nightlife cho mỗi lần xuống phố
            </h1>
            <p
              style={{
                maxWidth: "680px",
                margin: "16px 0 0",
                color: "#c5c0b6",
                fontSize: "16px",
                lineHeight: 1.7,
              }}
            >
              Gợi ý khu vực, etiquette, ưu đãi và mẹo đặt chỗ để khách có một
              buổi tối rõ ràng hơn trước khi gửi yêu cầu.
            </p>
          </div>

          <div
            aria-label="Chủ đề blog"
            style={{
              display: "flex",
              gap: "10px",
              overflowX: "auto",
              paddingBottom: "2px",
            }}
          >
            {categories.map((category, index) => (
              <span
                key={category}
                style={{
                  flex: "none",
                  border: `1px solid ${index === 0 ? "rgba(212,178,106,.58)" : "rgba(255,255,255,.1)"}`,
                  background: index === 0 ? "linear-gradient(135deg,#f0dda8,#d4b26a)" : "rgba(255,255,255,.045)",
                  color: index === 0 ? "#241a0a" : "#dcd6ca",
                  borderRadius: "999px",
                  padding: "8px 13px",
                  fontSize: "12.5px",
                  fontWeight: 800,
                  whiteSpace: "nowrap",
                }}
              >
                {category}
              </span>
            ))}
          </div>
        </div>

        <Link
          className="nl-blog-feature"
          href={`/blog/${featuredBlogPost.slug}`}
          style={{
            display: "grid",
            gridTemplateColumns: "minmax(0, 1.08fr) minmax(300px, .92fr)",
            gap: "0",
            marginTop: "28px",
            border: "1px solid rgba(212,178,106,.24)",
            borderRadius: "8px",
            overflow: "hidden",
            color: "inherit",
            textDecoration: "none",
            background: "rgba(255,255,255,.04)",
          }}
        >
          <div
            aria-label={featuredBlogPost.imageAlt}
            role="img"
            style={{
              minHeight: "360px",
              background: `linear-gradient(180deg,rgba(12,12,15,.05),rgba(12,12,15,.5)), url('${featuredBlogPost.image}') center/cover`,
            }}
          />
          <article style={{ padding: "clamp(22px, 4vw, 42px)" }}>
            <span
              style={{
                display: "inline-flex",
                borderRadius: "999px",
                padding: "6px 10px",
                color: "#241a0a",
                background: "#f0dda8",
                fontSize: "11px",
                fontWeight: 900,
              }}
            >
              Nổi bật · {featuredBlogPost.category}
            </span>
            <h2
              style={{
                margin: "16px 0 0",
                fontSize: "clamp(26px, 4vw, 40px)",
                lineHeight: 1.12,
                fontWeight: 900,
                letterSpacing: 0,
              }}
            >
              {featuredBlogPost.title}
            </h2>
            <p style={{ margin: "14px 0 0", color: "#c5c0b6", fontSize: "15px", lineHeight: 1.7 }}>
              {featuredBlogPost.description}
            </p>
            <div
              style={{
                display: "flex",
                gap: "10px",
                flexWrap: "wrap",
                alignItems: "center",
                marginTop: "22px",
                color: "#8c8679",
                fontSize: "12.5px",
                fontWeight: 700,
              }}
            >
              <span>{formatDate(featuredBlogPost.date)}</span>
              <span aria-hidden="true">·</span>
              <span>{featuredBlogPost.readTime}</span>
              <span style={{ marginLeft: "auto", color: "#f0dda8" }}>Đọc tiếp</span>
            </div>
          </article>
        </Link>

        <section
          aria-label="Danh sách bài viết"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
            gap: "16px",
            marginTop: "18px",
          }}
        >
          {posts.map((post) => (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
              style={{
                color: "inherit",
                textDecoration: "none",
                border: "1px solid rgba(255,255,255,.1)",
                borderRadius: "8px",
                overflow: "hidden",
                background: "rgba(255,255,255,.035)",
              }}
            >
              <div
                role="img"
                aria-label={post.imageAlt}
                style={{
                  height: "164px",
                  background: `linear-gradient(180deg,rgba(12,12,15,.05),rgba(12,12,15,.45)), url('${post.image}') center/cover`,
                }}
              />
              <article style={{ padding: "16px" }}>
                <span style={{ color: "#d4b26a", fontSize: "11px", fontWeight: 900 }}>
                  {post.category}
                </span>
                <h2 style={{ margin: "8px 0 0", fontSize: "18px", lineHeight: 1.3, fontWeight: 850 }}>
                  {post.title}
                </h2>
                <p style={{ margin: "8px 0 0", color: "#b6b1a6", fontSize: "13.5px", lineHeight: 1.55 }}>
                  {post.description}
                </p>
                <div style={{ marginTop: "14px", color: "#8c8679", fontSize: "12px", fontWeight: 700 }}>
                  {formatDate(post.date)} · {post.readTime}
                </div>
              </article>
            </Link>
          ))}
        </section>
      </section>
    </main>
  );
}
