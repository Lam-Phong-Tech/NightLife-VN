import Link from "next/link";
import { CalendarDays, ChevronRight, Sparkles, Star } from "lucide-react";
import type { RelatedCast } from "@/lib/api/cast-detail";
import type { LanguageCode } from "@/lib/i18n/use-active-language";
import { getCastProfileCopy, localizeCastText } from "./cast-profile.copy";
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
  language: LanguageCode;
  onTrack?: CastProfileTrack;
};

type RelatedCastsProps = {
  relatedCasts: RelatedCast[];
  variant: "mobile" | "desktop";
  language: LanguageCode;
  onTrack?: CastProfileTrack;
};

export function CastInfo({
  profile,
  area,
  languageText,
  storeHref,
  variant,
  language,
  onTrack,
}: CastInfoProps) {
  const copy = getCastProfileCopy(language);
  const month = localizeCastText(formatMonth(profile.monthOfBirth), language);
  const zodiac = localizeCastText(formatOptional(profile.zodiacSign), language);
  const interests = profile.interests?.length
    ? profile.interests.map((interest) => localizeCastText(interest, language)).join(" · ")
    : profile.tags.slice(0, 3).map((tag) => localizeCastText(labelTag(tag), language)).join(" · ") ||
      localizeCastText("Chưa cập nhật", language);
  const styleText =
    (profile.styleTags.length ? profile.styleTags : profile.tags)
      .slice(0, 4)
      .map((tag) => localizeCastText(labelTag(tag), language))
      .join(" · ") || copy.defaultStyle;

  if (variant === "mobile") {
    return (
      <>
        <section className="cast-section" data-testid="cast-info-mobile">
          <SectionHeading title={copy.introduction} />
          <p className="cast-mobile-bio">{profile.bio}</p>
          <div className="cast-detail-list">
            <InfoRow label={copy.language} value={languageText} />
            <InfoRow label={copy.interests} value={interests} />
            <InfoRow label={copy.style} value={styleText} />
          </div>
        </section>

        <section className="cast-section">
          <SectionHeading title={copy.currentVenue} />
          <VenueCard
            profile={profile}
            area={area}
            storeHref={storeHref}
            language={language}
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
          {copy.rankingThisMonth}
        </span>
        <span className="cast-live-badge">
          <span />
          {copy.acceptingTonight}
        </span>
      </div>

      <div className="cast-desktop-name-block">
        <h1>{profile.name}</h1>
        <p>
          {profile.heightCm ? `${profile.heightCm} cm · ` : ""}
          {area || copy.areaUpdating} · {profile.store.name}
        </p>
      </div>

      <div className="cast-desktop-stat-row">
        <span>
          <CalendarDays size={14} />
          <b>{month}</b>
          {copy.birthMonth}
        </span>
        <span>
          <Sparkles size={14} />
          <b>{zodiac}</b>
          {copy.zodiac}
        </span>
      </div>

      <div className="cast-desktop-chips">
        <ChipRows profile={profile} language={language} />
      </div>

      <p className="cast-desktop-copy">{profile.bio}</p>

      <div className="cast-detail-list desktop">
        <InfoRow label={copy.language} value={languageText} />
        <InfoRow label={copy.interests} value={interests} />
        <InfoRow label={copy.style} value={styleText} />
      </div>

      <SectionHeading title={copy.currentVenue} compact />
      <VenueCard profile={profile} area={area} storeHref={storeHref} language={language} onTrack={onTrack} />
    </section>
  );
}

export function CastRelatedCasts({ relatedCasts, variant, language, onTrack }: RelatedCastsProps) {
  if (!relatedCasts.length) return null;
  const copy = getCastProfileCopy(language);

  return (
    <section className={`cast-related-section ${variant}`} data-testid={`cast-related-${variant}`}>
      <div className="cast-section-heading">
        <h2>{copy.similarCast}</h2>
        <span />
        <small>{copy.viewAll}</small>
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
              <em>{recommendationLabel(cast, language)}</em>
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

function ChipRows({ profile, language }: { profile: CastProfile; language: LanguageCode }) {
  return (
    <div className="cast-chip-row">
      {profile.languages.map((profileLanguage) => (
        <span className="cast-chip language" key={profileLanguage}>
          {localizeCastText(labelLanguage(profileLanguage), language)}
        </span>
      ))}
      {profile.tags.slice(0, 5).map((tag) => (
        <span className="cast-chip tag" key={tag}>
          {localizeCastText(labelTag(tag), language)}
        </span>
      ))}
    </div>
  );
}

function VenueCard({
  profile,
  area,
  storeHref,
  language,
  onTrack,
  compact = false,
}: {
  profile: CastProfile;
  area: string;
  storeHref: string;
  language: LanguageCode;
  onTrack?: CastProfileTrack;
  compact?: boolean;
}) {
  const storeImage = profile.store.thumbnailUrl ?? placeholderGallery[0]!.url;
  const copy = getCastProfileCopy(language);

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
        </span>
        <small>
          {localizeCastText(profile.store.category || "Lounge", language)} · {area || copy.areaUpdating}
        </small>
        <span className="cast-venue-meta">
          <span>18 cast</span>
        </span>
      </span>
      <span className="cast-venue-actions">
        <span className="cast-venue-status">{copy.storeOpen}</span>
        <span className="cast-venue-action">
          {copy.viewVenue}
          <ChevronRight size={14} strokeWidth={2.4} />
        </span>
      </span>
    </Link>
  );
}
