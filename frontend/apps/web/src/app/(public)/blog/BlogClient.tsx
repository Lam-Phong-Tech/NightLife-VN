"use client";

import Image from "next/image";
import Link from "next/link";
import type { CSSProperties } from "react";
import type { BlogPost } from "@/lib/content/blog";
import { slugifyBlogTerm } from "@/lib/content/blog";
import { useActiveLanguage } from "@/lib/i18n/use-active-language";
import { translateText } from "@/lib/i18n/client-translations";
import { BlogSearchSubmitGuard } from "./BlogSearchSubmitGuard";

type BlogClientProps = {
  featuredPost: BlogPost | null;
  posts: BlogPost[];
  paginatedPosts: BlogPost[];
  query: string;
  activeCategory: string;
  activeTag: string;
  categories: string[];
  currentPage: number;
  totalPages: number;
  paginationItems: Array<number | "ellipsis">;
  hasFilter: boolean;
  getPageHref: (page: number) => { pathname: string; query: Record<string, string> };
  structuredData: Record<string, unknown>;
};

const formatDate = (value: string, locale: string) => {
  try {
    return new Intl.DateTimeFormat(locale === "ja" ? "ja-JP" : locale === "en" ? "en-US" : "vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(new Date(value));
  } catch {
    return value;
  }
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

export function BlogClient({
  featuredPost,
  posts,
  paginatedPosts,
  query,
  activeCategory,
  activeTag,
  categories,
  currentPage,
  totalPages,
  paginationItems,
  hasFilter,
  getPageHref,
  structuredData,
}: BlogClientProps) {
  const activeLanguage = useActiveLanguage();

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
              {translateText("Cẩm nang nightlife cho mỗi lần xuống phố", activeLanguage)}
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
              {translateText("Gợi ý khu vực, etiquette, ưu đãi và mẹo đặt chỗ để khách có một buổi tối rõ ràng hơn trước khi gửi yêu cầu.", activeLanguage)}
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
              placeholder={translateText("Tìm bài viết...", activeLanguage)}
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
              {translateText("Tìm kiếm", activeLanguage)}
            </button>
          </form>
          <BlogSearchSubmitGuard category={activeCategory} tag={activeTag} />

          <div
            aria-label={translateText("Chủ đề blog", activeLanguage)}
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
              {translateText("Tất cả", activeLanguage)}
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
                  {translateText(category, activeLanguage)}
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
                {translateText("Nổi bật", activeLanguage)} · {translateText(featuredPost.category, activeLanguage)}
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
                {translateText(featuredPost.title, activeLanguage)}
              </h2>
              <p style={{ margin: "14px 0 0", color: "var(--vy-text-2)", fontSize: "15px", lineHeight: 1.7 }}>
                {translateText(featuredPost.description, activeLanguage)}
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
                <span>{formatDate(featuredPost.publishedAt, activeLanguage)}</span>
              </div>
            </article>
          </Link>
        ) : null}

        <section
          aria-label={translateText("Danh sách bài viết", activeLanguage)}
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
                  {translateText(post.category, activeLanguage)}
                </span>
                <h2 style={{ margin: "8px 0 0", fontSize: "18px", lineHeight: 1.3, fontWeight: 850 }}>
                  {translateText(post.title, activeLanguage)}
                </h2>
                <p style={{ margin: "8px 0 0", color: "var(--vy-text-2)", fontSize: "13.5px", lineHeight: 1.55 }}>
                  {translateText(post.description, activeLanguage)}
                </p>
                <div style={{ marginTop: "14px", color: "var(--vy-muted)", fontSize: "12px", fontWeight: 700 }}>
                  {formatDate(post.publishedAt, activeLanguage)}
                </div>
              </article>
            </Link>
          ))}
        </section>

        {totalPages > 1 ? (
          <nav
            aria-label={translateText("Phân trang blog", activeLanguage)}
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
                {translateText("Trang trước", activeLanguage)}
              </Link>
            ) : (
              <span aria-disabled="true" style={paginationControlStyle(false, true)}>
                {translateText("Trang trước", activeLanguage)}
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
                {translateText("Trang sau", activeLanguage)}
              </Link>
            ) : (
              <span aria-disabled="true" style={paginationControlStyle(false, true)}>
                {translateText("Trang sau", activeLanguage)}
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
            {translateText("Chưa có bài viết phù hợp.", activeLanguage)}
          </div>
        ) : null}
      </section>
    </main>
  );
}
