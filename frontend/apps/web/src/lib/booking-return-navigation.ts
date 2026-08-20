import { stripLanguagePrefix } from "@/lib/i18n/locales";

export const bookingReturnToParam = "returnTo";

export function isBookingPath(pathname: string) {
  const normalizedPath = stripLanguagePrefix(pathname || "/").replace(/\/+$/, "") || "/";
  return normalizedPath === "/dat-cho";
}

export function isBookingDetailReturnPath(pathname: string) {
  const normalizedPath = stripLanguagePrefix(pathname || "/").replace(/\/+$/, "") || "/";
  return /^\/(?:stores|casts)\/[^/]+$/.test(normalizedPath);
}

export function sanitizeBookingReturnHref(value: string | null | undefined) {
  if (!value || !value.startsWith("/") || value.startsWith("//")) return null;

  try {
    const url = new URL(value, "https://vietyoru.local");
    if (url.origin !== "https://vietyoru.local" || !isBookingDetailReturnPath(url.pathname)) {
      return null;
    }

    return `${url.pathname}${url.search}${url.hash}`;
  } catch {
    return null;
  }
}
