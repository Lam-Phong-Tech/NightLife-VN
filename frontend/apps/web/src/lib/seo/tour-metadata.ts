import type { Metadata } from "next";
import { absoluteSiteUrl } from "@/lib/site";

type TourStop = { store: { media: Array<{ url: string }> } };

type TourForMetadata = {
  id: string;
  slug?: string | null;
  title: string;
  subtitle?: string | null;
  coverUrl?: string | null;
  stops: TourStop[];
};

export function buildTourMetadata(tour: TourForMetadata): Metadata {
  // Use slug for SEO-friendly URL; fall back to ID only if slug is unavailable
  const identifier = tour.slug || tour.id;
  const canonicalPath = `/tour/${identifier}`;
  const image = tour.coverUrl || undefined;
  const description =
    tour.subtitle ||
    `Chi tiết hành trình ${tour.title}, các điểm dừng và đặt tour nightlife trên Vietyoru.`;
  const fullTitle = `${tour.title} | Tour nightlife Vietyoru`;

  return {
    title: fullTitle,
    description,
    robots: { index: true, follow: true },
    alternates: {
      canonical: canonicalPath,
    },
    openGraph: {
      title: tour.title,
      description,
      url: absoluteSiteUrl(canonicalPath),
      images: image ? [{ url: image }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description,
      images: image ? [image] : undefined,
    },
  };
}
