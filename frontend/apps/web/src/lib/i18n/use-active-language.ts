"use client";

import {
  createContext,
  createElement,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import {
  languageChangedEvent,
  readStoredLanguage,
  storeLanguagePreference,
  type LanguageCode,
} from "./client-translations";
import {
  isLocalizedPublicRoute,
  localizeHref,
  stripLanguagePrefix,
} from "./locales";

export type { LanguageCode };

export const intlLocaleByLanguage: Record<LanguageCode, string> = {
  vi: "vi-VN",
  en: "en-US",
  ja: "ja-JP",
  ko: "ko-KR",
  zh: "zh-CN",
};

const RoutedLanguageContext = createContext<LanguageCode | null>(null);

export function RoutedLanguageProvider({
  children,
  initialLanguage,
}: {
  children: ReactNode;
  initialLanguage: LanguageCode;
}) {
  const [language, setLanguage] = useState<LanguageCode>(initialLanguage);

  useEffect(() => {
    storeLanguagePreference(initialLanguage);
    setLanguage(initialLanguage);

    const syncLanguage = (event: Event) => {
      const nextLanguage = (event as CustomEvent<{ language?: LanguageCode }>).detail?.language;
      if (nextLanguage) setLanguage(nextLanguage);
    };

    // Keep internal public navigation on the locale that is actually active in
    // the URL. Some legacy cards still emit unprefixed links such as
    // `/stores/foo`; without this guard middleware can fall back to a stale
    // language preference and send a Vietnamese page to `/ja/stores/foo`.
    const keepLocalizedPublicLink = (event: MouseEvent) => {
      if (
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      ) {
        return;
      }

      const eventTarget = event.target;
      if (!(eventTarget instanceof Element)) return;

      const anchor = eventTarget.closest("a[href]");
      if (!(anchor instanceof HTMLAnchorElement)) return;
      if (anchor.target && anchor.target !== "_self") return;
      if (anchor.hasAttribute("download")) return;

      const rawHref = anchor.getAttribute("href");
      if (!rawHref || !rawHref.startsWith("/") || rawHref.startsWith("//")) return;

      const pathname = rawHref.split(/[?#]/, 1)[0] || "/";
      if (!isLocalizedPublicRoute(stripLanguagePrefix(pathname))) return;

      const localizedHref = localizeHref(rawHref, initialLanguage);
      if (localizedHref === rawHref) return;

      event.preventDefault();
      window.location.assign(localizedHref);
    };

    window.addEventListener(languageChangedEvent, syncLanguage);
    document.addEventListener("click", keepLocalizedPublicLink, true);
    return () => {
      window.removeEventListener(languageChangedEvent, syncLanguage);
      document.removeEventListener("click", keepLocalizedPublicLink, true);
    };
  }, [initialLanguage]);

  return createElement(
    RoutedLanguageContext.Provider,
    { value: language },
    children,
  );
}

export function useActiveLanguage() {
  const routedLanguage = useContext(RoutedLanguageContext);
  const [language, setLanguage] = useState<LanguageCode>(() => readStoredLanguage());

  useEffect(() => {
    const syncLanguage = (event?: Event) => {
      const nextLanguage = (event as CustomEvent<{ language?: LanguageCode }> | undefined)?.detail
        ?.language;
      setLanguage(nextLanguage ?? readStoredLanguage());
    };

    syncLanguage();
    window.addEventListener(languageChangedEvent, syncLanguage);
    return () => window.removeEventListener(languageChangedEvent, syncLanguage);
  }, []);

  return routedLanguage ?? language;
}
