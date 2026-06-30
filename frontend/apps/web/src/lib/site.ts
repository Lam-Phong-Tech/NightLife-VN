const configuredSiteUrl =
  process.env.NEXT_PUBLIC_SITE_URL || process.env.SITE_URL || "https://nightlife.hn";

const normalizedSiteUrl = /^https?:\/\//i.test(configuredSiteUrl)
  ? configuredSiteUrl
  : `https://${configuredSiteUrl}`;

export const siteConfig = {
  name: "Vietyoru",
  tagline: "Vietnam Nightlife Guide",
  url: normalizedSiteUrl.replace(/\/$/, ""),
  description:
    "Kham pha quan nightlife, cast, uu dai va cam nang di dem tai Viet Nam tren Vietyoru.",
};

export const absoluteSiteUrl = (path = "/") => {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;

  return `${siteConfig.url}${normalizedPath}`;
};
