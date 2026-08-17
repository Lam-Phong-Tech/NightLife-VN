import type { MetadataRoute } from "next";
import {
  getBlogCategories,
  getBlogTags,
  getSitemapBlogPosts,
  slugifyBlogTerm,
} from "@/lib/content/blog";
import type { PublicCast, PublicStore } from "@/lib/api/discovery";
import { getPublishedLegalSections } from "@/lib/content/legal";
import { absoluteSiteUrl } from "@/lib/site";
import {
  defaultLanguageCode,
  languageAlternates,
  languageCodes,
  localizePathname,
} from "@/lib/i18n/locales";

// Cache sitemap data for one hour to avoid fetching both discovery endpoints on every crawl.
export const revalidate = 3600;

const staticRoutes: Array<{
  path: string;
  changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"];
  priority: number;
}> = [
  { path: "/", changeFrequency: "daily", priority: 1 },
  { path: "/stores", changeFrequency: "daily", priority: 0.86 },
  { path: "/spa", changeFrequency: "daily", priority: 0.84 },
  { path: "/nha-hang", changeFrequency: "daily", priority: 0.84 },
  { path: "/casts", changeFrequency: "daily", priority: 0.84 },
  { path: "/xep-hang", changeFrequency: "daily", priority: 0.78 },
  { path: "/uu-dai", changeFrequency: "daily", priority: 0.76 },
  { path: "/tour", changeFrequency: "weekly", priority: 0.74 },
  { path: "/blog", changeFrequency: "weekly", priority: 0.72 },
];

const buildSitemapAlternates = (path: string) => ({
  languages: {
    ...Object.fromEntries(
      Object.entries(languageAlternates(path)).map(([locale, alternatePath]) => [
        locale,
        absoluteSiteUrl(alternatePath),
      ]),
    ),
    "x-default": absoluteSiteUrl(localizePathname(path, defaultLanguageCode)),
  },
});

async function loadSitemapDiscovery<T>(endpoint: "/stores" | "/casts") {
  const backendBaseUrl =
    process.env.BACKEND_API_URL?.replace(/\/api\/?$/, "").replace(/\/$/, "") ||
    "https://api.vietyoru.com";
  const allItems: T[] = [];
  let page = 1;
  let hasMore = true;

  while (hasMore) {
    const searchParams = new URLSearchParams({
      limit: "100",
      page: String(page),
      sort: "priority",
    });
    const response = await fetch(`${backendBaseUrl}${endpoint}?${searchParams}`, {
      next: { revalidate },
    });

    if (!response.ok) {
      throw new Error(`Unable to load sitemap ${endpoint}`);
    }

    const payload = (await response.json()) as
      | T[]
      | { data?: T[]; meta?: { hasMore?: boolean } };
    if (Array.isArray(payload)) {
      allItems.push(...payload);
      break;
    }

    const pageItems = payload.data ?? [];
    allItems.push(...pageItems);
    hasMore = Boolean(payload.meta?.hasMore) && pageItems.length > 0;
    page += 1;
  }

  return allItems;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  let stores: PublicStore[] = [];
  let casts: PublicCast[] = [];

  try {
    [stores, casts] = await Promise.all([
      loadSitemapDiscovery<PublicStore>("/stores"),
      loadSitemapDiscovery<PublicCast>("/casts"),
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
  return [
    ...staticRoutes.flatMap((route) =>
      languageCodes.map((language) => ({
        url: absoluteSiteUrl(localizePathname(route.path, language)),
        changeFrequency: route.changeFrequency,
        priority: route.priority,
        alternates: buildSitemapAlternates(route.path),
      })),
    ),
    ...(shouldIndexLegal
      ? [
          {
            url: absoluteSiteUrl("/legal"),
            changeFrequency: "monthly" as const,
            priority: 0.48,
          },
        ]
      : []),
    ...stores.flatMap((store) => {
      const path = `/stores/${store.slug}`;
      return languageCodes.map((language) => ({
        url: absoluteSiteUrl(localizePathname(path, language)),
        changeFrequency: "daily" as const,
        priority: 0.82,
        alternates: buildSitemapAlternates(path),
      }));
    }),
    ...casts.flatMap((cast) => {
      const path = `/casts/${cast.slug}`;
      return languageCodes.map((language) => ({
        url: absoluteSiteUrl(localizePathname(path, language)),
        changeFrequency: "daily" as const,
        priority: 0.78,
        alternates: buildSitemapAlternates(path),
      }));
    }),
    ...blogPosts.map((post) => ({
      url: absoluteSiteUrl(`/blog/${post.slug}`),
      lastModified: new Date(post.updatedAt),
      changeFrequency: "weekly" as const,
      priority: post.featured ? 0.72 : 0.64,
    })),
    ...blogCategories.map((category) => ({
      url: absoluteSiteUrl(`/blog/category/${slugifyBlogTerm(category)}`),
      changeFrequency: "weekly" as const,
      priority: 0.58,
    })),
    ...blogTags.map((tag) => ({
      url: absoluteSiteUrl(`/blog/tag/${slugifyBlogTerm(tag)}`),
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
