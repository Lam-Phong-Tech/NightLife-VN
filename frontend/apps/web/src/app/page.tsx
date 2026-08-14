import type { Metadata } from "next";
import { BreadcrumbJsonLd } from "@/components/seo/BreadcrumbJsonLd";
import { createPageMetadata } from "@/lib/seo/page-metadata";
import { jsonLdDocument, webPageJsonLd } from "@/lib/seo/structured-data";
import { siteConfig } from "@/lib/site";
import HomePageClient from "./HomePageClient";
import { HomeHeroPreload } from "@/components/home/HomeHeroPreload";
import { selectHomeHeroBanner } from "@/lib/home-hero";
import { fetchHomePageInitialData } from "@/lib/home-server-data";

export const metadata: Metadata = createPageMetadata({
  title: `${siteConfig.name} | ${siteConfig.tagline}`,
  description: siteConfig.description,
  path: "/",
  absoluteTitle: true,
});

const homePageStructuredData = jsonLdDocument(
  webPageJsonLd({
    path: "/",
    name: `${siteConfig.name} | ${siteConfig.tagline}`,
    description: siteConfig.description,
  }),
);

export default async function Page() {
  const { banners: initialBanners, appearance: initialAppearance } =
    await fetchHomePageInitialData();
  const activeHeroBanner = selectHomeHeroBanner(initialBanners);

  return (
    <>
      <HomeHeroPreload banner={activeHeroBanner} />
      <script
        id="home-webpage-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(homePageStructuredData) }}
      />
      <BreadcrumbJsonLd items={[{ name: "Trang chủ", path: "/" }]} idPath="/" />
      <HomePageClient
        initialBanners={initialBanners}
        initialAppearance={initialAppearance}
      />
    </>
  );
}
