"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";

import {
  getPathLanguage,
  localizePathname,
} from "@/lib/i18n/locales";
import {
  getStoreDetailBackHref,
  inferStoreDetailSource,
  isStoreDetailPath,
  parseStoreDetailSource,
  storeDetailSourceParam,
} from "@/lib/store-detail-navigation";

const searchParamKeys = ["q", "query", "search", "keyword"] as const;

function hasActiveVenueSearch() {
  const params = new URLSearchParams(window.location.search);
  if (searchParamKeys.some((key) => Boolean(params.get(key)?.trim()))) return true;

  return Array.from(document.querySelectorAll<HTMLInputElement>('input[type="search"]')).some(
    (input) => Boolean(input.value.trim()),
  );
}

function clickedAnchor(event: MouseEvent) {
  if (!(event.target instanceof Element)) return null;
  return event.target.closest<HTMLAnchorElement>("a[href]");
}

function isPlainPrimaryClick(event: MouseEvent, anchor: HTMLAnchorElement) {
  return (
    event.button === 0 &&
    !event.altKey &&
    !event.ctrlKey &&
    !event.metaKey &&
    !event.shiftKey &&
    (!anchor.target || anchor.target === "_self") &&
    !anchor.hasAttribute("download")
  );
}

function localizeStoreDetailDestination(url: URL, currentPathname: string) {
  const currentLocale = getPathLanguage(currentPathname);
  if (!currentLocale || getPathLanguage(url.pathname)) return;

  url.pathname = localizePathname(url.pathname, currentLocale);
}

/**
 * Adds an explicit origin to internal store-detail navigation without forcing
 * every store card in the app to know about the back-navigation contract.
 *
 * Examples:
 *   /ja -> /ja/stores/grace-the-class?from=home
 *   /ja/stores -> /ja/stores/grace-the-class?from=stores
 *   /ja/xep-hang -> /ja/stores/grace-the-class?from=ranking
 *   store search -> /ja/stores/grace-the-class?from=search
 *
 * A directly opened/shared detail URL has no `from`, so its back button falls
 * back to the localized store directory.
 */
export function StoreDetailNavigationProvider() {
  const pathname = usePathname() || "/";
  const router = useRouter();

  useEffect(() => {
    if (isStoreDetailPath(pathname)) {
      const source = parseStoreDetailSource(
        new URLSearchParams(window.location.search).get(storeDetailSourceParam),
      );
      const backHref = getStoreDetailBackHref(pathname, source);

      // Keep the real anchor destination correct for accessibility, long press,
      // copy-link and cases where JavaScript navigation is bypassed.
      document.querySelectorAll<HTMLAnchorElement>("a.hero-back").forEach((anchor) => {
        anchor.setAttribute("href", backHref);
      });
    }

    const handleDocumentClick = (event: MouseEvent) => {
      const anchor = clickedAnchor(event);
      if (!anchor || !isPlainPrimaryClick(event, anchor)) return;

      if (isStoreDetailPath(pathname) && anchor.matches("a.hero-back")) {
        const source = parseStoreDetailSource(
          new URLSearchParams(window.location.search).get(storeDetailSourceParam),
        );
        const backHref = getStoreDetailBackHref(pathname, source);

        event.preventDefault();
        event.stopPropagation();
        router.push(backHref);
        return;
      }

      let destination: URL;
      try {
        destination = new URL(anchor.href, window.location.href);
      } catch {
        return;
      }

      if (destination.origin !== window.location.origin || !isStoreDetailPath(destination.pathname)) {
        return;
      }

      // Related-store navigation from one detail page to another is not one of
      // the four entry sources. Leave it untouched; the next detail therefore
      // uses the safe default of returning to /stores.
      if (isStoreDetailPath(pathname)) return;

      const source = inferStoreDetailSource(pathname, hasActiveVenueSearch());
      if (!source) return;

      localizeStoreDetailDestination(destination, pathname);
      destination.searchParams.set(storeDetailSourceParam, source);

      event.preventDefault();
      event.stopPropagation();
      router.push(`${destination.pathname}${destination.search}${destination.hash}`);
    };

    document.addEventListener("click", handleDocumentClick, true);
    return () => document.removeEventListener("click", handleDocumentClick, true);
  }, [pathname, router]);

  return null;
}
