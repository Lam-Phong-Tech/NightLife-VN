"use client";

import { usePathname } from "next/navigation";
import React, { useEffect } from "react";
import {
  getVietnameseSource,
  languageChangedEvent,
  languageHtmlLang,
  readStoredLanguage,
  translateText,
  translateWithWhitespace,
  type LanguageCode,
} from "@/lib/i18n/client-translations";

const textSourceMap = new WeakMap<Text, string>();
const translatedAttributes = ["placeholder", "aria-label", "title", "alt"] as const;
const valueSourceKey = "data-vietyoru-i18n-value";
const skippedElementSelector =
  "script, style, noscript, code, pre, textarea, svg, [data-no-translate='true']";

function shouldSkipTextNode(node: Text) {
  const parent = node.parentElement;
  if (!parent) return true;
  return Boolean(parent.closest(skippedElementSelector));
}

function translateTextNode(node: Text, language: LanguageCode) {
  if (shouldSkipTextNode(node)) return;

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

  if (translated !== source || textSourceMap.has(node)) {
    textSourceMap.set(node, getVietnameseSource(source));
    if (node.nodeValue !== translated) {
      node.nodeValue = translated;
    }
  }
}

function translateElementAttributes(element: HTMLElement, language: LanguageCode) {
  if (element.closest("[data-no-translate='true']")) return;

  for (const attribute of translatedAttributes) {
    const currentValue = element.getAttribute(attribute);
    if (!currentValue?.trim()) continue;

    const sourceKey = `data-vietyoru-i18n-${attribute}`;
    const sourceValue = element.getAttribute(sourceKey) ?? currentValue;
    const translated = translateText(sourceValue, language);

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

    if (translated !== sourceValue || element.hasAttribute(valueSourceKey)) {
      element.setAttribute(valueSourceKey, getVietnameseSource(sourceValue));
      if (element.value !== translated) {
        element.value = translated;
      }
    }
  }
}

function applyTranslations(language: LanguageCode) {
  document.documentElement.lang = languageHtmlLang[language];
  document.documentElement.dataset.vietyoruLanguage = language;

  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  const textNodes: Text[] = [];
  let currentNode = walker.nextNode();

  while (currentNode) {
    textNodes.push(currentNode as Text);
    currentNode = walker.nextNode();
  }

  textNodes.forEach((node) => translateTextNode(node, language));
  document
    .querySelectorAll<HTMLElement>("[placeholder], [aria-label], [title], img[alt], input[readonly]")
    .forEach((element) => translateElementAttributes(element, language));
}

function shouldSkipRoute(pathname: string) {
  return pathname.startsWith("/admin") || pathname.startsWith("/partner");
}

export function ClientLanguageTranslator({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() || "/";

  useEffect(() => {
    if (shouldSkipRoute(pathname)) {
      return undefined;
    }

    let language = readStoredLanguage();
    let timers: number[] = [];

    const scheduleApply = () => {
      timers.forEach((timer) => window.clearTimeout(timer));
      timers = [30, 240, 900].map((delay) =>
        window.setTimeout(() => applyTranslations(language), delay),
      );
    };

    const onLanguageChange = (event: Event) => {
      const nextLanguage = (event as CustomEvent<{ language?: LanguageCode }>).detail?.language;
      language = nextLanguage ?? readStoredLanguage();
      scheduleApply();
    };

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
      timers.forEach((timer) => window.clearTimeout(timer));
      observer.disconnect();
      window.removeEventListener(languageChangedEvent, onLanguageChange);
    };
  }, [pathname]);

  return (
    <div data-vietyoru-translator="true" style={{ display: "contents" }}>
      {children}
    </div>
  );
}
