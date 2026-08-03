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
  languageAlternates,
  languageCodes,
  localizePathname,
} from "@/lib/i18n/locales";

// Cache sitemap for 1 hour via ISR — prevents hammering the API on every bot crawl
export const dynamic = "force-dynamic";
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

async function loadSitemapDiscovery<T>(endpoint: "/stores" | "/casts") {
  const backendBaseUrl =
    process.env.BACKEND_API_URL?.replace(/\/api\/?$/, "").replace(/\/$/, "") ||
    "https://api.vietyoru.com";
  const response = await fetch(`${backendBaseUrl}${endpoint}?limit=100&sort=priority`, {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Unable to load sitemap ${endpoint}`);
  }

  const payload = (await response.json()) as T[] | { data?: T[] };
  return Array.isArray(payload) ? payload : payload.data ?? [];
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
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
    ...staticRoutes.flatMap((route) =>
      languageCodes.map((language) => ({
        url: absoluteSiteUrl(localizePathname(route.path, language)),
        lastModified: now,
        changeFrequency: route.changeFrequency,
        priority: route.priority,
        alternates: {
          languages: Object.fromEntries(
            Object.entries(languageAlternates(route.path)).map(([locale, path]) => [
              locale,
              absoluteSiteUrl(path),
            ]),
          ),
        },
      })),
    ),
    ...stores.flatMap((store) => {
      const path = `/stores/${store.slug}`;
      return languageCodes.map((language) => ({
        url: absoluteSiteUrl(localizePathname(path, language)),
        lastModified: now,
        changeFrequency: "daily" as const,
        priority: 0.82,
        alternates: {
          languages: Object.fromEntries(
            Object.entries(languageAlternates(path)).map(([locale, alternatePath]) => [
              locale,
              absoluteSiteUrl(alternatePath),
            ]),
          ),
        },
      }));
    }),
    ...casts.flatMap((cast) => {
      const path = `/casts/${cast.slug}`;
      return languageCodes.map((language) => ({
        url: absoluteSiteUrl(localizePathname(path, language)),
        lastModified: now,
        changeFrequency: "daily" as const,
        priority: 0.78,
        alternates: {
          languages: Object.fromEntries(
            Object.entries(languageAlternates(path)).map(([locale, alternatePath]) => [
              locale,
              absoluteSiteUrl(alternatePath),
            ]),
          ),
        },
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
