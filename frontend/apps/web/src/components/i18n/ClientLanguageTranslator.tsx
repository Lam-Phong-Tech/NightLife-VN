"use client";

import { usePathname } from "next/navigation";
import React, { useLayoutEffect } from "react";
import {
  getVietnameseSource,
  languageChangedEvent,
  languageHtmlLang,
  readStoredLanguage,
  translateText,
  translateWithWhitespace,
  type LanguageCode,
} from "@/lib/i18n/client-translations";
import type { NightlifeHostKind } from "@/lib/auth/hosts";
import { syncUserThemeFromStorage } from "@/lib/theme/user-theme";

const textSourceMap = new WeakMap<Text, string>();
const translatedAttributes = ["placeholder", "aria-label", "title", "alt"] as const;
const valueSourceKey = "data-vietyoru-i18n-value";
const manualTranslationMarker = "data-vietyoru-i18n-translated";
const skippedElementSelector =
  "script, style, noscript, code, pre, textarea, svg, [data-no-translate='true'], [translate='no'], .notranslate";

function looksLikeSelectedLanguage(value: string, language: LanguageCode) {
  if (language === "ja") return /[\u3040-\u30ff\u3400-\u9fff]/u.test(value);
  if (language === "ko") return /[\uac00-\ud7af]/u.test(value);
  if (language === "zh") return /[\u3400-\u9fff]/u.test(value);
  return false;
}

function protectManualTranslation(element: HTMLElement, protectedByI18n: boolean) {
  if (protectedByI18n) {
    element.setAttribute(manualTranslationMarker, "true");
    element.classList.add("notranslate");
    element.setAttribute("translate", "no");
    return;
  }

  if (element.getAttribute(manualTranslationMarker) !== "true") return;
  element.removeAttribute(manualTranslationMarker);
  element.classList.remove("notranslate");
  element.removeAttribute("translate");
}

function shouldSkipTextNode(node: Text) {
  const parent = node.parentElement;
  if (!parent) return true;
  return Boolean(parent.closest(skippedElementSelector));
}

function translateTextNode(node: Text, language: LanguageCode) {
  if (shouldSkipTextNode(node)) return;

  const parent = node.parentElement;
  if (!parent) return;
  const rawValue = node.nodeValue ?? "";
  if (!rawValue.trim()) return;

  const storedSource = textSourceMap.get(node);
  let source = storedSource ?? rawValue;

  if (storedSource) {
    const translatedStoredSource = translateWithWhitespace(storedSource, language);
    if (rawValue !== storedSource && rawValue !== translatedStoredSource) {
      source = getVietnameseSource(rawValue);
    }
  }

  const translated = translateWithWhitespace(source, language);
  const protectedByI18n =
    language !== "vi" &&
    (normalizeForComparison(translated) !== normalizeForComparison(source) ||
      looksLikeSelectedLanguage(rawValue, language));

  protectManualTranslation(parent, protectedByI18n);

  if (translated !== source || textSourceMap.has(node)) {
    textSourceMap.set(node, getVietnameseSource(source));
    if (node.nodeValue !== translated) {
      node.nodeValue = translated;
    }
  }
}

function translateElementAttributes(element: HTMLElement, language: LanguageCode) {
  if (element.closest("[data-no-translate='true'], [translate='no'], .notranslate")) return;

  let translatedByI18n = false;
  for (const attribute of translatedAttributes) {
    const currentValue = element.getAttribute(attribute);
    if (!currentValue?.trim()) continue;

    const sourceKey = `data-vietyoru-i18n-${attribute}`;
    const sourceValue = element.getAttribute(sourceKey) ?? currentValue;
    const translated = translateText(sourceValue, language);
    translatedByI18n ||= translated !== sourceValue;

    if (translated !== sourceValue || element.hasAttribute(sourceKey)) {
      element.setAttribute(sourceKey, sourceValue);
      if (currentValue !== translated) {
        element.setAttribute(attribute, translated);
      }
    }
  }

  if (element instanceof HTMLInputElement && element.readOnly && element.value.trim()) {
    const storedSource = element.getAttribute(valueSourceKey);
    let sourceValue = storedSource ?? element.value;

    if (storedSource) {
      const translatedStoredSource = translateText(storedSource, language);
      if (element.value !== storedSource && element.value !== translatedStoredSource) {
        sourceValue = getVietnameseSource(element.value);
      }
    }

    const translated = translateText(sourceValue, language);
    translatedByI18n ||= translated !== sourceValue;

    if (translated !== sourceValue || element.hasAttribute(valueSourceKey)) {
      element.setAttribute(valueSourceKey, getVietnameseSource(sourceValue));
      if (element.value !== translated) {
        element.value = translated;
      }
    }
  }

  protectManualTranslation(element, language !== "vi" && translatedByI18n);
}

