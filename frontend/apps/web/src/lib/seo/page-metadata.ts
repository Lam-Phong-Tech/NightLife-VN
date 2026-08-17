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

const DEFAULT_SOCIAL_IMAGE = {
  url: "/seo/og-cover-bar-1200x630.jpg",
  alt: "Không gian quầy bar về đêm tại Vietyoru",
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
  const socialImage = image ?? DEFAULT_SOCIAL_IMAGE;
  const images = [{ url: socialImage.url, alt: socialImage.alt }];

  return {
    title: absoluteTitle ? { absolute: title } : title,
    description,
    alternates: {
      canonical,
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
      images: [socialImage.url],
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

export async function createI18nNoindexMetadata(
  rawTitle: string,
  rawDescription: string,
  requestedLanguage?: string | string[] | null,
): Promise<Metadata> {
  const { getServerSelectedLanguage } = await import("@/lib/i18n/server-language");
  const { translateTextCore } = await import("@/lib/i18n/translation-core");

  const language = await getServerSelectedLanguage(requestedLanguage);
  const translatedTitle = translateTextCore(rawTitle, language);
  const translatedDescription = translateTextCore(rawDescription, language);

  return createNoindexMetadata(
    `${translatedTitle} | ${siteConfig.name}`,
    translatedDescription,
  );
}
