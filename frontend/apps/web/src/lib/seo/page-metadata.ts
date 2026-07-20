import type { Metadata } from "next";
import { absoluteSiteUrl, siteConfig } from "@/lib/site";

type PageMetadataOptions = {
  title: string;
  description: string;
  path: string;
  absoluteTitle?: boolean;
  index?: boolean;
  image?: {
    url: string;
    alt?: string;
  };
};

export const createPageMetadata = ({
  title,
  description,
  path,
  absoluteTitle = false,
  index = true,
  image,
}: PageMetadataOptions): Metadata => {
  const canonical = path.startsWith("/") ? path : `/${path}`;
  const images = image ? [{ url: image.url, alt: image.alt }] : undefined;

  return {
    title: absoluteTitle ? { absolute: title } : title,
    description,
    alternates: {
      canonical,
      languages: {
        vi: canonical,
        "x-default": canonical,
      },
    },
    robots: {
      index,
      follow: index,
    },
    openGraph: {
      siteName: siteConfig.name,
      title: absoluteTitle ? title : `${title} | ${siteConfig.name}`,
      description,
      url: absoluteSiteUrl(canonical),
      locale: "vi_VN",
      type: "website",
      images,
    },
    twitter: {
      card: "summary_large_image",
      title: absoluteTitle ? title : `${title} | ${siteConfig.name}`,
      description,
      images: image ? [image.url] : undefined,
    },
  };
};

export const createNoindexMetadata = (title: string, description: string): Metadata => ({
  title,
  description,
  robots: {
    index: false,
    follow: false,
  },
});
