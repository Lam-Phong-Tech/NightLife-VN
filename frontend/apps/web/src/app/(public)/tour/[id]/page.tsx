import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ApiError } from "@/lib/api/client";
import { tourApi } from "@/lib/api/tours";
import { absoluteSiteUrl } from "@/lib/site";
import TourDetailClient from "./TourDetailClient";

type PageProps = {
  params: Promise<{ id: string }>;
};

export const dynamic = "force-dynamic";

const loadTour = async (id: string) => {
  try {
    return await tourApi.get(id);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      notFound();
    }

    throw error;
  }
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;

  try {
    const tour = await tourApi.get(id);
    const canonicalPath = `/tour/${tour.id}`;
    const image = tour.coverUrl || tour.stops[0]?.store.media[0]?.url || undefined;

    return {
      title: `${tour.title} | Tour nightlife Vietyoru`,
      description:
        tour.subtitle || `Chi tiết hành trình ${tour.title}, các điểm dừng và đặt tour nightlife trên Vietyoru.`,
      alternates: {
        canonical: canonicalPath,
      },
      openGraph: {
        title: tour.title,
        description:
          tour.subtitle || `Chi tiết hành trình ${tour.title}, các điểm dừng và đặt tour nightlife trên Vietyoru.`,
        url: absoluteSiteUrl(canonicalPath),
        images: image ? [{ url: image }] : undefined,
      },
    };
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      return {
        title: "Không tìm thấy tour",
        description: "Tour này không tồn tại hoặc chưa được công khai trên Vietyoru.",
      };
    }

    return {
      title: "Chi tiết tour",
      description: "Chi tiết hành trình và đặt tour nightlife trên Vietyoru.",
    };
  }
}

export default async function Page({ params }: PageProps) {
  const { id } = await params;
  const tour = await loadTour(id);

  return <TourDetailClient tour={tour} />;
}
