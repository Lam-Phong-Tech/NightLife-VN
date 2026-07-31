import { notFound } from "next/navigation";
import { isLanguageCode, type LanguageCode } from "./locales";

export type LocalizedRouteParams = Promise<{ locale: string }>;

export async function requireRouteLanguage(
  params: LocalizedRouteParams,
): Promise<LanguageCode> {
  const { locale } = await params;
  if (!isLanguageCode(locale)) notFound();
  return locale;
}
