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
  vietnamProvinceArea('quangninh', 'Quảng Ninh', [
    'Quang Ninh',
    'Hạ Long',
    'Ha Long',
  ]),
  vietnamProvinceArea('sonla', 'Sơn La', ['Son La']),
  vietnamProvinceArea('thanhhoa', 'Thanh Hóa', ['Thanh Hoa']),
  vietnamProvinceArea('hn', 'Hà Nội', ['Ha Noi', 'Hanoi', 'HN']),
  vietnamProvinceArea('hue', 'Huế', [
    'Hue',
    'Thừa Thiên Huế',
    'Thua Thien Hue',
  ]),
  vietnamProvinceArea('laocai', 'Lào Cai', [
    'Lao Cai',
    'Yên Bái',
    'Yen Bai',
  ]),
  vietnamProvinceArea('thainguyen', 'Thái Nguyên', [
    'Thai Nguyen',
    'Bắc Kạn',
    'Bac Kan',
  ]),
  vietnamProvinceArea('phutho', 'Phú Thọ', [
    'Phu Tho',
    'Vĩnh Phúc',
    'Vinh Phuc',
    'Hòa Bình',
    'Hoa Binh',
  ]),
  vietnamProvinceArea('bacninh', 'Bắc Ninh', [
    'Bac Ninh',
    'Bắc Giang',
    'Bac Giang',
  ]),
  vietnamProvinceArea('hungyen', 'Hưng Yên', [
    'Hung Yen',
    'Thái Bình',
    'Thai Binh',
  ]),
  vietnamProvinceArea('hp', 'Hải Phòng', [
    'Hai Phong',
    'Hải Dương',
    'Hai Duong',
  ]),
  vietnamProvinceArea('ninhbinh', 'Ninh Bình', [
    'Ninh Binh',
    'Hà Nam',
    'Ha Nam',
    'Nam Định',
    'Nam Dinh',
  ]),
  vietnamProvinceArea('quangtri', 'Quảng Trị', [
    'Quang Tri',
    'Quảng Bình',
    'Quang Binh',
  ]),
  vietnamProvinceArea('dn', 'Đà Nẵng', [
    'Da Nang',
    'Danang',
    'Quảng Nam',
    'Quang Nam',
    'Hội An',
    'Hoi An',
  ]),
  vietnamProvinceArea('quangngai', 'Quảng Ngãi', [
    'Quang Ngai',
    'Kon Tum',
  ]),
  vietnamProvinceArea('gialai', 'Gia Lai', [
    'Bình Định',
    'Binh Dinh',
  ]),
  vietnamProvinceArea('khanhhoa', 'Khánh Hòa', [
    'Khanh Hoa',
    'Ninh Thuận',
    'Ninh Thuan',
    'Nha Trang',
  ]),
  vietnamProvinceArea('lamdong', 'Lâm Đồng', [
    'Lam Dong',
    'Đắk Nông',
    'Dak Nong',
    'Bình Thuận',
    'Binh Thuan',
    'Đà Lạt',
    'Da Lat',
  ]),
  vietnamProvinceArea('daklak', 'Đắk Lắk', [
    'Dak Lak',
    'Đak Lak',
    'Phú Yên',
    'Phu Yen',
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
    'Bình Phước',
    'Binh Phuoc',
  ]),
  vietnamProvinceArea('tayninh', 'Tây Ninh', [
    'Tay Ninh',
    'Long An',
  ]),
  vietnamProvinceArea('cantho', 'Cần Thơ', [
    'Can Tho',
    'Sóc Trăng',
    'Soc Trang',
    'Hậu Giang',
    'Hau Giang',
  ]),
  vietnamProvinceArea('vinhlong', 'Vĩnh Long', [
    'Vinh Long',
    'Bến Tre',
    'Ben Tre',
    'Trà Vinh',
    'Tra Vinh',
  ]),
  vietnamProvinceArea('dongthap', 'Đồng Tháp', [
    'Dong Thap',
    'Tiền Giang',
    'Tien Giang',
    'Mỹ Tho',
    'My Tho',
  ]),
  vietnamProvinceArea('camau', 'Cà Mau', [
    'Ca Mau',
    'Bạc Liêu',
    'Bac Lieu',
  ]),
  vietnamProvinceArea('angiang', 'An Giang', [
    'Kiên Giang',
    'Kien Giang',
    'Phú Quốc',
    'Phu Quoc',
  ]),
  vietnamProvinceArea('tuyenquang', 'Tuyên Quang', [
    'Tuyen Quang',
    'Hà Giang',
    'Ha Giang',
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
