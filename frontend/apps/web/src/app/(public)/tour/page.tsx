import type { Metadata } from "next";
import { breadcrumbJsonLd, jsonLdGraph } from "@/lib/seo/structured-data";
import { absoluteSiteUrl } from "@/lib/site";
import { TourClient } from "./TourClient";

export const metadata: Metadata = {
  title: "Tour nightlife và trải nghiệm đêm",
  description:
    "Gợi ý tour nightlife thật theo dữ liệu quán, ưu đãi và khu vực đang hoạt động trên Vietyoru.",
  alternates: {
    canonical: "/tour",
  },
};

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
    <main
      style={{
        minHeight: "100vh",
        background: "#0c0c0f",
        color: "#f3f0ea",
        padding: "clamp(22px, 5vw, 56px) clamp(16px, 5vw, 48px)",
      }}
    >
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
      <TourClient />
    </main>
  );
}
