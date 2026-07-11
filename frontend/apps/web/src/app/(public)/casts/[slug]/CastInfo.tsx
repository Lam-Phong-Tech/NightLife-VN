import Link from "next/link";
import { ChevronRight, Clock3, Star, UsersRound } from "lucide-react";
import type { RelatedCast } from "@/lib/api/cast-detail";
import {
  formatMonth,
  formatOptional,
  labelLanguage,
  labelTag,
  mediaBg,
  placeholderGallery,
} from "./cast-profile.helpers";
import { recommendationLabel } from "./cast-profile.recommendations";
import type { CastProfile, CastProfileTrack } from "./cast-profile.types";

type CastInfoProps = {
  profile: CastProfile;
  area: string;
  languageText: string;
  storeHref: string;
  variant: "mobile" | "desktop";
  onTrack?: CastProfileTrack;
};

type RelatedCastsProps = {
  relatedCasts: RelatedCast[];
  variant: "mobile" | "desktop";
  onTrack?: CastProfileTrack;
};

export function CastInfo({
  profile,
  area,
  languageText,
  storeHref,
  variant,
  onTrack,
}: CastInfoProps) {
  const month = formatMonth(profile.monthOfBirth);
  const zodiac = formatOptional(profile.zodiacSign);
  const interests = profile.interests?.length
    ? profile.interests.join(" · ")
    : profile.tags.slice(0, 3).map(labelTag).join(" · ") || "Chưa cập nhật";
  const styleText =
    (profile.styleTags.length ? profile.styleTags : profile.tags)
      .slice(0, 4)
      .map(labelTag)
      .join(" · ") || "Thanh lịch · Ấm áp";

  if (variant === "mobile") {
    return (
      <>
        <section className="cast-section" data-testid="cast-info-mobile">
          <SectionHeading title="Giới thiệu" />
          <p className="cast-mobile-bio">{profile.bio}</p>
          <div className="cast-detail-list">
            <InfoRow label="Ngôn ngữ" value={languageText} />
            <InfoRow label="Sở thích" value={interests} />
            <InfoRow label="Phong cách" value={styleText} />
          </div>
        </section>

        <section className="cast-section">
          <SectionHeading title="Quán đang thuộc về" />
          <VenueCard
            profile={profile}
            area={area}
            storeHref={storeHref}
            onTrack={onTrack}
            compact
          />
        </section>
      </>
    );
  }

  return (
    <section className="cast-desktop-profile" data-testid="cast-info-desktop">
      <div className="cast-badge-row desktop">
        <span className="cast-rank-badge">
          <Star size={12} fill="currentColor" />
          #1 Ranking tháng này
        </span>
        <span className="cast-live-badge">
          <span />
          Đang nhận đặt tối nay
        </span>
      </div>

      <div className="cast-desktop-name-block">
        <h1>{profile.name}</h1>
        <p>
          {profile.heightCm ? `${profile.heightCm} cm · ` : ""}
          {area || "Khu vực đang cập nhật"} · {profile.store.name}
        </p>
      </div>

      <div className="cast-desktop-stat-row">
        <span>
          <UsersRound size={14} />
          <b>{month}</b>
          Tháng sinh
        </span>
        <span>
          <Clock3 size={14} />
          <b>{zodiac}</b>
          Cung
        </span>
      </div>

      <div className="cast-desktop-chips">
        <ChipRows profile={profile} />
      </div>

      <p className="cast-desktop-copy">{profile.bio}</p>

      <div className="cast-detail-list desktop">
        <InfoRow label="Ngôn ngữ" value={languageText} />
        <InfoRow label="Sở thích" value={interests} />
        <InfoRow label="Phong cách" value={styleText} />
      </div>

      <SectionHeading title="Quán đang thuộc về" compact />
      <VenueCard profile={profile} area={area} storeHref={storeHref} onTrack={onTrack} />
    </section>
  );
}

export function CastRelatedCasts({ relatedCasts, variant, onTrack }: RelatedCastsProps) {
  if (!relatedCasts.length) return null;

  return (
    <section className={`cast-related-section ${variant}`} data-testid={`cast-related-${variant}`}>
      <div className="cast-section-heading">
        <h2>Cast tương tự</h2>
        <span />
        <small>Xem tất cả</small>
      </div>
      <div className="cast-related-list">
        {relatedCasts.slice(0, variant === "desktop" ? 4 : 6).map((cast) => (
          <Link
            key={cast.id}
            className="cast-related-card"
            href={`/casts/${cast.slug}`}
            onClick={() => onTrack?.("related", { surface: variant, relatedCastSlug: cast.slug })}
          >
            <span
              className="cast-related-media"
              style={{
                background: mediaBg(cast.thumbnailUrl ?? placeholderGallery[0]!.url),
              }}
            />
            <span className="cast-related-copy">
              <strong>{cast.publicAlias ?? cast.name ?? cast.stageName}</strong>
              <small>{cast.store.name}</small>
              <em>{recommendationLabel(cast)}</em>
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}

function SectionHeading({
  title,
  meta,
  compact = false,
}: {
  title: string;
  meta?: string;
  compact?: boolean;
}) {
  return (
    <div className={`cast-section-heading${compact ? " compact" : ""}`}>
      <h2>{title}</h2>
      <span />
      {meta ? <small>{meta}</small> : null}
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="cast-info-row">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function ChipRows({ profile }: { profile: CastProfile }) {
  return (
    <div className="cast-chip-row">
      {profile.languages.map((language) => (
        <span className="cast-chip language" key={language}>
          {labelLanguage(language)}
        </span>
      ))}
      {profile.tags.slice(0, 5).map((tag) => (
        <span className="cast-chip tag" key={tag}>
          {labelTag(tag)}
        </span>
      ))}
    </div>
  );
}

function VenueCard({
  profile,
  area,
  storeHref,
  onTrack,
  compact = false,
}: {
  profile: CastProfile;
  area: string;
  storeHref: string;
  onTrack?: CastProfileTrack;
  compact?: boolean;
}) {
  const storeImage = profile.store.thumbnailUrl ?? placeholderGallery[0]!.url;

  return (
    <Link
      href={storeHref}
      className={`cast-venue-card${compact ? " compact" : ""}`}
      data-testid={compact ? undefined : "cast-store-sidebar"}
      onClick={() => onTrack?.("store", { surface: compact ? "mobile-venue" : "desktop-venue" })}
    >
      <span className="cast-venue-media" style={{ background: mediaBg(storeImage) }} />
      <span className="cast-venue-copy">
        <span className="cast-venue-head">
          <strong>{profile.store.name}</strong>
          <em>Đang mở</em>
        </span>
        <small>
          {profile.store.category || "Lounge"} · {area || "Khu vực đang cập nhật"}
        </small>
        <span className="cast-venue-meta">
          <span>18 cast</span>
        </span>
      </span>
      <span className="cast-venue-action">
        Xem quán
        <ChevronRight size={14} strokeWidth={2.4} />
      </span>
    </Link>
  );
}
