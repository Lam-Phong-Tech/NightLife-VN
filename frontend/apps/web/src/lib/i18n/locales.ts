export const languageCodes = ["vi", "en", "ja", "ko", "zh"] as const;

export type LanguageCode = (typeof languageCodes)[number];

export const defaultLanguageCode: LanguageCode = "ja";

export const languageHtmlLang: Record<LanguageCode, string> = {
  vi: "vi",
  en: "en",
  ja: "ja",
  ko: "ko",
  zh: "zh-CN",
};

export const languageOpenGraphLocale: Record<LanguageCode, string> = {
  vi: "vi_VN",
  en: "en_US",
  ja: "ja_JP",
  ko: "ko_KR",
  zh: "zh_CN",
};

export const googleTranslateLanguageCode: Record<LanguageCode, string> = {
  vi: "vi",
  en: "en",
  ja: "ja",
  ko: "ko",
  zh: "zh-CN",
};

export const localizedPublicRootPaths = new Set([
  "/",
  "/stores",
  "/spa",
  "/nha-hang",
  "/casts",
  "/xep-hang",
  "/uu-dai",
  "/tour",
  "/blog",
]);

export function isLocalizedPublicRoute(pathname: string) {
  return (
    localizedPublicRootPaths.has(pathname) ||
    /^\/(?:stores|casts)\/[^/]+$/.test(pathname)
  );
}

const excludedLocalizedPrefixes = [
  "/admin",
  "/partner",
  "/api",
  "/_next",
  "/site-favicon",
  "/sitemap.xml",
  "/robots.txt",
];

export function isLanguageCode(value: string | null | undefined): value is LanguageCode {
  return languageCodes.includes(value as LanguageCode);
}

export function getPathLanguage(pathname: string): LanguageCode | null {
  const firstSegment = pathname.split("/").filter(Boolean)[0]?.toLowerCase();
  return isLanguageCode(firstSegment) ? firstSegment : null;
}

export function stripLanguagePrefix(pathname: string) {
  const locale = getPathLanguage(pathname);
  if (!locale) return pathname || "/";

  const stripped = pathname.replace(new RegExp(`^/${locale}(?=/|$)`), "");
  return stripped || "/";
}

export function isLocaleEligiblePath(pathname: string) {
  const unprefixedPath = stripLanguagePrefix(pathname);
  return !excludedLocalizedPrefixes.some(
    (prefix) => unprefixedPath === prefix || unprefixedPath.startsWith(`${prefix}/`),
  );
}

export function localizePathname(pathname: string, language: LanguageCode) {
  const unprefixedPath = stripLanguagePrefix(pathname || "/");
  if (!isLocaleEligiblePath(unprefixedPath)) return unprefixedPath;
  return unprefixedPath === "/" ? `/${language}` : `/${language}${unprefixedPath}`;
}

export function localizeHref(href: string, language: LanguageCode) {
  if (
    !href ||
    href.startsWith("#") ||
    href.startsWith("mailto:") ||
    href.startsWith("tel:") ||
    href.startsWith("http://") ||
    href.startsWith("https://") ||
    href.startsWith("//")
  ) {
    return href;
  }

  const hashIndex = href.indexOf("#");
  const hash = hashIndex >= 0 ? href.slice(hashIndex) : "";
  const withoutHash = hashIndex >= 0 ? href.slice(0, hashIndex) : href;
  const queryIndex = withoutHash.indexOf("?");
  const query = queryIndex >= 0 ? withoutHash.slice(queryIndex) : "";
  const pathname = queryIndex >= 0 ? withoutHash.slice(0, queryIndex) : withoutHash;

  if (!pathname.startsWith("/")) return href;
  return `${localizePathname(pathname, language)}${query}${hash}`;
}

export function languageAlternates(path: string) {
  const normalizedPath = path === "/" ? "" : path.startsWith("/") ? path : `/${path}`;

  return Object.fromEntries(
    languageCodes.map((language) => [
      languageHtmlLang[language],
      `/${language}${normalizedPath}`,
    ]),
  );
}
