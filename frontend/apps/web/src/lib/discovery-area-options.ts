import type { PublicArea } from "@/lib/api/discovery";

export type DiscoveryAreaOption = {
  value: string;
  label: string;
};

const fallbackAreaOptionsByCity: Record<string, DiscoveryAreaOption[]> = {
  hn: [
    { value: "Ba Đình", label: "Ba Đình" },
    { value: "Tây Hồ", label: "Tây Hồ" },
    { value: "Cầu Giấy", label: "Cầu Giấy" },
    { value: "Nam Từ Liêm", label: "Nam Từ Liêm" },
    { value: "Hoàn Kiếm", label: "Hoàn Kiếm" },
    { value: "Hai Bà Trưng", label: "Hai Bà Trưng" },
  ],
  hcm: [
    { value: "Quận 1", label: "Quận 1" },
    { value: "Quận 3", label: "Quận 3" },
    { value: "Quận 7", label: "Quận 7" },
    { value: "Thảo Điền", label: "Thảo Điền" },
    { value: "Bình Thạnh", label: "Bình Thạnh" },
    { value: "Phú Nhuận", label: "Phú Nhuận" },
  ],
};

export const getFallbackAreaOptions = (cityCode: string) =>
  cityCode
    ? fallbackAreaOptionsByCity[cityCode] ?? []
    : Object.values(fallbackAreaOptionsByCity).flat();

export const normalizeDiscoveryAreaKey = (value?: string | null) =>
  (value ?? "")
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const allowedAreaKeysByCity = Object.fromEntries(
  Object.entries(fallbackAreaOptionsByCity).map(([cityCode, options]) => [
    cityCode,
    new Set(options.map((option) => normalizeDiscoveryAreaKey(option.label))),
  ]),
) as Record<string, Set<string>>;

export const isAllowedAreaForCity = (cityCode: string, areaName?: string | null) => {
  const allowedKeys = allowedAreaKeysByCity[cityCode];
  if (!allowedKeys) return true;
  return allowedKeys.has(normalizeDiscoveryAreaKey(areaName));
};

export const isGenericDiscoveryArea = (area: PublicArea) => {
  const code = normalizeDiscoveryAreaKey(area.code);
  const name = normalizeDiscoveryAreaKey(area.name);
  const district = normalizeDiscoveryAreaKey(area.district);

  return (
    code.endsWith("-tong-hop") ||
    code.endsWith("-general") ||
    ["tong-hop", "general", "all"].includes(name) ||
    ["tong-hop", "general", "all"].includes(district)
  );
};
