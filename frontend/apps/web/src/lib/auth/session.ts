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
const authUserStorageKey = "nightlife_user";
const authExpiresStorageKey = "nightlife_auth_expires_at";
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

const getStoredAuthToken = () => {
  const cookies = parseCookies();
  return cookies.auth_token || "";
};

export const getAuthSessionExpiresAt = () => {
  if (typeof window === "undefined") return null;

  const tokenExpiresAt = readTokenExpiresAt(getStoredAuthToken());
  if (tokenExpiresAt) return tokenExpiresAt;

  const storedExpiresAt = Number(window.localStorage.getItem(authExpiresStorageKey));
  return Number.isFinite(storedExpiresAt) && storedExpiresAt > 0 ? storedExpiresAt : null;
};

export const clearAuthSession = () => {
  if (typeof document !== "undefined") {
    for (const name of ["auth_token", "user_role", "user_email", "user_name"]) {
      document.cookie = `${name}=; path=/; max-age=0; SameSite=Lax`;
    }
  }

  if (typeof window !== "undefined") {
    window.localStorage.removeItem(authUserStorageKey);
    window.localStorage.removeItem(authExpiresStorageKey);
    window.localStorage.removeItem("nightlife_guest_bookings");
    window.sessionStorage.removeItem("nightlife_last_booking");
  }

  notifyAuthSessionChanged();
};

const getValidAuthToken = () => {
  const cookies = parseCookies();
  const token = cookies.auth_token || "";
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

  setCookie("auth_token", session.accessToken, maxAge);
  setCookie("user_role", session.user.role, maxAge);
  setCookie("user_email", session.user.email, maxAge);
  setCookie("user_name", session.user.displayName ?? session.user.email, maxAge);

  window.localStorage.setItem(authUserStorageKey, JSON.stringify(session.user));
  const expiresAt = readTokenExpiresAt(session.accessToken);
  if (expiresAt) {
    window.localStorage.setItem(authExpiresStorageKey, String(expiresAt));
  } else {
    window.localStorage.removeItem(authExpiresStorageKey);
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
  const hasStoredSessionHints = Boolean(
    window.localStorage.getItem(authUserStorageKey) ||
      window.localStorage.getItem(authExpiresStorageKey) ||
      cookies.user_email,
  );
  const token = getValidAuthToken();
  if (!token) {
    if (hasStoredSessionHints) {
      clearAuthSession();
    }
    return null;
  }

  const storedUser = window.localStorage.getItem(authUserStorageKey);
  if (storedUser) {
    try {
      return JSON.parse(storedUser) as AuthUser;
    } catch {
      window.localStorage.removeItem(authUserStorageKey);
    }
  }

  if (!cookies.user_email) {
    clearAuthSession();
    return null;
  }

  return {
    id: "",
    email: cookies.user_email,
    displayName: cookies.user_name ?? cookies.user_email,
    role: (cookies.user_role as AuthRole) || "USER",
  };
};
