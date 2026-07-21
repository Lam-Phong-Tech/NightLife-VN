"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ChevronRight, Heart, Star, Trash2 } from "lucide-react";
import { castFavoriteApi } from "@/lib/api/cast-detail";
import { discoveryApi, type PublicCast, type PublicStore } from "@/lib/api/discovery";
import { storeFavoriteApi } from "@/lib/api/store-favorite";
import { castImageForSlug, storeImageForSlug } from "@/lib/demo-media";
import { translateText } from "@/lib/i18n/client-translations";
import { useActiveLanguage, type LanguageCode } from "@/lib/i18n/use-active-language";
import { hasMemberFavoriteAccess } from "@/lib/member-favorite-auth";
import {
  readFavoriteCastItems,
  readFavoriteCastSlugs,
  readFavoriteStoreItems,
  readFavoriteStoreSlugs,
  replaceFavoriteCasts,
  replaceFavoriteStores,
  type SavedFavoriteCast,
  type SavedFavoriteStore,
  writeFavoriteCast,
  writeFavoriteStore,
} from "@/lib/member-favorites";
import { useUserActionFeedback, userActionErrorMessage } from "@/lib/user-action-feedback";

type SavedTab = "stores" | "casts";

type SavedPageCopy = {
  quickOpen: string;
  favoriteTypeLabel: string;
  savedFallback: string;
  removeStoreTitle: string;
  removeCastTitle: string;
  removeConfirmLabel: string;
  removeStoreSuccessTitle: string;
  removeCastSuccessTitle: string;
  removeStoreErrorTitle: string;
  removeCastErrorTitle: string;
  removeDescription: (name: string) => string;
  errorFallback: string;
  removeAria: (name: string) => string;
};

const savedPageCopy: Record<LanguageCode, SavedPageCopy> = {
  vi: {
    quickOpen: "Mở lại nhanh",
    favoriteTypeLabel: "Loại yêu thích",
    savedFallback: "Đã lưu",
    removeStoreTitle: "Bỏ lưu quán?",
    removeCastTitle: "Bỏ lưu cast?",
    removeConfirmLabel: "Bỏ lưu",
    removeStoreSuccessTitle: "Đã bỏ lưu quán",
    removeCastSuccessTitle: "Đã bỏ lưu cast",
    removeStoreErrorTitle: "Không bỏ lưu được quán",
    removeCastErrorTitle: "Không bỏ lưu được cast",
    removeDescription: (name) => `${name} đã được gỡ khỏi danh sách yêu thích.`,
    errorFallback: "Vui lòng thử lại sau.",
    removeAria: (name) => `Bỏ lưu ${name}`,
  },
  en: {
    quickOpen: "Open again quickly",
    favoriteTypeLabel: "Favorite type",
    savedFallback: "Saved",
    removeStoreTitle: "Unsave venue?",
    removeCastTitle: "Unsave Cast?",
    removeConfirmLabel: "Unsave",
    removeStoreSuccessTitle: "Venue removed",
    removeCastSuccessTitle: "Cast removed",
    removeStoreErrorTitle: "Could not unsave venue",
    removeCastErrorTitle: "Could not unsave Cast",
    removeDescription: (name) => `${name} has been removed from your favorites.`,
    errorFallback: "Please try again later.",
    removeAria: (name) => `Unsave ${name}`,
  },
  ja: {
    quickOpen: "すぐ開く",
    favoriteTypeLabel: "お気に入りタイプ",
    savedFallback: "保存済み",
    removeStoreTitle: "店舗の保存を解除しますか?",
    removeCastTitle: "キャストの保存を解除しますか?",
    removeConfirmLabel: "保存を解除",
    removeStoreSuccessTitle: "店舗の保存を解除しました",
    removeCastSuccessTitle: "キャストの保存を解除しました",
    removeStoreErrorTitle: "店舗の保存を解除できませんでした",
    removeCastErrorTitle: "キャストの保存を解除できませんでした",
    removeDescription: (name) => `${name}をお気に入りリストから削除しました。`,
    errorFallback: "しばらくしてからもう一度お試しください。",
    removeAria: (name) => `${name}の保存を解除`,
  },
  ko: {
    quickOpen: "빠르게 다시 열기",
    favoriteTypeLabel: "즐겨찾기 유형",
    savedFallback: "저장됨",
    removeStoreTitle: "매장 저장을 해제할까요?",
    removeCastTitle: "Cast 저장을 해제할까요?",
    removeConfirmLabel: "저장 해제",
    removeStoreSuccessTitle: "매장 저장을 해제했습니다",
    removeCastSuccessTitle: "Cast 저장을 해제했습니다",
    removeStoreErrorTitle: "매장 저장을 해제할 수 없습니다",
    removeCastErrorTitle: "Cast 저장을 해제할 수 없습니다",
    removeDescription: (name) => `${name}이(가) 즐겨찾기에서 삭제되었습니다.`,
    errorFallback: "잠시 후 다시 시도해 주세요.",
    removeAria: (name) => `${name} 저장 해제`,
  },
  zh: {
    quickOpen: "快速再次打开",
    favoriteTypeLabel: "收藏类型",
    savedFallback: "已保存",
    removeStoreTitle: "取消收藏店铺？",
    removeCastTitle: "取消收藏 Cast？",
    removeConfirmLabel: "取消收藏",
    removeStoreSuccessTitle: "已取消收藏店铺",
    removeCastSuccessTitle: "已取消收藏 Cast",
    removeStoreErrorTitle: "无法取消收藏店铺",
    removeCastErrorTitle: "无法取消收藏 Cast",
    removeDescription: (name) => `已将 ${name} 从收藏列表移除。`,
    errorFallback: "请稍后再试。",
    removeAria: (name) => `取消收藏 ${name}`,
  },
};

