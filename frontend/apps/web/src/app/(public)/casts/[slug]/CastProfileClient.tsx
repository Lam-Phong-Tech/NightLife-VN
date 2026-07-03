"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Heart } from "lucide-react";
import { ApiError, apiClient } from "@/lib/api/client";
import { castFavoriteApi, type PublicCastDetail } from "@/lib/api/cast-detail";
import { isFavoriteCast, writeFavoriteCast } from "@/lib/member-favorites";
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
import { buildCastStructuredData } from "./cast-profile.schema";
import { trackCastDetailClick } from "./cast-profile.tracking";
import type { CastGalleryAction } from "./cast-profile.types";

type CastProfileClientProps = {
  cast: PublicCastDetail;
};

export default function CastProfileClient({ cast }: CastProfileClientProps) {
  const profile = useMemo(() => profileFromCastDetail(cast), [cast]);
  const gallery = profile.gallery.length ? profile.gallery : placeholderGallery;
  const area = buildCastArea(profile);
  const storeHref = `/stores/${profile.store.slug}`;
  const bookingHref = buildBookingHref(profile, area);
  const languageText = profile.languages.map(labelLanguage).join(" · ");
  const structuredData = useMemo(() => buildCastStructuredData(cast), [cast]);
  const relatedCasts = useMemo(
    () => personalizeRelatedCasts(profile, profile.relatedCasts),
    [profile],
  );
  const [isFavorite, setIsFavorite] = useState(() => isFavoriteCast(profile.slug));
  const [activeMediaIndex, setActiveMediaIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const activeMedia = gallery[Math.min(activeMediaIndex, gallery.length - 1)] ?? gallery[0]!;
  const favoriteImage = gallery.find((item) => item.type === "IMAGE")?.url;
  const favoriteSnapshot = useMemo(
    () => ({
      slug: profile.slug,
      name: profile.name,
      storeName: profile.store.name,
      categoryLabel: profile.store.category,
      areaLabel: area,
      image: favoriteImage,
    }),
    [area, favoriteImage, profile.name, profile.slug, profile.store.category, profile.store.name],
  );

  useEffect(() => {
    void apiClient<{ recorded: boolean }>("/analytics/profile-view", {
      data: { targetType: "CAST", targetId: profile.id },
    }).catch(() => undefined);
  }, [profile.id]);

  useEffect(() => {
    let ignore = false;

    Promise.resolve().then(() => {
      if (!ignore) setIsFavorite(isFavoriteCast(favoriteSnapshot.slug));
    });

    castFavoriteApi
      .getState(favoriteSnapshot.slug)
      .then((state) => {
        if (ignore) return;
        setIsFavorite(state.favorited);
        writeFavoriteCast(favoriteSnapshot, state.favorited);
      })
      .catch((error) => {
        if (error instanceof ApiError && [401, 403].includes(error.status)) return;
      });

    return () => {
      ignore = true;
    };
  }, [favoriteSnapshot]);

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

  const showPreviousMedia = () => {
    selectMedia(activeMediaIndex <= 0 ? gallery.length - 1 : activeMediaIndex - 1, "previous");
  };

  const showNextMedia = () => {
    selectMedia(activeMediaIndex >= gallery.length - 1 ? 0 : activeMediaIndex + 1, "next");
  };

  const toggleFavorite = async () => {
    const nextValue = !isFavorite;
    setIsFavorite(nextValue);
    writeFavoriteCast(favoriteSnapshot, nextValue);
    track("favorite", { favorited: nextValue });

    try {
      const state = nextValue
        ? await castFavoriteApi.favorite(profile.slug)
        : await castFavoriteApi.unfavorite(profile.slug);
      setIsFavorite(state.favorited);
      writeFavoriteCast(favoriteSnapshot, state.favorited);
    } catch (error) {
      if (error instanceof ApiError && [401, 403].includes(error.status)) {
        return;
      }

      setIsFavorite(!nextValue);
      writeFavoriteCast(favoriteSnapshot, !nextValue);
    }
  };

  return (
    <>
      <main
        className="cast-page nl-scroll-reveal-skip"
        data-testid="cast-detail-page"
        data-no-scroll-reveal="true"
      >
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />

        <div
          className="block md:hidden cast-mobile nl-scroll-reveal-skip"
          data-no-scroll-reveal="true"
        >
          <CastHero
            profile={profile}
            activeMedia={activeMedia}
            area={area}
            isFavorite={isFavorite}
            onToggleFavorite={toggleFavorite}
            onOpenGallery={() => openLightbox(activeMediaIndex)}
            onPreviousMedia={showPreviousMedia}
            onNextMedia={showNextMedia}
            showMediaNavigation={gallery.length > 1}
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
          <CastInfo
            profile={profile}
            area={area}
            languageText={languageText}
            storeHref={storeHref}
            variant="mobile"
            onTrack={track}
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
                    <Heart
                      size={20}
                      strokeWidth={1.9}
                      fill={isFavorite ? "currentColor" : "none"}
                    />
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
