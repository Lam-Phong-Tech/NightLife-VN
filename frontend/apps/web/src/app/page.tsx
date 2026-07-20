import type { Metadata } from "next";
import { BreadcrumbJsonLd } from "@/components/seo/BreadcrumbJsonLd";
import { createPageMetadata } from "@/lib/seo/page-metadata";
import { jsonLdDocument, webPageJsonLd } from "@/lib/seo/structured-data";
import { siteConfig } from "@/lib/site";
import HomePageClient from "./HomePageClient";

export const metadata: Metadata = createPageMetadata({
  title: `${siteConfig.name} | ${siteConfig.tagline}`,
  description: siteConfig.description,
  path: "/",
  absoluteTitle: true,
});

const homePageStructuredData = jsonLdDocument(
  webPageJsonLd({
    path: "/",
    name: `${siteConfig.name} | ${siteConfig.tagline}`,
    description: siteConfig.description,
  }),
);

export default function Page() {
  return (
    <>
      <script
        id="home-webpage-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(homePageStructuredData) }}
      />
      <BreadcrumbJsonLd items={[{ name: "Trang chủ", path: "/" }]} idPath="/" />
      <HomePageClient />
    </>
  );
}
