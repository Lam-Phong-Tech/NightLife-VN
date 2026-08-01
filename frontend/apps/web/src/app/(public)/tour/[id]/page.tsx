import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ApiError } from "@/lib/api/client";
import { tourApi } from "@/lib/api/tours";
import { buildTourMetadata } from "@/lib/seo/tour-metadata";
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
    return buildTourMetadata(tour);
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
