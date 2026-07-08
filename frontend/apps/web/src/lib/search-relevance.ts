export type SearchRelevanceFields = {
  primary: Array<string | number | null | undefined>;
  secondary?: Array<string | number | null | undefined>;
};

const normalizeSearchText = (value: string | number | null | undefined) =>
  String(value ?? "")
    .replace(/\u0111/g, "d")
    .replace(/\u0110/g, "D")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();

const tokens = (value: string) => value.split(/[\s\-–—_/.,;:()[\]{}]+/).filter(Boolean);

const fieldScore = (query: string, values: Array<string | number | null | undefined>) => {
  let best = Number.POSITIVE_INFINITY;

  values.forEach((value) => {
    const normalized = normalizeSearchText(value);
    if (!normalized) return;

    if (normalized === query) best = Math.min(best, 0);
    else if (normalized.startsWith(query)) best = Math.min(best, 1);
    else if (tokens(normalized).some((token) => token.startsWith(query))) best = Math.min(best, 2);
    else if (normalized.includes(query)) best = Math.min(best, 3);
  });

  return best;
};

export const searchRelevanceScore = (query: string, fields: SearchRelevanceFields) => {
  const normalizedQuery = normalizeSearchText(query);
  if (!normalizedQuery) return 0;

  const primaryScore = fieldScore(normalizedQuery, fields.primary);
  if (Number.isFinite(primaryScore)) return primaryScore;

  const secondaryScore = fieldScore(normalizedQuery, fields.secondary ?? []);
  if (Number.isFinite(secondaryScore)) return secondaryScore + 4;

  return Number.POSITIVE_INFINITY;
};

export function sortBySearchRelevance<T>(
  items: T[],
  query: string,
  getFields: (item: T) => SearchRelevanceFields,
) {
  const normalizedQuery = normalizeSearchText(query);
  if (!normalizedQuery) return items;

  return [...items].sort((left, right) => {
    const leftFields = getFields(left);
    const rightFields = getFields(right);
    const leftScore = searchRelevanceScore(normalizedQuery, leftFields);
    const rightScore = searchRelevanceScore(normalizedQuery, rightFields);

    const leftName = normalizeSearchText(leftFields.primary[0]);
    const rightName = normalizeSearchText(rightFields.primary[0]);
    const nameCompare = leftName.localeCompare(rightName, "vi");

    if (!Number.isFinite(leftScore) && !Number.isFinite(rightScore)) {
      return nameCompare || 0;
    }

    if (!Number.isFinite(leftScore)) return 1;
    if (!Number.isFinite(rightScore)) return -1;
    if (leftScore !== rightScore) return leftScore - rightScore;

    return nameCompare || 0;
  });
}

export { normalizeSearchText };
