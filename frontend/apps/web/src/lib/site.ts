const configuredSiteUrl =
  process.env.NEXT_PUBLIC_SITE_URL || process.env.SITE_URL || "http://localhost:3000";

const normalizedSiteUrl = /^https?:\/\//i.test(configuredSiteUrl)
  ? configuredSiteUrl
  : `https://${configuredSiteUrl}`;

export const siteConfig = {
  name: "Vietyoru",
  tagline: "Vietnam Nightlife Guide",
  url: normalizedSiteUrl.replace(/\/$/, ""),
  description:
    "Khám phá quán nightlife, cast, ưu đãi và cẩm nang đi đêm tại Việt Nam trên Vietyoru.",
};

export const absoluteSiteUrl = (path = "/") => {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;

  return `${siteConfig.url}${normalizedPath}`;
};
