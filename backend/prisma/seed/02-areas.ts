import { PrismaClient, Area } from '@prisma/client';

/**
 * 6 Areas: 3 districts in HCM + 3 districts in HN.
 * Satisfies acceptance criteria: ≥ 3 thành phố/khu vực.
 */
const AREAS = [
  // ── Hồ Chí Minh ──
  {
    code: 'hcm-q1',
    name: 'Quận 1',
    city: 'Hồ Chí Minh',
    district: 'Quận 1',
    ward: 'Bến Nghé',
  },
  {
    code: 'hcm-q3',
    name: 'Quận 3',
    city: 'Hồ Chí Minh',
    district: 'Quận 3',
    ward: 'Phường 5',
  },
  {
    code: 'hcm-q7',
    name: 'Quận 7',
    city: 'Hồ Chí Minh',
    district: 'Quận 7',
    ward: 'Tân Phú',
  },
  // ── Hà Nội ──
  {
    code: 'hn-hoankiem',
    name: 'Hoàn Kiếm',
    city: 'Hà Nội',
    district: 'Hoàn Kiếm',
    ward: 'Lương Ngọc Quyến',
  },
  {
    code: 'hn-tayho',
    name: 'Tây Hồ',
    city: 'Hà Nội',
    district: 'Tây Hồ',
    ward: 'Quảng An',
  },
  {
    code: 'hn-caugiay',
    name: 'Cầu Giấy',
    city: 'Hà Nội',
    district: 'Cầu Giấy',
    ward: 'Dịch Vọng Hậu',
  },
  // ── Đà Nẵng ──
  {
    code: 'dn-haichau',
    name: 'Hải Châu',
    city: 'Đà Nẵng',
    district: 'Hải Châu',
    ward: 'Thạch Thang',
  },
  {
    code: 'dn-sontra',
    name: 'Sơn Trà',
    city: 'Đà Nẵng',
    district: 'Sơn Trà',
    ward: 'An Hải Bắc',
  },
  // ── Hải Phòng ──
  {
    code: 'hp-hongbang',
    name: 'Hồng Bàng',
    city: 'Hải Phòng',
    district: 'Hồng Bàng',
    ward: 'Minh Khai',
  },
  {
    code: 'hp-ngoquyen',
    name: 'Ngô Quyền',
    city: 'Hải Phòng',
    district: 'Ngô Quyền',
    ward: 'Máy Tơ',
  },
];

export async function seedAreas(
  prisma: PrismaClient,
): Promise<Record<string, Area>> {
  console.log('  📍 Seeding areas...');
  const result: Record<string, Area> = {};

  for (const a of AREAS) {
    result[a.code] = await prisma.area.upsert({
      where: { code: a.code },
      update: {
        name: a.name,
        city: a.city,
        district: a.district,
        ward: a.ward,
        status: 'ACTIVE',
      },
      create: {
        code: a.code,
        name: a.name,
        city: a.city,
        district: a.district,
        ward: a.ward,
        status: 'ACTIVE',
      },
    });
  }

  console.log(`     ✓ ${Object.keys(result).length} areas (HCM/HN/DN/HP)`);
  return result;
}
