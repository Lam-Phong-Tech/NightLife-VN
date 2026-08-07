import type { Metadata } from "next";
import { BreadcrumbJsonLd } from "@/components/seo/BreadcrumbJsonLd";
import { createPageMetadata } from "@/lib/seo/page-metadata";
import { jsonLdDocument, webPageJsonLd } from "@/lib/seo/structured-data";
import { siteConfig } from "@/lib/site";
import HomePageClient from "./HomePageClient";
import type { CmsContentItem } from "@/lib/api/content";

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

// ─── Server-side banner pre-fetch ────────────────────────────────────────────
// Gọi thẳng từ server để loại bỏ 1 round-trip API từ browser sau hydrate.
// Không dùng apiClient (vì nó cần browser cookie/token) — dùng fetch trực tiếp.
async function fetchBannersOnServer(): Promise<CmsContentItem[]> {
  try {
    const backendUrl =
      process.env.BACKEND_API_URL ||
      process.env.NEXT_PUBLIC_API_URL ||
      "http://localhost:3001";
    const base = backendUrl.replace(/\/api\/?$/, "").replace(/\/$/, "");
    const url = `${base}/contents?type=BANNER&limit=10`;

    const res = await fetch(url, {
      // Revalidate sau 60s để banner không stale quá lâu nhưng vẫn được cache
      next: { revalidate: 60 },
    });

    if (!res.ok) return [];
    const json = (await res.json()) as { data?: CmsContentItem[] };
    return json.data ?? [];
  } catch {
    return [];
  }
}

// Lấy URL ảnh đầu tiên của hero banner để inject preload hint
function extractFirstHeroBannerImageUrl(banners: CmsContentItem[]): string | null {
  for (const banner of banners) {
    const meta = (banner.metadata ?? {}) as Record<string, unknown>;
    const position = typeof meta.position === "string" ? meta.position : "";
    // Chỉ lấy banner hero (Trang chủ #1) hoặc không có position
    if (position && position !== "Trang chủ #1") continue;

    const imageUrl = typeof meta.imageUrl === "string" && meta.imageUrl.trim()
      ? meta.imageUrl.trim()
      : null;
    if (imageUrl) return imageUrl;
  }
  return null;
}

export default async function Page() {
  // Pre-fetch banner ở server — chạy song song với HTML render
  const initialBanners = await fetchBannersOnServer();
  const firstHeroBannerImageUrl = extractFirstHeroBannerImageUrl(initialBanners);

  return (
    <>
      {/* Preload ảnh banner đầu tiên — browser tải ảnh trước khi JS parse xong */}
      {firstHeroBannerImageUrl && (
        <link
          rel="preload"
          as="image"
          href={firstHeroBannerImageUrl}
          // @ts-expect-error: fetchpriority là attribute hợp lệ nhưng TS chưa có type
          fetchpriority="high"
        />
      )}
      <script
        id="home-webpage-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(homePageStructuredData) }}
      />
      <BreadcrumbJsonLd items={[{ name: "Trang chủ", path: "/" }]} idPath="/" />
      <HomePageClient initialBanners={initialBanners} />
    </>
  );
}
