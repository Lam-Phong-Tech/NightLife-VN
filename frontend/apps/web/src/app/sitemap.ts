import type { MetadataRoute } from "next";
import {
  getBlogCategories,
  getBlogTags,
  getSitemapBlogPosts,
  slugifyBlogTerm,
} from "@/lib/content/blog";
import {
  discoveryApi,
  type PublicCast,
  type PublicStore,
} from "@/lib/api/discovery";
import { getPublishedLegalSections } from "@/lib/content/legal";
import { absoluteSiteUrl } from "@/lib/site";

const staticRoutes: Array<{
  path: string;
  changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"];
  priority: number;
}> = [
  { path: "/", changeFrequency: "daily", priority: 1 },
  { path: "/danh-sach-quan", changeFrequency: "daily", priority: 0.86 },
  { path: "/spa", changeFrequency: "daily", priority: 0.84 },
  { path: "/nha-hang", changeFrequency: "daily", priority: 0.84 },
  { path: "/danh-sach-cast", changeFrequency: "daily", priority: 0.84 },
  { path: "/xep-hang", changeFrequency: "daily", priority: 0.78 },
  { path: "/uu-dai", changeFrequency: "daily", priority: 0.76 },
  { path: "/tour", changeFrequency: "weekly", priority: 0.74 },
  { path: "/blog", changeFrequency: "weekly", priority: 0.72 },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  let stores: PublicStore[] = [];
  let casts: PublicCast[] = [];

  try {
    [stores, casts] = await Promise.all([
      discoveryApi.listStores({ limit: 50, sort: "priority" }),
      discoveryApi.listCasts({ limit: 50, sort: "priority" }),
    ]);
  } catch {
    stores = [];
    casts = [];
  }

  const blogPosts = await getSitemapBlogPosts();
  const blogCategories = getBlogCategories(blogPosts);
  const blogTags = getBlogTags(blogPosts);
  const legalSections = await getPublishedLegalSections();
  const shouldIndexLegal = legalSections.length > 0 && legalSections.every((section) => !section.noindex);
  const indexableLegalSections = legalSections.filter((section) => !section.noindex);
  const indexableStaticRoutes = shouldIndexLegal
    ? [
        ...staticRoutes,
        { path: "/legal", changeFrequency: "monthly" as const, priority: 0.48 },
      ]
    : staticRoutes;

  return [
    ...indexableStaticRoutes.map((route) => ({
      url: absoluteSiteUrl(route.path),
      lastModified: now,
      changeFrequency: route.changeFrequency,
      priority: route.priority,
    })),
    ...stores.map((store) => ({
      url: absoluteSiteUrl(`/stores/${store.slug}`),
      lastModified: now,
      changeFrequency: "daily" as const,
      priority: 0.82,
    })),
    ...casts.map((cast) => ({
      url: absoluteSiteUrl(`/casts/${cast.slug}`),
      lastModified: now,
      changeFrequency: "daily" as const,
      priority: 0.78,
    })),
    ...blogPosts.map((post) => ({
      url: absoluteSiteUrl(`/blog/${post.slug}`),
      lastModified: new Date(post.updatedAt),
      changeFrequency: "weekly" as const,
      priority: post.featured ? 0.72 : 0.64,
    })),
    ...blogCategories.map((category) => ({
      url: absoluteSiteUrl(`/blog/category/${slugifyBlogTerm(category)}`),
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.58,
    })),
    ...blogTags.map((tag) => ({
      url: absoluteSiteUrl(`/blog/tag/${slugifyBlogTerm(tag)}`),
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.54,
    })),
    ...indexableLegalSections.map((section) => ({
      url: absoluteSiteUrl(`/legal/${section.slug}`),
      lastModified: new Date(section.updatedAt),
      changeFrequency: "monthly" as const,
      priority: 0.44,
    })),
  ];
}
