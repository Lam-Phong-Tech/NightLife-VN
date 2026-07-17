"use client";

import { useEffect } from "react";

import { useSystemFeedback } from "@/components/ui/SystemFeedback";

const roleLabels: Record<string, string> = {
  ADMIN: "Admin",
  SUPER_ADMIN: "Super Admin",
  STAFF: "Nhân viên quản trị",
  PARTNER: "Partner",
  OPERATOR: "Nhân viên vận hành",
  USER: "Member",
};

const portalLabels: Record<string, string> = {
  admin: "Admin",
  partner: "Partner",
  member: "Member",
};

export function AuthRedirectNotice() {
  const feedback = useSystemFeedback();

  useEffect(() => {
    const url = new URL(window.location.href);
    if (url.searchParams.get("auth_notice") !== "login-blocked") return;

    const activeRole = url.searchParams.get("active_role") || "";
    const requestedPortal = url.searchParams.get("requested_portal") || "";
    const roleLabel = roleLabels[activeRole] || "tài khoản hiện tại";
    const portalLabel = portalLabels[requestedPortal] || "một phân quyền khác";

    feedback.showToast({
      tone: "warning",
      title: `Bạn đang đăng nhập với quyền ${roleLabel}.`,
      description: `Vui lòng đăng xuất trước khi đăng nhập ${portalLabel}.`,
      durationMs: 6000,
      placement: "top-right",
    });

    url.searchParams.delete("auth_notice");
    url.searchParams.delete("requested_portal");
    url.searchParams.delete("active_role");
    window.history.replaceState(window.history.state, "", `${url.pathname}${url.search}${url.hash}`);
  }, [feedback]);

  return null;
}