function normalizeForComparison(value: string) {
  return value.replace(/\s+/g, " ").trim();
}

function lockTitleFromTranslation() {
  const titleElement = document.querySelector("title");
  if (titleElement) {
    titleElement.setAttribute("translate", "no");
    titleElement.setAttribute("data-no-translate", "true");
    titleElement.classList.add("notranslate");
  }
}

function applyTranslations(language: LanguageCode) {
  syncUserThemeFromStorage();
  document.documentElement.lang = languageHtmlLang[language];
  document.documentElement.dataset.vietyoruLanguage = language;
  lockTitleFromTranslation();

  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  const textNodes: Text[] = [];
  let currentNode = walker.nextNode();

  while (currentNode) {
    textNodes.push(currentNode as Text);
    currentNode = walker.nextNode();
  }

  textNodes.forEach((node) => translateTextNode(node, language));
  document
    .querySelectorAll<HTMLElement>(
      "[placeholder], [aria-label], [title], img[alt], input[readonly]",
    )
    .forEach((element) => translateElementAttributes(element, language));
  syncUserThemeFromStorage();
}

export function shouldSkipLanguageTranslation(
  pathname: string,
  hostKind: NightlifeHostKind,
  hostname = "",
) {
  const normalizedHostname = hostname.trim().toLowerCase().replace(/\.$/, "");
  const isPortalHost =
    hostKind === "admin" ||
    hostKind === "partner" ||
    hostKind === "auth" ||
    normalizedHostname.startsWith("admin.") ||
    normalizedHostname.startsWith("partner.") ||
    normalizedHostname.startsWith("auth.");

  const isAuthOrPortalPath =
    pathname.startsWith("/admin") ||
    pathname.startsWith("/partner") ||
    pathname === "/dang-nhap" ||
    pathname === "/dang-nhap-doi-tac" ||
    pathname === "/dang-ky-doi-tac" ||
    pathname === "/quen-mat-khau" ||
    pathname === "/dat-lai-mat-khau" ||
    pathname === "/xac-nhan";

  return isPortalHost || isAuthOrPortalPath;
}

export function ClientLanguageTranslator({
  children,
  hostKind,
}: {
  children: React.ReactNode;
  hostKind: NightlifeHostKind;
}) {
  const pathname = usePathname() || "/";

  useLayoutEffect(() => {
    if (shouldSkipLanguageTranslation(pathname, hostKind, window.location.hostname)) {
      return undefined;
    }

    let language = readStoredLanguage();
    let frame = 0;
    let isScheduled = false;
    let backupTimer: number | null = null;

    const scheduleApply = () => {
      if (isScheduled) return;
      isScheduled = true;

      if (frame) {
        window.cancelAnimationFrame(frame);
      }
      frame = window.requestAnimationFrame(() => {
        applyTranslations(language);
        isScheduled = false;
      });

      if (backupTimer === null) {
        backupTimer = window.setTimeout(() => {
          backupTimer = null;
          applyTranslations(language);
        }, 200);
      }
    };

    const onLanguageChange = (event: Event) => {
      const nextLanguage = (event as CustomEvent<{ language?: LanguageCode }>).detail?.language;
      language = nextLanguage ?? readStoredLanguage();
      applyTranslations(language);
      scheduleApply();
    };

    applyTranslations(language);
    scheduleApply();
    window.addEventListener(languageChangedEvent, onLanguageChange);

    const observer = new MutationObserver(scheduleApply);
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      characterData: true,
      attributes: true,
      attributeFilter: [...translatedAttributes],
    });

    return () => {
      if (backupTimer !== null) {
        window.clearTimeout(backupTimer);
      }
      if (frame) {
        window.cancelAnimationFrame(frame);
      }
      observer.disconnect();
      window.removeEventListener(languageChangedEvent, onLanguageChange);
    };
  }, [hostKind, pathname]);

  return (
    <div data-vietyoru-translator="true" style={{ display: "contents" }}>
      {children}
    </div>
  );
}
