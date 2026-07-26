"use client";

import { useEffect } from "react";

import { portalForRole, portalHomePath } from "@/lib/auth/hosts";
import { apiClient } from "@/lib/api/client";
import { getActiveBrowserAuthSession, type AuthUser } from "@/lib/auth/session";

export type LoginPortal = "admin" | "partner" | "member";

export function LoginPageSessionRedirect({ requestedPortal }: { requestedPortal: LoginPortal }) {
  useEffect(() => {
    const activeSession = getActiveBrowserAuthSession(requestedPortal);
    if (!activeSession) return;

    let cancelled = false;
    void apiClient<AuthUser>("/auth/me")
      .then((user) => {
        if (cancelled || portalForRole(user.role) !== requestedPortal) return;

        const handoffUrl = new URL("/chuyen-tiep", window.location.origin);
        handoffUrl.searchParams.set("portal", requestedPortal);
        handoffUrl.searchParams.set("redirect", portalHomePath(requestedPortal));
        handoffUrl.searchParams.set("auth_notice", "login-blocked");
        handoffUrl.searchParams.set("requested_portal", requestedPortal);
        handoffUrl.searchParams.set("active_role", activeSession.role);
        window.location.replace(`${handoffUrl.pathname}${handoffUrl.search}`);
      })
      .catch(() => {
        // apiClient removes a stale cookie on 401 so the login page remains usable.
      });

    return () => {
      cancelled = true;
    };
  }, [requestedPortal]);

  return null;
}
