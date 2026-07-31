import type { Metadata } from "next";
import RestaurantPage from "../../(public)/nha-hang/page";
import {
  requireRouteLanguage,
  type LocalizedRouteParams,
} from "@/lib/i18n/server-route-locale";
import { createLocalizedPageMetadata } from "@/lib/seo/localized-page-metadata";

export async function generateMetadata({
  params,
}: {
  params: LocalizedRouteParams;
}): Promise<Metadata> {
  return createLocalizedPageMetadata(await requireRouteLanguage(params), "restaurants");
}

export default function LocalizedRestaurantPage() {
  return <RestaurantPage />;
}
