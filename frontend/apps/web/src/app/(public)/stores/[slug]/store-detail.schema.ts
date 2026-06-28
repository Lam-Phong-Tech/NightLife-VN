import type { PublicStoreDetail, StoreOpeningHour } from "@/lib/api/store-detail";
import { readableName } from "./store-detail.helpers";

const baseUrl = "https://nightlife.hn";

const schemaDayMap: Record<string, string> = {
  monday: "Monday",
  tuesday: "Tuesday",
  wednesday: "Wednesday",
  thursday: "Thursday",
  friday: "Friday",
  saturday: "Saturday",
  sunday: "Sunday",
};

const openingSpec = (openingHours?: Record<string, StoreOpeningHour> | null) => {
  if (!openingHours) {
    return undefined;
  }

  const specs = Object.entries(openingHours)
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
  const url = `${baseUrl}${store.seo.canonicalPath}`;

  return {
    "@context": "https://schema.org",
    "@type": "NightClub",
    "@id": `${url}#store`,
    name: readableName(store.name),
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
    hasOfferCatalog: store.activeCoupons.length
      ? {
          "@type": "OfferCatalog",
          name: `Active coupons for ${readableName(store.name)}`,
          itemListElement: store.activeCoupons.map((coupon) => ({
            "@type": "Offer",
            name: coupon.name,
            description: coupon.description ?? undefined,
            validFrom: coupon.startsAt,
            validThrough: coupon.endsAt ?? undefined,
          })),
        }
      : undefined,
  };
}
