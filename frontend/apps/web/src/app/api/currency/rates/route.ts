import type { DisplayCurrencyCode } from "@/lib/i18n/currency-format";

export const runtime = "nodejs";
export const revalidate = 3600;

type ExchangeRateApiResponse = {
  result?: string;
  base_code?: string;
  time_last_update_unix?: number;
  time_next_update_unix?: number;
  rates?: Record<string, number>;
};

const displayCurrencies: DisplayCurrencyCode[] = ["VND", "USD", "JPY", "KRW", "CNY"];

const fallbackRates: Record<DisplayCurrencyCode, number> = {
  VND: 1,
  USD: 0.000038,
  JPY: 0.0062,
  KRW: 0.057,
  CNY: 0.00026,
};

const providerUrl =
  process.env.NIGHTLIFE_CURRENCY_RATES_URL || "https://open.er-api.com/v6/latest/VND";

const unixToIso = (value?: number) =>
  typeof value === "number" && Number.isFinite(value) ? new Date(value * 1000).toISOString() : null;

const pickRates = (rates?: Record<string, number>): Record<DisplayCurrencyCode, number> => {
  const picked = { ...fallbackRates };

  for (const currency of displayCurrencies) {
    const rate = rates?.[currency];
    if (typeof rate === "number" && Number.isFinite(rate) && rate > 0) {
      picked[currency] = rate;
    }
  }

  return picked;
};

const responseHeaders = {
  "Cache-Control": "public, max-age=900, s-maxage=3600, stale-while-revalidate=86400",
};

export async function GET() {
  try {
    const response = await fetch(providerUrl, {
      headers: { accept: "application/json" },
      next: { revalidate: 3600 },
    });

    if (!response.ok) {
      throw new Error(`Currency provider returned ${response.status}`);
    }

    const payload = (await response.json()) as ExchangeRateApiResponse;
    if (payload.result && payload.result !== "success") {
      throw new Error(`Currency provider result ${payload.result}`);
    }

    return Response.json(
      {
        base: "VND",
        provider: "open.er-api.com",
        sourceUrl: "https://www.exchangerate-api.com",
        updatedAt: unixToIso(payload.time_last_update_unix) ?? new Date().toISOString(),
        nextUpdateAt: unixToIso(payload.time_next_update_unix),
        fallback: false,
        rates: pickRates(payload.rates),
      },
      { headers: responseHeaders },
    );
  } catch (error) {
    console.warn("Currency rates provider failed", error);

    return Response.json(
      {
        base: "VND",
        provider: "fallback",
        sourceUrl: null,
        updatedAt: new Date().toISOString(),
        nextUpdateAt: null,
        fallback: true,
        rates: fallbackRates,
      },
      { headers: responseHeaders },
    );
  }
}
