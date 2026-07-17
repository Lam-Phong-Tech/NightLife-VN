"use client";

import { useEffect } from "react";

import { getActiveBrowserAuthSession } from "@/lib/auth/session";

export type LoginPortal = "admin" | "partner" | "member";

export function LoginPageSessionRedirect({
  requestedPortal,
}: {
  requestedPortal: LoginPortal;
}) {
  useEffect(() => {
    const activeSession = getActiveBrowserAuthSession();
    if (!activeSession) return;

    const params = new URLSearchParams({
      auth_notice: "login-blocked",
      requested_portal: requestedPortal,
      active_role: activeSession.role,
    });
    window.location.replace(`${activeSession.homePath}?${params.toString()}`);
  }, [requestedPortal]);

  return null;
}
