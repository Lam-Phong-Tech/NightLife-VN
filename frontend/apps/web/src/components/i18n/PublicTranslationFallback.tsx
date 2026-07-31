"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import type { NightlifeHostKind } from "@/lib/auth/hosts";
import {
  syncGoogleTranslateCookie,
  type LanguageCode,
} from "@/lib/i18n/client-translations";
import {
  googleTranslateLanguageCode,
  localizeHref,
} from "@/lib/i18n/locales";
import { useActiveLanguage } from "@/lib/i18n/use-active-language";
import { shouldSkipLanguageTranslation } from "./ClientLanguageTranslator";

const googleTranslateElementId = "google_translate_element";
const googleTranslateScriptId = "vietyoru-google-translate-sdk";
const googleTranslateCallbackName = "vietyoruGoogleTranslateElementInit";

type GoogleTranslateWindow = Window & {
  google?: {
    translate?: {
      TranslateElement?: new (
        options: {
          autoDisplay: boolean;
          includedLanguages: string;
          pageLanguage: string;
        },
        elementId: string,
      ) => unknown;
    };
  };
  [googleTranslateCallbackName]?: () => void;
};

function initializeGoogleTranslate(language: LanguageCode) {
  const googleWindow = window as GoogleTranslateWindow;
  const TranslateElement = googleWindow.google?.translate?.TranslateElement;
  const container = document.getElementById(googleTranslateElementId);
  if (!TranslateElement || !container || container.dataset.initialized === "true") return;

  new TranslateElement(
    {
      pageLanguage: "vi",
      includedLanguages: Object.values(googleTranslateLanguageCode).join(","),
      autoDisplay: false,
    },
    googleTranslateElementId,
  );
  container.dataset.initialized = "true";
  document.documentElement.dataset.googleTranslateFallback =
    googleTranslateLanguageCode[language];
}

function rewriteLocalizedLinks(language: LanguageCode) {
  document.querySelectorAll<HTMLAnchorElement>("a[href]").forEach((anchor) => {
    const rawHref = anchor.getAttribute("href");
    if (!rawHref) return;

    const localizedHref = localizeHref(rawHref, language);
    if (localizedHref !== rawHref) {
      anchor.setAttribute("href", localizedHref);
    }
  });
}

export function PublicTranslationFallback({
  hostKind,
}: {
  hostKind: NightlifeHostKind;
}) {
  const pathname = usePathname() || "/";
  const activeLanguage = useActiveLanguage();

  useEffect(() => {
    if (shouldSkipLanguageTranslation(pathname, hostKind, window.location.hostname)) {
      return undefined;
    }

    syncGoogleTranslateCookie(activeLanguage);
    rewriteLocalizedLinks(activeLanguage);

    const linkObserver = new MutationObserver(() => rewriteLocalizedLinks(activeLanguage));
    linkObserver.observe(document.body, { childList: true, subtree: true });

    if (activeLanguage === "vi") {
      delete document.documentElement.dataset.googleTranslateFallback;
      return () => linkObserver.disconnect();
    }

    const googleWindow = window as GoogleTranslateWindow;
    googleWindow[googleTranslateCallbackName] = () =>
      initializeGoogleTranslate(activeLanguage);

    const loadTimer = window.setTimeout(() => {
      if (googleWindow.google?.translate?.TranslateElement) {
        initializeGoogleTranslate(activeLanguage);
        return;
      }

      if (document.getElementById(googleTranslateScriptId)) return;

      const script = document.createElement("script");
      script.id = googleTranslateScriptId;
      script.src = `https://translate.google.com/translate_a/element.js?cb=${googleTranslateCallbackName}`;
      script.async = true;
      script.onerror = () => {
        document.documentElement.dataset.googleTranslateFallback = "unavailable";
      };
      document.head.appendChild(script);
    }, 240);

    return () => {
      window.clearTimeout(loadTimer);
      linkObserver.disconnect();
    };
  }, [activeLanguage, hostKind, pathname]);

  if (
    hostKind === "admin" ||
    hostKind === "partner" ||
    pathname.startsWith("/admin") ||
    pathname.startsWith("/partner")
  ) {
    return null;
  }

  return (
    <div
      id={googleTranslateElementId}
      aria-hidden="true"
      className="vietyoru-google-translate-element"
      data-no-translate="true"
    />
  );
}
