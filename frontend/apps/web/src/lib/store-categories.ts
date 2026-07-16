const serviceOnlyBookingCategories = new Set([
  "MASSAGE",
  "MASSAGE_SPA",
  "NHA_HANG",
  "RESTAURANT",
  "SPA",
  "SPA_MASSAGE",
]);

export const normalizeStoreCategory = (category?: string | null) =>
  category
    ?.trim()
    .toUpperCase()
    .replace(/[\s-]+/g, "_") ?? "";

export const isServiceOnlyBookingCategory = (category?: string | null) =>
  serviceOnlyBookingCategories.has(normalizeStoreCategory(category));
