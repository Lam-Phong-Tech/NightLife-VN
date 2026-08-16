const defaultMemberRedirect = "/tai-khoan";
const invalidLineOAuthStateMessage = "line login state is invalid. please try again.";

export function normalizeLineLoginRedirect(value: string | null) {
  if (!value || !value.startsWith("/") || value.startsWith("//")) {
    return defaultMemberRedirect;
  }

  return value;
}

export function isInvalidLineOAuthState(value: string | null) {
  return value?.trim().toLowerCase() === invalidLineOAuthStateMessage;
}

export function buildLineLiffUrl(liffId: string, redirectTo: string) {
  const url = new URL(`https://liff.line.me/${encodeURIComponent(liffId)}/`);
  url.searchParams.set("redirect", normalizeLineLoginRedirect(redirectTo));
  return url.toString();
}

export function buildLineWebLoginUrl(appOrigin: string, redirectTo: string) {
  const url = new URL("/api/backend/auth/line/start", appOrigin);
  url.searchParams.set("redirect", normalizeLineLoginRedirect(redirectTo));

  return url.toString();
}
