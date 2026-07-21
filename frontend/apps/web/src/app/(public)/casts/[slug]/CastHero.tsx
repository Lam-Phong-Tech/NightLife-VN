import Link from "next/link";
import type { PointerEvent as ReactPointerEvent } from "react";
import { ChevronLeft, ChevronRight, Heart, ImageOff, MapPin, Play, Star } from "lucide-react";
import type { LanguageCode } from "@/lib/i18n/use-active-language";
import { getCastProfileCopy } from "./cast-profile.copy";
import { isPlaceholderCastMedia, mediaPreviewBg } from "./cast-profile.helpers";
import type { CastMedia, CastProfile } from "./cast-profile.types";

type CastHeroProps = {
  profile: CastProfile;
  activeMedia: CastMedia;
  area: string;
  language: LanguageCode;
  onOpenGallery: () => void;
  onPreviousMedia: () => void;
  onNextMedia: () => void;
  showMediaNavigation: boolean;
  favoriteLabel: string;
  isFavorite: boolean;
  onToggleFavorite: () => void;
  onHeroPointerDown?: (event: ReactPointerEvent<HTMLElement>) => void;
  onHeroPointerUp?: (event: ReactPointerEvent<HTMLElement>) => void;
  onHeroPointerCancel?: () => void;
};

const profileSummary = (profile: CastProfile) =>
  [profile.heightCm ? `${profile.heightCm} cm` : null, profile.measurements, profile.zodiacSign]
    .filter(Boolean)
    .join(" · ");

export function CastHero({
  profile,
  activeMedia,
  area,
  language,
  onOpenGallery,
  onPreviousMedia,
  onNextMedia,
  showMediaNavigation,
  favoriteLabel,
  isFavorite,
  onToggleFavorite,
  onHeroPointerDown,
  onHeroPointerUp,
  onHeroPointerCancel,
}: CastHeroProps) {
  const summary = profileSummary(profile);
  const storeHref = `/stores/${profile.store.slug}`;
  const copy = getCastProfileCopy(language);
  const isPlaceholder = isPlaceholderCastMedia(activeMedia);

  return (
    <section
      className="cast-mobile-hero"
      data-testid="cast-hero-mobile"
      onPointerDown={onHeroPointerDown}
      onPointerUp={onHeroPointerUp}
      onPointerCancel={onHeroPointerCancel}
      style={{
        background: `linear-gradient(180deg, rgba(12,12,15,.18) 0%, rgba(12,12,15,0) 28%, rgba(12,12,15,.58) 64%, rgba(12,12,15,.97) 100%), ${mediaPreviewBg(activeMedia, profile.thumbnailUrl)}`,
      }}
    >
      {isPlaceholder ? (
        <div className="cast-hero-placeholder" aria-hidden="true">
          <ImageOff size={36} strokeWidth={1.7} />
          <span>Chưa có ảnh</span>
        </div>
      ) : null}
      <div className="cast-mobile-topbar">
        <Link href="/danh-sach-cast" className="cast-icon-link cast-back-link" aria-label={copy.backToCastList}>
          <ChevronLeft size={20} strokeWidth={2.2} />
        </Link>
        <button
          type="button"
          className={`cast-icon-link cast-favorite-action${isFavorite ? " is-active" : ""}`}
          onClick={onToggleFavorite}
          aria-label={favoriteLabel}
          title={favoriteLabel}
        >
          <Heart size={18} fill={isFavorite ? "currentColor" : "none"} />
        </button>
      </div>

      {activeMedia.type === "VIDEO" ? (
        <button
          type="button"
          className="cast-play"
          onClick={onOpenGallery}
          aria-label={copy.openVideo}
        >
          <Play size={24} fill="currentColor" />
        </button>
      ) : null}

      {showMediaNavigation ? (
        <div className="cast-hero-media-nav" aria-label={copy.gallery}>
          <button
            type="button"
            className="previous"
            onClick={onPreviousMedia}
            aria-label={copy.photoPrevious}
          >
            <ChevronLeft size={22} strokeWidth={2.2} />
          </button>
          <button type="button" className="next" onClick={onNextMedia} aria-label={copy.photoNext}>
            <ChevronRight size={22} strokeWidth={2.2} />
          </button>
        </div>
      ) : null}

      <div className="cast-hero-copy">
        <div className="cast-badge-row">
          <span className="cast-rank-badge">
            <Star size={12} fill="currentColor" />
            {copy.rankingThisMonth}
          </span>
          <span className="cast-live-badge">
            <span />
            {copy.acceptingTonight}
          </span>
        </div>

        <div className="cast-title-row">
          <h1>{profile.name}</h1>
          {summary ? <span>{summary}</span> : null}
        </div>

        <Link href={storeHref} className="cast-hero-store">
          <MapPin size={13} strokeWidth={1.8} />
          <strong>{profile.store.name}</strong>
          {area ? <span>· {area}</span> : null}
        </Link>
      </div>
    </section>
  );
}
