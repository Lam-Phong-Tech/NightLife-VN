"use client";

import { useEffect, useState } from "react";
import { languageChangedEvent, readStoredLanguage, type LanguageCode } from "./client-translations";

export type { LanguageCode };

export const intlLocaleByLanguage: Record<LanguageCode, string> = {
  vi: "vi-VN",
  en: "en-US",
  ja: "ja-JP",
  ko: "ko-KR",
  zh: "zh-CN",
};

export function useActiveLanguage() {
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

  return language;
}
