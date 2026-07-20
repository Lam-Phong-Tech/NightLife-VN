import type { Metadata } from "next";
import { BreadcrumbJsonLd } from "@/components/seo/BreadcrumbJsonLd";
import { createPageMetadata } from "@/lib/seo/page-metadata";
import { siteConfig } from "@/lib/site";
import HomePageClient from "./HomePageClient";

export const metadata: Metadata = createPageMetadata({
  title: `${siteConfig.name} | ${siteConfig.tagline}`,
  description: siteConfig.description,
  path: "/",
  absoluteTitle: true,
});

export default function Page() {
  return (
    <>
      <BreadcrumbJsonLd items={[{ name: "Trang chủ", path: "/" }]} idPath="/" />
      <HomePageClient />
    </>
  );
}
