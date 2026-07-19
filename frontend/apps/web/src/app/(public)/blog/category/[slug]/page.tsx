import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  filterBlogPosts,
  findBlogCategoryBySlug,
  getBlogCategories,
  getPublishedBlogPosts,
  slugifyBlogTerm,
} from "@/lib/content/blog";
import { breadcrumbJsonLd, jsonLdGraph } from "@/lib/seo/structured-data";
import { absoluteSiteUrl } from "@/lib/site";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export const revalidate = 300;
export const dynamicParams = false;

export async function generateStaticParams() {
  const posts = await getPublishedBlogPosts();
  return getBlogCategories(posts).map((category) => ({ slug: slugifyBlogTerm(category) }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const posts = await getPublishedBlogPosts();
  const category = findBlogCategoryBySlug(posts, slug);

  if (!category) {
    return {
      title: "Không tìm thấy chủ đề blog",
      description: "Chủ đề blog này chưa có trên Vietyoru.",
      robots: { index: false, follow: false },
    };
  }

  const canonical = `/blog/category/${slug}`;

  return {
    title: `Blog ${category}`,
    description: `Các bài viết Vietyoru thuộc chủ đề ${category}.`,
    alternates: {
      canonical,
      languages: { vi: canonical, "x-default": canonical },
    },
    openGraph: {
      title: `Blog ${category} | Vietyoru`,
      description: `Các bài viết Vietyoru thuộc chủ đề ${category}.`,
      url: absoluteSiteUrl(canonical),
    },
  };
}

export default async function BlogCategoryPage({ params }: PageProps) {
  const { slug } = await params;
  const posts = await getPublishedBlogPosts();
  const category = findBlogCategoryBySlug(posts, slug);

  if (!category) notFound();

  const categoryPosts = filterBlogPosts(posts, { category: slug });
  const structuredData = jsonLdGraph([
    breadcrumbJsonLd(
      [
        { name: "Trang chủ", path: "/" },
        { name: "Blog", path: "/blog" },
        { name: category, path: `/blog/category/${slug}` },
      ],
      `/blog/category/${slug}`,
    ),
  ]);

  return (
    <main style={{ minHeight: "auto", background: "#0c0c0f", color: "#f3f0ea", padding: "clamp(22px, 5vw, 56px) clamp(16px, 5vw, 48px) clamp(24px, 4vw, 34px)" }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
      <section style={{ maxWidth: "980px", margin: "0 auto" }}>
        <Link href="/blog" style={{ color: "#d4b26a", textDecoration: "none", fontSize: "13px", fontWeight: 800 }}>
          Blog
        </Link>
        <h1 style={{ margin: "12px 0 0", fontSize: "clamp(32px, 6vw, 56px)", lineHeight: 1.04, fontWeight: 950 }}>
          {category}
        </h1>
        <p style={{ maxWidth: 680, margin: "14px 0 0", color: "#c5c0b6", lineHeight: 1.7 }}>
          Các bài viết được nhóm theo chủ đề để khách chọn nhanh nội dung phù hợp trước khi đặt chỗ.
        </p>
        <div style={{ display: "grid", gap: "14px", marginTop: "26px" }}>
          {categoryPosts.map((post) => (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
              style={{
                display: "block",
                border: "1px solid rgba(212,178,106,.22)",
                borderRadius: "8px",
                padding: "18px",
                background: "rgba(255,255,255,.035)",
                color: "inherit",
                textDecoration: "none",
              }}
            >
              <strong style={{ display: "block", fontSize: "20px", lineHeight: 1.3 }}>{post.title}</strong>
              <span style={{ display: "block", marginTop: "8px", color: "#c5c0b6", lineHeight: 1.6 }}>
                {post.description}
              </span>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
