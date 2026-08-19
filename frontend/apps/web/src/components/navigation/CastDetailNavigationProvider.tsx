"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";

import {
  getPathLanguage,
  localizePathname,
} from "@/lib/i18n/locales";
import {
  castDetailSourceParam,
  getCastDetailBackHref,
  inferCastDetailSource,
  isCastDetailPath,
  parseCastDetailSource,
} from "@/lib/cast-detail-navigation";

const searchParamKeys = ["q", "query", "search", "keyword"] as const;

function hasActiveCastSearch() {
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

function localizeCastDetailDestination(url: URL, currentPathname: string) {
  const currentLocale = getPathLanguage(currentPathname);
  if (!currentLocale || getPathLanguage(url.pathname)) return;

  url.pathname = localizePathname(url.pathname, currentLocale);
}

/**
 * Adds an explicit origin to internal cast-detail navigation.
 *
 * Examples:
 *   /ja -> /ja/casts/hina?from=home
 *   /ja/casts -> /ja/casts/hina?from=casts
 *   /ja/xep-hang -> /ja/casts/hina?from=ranking
 *   cast search -> /ja/casts/hina?from=search
 *
 * A directly opened/shared cast URL has no `from`, so its back button falls
 * back to the localized cast directory.
 */
export function CastDetailNavigationProvider() {
  const pathname = usePathname() || "/";
  const router = useRouter();

  useEffect(() => {
    if (isCastDetailPath(pathname)) {
      const source = parseCastDetailSource(
        new URLSearchParams(window.location.search).get(castDetailSourceParam),
      );
      const backHref = getCastDetailBackHref(pathname, source);

      document.querySelectorAll<HTMLAnchorElement>("a.cast-back-link").forEach((anchor) => {
        anchor.setAttribute("href", backHref);
      });
    }

    const handleDocumentClick = (event: MouseEvent) => {
      const anchor = clickedAnchor(event);
      if (!anchor || !isPlainPrimaryClick(event, anchor)) return;

      if (isCastDetailPath(pathname) && anchor.matches("a.cast-back-link")) {
        const source = parseCastDetailSource(
          new URLSearchParams(window.location.search).get(castDetailSourceParam),
        );
        const backHref = getCastDetailBackHref(pathname, source);

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

      if (destination.origin !== window.location.origin || !isCastDetailPath(destination.pathname)) {
        return;
      }

      // Related-cast navigation from one cast detail page to another has no
      // explicit entry source; keep the safe default of returning to /casts.
      if (isCastDetailPath(pathname)) return;

      const source = inferCastDetailSource(pathname, hasActiveCastSearch());
      if (!source) return;

      localizeCastDetailDestination(destination, pathname);
      destination.searchParams.set(castDetailSourceParam, source);

      event.preventDefault();
      event.stopPropagation();
      router.push(`${destination.pathname}${destination.search}${destination.hash}`);
    };

    document.addEventListener("click", handleDocumentClick, true);
    return () => document.removeEventListener("click", handleDocumentClick, true);
  }, [pathname, router]);

  return null;
}
