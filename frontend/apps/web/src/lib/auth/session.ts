export type AuthRole = "USER" | "PARTNER" | "ADMIN" | "SUPER_ADMIN" | "STAFF";

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

const sessionCookieMaxAge = 60 * 60 * 24;
export const authSessionChangeEvent = "nightlife-auth-session-change";

const notifyAuthSessionChanged = () => {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(authSessionChangeEvent));
};

const setCookie = (name: string, value: string, maxAge = sessionCookieMaxAge) => {
  document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=${maxAge}; SameSite=Lax`;
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

const readTokenExpiresAt = (token: string) => {
  if (!token || typeof window === "undefined") return null;

  const [, payload] = token.split(".");
  if (!payload) return null;

  try {
    const decoded = JSON.parse(decodeBase64Url(payload)) as { exp?: unknown };
    return typeof decoded.exp === "number" ? decoded.exp * 1000 : null;
  } catch {
    return null;
  }
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
  if (window.location.pathname.startsWith("/admin")) return "admin_";
  if (window.location.pathname.startsWith("/partner")) return "partner_";
  return "";
};

const getStoredAuthToken = () => {
  const cookies = parseCookies();
  const prefix = getSessionScopePrefix();
  return cookies[`${prefix}auth_token`] || "";
};

export const getAuthSessionExpiresAt = () => {
  if (typeof window === "undefined") return null;

  const tokenExpiresAt = readTokenExpiresAt(getStoredAuthToken());
  if (tokenExpiresAt) return tokenExpiresAt;

  const prefix = getSessionScopePrefix();
  const storedExpiresAt = Number(window.localStorage.getItem(`nightlife_${prefix}auth_expires_at`));
  return Number.isFinite(storedExpiresAt) && storedExpiresAt > 0 ? storedExpiresAt : null;
};

export const clearAuthSession = () => {
  const prefix = getSessionScopePrefix();
  
  if (typeof document !== "undefined") {
    for (const name of [`${prefix}auth_token`, `${prefix}user_role`, `${prefix}user_email`, `${prefix}user_name`]) {
      document.cookie = `${name}=; path=/; max-age=0; SameSite=Lax`;
    }
  }

  if (typeof window !== "undefined") {
    window.localStorage.removeItem(`nightlife_${prefix}user`);
    window.localStorage.removeItem(`nightlife_${prefix}auth_expires_at`);
    if (!prefix) {
      window.localStorage.removeItem("nightlife_guest_bookings");
      window.sessionStorage.removeItem("nightlife_last_booking");
    }
  }

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

export const getAuthSessionToken = () => getValidAuthToken();

export const setAuthSession = (session: AuthResponse) => {
  if (typeof window === "undefined") return;

  const maxAge = getSessionCookieMaxAge(session.accessToken);
  if (maxAge <= 0) {
    clearAuthSession();
    return;
  }

  const prefix = getSessionScopePrefix();

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

export const updateStoredAuthUser = (updates: Pick<AuthUser, "displayName" | "email" | "phone">) => {
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
