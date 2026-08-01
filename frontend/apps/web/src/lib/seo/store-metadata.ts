import type { Metadata } from "next";
import { absoluteSiteUrl, siteConfig } from "@/lib/site";

type StoreSeo = {
  title: string;
  description: string;
  canonicalPath?: string | null;
  ogImage?: string | null;
  noindex?: boolean;
};

type StoreForMetadata = { slug: string; seo: StoreSeo };

export function buildStoreMetadata(store: StoreForMetadata): Metadata {
  const canonicalPath = store.seo.canonicalPath || `/stores/${store.slug}`;
  const images = store.seo.ogImage ? [{ url: store.seo.ogImage }] : undefined;
  const noindex = Boolean(store.seo.noindex);

  return {
    title: { absolute: store.seo.title },
    description: store.seo.description,
    robots: { index: !noindex, follow: !noindex },
    alternates: {
      canonical: canonicalPath,
      languages: { vi: canonicalPath, "x-default": canonicalPath },
    },
    openGraph: {
      title: store.seo.title,
      description: store.seo.description,
      url: absoluteSiteUrl(canonicalPath),
      images,
      siteName: siteConfig.name,
    },
    twitter: {
      card: "summary_large_image",
      title: store.seo.title,
      description: store.seo.description,
      images: store.seo.ogImage ? [store.seo.ogImage] : undefined,
    },
  };
}
