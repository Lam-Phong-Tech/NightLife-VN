"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, ExternalLink, Loader2 } from "lucide-react";
import {
  activatePortalAuthSession,
  getLineLoginConfig,
  loginLineMember,
  logoutBrowserProfile,
} from "@/lib/api/auth";
import { ApiError } from "@/lib/api/client";

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

const colors = {
  bg: "#0c0c0f",
  panel: "rgba(255,255,255,.055)",
  border: "rgba(212,178,106,.24)",
  text: "#f3f0ea",
  muted: "#b6b1a6",
  dim: "#8c8679",
  gold: "#d4b26a",
  line: "#06C755",
};

const normalizeRedirect = (value: string | null) => {
  if (!value || !value.startsWith("/") || value.startsWith("//")) {
    return "/tai-khoan";
  }

  return value;
};

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
  const [status, setStatus] = useState("Dang mo ung dung LINE...");
  const [error, setError] = useState("");
  const redirectTo = useMemo(() => {
    if (typeof window === "undefined") return "/tai-khoan";
    return normalizeRedirect(new URLSearchParams(window.location.search).get("redirect"));
  }, []);
  const fallbackHref = useMemo(() => {
    const params = new URLSearchParams({ redirect: redirectTo });
    return `/line-email-consent?${params.toString()}`;
  }, [redirectTo]);

  useEffect(() => {
    let cancelled = false;
    let canUseWebOAuth = false;

    const fallbackToWebLogin = () => {
      if (!canUseWebOAuth) {
        setStatus("Khong co luong LINE web fallback. Vui long thu lai sau.");
        return;
      }

      window.setTimeout(() => {
        if (!cancelled) {
          window.location.replace(fallbackHref);
        }
      }, 1600);
    };

    const runLineLogin = async () => {
      try {
        setStatus("Dang kiem tra cau hinh LINE...");
        const config = await getLineLoginConfig();

        if (!config.configured) {
          throw new Error("LINE login is not configured");
        }

        canUseWebOAuth = Boolean(config.webOAuthConfigured);

        if (!config.liffId) {
          setStatus("Chua cau hinh LIFF, chuyen sang dang nhap LINE tren trinh duyet...");
          fallbackToWebLogin();
          return;
        }

        await logoutBrowserProfile();
        setStatus("Dang mo va xac thuc qua ung dung LINE...");
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

        setStatus("Dang hoan tat dang nhap...");
        const session = await loginLineMember({ idToken });

        if (!cancelled) {
          await activatePortalAuthSession(session, { redirectTo });
        }
      } catch (caught) {
        if (cancelled) return;
        const message =
          caught instanceof ApiError
            ? caught.message
            : "Khong mo duoc LINE app. Dang chuyen sang dang nhap tren trinh duyet.";
        setError(message);
        setStatus("Dang chuyen sang luong LINE web...");
        fallbackToWebLogin();
      }
    };

    runLineLogin();

    return () => {
      cancelled = true;
    };
  }, [fallbackHref, redirectTo]);

  return (
    <main
      className="nl-line-login-page"
      style={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        padding: 18,
        background: colors.bg,
        color: colors.text,
      }}
    >
      <section
        style={{
          width: "min(100%, 440px)",
          border: `1px solid ${colors.border}`,
          borderRadius: 20,
          padding: 24,
          background: colors.panel,
          boxShadow: "0 24px 70px rgba(0,0,0,.28)",
          textAlign: "center",
        }}
      >
        <div
          style={{
            width: 62,
            height: 62,
            margin: "0 auto 18px",
            borderRadius: 18,
            display: "grid",
            placeItems: "center",
            background: colors.line,
            color: "#fff",
            fontSize: 22,
            fontWeight: 950,
          }}
        >
          LINE
        </div>
        <Loader2
          size={26}
          color={colors.gold}
          style={{ margin: "0 auto 14px", animation: "nl-line-spin 1s linear infinite" }}
        />
        <h1 style={{ margin: 0, fontSize: 24, lineHeight: 1.2, fontWeight: 950 }}>
          Tiep tuc voi LINE
        </h1>
        <p style={{ margin: "12px 0 0", color: colors.muted, fontSize: 14, lineHeight: 1.6 }}>
          {status}
        </p>
        {error && (
          <p style={{ margin: "10px 0 0", color: "#fca5a5", fontSize: 13.5, lineHeight: 1.55 }}>
            {error}
          </p>
        )}
        <div style={{ display: "grid", gap: 10, marginTop: 22 }}>
          <Link
            href={fallbackHref}
            style={{
              minHeight: 44,
              borderRadius: 13,
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              border: `1px solid ${colors.border}`,
              color: colors.text,
              textDecoration: "none",
              fontSize: 13.5,
              fontWeight: 850,
            }}
          >
            <ExternalLink size={16} />
            Dang nhap LINE tren trinh duyet
          </Link>
          <Link
            href="/dang-nhap"
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 7,
              color: colors.dim,
              textDecoration: "none",
              fontSize: 13,
              fontWeight: 800,
            }}
          >
            <ArrowLeft size={15} />
            Quay lai dang nhap
          </Link>
        </div>
      </section>
      <style jsx global>{`
        @keyframes nl-line-spin {
          to {
            transform: rotate(360deg);
          }
        }

        html.vy-light .nl-line-login-page {
          background:
            radial-gradient(circle at 50% 0%, rgba(6, 199, 85, 0.12), transparent 34%),
            linear-gradient(180deg, #fffaf1 0%, #f5efe5 100%) !important;
          color: #241a0a !important;
        }
      `}</style>
    </main>
  );
}
