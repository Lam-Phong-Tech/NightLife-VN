import Link from "next/link";
import { ChevronLeft, Heart, MapPin, Play, Star } from "lucide-react";
import { mediaBg } from "./cast-profile.helpers";
import type { CastMedia, CastProfile } from "./cast-profile.types";

type CastHeroProps = {
  profile: CastProfile;
  activeMedia: CastMedia;
  area: string;
  isFavorite: boolean;
  onToggleFavorite: () => void;
  onOpenGallery: () => void;
};

const profileSummary = (profile: CastProfile) =>
  [
    profile.heightCm ? `${profile.heightCm} cm` : null,
    profile.measurements,
    profile.zodiacSign,
  ]
    .filter(Boolean)
    .join(" · ");

export function CastHero({
  profile,
  activeMedia,
  area,
  isFavorite,
  onToggleFavorite,
  onOpenGallery,
}: CastHeroProps) {
  const summary = profileSummary(profile);
  const storeHref = `/stores/${profile.store.slug}`;

  return (
    <section
      className="cast-mobile-hero"
      data-testid="cast-hero-mobile"
      style={{
        background: `linear-gradient(180deg, rgba(12,12,15,.18) 0%, rgba(12,12,15,0) 28%, rgba(12,12,15,.58) 64%, rgba(12,12,15,.97) 100%), ${mediaBg(activeMedia.url)}`,
      }}
    >
      <div className="cast-mobile-topbar">
        <Link href="/danh-sach-cast" className="cast-icon-link" aria-label="Quay lại danh sách cast">
          <ChevronLeft size={20} strokeWidth={2.2} />
        </Link>
        <button
          type="button"
          className={`cast-icon-button${isFavorite ? " is-active" : ""}`}
          onClick={onToggleFavorite}
          aria-label={isFavorite ? "Bỏ lưu cast" : "Lưu cast"}
          aria-pressed={isFavorite}
        >
          <Heart size={18} strokeWidth={1.9} fill={isFavorite ? "currentColor" : "none"} />
        </button>
      </div>

      {activeMedia.type === "VIDEO" ? (
        <button type="button" className="cast-play" onClick={onOpenGallery} aria-label="Mở video cast">
          <Play size={24} fill="currentColor" />
        </button>
      ) : null}

      <div className="cast-hero-copy">
        <div className="cast-badge-row">
          <span className="cast-rank-badge">
            <Star size={12} fill="currentColor" />
            #1 Ranking tháng này
          </span>
          <span className="cast-live-badge">
            <span />
            Đang nhận đặt tối nay
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
