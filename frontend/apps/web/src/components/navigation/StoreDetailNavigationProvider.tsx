"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";

import {
  getPathLanguage,
  localizePathname,
} from "@/lib/i18n/locales";
import {
  castDetailReturnToParam,
  castDetailSourceParam,
  getCastDetailBackHref,
  inferCastDetailSource,
  isCastDetailPath,
  parseCastDetailSource,
} from "@/lib/cast-detail-navigation";
import {
  getStoreDetailBackHref,
  inferStoreDetailSource,
  isStoreDetailPath,
  parseStoreDetailSource,
  storeDetailSourceParam,
} from "@/lib/store-detail-navigation";

const searchParamKeys = ["q", "query", "search", "keyword"] as const;

function hasActiveDirectorySearch() {
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

function localizeDetailDestination(url: URL, currentPathname: string) {
  const currentLocale = getPathLanguage(currentPathname);
  if (!currentLocale || getPathLanguage(url.pathname)) return;

  url.pathname = localizePathname(url.pathname, currentLocale);
}

function currentRelativeHref(pathname: string) {
  return `${pathname}${window.location.search}${window.location.hash}`;
}

function castBackHref(pathname: string) {
  const params = new URLSearchParams(window.location.search);
  const source = parseCastDetailSource(params.get(castDetailSourceParam));
  return getCastDetailBackHref(pathname, source, params.get(castDetailReturnToParam));
}

/**
 * Adds an explicit origin to internal store/cast detail navigation without
 * forcing every card in the app to know about the back-navigation contract.
 *
 * Store examples:
 *   /ja -> /ja/stores/grace-the-class?from=home
 *   /ja/stores -> /ja/stores/grace-the-class?from=stores
 *
 * Cast examples:
 *   /ja -> /ja/casts/hina?from=home
 *   /ja/casts -> /ja/casts/hina?from=casts
 *   /ja/xep-hang -> /ja/casts/hina?from=ranking
 *   /ja/stores/grace-the-class?from=home
 *      -> /ja/casts/hina?from=store&returnTo=%2Fja%2Fstores%2Fgrace-the-class%3Ffrom%3Dhome
 *
 * Direct/shared detail URLs have no `from`, so their back buttons safely fall
 * back to the localized store/cast directory.
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

      document.querySelectorAll<HTMLAnchorElement>("a.hero-back").forEach((anchor) => {
        anchor.setAttribute("href", backHref);
      });
    }

    if (isCastDetailPath(pathname)) {
      const backHref = castBackHref(pathname);

      document.querySelectorAll<HTMLAnchorElement>("a.cast-back-link").forEach((anchor) => {
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

      if (isCastDetailPath(pathname) && anchor.matches("a.cast-back-link")) {
        const backHref = castBackHref(pathname);

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

      if (destination.origin !== window.location.origin) return;

      const goesToStoreDetail = isStoreDetailPath(destination.pathname);
      const goesToCastDetail = isCastDetailPath(destination.pathname);
      if (!goesToStoreDetail && !goesToCastDetail) return;

      if (goesToStoreDetail) {
        // Related-store navigation from one detail page to another is not an
        // entry source. Leave it untouched so back safely defaults to /stores.
        if (isStoreDetailPath(pathname)) return;

        const source = inferStoreDetailSource(pathname, hasActiveDirectorySearch());
        if (!source) return;

        localizeDetailDestination(destination, pathname);
        destination.searchParams.set(storeDetailSourceParam, source);
      } else {
        // Related-cast navigation from one cast detail page to another has no
        // explicit entry source; keep the safe default of returning to /casts.
        if (isCastDetailPath(pathname)) return;

        const source = inferCastDetailSource(pathname, hasActiveDirectorySearch());
        if (!source) return;

        localizeDetailDestination(destination, pathname);
        destination.searchParams.set(castDetailSourceParam, source);

        if (source === "store" && isStoreDetailPath(pathname)) {
          destination.searchParams.set(castDetailReturnToParam, currentRelativeHref(pathname));
        } else {
          destination.searchParams.delete(castDetailReturnToParam);
        }
      }

      event.preventDefault();
      event.stopPropagation();
      router.push(`${destination.pathname}${destination.search}${destination.hash}`);
    };

    document.addEventListener("click", handleDocumentClick, true);
    return () => document.removeEventListener("click", handleDocumentClick, true);
  }, [pathname, router]);

  return null;
}
