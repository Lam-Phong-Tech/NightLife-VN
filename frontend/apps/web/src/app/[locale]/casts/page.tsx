import type { Metadata } from "next";
import { CastDirectoryPage } from "../../(public)/danh-sach-cast/page";
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
  return createLocalizedPageMetadata(await requireRouteLanguage(params), "casts");
}

export default function LocalizedCastListPage() {
  return <CastDirectoryPage />;
}
