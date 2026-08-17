import type { Metadata } from "next";
import {
  defaultLanguageCode,
  languageAlternates,
  localizePathname,
  type LanguageCode,
} from "@/lib/i18n/locales";
import { absoluteSiteUrl, siteConfig } from "@/lib/site";

type StoreSeo = {
  title: string;
  description: string;
  canonicalPath?: string | null;
  ogImage?: string | null;
  noindex?: boolean;
};

type StoreForMetadata = { slug: string; seo: StoreSeo };

export function buildStoreMetadata(
  store: StoreForMetadata,
  locale: LanguageCode = "vi",
): Metadata {
  const detailPath = `/stores/${store.slug}`;
  const canonicalPath = localizePathname(detailPath, locale);
  const images = store.seo.ogImage ? [{ url: store.seo.ogImage }] : undefined;
  const noindex = Boolean(store.seo.noindex);

  return {
    title: { absolute: store.seo.title },
    description: store.seo.description,
    robots: { index: !noindex, follow: !noindex },
    alternates: {
      canonical: canonicalPath,
      languages: {
        ...languageAlternates(detailPath),
        "x-default": localizePathname(detailPath, defaultLanguageCode),
      },
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
