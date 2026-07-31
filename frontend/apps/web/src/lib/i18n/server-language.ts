import { cookies } from "next/headers";
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

  const cookieStore = await cookies();

  for (const cookieName of languageCookieNames) {
    const cookieLanguage = normalizeServerLanguageCode(cookieStore.get(cookieName)?.value);
    if (cookieLanguage) return cookieLanguage;
  }

  return defaultServerLanguageCode;
}
