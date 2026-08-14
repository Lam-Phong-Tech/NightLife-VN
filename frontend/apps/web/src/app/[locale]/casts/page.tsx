import type { Metadata } from "next";
import { CastDirectoryPage } from "../../(public)/danh-sach-cast/page";
import {
  requireRouteLanguage,
  type LocalizedRouteParams,
} from "@/lib/i18n/server-route-locale";
import { createLocalizedPageMetadata } from "@/lib/seo/localized-page-metadata";
import { discoveryApi } from "@/lib/api/discovery";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function generateMetadata({
  params,
}: {
  params: LocalizedRouteParams;
}): Promise<Metadata> {
  return createLocalizedPageMetadata(await requireRouteLanguage(params), "casts");
}

/**
 * Route /[locale]/casts — Server Component (không có "use client")
 *
 * Fetch trang 1 với 12 cast trên server trước khi trả HTML về browser.
 * → User thấy nội dung ngay, không có skeleton ở lần tải đầu tiên.
 * → Filter/sort/search vẫn hoạt động bình thường ở client sau hydration.
 *
 * Graceful degrade: nếu API lỗi → initialCasts = [] → client tự fetch
 * như behaviour cũ, skeleton sẽ hiện (không break giao diện).
 */
export default async function LocalizedCastListPage() {
  const result = await discoveryApi
    .listCasts({ limit: 12, page: 1, sort: "newest" })
    .catch(() => null);

  return (
    <CastDirectoryPage
      initialCasts={result?.casts ?? []}
      initialTotal={result?.total ?? 0}
    />
  );
}

