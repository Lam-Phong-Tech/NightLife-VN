"use client";

import { useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { ChevronLeft, ChevronRight, Heart, ImageOff, Play, Star, X } from "lucide-react";
import { resolveClientUrl } from "@/lib/api/client";
import type { LanguageCode } from "@/lib/i18n/use-active-language";
import { getCastProfileCopy } from "./cast-profile.copy";
import { isPlaceholderCastMedia, mediaPreviewBg, videoEmbedUrl } from "./cast-profile.helpers";
import type { CastGalleryAction, CastMedia } from "./cast-profile.types";

type CastGalleryProps = {
  gallery: CastMedia[];
  activeIndex: number;
  variant: "mobile" | "desktop";
  language: LanguageCode;
  isLightboxOpen: boolean;
  onSelect: (index: number, action?: CastGalleryAction) => void;
  onOpenLightbox: (index?: number) => void;
  onCloseLightbox: () => void;
  favoriteLabel?: string;
  isFavorite?: boolean;
  onToggleFavorite?: () => void;
};

type GalleryTouchStart = {
  x: number;
  y: number;
};

export function CastGallery({
  gallery,
  activeIndex,
  variant,
  language,
  isLightboxOpen,
  onSelect,
  onOpenLightbox,
  onCloseLightbox,
  favoriteLabel,
  isFavorite = false,
  onToggleFavorite,
}: CastGalleryProps) {
  const [touchStart, setTouchStart] = useState<GalleryTouchStart | null>(null);
  const [portalTarget, setPortalTarget] = useState<HTMLElement | null>(null);
  const activeMedia = (gallery[Math.min(activeIndex, gallery.length - 1)] ?? gallery[0])!;
  const activeMediaIsPlaceholder = isPlaceholderCastMedia(activeMedia);
  const fallbackImageUrl =
    gallery.find((item) => item.type === "IMAGE" && !isPlaceholderCastMedia(item))?.url ?? null;
  const copy = getCastProfileCopy(language);

  const showPrevious = useCallback(() => {
    onSelect(activeIndex <= 0 ? gallery.length - 1 : activeIndex - 1, "previous");
  }, [activeIndex, gallery.length, onSelect]);

  const showNext = useCallback(() => {
    onSelect(activeIndex >= gallery.length - 1 ? 0 : activeIndex + 1, "next");
  }, [activeIndex, gallery.length, onSelect]);

  useEffect(() => {
    let cancelled = false;

    queueMicrotask(() => {
      if (!cancelled) setPortalTarget(document.body);
    });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!isLightboxOpen) return undefined;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onCloseLightbox();
      if (event.key === "ArrowLeft") showPrevious();
      if (event.key === "ArrowRight") showNext();
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isLightboxOpen, onCloseLightbox, showNext, showPrevious]);

  const renderPlayIcon = () => (
    <span className="cast-video-overlay" aria-hidden="true">
      <Play size={18} fill="currentColor" />
    </span>
  );

  const renderPlaceholder = (compact = false) => (
    <span className={compact ? "cast-media-placeholder compact" : "cast-media-placeholder"}>
      <ImageOff size={compact ? 16 : 26} strokeWidth={1.8} />
      {compact ? null : <strong>Chưa có ảnh</strong>}
    </span>
  );

  const lightbox =
    isLightboxOpen && activeMedia && portalTarget
      ? createPortal(
          <CastLightbox
            gallery={gallery}
            media={activeMedia}
            count={gallery.length}
            index={activeIndex}
            language={language}
            onClose={onCloseLightbox}
            onPrevious={showPrevious}
            onNext={showNext}
            onSelect={onSelect}
            touchStart={touchStart}
            setTouchStart={setTouchStart}
          />,
          portalTarget,
        )
      : null;

  if (variant === "mobile") {
    return (
      <>
        <section
          className="cast-section cast-gallery-grid-section"
          data-testid="cast-gallery-mobile"
        >
          <div className="cast-section-heading">
            <h2>{copy.gallery}</h2>
            <span />
            <small>{copy.galleryCount(gallery.length)}</small>
          </div>
          <div className="cast-mobile-gallery-grid">
            {gallery.map((media, index) => {
              const isPlaceholder = isPlaceholderCastMedia(media);

              return (
                <button
                  type="button"
                  key={media.id}
                  onClick={() => {
                    onSelect(index, "select");
                    onOpenLightbox(index);
                  }}
                  aria-label={media.alt}
                  className={`cast-gallery-tile${isPlaceholder ? " is-placeholder" : ""}`}
                  style={{ background: mediaPreviewBg(media, fallbackImageUrl) }}
                >
                  {isPlaceholder
                    ? renderPlaceholder(true)
                    : media.type === "VIDEO"
                      ? renderPlayIcon()
                      : null}
                </button>
              );
            })}
          </div>
        </section>
        {lightbox}
      </>
    );
  }

  return (
    <section className="cast-desktop-gallery" data-testid="cast-gallery-desktop">
      <div className="cast-desktop-main-media-wrap">
        <button
          type="button"
          className={`cast-desktop-main-media${activeMediaIsPlaceholder ? " is-placeholder" : ""}`}
          style={{ background: mediaPreviewBg(activeMedia, fallbackImageUrl) }}
          onClick={() => onOpenLightbox(activeIndex)}
          aria-label={copy.openGallery}
        >
          <span className="cast-media-label">
            {activeMedia.type === "VIDEO" ? "Video" : "Gallery"}
          </span>
          {activeMediaIsPlaceholder ? (
            renderPlaceholder()
          ) : activeMedia.type === "VIDEO" ? (
            <span className="cast-play cast-play-desktop">
              <Play size={24} fill="currentColor" />
            </span>
          ) : null}
        </button>
        <span className="cast-rank-badge cast-desktop-media-rank">
          <Star size={13} fill="currentColor" />
          {copy.rankingJune}
        </span>
        <span className="cast-live-badge cast-desktop-media-live">
          <span />
          {copy.acceptingTonight}
        </span>
        {onToggleFavorite ? (
          <button
            type="button"
            className={`cast-favorite-action${isFavorite ? " is-active" : ""}`}
            onClick={onToggleFavorite}
            aria-label={favoriteLabel}
            title={favoriteLabel}
          >
            <Heart size={18} fill={isFavorite ? "currentColor" : "none"} />
          </button>
        ) : null}
        {gallery.length > 1 ? (
          <div className="cast-desktop-media-nav" aria-label={copy.gallery}>
            <button
              type="button"
              className="previous"
              onClick={(event) => {
                event.stopPropagation();
                showPrevious();
              }}
              aria-label={copy.photoPrevious}
            >
              <ChevronLeft size={24} strokeWidth={2.2} />
            </button>
            <button
              type="button"
              className="next"
              onClick={(event) => {
                event.stopPropagation();
                showNext();
              }}
              aria-label={copy.photoNext}
            >
              <ChevronRight size={24} strokeWidth={2.2} />
            </button>
          </div>
        ) : null}
      </div>

      <div className="cast-desktop-thumbs">
        {gallery.slice(0, 5).map((media, index) => {
          const isPlaceholder = isPlaceholderCastMedia(media);

          return (
            <button
              type="button"
              className={`cast-thumb${activeIndex === index ? " is-active" : ""}${isPlaceholder ? " is-placeholder" : ""}`}
              key={media.id}
              onClick={() => onSelect(index, "select")}
              aria-label={media.alt}
              style={{ background: mediaPreviewBg(media, fallbackImageUrl) }}
            >
              {isPlaceholder
                ? renderPlaceholder(true)
                : media.type === "VIDEO"
                  ? renderPlayIcon()
                  : null}
            </button>
          );
        })}
      </div>
      {lightbox}
    </section>
  );
}

