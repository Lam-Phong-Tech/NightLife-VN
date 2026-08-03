import type { Metadata } from "next";
import {
  languageAlternates,
  localizePathname,
  type LanguageCode,
} from "@/lib/i18n/locales";
import { absoluteSiteUrl, siteConfig } from "@/lib/site";

type CastSeo = {
  title: string;
  description: string;
  canonicalPath?: string | null;
  ogImage?: string | null;
  noindex?: boolean;
};

type CastForMetadata = { slug: string; seo: CastSeo };

export function buildCastMetadata(
  cast: CastForMetadata,
  locale: LanguageCode = "vi",
): Metadata {
  const detailPath = `/casts/${cast.slug}`;
  const canonicalPath = localizePathname(detailPath, locale);
  const images = cast.seo.ogImage ? [{ url: cast.seo.ogImage }] : undefined;
  const noindex = Boolean(cast.seo.noindex);

  return {
    title: { absolute: cast.seo.title },
    description: cast.seo.description,
    robots: { index: !noindex, follow: !noindex },
    alternates: {
      canonical: canonicalPath,
      languages: {
        ...languageAlternates(detailPath),
        "x-default": localizePathname(detailPath, "vi"),
      },
    },
    openGraph: {
      title: cast.seo.title,
      description: cast.seo.description,
      url: absoluteSiteUrl(canonicalPath),
      images,
      siteName: siteConfig.name,
    },
    twitter: {
      card: "summary_large_image",
      title: cast.seo.title,
      description: cast.seo.description,
      images: cast.seo.ogImage ? [cast.seo.ogImage] : undefined,
    },
  };
}
