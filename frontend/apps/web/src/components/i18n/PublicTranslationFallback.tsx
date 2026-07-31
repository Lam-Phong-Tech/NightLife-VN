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

    const cleanupBanners = () => {
      // Remove any injected Google Translate banner iframes or elements from DOM
      document
        .querySelectorAll(
          ".goog-te-banner-frame, iframe[class*='goog-te-banner'], iframe[id*=':'], #goog-gt-tt, .goog-te-balloon-frame",
        )
        .forEach((el) => el.remove());
      if (document.body.style.top) {
        document.body.style.top = "0px";
      }
    };

    cleanupBanners();
    const linkObserver = new MutationObserver(() => {
      rewriteLocalizedLinks(activeLanguage);
      cleanupBanners();
    });
    linkObserver.observe(document.body, { childList: true, subtree: true });

    return () => {
      linkObserver.disconnect();
    };
  }, [activeLanguage, hostKind, pathname]);

  return null;
}
