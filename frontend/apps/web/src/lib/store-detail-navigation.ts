import {
  getPathLanguage,
  localizePathname,
  stripLanguagePrefix,
} from "@/lib/i18n/locales";

export type StoreDetailSource =
  | "home"
  | "stores"
  | "ranking"
  | "search"
  | "spa"
  | "restaurant";

export const storeDetailSources: readonly StoreDetailSource[] = [
  "home",
  "stores",
  "ranking",
  "search",
  "spa",
  "restaurant",
];

export const storeDetailSourceParam = "from";

export function isStoreDetailSource(value: string | null | undefined): value is StoreDetailSource {
  return storeDetailSources.includes(value as StoreDetailSource);
}

export function parseStoreDetailSource(value: string | null | undefined): StoreDetailSource | null {
  return isStoreDetailSource(value) ? value : null;
}

export function isStoreDetailPath(pathname: string) {
  const normalizedPath = stripLanguagePrefix(pathname || "/").replace(/\/+$/, "") || "/";
  return /^\/stores\/[^/]+$/.test(normalizedPath);
}

export function inferStoreDetailSource(
  pathname: string,
  hasActiveSearch = false,
): StoreDetailSource | null {
  const normalizedPath = stripLanguagePrefix(pathname || "/").replace(/\/+$/, "") || "/";

  if (normalizedPath === "/") return "home";
  if (normalizedPath === "/xep-hang") return "ranking";
  if (normalizedPath === "/search" || normalizedPath === "/tim-kiem") return "search";
  if (normalizedPath === "/spa") return "spa";
  if (normalizedPath === "/nha-hang") return "restaurant";

  if (normalizedPath === "/stores" || normalizedPath === "/danh-sach-quan") {
    return hasActiveSearch ? "search" : "stores";
  }

  return null;
}

export function getStoreDetailBackHref(
  pathname: string,
  source: StoreDetailSource | null | undefined,
) {
  const destination =
    source === "home"
      ? "/"
      : source === "ranking"
        ? "/xep-hang"
        : source === "spa"
          ? "/spa"
          : source === "restaurant"
            ? "/nha-hang"
            : "/stores";
  const locale = getPathLanguage(pathname);

  return locale ? localizePathname(destination, locale) : destination;
}