function CastLightbox({
  gallery,
  media,
  count,
  index,
  language,
  onClose,
  onPrevious,
  onNext,
  onSelect,
  touchStart,
  setTouchStart,
}: {
  gallery: CastMedia[];
  media: CastMedia;
  count: number;
  index: number;
  language: LanguageCode;
  onClose: () => void;
  onPrevious: () => void;
  onNext: () => void;
  onSelect: (index: number, action?: CastGalleryAction) => void;
  touchStart: GalleryTouchStart | null;
  setTouchStart: (value: GalleryTouchStart | null) => void;
}) {
  const mediaUrl = resolveClientUrl(media.url) ?? media.url;
  const embed = media.type === "VIDEO" ? videoEmbedUrl(mediaUrl) : null;
  const copy = getCastProfileCopy(language);
  const isPlaceholder = isPlaceholderCastMedia(media);
  const fallbackImageUrl =
    gallery.find((item) => item.type === "IMAGE" && !isPlaceholderCastMedia(item))?.url ?? null;

  const onTouchEnd = (clientX: number, clientY: number) => {
    if (touchStart === null) return;

    const deltaX = clientX - touchStart.x;
    const deltaY = clientY - touchStart.y;
    if (count > 1 && Math.abs(deltaX) > 42 && Math.abs(deltaX) > Math.abs(deltaY) * 1.2) {
      if (deltaX > 0) onPrevious();
      else onNext();
    }
    setTouchStart(null);
  };

  return (
    <div
      className="cast-lightbox"
      role="dialog"
      aria-modal="true"
      aria-label={copy.openGallery}
      onTouchStart={(event) => {
        const touch = event.touches[0];
        setTouchStart(touch ? { x: touch.clientX, y: touch.clientY } : null);
      }}
      onTouchEnd={(event) => {
        const touch = event.changedTouches[0];
        if (touch) onTouchEnd(touch.clientX, touch.clientY);
        else setTouchStart(null);
      }}
      onTouchCancel={() => setTouchStart(null)}
    >
      <div className="cast-lightbox-topbar">
        <span>
          {String(index + 1).padStart(2, "0")} <em>/ {count}</em>
        </span>
        <button
          className="cast-lightbox-close"
          type="button"
          aria-label={copy.closeGallery}
          onClick={onClose}
        >
          <X size={18} strokeWidth={2.2} />
        </button>
      </div>

      {count > 1 ? (
        <button
          className="cast-lightbox-nav previous"
          type="button"
          aria-label={copy.mediaPrevious}
          onClick={onPrevious}
        >
          <ChevronLeft size={22} strokeWidth={2.2} />
        </button>
      ) : null}

      <div className="cast-lightbox-media">
        {media.type === "VIDEO" ? (
          embed?.kind === "iframe" ? (
            <iframe
              title={media.alt}
              src={embed.url}
              allow="autoplay; encrypted-media; picture-in-picture"
              allowFullScreen
            />
          ) : embed?.kind === "link" ? (
            <a className="cast-booking-button" href={embed.url} target="_blank" rel="noreferrer">
              {copy.openSnsVideo}
            </a>
          ) : (
            <video src={embed?.url || mediaUrl} controls autoPlay />
          )
        ) : isPlaceholder ? (
          <div className="cast-lightbox-placeholder">
            <ImageOff size={34} strokeWidth={1.8} />
            <strong>Chưa có ảnh</strong>
          </div>
        ) : (
          <img src={mediaUrl} alt={media.alt} />
        )}
      </div>

      {count > 1 ? (
        <button
          className="cast-lightbox-nav next"
          type="button"
          aria-label={copy.mediaNext}
          onClick={onNext}
        >
          <ChevronRight size={22} strokeWidth={2.2} />
        </button>
      ) : null}

      <div className="cast-lightbox-caption">
        <div>
          <strong>{media.alt}</strong>
          {media.purpose ? <span>{media.purpose}</span> : null}
        </div>
      </div>

      <div className="cast-lightbox-thumbs">
        {gallery.map((item, itemIndex) => {
          const isPlaceholder = isPlaceholderCastMedia(item);

          return (
            <button
              key={item.id}
              type="button"
              className={`cast-lightbox-thumb${itemIndex === index ? " is-active" : ""}${isPlaceholder ? " is-placeholder" : ""}`}
              style={{ background: mediaPreviewBg(item, fallbackImageUrl) }}
              onClick={() => onSelect(itemIndex, "select")}
              aria-label={item.alt}
            >
              {isPlaceholder ? (
                <ImageOff size={14} strokeWidth={1.8} />
              ) : item.type === "VIDEO" ? (
                renderSmallPlayIcon()
              ) : null}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function renderSmallPlayIcon() {
  return (
    <span className="cast-lightbox-video-dot" aria-hidden="true">
      <Play size={12} fill="currentColor" />
    </span>
  );
}