const categoryLabels: Record<string, string> = {
  BAR: "Bar",
  CLUB: "Club",
  LOUNGE: "Lounge",
  GIRLS_BAR: "Girls bar",
  KARAOKE: "Karaoke",
  MASSAGE_SPA: "Spa",
  RESTAURANT: "Nhà hàng",
  CASINO: "Casino",
};

const cityLabels: Record<string, string> = {
  hn: "Hà Nội",
  hcm: "TP.HCM",
};

const unique = (items: string[]) => Array.from(new Set(items.filter(Boolean)));

const withTimeout = async <T,>(promise: Promise<T>, fallback: T, ms = 2500) =>
  Promise.race([
    promise.catch(() => fallback),
    new Promise<T>((resolve) => {
      window.setTimeout(() => resolve(fallback), ms);
    }),
  ]);

const withNullableTimeout = async <T,>(promise: Promise<T>, ms = 2500) =>
  Promise.race([
    promise.catch(() => null),
    new Promise<null>((resolve) => {
      window.setTimeout(() => resolve(null), ms);
    }),
  ]);

const storeArea = (store: PublicStore) =>
  [store.area?.name ?? store.district, cityLabels[store.cityCode ?? ""] ?? store.city]
    .filter(Boolean)
    .join(" · ");

const castArea = (cast: PublicCast) =>
  [cast.store.area?.name ?? cast.store.district, cityLabels[cast.store.cityCode ?? ""] ?? cast.store.city]
    .filter(Boolean)
    .join(" · ");

const mergeStoreItem = (
  slug: string,
  stores: PublicStore[],
  snapshots: SavedFavoriteStore[],
  index: number,
): SavedFavoriteStore => {
  const snapshot = snapshots.find((item) => item.slug === slug);
  const store = stores.find((item) => item.slug === slug);

  return {
    slug,
    name: snapshot?.name ?? store?.name ?? slug,
    categoryLabel: snapshot?.categoryLabel ?? (store ? categoryLabels[store.category] ?? store.category : "Quán"),
    areaLabel: snapshot?.areaLabel ?? (store ? storeArea(store) : ""),
    cityLabel: snapshot?.cityLabel ?? store?.city ?? "",
    image: snapshot?.image ?? storeImageForSlug(slug, index),
    favoritedAt: snapshot?.favoritedAt,
  };
};

