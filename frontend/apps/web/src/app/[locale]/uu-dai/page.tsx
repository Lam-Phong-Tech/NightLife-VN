import type { Metadata } from "next";
import OffersPage from "../../(member)/uu-dai/page";
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
  return createLocalizedPageMetadata(await requireRouteLanguage(params), "offers");
}

export default function LocalizedOffersPage() {
  return <OffersPage />;
}
