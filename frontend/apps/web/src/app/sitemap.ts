import type { MetadataRoute } from "next";
import { blogPosts } from "@/lib/content/blog";
import { legalSections } from "@/lib/content/legal";
import { discoveryApi } from "@/lib/api/discovery";
import { absoluteSiteUrl } from "@/lib/site";

const staticRoutes: Array<{
  path: string;
  changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"];
  priority: number;
}> = [
  { path: "/", changeFrequency: "daily", priority: 1 },
  { path: "/danh-sach-quan", changeFrequency: "daily", priority: 0.86 },
  { path: "/danh-sach-cast", changeFrequency: "daily", priority: 0.84 },
  { path: "/xep-hang", changeFrequency: "daily", priority: 0.78 },
  { path: "/tour", changeFrequency: "weekly", priority: 0.66 },
  { path: "/uu-dai", changeFrequency: "daily", priority: 0.76 },
  { path: "/blog", changeFrequency: "weekly", priority: 0.72 },
  { path: "/legal", changeFrequency: "monthly", priority: 0.36 },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const [stores, casts] = await Promise.all([
    discoveryApi.listStores({ limit: 50, sort: "priority" }),
    discoveryApi.listCasts({ limit: 50, sort: "priority" }),
  ]);

  return [
    ...staticRoutes.map((route) => ({
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
    ...legalSections.map((section) => ({
      url: absoluteSiteUrl(`/legal/${section.slug}`),
      lastModified: new Date(section.updatedAt),
      changeFrequency: "monthly" as const,
      priority: 0.32,
    })),
  ];
}
