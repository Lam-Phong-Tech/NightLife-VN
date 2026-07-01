import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  filterBlogPosts,
  getBlogCategories,
  getBlogTags,
  getFeaturedBlogPost,
  getPublishedBlogPosts,
  slugifyBlogTerm,
} from "@/lib/content/blog";
import { breadcrumbJsonLd, jsonLdGraph } from "@/lib/seo/structured-data";
import { absoluteSiteUrl } from "@/lib/site";

type BlogPageProps = {
  searchParams?: Promise<{
    q?: string;
    category?: string;
    tag?: string;
  }>;
};

export async function generateMetadata(): Promise<Metadata> {
  const featuredPost = await getFeaturedBlogPost();

  return {
    title: "Blog và cẩm nang nightlife",
    description:
      "Cẩm nang đi đêm, đặt chỗ, ưu đãi và văn hóa nightlife tại Hà Nội, TP.HCM trên Vietyoru.",
    alternates: {
      canonical: "/blog",
      languages: {
        vi: "/blog",
        "x-default": "/blog",
      },
    },
    openGraph: {
      title: "Blog và cẩm nang nightlife | Vietyoru",
      description:
        "Cập nhật hướng dẫn chọn quán, đặt bàn và dùng ưu đãi nightlife tại Việt Nam.",
      url: absoluteSiteUrl("/blog"),
      images: [{ url: featuredPost.image, alt: featuredPost.imageAlt }],
    },
  };
}

const formatDate = (value: string) =>
  new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(value));

