"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ChevronRight, Heart, Star, Trash2 } from "lucide-react";
import { castFavoriteApi } from "@/lib/api/cast-detail";
import { discoveryApi, type PublicCast, type PublicStore } from "@/lib/api/discovery";
import { storeFavoriteApi } from "@/lib/api/store-favorite";
import { castImageForSlug, storeImageForSlug } from "@/lib/demo-media";
import { hasMemberFavoriteAccess } from "@/lib/member-favorite-auth";
import {
  readFavoriteCastItems,
  readFavoriteCastSlugs,
  readFavoriteStoreItems,
  readFavoriteStoreSlugs,
  type SavedFavoriteCast,
  type SavedFavoriteStore,
  writeFavoriteCast,
  writeFavoriteStore,
} from "@/lib/member-favorites";

type SavedTab = "stores" | "casts";

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

      let serverStoreFavorites = canSyncFavorites
        ? await withNullableTimeout(storeFavoriteApi.list())
        : null;
      let serverCastFavorites = canSyncFavorites
        ? await withNullableTimeout(castFavoriteApi.list())
        : null;

      if (canSyncFavorites && serverStoreFavorites && !serverStoreFavorites.length && mergedStoreSlugs.length) {
        await Promise.allSettled(mergedStoreSlugs.map((slug) => storeFavoriteApi.favorite(slug)));
        serverStoreFavorites = (await withNullableTimeout(storeFavoriteApi.list())) ?? serverStoreFavorites;
      }

      if (canSyncFavorites && serverCastFavorites && !serverCastFavorites.length && mergedCastSlugs.length) {
        await Promise.allSettled(mergedCastSlugs.map((slug) => castFavoriteApi.favorite(slug)));
        serverCastFavorites = (await withNullableTimeout(castFavoriteApi.list())) ?? serverCastFavorites;
      }

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

  const removeStore = (item: SavedFavoriteStore) => {
    writeFavoriteStore(item, false);
    setStores((current) => current.filter((store) => store.slug !== item.slug));
    void storeFavoriteApi.unfavorite(item.slug).catch(() => undefined);
  };

  const removeCast = (item: SavedFavoriteCast) => {
    writeFavoriteCast(item, false);
    setCasts((current) => current.filter((cast) => cast.slug !== item.slug));
    void castFavoriteApi.unfavorite(item.slug).catch(() => undefined);
  };

  return (
    <main className="saved-page">
      <style>{savedPageCss}</style>

      <section className="saved-shell">
        <header className="saved-head">
          <div>
            <h1>Quán & Cast đã lưu</h1>
            <p>Những mục bạn bấm tim sẽ nằm ở đây để mở lại nhanh.</p>
          </div>
        </header>

        <div className="saved-tabs" role="tablist" aria-label="Loại yêu thích">
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === "stores"}
            className={activeTab === "stores" ? "active" : ""}
            onClick={() => setActiveTab("stores")}
          >
            Quán <span>{stores.length}</span>
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === "casts"}
            className={activeTab === "casts" ? "active" : ""}
            onClick={() => setActiveTab("casts")}
          >
            Cast <span>{casts.length}</span>
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
            <h2>Chưa lưu mục nào</h2>
            <p>Nhấn biểu tượng tim trên quán hoặc cast để lưu lại và xem nhanh tại đây.</p>
            <Link href={activeTab === "stores" ? "/danh-sach-quan" : "/danh-sach-cast"}>
              {activeTab === "stores" ? "Khám phá quán" : "Khám phá cast"}
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
  title,
}: {
  href: string;
  image?: string;
  meta: string;
  onRemove: () => void;
  title: string;
}) {
  return (
    <article className="saved-card">
      <Link href={href} className="saved-link">
        <span className="saved-photo" style={{ backgroundImage: image ? `url("${image}")` : undefined }} />
        <span className="saved-copy">
          <strong>{title}</strong>
          <small>{meta || "Đã lưu"}</small>
          <em>
            <Star size={13} fill="currentColor" />
            Mở lại nhanh
          </em>
        </span>
        <ChevronRight size={18} />
      </Link>
      <button type="button" aria-label={`Bỏ lưu ${title}`} onClick={onRemove}>
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
    min-height: 42px;
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
    margin-left: 5px;
    opacity: 0.75;
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
