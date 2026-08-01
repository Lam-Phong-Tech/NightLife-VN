import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ApiError } from "@/lib/api/client";
import { getStoreDetail } from "@/lib/api/store-detail";
import { buildStoreMetadata } from "@/lib/seo/store-metadata";
import StoreDetailClient from "./StoreDetailClient";
import { buildStoreStructuredData } from "./store-detail.schema";

type PageProps = {
  params: Promise<{ slug: string }>;
};

const legacyStoreSlugMap: Record<string, string> = {
  "club-lumiere": "neon-club",
  "yakitori-hanoi": "tokyo-kitchen",
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
    return buildStoreMetadata(store);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
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
  const { slug } = await params;
  const store = await loadStore(slug);
  const structuredData = buildStoreStructuredData(store);

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
