import type { Metadata } from "next";
import { breadcrumbJsonLd, jsonLdGraph } from "@/lib/seo/structured-data";
import { absoluteSiteUrl } from "@/lib/site";
import { TOUR_PAGE_METADATA } from "@/lib/seo/tour-listing-metadata";
import { TourClient } from "./TourClient";

export const metadata: Metadata = TOUR_PAGE_METADATA;

export default function TourPage() {
  const structuredData = jsonLdGraph([
    breadcrumbJsonLd(
      [
        { name: "Trang chủ", path: "/" },
        { name: "Tour", path: "/tour" },
      ],
      "/tour",
    ),
    {
      "@type": "ItemList",
      "@id": `${absoluteSiteUrl("/tour")}#tour-list`,
      name: "Tour nightlife Vietyoru",
    },
  ]);

  return (
    <main className="tour-directory-page">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
      <TourClient />
    </main>
  );
}
