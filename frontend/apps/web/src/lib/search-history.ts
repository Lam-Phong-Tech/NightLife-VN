const maxSearchHistoryItems = 6;

const normalizeSearchTerm = (value: string) => value.trim().replace(/\s+/g, " ");

export const readSearchHistory = (storageKey: string) => {
  if (typeof window === "undefined") return [];

  try {
    const stored = JSON.parse(window.localStorage.getItem(storageKey) ?? "[]");
    if (!Array.isArray(stored)) return [];

    return stored
      .filter((item): item is string => typeof item === "string")
      .map(normalizeSearchTerm)
      .filter(Boolean)
      .slice(0, maxSearchHistoryItems);
  } catch {
    return [];
  }
};

export const addSearchHistoryItem = (storageKey: string, value: string) => {
  const term = normalizeSearchTerm(value);
  const current = readSearchHistory(storageKey);
  const next = term
    ? [term, ...current.filter((item) => item.localeCompare(term, undefined, { sensitivity: "accent" }) !== 0)]
        .slice(0, maxSearchHistoryItems)
    : current;

  if (typeof window !== "undefined") {
    window.localStorage.setItem(storageKey, JSON.stringify(next));
  }

  return next;
};

export const clearSearchHistory = (storageKey: string) => {
  if (typeof window !== "undefined") {
    window.localStorage.removeItem(storageKey);
  }
};
