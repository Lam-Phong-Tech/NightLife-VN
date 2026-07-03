"use client";

export type SavedFavoriteStore = {
  slug: string;
  name: string;
  categoryLabel?: string;
  areaLabel?: string;
  cityLabel?: string;
  image?: string;
  favoritedAt?: string;
};

export type SavedFavoriteCast = {
  slug: string;
  name: string;
  storeName?: string;
  categoryLabel?: string;
  areaLabel?: string;
  image?: string;
  favoritedAt?: string;
};

const storeSlugsKey = "nightlife_member_favorite_stores";
const castSlugsKey = "nightlife_member_favorite_casts";
const storeItemsKey = "nightlife_member_favorite_store_items";
const castItemsKey = "nightlife_member_favorite_cast_items";

const canUseStorage = () => typeof window !== "undefined" && Boolean(window.localStorage);

function readJson<T>(key: string, fallback: T): T {
  if (!canUseStorage()) return fallback;

  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    window.localStorage.removeItem(key);
    return fallback;
  }
}

function writeJson<T>(key: string, value: T) {
  if (!canUseStorage()) return;

  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    window.localStorage.removeItem(key);
  }
}

const uniqueRecent = (items: string[]) => Array.from(new Set(items.filter(Boolean))).slice(0, 100);

function readSlugList(key: string) {
  return uniqueRecent(readJson<string[]>(key, []));
}

function writeSlugList(key: string, slugs: string[]) {
  writeJson(key, uniqueRecent(slugs));
}

function readItemList<T extends { slug: string }>(key: string) {
  return readJson<T[]>(key, []).filter((item) => Boolean(item.slug)).slice(0, 100);
}

function writeItemList<T extends { slug: string }>(key: string, items: T[]) {
  const deduped = new Map<string, T>();
  items.forEach((item) => {
    if (item.slug) deduped.set(item.slug, item);
  });
  writeJson(key, Array.from(deduped.values()).slice(0, 100));
}

function upsertItem<T extends { slug: string; favoritedAt?: string }>(
  items: T[],
  nextItem: T,
  favorited: boolean,
) {
  if (!favorited) return items.filter((item) => item.slug !== nextItem.slug);

  return [
    {
      ...nextItem,
      favoritedAt: nextItem.favoritedAt ?? new Date().toISOString(),
    },
    ...items.filter((item) => item.slug !== nextItem.slug),
  ].slice(0, 100);
}

export function readFavoriteStoreSlugs() {
  const explicitSlugs = readSlugList(storeSlugsKey);
  const itemSlugs = readItemList<SavedFavoriteStore>(storeItemsKey).map((item) => item.slug);
  return uniqueRecent([...explicitSlugs, ...itemSlugs]);
}

export function readFavoriteCastSlugs() {
  const explicitSlugs = readSlugList(castSlugsKey);
  const itemSlugs = readItemList<SavedFavoriteCast>(castItemsKey).map((item) => item.slug);
  return uniqueRecent([...explicitSlugs, ...itemSlugs]);
}

export function readFavoriteStoreItems() {
  return readItemList<SavedFavoriteStore>(storeItemsKey);
}

export function readFavoriteCastItems() {
  return readItemList<SavedFavoriteCast>(castItemsKey);
}

export function isFavoriteStore(slug: string) {
  return readFavoriteStoreSlugs().includes(slug);
}

export function isFavoriteCast(slug: string) {
  return readFavoriteCastSlugs().includes(slug);
}

export function writeFavoriteStore(item: SavedFavoriteStore, favorited: boolean) {
  const slugs = readFavoriteStoreSlugs();
  writeSlugList(
    storeSlugsKey,
    favorited ? [item.slug, ...slugs.filter((slug) => slug !== item.slug)] : slugs.filter((slug) => slug !== item.slug),
  );
  writeItemList(storeItemsKey, upsertItem(readFavoriteStoreItems(), item, favorited));
}

export function writeFavoriteCast(item: SavedFavoriteCast, favorited: boolean) {
  const slugs = readFavoriteCastSlugs();
  writeSlugList(
    castSlugsKey,
    favorited ? [item.slug, ...slugs.filter((slug) => slug !== item.slug)] : slugs.filter((slug) => slug !== item.slug),
  );
  writeItemList(castItemsKey, upsertItem(readFavoriteCastItems(), item, favorited));
}
