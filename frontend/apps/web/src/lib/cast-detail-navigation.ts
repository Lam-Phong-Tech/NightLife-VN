import {
  getPathLanguage,
  localizePathname,
  stripLanguagePrefix,
} from "@/lib/i18n/locales";

export type CastDetailSource =
  | "home"
  | "casts"
  | "ranking"
  | "search";

export const castDetailSources: readonly CastDetailSource[] = [
  "home",
  "casts",
  "ranking",
  "search",
];

export const castDetailSourceParam = "from";

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

export function inferCastDetailSource(
  pathname: string,
  hasActiveSearch = false,
): CastDetailSource | null {
  const normalizedPath = stripLanguagePrefix(pathname || "/").replace(/\/+$/, "") || "/";

  if (normalizedPath === "/") return "home";
  if (normalizedPath === "/xep-hang") return "ranking";
  if (normalizedPath === "/search" || normalizedPath === "/tim-kiem") return "search";

  if (normalizedPath === "/casts" || normalizedPath === "/danh-sach-cast") {
    return hasActiveSearch ? "search" : "casts";
  }

  return null;
}

export function getCastDetailBackHref(
  pathname: string,
  source: CastDetailSource | null | undefined,
) {
  const destination =
    source === "home"
      ? "/"
      : source === "ranking"
        ? "/xep-hang"
        : "/casts";
  const locale = getPathLanguage(pathname);

  return locale ? localizePathname(destination, locale) : destination;
}
