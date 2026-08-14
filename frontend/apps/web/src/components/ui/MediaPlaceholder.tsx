"use client";

import { ImageOff } from "lucide-react";
import React, { type CSSProperties, useMemo, useState } from "react";
import type { PublicResponsiveImage } from "@/lib/api/content";
import { ResponsiveMedia } from "./ResponsiveMedia";

type PlaceholderMediaProps = {
  src?: string | null;
  alt?: string;
  label?: string;
  tone?: "dark" | "light";
  className?: string;
  style?: CSSProperties;
  imageStyle?: CSSProperties;
  children?: React.ReactNode;
  /**
   * true → loading="eager" + fetchPriority="high"
   * Dùng cho ảnh đầu tiên visible trong viewport khi trang load lần đầu.
   * Mặc định false → loading="lazy" (tiết kiệm bandwidth cho ảnh ngoài viewport).
   */
  priority?: boolean;
  responsiveImage?: PublicResponsiveImage | null;
  sizes?: string;
  width?: number;
  height?: number;
};

export function getImageUrlFromCss(value?: string | null) {
  const input = value?.trim();
  if (!input) return "";

  const match = input.match(/url\((['"]?)(.*?)\1\)/i);
  if (match?.[2]) return match[2].trim();

  if (/^(https?:\/\/|\/|data:image\/)/i.test(input)) return input;

  return "";
}

export function PlaceholderMedia({
  src,
  alt = "",
  label = "Chưa có ảnh",
  tone = "dark",
  className,
  style,
  imageStyle,
  children,
  priority = false,
  responsiveImage,
  sizes,
  width,
  height,
}: PlaceholderMediaProps) {
  const imageSrc = useMemo(() => getImageUrlFromCss(src), [src]);
  const [prevImageSrc, setPrevImageSrc] = useState(imageSrc);
  const [failed, setFailed] = useState(false);

  // Reset failed state when imageSrc changes (during render, not in effect)
  if (prevImageSrc !== imageSrc) {
    setPrevImageSrc(imageSrc);
    if (failed) setFailed(false);
  }

  const showImage = imageSrc && !failed;
  const isLight = tone === "light";

  return (
    <div
      className={className ? `${className} nl-media-fallback` : "nl-media-fallback"}
      style={{
        position: "relative",
        overflow: "hidden",
        background: isLight
          ? "linear-gradient(135deg,#f7f1df,#e3d4ae)"
          : "linear-gradient(135deg,#19191d,#2a2418)",
        color: isLight ? "#6f5420" : "#f0dda8",
        ...style,
      }}
    >
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 0,
          background:
            "radial-gradient(circle at 18% 18%,rgba(212,178,106,.26),transparent 26%), radial-gradient(circle at 82% 70%,var(--vy-surface-3),transparent 24%)",
          opacity: isLight ? 0.8 : 1,
        }}
      />
      {!showImage && label ? (
        <div
          style={{
            position: "absolute",
            inset: 0,
            zIndex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px",
            textAlign: "center",
            padding: "14px",
          }}
        >
          <ImageOff size={28} strokeWidth={1.8} />
          <span style={{ fontSize: "12px", fontWeight: 800, lineHeight: 1.3 }}>{label}</span>
        </div>
      ) : !showImage ? (
        <div
          style={{
            position: "absolute",
            inset: 0,
            zIndex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <ImageOff size={20} strokeWidth={1.8} />
        </div>
      )}
      {showImage ? (
        <ResponsiveMedia
          src={imageSrc}
          responsiveImage={responsiveImage}
          alt={alt}
          onError={() => setFailed(true)}
          // priority=true → eager + high-priority fetch hint cho ảnh đầu tiên visible
          // priority=false → lazy cho ảnh ngoài/dưới viewport (tiết kiệm bandwidth)
          priority={priority}
          // width+height giúp browser biết aspect ratio trước khi ảnh load
          // → tránh layout shift (CLS), không cần giá trị pixel chính xác vì CSS override
          sizes={sizes}
          width={width}
          height={height}
          style={{
            position: "absolute",
            inset: 0,
            zIndex: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            display: "block",
            ...imageStyle,
          }}
        />
      ) : null}
      {children ? <div style={{ position: "relative", zIndex: 3, width: "100%", height: "100%" }}>{children}</div> : null}
    </div>
  );
}
