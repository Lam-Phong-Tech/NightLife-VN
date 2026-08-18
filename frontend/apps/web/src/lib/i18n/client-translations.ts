"use client";

import {
  defaultLanguageCode,
  getPathLanguage,
  googleTranslateLanguageCode,
  languageHtmlLang,
  type LanguageCode,
} from "./locales";

import {
  translateTextCore,
  normalizeText,
  getVietnameseSource,
  isLanguageCode,
} from "./translation-core";

export {
  defaultLanguageCode,
  languageHtmlLang,
  type LanguageCode,
} from "./locales";

export {
  normalizeText,
  getVietnameseSource,
  isLanguageCode,
} from "./translation-core";

export const languageStorageKey = "vietyoru.language";
export const languageCookieName = "vietyoru_language";
export const languageChangedEvent = "vietyoru:language-change";
const sharedLanguageCookieName = "vietyoru_shared_language";
const googleTranslateCookieName = "googtrans";

function readCookieLanguage(cookieName: string): LanguageCode | null {
  if (typeof document === "undefined") return null;

  const cookieLanguages = document.cookie
    .split(";")
    .map((item) => item.trim())
    .filter((item) => item.startsWith(`${cookieName}=`))
    .map((item) => item.slice(cookieName.length + 1))
    .flatMap((rawValue) => {
      try {
        const decodedValue = decodeURIComponent(rawValue);
        return isLanguageCode(decodedValue) ? [decodedValue] : [];
      } catch {
        return isLanguageCode(rawValue) ? [rawValue] : [];
      }
    });

  return cookieLanguages[cookieLanguages.length - 1] ?? null;
}

function readLanguageCookie(): LanguageCode | null {
  return readCookieLanguage(sharedLanguageCookieName) ?? readCookieLanguage(languageCookieName);
}

function getSharedLanguageCookieDomain(hostname: string) {
  const normalizedHostname = hostname.toLowerCase().replace(/^www\./, "");
  const sharedHostname = normalizedHostname.replace(/^(auth|admin|partner|api)\./, "");

  if (
    !sharedHostname ||
    sharedHostname === "localhost" ||
    sharedHostname.endsWith(".localhost") ||
    sharedHostname.includes(":") ||
    /^\d{1,3}(\.\d{1,3}){3}$/.test(sharedHostname)
  ) {
    return null;
  }

  return sharedHostname;
}

function isPortalLanguageHost(hostname: string) {
  const normalizedHostname = hostname.toLowerCase().replace(/^www\./, "");
  return /^(auth|admin|partner)\./.test(normalizedHostname);
}

function writeCookieLanguage(cookieName: string, language: LanguageCode) {
  if (typeof document === "undefined") return;

  const cookieValue = `${cookieName}=${encodeURIComponent(
    language,
  )}; path=/; max-age=31536000; SameSite=Lax`;
  document.cookie = cookieValue;

  if (typeof window === "undefined") return;

  const sharedDomain = getSharedLanguageCookieDomain(window.location.hostname);
  if (sharedDomain) {
    document.cookie = `${cookieValue}; domain=.${sharedDomain}`;
  }
}

function writeLanguageCookie(language: LanguageCode) {
  writeCookieLanguage(languageCookieName, language);
  writeCookieLanguage(sharedLanguageCookieName, language);
}

function readLocalStorageLanguage(): LanguageCode | null {
  try {
    const storedLanguage = window.localStorage.getItem(languageStorageKey);
    return isLanguageCode(storedLanguage) ? storedLanguage : null;
  } catch {
    return null;
  }
}

function writeLocalStorageLanguage(language: LanguageCode) {
  try {
    window.localStorage.setItem(languageStorageKey, language);
  } catch {
    // Language selection should still work when storage is unavailable.
  }
}

