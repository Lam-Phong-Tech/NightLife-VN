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

    window.addEventListener(languageChangedEvent, syncLanguage);
    return () => window.removeEventListener(languageChangedEvent, syncLanguage);
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
