"use client";

import type { PointerEvent as ReactPointerEvent } from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { ApiError, apiClient } from "@/lib/api/client";
import { castFavoriteApi, type PublicCastDetail } from "@/lib/api/cast-detail";
import { CastBookingCTA } from "./CastBookingCTA";
import { CastGallery } from "./CastGallery";
import { CastHero } from "./CastHero";
import { CastInfo, CastRelatedCasts } from "./CastInfo";
import { CastProfileStyles } from "./CastProfileStyles";
import { translateText } from "@/lib/i18n/client-translations";
import { useActiveLanguage, type LanguageCode } from "@/lib/i18n/use-active-language";
import {
  buildBookingHref,
  buildCastArea,
  labelLanguage,
  placeholderGallery,
  profileFromCastDetail,
} from "./cast-profile.helpers";
import { getCastProfileCopy, localizeCastText } from "./cast-profile.copy";
import { personalizeRelatedCasts } from "./cast-profile.recommendations";
import { trackCastDetailClick } from "./cast-profile.tracking";
import type { CastGalleryAction } from "./cast-profile.types";
import {
  hasMemberFavoriteAccess,
  redirectToLoginForFavorite,
  requireMemberFavoriteAccess,
} from "@/lib/member-favorite-auth";
import { isFavoriteCast, writeFavoriteCast } from "@/lib/member-favorites";
import { useUserActionFeedback, userActionErrorMessage } from "@/lib/user-action-feedback";

type CastProfileClientProps = {
  cast: PublicCastDetail;
};

type CastFavoriteFeedbackCopy = {
  savedTitle: string;
  unsavedTitle: string;
  savedDescription: string;
  unsavedDescription: string;
  errorTitle: string;
  errorFallback: string;
  saveConfirmTitle: string;
  unsaveConfirmTitle: string;
  saveConfirmDescription: string;
  unsaveConfirmDescription: string;
  saveConfirmLabel: string;
  unsaveConfirmLabel: string;
};

