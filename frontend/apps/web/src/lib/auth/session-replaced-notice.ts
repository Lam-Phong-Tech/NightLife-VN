import type { AuthRole } from "./session";

export const SESSION_REPLACED_EVENT = "nightlife:session-replaced";
export const sessionReplacedNoticeKey = "nightlife_session_replaced_notice";
export const sessionReplacedBroadcastKey = "nightlife_session_replaced_broadcast";

export type SessionReplacedNotice = {
  role?: AuthRole | string;
  newDevice?: {
    userAgent: string | null;
    ipAddress: string | null;
    at: string;
  };
};

export const loginPathForRole = (role?: AuthRole | string | null): string => {
  const normalized = String(role ?? "").toUpperCase();
  if (["ADMIN", "SUPER_ADMIN", "OPERATOR"].includes(normalized)) {
    return "/admin/dang-nhap";
  }
  if (["PARTNER", "STAFF"].includes(normalized)) {
    return "/dang-nhap-doi-tac";
  }
  if (normalized === "USER") {
    return "/dang-nhap";
  }
  if (typeof window !== "undefined") {
    const pathname = window.location.pathname;
    if (pathname.startsWith("/admin")) return "/admin/dang-nhap";
    if (pathname.startsWith("/partner")) return "/dang-nhap-doi-tac";
  }
  return "/dang-nhap";
};

export const recordSessionReplacedNotice = (notice: SessionReplacedNotice) => {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.setItem(
      sessionReplacedNoticeKey,
      JSON.stringify(notice),
    );
  } catch {
    // Storage may be unavailable (private mode); the live event still fires.
  }
  window.dispatchEvent(
    new CustomEvent<SessionReplacedNotice>(SESSION_REPLACED_EVENT, {
      detail: notice,
    }),
  );
};

export const consumeSessionReplacedNotice = (): SessionReplacedNotice | null => {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.sessionStorage.getItem(sessionReplacedNoticeKey);
    if (!raw) return null;
    window.sessionStorage.removeItem(sessionReplacedNoticeKey);
    return JSON.parse(raw) as SessionReplacedNotice;
  } catch {
    return null;
  }
};
