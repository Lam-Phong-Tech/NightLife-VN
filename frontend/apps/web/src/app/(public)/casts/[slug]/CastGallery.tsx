"use client";

import { useCallback, useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Heart, Play, Star, X } from "lucide-react";
import { mediaBg, videoEmbedUrl } from "./cast-profile.helpers";
import type { CastGalleryAction, CastMedia } from "./cast-profile.types";

type CastGalleryProps = {
  gallery: CastMedia[];
  activeIndex: number;
  variant: "mobile" | "desktop";
  isLightboxOpen: boolean;
  isFavorite?: boolean;
  onSelect: (index: number, action?: CastGalleryAction) => void;
  onOpenLightbox: (index?: number) => void;
  onCloseLightbox: () => void;
  onToggleFavorite?: () => void;
};

export function CastGallery({
  gallery,
  activeIndex,
  variant,
  isLightboxOpen,
  isFavorite = false,
  onSelect,
  onOpenLightbox,
  onCloseLightbox,
  onToggleFavorite,
}: CastGalleryProps) {
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const activeMedia = (gallery[Math.min(activeIndex, gallery.length - 1)] ?? gallery[0])!;

  const showPrevious = useCallback(() => {
    onSelect(activeIndex <= 0 ? gallery.length - 1 : activeIndex - 1, "previous");
  }, [activeIndex, gallery.length, onSelect]);

  const showNext = useCallback(() => {
    onSelect(activeIndex >= gallery.length - 1 ? 0 : activeIndex + 1, "next");
  }, [activeIndex, gallery.length, onSelect]);

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

  const lightbox = isLightboxOpen && activeMedia ? (
    <CastLightbox
      gallery={gallery}
      media={activeMedia}
      count={gallery.length}
      index={activeIndex}
      onClose={onCloseLightbox}
      onPrevious={showPrevious}
      onNext={showNext}
      onSelect={onSelect}
      touchStartX={touchStartX}
      setTouchStartX={setTouchStartX}
    />
  ) : null;

  if (variant === "mobile") {
    return (
      <>
        <section className="cast-section cast-gallery-grid-section" data-testid="cast-gallery-mobile">
          <div className="cast-section-heading">
            <h2>Thư viện ảnh</h2>
            <span />
            <small>{gallery.length} ảnh</small>
          </div>
          <div className="cast-mobile-gallery-grid">
            {gallery.map((media, index) => (
              <button
                type="button"
                key={media.id}
                onClick={() => {
                  onSelect(index, "select");
                  onOpenLightbox(index);
                }}
                aria-label={media.alt}
                className="cast-gallery-tile"
                style={{ background: mediaBg(media.url) }}
              >
                {media.type === "VIDEO" ? renderPlayIcon() : null}
              </button>
            ))}
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
        className="cast-desktop-main-media"
        style={{ background: mediaBg(activeMedia.url) }}
        onClick={() => onOpenLightbox(activeIndex)}
        aria-label="Mở gallery cast"
      >
        <span className="cast-media-label">{activeMedia.type === "VIDEO" ? "Video" : "Gallery"}</span>
        {activeMedia.type === "VIDEO" ? <span className="cast-play cast-play-desktop"><Play size={24} fill="currentColor" /></span> : null}
      </button>
        <span className="cast-rank-badge cast-desktop-media-rank">
          <Star size={13} fill="currentColor" />
          #1 Ranking tháng 6
        </span>
        <span className="cast-live-badge cast-desktop-media-live">
          <span />
          Đang nhận đặt tối nay
        </span>
        <button
          type="button"
          className={`cast-desktop-media-fav${isFavorite ? " is-active" : ""}`}
          onClick={onToggleFavorite}
          aria-label={isFavorite ? "Bá» lÆ°u cast" : "LÆ°u cast"}
          aria-pressed={isFavorite}
        >
          <Heart size={17} strokeWidth={1.9} fill={isFavorite ? "currentColor" : "none"} />
        </button>
      </div>

      <div className="cast-desktop-thumbs">
        {gallery.slice(0, 5).map((media, index) => (
          <button
            type="button"
            className={`cast-thumb${activeIndex === index ? " is-active" : ""}`}
            key={media.id}
            onClick={() => onSelect(index, "select")}
            aria-label={media.alt}
            style={{ background: mediaBg(media.url) }}
          >
            {media.type === "VIDEO" ? renderPlayIcon() : null}
          </button>
        ))}
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
  onClose,
  onPrevious,
  onNext,
  onSelect,
  touchStartX,
  setTouchStartX,
}: {
  gallery: CastMedia[];
  media: CastMedia;
  count: number;
  index: number;
  onClose: () => void;
  onPrevious: () => void;
  onNext: () => void;
  onSelect: (index: number, action?: CastGalleryAction) => void;
  touchStartX: number | null;
  setTouchStartX: (value: number | null) => void;
}) {
  const embed = media.type === "VIDEO" ? videoEmbedUrl(media.url) : null;

  const onTouchEnd = (clientX: number) => {
    if (touchStartX === null) return;
    const delta = clientX - touchStartX;
    if (Math.abs(delta) > 42) {
      if (delta > 0) onPrevious();
      else onNext();
    }
    setTouchStartX(null);
  };

  return (
    <div
      className="cast-lightbox"
      role="dialog"
      aria-modal="true"
      aria-label="Cast gallery lightbox"
      onTouchStart={(event) => setTouchStartX(event.touches[0]?.clientX ?? null)}
      onTouchEnd={(event) => onTouchEnd(event.changedTouches[0]?.clientX ?? 0)}
    >
      <div className="cast-lightbox-topbar">
        <span>
          {String(index + 1).padStart(2, "0")} <em>/ {count}</em>
        </span>
        <button className="cast-lightbox-close" type="button" aria-label="Đóng gallery" onClick={onClose}>
          <X size={18} strokeWidth={2.2} />
        </button>
      </div>

      {count > 1 ? (
        <button className="cast-lightbox-nav previous" type="button" aria-label="Media trước" onClick={onPrevious}>
          <ChevronLeft size={22} strokeWidth={2.2} />
        </button>
      ) : null}

      <div className="cast-lightbox-media">
        {media.type === "VIDEO" ? (
          embed?.kind === "iframe" ? (
            <iframe title={media.alt} src={embed.url} allow="autoplay; encrypted-media; picture-in-picture" allowFullScreen />
          ) : embed?.kind === "link" ? (
            <a className="cast-booking-button" href={embed.url} target="_blank" rel="noreferrer">
              Mở video SNS
            </a>
          ) : (
            <video src={embed?.url || media.url} controls autoPlay />
          )
        ) : (
          <img src={media.url} alt={media.alt} />
        )}
      </div>

      {count > 1 ? (
        <button className="cast-lightbox-nav next" type="button" aria-label="Media sau" onClick={onNext}>
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
        {gallery.map((item, itemIndex) => (
          <button
            key={item.id}
            type="button"
            className={`cast-lightbox-thumb${itemIndex === index ? " is-active" : ""}`}
            style={{ background: mediaBg(item.url) }}
            onClick={() => onSelect(itemIndex, "select")}
            aria-label={item.alt}
          >
            {item.type === "VIDEO" ? renderSmallPlayIcon() : null}
          </button>
        ))}
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
