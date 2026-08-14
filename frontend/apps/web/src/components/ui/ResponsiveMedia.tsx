"use client";

import type { CSSProperties, SyntheticEvent } from "react";
import type { PublicResponsiveImage } from "@/lib/api/content";

type ResponsiveMediaProps = {
  src: string;
  responsiveImage?: PublicResponsiveImage | null;
  alt: string;
  sizes?: string;
  priority?: boolean;
  width?: number;
  height?: number;
  className?: string;
  style?: CSSProperties;
  onLoad?: (event: SyntheticEvent<HTMLImageElement>) => void;
  onError?: (event: SyntheticEvent<HTMLImageElement>) => void;
};

function createSrcSet(
  image: PublicResponsiveImage | null | undefined,
  format: "webp" | "avif",
) {
  if (!image?.variants?.length) return undefined;
  const candidates = image.variants.flatMap((variant) => {
    const url = format === "avif" ? variant.avifUrl : variant.webpUrl;
    return url ? [`${url} ${variant.width}w`] : [];
  });
  return candidates.length ? candidates.join(", ") : undefined;
}

export function ResponsiveMedia({
  src,
  responsiveImage,
  alt,
  sizes = "100vw",
  priority = false,
  width,
  height,
  className,
  style,
  onLoad,
  onError,
}: ResponsiveMediaProps) {
  const avifSrcSet = createSrcSet(responsiveImage, "avif");
  const webpSrcSet = createSrcSet(responsiveImage, "webp");

  return (
    <picture>
      {avifSrcSet ? <source type="image/avif" srcSet={avifSrcSet} sizes={sizes} /> : null}
      {webpSrcSet ? <source type="image/webp" srcSet={webpSrcSet} sizes={sizes} /> : null}
      <img
        src={responsiveImage?.src || src}
        srcSet={webpSrcSet}
        sizes={webpSrcSet ? sizes : undefined}
        alt={alt}
        width={width ?? responsiveImage?.width ?? 800}
        height={height ?? responsiveImage?.height ?? 450}
        loading={priority ? "eager" : "lazy"}
        fetchPriority={priority ? "high" : "auto"}
        decoding="async"
        className={className}
        style={style}
        onLoad={onLoad}
        onError={onError}
      />
    </picture>
  );
}
