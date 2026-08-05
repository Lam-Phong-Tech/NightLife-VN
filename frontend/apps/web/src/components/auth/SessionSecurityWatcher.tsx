"use client";

import { useEffect, useRef } from "react";

import { useSocket } from "@/components/providers/SocketProvider";
import { useSystemFeedback } from "@/components/ui/SystemFeedback";
import { formatDeviceLabel } from "@/lib/auth/device-label";
import {
  consumeSessionReplacedNotice,
  loginPathForRole,
  SESSION_REPLACED_EVENT,
  sessionReplacedBroadcastKey,
  type SessionReplacedNotice,
} from "@/lib/auth/session-replaced-notice";
import { clearAuthSession, clearAuthSessionForRole, type AuthRole } from "@/lib/auth/session";

const knownRoles: AuthRole[] = ["USER", "PARTNER", "OPERATOR", "ADMIN", "SUPER_ADMIN", "STAFF"];

const formatEventTime = (iso?: string | null) => {
  if (!iso) return "";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
};

export function SessionSecurityWatcher() {
  const { socket } = useSocket();
  const feedback = useSystemFeedback();
  const handledRef = useRef(false);

  useEffect(() => {
    const showReplacedWarning = (notice: SessionReplacedNotice) => {
      if (handledRef.current) return;
      handledRef.current = true;

      // Clearing is idempotent, so it is safe even when the API client
      // already wiped the cookies on the 401 that produced this notice.
      const role = String(notice.role ?? "").toUpperCase();
      if (knownRoles.includes(role as AuthRole)) {
        clearAuthSessionForRole(role as AuthRole);
      } else {
        clearAuthSession();
      }

      const newDevice = notice.newDevice;
      const deviceLabel = newDevice ? formatDeviceLabel(newDevice.userAgent) : "";
      const timeLabel = newDevice ? formatEventTime(newDevice.at) : "";
      const description = newDevice
        ? `Tài khoản của bạn vừa đăng nhập trên ${deviceLabel}${newDevice.ipAddress ? ` (IP ${newDevice.ipAddress})` : ""}${timeLabel ? ` lúc ${timeLabel}` : ""}. Phiên làm việc trên thiết bị này đã bị đăng xuất. Nếu không phải bạn thực hiện, vui lòng đổi mật khẩu ngay.`
        : "Tài khoản của bạn vừa đăng nhập trên một thiết bị khác. Phiên làm việc trên thiết bị này đã bị đăng xuất. Nếu không phải bạn thực hiện, vui lòng đổi mật khẩu ngay.";

      feedback.showModal({
        tone: "error",
        title: "Tài khoản vừa được đăng nhập trên thiết bị khác",
        description,
        primaryLabel: "Đăng nhập lại",
        onPrimary: () => {
          window.location.assign(loginPathForRole(notice.role));
        },
        secondaryLabel: "Đóng",
        onSecondary: () => {
          // Closing modal hides the popup without pushing/redirecting to login page
        },
      });
    };

    // A notice recorded before a reload/redirect (lazy 401 path) is drained on mount.
    const pending = consumeSessionReplacedNotice();
    if (pending) {
      showReplacedWarning(pending);
    }

    const onWindowEvent = (event: Event) => {
      // Drain the stored copy so the warning does not fire twice after navigation.
      consumeSessionReplacedNotice();
      const detail = (event as CustomEvent<SessionReplacedNotice>).detail ?? {};
      showReplacedWarning(detail);
    };

    const onStorage = (event: StorageEvent) => {
      if (event.key !== sessionReplacedBroadcastKey || !event.newValue) return;
      try {
        const notice = JSON.parse(event.newValue) as SessionReplacedNotice;
        showReplacedWarning(notice);
      } catch {
        showReplacedWarning({});
      }
    };

    window.addEventListener(SESSION_REPLACED_EVENT, onWindowEvent);
    window.addEventListener("storage", onStorage);
    return () => {
      window.removeEventListener(SESSION_REPLACED_EVENT, onWindowEvent);
      window.removeEventListener("storage", onStorage);
    };
  }, [feedback]);

  useEffect(() => {
    if (!socket) return;

    const onSessionReplaced = (payload: {
      reason?: string;
      role?: string;
      newDevice?: { userAgent: string | null; ipAddress: string | null; at: string };
    }) => {
      const notice: SessionReplacedNotice = {
        role: payload?.role,
        newDevice: payload?.newDevice,
      };
      try {
        window.localStorage.setItem(
          sessionReplacedBroadcastKey,
          JSON.stringify({ ...notice, nonce: Date.now() }),
        );
      } catch {
        // Cross-tab broadcast is best effort only.
      }
      window.dispatchEvent(
        new CustomEvent<SessionReplacedNotice>(SESSION_REPLACED_EVENT, { detail: notice }),
      );
    };

    socket.on("session_replaced", onSessionReplaced);
    return () => {
      socket.off("session_replaced", onSessionReplaced);
    };
  }, [socket]);

  return null;
}
