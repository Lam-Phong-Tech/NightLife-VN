import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ApiError } from "@/lib/api/client";
import { getStoreDetail } from "@/lib/api/store-detail";
import type { LanguageCode } from "@/lib/i18n/locales";
import { buildStoreMetadata } from "@/lib/seo/store-metadata";
import StoreDetailClient from "./StoreDetailClient";
import { buildStoreStructuredData } from "./store-detail.schema";

type PageProps = {
  params: Promise<{ slug: string; locale?: LanguageCode }>;
};

const legacyStoreSlugMap: Record<string, string> = {
  "club-lumiere": "neon-club",
  "yakitori-hanoi": "tokyo-kitchen",
  "ktv-hoang-gia": "golden-voice-ktv",
  "diamond-bar": "crimson-bar",
  "sora-lounge": "jade-lounge",
  "draft-store-1785327636355": "store-d7626daa",
  "draft-store-1785333389067": "store-622ba139",
  "draft-store-1785333671416": "store-15001b2b",
  "draft-store-1785342535176": "store-51c1c584",
  "draft-store-1785343030488": "store-d881e750",
  "draft-store-1785401754710": "store-04bb1961",
  "-1": "store-f702cf4e",
  "-2": "store-234448d8",
  "-3": "store-bc67d3eb",
};

export const dynamic = "force-dynamic";

export const resolveStoreSlug = (slug: string) => legacyStoreSlugMap[slug] ?? slug;

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
  const { slug, locale } = await params;

  try {
    const store = await getStoreDetail(resolveStoreSlug(slug));
    return buildStoreMetadata(store, locale);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      notFound();
      return {
        title: "Không tìm thấy quán",
        description: "Quán này không tồn tại hoặc chưa được công khai trên Vietyoru.",
      };
    }

    return {
      title: "Chi tiết quán",
      description: "Thông tin quán, cast, ưu đãi, bản đồ và đặt chỗ trên Vietyoru.",
    };
  }
}

export default async function Page({ params }: PageProps) {
  const { slug, locale } = await params;
  const store = await loadStore(slug);
  const structuredData = buildStoreStructuredData(store, locale);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <StoreDetailClient store={store} />
    </>
  );
}
