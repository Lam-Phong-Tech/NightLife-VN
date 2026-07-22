import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import type { CSSProperties } from "react";
import {
  filterBlogPosts,
  getBlogCategories,
  getFeaturedBlogPost,
  getPublishedBlogPosts,
  slugifyBlogTerm,
} from "@/lib/content/blog";
import { breadcrumbJsonLd, jsonLdGraph } from "@/lib/seo/structured-data";
import { absoluteSiteUrl } from "@/lib/site";
import { BlogSearchSubmitGuard } from "./BlogSearchSubmitGuard";

type BlogPageProps = {
  searchParams?: Promise<{
    q?: string;
    category?: string;
    tag?: string;
    page?: string;
  }>;
};

const blogPageSize = 8;

const parseBlogPage = (value?: string) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? Math.floor(parsed) : 1;
};

const getPaginationItems = (currentPage: number, totalPages: number) => {
  const pageNumbers = Array.from(
    new Set([1, totalPages, currentPage - 1, currentPage, currentPage + 1]),
  )
    .filter((page) => page >= 1 && page <= totalPages)
    .sort((a, b) => a - b);

  return pageNumbers.reduce<Array<number | "ellipsis">>((items, page) => {
    const previous = items[items.length - 1];
    if (typeof previous === "number" && page - previous > 1) {
      items.push("ellipsis");
    }
    items.push(page);
    return items;
  }, []);
};

