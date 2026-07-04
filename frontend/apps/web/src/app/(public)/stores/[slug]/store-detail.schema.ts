import type { PublicStoreDetail, StoreOpeningHour } from "@/lib/api/store-detail";
import { normalizeStoreOpeningHours } from "@/lib/booking-time-slots";
import { breadcrumbJsonLd, jsonLdGraph } from "@/lib/seo/structured-data";
import { absoluteSiteUrl } from "@/lib/site";
import { readableName } from "./store-detail.helpers";

const schemaDayMap: Record<string, string> = {
  monday: "Monday",
  tuesday: "Tuesday",
  wednesday: "Wednesday",
  thursday: "Thursday",
  friday: "Friday",
  saturday: "Saturday",
  sunday: "Sunday",
};

const schemaTypeByCategory: Record<string, string> = {
  BAR: "BarOrPub",
  CLUB: "NightClub",
  LOUNGE: "BarOrPub",
  GIRLS_BAR: "NightClub",
  KARAOKE: "EntertainmentBusiness",
  MASSAGE_SPA: "HealthAndBeautyBusiness",
  RESTAURANT: "Restaurant",
  CASINO: "Casino",
};

const openingSpec = (openingHours?: Record<string, StoreOpeningHour> | null) => {
  const normalizedOpeningHours = normalizeStoreOpeningHours(openingHours);

  if (!normalizedOpeningHours) {
    return undefined;
  }

  const specs = Object.entries(normalizedOpeningHours)
    .filter(([, slot]) => slot && !slot.closed && slot.open && slot.close)
    .map(([day, slot]) => ({
      "@type": "OpeningHoursSpecification",
      dayOfWeek: schemaDayMap[day] ?? day,
      opens: slot.open,
      closes: slot.close,
    }));

  return specs.length ? specs : undefined;
};

export function buildStoreStructuredData(store: PublicStoreDetail) {
  const imageUrls = store.gallery
    .filter((item) => item.type === "IMAGE")
    .map((item) => item.url)
    .slice(0, 6);
  const canonicalPath = store.seo.canonicalPath || `/stores/${store.slug}`;
  const url = absoluteSiteUrl(canonicalPath);
  const storeName = readableName(store.name);
  const businessType = schemaTypeByCategory[store.category] ?? "LocalBusiness";

  return jsonLdGraph([
    {
    "@type": ["LocalBusiness", businessType],
    "@id": `${url}#store`,
    name: storeName,
    description: store.seo.description,
    url,
    image: imageUrls.length ? imageUrls : undefined,
    telephone: store.phone ?? undefined,
    address: {
      "@type": "PostalAddress",
      streetAddress: store.address ?? undefined,
      addressLocality: store.district ?? store.city,
      addressRegion: store.city,
      addressCountry: "VN",
    },
    geo:
      typeof store.latitude === "number" && typeof store.longitude === "number"
        ? {
            "@type": "GeoCoordinates",
            latitude: store.latitude,
            longitude: store.longitude,
          }
        : undefined,
    openingHoursSpecification: openingSpec(store.openingHours),
    priceRange: store.priceReference.startingFromVnd
      ? `From ${store.priceReference.startingFromVnd} VND`
      : undefined,
    event: store.campaigns.length
      ? store.campaigns.map((campaign) => ({
          "@type": "Event",
          name: campaign.title,
          description: campaign.description ?? undefined,
          eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
          eventStatus: "https://schema.org/EventScheduled",
          location: {
            "@id": `${url}#store`,
          },
        }))
      : undefined,
    hasOfferCatalog: store.activeCoupons.length
      ? {
          "@type": "OfferCatalog",
          name: `Active coupons for ${storeName}`,
          itemListElement: store.activeCoupons.map((coupon) => ({
            "@type": "Offer",
            name: coupon.name,
            description: coupon.description ?? undefined,
            validFrom: coupon.startsAt,
            validThrough: coupon.endsAt ?? undefined,
          })),
        }
      : undefined,
    },
    breadcrumbJsonLd(
      [
        { name: "Trang chủ", path: "/" },
        { name: "Tìm quán", path: "/danh-sach-quan" },
        { name: storeName, path: canonicalPath },
      ],
      canonicalPath,
    ),
  ]);
}
