export type AuthRole = "USER" | "PARTNER" | "ADMIN" | "STAFF";

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

const setCookie = (name: string, value: string) => {
  document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=${sessionCookieMaxAge}; SameSite=Lax`;
};

const getStoredAuthToken = () => {
  const cookies = document.cookie.split(";").reduce<Record<string, string>>((acc, cookie) => {
    const [name, ...valueParts] = cookie.trim().split("=");
    const value = valueParts.join("=");
    if (name && value) {
      acc[name] = decodeURIComponent(value);
    }
    return acc;
  }, {});

  return cookies.auth_token || "";
};

export const setAuthSession = (session: AuthResponse) => {
  setCookie("auth_token", session.accessToken);
  setCookie("user_role", session.user.role);
  setCookie("user_email", session.user.email);
  setCookie("user_name", session.user.displayName ?? session.user.email);

  window.localStorage.setItem("nightlife_user", JSON.stringify(session.user));
};

export const updateStoredAuthUser = (updates: Pick<AuthUser, "displayName" | "email" | "phone">) => {
  const currentUser = getAuthUser();
  if (!currentUser) return null;

  const nextUser: AuthUser = {
    ...currentUser,
    displayName: updates.displayName,
    email: updates.email,
    phone: updates.phone,
  };

  setAuthSession({
    accessToken: getStoredAuthToken(),
    user: nextUser,
  });

  return nextUser;
};

export const getAuthUser = (): AuthUser | null => {
  if (typeof window === "undefined") {
    return null;
  }

  const storedUser = window.localStorage.getItem("nightlife_user");
  if (storedUser) {
    try {
      return JSON.parse(storedUser) as AuthUser;
    } catch {
      window.localStorage.removeItem("nightlife_user");
    }
  }

  const cookies = document.cookie.split(";").reduce<Record<string, string>>((acc, cookie) => {
    const [name, ...valueParts] = cookie.trim().split("=");
    const value = valueParts.join("=");
    if (name && value) {
      acc[name] = decodeURIComponent(value);
    }
    return acc;
  }, {});

  if (!cookies.auth_token || !cookies.user_email) {
    return null;
  }

  return {
    id: "",
    email: cookies.user_email,
    displayName: cookies.user_name ?? cookies.user_email,
    role: (cookies.user_role as AuthRole) || "USER",
  };
};

export const clearAuthSession = () => {
  for (const name of ["auth_token", "user_role", "user_email", "user_name"]) {
    document.cookie = `${name}=; path=/; max-age=0; SameSite=Lax`;
  }

  window.localStorage.removeItem("nightlife_user");
  window.localStorage.removeItem("nightlife_guest_bookings");
  window.sessionStorage.removeItem("nightlife_last_booking");
};
