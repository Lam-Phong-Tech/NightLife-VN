const UNKNOWN_PRICE_TIER = "Liên hệ";

export function priceTierFromVnd(amountVnd?: number | null) {
  if (!amountVnd || !Number.isFinite(amountVnd) || amountVnd <= 0) {
    return UNKNOWN_PRICE_TIER;
  }

  if (amountVnd < 1_000_000) return "$$";
  if (amountVnd < 2_000_000) return "$$$";
  return "$$$$";
}

export function parseVndAmount(value?: string | number | null) {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : null;
  }

  const input = value?.trim().toLowerCase();
  if (!input) return null;

  const groupedMatch = input.match(/\d{1,3}(?:[.,]\d{3})+/);
  if (groupedMatch) {
    return Number(groupedMatch[0].replace(/[.,]/g, ""));
  }

  const numberMatch = input.match(/\d+(?:[.,]\d+)?/);
  if (!numberMatch) return null;

  const amount = Number(numberMatch[0].replace(",", "."));
  if (!Number.isFinite(amount)) return null;

  if (/(k|nghìn|ngan)/i.test(input)) {
    return amount * 1_000;
  }

  if (/(tr|triệu|trieu)/i.test(input)) {
    return amount * 1_000_000;
  }

  return amount;
}

export function formatPriceTier(value?: string | number | null) {
  return priceTierFromVnd(parseVndAmount(value));
}

export function formatPriceTierRange(
  values: Array<number | null | undefined>,
  fallback?: number | null,
) {
  const validValues = values.filter(
    (value): value is number => typeof value === "number" && Number.isFinite(value) && value > 0,
  );

  if (!validValues.length) {
    return priceTierFromVnd(fallback);
  }

  const minTier = priceTierFromVnd(Math.min(...validValues));
  const maxTier = priceTierFromVnd(Math.max(...validValues));

  return minTier === maxTier ? minTier : `${minTier} - ${maxTier}`;
}