function readUrlLanguage(): LanguageCode | null {
  if (typeof window === "undefined") return null;

  try {
    const pathLanguage = getPathLanguage(window.location.pathname);
    if (pathLanguage) return pathLanguage;

    const urlLanguage = new URLSearchParams(window.location.search).get("lang");
    return isLanguageCode(urlLanguage) ? urlLanguage : null;
  } catch {
    return null;
  }
}

export function readStoredLanguage(): LanguageCode {
  if (typeof window === "undefined") return defaultLanguageCode;

  const urlLanguage = readUrlLanguage();
  const cookieLanguage = readLanguageCookie();
  const localStorageLanguage = readLocalStorageLanguage();

  if (urlLanguage && !isPortalLanguageHost(window.location.hostname)) {
    writeLocalStorageLanguage(urlLanguage);
    writeLanguageCookie(urlLanguage);
    return urlLanguage;
  }

  if (isPortalLanguageHost(window.location.hostname) && cookieLanguage) {
    writeLocalStorageLanguage(cookieLanguage);
    writeLanguageCookie(cookieLanguage);
    return cookieLanguage;
  }

  if (localStorageLanguage) {
    writeLanguageCookie(localStorageLanguage);
    return localStorageLanguage;
  }

  if (cookieLanguage) {
    writeLocalStorageLanguage(cookieLanguage);
    return cookieLanguage;
  }

  return defaultLanguageCode;
}

export function storeLanguagePreference(language: LanguageCode) {
  writeLocalStorageLanguage(language);
  writeLanguageCookie(language);
  document.documentElement.lang = languageHtmlLang[language];
}

function writeGoogleTranslateCookieValue(value: string, maxAge: number) {
  if (typeof document === "undefined") return;

  // Google Translate Web Element reads this legacy cookie in its raw
  // `/source/target` form.
  const cookieValue = `${googleTranslateCookieName}=${value}; path=/; max-age=${maxAge}; SameSite=Lax`;
  document.cookie = cookieValue;

  if (typeof window === "undefined") return;
  const sharedDomain = getSharedLanguageCookieDomain(window.location.hostname);
  if (sharedDomain) {
    document.cookie = `${cookieValue}; domain=.${sharedDomain}`;
  }
}

export function syncGoogleTranslateCookie(language: LanguageCode) {
  if (language === "vi") {
    writeGoogleTranslateCookieValue("", 0);
    return;
  }

  writeGoogleTranslateCookieValue(
    `/vi/${googleTranslateLanguageCode[language]}`,
    31536000,
  );
}

const DYNAMIC_CACHE_PREFIX = "vietyoru.translation_cache.v4.";
const dynamicMemoryCache = new Map<string, Partial<Record<LanguageCode, string>>>();
let isDynamicCacheHydrated = false;

function hydrateDynamicCache() {
  if (isDynamicCacheHydrated || typeof window === "undefined") return;
  isDynamicCacheHydrated = true;

  try {
    const supportedLangs: LanguageCode[] = ["en", "ja", "ko", "zh"];
    for (const lang of supportedLangs) {
      const raw = window.localStorage.getItem(`${DYNAMIC_CACHE_PREFIX}${lang}`);
      if (!raw) continue;
      const parsed = JSON.parse(raw) as Record<string, string>;
      for (const [sourceKey, translatedVal] of Object.entries(parsed)) {
        if (!translatedVal || translatedVal === sourceKey) continue;
        let entry = dynamicMemoryCache.get(sourceKey);
        if (!entry) {
          entry = {};
          dynamicMemoryCache.set(sourceKey, entry);
        }
        entry[lang] = translatedVal;
      }
    }
  } catch {
    // Private mode or quota / access restriction
  }
}

let pendingSaveTimer: number | null = null;
const pendingSaveLanguages = new Set<LanguageCode>();