const mergeCastItem = (
  slug: string,
  casts: PublicCast[],
  snapshots: SavedFavoriteCast[],
  index: number,
): SavedFavoriteCast => {
  const snapshot = snapshots.find((item) => item.slug === slug);
  const cast = casts.find((item) => item.slug === slug);

  return {
    slug,
    name: snapshot?.name ?? cast?.publicAlias ?? cast?.name ?? cast?.stageName ?? slug,
    storeName: snapshot?.storeName ?? cast?.store.name ?? "",
    categoryLabel: snapshot?.categoryLabel ?? (cast ? categoryLabels[cast.store.category] ?? cast.store.category : "Cast"),
    areaLabel: snapshot?.areaLabel ?? (cast ? castArea(cast) : ""),
    image: snapshot?.image ?? castImageForSlug(slug, index),
    favoritedAt: snapshot?.favoritedAt,
  };
};

export default function Page() {
  const activeLanguage = useActiveLanguage();
  const copy = savedPageCopy[activeLanguage];
  const userFeedback = useUserActionFeedback();
  const [activeTab, setActiveTab] = useState<SavedTab>("stores");
  const [stores, setStores] = useState<SavedFavoriteStore[]>([]);
  const [casts, setCasts] = useState<SavedFavoriteCast[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadSaved = useCallback(() => {
    const storeSlugs = readFavoriteStoreSlugs();
    const castSlugs = readFavoriteCastSlugs();
    const storeSnapshots = readFavoriteStoreItems();
    const castSnapshots = readFavoriteCastItems();
    const mergedStoreSlugs = unique(storeSlugs);
    const mergedCastSlugs = unique(castSlugs);
    const canSyncFavorites = hasMemberFavoriteAccess();

    setStores(mergedStoreSlugs.map((slug, index) => mergeStoreItem(slug, [], storeSnapshots, index)));
    setCasts(mergedCastSlugs.map((slug, index) => mergeCastItem(slug, [], castSnapshots, index)));
    setIsLoading(false);

    void (async () => {
      const [storeList, castList] = await Promise.all([
        mergedStoreSlugs.length
          ? withTimeout(discoveryApi.listStores({ city: "all", limit: 120 }), [] as PublicStore[])
          : Promise.resolve([] as PublicStore[]),
        mergedCastSlugs.length
          ? withTimeout(discoveryApi.listCasts({ city: "all", limit: 160 }), [] as PublicCast[])
          : Promise.resolve([] as PublicCast[]),
      ]);

      const serverStoreFavorites = canSyncFavorites
        ? await withNullableTimeout(storeFavoriteApi.list())
        : null;
      const serverCastFavorites = canSyncFavorites
        ? await withNullableTimeout(castFavoriteApi.list())
        : null;

      const serverStoreSlugs = serverStoreFavorites?.map((item) => item.store.slug) ?? [];
      const serverStoreSnapshots = serverStoreFavorites?.map((item, index) => ({
        slug: item.store.slug,
        name: item.store.name,
        categoryLabel: categoryLabels[item.store.category] ?? item.store.category,
        areaLabel: storeArea(item.store),
        cityLabel: item.store.city,
        image: item.store.thumbnailUrl ?? storeImageForSlug(item.store.slug, index),
        favoritedAt: item.favoritedAt,
      })) ?? [];
      const serverCastSlugs = serverCastFavorites?.map((item) => item.cast.slug) ?? [];
      const serverSnapshots = serverCastFavorites?.map((item, index) => ({
        slug: item.cast.slug,
        name: item.cast.publicAlias ?? item.cast.name ?? item.cast.stageName,
        storeName: item.cast.store.name,
        categoryLabel: categoryLabels[item.cast.store.category] ?? item.cast.store.category,
        areaLabel: storeArea(item.cast.store),
        image: item.cast.thumbnailUrl ?? castImageForSlug(item.cast.slug, index),
        favoritedAt: item.favoritedAt,
      })) ?? [];

      const nextStoreSlugs = serverStoreFavorites ? unique(serverStoreSlugs) : mergedStoreSlugs;
      const nextCastSlugs = serverCastFavorites ? unique(serverCastSlugs) : mergedCastSlugs;
      const mergedStoreSnapshots = serverStoreFavorites ? serverStoreSnapshots : storeSnapshots;
      const mergedCastSnapshots = serverCastFavorites ? serverSnapshots : castSnapshots;

      if (serverStoreFavorites) {
        replaceFavoriteStores(serverStoreSnapshots);
      }

      if (serverCastFavorites) {
        replaceFavoriteCasts(serverSnapshots);
      }

      setStores(nextStoreSlugs.map((slug, index) => mergeStoreItem(slug, storeList, mergedStoreSnapshots, index)));
      setCasts(nextCastSlugs.map((slug, index) => mergeCastItem(slug, castList, mergedCastSnapshots, index)));
    })();
  }, []);

  useEffect(() => {
    const refresh = () => loadSaved();
    const timer = window.setTimeout(refresh, 0);
    window.addEventListener("focus", refresh);
    window.addEventListener("storage", refresh);

    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("focus", refresh);
      window.removeEventListener("storage", refresh);
    };
  }, [loadSaved]);

  const visibleItems = useMemo(
    () => (activeTab === "stores" ? stores : casts),
    [activeTab, casts, stores],
  );

  const applyRemoveStore = async (item: SavedFavoriteStore) => {
    writeFavoriteStore(item, false);
    setStores((current) => current.filter((store) => store.slug !== item.slug));

    try {
      await storeFavoriteApi.unfavorite(item.slug);
      userFeedback.success({
        title: copy.removeStoreSuccessTitle,
        description: copy.removeDescription(item.name),
      });
    } catch (error) {
      writeFavoriteStore(item, true);
      setStores((current) =>
        current.some((store) => store.slug === item.slug) ? current : [item, ...current],
      );
      userFeedback.error({
        title: copy.removeStoreErrorTitle,
        description: userActionErrorMessage(error, copy.errorFallback),
      });
    }
  };

  const removeStore = (item: SavedFavoriteStore) => {
    userFeedback.confirmAction({
      title: copy.removeStoreTitle,
      description: copy.removeDescription(item.name),
      confirmLabel: copy.removeConfirmLabel,
      tone: "warning",
      destructive: true,
      onConfirm: () => applyRemoveStore(item),
    });
  };

  const applyRemoveCast = async (item: SavedFavoriteCast) => {
    writeFavoriteCast(item, false);
    setCasts((current) => current.filter((cast) => cast.slug !== item.slug));

    try {
      await castFavoriteApi.unfavorite(item.slug);
      userFeedback.success({
        title: copy.removeCastSuccessTitle,
        description: copy.removeDescription(item.name),
      });
    } catch (error) {
      writeFavoriteCast(item, true);
      setCasts((current) =>
        current.some((cast) => cast.slug === item.slug) ? current : [item, ...current],
      );
      userFeedback.error({
        title: copy.removeCastErrorTitle,
        description: userActionErrorMessage(error, copy.errorFallback),
      });
    }
  };

  const removeCast = (item: SavedFavoriteCast) => {
    userFeedback.confirmAction({
      title: copy.removeCastTitle,
      description: copy.removeDescription(item.name),
      confirmLabel: copy.removeConfirmLabel,
      tone: "warning",
      destructive: true,
      onConfirm: () => applyRemoveCast(item),
    });
  };

  return (
    <main className="saved-page">
      <style>{savedPageCss}</style>

      <section className="saved-shell">
        <header className="saved-head">
          <div>
            <h1>{translateText("Quán & Cast đã lưu", activeLanguage)}</h1>
            <p>{translateText("Những mục bạn bấm tim sẽ nằm ở đây để mở lại nhanh.", activeLanguage)}</p>
          </div>
        </header>

        <div className="saved-tabs" role="tablist" aria-label={copy.favoriteTypeLabel}>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === "stores"}
            className={activeTab === "stores" ? "active" : ""}
            onClick={() => setActiveTab("stores")}
          >
            {translateText("Quán", activeLanguage)} <span>{stores.length}</span>
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === "casts"}
            className={activeTab === "casts" ? "active" : ""}
            onClick={() => setActiveTab("casts")}
          >
            {translateText("Cast", activeLanguage)} <span>{casts.length}</span>
          </button>
        </div>

        {isLoading ? (
          <div className="saved-loading">
            <span />
            <span />
            <span />
          </div>
        ) : null}

        {!isLoading && visibleItems.length ? (
          <div className="saved-list">
            {activeTab === "stores"
              ? stores.map((item) => (
                  <SavedCard
                    href={`/stores/${item.slug}`}
                    image={item.image}
                    key={item.slug}
                    meta={[item.areaLabel, item.categoryLabel].filter(Boolean).join(" · ")}
                    onRemove={() => removeStore(item)}
                    quickLabel={copy.quickOpen}
                    removeLabel={copy.removeAria(item.name)}
                    savedFallback={copy.savedFallback}
                    title={item.name}
                  />
                ))
              : casts.map((item) => (
                  <SavedCard
                    href={`/casts/${item.slug}`}
                    image={item.image}
                    key={item.slug}
                    meta={[item.storeName, item.areaLabel].filter(Boolean).join(" · ")}
                    onRemove={() => removeCast(item)}
                    quickLabel={copy.quickOpen}
                    removeLabel={copy.removeAria(item.name)}
                    savedFallback={copy.savedFallback}
                    title={item.name}
                  />
                ))}
          </div>
        ) : null}

        {!isLoading && !visibleItems.length ? (
          <section className="saved-empty">
            <span className="saved-empty-icon">
              <Heart size={30} />
            </span>
            <h2>{translateText("Chưa lưu mục nào", activeLanguage)}</h2>
            <p>{translateText("Nhấn biểu tượng tim trên quán hoặc cast để lưu lại và xem nhanh tại đây.", activeLanguage)}</p>
            <Link href={activeTab === "stores" ? "/danh-sach-quan" : "/danh-sach-cast"}>
              {translateText(activeTab === "stores" ? "Khám phá quán" : "Khám phá cast", activeLanguage)}
              <ChevronRight size={16} />
            </Link>
          </section>
        ) : null}
      </section>
    </main>
  );
}

