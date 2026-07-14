"use client";

import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import {
  currencyForLanguage,
  formatVndByLanguage,
  type CurrencyRateMap,
  type DisplayCurrencyCode,
} from "@/lib/i18n/currency-format";
import { useActiveLanguage, type LanguageCode } from "@/lib/i18n/use-active-language";

type CurrencyRatesResponse = {
  base: "VND";
  provider: string;
  sourceUrl: string | null;
  updatedAt: string;
  nextUpdateAt: string | null;
  fallback: boolean;
  rates: CurrencyRateMap;
};

type CurrencyContextValue = {
  fallback: boolean;
  isLoading: boolean;
  provider: string;
  rates: CurrencyRateMap;
  sourceUrl: string | null;
  updatedAt: string | null;
};

const fallbackRates: CurrencyRateMap = {
  VND: 1,
  USD: 0.000038,
  JPY: 0.0062,
  KRW: 0.057,
  CNY: 0.00026,
};

const CurrencyContext = createContext<CurrencyContextValue>({
  fallback: true,
  isLoading: true,
  provider: "fallback",
  rates: fallbackRates,
  sourceUrl: null,
  updatedAt: null,
});

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<CurrencyContextValue>(() => ({
    fallback: true,
    isLoading: true,
    provider: "fallback",
    rates: fallbackRates,
    sourceUrl: null,
    updatedAt: null,
  }));

  useEffect(() => {
    let cancelled = false;

    fetch("/api/currency/rates", { headers: { accept: "application/json" } })
      .then((response) => {
        if (!response.ok) throw new Error(`Currency API returned ${response.status}`);
        return response.json() as Promise<CurrencyRatesResponse>;
      })
      .then((payload) => {
        if (cancelled) return;
        setState({
          fallback: payload.fallback,
          isLoading: false,
          provider: payload.provider,
          rates: { ...fallbackRates, ...payload.rates },
          sourceUrl: payload.sourceUrl,
          updatedAt: payload.updatedAt,
        });
      })
      .catch(() => {
        if (cancelled) return;
        setState((current) => ({ ...current, isLoading: false }));
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return <CurrencyContext.Provider value={state}>{children}</CurrencyContext.Provider>;
}

export function useCurrencyRates() {
  return useContext(CurrencyContext);
}

export function useMoneyFormatter(language?: LanguageCode) {
  const context = useCurrencyRates();
  const activeLanguage = useActiveLanguage();
  const resolvedLanguage = language ?? activeLanguage;
  const displayCurrency = currencyForLanguage(resolvedLanguage);

  return useMemo(
    () => ({
      ...context,
      displayCurrency,
      formatMoney: (value: number | null | undefined) =>
        formatVndByLanguage(value, resolvedLanguage, context.rates),
      formatDiscount: (value: number | null | undefined) =>
        `-${formatVndByLanguage(value, resolvedLanguage, context.rates)}`,
    }),
    [context, displayCurrency, resolvedLanguage],
  );
}

export type { DisplayCurrencyCode };
