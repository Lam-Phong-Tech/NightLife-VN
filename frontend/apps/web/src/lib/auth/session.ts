import { getNightlifeHostKind } from "./hosts";

export type AuthRole = "USER" | "PARTNER" | "OPERATOR" | "ADMIN" | "SUPER_ADMIN" | "STAFF";

export type AuthUser = {
  id: string;
  email: string;
  displayName: string | null;
  phone?: string | null;
  role: AuthRole;
  tier?: string;
  status?: string;
};

export type AuthResponse = {
  accessToken: string;
  user: AuthUser;
};

export type ActiveBrowserAuthSession = {
  role: AuthRole;
  homePath: "/admin" | "/partner" | "/tai-khoan";
};

const sessionCookieMaxAge = 60 * 60 * 24;
const sessionScopePrefixes = ["", "partner_", "admin_"] as const;
const sessionCookieNames = ["auth_token", "user_role", "user_email", "user_name"] as const;
const authSessionSyncKey = "nightlife_auth_session_sync";
export const authSessionChangeEvent = "nightlife-auth-session-change";

const ensureAuthSessionSyncListener = () => {
  if (typeof window === "undefined") return;

  const syncWindow = window as typeof window & {
    __nightlifeAuthSessionSyncInstalled?: boolean;
  };
  if (syncWindow.__nightlifeAuthSessionSyncInstalled) return;

  syncWindow.__nightlifeAuthSessionSyncInstalled = true;
  window.addEventListener("storage", (event) => {
    if (event.key === authSessionSyncKey) {
      window.dispatchEvent(new Event(authSessionChangeEvent));
    }
  });
};

const notifyAuthSessionChanged = () => {
  if (typeof window === "undefined") return;
  ensureAuthSessionSyncListener();
  window.localStorage.setItem(
    authSessionSyncKey,
    `${Date.now()}-${Math.random().toString(36).slice(2)}`,
  );
  window.dispatchEvent(new Event(authSessionChangeEvent));
};