const castFavoriteFeedbackCopy = (
  language: LanguageCode,
  castName: string,
): CastFavoriteFeedbackCopy => {
  const copy: Record<LanguageCode, CastFavoriteFeedbackCopy> = {
    vi: {
      savedTitle: "Đã thêm cast yêu thích",
      unsavedTitle: "Đã bỏ lưu cast",
      savedDescription: `${castName} đã được lưu vào danh sách yêu thích.`,
      unsavedDescription: `${castName} đã được gỡ khỏi danh sách yêu thích.`,
      errorTitle: "Không cập nhật được yêu thích",
      errorFallback: "Vui lòng thử lại sau.",
      saveConfirmTitle: "Lưu cast yêu thích?",
      unsaveConfirmTitle: "Bỏ lưu cast?",
      saveConfirmDescription: `Thêm ${castName} vào danh sách yêu thích của bạn.`,
      unsaveConfirmDescription: `Gỡ ${castName} khỏi danh sách yêu thích của bạn.`,
      saveConfirmLabel: "Lưu cast",
      unsaveConfirmLabel: "Bỏ lưu",
    },
    en: {
      savedTitle: "Added Cast to favorites",
      unsavedTitle: "Removed saved Cast",
      savedDescription: `${castName} has been saved to your favorites.`,
      unsavedDescription: `${castName} has been removed from your favorites.`,
      errorTitle: "Could not update favorites",
      errorFallback: "Please try again later.",
      saveConfirmTitle: "Save this Cast?",
      unsaveConfirmTitle: "Remove saved Cast?",
      saveConfirmDescription: `Add ${castName} to your favorites.`,
      unsaveConfirmDescription: `Remove ${castName} from your favorites.`,
      saveConfirmLabel: "Save Cast",
      unsaveConfirmLabel: "Remove",
    },
    ja: {
      savedTitle: "キャストをお気に入りに追加しました",
      unsavedTitle: "キャストの保存を解除しました",
      savedDescription: `${castName}をお気に入りリストに保存しました。`,
      unsavedDescription: `${castName}をお気に入りリストから削除しました。`,
      errorTitle: "お気に入りを更新できませんでした",
      errorFallback: "しばらくしてからもう一度お試しください。",
      saveConfirmTitle: "キャストをお気に入りに保存しますか?",
      unsaveConfirmTitle: "保存を解除しますか?",
      saveConfirmDescription: `${castName}をお気に入りリストに追加します。`,
      unsaveConfirmDescription: `${castName}をお気に入りリストから削除します。`,
      saveConfirmLabel: "キャストを保存",
      unsaveConfirmLabel: "削除",
    },
    ko: {
      savedTitle: "캐스트를 즐겨찾기에 추가했습니다",
      unsavedTitle: "캐스트 저장을 해제했습니다",
      savedDescription: `${castName}이(가) 즐겨찾기에 저장되었습니다.`,
      unsavedDescription: `${castName}이(가) 즐겨찾기에서 삭제되었습니다.`,
      errorTitle: "즐겨찾기를 업데이트할 수 없습니다",
      errorFallback: "잠시 후 다시 시도해 주세요.",
      saveConfirmTitle: "이 Cast를 저장할까요?",
      unsaveConfirmTitle: "저장한 Cast를 삭제할까요?",
      saveConfirmDescription: `${castName}을(를) 즐겨찾기에 추가합니다.`,
      unsaveConfirmDescription: `${castName}을(를) 즐겨찾기에서 삭제합니다.`,
      saveConfirmLabel: "Cast 저장",
      unsaveConfirmLabel: "삭제",
    },
    zh: {
      savedTitle: "已收藏 Cast",
      unsavedTitle: "已取消收藏 Cast",
      savedDescription: `已将 ${castName} 保存到收藏列表。`,
      unsavedDescription: `已将 ${castName} 从收藏列表移除。`,
      errorTitle: "无法更新收藏",
      errorFallback: "请稍后再试。",
      saveConfirmTitle: "收藏此 Cast？",
      unsaveConfirmTitle: "取消收藏此 Cast？",
      saveConfirmDescription: `将 ${castName} 添加到收藏列表。`,
      unsaveConfirmDescription: `将 ${castName} 从收藏列表移除。`,
      saveConfirmLabel: "收藏 Cast",
      unsaveConfirmLabel: "移除",
    },
  };

  return copy[language];
};

const heroSwipeDistancePx = 48;

