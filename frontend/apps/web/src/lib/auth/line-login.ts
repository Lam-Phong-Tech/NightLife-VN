const defaultMemberRedirect = "/tai-khoan";

export function normalizeLineLoginRedirect(value: string | null) {
  if (!value || !value.startsWith("/") || value.startsWith("//")) {
    return defaultMemberRedirect;
  }

  return value;
}

export function buildLineLiffUrl(liffId: string, redirectTo: string) {
  const url = new URL(`https://liff.line.me/${encodeURIComponent(liffId)}/`);
  url.searchParams.set("redirect", normalizeLineLoginRedirect(redirectTo));
  return url.toString();
}

export function buildLineWebLoginUrl(redirectTo: string) {
  const params = new URLSearchParams({
    redirect: normalizeLineLoginRedirect(redirectTo),
  });

  return `/api/backend/auth/line/start?${params.toString()}`;
}
