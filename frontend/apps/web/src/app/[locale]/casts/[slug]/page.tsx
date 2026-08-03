import type { Metadata } from "next";
import CastDetailPage, {
  generateMetadata as generateCastDetailMetadata,
} from "../../../(public)/casts/[slug]/page";
import { requireRouteLanguage } from "@/lib/i18n/server-route-locale";

type PageProps = {
  params: Promise<{ locale: string; slug: string }>;
};

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const locale = await requireRouteLanguage(params);

  return generateCastDetailMetadata({
    params: Promise.resolve({ slug, locale }),
  });
}

export default async function LocalizedCastDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const locale = await requireRouteLanguage(params);

  return CastDetailPage({ params: Promise.resolve({ slug, locale }) });
}
