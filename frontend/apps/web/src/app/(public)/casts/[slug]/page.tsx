import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ApiError } from "@/lib/api/client";
import { getCastDetail } from "@/lib/api/cast-detail";
import { absoluteSiteUrl } from "@/lib/site";
import CastProfileClient from "./CastProfileClient";

type PageProps = {
  params: Promise<{ slug: string }>;
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

const resolveCastSlug = (slug: string) => legacyCastSlugMap[slug] ?? slug;

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
  const { slug } = await params;

  try {
    const cast = await getCastDetail(resolveCastSlug(slug));
    const canonicalPath = cast.seo.canonicalPath || `/casts/${cast.slug}`;
    const images = cast.seo.ogImage ? [{ url: cast.seo.ogImage }] : undefined;

    return {
      title: { absolute: cast.seo.title },
      description: cast.seo.description,
      alternates: {
        canonical: canonicalPath,
      },
      openGraph: {
        title: cast.seo.title,
        description: cast.seo.description,
        url: absoluteSiteUrl(canonicalPath),
        images,
      },
      twitter: {
        card: "summary_large_image",
        title: cast.seo.title,
        description: cast.seo.description,
        images: cast.seo.ogImage ? [cast.seo.ogImage] : undefined,
      },
    };
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
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
  const { slug } = await params;
  const cast = await loadCast(slug);

  return <CastProfileClient cast={cast} />;
}
