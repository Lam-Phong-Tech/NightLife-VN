"use client";

import { useState, type CSSProperties, type SyntheticEvent } from "react";
import type { PublicResponsiveImage } from "@/lib/api/content";
import { createResponsiveImageSrcSet } from "@/lib/home-hero";

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
  const avifSrcSet = createResponsiveImageSrcSet(responsiveImage, "avif");
  const webpSrcSet = createResponsiveImageSrcSet(responsiveImage, "webp");
  const variantKey = `${src}|${avifSrcSet ?? ""}|${webpSrcSet ?? ""}`;
  const [failedVariantKey, setFailedVariantKey] = useState<string | null>(null);
  const useVariants = Boolean(avifSrcSet || webpSrcSet) && failedVariantKey !== variantKey;

  const handleError = (event: SyntheticEvent<HTMLImageElement>) => {
    if (useVariants) {
      setFailedVariantKey(variantKey);
      return;
    }

    onError?.(event);
  };

  return (
    <picture style={{ display: "block", width: "100%", height: "100%" }}>
      {useVariants && avifSrcSet ? <source type="image/avif" srcSet={avifSrcSet} sizes={sizes} /> : null}
      {useVariants && webpSrcSet ? <source type="image/webp" srcSet={webpSrcSet} sizes={sizes} /> : null}
      <img
        src={useVariants ? responsiveImage?.src || src : src}
        srcSet={useVariants ? webpSrcSet : undefined}
        sizes={useVariants && webpSrcSet ? sizes : undefined}
        alt={alt}
        width={width ?? responsiveImage?.width ?? 800}
        height={height ?? responsiveImage?.height ?? 450}
        loading={priority ? "eager" : "lazy"}
        fetchPriority={priority ? "high" : "auto"}
        decoding="async"
        className={className}
        style={style}
        onLoad={onLoad}
        onError={handleError}
      />
    </picture>
  );
}
