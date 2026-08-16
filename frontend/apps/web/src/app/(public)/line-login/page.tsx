"use client";

import { useEffect, useMemo } from "react";
import {
  activatePortalAuthSession,
  getLineLoginConfig,
  loginLineMember,
  logoutBrowserProfile,
} from "@/lib/api/auth";
import { normalizeLineLoginRedirect } from "@/lib/auth/line-login";

type LiffApi = {
  init: (config: { liffId: string; withLoginOnExternalBrowser?: boolean }) => Promise<void>;
  isLoggedIn: () => boolean;
  login: (config?: { redirectUri?: string }) => void;
  getIDToken: () => string | null;
};

declare global {
  interface Window {
    liff?: LiffApi;
    __nightlifeLiffSdkPromise?: Promise<void>;
  }
}

const loadLiffSdk = () => {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("LIFF SDK is only available in browser"));
  }

  if (window.liff) {
    return Promise.resolve();
  }

  if (window.__nightlifeLiffSdkPromise) {
    return window.__nightlifeLiffSdkPromise;
  }

  window.__nightlifeLiffSdkPromise = new Promise<void>((resolve, reject) => {
    const existingScript = document.getElementById("line-liff-sdk") as HTMLScriptElement | null;
    if (existingScript) {
      existingScript.addEventListener("load", () => resolve(), { once: true });
      existingScript.addEventListener("error", () => reject(new Error("Cannot load LIFF SDK")), {
        once: true,
      });
      return;
    }

    const script = document.createElement("script");
    script.id = "line-liff-sdk";
    script.src = "https://static.line-scdn.net/liff/edge/2/sdk.js";
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Cannot load LIFF SDK"));
    document.head.appendChild(script);
  });

  return window.__nightlifeLiffSdkPromise;
};

export default function LineLoginPage() {
  const redirectTo = useMemo(() => {
    if (typeof window === "undefined") return "/tai-khoan";
    return normalizeLineLoginRedirect(
      new URLSearchParams(window.location.search).get("redirect"),
    );
  }, []);
  const fallbackHref = useMemo(() => {
    const params = new URLSearchParams({ redirect: redirectTo });
    return `/api/backend/auth/line/start?${params.toString()}`;
  }, [redirectTo]);
  const loginErrorHref = useMemo(() => {
    const params = new URLSearchParams({
      redirect: redirectTo,
      line_error: "Đăng nhập LINE chưa được cấu hình.",
    });
    return `/dang-nhap?${params.toString()}`;
  }, [redirectTo]);

  useEffect(() => {
    let cancelled = false;
    let canUseWebOAuth = false;

    const fallbackToWebLogin = () => {
      if (!canUseWebOAuth) {
        window.location.replace(loginErrorHref);
        return;
      }

      window.location.replace(fallbackHref);
    };

    const runLineLogin = async () => {
      try {
        const config = await getLineLoginConfig();

        if (!config.configured) {
          throw new Error("LINE login is not configured");
        }

        canUseWebOAuth = Boolean(config.webOAuthConfigured);

        if (!config.liffId) {
          fallbackToWebLogin();
          return;
        }

        await logoutBrowserProfile();
        await loadLiffSdk();

        if (!window.liff) {
          throw new Error("LIFF SDK is not ready");
        }

        await window.liff.init({
          liffId: config.liffId,
          withLoginOnExternalBrowser: true,
        });

        if (!window.liff.isLoggedIn()) {
          window.liff.login({ redirectUri: window.location.href });
          return;
        }

        const idToken = window.liff.getIDToken();
        if (!idToken) {
          throw new Error("LINE did not return ID token");
        }

        const session = await loginLineMember({ idToken });

        if (!cancelled) {
          await activatePortalAuthSession(session, { redirectTo });
        }
      } catch (caught) {
        if (cancelled) return;
        console.error("[LINE LIFF] Khong the khoi tao hoac dang nhap qua LIFF.", caught);
        fallbackToWebLogin();
      }
    };

    runLineLogin();

    return () => {
      cancelled = true;
    };
  }, [fallbackHref, loginErrorHref, redirectTo]);

  return (
    <main
      className="nl-line-login-page"
      aria-busy="true"
      aria-label="Đang chuyển sang LINE"
      style={{
        minHeight: "100vh",
        background: "#0c0c0f",
      }}
    />
  );
}
