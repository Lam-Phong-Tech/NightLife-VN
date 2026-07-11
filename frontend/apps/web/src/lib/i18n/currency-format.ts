import type { LanguageCode } from "./client-translations";

const currencyLocaleByLanguage: Record<LanguageCode, string> = {
  vi: "vi-VN",
  en: "en-US",
  ja: "ja-JP",
  ko: "ko-KR",
  zh: "zh-CN",
};

const normalizeMoney = (value?: number | null) =>
  typeof value === "number" && Number.isFinite(value) ? value : 0;

export function formatCurrencyByLanguage(
  value: number | null | undefined,
  language: LanguageCode = "vi",
  currency = "VND",
) {
  const locale = currencyLocaleByLanguage[language] ?? currencyLocaleByLanguage.vi;
  const currencyDisplay = language === "vi" ? "narrowSymbol" : "code";

  return new Intl.NumberFormat(locale, {
    currency,
    currencyDisplay,
    maximumFractionDigits: 0,
    minimumFractionDigits: 0,
    style: "currency",
  })
    .format(normalizeMoney(value))
    .replace(/\s+/g, " ")
    .trim();
}

export const formatVndByLanguage = (value: number | null | undefined, language: LanguageCode = "vi") =>
  formatCurrencyByLanguage(value, language, "VND");
