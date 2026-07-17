export type VietnamProvinceArea = {
  cityCode: string;
  areaCode: string;
  city: string;
  aliases: string[];
};

const vietnamProvinceArea = (
  cityCode: string,
  city: string,
  aliases: string[] = [],
): VietnamProvinceArea => ({
  cityCode,
  areaCode: `${cityCode}-tong-hop`,
  city,
  aliases,
});

export const VIETNAM_PROVINCE_AREAS: VietnamProvinceArea[] = [
  vietnamProvinceArea('hn', 'Hà Nội', ['Ha Noi', 'Hanoi', 'HN']),
  vietnamProvinceArea('hcm', 'Hồ Chí Minh', [
    'Ho Chi Minh',
    'Ho Chi Minh City',
    'TP.HCM',
    'TP HCM',
    'Thanh pho Ho Chi Minh',
    'Thành phố Hồ Chí Minh',
    'HCM',
    'Sai Gon',
    'Sài Gòn',
    'Saigon',
    'Ba Ria Vung Tau',
    'Bà Rịa Vũng Tàu',
    'Binh Duong',
    'Bình Dương',
  ]),
];

export const VIETNAM_CITY_CODES = VIETNAM_PROVINCE_AREAS.map(
  (area) => area.cityCode,
);

export const VIETNAM_CITY_FILTER_CODES = ['all', ...VIETNAM_CITY_CODES];

export function normalizeVietnamPlaceToken(value?: string | null) {
  return (
    value
      ?.trim()
      .toLowerCase()
      .normalize('NFD')
      .replace(/[đ]/g, 'd')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[_\s.]+/g, '-')
      .replace(/[^a-z0-9-]/g, '')
      .replace(/-+/g, '-')
      .replace(/(^-|-$)/g, '') ?? ''
  );
}

const aliasEntries = new Map<string, VietnamProvinceArea>();

for (const area of VIETNAM_PROVINCE_AREAS) {
  const aliases = [
    area.cityCode,
    area.areaCode,
    area.city,
    `Tỉnh ${area.city}`,
    `Tinh ${area.city}`,
    `Thành phố ${area.city}`,
    `Thanh pho ${area.city}`,
    ...area.aliases,
    ...area.aliases.flatMap((alias) => [
      `Tỉnh ${alias}`,
      `Tinh ${alias}`,
      `Thành phố ${alias}`,
      `Thanh pho ${alias}`,
    ]),
  ];

  for (const alias of aliases) {
    aliasEntries.set(normalizeVietnamPlaceToken(alias), area);
  }
}

export const VIETNAM_CITY_ALIASES: Record<string, string> = Object.fromEntries(
  Array.from(aliasEntries.entries()).map(([alias, area]) => [
    alias,
    area.cityCode,
  ]),
);

export function resolveVietnamProvinceArea(value?: string | null) {
  const token = normalizeVietnamPlaceToken(value);
  return token ? aliasEntries.get(token) : undefined;
}

export function vietnamAreaCityLookupNames(value?: string | null) {
  const area = resolveVietnamProvinceArea(value);
  if (!area) {
    return value ? [value] : [];
  }

  return Array.from(
    new Set(
      [area.city, ...area.aliases, value].filter((name): name is string =>
        Boolean(name),
      ),
    ),
  );
}
