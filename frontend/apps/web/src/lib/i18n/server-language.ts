import { cookies, headers } from "next/headers";
import {
  defaultLanguageCode,
  isLanguageCode,
  type LanguageCode,
} from "./locales";

export type ServerLanguageCode = LanguageCode;

export const defaultServerLanguageCode: ServerLanguageCode = defaultLanguageCode;

const languageCookieNames = ["vietyoru_shared_language", "vietyoru_language"];

export function normalizeServerLanguageCode(value: string | null | undefined): ServerLanguageCode | null {
  const normalized = value?.trim().toLowerCase();
  if (!normalized) return null;

  return isLanguageCode(normalized) ? normalized : null;
}

export async function getServerSelectedLanguage(
  requestedLanguage?: string | string[] | null,
): Promise<ServerLanguageCode> {
  const queryLanguage = Array.isArray(requestedLanguage)
    ? requestedLanguage[0]
    : requestedLanguage;
  const normalizedQueryLanguage = normalizeServerLanguageCode(queryLanguage);

  if (normalizedQueryLanguage) return normalizedQueryLanguage;

  try {
    const headerStore = await headers();
    const referer = headerStore.get("referer");
    const xUrl = headerStore.get("x-url");
    const targetUrl = xUrl || referer;
    if (targetUrl) {
      const match = targetUrl.match(/[?&]lang=([a-z]{2})/i);
      const urlLang = normalizeServerLanguageCode(match?.[1]);
      if (urlLang) return urlLang;

      const pathMatch = targetUrl.match(/\/(en|ja|ko|zh|vi)(?:\/|\?|$)/i);
      const pathLang = normalizeServerLanguageCode(pathMatch?.[1]);
      if (pathLang) return pathLang;
    }
  } catch {
    // Ignore header errors when running outside request scope
  }

  try {
    const cookieStore = await cookies();
    for (const cookieName of languageCookieNames) {
      const cookieLanguage = normalizeServerLanguageCode(cookieStore.get(cookieName)?.value);
      if (cookieLanguage) return cookieLanguage;
    }
  } catch {
    // Ignore cookie errors when running outside request scope
  }

  return defaultServerLanguageCode;
}
