import { cookies } from "next/headers";

export type ServerLanguageCode = "vi" | "en" | "ja" | "ko" | "zh";

export const defaultServerLanguageCode: ServerLanguageCode = "ja";

const languageCookieNames = ["vietyoru_shared_language", "vietyoru_language"];
const languageCodes: ServerLanguageCode[] = ["vi", "en", "ja", "ko", "zh"];

export function normalizeServerLanguageCode(value: string | null | undefined): ServerLanguageCode | null {
  const normalized = value?.trim().toLowerCase();
  if (!normalized) return null;

  return languageCodes.includes(normalized as ServerLanguageCode)
    ? (normalized as ServerLanguageCode)
    : null;
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