export default async function BlogPage({ searchParams }: BlogPageProps) {
  const params = (await searchParams) ?? {};
  const allPosts = await getPublishedBlogPosts();
  const featuredPost = await getFeaturedBlogPost();
  const categories = getBlogCategories(allPosts);
  const tags = getBlogTags(allPosts);
  const filteredPosts = filterBlogPosts(allPosts, {
    q: params.q,
    category: params.category,
    tag: params.tag,
  });
  const hasFilter = Boolean(params.q || params.category || params.tag);
  const posts = hasFilter
    ? filteredPosts
    : allPosts.filter((post) => !post.noindex && post.slug !== featuredPost.slug);
  const structuredData = jsonLdGraph([
    breadcrumbJsonLd(
      [
        { name: "Trang chủ", path: "/" },
        { name: "Blog", path: "/blog" },
      ],
      "/blog",
    ),
  ]);

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#0c0c0f",
        color: "#f3f0ea",
        padding: "clamp(22px, 5vw, 56px) clamp(16px, 5vw, 48px)",
      }}
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      <section style={{ maxWidth: "1180px", margin: "0 auto" }}>
        <div style={{ display: "grid", gap: "20px" }}>
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

          <form
            className="nl-blog-filter"
            action="/blog"
            style={{
              display: "grid",
              gridTemplateColumns: "minmax(220px, 1fr) minmax(180px, 240px) minmax(160px, 220px) auto",
              gap: "10px",
              alignItems: "center",
            }}
          >
            <input
              name="q"
              defaultValue={params.q ?? ""}
              placeholder="Tìm bài viết..."
              style={{
                minHeight: "42px",
                border: "1px solid rgba(212,178,106,.22)",
                borderRadius: "8px",
                background: "rgba(255,255,255,.045)",
                color: "#f3f0ea",
                padding: "0 13px",
              }}
            />
            <select
              name="category"
              defaultValue={params.category ?? ""}
              style={{
                minHeight: "42px",
                border: "1px solid rgba(212,178,106,.22)",
                borderRadius: "8px",
                background: "#111114",
                color: "#f3f0ea",
                padding: "0 12px",
              }}
            >
              <option value="">Tất cả chủ đề</option>
              {categories.map((category) => (
                <option key={category} value={slugifyBlogTerm(category)}>
                  {category}
                </option>
              ))}
            </select>
            <select
              name="tag"
              defaultValue={params.tag ?? ""}
              style={{
                minHeight: "42px",
                border: "1px solid rgba(212,178,106,.22)",
                borderRadius: "8px",
                background: "#111114",
                color: "#f3f0ea",
                padding: "0 12px",
              }}
            >
              <option value="">Tất cả tag</option>
              {tags.map((tag) => (
                <option key={tag} value={slugifyBlogTerm(tag)}>
                  {tag}
                </option>
              ))}
            </select>
            <button
              type="submit"
              style={{
                minHeight: "42px",
                border: 0,
                borderRadius: "8px",
                background: "linear-gradient(135deg,#f0dda8,#d4b26a)",
                color: "#241a0a",
                padding: "0 18px",
                fontWeight: 900,
                cursor: "pointer",
              }}
            >
              Lọc
            </button>
          </form>

          <div
            aria-label="Chủ đề blog"
            style={{
              display: "flex",
              gap: "10px",
              overflowX: "auto",
              paddingBottom: "2px",
            }}
          >
            <Link
              href="/blog"
              style={{
                flex: "none",
                border: "1px solid rgba(212,178,106,.58)",
                background: "linear-gradient(135deg,#f0dda8,#d4b26a)",
                color: "#241a0a",
                borderRadius: "999px",
                padding: "8px 13px",
                fontSize: "12.5px",
                fontWeight: 800,
                whiteSpace: "nowrap",
                textDecoration: "none",
              }}
            >
              Tất cả
            </Link>
            {categories.map((category) => (
              <Link
                key={category}
                href={`/blog/category/${slugifyBlogTerm(category)}`}
                style={{
                  flex: "none",
                  border: "1px solid rgba(255,255,255,.1)",
                  background: "rgba(255,255,255,.045)",
                  color: "#dcd6ca",
                  borderRadius: "999px",
                  padding: "8px 13px",
                  fontSize: "12.5px",
                  fontWeight: 800,
                  whiteSpace: "nowrap",
                  textDecoration: "none",
                }}
              >
                {category}
              </Link>
            ))}
          </div>
        </div>

        {!hasFilter ? (
          <Link
            className="nl-blog-feature"
            href={`/blog/${featuredPost.slug}`}
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
            <span
              style={{
                position: "relative",
                minHeight: "360px",
                display: "block",
              }}
            >
              <Image
                src={featuredPost.image}
                alt={featuredPost.imageAlt}
                fill
                priority
                sizes="(max-width: 767px) 100vw, 56vw"
                style={{ objectFit: "cover" }}
              />
              <span
                aria-hidden="true"
                style={{
                  position: "absolute",
                  inset: 0,
                  background: "linear-gradient(180deg,rgba(12,12,15,.05),rgba(12,12,15,.5))",
                }}
              />
            </span>
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
                Nổi bật · {featuredPost.category}
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
                {featuredPost.title}
              </h2>
              <p style={{ margin: "14px 0 0", color: "#c5c0b6", fontSize: "15px", lineHeight: 1.7 }}>
                {featuredPost.description}
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
                <span>{formatDate(featuredPost.publishedAt)}</span>
                <span aria-hidden="true">·</span>
                <span>{featuredPost.readTime}</span>
                <span style={{ marginLeft: "auto", color: "#f0dda8" }}>Đọc tiếp</span>
              </div>
            </article>
          </Link>
        ) : null}

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
              <span
                style={{
                  position: "relative",
                  display: "block",
                  height: "164px",
                }}
              >
                <Image
                  src={post.image}
                  alt={post.imageAlt}
                  fill
                  sizes="(max-width: 767px) 100vw, 33vw"
                  style={{ objectFit: "cover" }}
                />
                <span
                  aria-hidden="true"
                  style={{
                    position: "absolute",
                    inset: 0,
                    background: "linear-gradient(180deg,rgba(12,12,15,.05),rgba(12,12,15,.45))",
                  }}
                />
              </span>
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
                  {formatDate(post.publishedAt)} · {post.readTime}
                </div>
              </article>
            </Link>
          ))}
        </section>

        {!posts.length ? (
          <div
            style={{
              marginTop: "18px",
              border: "1px dashed rgba(212,178,106,.26)",
              borderRadius: "8px",
              padding: "24px",
              color: "#c5c0b6",
              textAlign: "center",
            }}
          >
            Chưa có bài viết phù hợp.
          </div>
        ) : null}
      </section>
    </main>
  );
}
