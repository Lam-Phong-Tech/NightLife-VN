import { PrismaClient, Area } from '@prisma/client';
import { VIETNAM_PROVINCE_AREAS } from '../../src/nightlife-data/vietnam-admin-units';

/**
 * Keep one "Tổng hợp" area for every current Vietnam province-level unit.
 * More granular nightlife districts stay below for cities that need richer filters.
 */
const GENERAL_AREAS = VIETNAM_PROVINCE_AREAS.map((area) => ({
  code: area.areaCode,
  name: 'Tổng hợp',
  city: area.city,
  district: 'Tổng hợp',
  ward: null,
}));

const DETAIL_AREAS = [
  // Hồ Chí Minh
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
  // Hà Nội
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

];

const AREAS = [...GENERAL_AREAS, ...DETAIL_AREAS];

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

  console.log(
    `     ✓ ${Object.keys(result).length} areas (34 province-level general + city detail seeds)`,
  );
  return result;
}
