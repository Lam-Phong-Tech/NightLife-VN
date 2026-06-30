"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Heart } from "lucide-react";
import { ApiError } from "@/lib/api/client";
import { castFavoriteApi, type PublicCastDetail } from "@/lib/api/cast-detail";
import { CastBookingCTA } from "./CastBookingCTA";
import { CastGallery } from "./CastGallery";
import { CastHero } from "./CastHero";
import { CastInfo, CastRelatedCasts } from "./CastInfo";
import { CastProfileStyles } from "./CastProfileStyles";
import {
  buildBookingHref,
  buildCastArea,
  labelLanguage,
  placeholderGallery,
  profileFromCastDetail,
} from "./cast-profile.helpers";
import { personalizeRelatedCasts } from "./cast-profile.recommendations";
import { trackCastDetailClick } from "./cast-profile.tracking";
import type { CastGalleryAction } from "./cast-profile.types";

type CastProfileClientProps = {
  cast: PublicCastDetail;
};

const favoriteStorageKey = "nightlife_member_favorite_casts";

function readLocalFavorite(slug: string) {
  if (typeof window === "undefined") return false;

  try {
    const raw = window.localStorage.getItem(favoriteStorageKey);
    const slugs = raw ? (JSON.parse(raw) as string[]) : [];
    return slugs.includes(slug);
  } catch {
    window.localStorage.removeItem(favoriteStorageKey);
    return false;
  }
}

function writeLocalFavorite(slug: string, favorited: boolean) {
  if (typeof window === "undefined") return;

  try {
    const raw = window.localStorage.getItem(favoriteStorageKey);
    const slugs = new Set(raw ? (JSON.parse(raw) as string[]) : []);
    if (favorited) slugs.add(slug);
    else slugs.delete(slug);
    window.localStorage.setItem(favoriteStorageKey, JSON.stringify([...slugs].slice(0, 100)));
  } catch {
    window.localStorage.removeItem(favoriteStorageKey);
  }
}

