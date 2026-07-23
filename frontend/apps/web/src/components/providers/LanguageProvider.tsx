"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { translations, type Language } from "@/lib/i18n/translations";

const STORAGE_KEY = "vietyoru.language";
const COOKIE_NAME = "vietyoru_language";

export function readStoredLanguage(): Language {
  if (typeof window === "undefined") return "vi";

  try {
    const cookieMatch = document.cookie
      .split("; ")
      .find((row) => row.startsWith(`${COOKIE_NAME}=`))
      ?.split("=")[1];

    if (cookieMatch && isSupportedLanguage(cookieMatch)) {
      return cookieMatch as Language;
    }

    const localMatch = localStorage.getItem(STORAGE_KEY);
    if (localMatch && isSupportedLanguage(localMatch)) {
      return localMatch as Language;
    }
  } catch {
    // Ignore storage access errors
  }

  return "vi";
}

function isSupportedLanguage(lang: string): boolean {
  return ["vi", "en", "ja", "ko", "zh"].includes(lang);
}

function writeStoredLanguage(lang: Language) {
  if (typeof window === "undefined") return;

  try {
    localStorage.setItem(STORAGE_KEY, lang);
    document.cookie = `${COOKIE_NAME}=${lang}; path=/; max-age=31536000; SameSite=Lax`;
  } catch {
    // Ignore storage write errors
  }
}

type LanguageContextType = {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
};

const LanguageContext = createContext<LanguageContextType>({
  language: "vi",
  setLanguage: () => {},
  t: (key) => key,
});

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => readStoredLanguage());

  const setLanguage = (nextLang: Language) => {
    setLanguageState(nextLang);
    writeStoredLanguage(nextLang);
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("vietyoru-language-change", { detail: nextLang }));
    }
  };

  useEffect(() => {
    const handleStorage = (event: StorageEvent) => {
      if (event.key === STORAGE_KEY && event.newValue && isSupportedLanguage(event.newValue)) {
        setLanguageState(event.newValue as Language);
      }
    };

    const handleCustomEvent = (event: Event) => {
      const customEvent = event as CustomEvent<Language>;
      if (customEvent.detail && isSupportedLanguage(customEvent.detail)) {
        setLanguageState(customEvent.detail);
      }
    };

    window.addEventListener("storage", handleStorage);
    window.addEventListener("vietyoru-language-change", handleCustomEvent);

    return () => {
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener("vietyoru-language-change", handleCustomEvent);
    };
  }, []);

  const t = (key: string, params?: Record<string, string | number>): string => {
    const langDict = translations[language] ?? translations.vi;
    let text = langDict[key] ?? translations.vi[key] ?? key;

    if (params) {
      Object.entries(params).forEach(([pKey, pVal]) => {
        text = text.replace(new RegExp(`\\{${pKey}\\}`, "g"), String(pVal));
      });
    }

    return text;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