const setCookie = (name: string, value: string, maxAge = sessionCookieMaxAge) => {
  const secure = window.location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=${maxAge}; SameSite=Lax${secure}`;
};

const parseCookies = () => {
  if (typeof document === "undefined") return {};

  return document.cookie.split(";").reduce<Record<string, string>>((acc, cookie) => {
    const [name, ...valueParts] = cookie.trim().split("=");
    const value = valueParts.join("=");
    if (name && value) {
      acc[name] = decodeURIComponent(value);
    }
    return acc;
  }, {});
};

const decodeBase64Url = (value: string) => {
  const base64 = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, "=");
  return atob(padded);
};

const readTokenPayload = (token: string) => {
  if (!token || typeof window === "undefined") return null;

  const [, payload] = token.split(".");
  if (!payload) return null;

  try {
    return JSON.parse(decodeBase64Url(payload)) as {
      exp?: unknown;
      role?: unknown;
    };
  } catch {
    return null;
  }
};

const readTokenExpiresAt = (token: string) => {
  const payload = readTokenPayload(token);
  return typeof payload?.exp === "number" ? payload.exp * 1000 : null;
};

const getSessionCookieMaxAge = (token: string) => {
  const expiresAt = readTokenExpiresAt(token);
  if (!expiresAt) return sessionCookieMaxAge;

  const secondsToExpiry = Math.floor((expiresAt - Date.now()) / 1000);
  return Math.max(0, Math.min(sessionCookieMaxAge, secondsToExpiry));
};

const isTokenExpired = (token: string) => {
  const expiresAt = readTokenExpiresAt(token);
  return Boolean(expiresAt && expiresAt <= Date.now());
};

export const getSessionScopePrefix = () => {
  if (typeof window === "undefined") return "";
  const hostKind = getNightlifeHostKind(window.location.hostname);
  if (hostKind === "admin") return "admin_";
  if (hostKind === "partner") return "partner_";
  const pathname = window.location.pathname;
  if (pathname.startsWith("/admin")) return "admin_";
  if (pathname.startsWith("/partner") || pathname.startsWith("/dang-nhap-doi-tac"))
    return "partner_";
  return "";
};

const getSessionScopePrefixForRole = (role: AuthRole) => {
  if (role === "ADMIN" || role === "SUPER_ADMIN" || role === "OPERATOR") {
    return "admin_";
  }
  if (role === "PARTNER" || role === "STAFF") {
    return "partner_";
  }
  return "";
};

const getStoredAuthToken = () => {
  const cookies = parseCookies();
  const prefix = getSessionScopePrefix();
  return cookies[`${prefix}auth_token`] || "";
};

export const getAllAuthSessionTokens = () => {
  const cookies = parseCookies();
  return Array.from(
    new Set(
      sessionScopePrefixes.map((prefix) => cookies[`${prefix}auth_token`] || "").filter(Boolean),
    ),
  );
};

export const getActiveBrowserAuthSession = (): ActiveBrowserAuthSession | null => {
  if (typeof window === "undefined") return null;

  const cookies = parseCookies();
  const scopes: Array<{
    prefix: (typeof sessionScopePrefixes)[number];
    roles: AuthRole[];
    homePath: ActiveBrowserAuthSession["homePath"];
  }> = [
    {
      prefix: "admin_",
      roles: ["OPERATOR", "ADMIN", "SUPER_ADMIN"],
      homePath: "/admin",
    },
    {
      prefix: "partner_",
      roles: ["PARTNER", "STAFF"],
      homePath: "/partner",
    },
    {
      prefix: "",
      roles: ["USER"],
      homePath: "/tai-khoan",
    },
  ];

  for (const scope of scopes) {
    const token = cookies[`${scope.prefix}auth_token`] || "";
    if (!token || isTokenExpired(token)) continue;

    const tokenRole = readTokenPayload(token)?.role;
    const role = String(tokenRole || cookies[`${scope.prefix}user_role`] || "").toUpperCase();
    if (scope.roles.includes(role as AuthRole)) {
      return {
        role: role as AuthRole,
        homePath: scope.homePath,
      };
    }
  }

  return null;
};

export const getAuthSessionExpiresAt = () => {
  if (typeof window === "undefined") return null;

  const tokenExpiresAt = readTokenExpiresAt(getStoredAuthToken());
  if (tokenExpiresAt) return tokenExpiresAt;

  const prefix = getSessionScopePrefix();
  const storedExpiresAt = Number(window.localStorage.getItem(`nightlife_${prefix}auth_expires_at`));
  return Number.isFinite(storedExpiresAt) && storedExpiresAt > 0 ? storedExpiresAt : null;
};

const clearStoredAuthSessions = () => {
  if (typeof document !== "undefined") {
    for (const prefix of sessionScopePrefixes) {
      for (const name of sessionCookieNames) {
        document.cookie = `${prefix}${name}=; path=/; max-age=0; SameSite=Lax`;
      }
    }
  }

  if (typeof window !== "undefined") {
    for (const prefix of sessionScopePrefixes) {
      window.localStorage.removeItem(`nightlife_${prefix}user`);
      window.localStorage.removeItem(`nightlife_${prefix}auth_expires_at`);
    }
    window.localStorage.removeItem("nightlife_guest_bookings");
    window.sessionStorage.removeItem("nightlife_last_booking");
  }
};

export const clearAuthSession = () => {
  clearStoredAuthSessions();
  notifyAuthSessionChanged();
};

const getValidAuthToken = () => {
  const cookies = parseCookies();
  const prefix = getSessionScopePrefix();
  const token = cookies[`${prefix}auth_token`] || "";
  if (!token) {
    return "";
  }

  if (isTokenExpired(token)) {
    clearAuthSession();
    return "";
  }

  return token;
};

export const getAuthSessionToken = () => {
  ensureAuthSessionSyncListener();
  return getValidAuthToken();
};

export const setAuthSession = (session: AuthResponse) => {
  if (typeof window === "undefined") return;

  const maxAge = getSessionCookieMaxAge(session.accessToken);
  if (maxAge <= 0) {
    clearAuthSession();
    return;
  }

  clearStoredAuthSessions();
  const prefix = getSessionScopePrefixForRole(session.user.role);

  setCookie(`${prefix}auth_token`, session.accessToken, maxAge);
  setCookie(`${prefix}user_role`, session.user.role, maxAge);
  setCookie(`${prefix}user_email`, session.user.email, maxAge);
  setCookie(`${prefix}user_name`, session.user.displayName ?? session.user.email, maxAge);

  window.localStorage.setItem(`nightlife_${prefix}user`, JSON.stringify(session.user));
  const expiresAt = readTokenExpiresAt(session.accessToken);
  if (expiresAt) {
    window.localStorage.setItem(`nightlife_${prefix}auth_expires_at`, String(expiresAt));
  } else {
    window.localStorage.removeItem(`nightlife_${prefix}auth_expires_at`);
  }
  notifyAuthSessionChanged();
};

export const updateStoredAuthUser = (
  updates: Pick<AuthUser, "displayName" | "email" | "phone">,
) => {
  const currentUser = getAuthUser();
  const accessToken = getValidAuthToken();
  if (!currentUser || !accessToken) return null;

  const nextUser: AuthUser = {
    ...currentUser,
    displayName: updates.displayName,
    email: updates.email,
    phone: updates.phone,
  };

  setAuthSession({
    accessToken,
    user: nextUser,
  });

  return nextUser;
};

export const getAuthUser = (): AuthUser | null => {
  if (typeof window === "undefined") {
    return null;
  }

  ensureAuthSessionSyncListener();
  const cookies = parseCookies();
  const prefix = getSessionScopePrefix();
  const userKey = `nightlife_${prefix}user`;
  const expiresKey = `nightlife_${prefix}auth_expires_at`;
  const emailCookie = `${prefix}user_email`;
  const nameCookie = `${prefix}user_name`;
  const roleCookie = `${prefix}user_role`;

  const hasStoredSessionHints = Boolean(
    window.localStorage.getItem(userKey) ||
    window.localStorage.getItem(expiresKey) ||
    cookies[emailCookie],
  );
  const token = getValidAuthToken();
  if (!token) {
    if (hasStoredSessionHints) {
      clearAuthSession();
    }
    return null;
  }

  const storedUser = window.localStorage.getItem(userKey);
  if (storedUser) {
    try {
      return JSON.parse(storedUser) as AuthUser;
    } catch {
      window.localStorage.removeItem(userKey);
    }
  }

  if (!cookies[emailCookie]) {
    clearAuthSession();
    return null;
  }

  return {
    id: "",
    email: cookies[emailCookie],
    displayName: cookies[nameCookie] ?? cookies[emailCookie],
    role: (cookies[roleCookie] as AuthRole) || "USER",
  };
};