export default function CastProfileClient({ cast }: CastProfileClientProps) {
  const profile = useMemo(() => profileFromCastDetail(cast), [cast]);
  const gallery = profile.gallery.length ? profile.gallery : placeholderGallery;
  const area = buildCastArea(profile);
  const storeHref = `/stores/${profile.store.slug}`;
  const bookingHref = buildBookingHref(profile, area);
  const languageText = profile.languages.map(labelLanguage).join(" · ");
  const relatedCasts = useMemo(
    () => personalizeRelatedCasts(profile, profile.relatedCasts),
    [profile],
  );
  const [isFavorite, setIsFavorite] = useState(() => readLocalFavorite(profile.slug));
  const [activeMediaIndex, setActiveMediaIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const activeMedia = gallery[Math.min(activeMediaIndex, gallery.length - 1)] ?? gallery[0]!;

  useEffect(() => {
    let ignore = false;

    Promise.resolve().then(() => {
      if (!ignore) setIsFavorite(readLocalFavorite(profile.slug));
    });

    castFavoriteApi
      .getState(profile.slug)
      .then((state) => {
        if (ignore) return;
        setIsFavorite(state.favorited);
        writeLocalFavorite(profile.slug, state.favorited);
      })
      .catch((error) => {
        if (error instanceof ApiError && [401, 403].includes(error.status)) return;
      });

    return () => {
      ignore = true;
    };
  }, [profile.slug]);

  const track = (
    action: "booking" | "gallery" | "store" | "favorite" | "related",
    metadata: Record<string, unknown> = {},
  ) => trackCastDetailClick(profile, action, metadata);

  const selectMedia = (index: number, action: CastGalleryAction = "select") => {
    setActiveMediaIndex(index);
    track("gallery", {
      action,
      mediaIndex: index,
      mediaType: gallery[index]?.type,
      mediaId: gallery[index]?.id,
    });
  };

  const openLightbox = (index = activeMediaIndex) => {
    setActiveMediaIndex(index);
    setIsLightboxOpen(true);
    track("gallery", {
      action: "open",
      mediaIndex: index,
      mediaType: gallery[index]?.type,
      mediaId: gallery[index]?.id,
    });
  };

  const toggleFavorite = async () => {
    const nextValue = !isFavorite;
    setIsFavorite(nextValue);
    writeLocalFavorite(profile.slug, nextValue);
    track("favorite", { favorited: nextValue });

    try {
      const state = nextValue
        ? await castFavoriteApi.favorite(profile.slug)
        : await castFavoriteApi.unfavorite(profile.slug);
      setIsFavorite(state.favorited);
      writeLocalFavorite(profile.slug, state.favorited);
    } catch (error) {
      if (error instanceof ApiError && [401, 403].includes(error.status)) {
        return;
      }

      setIsFavorite(!nextValue);
      writeLocalFavorite(profile.slug, !nextValue);
    }
  };

  return (
    <>
      <main className="cast-page nl-scroll-reveal-skip" data-testid="cast-detail-page" data-no-scroll-reveal="true">
        <div className="block md:hidden cast-mobile nl-scroll-reveal-skip" data-no-scroll-reveal="true">
          <CastHero
            profile={profile}
            activeMedia={activeMedia}
            area={area}
            isFavorite={isFavorite}
            onToggleFavorite={toggleFavorite}
            onOpenGallery={() => openLightbox(activeMediaIndex)}
          />
          <CastInfo
            profile={profile}
            area={area}
            languageText={languageText}
            storeHref={storeHref}
            variant="mobile"
            onTrack={track}
          />
          <CastGallery
            gallery={gallery}
            activeIndex={activeMediaIndex}
            variant="mobile"
            isLightboxOpen={isLightboxOpen}
            onSelect={selectMedia}
            onOpenLightbox={openLightbox}
            onCloseLightbox={() => setIsLightboxOpen(false)}
          />
          <CastRelatedCasts relatedCasts={relatedCasts} variant="mobile" onTrack={track} />
          <CastBookingCTA
            profile={profile}
            area={area}
            bookingHref={bookingHref}
            storeHref={storeHref}
            variant="mobile"
            isFavorite={isFavorite}
            onToggleFavorite={toggleFavorite}
            onTrack={track}
          />
        </div>

        <div className="hidden md:block cast-desktop">
          <div className="cast-desktop-shell">
            <div className="cast-desktop-grid">
              <CastGallery
                gallery={gallery}
                activeIndex={activeMediaIndex}
                variant="desktop"
                isLightboxOpen={isLightboxOpen}
                isFavorite={isFavorite}
                onSelect={selectMedia}
                onOpenLightbox={openLightbox}
                onCloseLightbox={() => setIsLightboxOpen(false)}
                onToggleFavorite={toggleFavorite}
              />

              <div className="cast-desktop-content">
                <nav className="cast-desktop-breadcrumb" aria-label="Breadcrumb">
                  <Link href="/">Trang chủ</Link>
                  <span>/</span>
                  <Link href="/danh-sach-cast">Cast</Link>
                  <span>/</span>
                  <strong>{profile.name}</strong>
                </nav>
                <div className="cast-desktop-favorite-anchor">
                  <CastInfo
                    profile={profile}
                    area={area}
                    languageText={languageText}
                    storeHref={storeHref}
                    variant="desktop"
                    onTrack={track}
                  />
                  <button
                    type="button"
                    className={`cast-desktop-fav${isFavorite ? " is-active" : ""}`}
                    onClick={toggleFavorite}
                    aria-label={isFavorite ? "Bỏ lưu cast" : "Lưu cast"}
                    aria-pressed={isFavorite}
                  >
                    <Heart size={20} strokeWidth={1.9} fill={isFavorite ? "currentColor" : "none"} />
                  </button>
                </div>

                <CastBookingCTA
                  profile={profile}
                  area={area}
                  bookingHref={bookingHref}
                  storeHref={storeHref}
                  variant="desktop"
                  onTrack={track}
                />
              </div>
            </div>
            <CastRelatedCasts relatedCasts={relatedCasts} variant="desktop" onTrack={track} />
          </div>
        </div>
      </main>
      <CastProfileStyles />
    </>
  );
}