function schedulePersistDynamicCache(language: LanguageCode) {
  if (typeof window === "undefined") return;
  pendingSaveLanguages.add(language);

  if (pendingSaveTimer !== null) return;

  pendingSaveTimer = window.setTimeout(() => {
    pendingSaveTimer = null;
    try {
      for (const lang of pendingSaveLanguages) {
        const langData: Record<string, string> = {};
        for (const [sourceKey, map] of dynamicMemoryCache.entries()) {
          if (map[lang]) {
            langData[sourceKey] = map[lang]!;
          }
        }
        window.localStorage.setItem(
          `${DYNAMIC_CACHE_PREFIX}${lang}`,
          JSON.stringify(langData),
        );
      }
      pendingSaveLanguages.clear();
    } catch {
      // Storage quota exceeded or disabled
    }
  }, 1000);
}

export function translateText(value: string, language: LanguageCode): string {
  if (language === "vi") {
    if (value.includes(" · ") || value.includes(" — ") || value.includes(", ")) {
      const parts = value.split(/(\s*[\cdot,·|—]\s*)/);
      return parts.map((part) => getVietnameseSource(part)).join("");
    }
    return getVietnameseSource(value);
  }

  const source = getVietnameseSource(value);
  const normalized = normalizeText(source);
  if (!normalized) return source;

  // Check dynamic cache first (browser-only fast path)
  hydrateDynamicCache();
  const cachedMatch = dynamicMemoryCache.get(normalized)?.[language];
  if (cachedMatch) return cachedMatch;

  // Delegate to server-safe core (static map + pattern matching)
  const result = translateTextCore(value, language);

  // Cache newly translated strings to localStorage
  if (result !== source) {
    let entry = dynamicMemoryCache.get(normalized);
    if (!entry) {
      entry = {};
      dynamicMemoryCache.set(normalized, entry);
    }
    entry[language] = result;
    schedulePersistDynamicCache(language);
  }

  return result;
}

export function translateWithWhitespace(value: string, language: LanguageCode) {
  const leading = value.match(/^\s*/)?.[0] ?? "";
  const trailing = value.match(/\s*$/)?.[0] ?? "";
  const translated = translateText(value, language);
  return `${leading}${translated}${trailing}`;
}

export function translateDocumentTitle(language: LanguageCode) {
  if (typeof document === "undefined") return;

  const hostname = window.location.hostname.toLowerCase();
  const pathname = window.location.pathname;

  // Only translate user-facing document titles (skip internal admin console & partner dashboard titles)
  if (
    hostname.startsWith("admin.") ||
    pathname.startsWith("/admin")
  ) {
    return;
  }

  // Do not auto-translate dynamic entity titles on detail pages (Cast, Store, Tour, Blog detail)
  if (/^\/(?:[a-z]{2}\/)?(?:casts|stores|tour|blog)\/[^/]+$/i.test(pathname)) {
    return;
  }

  const titleElement = document.querySelector("title");
  if (!titleElement) return;

  titleElement.setAttribute("translate", "no");
  titleElement.setAttribute("data-no-translate", "true");
  titleElement.classList.add("notranslate");

  const rawTitle = titleElement.textContent || document.title || "";
  if (!rawTitle.trim()) return;

  let sourceTitle = titleElement.getAttribute("data-vietyoru-source-title");
  if (!sourceTitle) {
    sourceTitle = rawTitle;
    titleElement.setAttribute("data-vietyoru-source-title", sourceTitle);
  }

  if (language === "vi" && rawTitle !== sourceTitle && rawTitle.includes(" | ")) {
    sourceTitle = rawTitle;
    titleElement.setAttribute("data-vietyoru-source-title", sourceTitle);
  }

  if (sourceTitle.includes(" | ")) {
    const parts = sourceTitle.split(" | ");
    const mainTitle = parts[0];
    const suffix = parts.slice(1).join(" | ");
    const translatedMain = translateText(mainTitle, language);
    const translatedSuffix = translateText(suffix, language);
    const newTitle = `${translatedMain} | ${translatedSuffix}`;
    if (document.title !== newTitle) {
      document.title = newTitle;
    }
  } else {
    const translatedTitle = translateText(sourceTitle, language);
    if (document.title !== translatedTitle) {
      document.title = translatedTitle;
    }
  }
}
