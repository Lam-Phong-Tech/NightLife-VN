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
  vietnamProvinceArea('caobang', 'Cao Bằng', ['Cao Bang']),
  vietnamProvinceArea('dienbien', 'Điện Biên', ['Dien Bien']),
  vietnamProvinceArea('hatinh', 'Hà Tĩnh', ['Ha Tinh']),
  vietnamProvinceArea('laichau', 'Lai Châu', ['Lai Chau']),
  vietnamProvinceArea('langson', 'Lạng Sơn', ['Lang Son']),
  vietnamProvinceArea('nghean', 'Nghệ An', ['Nghe An']),
  vietnamProvinceArea('quangninh', 'Quảng Ninh', ['Quang Ninh', 'Ha Long']),
  vietnamProvinceArea('sonla', 'Sơn La', ['Son La']),
  vietnamProvinceArea('thanhhoa', 'Thanh Hóa', ['Thanh Hoa']),
  vietnamProvinceArea('hn', 'Hà Nội', ['Ha Noi', 'Hanoi', 'HN']),
  vietnamProvinceArea('hue', 'Huế', ['Hue', 'Thua Thien Hue']),
  vietnamProvinceArea('laocai', 'Lào Cai', ['Lao Cai', 'Yen Bai', 'Yên Bái']),
  vietnamProvinceArea('thainguyen', 'Thái Nguyên', [
    'Thai Nguyen',
    'Bac Kan',
    'Bắc Kạn',
  ]),
  vietnamProvinceArea('phutho', 'Phú Thọ', [
    'Phu Tho',
    'Vinh Phuc',
    'Vĩnh Phúc',
    'Hoa Binh',
    'Hòa Bình',
  ]),
  vietnamProvinceArea('bacninh', 'Bắc Ninh', [
    'Bac Ninh',
    'Bac Giang',
    'Bắc Giang',
  ]),
  vietnamProvinceArea('hungyen', 'Hưng Yên', [
    'Hung Yen',
    'Thai Binh',
    'Thái Bình',
  ]),
  vietnamProvinceArea('hp', 'Hải Phòng', [
    'Hai Phong',
    'Hai Duong',
    'Hải Dương',
  ]),
  vietnamProvinceArea('ninhbinh', 'Ninh Bình', [
    'Ninh Binh',
    'Ha Nam',
    'Hà Nam',
    'Nam Dinh',
    'Nam Định',
  ]),
  vietnamProvinceArea('quangtri', 'Quảng Trị', [
    'Quang Tri',
    'Quang Binh',
    'Quảng Bình',
  ]),
  vietnamProvinceArea('dn', 'Đà Nẵng', [
    'Da Nang',
    'Quang Nam',
    'Quảng Nam',
    'Hoi An',
    'Hội An',
  ]),
  vietnamProvinceArea('quangngai', 'Quảng Ngãi', ['Quang Ngai', 'Kon Tum']),
  vietnamProvinceArea('gialai', 'Gia Lai', [
    'Gia Lai',
    'Binh Dinh',
    'Bình Định',
  ]),
  vietnamProvinceArea('khanhhoa', 'Khánh Hòa', [
    'Khanh Hoa',
    'Ninh Thuan',
    'Ninh Thuận',
    'Nha Trang',
  ]),
  vietnamProvinceArea('lamdong', 'Lâm Đồng', [
    'Lam Dong',
    'Dak Nong',
    'Đắk Nông',
    'Binh Thuan',
    'Bình Thuận',
    'Da Lat',
    'Đà Lạt',
  ]),
  vietnamProvinceArea('daklak', 'Đắk Lắk', [
    'Dak Lak',
    'Đak Lak',
    'Phu Yen',
    'Phú Yên',
  ]),
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
  vietnamProvinceArea('dongnai', 'Đồng Nai', [
    'Dong Nai',
    'Binh Phuoc',
    'Bình Phước',
  ]),
  vietnamProvinceArea('tayninh', 'Tây Ninh', ['Tay Ninh', 'Long An']),
  vietnamProvinceArea('cantho', 'Cần Thơ', [
    'Can Tho',
    'Soc Trang',
    'Sóc Trăng',
    'Hau Giang',
    'Hậu Giang',
  ]),
  vietnamProvinceArea('vinhlong', 'Vĩnh Long', [
    'Vinh Long',
    'Ben Tre',
    'Bến Tre',
    'Tra Vinh',
    'Trà Vinh',
  ]),
  vietnamProvinceArea('dongthap', 'Đồng Tháp', [
    'Dong Thap',
    'Tien Giang',
    'Tiền Giang',
    'My Tho',
    'Mỹ Tho',
  ]),
  vietnamProvinceArea('camau', 'Cà Mau', ['Ca Mau', 'Bac Lieu', 'Bạc Liêu']),
  vietnamProvinceArea('angiang', 'An Giang', [
    'An Giang',
    'Kien Giang',
    'Kiên Giang',
    'Phu Quoc',
    'Phú Quốc',
  ]),
  vietnamProvinceArea('tuyenquang', 'Tuyên Quang', [
    'Tuyen Quang',
    'Ha Giang',
    'Hà Giang',
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
