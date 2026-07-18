"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";

const INTRO_SESSION_KEY = "vy-brand-intro-seen";
const ROUTE_PROGRESS_DELAY = 130;
const ROUTE_PROGRESS_TIMEOUT = 12_000;

type IntroPhase = "visible" | "leaving" | "hidden";

function currentLocationKey() {
  return `${window.location.pathname}${window.location.search}`;
}

export function HybridPreloader() {
  const pathname = usePathname() || "/";
  const [introPhase, setIntroPhase] = useState<IntroPhase>("visible");
  const [routeVisible, setRouteVisible] = useState(false);
  const [routeProgress, setRouteProgress] = useState(0);

  const previousPathnameRef = useRef(pathname);
  const routeActiveRef = useRef(false);
  const routeVisibleRef = useRef(false);
  const targetLocationRef = useRef("");
  const showTimerRef = useRef<number | undefined>(undefined);
  const finishTimerRef = useRef<number | undefined>(undefined);
  const progressTimerRef = useRef<number | undefined>(undefined);
  const locationTimerRef = useRef<number | undefined>(undefined);
  const timeoutTimerRef = useRef<number | undefined>(undefined);

  const clearRouteTimers = useCallback(() => {
    if (showTimerRef.current) window.clearTimeout(showTimerRef.current);
    if (finishTimerRef.current) window.clearTimeout(finishTimerRef.current);
    if (progressTimerRef.current) window.clearInterval(progressTimerRef.current);
    if (locationTimerRef.current) window.clearInterval(locationTimerRef.current);
    if (timeoutTimerRef.current) window.clearTimeout(timeoutTimerRef.current);

    showTimerRef.current = undefined;
    finishTimerRef.current = undefined;
    progressTimerRef.current = undefined;
    locationTimerRef.current = undefined;
    timeoutTimerRef.current = undefined;
  }, []);

  const finishRouteProgress = useCallback(() => {
    if (!routeActiveRef.current) return;

    routeActiveRef.current = false;
    targetLocationRef.current = "";

    if (showTimerRef.current) window.clearTimeout(showTimerRef.current);
    if (progressTimerRef.current) window.clearInterval(progressTimerRef.current);
    if (locationTimerRef.current) window.clearInterval(locationTimerRef.current);
    if (timeoutTimerRef.current) window.clearTimeout(timeoutTimerRef.current);

    showTimerRef.current = undefined;
    progressTimerRef.current = undefined;
    locationTimerRef.current = undefined;
    timeoutTimerRef.current = undefined;

    if (!routeVisibleRef.current) {
      setRouteProgress(0);
      return;
    }

    setRouteProgress(100);
    finishTimerRef.current = window.setTimeout(() => {
      routeVisibleRef.current = false;
      setRouteVisible(false);
      setRouteProgress(0);
      finishTimerRef.current = undefined;
    }, 220);
  }, []);

  const startRouteProgress = useCallback(
    (targetLocation?: string) => {
      if (routeActiveRef.current) return;

      clearRouteTimers();
      routeActiveRef.current = true;
      routeVisibleRef.current = false;
      targetLocationRef.current = targetLocation || "";
      setRouteProgress(8);

      showTimerRef.current = window.setTimeout(() => {
        routeVisibleRef.current = true;
        setRouteVisible(true);
        setRouteProgress(18);
        showTimerRef.current = undefined;
      }, ROUTE_PROGRESS_DELAY);

      progressTimerRef.current = window.setInterval(() => {
        setRouteProgress((current) => {
          if (current < 54) return Math.min(current + 9, 54);
          if (current < 76) return Math.min(current + 4, 76);
          return Math.min(current + 1.2, 90);
        });
      }, 240);

      if (targetLocation) {
        locationTimerRef.current = window.setInterval(() => {
          if (
            targetLocationRef.current &&
            currentLocationKey() === targetLocationRef.current
          ) {
            finishRouteProgress();
          }
        }, 50);
      }

      timeoutTimerRef.current = window.setTimeout(
        finishRouteProgress,
        ROUTE_PROGRESS_TIMEOUT,
      );
    },
    [clearRouteTimers, finishRouteProgress],
  );

  useEffect(() => {
    let introSeen = false;

    try {
      introSeen = window.sessionStorage.getItem(INTRO_SESSION_KEY) === "1";
      if (!introSeen) window.sessionStorage.setItem(INTRO_SESSION_KEY, "1");
    } catch {
      // Continue with the intro when session storage is unavailable.
    }

    if (introSeen) {
      const hideSeenIntroTimer = window.setTimeout(() => setIntroPhase("hidden"), 0);
      return () => window.clearTimeout(hideSeenIntroTimer);
    }

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const leaveTimer = window.setTimeout(
      () => setIntroPhase("leaving"),
      reduceMotion ? 80 : 540,
    );
    const hideTimer = window.setTimeout(
      () => setIntroPhase("hidden"),
      reduceMotion ? 180 : 820,
    );
    const hardTimeout = window.setTimeout(() => setIntroPhase("hidden"), 1_200);

    return () => {
      window.clearTimeout(leaveTimer);
      window.clearTimeout(hideTimer);
      window.clearTimeout(hardTimeout);
    };
  }, []);

  useEffect(() => {
    if (previousPathnameRef.current === pathname) return;
    previousPathnameRef.current = pathname;
    finishRouteProgress();
  }, [finishRouteProgress, pathname]);

  useEffect(() => {
    const handleDocumentClick = (event: MouseEvent) => {
      if (
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      ) {
        return;
      }

      const target = event.target;
      if (!(target instanceof Element)) return;

      const anchor = target.closest<HTMLAnchorElement>("a[href]");
      if (
        !anchor ||
        anchor.hasAttribute("download") ||
        anchor.dataset.noRouteProgress === "true" ||
        (anchor.target && anchor.target !== "_self")
      ) {
        return;
      }

      const nextUrl = new URL(anchor.href, window.location.href);
      if (nextUrl.origin !== window.location.origin) return;

      const currentUrl = new URL(window.location.href);
      const nextLocation = `${nextUrl.pathname}${nextUrl.search}`;
      const currentLocation = `${currentUrl.pathname}${currentUrl.search}`;

      if (nextLocation === currentLocation) return;
      startRouteProgress(nextLocation);
    };

    document.addEventListener("click", handleDocumentClick, true);
    return () => document.removeEventListener("click", handleDocumentClick, true);
  }, [startRouteProgress]);

  useEffect(
    () => () => {
      clearRouteTimers();
    },
    [clearRouteTimers],
  );

  return (
    <>
      {introPhase !== "hidden" ? (
        <div
          className="nl-brand-intro"
          data-phase={introPhase}
          role="status"
          aria-live="polite"
          aria-label="Đang mở Vietyoru"
        >
          <div className="nl-brand-intro-inner">
            <div className="nl-brand-intro-orbit" aria-hidden="true">
              <span />
            </div>
            <div className="nl-brand-intro-wordmark">Vietyoru</div>
            <div className="nl-brand-intro-tagline">Vietnam Nightlife Guide</div>
            <div className="nl-brand-intro-line" aria-hidden="true">
              <span />
            </div>
          </div>
        </div>
      ) : null}

      <div
        className="nl-navigation-progress"
        data-visible={routeVisible ? "true" : "false"}
        role="progressbar"
        aria-label="Đang chuyển trang"
      >
        <span style={{ transform: `scaleX(${routeProgress / 100})` }} />
      </div>
    </>
  );
}
