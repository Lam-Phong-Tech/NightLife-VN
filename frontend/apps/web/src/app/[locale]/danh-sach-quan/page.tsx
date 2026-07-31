import type { Metadata } from "next";
import VenueListPage from "../../(public)/danh-sach-quan/page";
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
  return createLocalizedPageMetadata(await requireRouteLanguage(params), "venues");
}

export default function LocalizedVenueListPage() {
  return <VenueListPage />;
}
