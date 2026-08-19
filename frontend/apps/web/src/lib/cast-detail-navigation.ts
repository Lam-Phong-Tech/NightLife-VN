import {
  getPathLanguage,
  localizePathname,
  stripLanguagePrefix,
} from "@/lib/i18n/locales";

export type CastDetailSource =
  | "home"
  | "casts"
  | "ranking"
  | "search"
  | "store";

export const castDetailSources: readonly CastDetailSource[] = [
  "home",
  "casts",
  "ranking",
  "search",
  "store",
];

export const castDetailSourceParam = "from";
export const castDetailReturnToParam = "returnTo";

export function isCastDetailSource(value: string | null | undefined): value is CastDetailSource {
  return castDetailSources.includes(value as CastDetailSource);
}

export function parseCastDetailSource(value: string | null | undefined): CastDetailSource | null {
  return isCastDetailSource(value) ? value : null;
}

export function isCastDetailPath(pathname: string) {
  const normalizedPath = stripLanguagePrefix(pathname || "/").replace(/\/+$/, "") || "/";
  return /^\/casts\/[^/]+$/.test(normalizedPath);
}

export function isStoreDetailReturnPath(pathname: string) {
  const normalizedPath = stripLanguagePrefix(pathname || "/").replace(/\/+$/, "") || "/";
  return /^\/stores\/[^/]+$/.test(normalizedPath);
}

export function inferCastDetailSource(
  pathname: string,
  hasActiveSearch = false,
): CastDetailSource | null {
  const normalizedPath = stripLanguagePrefix(pathname || "/").replace(/\/+$/, "") || "/";

  if (normalizedPath === "/") return "home";
  if (normalizedPath === "/xep-hang") return "ranking";
  if (normalizedPath === "/search" || normalizedPath === "/tim-kiem") return "search";
  if (/^\/stores\/[^/]+$/.test(normalizedPath)) return "store";

  if (normalizedPath === "/casts" || normalizedPath === "/danh-sach-cast") {
    return hasActiveSearch ? "search" : "casts";
  }

  return null;
}

export function sanitizeCastStoreReturnHref(value: string | null | undefined) {
  if (!value || !value.startsWith("/") || value.startsWith("//")) return null;

  try {
    const url = new URL(value, "https://vietyoru.local");
    if (url.origin !== "https://vietyoru.local" || !isStoreDetailReturnPath(url.pathname)) {
      return null;
    }

    return `${url.pathname}${url.search}${url.hash}`;
  } catch {
    return null;
  }
}

export function getCastDetailBackHref(
  pathname: string,
  source: CastDetailSource | null | undefined,
  returnTo?: string | null,
) {
  if (source === "store") {
    const safeReturnHref = sanitizeCastStoreReturnHref(returnTo);
    if (safeReturnHref) return safeReturnHref;
  }

  const destination =
    source === "home"
      ? "/"
      : source === "ranking"
        ? "/xep-hang"
        : "/casts";
  const locale = getPathLanguage(pathname);

  return locale ? localizePathname(destination, locale) : destination;
}
