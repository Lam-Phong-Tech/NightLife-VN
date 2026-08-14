import type { Metadata } from "next";
import HomePageClient from "../HomePageClient";
import {
  requireRouteLanguage,
  type LocalizedRouteParams,
} from "@/lib/i18n/server-route-locale";
import { createLocalizedPageMetadata } from "@/lib/seo/localized-page-metadata";
import { HomeHeroPreload } from "@/components/home/HomeHeroPreload";
import { selectHomeHeroBanner } from "@/lib/home-hero";
import { fetchHomeBannersOnServer } from "@/lib/home-server-data";

export async function generateMetadata({
  params,
}: {
  params: LocalizedRouteParams;
}): Promise<Metadata> {
  return createLocalizedPageMetadata(await requireRouteLanguage(params), "home");
}

export default async function LocalizedHomePage() {
  const initialBanners = await fetchHomeBannersOnServer();
  const activeHeroBanner = selectHomeHeroBanner(initialBanners);

  return (
    <>
      <HomeHeroPreload banner={activeHeroBanner} />
      <HomePageClient initialBanners={initialBanners} />
    </>
  );
}