function SavedCard({
  href,
  image,
  meta,
  onRemove,
  quickLabel,
  removeLabel,
  savedFallback,
  title,
}: {
  href: string;
  image?: string;
  meta: string;
  onRemove: () => void;
  quickLabel: string;
  removeLabel: string;
  savedFallback: string;
  title: string;
}) {
  return (
    <article className="saved-card">
      <Link href={href} className="saved-link">
        <span className="saved-photo" style={{ backgroundImage: image ? `url("${image}")` : undefined }} />
        <span className="saved-copy">
          <strong>{title}</strong>
          <small>{meta || savedFallback}</small>
          <em>
            <Star size={13} fill="currentColor" />
            {quickLabel}
          </em>
        </span>
        <ChevronRight size={18} />
      </Link>
      <button type="button" aria-label={removeLabel} onClick={onRemove}>
        <Trash2 size={16} />
      </button>
    </article>
  );
}

const savedPageCss = `
  .saved-page {
    background: var(--vy-bg);
    color: var(--vy-text);
    font-family: var(--nl-font-sans);
    padding: 22px 18px 18px;
  }

  .saved-shell {
    width: min(100%, 760px);
    margin: 0 auto;
    display: grid;
    gap: 16px;
  }

  .saved-head {
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    gap: 16px;
  }

  .saved-head h1 {
    margin: 0;
    font-size: clamp(24px, 7vw, 36px);
    line-height: 1.05;
    font-weight: 950;
    letter-spacing: 0;
  }

  .saved-head p {
    margin: 8px 0 0;
    color: #b6b1a6;
    font-size: 13px;
    line-height: 1.55;
  }

  .saved-tabs {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 6px;
    border: 1px solid rgba(212, 178, 106, 0.22);
    border-radius: 8px;
    background: rgba(255, 255, 255, 0.045);
    padding: 5px;
  }

  .saved-tabs button {
    min-height: 46px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 9px;
    min-width: 0;
    padding: 0 12px;
    border: 0;
    border-radius: 7px;
    background: transparent;
    color: #b6b1a6;
    font: inherit;
    font-weight: 900;
    cursor: pointer;
  }

  .saved-tabs button.active {
    background: linear-gradient(135deg, #f4e3b4, #d4b26a 55%, #b6924a);
    color: #241a0a;
  }

  .saved-tabs span {
    flex: none;
    min-width: 32px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border: 1px solid rgba(212, 178, 106, 0.34);
    border-radius: 999px;
    background: rgba(212, 178, 106, 0.12);
    color: #f0dda8;
    padding: 6px 9px;
    font-size: 12px;
    font-weight: 950;
    line-height: 1;
    box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.04);
  }

  .saved-tabs button.active span {
    border-color: rgba(36, 26, 10, 0.24);
    background: rgba(36, 26, 10, 0.16);
    color: #241a0a;
    box-shadow: none;
  }

  .saved-list,
  .saved-loading {
    display: grid;
    gap: 12px;
  }

  .saved-card {
    position: relative;
    border: 1px solid rgba(212, 178, 106, 0.18);
    border-radius: 8px;
    background: rgba(255, 255, 255, 0.04);
    overflow: hidden;
  }

  .saved-link {
    min-height: 108px;
    display: grid;
    grid-template-columns: 104px minmax(0, 1fr) 22px;
    align-items: center;
    gap: 14px;
    padding: 12px 58px 12px 12px;
    color: inherit;
    text-decoration: none;
  }

  .saved-photo {
    width: 104px;
    height: 84px;
    border-radius: 8px;
    background:
      radial-gradient(circle at 24% 20%, rgba(212, 178, 106, 0.3), transparent 28%),
      linear-gradient(135deg, #19191d, #2a2418);
    background-position: center;
    background-size: cover;
  }

  .saved-copy {
    min-width: 0;
    display: grid;
    gap: 6px;
  }

  .saved-copy strong {
    overflow: hidden;
    color: var(--vy-text);
    font-size: 18px;
    font-weight: 950;
    line-height: 1.15;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .saved-copy small {
    overflow: hidden;
    color: var(--vy-text-2);
    font-size: 13px;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .saved-copy em {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    color: #d4b26a;
    font-size: 12px;
    font-style: normal;
    font-weight: 850;
  }

  .saved-card > button {
    position: absolute;
    top: 50%;
    right: 12px;
    width: 36px;
    min-height: 36px;
    transform: translateY(-50%);
    border: 1px solid rgba(255, 107, 139, 0.28);
    border-radius: 50%;
    background: rgba(255, 107, 139, 0.09);
    color: #ff6b8b;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
  }

  .saved-empty {
    border: 1px dashed rgba(212, 178, 106, 0.28);
    border-radius: 8px;
    background: rgba(255, 255, 255, 0.025);
    padding: 34px 22px;
    text-align: center;
  }

  .saved-empty-icon {
    width: 64px;
    height: 64px;
    margin: 0 auto 14px;
    border-radius: 50%;
    background: rgba(212, 178, 106, 0.1);
    color: #d4b26a;
    display: inline-flex;
    align-items: center;
    justify-content: center;
  }

  .saved-empty h2 {
    margin: 0;
    font-size: 22px;
    font-weight: 950;
  }

  .saved-empty p {
    max-width: 360px;
    margin: 10px auto 18px;
    color: #b6b1a6;
    font-size: 14px;
    line-height: 1.6;
  }

  .saved-empty a {
    min-height: 44px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    border-radius: 8px;
    background: #d4b26a;
    color: #241a0a;
    padding: 0 18px;
    font-weight: 950;
    text-decoration: none;
  }

  .saved-loading span {
    min-height: 108px;
    border-radius: 8px;
    background: linear-gradient(90deg, rgba(255,255,255,.04), rgba(212,178,106,.12), rgba(255,255,255,.04));
    background-size: 220% 100%;
    animation: saved-shimmer 1.2s linear infinite;
  }

  @keyframes saved-shimmer {
    to {
      background-position: -220% 0;
    }
  }

  @media (max-width: 520px) {
    .saved-page {
      padding: 18px 16px 16px;
    }

    .saved-tabs button {
      min-height: 50px;
      flex-direction: row;
      gap: 8px;
      padding: 0 8px;
      font-size: 13px;
    }

    .saved-tabs span {
      min-width: 30px;
      padding: 6px 8px;
      font-size: 11px;
    }

    .saved-link {
      grid-template-columns: 92px minmax(0, 1fr) 18px;
      gap: 12px;
      padding: 10px 54px 10px 10px;
    }

    .saved-photo {
      width: 92px;
      height: 78px;
    }

    .saved-copy strong {
      font-size: 16px;
    }
  }
`;
