import type { Metadata } from "next";
import { permanentRedirect } from "next/navigation";
import StoreDetailPage, {
  generateMetadata as generateStoreDetailMetadata,
  resolveStoreSlug,
} from "../../../(public)/stores/[slug]/page";
import { requireRouteLanguage } from "@/lib/i18n/server-route-locale";

type PageProps = {
  params: Promise<{ locale: string; slug: string }>;
};

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const locale = await requireRouteLanguage(params);

  return generateStoreDetailMetadata({
    params: Promise.resolve({ slug, locale }),
  });
}

export default async function LocalizedStoreDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const locale = await requireRouteLanguage(params);
  const resolvedSlug = resolveStoreSlug(slug);

  if (resolvedSlug !== slug) {
    permanentRedirect(`/${locale}/stores/${resolvedSlug}`);
  }

  return StoreDetailPage({ params: Promise.resolve({ slug, locale }) });
}
