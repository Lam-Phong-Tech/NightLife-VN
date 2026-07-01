import type { BlogPost } from "@/lib/content/blog";
import { absoluteSiteUrl, siteConfig } from "@/lib/site";

export type JsonLdValue =
  | string
  | number
  | boolean
  | null
  | JsonLdValue[]
  | { [key: string]: JsonLdValue | undefined };

export type JsonLdObject = { [key: string]: JsonLdValue | undefined };

export const omitUndefined = (value: JsonLdValue | undefined): JsonLdValue | undefined => {
  if (Array.isArray(value)) {
    return value
      .map((item) => omitUndefined(item))
      .filter((item): item is JsonLdValue => item !== undefined);
  }

  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value)
        .map(([key, item]) => [key, omitUndefined(item)] as const)
        .filter(([, item]) => item !== undefined),
    ) as JsonLdObject;
  }

  return value;
};

export const organizationJsonLd = (): JsonLdObject => ({
  "@type": "Organization",
  "@id": absoluteSiteUrl("/#organization"),
  name: siteConfig.name,
  url: siteConfig.url,
  description: siteConfig.description,
});

export const breadcrumbJsonLd = (
  items: Array<{ name: string; path: string }>,
  idPath = items.at(-1)?.path ?? "/",
): JsonLdObject => ({
  "@type": "BreadcrumbList",
  "@id": `${absoluteSiteUrl(idPath)}#breadcrumb`,
  itemListElement: items.map((item, index) => ({
    "@type": "ListItem",
    position: index + 1,
    name: item.name,
    item: absoluteSiteUrl(item.path),
  })),
});

export const articleJsonLd = (post: BlogPost): JsonLdObject => ({
  "@type": "Article",
  "@id": `${absoluteSiteUrl(`/blog/${post.slug}`)}#article`,
  headline: post.title,
  description: post.description,
  image: [post.image],
  datePublished: post.publishedAt,
  dateModified: post.updatedAt,
  author: {
    "@type": "Organization",
    name: post.author,
  },
  publisher: {
    "@id": absoluteSiteUrl("/#organization"),
  },
  mainEntityOfPage: absoluteSiteUrl(`/blog/${post.slug}`),
  articleSection: post.category,
  keywords: post.tags,
});

export const jsonLdGraph = (items: JsonLdObject[]): JsonLdObject =>
  omitUndefined({
    "@context": "https://schema.org",
    "@graph": items,
  }) as JsonLdObject;
