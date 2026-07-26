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
    const notice = url.searchParams.get("auth_notice");
    if (notice === "device-replaced") {
      const device = url.searchParams.get("prev_device") || "thiết bị khác";
      const seenRaw = url.searchParams.get("prev_seen");
      let seenLabel = "";
      if (seenRaw) {
        const seenDate = new Date(seenRaw);
        if (!Number.isNaN(seenDate.getTime())) {
          seenLabel = seenDate.toLocaleString("vi-VN", {
            hour: "2-digit",
            minute: "2-digit",
            day: "2-digit",
            month: "2-digit",
          });
        }
      }

      feedback.showToast({
        tone: "warning",
        title: "Đăng nhập này đã đăng xuất một thiết bị khác.",
        description: `Phiên đăng nhập trên ${device}${seenLabel ? ` (hoạt động gần nhất ${seenLabel})` : ""} đã bị đăng xuất. Nếu không phải bạn thực hiện, vui lòng đổi mật khẩu ngay.`,
        durationMs: 10000,
        placement: "top-right",
      });

      url.searchParams.delete("auth_notice");
      url.searchParams.delete("prev_device");
      url.searchParams.delete("prev_seen");
      window.history.replaceState(window.history.state, "", `${url.pathname}${url.search}${url.hash}`);
      return;
    }

    if (notice === "partner-registration-blocked") {
      feedback.showToast({
        tone: "warning",
        title: "Tài khoản Partner đã được kích hoạt.",
        description: "Tài khoản Partner hiện tại không thể đăng ký thêm đối tác mới.",
        durationMs: 6000,
        placement: "top-right",
      });

      url.searchParams.delete("auth_notice");
      url.searchParams.delete("active_role");
      window.history.replaceState(window.history.state, "", `${url.pathname}${url.search}${url.hash}`);
      return;
    }

    if (notice !== "login-blocked") return;

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
