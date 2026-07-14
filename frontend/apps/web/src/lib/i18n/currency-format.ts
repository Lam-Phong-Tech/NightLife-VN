import type { LanguageCode } from "./client-translations";

export type DisplayCurrencyCode = "VND" | "USD" | "JPY" | "KRW" | "CNY";

export type CurrencyRateMap = Partial<Record<DisplayCurrencyCode, number>>;

const currencyLocaleByLanguage: Record<LanguageCode, string> = {
  vi: "vi-VN",
  en: "en-US",
  ja: "ja-JP",
  ko: "ko-KR",
  zh: "zh-CN",
};

export const displayCurrencyByLanguage: Record<LanguageCode, DisplayCurrencyCode> = {
  vi: "VND",
  en: "USD",
  ja: "JPY",
  ko: "KRW",
  zh: "CNY",
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

export function currencyForLanguage(language: LanguageCode = "vi") {
  return displayCurrencyByLanguage[language] ?? displayCurrencyByLanguage.vi;
}

export function convertVndToCurrency(
  value: number | null | undefined,
  currency: DisplayCurrencyCode,
  rates?: CurrencyRateMap | null,
) {
  const amount = normalizeMoney(value);
  if (currency === "VND") return amount;

  const rate = rates?.[currency];
  return typeof rate === "number" && Number.isFinite(rate) && rate > 0 ? amount * rate : amount;
}

export function formatVndByLanguage(
  value: number | null | undefined,
  language: LanguageCode = "vi",
  rates?: CurrencyRateMap | null,
) {
  const currency = currencyForLanguage(language);
  const convertedValue = convertVndToCurrency(value, currency, rates);

  return formatCurrencyByLanguage(convertedValue, language, currency);
}
