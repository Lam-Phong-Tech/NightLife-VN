import type { Metadata } from "next";
import RankingPage from "../../(public)/xep-hang/page";
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
  return createLocalizedPageMetadata(await requireRouteLanguage(params), "rankings");
}

export default function LocalizedRankingPage() {
  return <RankingPage />;
}
