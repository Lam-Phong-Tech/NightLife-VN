import type { PublicCastDetail, RelatedCast } from "@/lib/api/cast-detail";

export type CastMedia = {
  id: string;
  type: "IMAGE" | "VIDEO";
  url: string;
  alt: string;
  purpose?: string | null;
  mimeType?: string | null;
};

export type CastProfile = {
  id: string;
  slug: string;
  stageName: string;
  name: string;
  publicHeadline: string;
  bio: string;
  tags: string[];
  languages: string[];
  hourlyRateVnd: number | null;
  thumbnailUrl: string | null;
  gallery: CastMedia[];
  monthOfBirth?: number | null;
  zodiacSign?: string | null;
  heightCm?: number | null;
  measurements?: string | null;
  interests?: string[];
  rating: number;
  store: PublicCastDetail["store"];
  relatedCasts: RelatedCast[];
};

export type CastGalleryAction = "select" | "open" | "next" | "previous" | "video";

export type CastProfileTrack = (
  action: "booking" | "gallery" | "store" | "favorite" | "related",
  metadata?: Record<string, unknown>,
) => void;
