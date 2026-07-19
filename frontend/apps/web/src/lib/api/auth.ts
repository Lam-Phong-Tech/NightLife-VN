import { ApiError, apiClient, buildApiUrl } from "./client";
import {
  clearAuthSession,
  getActiveBrowserAuthSession,
  getAllAuthSessionTokens,
  getAuthSessionToken,
  setAuthSession,
  type AuthResponse,
  type AuthRole,
} from "../auth/session";
import {
  getNightlifeHostKind,
  isSafePortalRedirect,
  nightlifeOrigins,
  portalForRole,
  portalHomePath,
  runtimePortalOrigin,
  type AuthPortal,
} from "../auth/hosts";

export type LoginPayload = {
  email: string;
  password: string;
};

export type RegisterPayload = LoginPayload & {
  displayName?: string;
  emailOtp: string;
};

export type GoogleLoginPayload = {
  credential?: string;
  accessToken?: string;
};

export type GoogleLoginConfig = {
  configured: boolean;
  clientId: string | null;
};

export type OAuthLoginConfig = {
  configured: boolean;
};

export type UpdateProfilePayload = {
  displayName: string;
  email: string;
  phone?: string | null;
};

export type RequestPasswordResetPayload = {
  email: string;
};

export type RequestRegistrationOtpPayload = {
  email: string;
};

export type VerifyPasswordResetCodePayload = {
  email: string;
  code: string;
};

export type ResetPasswordPayload = {
  email: string;
  resetToken: string;
  password: string;
  confirmPassword: string;
};

export type PasswordResetRequestResponse = {
  message: string;
  expiresInMinutes: number;
};

export type RegistrationOtpRequestResponse = PasswordResetRequestResponse;

export type PasswordResetVerifyResponse = {
  resetToken: string;
  expiresAt: string;
};

export type PasswordResetCompleteResponse = {
  updated: boolean;
};

type DemoAccount = {
  id: string;
  email: string;
  displayName: string;
  phone: string;
  role: AuthRole;
  tier: string;
  status: string;
};

const seedPassword = "Str0ngPass!";

const demoAccounts: DemoAccount[] = [
  {
    id: "demo-member",
    email: "member@nightlife.vn",
    displayName: "Demo Member",
    phone: "0912 345 678",
    role: "USER",
    tier: "VIP",
    status: "ACTIVE",
  },
  {
    id: "demo-partner",
    email: "partner@nightlife.vn",
    displayName: "Demo Partner",
    phone: "0901 000 002",
    role: "PARTNER",
    tier: "PREMIUM",
    status: "ACTIVE",
  },
  {
    id: "demo-partner-1",
    email: "partner1@nightlife.vn",
    displayName: "Demo Partner",
    phone: "0901 000 002",
    role: "PARTNER",
    tier: "PREMIUM",
    status: "ACTIVE",
  },
  {
    id: "demo-partner-2",
    email: "partner2@nightlife.vn",
    displayName: "Demo Partner",
    phone: "0901 000 003",
    role: "PARTNER",
    tier: "PREMIUM",
    status: "ACTIVE",
  },
  {
    id: "demo-admin",
    email: "admin@nightlife.vn",
    displayName: "NightLife Admin",
    phone: "0901 000 001",
    role: "ADMIN",
    tier: "VIP",
    status: "ACTIVE",
  },
];

const createDemoToken = (account: DemoAccount) => {
  const header = "eyJhbGciOiJub25lIiwidHlwIjoiSldUIn0";
  const payload = {
    sub: account.id,
    email: account.email,
    role: account.role,
    tier: account.tier,
  };
  const encodedPayload =
    typeof window !== "undefined"
      ? window
          .btoa(JSON.stringify(payload))
          .replace(/\+/g, "-")
          .replace(/\//g, "_")
          .replace(/=+$/, "")
      : "e30";

  return `${header}.${encodedPayload}.demo`;
};

const getDemoSession = (role: AuthRole, payload: LoginPayload): AuthResponse | null => {
  const email = payload.email.trim().toLowerCase();
  const account = demoAccounts.find((item) => item.email === email && item.role === role);

  if (!account || payload.password !== seedPassword) {
    return null;
  }

  return {
    accessToken: createDemoToken(account),
    user: account,
  };
};

const shouldUseDemoFallback = (error: unknown) => {
  if (!(error instanceof ApiError)) {
    return true;
  }

  return [401, 403, 404, 502, 503, 504].includes(error.status);
};

const loginWithRole = async (role: AuthRole, endpoint: string, payload: LoginPayload) => {
  try {
    return await apiClient<AuthResponse>(endpoint, {
      method: "POST",
      data: payload,
    });
  } catch (error) {
    const demoSession = getDemoSession(role, payload);

    if (demoSession && shouldUseDemoFallback(error)) {
      return demoSession;
    }

    throw error;
  }
};

export const loginPartner = (payload: LoginPayload) => {
  return loginWithRole("PARTNER", "/auth/login/partner", payload);
};

export const loginAdmin = (payload: LoginPayload) => {
  return loginWithRole("ADMIN", "/auth/login/admin", payload);
};

export const loginMember = (payload: LoginPayload) => {
  return loginWithRole("USER", "/auth/login/member", payload);
};

export const loginGoogleMember = (payload: GoogleLoginPayload) => {
  return apiClient<AuthResponse>("/auth/google/member", {
    method: "POST",
    data: payload,
  });
};

export const getGoogleLoginConfig = () => {
  return apiClient<GoogleLoginConfig>("/auth/google/config");
};

export const getLineLoginConfig = () => {
  return apiClient<OAuthLoginConfig>("/auth/line/config");
};

export const registerMember = (payload: RegisterPayload) => {
  return apiClient<AuthResponse>("/auth/register", {
    method: "POST",
    data: payload,
  });
};

export const requestRegistrationOtp = (payload: RequestRegistrationOtpPayload) => {
  return apiClient<RegistrationOtpRequestResponse>("/auth/register/email-otp", {
    method: "POST",
    data: payload,
  });
};

export const updateMemberProfile = (payload: UpdateProfilePayload) => {
  return apiClient<AuthResponse["user"]>("/auth/me", {
    method: "PATCH",
    data: payload,
  });
};

export const logoutCurrentUser = () => {
  return apiClient<{ revoked: boolean }>("/auth/logout", {
    method: "POST",
    data: {},
  });
};

const revokeAuthToken = async (token: string) => {
  await fetch(buildApiUrl("/auth/logout"), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: "{}",
  });
};

