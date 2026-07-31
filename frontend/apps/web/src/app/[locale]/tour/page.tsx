import type { Metadata } from "next";
import { TourClient } from "../../(public)/tour/TourClient";
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
  return createLocalizedPageMetadata(await requireRouteLanguage(params), "tour");
}

export default function LocalizedTourPage() {
  return (
    <main className="tour-directory-page">
      <TourClient />
    </main>
  );
}
