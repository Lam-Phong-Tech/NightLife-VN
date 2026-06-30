import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ApiError } from "@/lib/api/client";
import { getCastDetail } from "@/lib/api/cast-detail";
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

    return {
      title: cast.seo.title,
      description: cast.seo.description,
      alternates: {
        canonical: cast.seo.canonicalPath,
      },
      openGraph: {
        title: cast.seo.title,
        description: cast.seo.description,
        images: cast.seo.ogImage ? [{ url: cast.seo.ogImage }] : undefined,
      },
    };
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      return {
        title: "Không tìm thấy cast | NightLife VN",
        description: "Cast này không tồn tại hoặc chưa được public qua CMS.",
      };
    }

    return {
      title: "Cast Profile | NightLife VN",
      description: "Xem bio, gallery public, ngôn ngữ và đặt booking theo cast trên NightLife VN.",
    };
  }
}

export default async function Page({ params }: PageProps) {
  const { slug } = await params;
  const cast = await loadCast(slug);

  return <CastProfileClient cast={cast} />;
}
