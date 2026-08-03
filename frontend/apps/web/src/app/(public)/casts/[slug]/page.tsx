import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ApiError } from "@/lib/api/client";
import { getCastDetail } from "@/lib/api/cast-detail";
import type { LanguageCode } from "@/lib/i18n/locales";
import { buildCastMetadata } from "@/lib/seo/cast-metadata";
import CastProfileClient from "./CastProfileClient";
import { buildCastStructuredData } from "./cast-profile.schema";

type PageProps = {
  params: Promise<{ slug: string; locale?: LanguageCode }>;
};

const legacyCastSlugMap: Record<string, string> = {
  aiko: "aya-velvet",
  hana: "hana-sakura-lounge",
  michi: "miyuki-moonlight",
  rina: "rina-velvet",
  yuki: "yuki-sakura-lounge",
  "kotone-tokyo-kitchen": "kotone-tokyo",
  "sakura-moonlight-q1": "sakura-moonlight",
  "yuna-neon-district": "yuna-neon",
};

export const dynamic = "force-dynamic";

export const resolveCastSlug = (slug: string) => legacyCastSlugMap[slug] ?? slug;

const loadCast = async (slug: string) => {
  try {
    return await getCastDetail(resolveCastSlug(slug));
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      notFound();
    }

    throw error;
  }
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug, locale } = await params;

  try {
    const cast = await getCastDetail(resolveCastSlug(slug));
    return buildCastMetadata(cast, locale);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      notFound();
      return {
        title: "Không tìm thấy cast",
        description: "Cast này không tồn tại hoặc chưa được công khai trên Vietyoru.",
      };
    }

    return {
      title: "Hồ sơ cast",
      description: "Xem bio, gallery public, ngôn ngữ hỗ trợ và đặt booking theo cast trên Vietyoru.",
    };
  }
}

export default async function Page({ params }: PageProps) {
  const { slug, locale } = await params;
  const cast = await loadCast(slug);
  const structuredData = buildCastStructuredData(cast, locale);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <CastProfileClient cast={cast} />
    </>
  );
}
