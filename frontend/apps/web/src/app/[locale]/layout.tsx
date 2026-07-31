import type { ReactNode } from "react";
import { languageCodes } from "@/lib/i18n/locales";
import {
  requireRouteLanguage,
  type LocalizedRouteParams,
} from "@/lib/i18n/server-route-locale";
import { RoutedLanguageProvider } from "@/lib/i18n/use-active-language";

export function generateStaticParams() {
  return languageCodes.map((locale) => ({ locale }));
}

export default async function LocalizedLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: LocalizedRouteParams;
}) {
  const locale = await requireRouteLanguage(params);
  return (
    <RoutedLanguageProvider initialLanguage={locale}>
      {children}
    </RoutedLanguageProvider>
  );
}
