import type { PublicCastDetail } from "@/lib/api/cast-detail";
import { breadcrumbJsonLd, jsonLdGraph } from "@/lib/seo/structured-data";
import { absoluteSiteUrl } from "@/lib/site";

export function buildCastStructuredData(cast: PublicCastDetail) {
  const canonicalPath = cast.seo.canonicalPath || `/casts/${cast.slug}`;
  const url = absoluteSiteUrl(canonicalPath);
  const displayName = cast.publicAlias ?? cast.stageName ?? cast.name;
  const imageUrls = [
    cast.thumbnailUrl,
    ...cast.gallery.filter((item) => item.type === "IMAGE").map((item) => item.url),
  ].filter((item): item is string => Boolean(item));

  return jsonLdGraph([
    {
      "@type": "Person",
      "@id": `${url}#cast`,
      name: displayName,
      alternateName: cast.stageName,
      description: cast.seo.description,
      url,
      image: imageUrls.length ? imageUrls.slice(0, 6) : undefined,
      knowsLanguage: cast.languages,
      knowsAbout: cast.tags,
      worksFor: {
        "@type": "LocalBusiness",
        name: cast.store.name,
        url: absoluteSiteUrl(`/stores/${cast.store.slug}`),
        address: cast.store.address
          ? {
              "@type": "PostalAddress",
              streetAddress: cast.store.address,
              addressLocality: cast.store.district ?? cast.store.city,
              addressRegion: cast.store.city,
              addressCountry: "VN",
            }
          : undefined,
      },
      makesOffer: cast.hourlyRateVnd
        ? {
            "@type": "Offer",
            priceCurrency: "VND",
            price: cast.hourlyRateVnd,
            availability: "https://schema.org/InStock",
          }
        : undefined,
    },
    breadcrumbJsonLd(
      [
        { name: "Trang chủ", path: "/" },
        { name: "Cast", path: "/danh-sach-cast" },
        { name: displayName, path: canonicalPath },
      ],
      canonicalPath,
    ),
  ]);
}
