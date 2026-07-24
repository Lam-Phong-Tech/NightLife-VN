import type { Metadata } from "next";
import {
  filterBlogPostsByLanguage,
  filterBlogPosts,
  getBlogCategories,
  getFeaturedBlogPost,
  getPublishedBlogPosts,
} from "@/lib/content/blog";
import { getServerSelectedLanguage } from "@/lib/i18n/server-language";
import { breadcrumbJsonLd, jsonLdGraph } from "@/lib/seo/structured-data";
import { absoluteSiteUrl } from "@/lib/site";
import { BlogClient } from "./BlogClient";

type BlogPageProps = {
  searchParams?: Promise<{
    q?: string;
    category?: string;
    tag?: string;
    page?: string;
    lang?: string;
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

export default async function BlogPage({ searchParams }: BlogPageProps) {
  const params = (await searchParams) ?? {};
  const query = params.q?.trim() ?? "";
  const activeCategory = params.category?.trim() ?? "";
  const activeTag = params.tag?.trim() ?? "";
  const activeLanguage = await getServerSelectedLanguage(params.lang);
  const requestedPage = parseBlogPage(params.page?.trim());
  const allPosts = await getPublishedBlogPosts();
  const languagePosts = filterBlogPostsByLanguage(allPosts, activeLanguage);
  const featuredPost =
    languagePosts.find((post) => post.featured && !post.noindex) ??
    languagePosts.find((post) => !post.noindex);
  const categories = getBlogCategories(languagePosts);
  const filteredPosts = filterBlogPosts(languagePosts, {
    q: query,
    category: activeCategory,
    tag: activeTag,
    language: activeLanguage,
  });
  const hasFilter = Boolean(query || activeCategory || activeTag);
  const posts = hasFilter
    ? filteredPosts
    : languagePosts.filter((post) => !post.noindex && post.slug !== featuredPost?.slug);
  const totalPages = Math.max(1, Math.ceil(posts.length / blogPageSize));
  const currentPage = Math.min(requestedPage, totalPages);
  const paginatedPosts = posts.slice(
    (currentPage - 1) * blogPageSize,
    currentPage * blogPageSize,
  );
  const paginationItems = getPaginationItems(currentPage, totalPages);
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
    <BlogClient
      featuredPost={featuredPost ?? null}
      posts={posts}
      paginatedPosts={paginatedPosts}
      query={query}
      activeCategory={activeCategory}
      activeTag={activeTag}
      categories={categories}
      currentPage={currentPage}
      totalPages={totalPages}
      paginationItems={paginationItems}
      hasFilter={hasFilter}
      structuredData={structuredData}
    />
  );
}
