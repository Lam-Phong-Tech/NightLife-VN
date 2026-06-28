import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ApiError } from "@/lib/api/client";
import { getStoreDetail } from "@/lib/api/store-detail";
import StoreDetailClient from "./StoreDetailClient";

type PageProps = {
  params: Promise<{ slug: string }>;
};

const legacyStoreSlugMap: Record<string, string> = {
  "club-lumiere": "neon-club",
  "ktv-hoang-gia": "golden-voice-ktv",
  "diamond-bar": "crimson-bar",
  "sora-lounge": "jade-lounge",
};

export const dynamic = "force-dynamic";

const resolveStoreSlug = (slug: string) => legacyStoreSlugMap[slug] ?? slug;

const loadStore = async (slug: string) => {
  try {
    return await getStoreDetail(resolveStoreSlug(slug));
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
    const store = await getStoreDetail(resolveStoreSlug(slug));

    return {
      title: store.seo.title,
      description: store.seo.description,
      alternates: {
        canonical: store.seo.canonicalPath,
      },
      openGraph: {
        title: store.seo.title,
        description: store.seo.description,
        images: store.seo.ogImage ? [{ url: store.seo.ogImage }] : undefined,
      },
    };
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      return {
        title: "Không tìm thấy quán | NightLife VN",
        description: "Quán này không tồn tại hoặc chưa được công khai.",
      };
    }

    return {
      title: "Chi tiết quán | NightLife VN",
      description: "Thông tin quán, cast, ưu đãi, bản đồ và đặt chỗ trên NightLife VN.",
    };
  }
}

export default async function Page({ params }: PageProps) {
  const { slug } = await params;
  const store = await loadStore(slug);

  return <StoreDetailClient store={store} />;
}
