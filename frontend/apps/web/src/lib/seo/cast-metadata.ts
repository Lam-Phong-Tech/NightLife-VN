import type { Metadata } from "next";
import { absoluteSiteUrl, siteConfig } from "@/lib/site";

type CastSeo = {
  title: string;
  description: string;
  canonicalPath?: string | null;
  ogImage?: string | null;
  noindex?: boolean;
};

type CastForMetadata = { slug: string; seo: CastSeo };

export function buildCastMetadata(cast: CastForMetadata): Metadata {
  const canonicalPath = cast.seo.canonicalPath || `/casts/${cast.slug}`;
  const images = cast.seo.ogImage ? [{ url: cast.seo.ogImage }] : undefined;
  const noindex = Boolean(cast.seo.noindex);

  return {
    title: { absolute: cast.seo.title },
    description: cast.seo.description,
    robots: { index: !noindex, follow: !noindex },
    alternates: {
      canonical: canonicalPath,
      languages: { vi: canonicalPath, "x-default": canonicalPath },
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
