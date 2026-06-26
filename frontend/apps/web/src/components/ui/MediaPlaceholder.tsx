"use client";

import { ImageOff } from "lucide-react";
import React, { type CSSProperties, useEffect, useMemo, useState } from "react";

type PlaceholderMediaProps = {
  src?: string | null;
  alt?: string;
  label?: string;
  tone?: "dark" | "light";
  className?: string;
  style?: CSSProperties;
  imageStyle?: CSSProperties;
  children?: React.ReactNode;
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
}: PlaceholderMediaProps) {
  const imageSrc = useMemo(() => getImageUrlFromCss(src), [src]);
  const [failed, setFailed] = useState(false);
  const showImage = imageSrc && !failed;
  const isLight = tone === "light";

  useEffect(() => {
    setFailed(false);
  }, [imageSrc]);

  return (
    <div
      className={className}
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
          background:
            "radial-gradient(circle at 18% 18%,rgba(212,178,106,.26),transparent 26%), radial-gradient(circle at 82% 70%,rgba(255,255,255,.08),transparent 24%)",
          opacity: isLight ? 0.8 : 1,
        }}
      />
      {label ? (
        <div
          style={{
            position: "absolute",
            inset: 0,
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
      ) : (
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <ImageOff size={20} strokeWidth={1.8} />
        </div>
      )}
      {showImage ? (
        <img
          src={imageSrc}
          alt={alt}
          onError={() => setFailed(true)}
          loading="lazy"
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            display: "block",
            ...imageStyle,
          }}
        />
      ) : null}
      {children ? <div style={{ position: "relative", zIndex: 1, width: "100%", height: "100%" }}>{children}</div> : null}
    </div>
  );
}