export default function CastProfileClient({ cast }: CastProfileClientProps) {
  const activeLanguage = useActiveLanguage();
  const userFeedback = useUserActionFeedback();
  const profile = useMemo(() => profileFromCastDetail(cast), [cast]);
  const gallery = profile.gallery.length ? profile.gallery : placeholderGallery;
  const area = buildCastArea(profile);
  const storeHref = `/stores/${profile.store.slug}`;
  const bookingHref = buildBookingHref(profile, area);
  const copy = getCastProfileCopy(activeLanguage);
  const languageText = profile.languages
    .map((language) => localizeCastText(labelLanguage(language), activeLanguage))
    .join(" · ");
  const relatedCasts = useMemo(
    () => personalizeRelatedCasts(profile, profile.relatedCasts),
    [profile],
  );
  const [activeMediaIndex, setActiveMediaIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [portalTarget, setPortalTarget] = useState<HTMLElement | null>(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const heroSwipeRef = useRef({
    pointerId: null as number | null,
    startX: 0,
    startY: 0,
  });
  const activeMedia = gallery[Math.min(activeMediaIndex, gallery.length - 1)] ?? gallery[0]!;
  const favoriteFeedbackCopy = castFavoriteFeedbackCopy(activeLanguage, profile.name);
  const favoriteSnapshot = useMemo(
    () => ({
      slug: profile.slug,
      name: profile.name,
      storeName: profile.store.name,
      categoryLabel: profile.store.category,
      areaLabel: area,
      image:
        profile.thumbnailUrl ??
        gallery.find((media) => media.type === "IMAGE" && !media.isPlaceholder)?.url ??
        undefined,
    }),
    [area, gallery, profile.name, profile.slug, profile.store.category, profile.store.name, profile.thumbnailUrl],
  );

  useEffect(() => {
    void apiClient<{ recorded: boolean }>("/analytics/profile-view", {
      data: { targetType: "CAST", targetId: profile.id },
    }).catch(() => undefined);
  }, [profile.id]);

  useEffect(() => {
    let cancelled = false;

    queueMicrotask(() => {
      if (!cancelled) setPortalTarget(document.body);
    });

    return () => {
      cancelled = true;
    };
  }, []);

  const track = (
    action: "booking" | "gallery" | "store" | "favorite" | "related",
    metadata: Record<string, unknown> = {},
  ) => trackCastDetailClick(profile, action, metadata);

  useEffect(() => {
    let ignore = false;

    if (!hasMemberFavoriteAccess()) {
      Promise.resolve().then(() => {
        if (!ignore) setIsFavorite(false);
      });

      return () => {
        ignore = true;
      };
    }

    Promise.resolve(isFavoriteCast(favoriteSnapshot.slug)).then((favorited) => {
      if (!ignore) setIsFavorite(favorited);
    });

    castFavoriteApi
      .getState(favoriteSnapshot.slug)
      .then((state) => {
        if (ignore) return;
        setIsFavorite(state.favorited);
        writeFavoriteCast(favoriteSnapshot, state.favorited);
      })
      .catch(() => undefined);

    return () => {
      ignore = true;
    };
  }, [favoriteSnapshot]);

  const applyFavoriteChange = async (nextValue: boolean) => {
    setIsFavorite(nextValue);
    writeFavoriteCast(favoriteSnapshot, nextValue);
    track("favorite", { favorited: nextValue });

    try {
      const state = nextValue
        ? await castFavoriteApi.favorite(profile.slug)
        : await castFavoriteApi.unfavorite(profile.slug);
      setIsFavorite(state.favorited);
      writeFavoriteCast(favoriteSnapshot, state.favorited);
      userFeedback.success({
        title: state.favorited
          ? favoriteFeedbackCopy.savedTitle
          : favoriteFeedbackCopy.unsavedTitle,
        description: state.favorited
          ? favoriteFeedbackCopy.savedDescription
          : favoriteFeedbackCopy.unsavedDescription,
      });
    } catch (error) {
      if (error instanceof ApiError && [401, 403].includes(error.status)) {
        setIsFavorite(false);
        writeFavoriteCast(favoriteSnapshot, false);
        redirectToLoginForFavorite();
        return;
      }

      setIsFavorite(!nextValue);
      writeFavoriteCast(favoriteSnapshot, !nextValue);
      userFeedback.error({
        title: favoriteFeedbackCopy.errorTitle,
        description: translateText(
          userActionErrorMessage(error, favoriteFeedbackCopy.errorFallback),
          activeLanguage,
        ),
      });
    }
  };

  const toggleFavorite = () => {
    if (!requireMemberFavoriteAccess()) {
      return;
    }

    const nextValue = !isFavorite;
    userFeedback.confirmAction({
      title: nextValue
        ? favoriteFeedbackCopy.saveConfirmTitle
        : favoriteFeedbackCopy.unsaveConfirmTitle,
      description: nextValue
        ? favoriteFeedbackCopy.saveConfirmDescription
        : favoriteFeedbackCopy.unsaveConfirmDescription,
      confirmLabel: nextValue
        ? favoriteFeedbackCopy.saveConfirmLabel
        : favoriteFeedbackCopy.unsaveConfirmLabel,
      tone: nextValue ? "gold" : "warning",
      destructive: !nextValue,
      onConfirm: () => applyFavoriteChange(nextValue),
    });
  };

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

  const resetHeroSwipe = () => {
    heroSwipeRef.current.pointerId = null;
  };

  const handleHeroPointerDown = (event: ReactPointerEvent<HTMLElement>) => {
    if (event.pointerType !== "touch" || gallery.length < 2) return;
    const target = event.target;
    if (target instanceof Element && target.closest("a, button")) return;

    heroSwipeRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
    };
  };

  const handleHeroPointerUp = (event: ReactPointerEvent<HTMLElement>) => {
    const swipe = heroSwipeRef.current;
    if (swipe.pointerId !== event.pointerId) return;

    const deltaX = event.clientX - swipe.startX;
    const deltaY = event.clientY - swipe.startY;
    resetHeroSwipe();

    if (Math.abs(deltaX) < heroSwipeDistancePx || Math.abs(deltaX) <= Math.abs(deltaY) * 1.2) {
      return;
    }

    if (deltaX > 0) {
      showPreviousMedia();
    } else {
      showNextMedia();
    }
  };

  return (
    <>
      <main
        className="cast-page nl-scroll-reveal-skip"
        data-testid="cast-detail-page"
        data-no-scroll-reveal="true"
      >
        <div
          className="block md:hidden cast-mobile nl-scroll-reveal-skip"
          data-no-scroll-reveal="true"
        >
          <CastHero
            profile={profile}
            activeMedia={activeMedia}
            area={area}
            language={activeLanguage}
            onOpenGallery={() => openLightbox(activeMediaIndex)}
            onPreviousMedia={showPreviousMedia}
            onNextMedia={showNextMedia}
            showMediaNavigation={gallery.length > 1}
            favoriteLabel={isFavorite ? copy.removeFavorite : copy.favorite}
            isFavorite={isFavorite}
            onToggleFavorite={toggleFavorite}
            onHeroPointerDown={handleHeroPointerDown}
            onHeroPointerUp={handleHeroPointerUp}
            onHeroPointerCancel={resetHeroSwipe}
          />
          <CastGallery
            gallery={gallery}
            activeIndex={activeMediaIndex}
            variant="mobile"
            language={activeLanguage}
            isLightboxOpen={isLightboxOpen}
            onSelect={selectMedia}
            onOpenLightbox={openLightbox}
            onCloseLightbox={() => setIsLightboxOpen(false)}
            favoriteLabel={isFavorite ? copy.removeFavorite : copy.favorite}
            isFavorite={isFavorite}
            onToggleFavorite={toggleFavorite}
          />
          <CastInfo
            profile={profile}
            area={area}
            languageText={languageText}
            storeHref={storeHref}
            variant="mobile"
            language={activeLanguage}
            onTrack={track}
          />
          <CastRelatedCasts
            relatedCasts={relatedCasts}
            variant="mobile"
            language={activeLanguage}
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
                language={activeLanguage}
                onSelect={selectMedia}
                onOpenLightbox={openLightbox}
                onCloseLightbox={() => setIsLightboxOpen(false)}
                favoriteLabel={isFavorite ? copy.removeFavorite : copy.favorite}
                isFavorite={isFavorite}
                onToggleFavorite={toggleFavorite}
              />

              <div className="cast-desktop-content">
                <nav className="cast-desktop-breadcrumb" aria-label="Breadcrumb">
                  <Link href="/">{copy.home}</Link>
                  <span>/</span>
                  <Link href="/danh-sach-cast">Cast</Link>
                  <span>/</span>
                  <strong>{profile.name}</strong>
                </nav>
                <CastInfo
                  profile={profile}
                  area={area}
                  languageText={languageText}
                  storeHref={storeHref}
                  variant="desktop"
                  language={activeLanguage}
                  onTrack={track}
                />

                <CastBookingCTA
                  profile={profile}
                  area={area}
                  bookingHref={bookingHref}
                  variant="desktop"
                  language={activeLanguage}
                  onTrack={track}
                />
              </div>
            </div>
            <CastRelatedCasts
              relatedCasts={relatedCasts}
              variant="desktop"
              language={activeLanguage}
              onTrack={track}
            />
          </div>
        </div>
      </main>
      {portalTarget
        ? createPortal(
            <CastBookingCTA
              profile={profile}
              area={area}
              bookingHref={bookingHref}
              variant="mobile"
              language={activeLanguage}
              onTrack={track}
            />,
            portalTarget,
          )
        : null}
      <CastProfileStyles />
    </>
  );
}