const paginationControlStyle = (active = false, disabled = false): CSSProperties => ({
  minWidth: "38px",
  minHeight: "38px",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  borderRadius: "8px",
  border: active ? "1px solid var(--vy-gold)" : "1px solid var(--vy-border)",
  background: active ? "var(--vy-gold-grad)" : "var(--vy-surface-2)",
  color: active ? "var(--vy-on-gold)" : "var(--vy-text-2)",
  padding: "0 12px",
  fontSize: "13px",
  fontWeight: 900,
  textDecoration: "none",
  opacity: disabled ? 0.45 : 1,
  cursor: disabled ? "default" : "pointer",
});

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
      images: featuredPost ? [{ url: featuredPost.image, alt: featuredPost.imageAlt }] : [],
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
  const query = params.q?.trim() ?? "";
  const activeCategory = params.category?.trim() ?? "";
  const activeTag = params.tag?.trim() ?? "";
  const requestedPage = parseBlogPage(params.page?.trim());
  const allPosts = await getPublishedBlogPosts();
  const featuredPost = await getFeaturedBlogPost();
  const categories = getBlogCategories(allPosts);
  const filteredPosts = filterBlogPosts(allPosts, {
    q: query,
    category: activeCategory,
    tag: activeTag,
  });
  const hasFilter = Boolean(query || activeCategory || activeTag);
  const posts = hasFilter
    ? filteredPosts
    : allPosts.filter((post) => !post.noindex && post.slug !== featuredPost?.slug);
  const totalPages = Math.max(1, Math.ceil(posts.length / blogPageSize));
  const currentPage = Math.min(requestedPage, totalPages);
  const paginatedPosts = posts.slice(
    (currentPage - 1) * blogPageSize,
    currentPage * blogPageSize,
  );
  const paginationItems = getPaginationItems(currentPage, totalPages);
  const getPageHref = (page: number) => ({
    pathname: "/blog",
    query: {
      ...(query ? { q: query } : {}),
      ...(activeCategory ? { category: activeCategory } : {}),
      ...(activeTag ? { tag: activeTag } : {}),
      ...(page > 1 ? { page: String(page) } : {}),
    },
  });
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
        minHeight: "auto",
        background: "var(--vy-bg)",
        color: "var(--vy-text)",
        padding: "clamp(22px, 5vw, 56px) clamp(16px, 5vw, 48px) clamp(24px, 4vw, 34px)",
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
                color: "var(--vy-gold)",
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
                color: "var(--vy-text-2)",
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
              gridTemplateColumns: "1fr auto",
              gap: "10px",
              alignItems: "center",
            }}
          >
            <input
              name={query ? "q" : undefined}
              data-blog-search-input="true"
              defaultValue={query}
              placeholder="Tìm bài viết..."
              style={{
                minHeight: "42px",
                border: "1px solid var(--vy-border-gold-22)",
                borderRadius: "8px",
                background: "var(--vy-surface-2)",
                color: "var(--vy-text)",
                padding: "0 13px",
              }}
            />
            {activeCategory && <input type="hidden" name="category" value={activeCategory} />}
            {activeTag && <input type="hidden" name="tag" value={activeTag} />}
            <button
              type="submit"
              style={{
                minHeight: "42px",
                border: 0,
                borderRadius: "8px",
                background: "var(--vy-gold-grad)",
                color: "var(--vy-on-gold)",
                padding: "0 18px",
                fontWeight: 900,
                cursor: "pointer",
              }}
            >
              Tìm kiếm
            </button>
          </form>
          <BlogSearchSubmitGuard category={activeCategory} tag={activeTag} />

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
              href={{ pathname: "/blog", query: { ...(query ? { q: query } : {}), ...(activeTag ? { tag: activeTag } : {}) } }}
              style={{
                flex: "none",
                borderRadius: "999px",
                padding: "8px 13px",
                fontSize: "12.5px",
                fontWeight: 800,
                whiteSpace: "nowrap",
                textDecoration: "none",
                ...(!activeCategory ? {
                  border: "1px solid var(--vy-gold)",
                  background: "var(--vy-gold-grad)",
                  color: "var(--vy-on-gold)",
                } : {
                  border: "1px solid var(--vy-border)",
                  background: "var(--vy-surface-2)",
                  color: "var(--vy-text-2)",
                })
              }}
            >
              Tất cả
            </Link>
            {categories.map((category) => {
              const slug = slugifyBlogTerm(category);
              const isActive = activeCategory === slug;
              return (
                <Link
                  key={category}
                  href={{ pathname: "/blog", query: { ...(query ? { q: query } : {}), ...(activeTag ? { tag: activeTag } : {}), category: slug } }}
                  style={{
                    flex: "none",
                    borderRadius: "999px",
                    padding: "8px 13px",
                    fontSize: "12.5px",
                    fontWeight: 800,
                    whiteSpace: "nowrap",
                    textDecoration: "none",
                    ...(isActive ? {
                      border: "1px solid var(--vy-gold)",
                      background: "var(--vy-gold-grad)",
                      color: "var(--vy-on-gold)",
                    } : {
                      border: "1px solid var(--vy-border)",
                      background: "var(--vy-surface-2)",
                      color: "var(--vy-text-2)",
                    })
                  }}
                >
                  {category}
                </Link>
              );
            })}
          </div>
        </div>

        {!hasFilter && featuredPost ? (
          <Link
            className="nl-blog-feature"
            href={`/blog/${featuredPost.slug}`}
            style={{
              display: "grid",
              gridTemplateColumns: "minmax(0, 1.08fr) minmax(300px, .92fr)",
              gap: "0",
              marginTop: "28px",
              border: "1px solid var(--vy-border-gold-22)",
              borderRadius: "8px",
              overflow: "hidden",
              color: "inherit",
              textDecoration: "none",
              background: "var(--vy-surface-1)",
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
                  background: "linear-gradient(180deg, transparent, rgba(0,0,0,0.6))",
                }}
              />
            </span>
            <article style={{ padding: "clamp(22px, 4vw, 42px)" }}>
              <span
                style={{
                  display: "inline-flex",
                  borderRadius: "999px",
                  padding: "6px 10px",
                  color: "var(--vy-on-gold)",
                  background: "var(--vy-gold-pale)",
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
              <p style={{ margin: "14px 0 0", color: "var(--vy-text-2)", fontSize: "15px", lineHeight: 1.7 }}>
                {featuredPost.description}
              </p>
              <div
                style={{
                  display: "flex",
                  gap: "10px",
                  flexWrap: "wrap",
                  alignItems: "center",
                  marginTop: "22px",
                  color: "var(--vy-muted)",
                  fontSize: "12.5px",
                  fontWeight: 700,
                }}
              >
                <span>{formatDate(featuredPost.publishedAt)}</span>
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
          {paginatedPosts.map((post) => (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
              style={{
                color: "inherit",
                textDecoration: "none",
                border: "1px solid var(--vy-border)",
                borderRadius: "8px",
                overflow: "hidden",
                background: "var(--vy-surface-1)",
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
                    background: "linear-gradient(180deg, transparent, rgba(0,0,0,0.6))",
                  }}
                />
              </span>
              <article style={{ padding: "16px" }}>
                <span style={{ color: "var(--vy-gold)", fontSize: "11px", fontWeight: 900 }}>
                  {post.category}
                </span>
                <h2 style={{ margin: "8px 0 0", fontSize: "18px", lineHeight: 1.3, fontWeight: 850 }}>
                  {post.title}
                </h2>
                <p style={{ margin: "8px 0 0", color: "var(--vy-text-2)", fontSize: "13.5px", lineHeight: 1.55 }}>
                  {post.description}
                </p>
                <div style={{ marginTop: "14px", color: "var(--vy-muted)", fontSize: "12px", fontWeight: 700 }}>
                  {formatDate(post.publishedAt)}
                </div>
              </article>
            </Link>
          ))}
        </section>

        {totalPages > 1 ? (
          <nav
            aria-label="Phân trang blog"
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              gap: "8px",
              flexWrap: "wrap",
              marginTop: "22px",
            }}
          >
            {currentPage > 1 ? (
              <Link href={getPageHref(currentPage - 1)} style={paginationControlStyle()}>
                Trước
              </Link>
            ) : (
              <span aria-disabled="true" style={paginationControlStyle(false, true)}>
                Trước
              </span>
            )}
            {paginationItems.map((item, index) =>
              item === "ellipsis" ? (
                <span
                  key={`ellipsis-${index}`}
                  aria-hidden="true"
                  style={{
                    minWidth: "22px",
                    color: "var(--vy-muted)",
                    textAlign: "center",
                    fontWeight: 900,
                  }}
                >
                  ...
                </span>
              ) : item === currentPage ? (
                <span
                  key={item}
                  aria-current="page"
                  style={paginationControlStyle(true)}
                >
                  {item}
                </span>
              ) : (
                <Link key={item} href={getPageHref(item)} style={paginationControlStyle()}>
                  {item}
                </Link>
              ),
            )}
            {currentPage < totalPages ? (
              <Link href={getPageHref(currentPage + 1)} style={paginationControlStyle()}>
                Sau
              </Link>
            ) : (
              <span aria-disabled="true" style={paginationControlStyle(false, true)}>
                Sau
              </span>
            )}
          </nav>
        ) : null}

        {!posts.length ? (
          <div
            style={{
              marginTop: "18px",
              border: "1px dashed var(--vy-border-gold-22)",
              borderRadius: "8px",
              padding: "24px",
              color: "var(--vy-text-2)",
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
