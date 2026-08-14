export type PublicResponsiveImage = {
  src: string;
  width: number;
  height: number;
  variants: Array<{
    width: number;
    webpUrl: string;
    avifUrl?: string;
  }>;
};

export type ResponsiveMediaRecord = {
  id: string;
  url: string;
  metadata: unknown;
};

type StoredImageVariant = {
  width?: unknown;
  webpKey?: unknown;
  avifKey?: unknown;
};

function withVariantQuery(
  sourceUrl: string,
  width: number,
  format: 'webp' | 'avif',
) {
  const separator = sourceUrl.includes('?') ? '&' : '?';
  return `${sourceUrl}${separator}width=${width}&format=${format}`;
}

export function toPublicResponsiveImage(
  media: ResponsiveMediaRecord | null | undefined,
): PublicResponsiveImage | null {
  if (!media?.url) return null;

  const metadata = media.metadata as Record<string, unknown> | null;
  const originalWidth = Number(metadata?.originalWidth);
  const originalHeight = Number(metadata?.originalHeight);
  const storedVariants = Array.isArray(metadata?.variants)
    ? (metadata.variants as StoredImageVariant[])
    : [];

  if (
    !Number.isFinite(originalWidth) ||
    !Number.isFinite(originalHeight) ||
    originalWidth <= 0 ||
    originalHeight <= 0
  ) {
    return null;
  }

  const variants = storedVariants
    .filter(
      (variant) =>
        Number.isFinite(Number(variant.width)) &&
        Number(variant.width) > 0 &&
        typeof variant.webpKey === 'string' &&
        variant.webpKey.length > 0,
    )
    .map((variant) => {
      const width = Number(variant.width);
      return {
        width,
        webpUrl: withVariantQuery(media.url, width, 'webp'),
        ...(typeof variant.avifKey === 'string' && variant.avifKey.length > 0
          ? { avifUrl: withVariantQuery(media.url, width, 'avif') }
          : {}),
      };
    })
    .sort((left, right) => left.width - right.width);

  if (!variants.length) return null;

  return {
    src: media.url,
    width: originalWidth,
    height: originalHeight,
    variants,
  };
}