const revokeAuthTokens = async (tokens: string[]) => {
  await Promise.allSettled(Array.from(new Set(tokens.filter(Boolean))).map(revokeAuthToken));
};

const submitPortalSession = (accessToken: string, portal: AuthPortal, redirectTo: string) => {
  const form = document.createElement("form");
  form.method = "POST";
  form.action = `${runtimePortalOrigin(portal)}/api/auth/portal-session`;
  form.style.display = "none";

  const fields = {
    access_token: accessToken,
    portal,
    redirect: isSafePortalRedirect(portal, redirectTo) ? redirectTo : portalHomePath(portal),
  };
  for (const [name, value] of Object.entries(fields)) {
    const input = document.createElement("input");
    input.type = "hidden";
    input.name = name;
    input.value = value;
    form.appendChild(input);
  }

  document.body.appendChild(form);
  form.submit();
};

export const activateExclusiveAuthSession = async (
  session: AuthResponse,
  options?: { redirectTo?: string },
) => {
  const previousTokens = getAllAuthSessionTokens().filter((token) => token !== session.accessToken);

  await revokeAuthTokens(previousTokens);
  setAuthSession(session);

  if (!options || typeof window === "undefined") {
    return;
  }

  const portal = portalForRole(session.user.role);
  const redirectTo =
    options.redirectTo && isSafePortalRedirect(portal, options.redirectTo)
      ? options.redirectTo
      : portalHomePath(portal);
  const hostKind = getNightlifeHostKind(window.location.hostname);

  if (hostKind === "local" || hostKind === "unknown") {
    window.location.assign(redirectTo);
    return;
  }

  submitPortalSession(session.accessToken, portal, redirectTo);
};

export const handoffActiveAuthSession = () => {
  if (typeof window === "undefined") return false;
  const activeSession = getActiveBrowserAuthSession();
  const accessToken = getAuthSessionToken();
  if (!activeSession || !accessToken) return false;

  const portal = portalForRole(activeSession.role);
  const params = new URLSearchParams(window.location.search);
  const requestedRedirect = params.get("redirect");
  let redirectTo =
    requestedRedirect && isSafePortalRedirect(portal, requestedRedirect)
      ? requestedRedirect
      : portalHomePath(portal);
  if (params.get("auth_notice") === "login-blocked") {
    const noticeUrl = new URL(redirectTo, window.location.origin);
    noticeUrl.searchParams.set("auth_notice", "login-blocked");
    noticeUrl.searchParams.set(
      "requested_portal",
      params.get("requested_portal") || "member",
    );
    noticeUrl.searchParams.set("active_role", params.get("active_role") || activeSession.role);
    redirectTo = `${noticeUrl.pathname}${noticeUrl.search}`;
  }
  submitPortalSession(accessToken, portal, redirectTo);
  return true;
};

export const logoutBrowserProfile = async () => {
  const tokens = getAllAuthSessionTokens();
  clearAuthSession();
  await revokeAuthTokens(tokens);

  if (typeof window === "undefined") return;
  const hostKind = getNightlifeHostKind(window.location.hostname);
  if (!["public", "partner", "admin"].includes(hostKind)) return;

  try {
    await fetch(`${nightlifeOrigins.auth}/api/auth/clear-session`, {
      method: "POST",
      credentials: "include",
    });
  } catch {
    // The local portal session has already been removed. Central auth cleanup
    // can be retried the next time the auth host is opened.
  }
};

export const requestPasswordReset = (payload: RequestPasswordResetPayload) => {
  return apiClient<PasswordResetRequestResponse>("/auth/password-reset/request", {
    method: "POST",
    data: payload,
  });
};

export const verifyPasswordResetCode = (payload: VerifyPasswordResetCodePayload) => {
  return apiClient<PasswordResetVerifyResponse>("/auth/password-reset/verify", {
    method: "POST",
    data: payload,
  });
};

export const resetPassword = (payload: ResetPasswordPayload) => {
  return apiClient<PasswordResetCompleteResponse>("/auth/password-reset/complete", {
    method: "POST",
    data: payload,
  });
};
