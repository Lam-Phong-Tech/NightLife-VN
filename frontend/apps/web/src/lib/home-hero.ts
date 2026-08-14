import type { CmsContentItem, PublicResponsiveImage } from "@/lib/api/content";

export const HOME_HERO_IMAGE_SIZES = "(max-width: 767px) calc(100vw - 36px), calc(100vw - 100px)";

export type HomeBannerMetadata = {
  description?: string;
  tag?: string;
  link?: string;
  statusLabel?: string;
  subtitle?: string;
  imageUrl?: string;
  position?: string;
  order?: number;
};

export function getHomeBannerMetadata(content: CmsContentItem): HomeBannerMetadata {
  const metadata = (content.metadata ?? {}) as HomeBannerMetadata;
  if (metadata.link?.startsWith("/quan/")) {
    return {
      ...metadata,
      link: metadata.link.replace(/^\/quan\//, "/stores/"),
    };
  }
  return metadata;
}

export function getHomeBannerImageUrl(content: CmsContentItem) {
  const metadataImageUrl = getHomeBannerMetadata(content).imageUrl;
  const imageUrl =
    typeof metadataImageUrl === "string" && metadataImageUrl.trim()
      ? metadataImageUrl
      : content.imageUrl;
  return typeof imageUrl === "string" && imageUrl.trim() ? imageUrl.trim() : null;
}

export function hasHomeBannerImage(content: CmsContentItem) {
  return Boolean(getHomeBannerImageUrl(content));
}

function stableBannerOrder(left: CmsContentItem, right: CmsContentItem) {
  const leftOrder = getHomeBannerMetadata(left).order;
  const rightOrder = getHomeBannerMetadata(right).order;
  return (
    (typeof leftOrder === "number" ? leftOrder : Number.MAX_SAFE_INTEGER) -
      (typeof rightOrder === "number" ? rightOrder : Number.MAX_SAFE_INTEGER) ||
    left.createdAt.localeCompare(right.createdAt) ||
    left.id.localeCompare(right.id)
  );
}

export function sortHomeHeroBanners(contents: CmsContentItem[]) {
  return [...contents]
    .filter(hasHomeBannerImage)
    .filter((content) => {
      const position = getHomeBannerMetadata(content).position;
      return position === "Trang chủ #1" || !position;
    })
    .sort(stableBannerOrder);
}

export function selectHomeHeroBanner(contents: CmsContentItem[]) {
  return sortHomeHeroBanners(contents)[0] ?? null;
}

export function createResponsiveImageSrcSet(
  image: PublicResponsiveImage | null | undefined,
  format: "webp" | "avif",
) {
  if (!image?.variants?.length) return undefined;
  const candidates = [...image.variants]
    .sort((left, right) => left.width - right.width)
    .flatMap((variant) => {
      const url = format === "avif" ? variant.avifUrl : variant.webpUrl;
      return url ? [`${url} ${variant.width}w`] : [];
    });
  return candidates.length ? candidates.join(", ") : undefined;
}

export function buildHomeHeroPreload(content: CmsContentItem | null) {
  if (!content) return null;
  const fallbackUrl = getHomeBannerImageUrl(content);
  if (!fallbackUrl) return null;

  const image = content.responsiveImage;
  const avifSrcSet = createResponsiveImageSrcSet(image, "avif");
  const webpSrcSet = createResponsiveImageSrcSet(image, "webp");
  const firstAvifUrl = image?.variants
    ?.slice()
    .sort((left, right) => left.width - right.width)
    .find((variant) => variant.avifUrl)?.avifUrl;
  const firstWebpUrl = image?.variants
    ?.slice()
    .sort((left, right) => left.width - right.width)
    .find((variant) => variant.webpUrl)?.webpUrl;

  if (avifSrcSet && firstAvifUrl) {
    return {
      href: firstAvifUrl,
      type: "image/avif" as const,
      imageSrcSet: avifSrcSet,
      imageSizes: HOME_HERO_IMAGE_SIZES,
    };
  }
  if (webpSrcSet && firstWebpUrl) {
    return {
      href: firstWebpUrl,
      type: "image/webp" as const,
      imageSrcSet: webpSrcSet,
      imageSizes: HOME_HERO_IMAGE_SIZES,
    };
  }
  return { href: image?.src || fallbackUrl };
}
