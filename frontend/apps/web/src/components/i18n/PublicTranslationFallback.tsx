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
import {
  hasNativeRouteLocale,
  isPublicHomepagePath,
  shouldSkipLanguageTranslation,
} from "./ClientLanguageTranslator";

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

function lockTitleFromTranslation() {
  const titleElement = document.querySelector("title");
  if (titleElement) {
    titleElement.setAttribute("translate", "no");
    titleElement.setAttribute("data-no-translate", "true");
    titleElement.classList.add("notranslate");
  }
}

function rewriteLocalizedLinks(language: LanguageCode) {
  lockTitleFromTranslation();
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
    if (hasNativeRouteLocale(pathname)) return undefined;
    if (isPublicHomepagePath(pathname)) return undefined;

    const resetBodyStyles = () => {
      if (document.body.style.top && document.body.style.top !== "0px") {
        document.body.style.top = "0px";
      }
      if (document.body.style.marginTop && document.body.style.marginTop !== "0px") {
        document.body.style.marginTop = "0px";
      }
    };

    let linkObserver: MutationObserver | null = null;
    let idleHandle: number | null = null;
    let fallbackTimer: number | null = null;
    let started = false;
    const googleWindow = window as GoogleTranslateWindow;
    const start = () => {
      if (started) return;
      started = true;
      syncGoogleTranslateCookie(activeLanguage);
      rewriteLocalizedLinks(activeLanguage);
      resetBodyStyles();

      const translationRoot =
        document.querySelector<HTMLElement>("[data-vietyoru-translator='true']") ??
        document.body;
      linkObserver = new MutationObserver(() => {
        rewriteLocalizedLinks(activeLanguage);
        resetBodyStyles();
      });
      linkObserver.observe(translationRoot, { childList: true, subtree: true });

      if (activeLanguage === "vi") {
        delete document.documentElement.dataset.googleTranslateFallback;
        return;
      }

      googleWindow[googleTranslateCallbackName] = () => {
        initializeGoogleTranslate(activeLanguage);
        resetBodyStyles();
      };
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
    };
    const scheduleStart = () => {
      const win = window as Window & {
        requestIdleCallback?: (callback: () => void, options?: { timeout?: number }) => number;
      };
      if (typeof win.requestIdleCallback === "function") {
        idleHandle = win.requestIdleCallback(start, { timeout: 2500 });
      } else {
        fallbackTimer = window.setTimeout(start, 1200);
      }
    };
    if (document.readyState === "complete") scheduleStart();
    else window.addEventListener("load", scheduleStart, { once: true });

    return () => {
      window.removeEventListener("load", scheduleStart);
      if (fallbackTimer !== null) window.clearTimeout(fallbackTimer);
      if (idleHandle !== null) {
        const win = window as Window & { cancelIdleCallback?: (handle: number) => void };
        win.cancelIdleCallback?.(idleHandle);
      }
      linkObserver?.disconnect();
    };
  }, [activeLanguage, hostKind, pathname]);

  if (
    hostKind === "admin" ||
    hostKind === "partner" ||
    pathname.startsWith("/admin") ||
    pathname.startsWith("/partner") ||
    hasNativeRouteLocale(pathname) ||
    isPublicHomepagePath(pathname)
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
