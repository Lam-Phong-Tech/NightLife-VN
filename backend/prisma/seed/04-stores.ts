import { PrismaClient, Store, User, Area, PartnerAccount } from '@prisma/client';

// ── Schedule templates ──────────────────────────────────────────────
const NIGHT = { open: '19:00', close: '02:00' };
const NIGHT_WEEKEND = { open: '19:00', close: '04:00' };
const KTV = { open: '18:00', close: '03:00' };
const KTV_WEEKEND = { open: '18:00', close: '04:00' };
const RESTAURANT = { open: '11:00', close: '23:00' };

function nightSchedule() {
  return {
    monday: NIGHT, tuesday: NIGHT, wednesday: NIGHT, thursday: NIGHT,
    friday: NIGHT_WEEKEND, saturday: NIGHT_WEEKEND,
    sunday: { open: '20:00', close: '01:00' },
  };
}
function ktvSchedule() {
  return {
    monday: KTV, tuesday: KTV, wednesday: KTV, thursday: KTV,
    friday: KTV_WEEKEND, saturday: KTV_WEEKEND,
    sunday: { open: '18:00', close: '02:00' },
  };
}
function restaurantSchedule() {
  return {
    monday: RESTAURANT, tuesday: RESTAURANT, wednesday: RESTAURANT,
    thursday: RESTAURANT, friday: RESTAURANT, saturday: RESTAURANT,
    sunday: RESTAURANT,
  };
}

function defaultHolidaySchedule() {
  return {
    note: 'Holiday hours are confirmed by the store before each booking.',
    specialClosures: [],
  };
}

// ── Store definitions ───────────────────────────────────────────────
interface StoreSeed {
  slug: string;
  name: string;
  category:
    | 'BAR'
    | 'CLUB'
    | 'LOUNGE'
    | 'GIRLS_BAR'
    | 'KARAOKE'
    | 'MASSAGE_SPA'
    | 'RESTAURANT'
    | 'CASINO';
  description: string;
  address: string;
  city: string;
  district: string;
  areaCode: string;
  partnerKey: string;
  phone: string;
  latitude: number;
  longitude: number;
  mapUrl: string;
  openingHours: Record<string, { open: string; close: string }>;
  holidaySchedule?: ReturnType<typeof defaultHolidaySchedule>;
}

const STORES: StoreSeed[] = [
  // ═══════════════ HỒ CHÍ MINH (5 stores) ═══════════════
  {
    slug: 'moonlight-bar',
    name: 'ムーンライト・バー — Moonlight Bar',
    category: 'BAR',
    description:
      '🇯🇵 ホーチミン1区の中心に位置する洗練されたバー。厳選されたクラフトカクテルと落ち着いたジャズの雰囲気をお楽しみください。日本語対応スタッフ常駐。\n\n' +
      '🇬🇧 A sophisticated bar in the heart of District 1, HCMC. Enjoy curated craft cocktails and a refined jazz atmosphere. Japanese-speaking staff available.\n\n' +
      '🇻🇳 Quán bar tinh tế tọa lạc tại trung tâm Quận 1, TP.HCM. Thưởng thức cocktail thủ công tuyển chọn trong không gian jazz sang trọng. Có nhân viên nói tiếng Nhật.',
    address: '45 Đồng Khởi, Bến Nghé, Quận 1, TP.HCM',
    city: 'Hồ Chí Minh',
    district: 'Quận 1',
    areaCode: 'hcm-q1',
    partnerKey: 'partner1',
    phone: '+84283456001',
    latitude: 10.7769,
    longitude: 106.7009,
    mapUrl: 'https://maps.google.com/?q=10.7769,106.7009',
    openingHours: nightSchedule(),
  },
  {
    slug: 'velvet-club',
    name: 'ベルベット・クラブ — Velvet Club',
    category: 'CLUB',
    description:
      '🇯🇵 サイゴン最大級のクラブ。最新のEDM、世界クラスのDJ、VIPテーブル完備。毎週金曜はレディースナイト。\n\n' +
      "🇬🇧 One of Saigon's largest clubs. Cutting-edge EDM, world-class DJs, full VIP table service. Ladies' night every Friday.\n\n" +
      "🇻🇳 Một trong những club lớn nhất Sài Gòn. EDM đỉnh cao, DJ đẳng cấp quốc tế, dịch vụ bàn VIP đầy đủ. Ladies' Night mỗi thứ Sáu.",
    address: '22 Nguyễn Huệ, Bến Nghé, Quận 1, TP.HCM',
    city: 'Hồ Chí Minh',
    district: 'Quận 1',
    areaCode: 'hcm-q1',
    partnerKey: 'partner1',
    phone: '+84283456002',
    latitude: 10.774,
    longitude: 106.704,
    mapUrl: 'https://maps.google.com/?q=10.774,106.704',
    openingHours: nightSchedule(),
  },
  {
    slug: 'sakura-lounge',
    name: 'サクラ・ラウンジ — Sakura Lounge',
    category: 'GIRLS_BAR',
    description:
      '🇯🇵 日本式のおもてなしとベトナムの活気が融合したプレミアムラウンジ。個室VIPルーム、日本酒と焼酎の豊富なセレクション。\n\n' +
      '🇬🇧 A premium lounge blending Japanese hospitality with Vietnamese vibrancy. Private VIP rooms, extensive sake and shochu selection.\n\n' +
      '🇻🇳 Lounge cao cấp kết hợp sự hiếu khách Nhật Bản với sự sôi động Việt Nam. Phòng VIP riêng tư, bộ sưu tập sake và shochu phong phú.',
    address: '123 Võ Văn Tần, Phường 5, Quận 3, TP.HCM',
    city: 'Hồ Chí Minh',
    district: 'Quận 3',
    areaCode: 'hcm-q3',
    partnerKey: 'partner1',
    phone: '+84283456003',
    latitude: 10.7802,
    longitude: 106.6895,
    mapUrl: 'https://maps.google.com/?q=10.7802,106.6895',
    openingHours: nightSchedule(),
  },
  {
    slug: 'golden-voice-ktv',
    name: 'ゴールデンボイスKTV — Golden Voice KTV',
    category: 'KARAOKE',
    description:
      '🇯🇵 最新の音響設備を備えたプレミアムKTV。日本語の曲数10,000曲以上。VIPルームからスタンダードまで多様な部屋タイプ。\n\n' +
      '🇬🇧 Premium KTV with state-of-the-art audio equipment. Over 10,000 Japanese songs. Room types from VIP suites to standard.\n\n' +
      '🇻🇳 KTV cao cấp với hệ thống âm thanh hiện đại nhất. Hơn 10.000 bài hát tiếng Nhật. Đa dạng loại phòng từ VIP đến Standard.',
    address: '67 Nguyễn Thị Thập, Tân Phú, Quận 7, TP.HCM',
    city: 'Hồ Chí Minh',
    district: 'Quận 7',
    areaCode: 'hcm-q7',
    partnerKey: 'partner1',
    phone: '+84283456004',
    latitude: 10.7385,
    longitude: 106.7219,
    mapUrl: 'https://maps.google.com/?q=10.7385,106.7219',
    openingHours: ktvSchedule(),
  },
  {
    slug: 'hanami-dining',
    name: '花見ダイニング — Hanami Dining',
    category: 'RESTAURANT',
    description:
      '🇯🇵 花見をコンセプトにした和洋折衷レストラン。季節の食材を使った創作料理と厳選された日本酒。接待にも最適。\n\n' +
      '🇬🇧 A Japanese-Western fusion restaurant inspired by hanami. Creative cuisine with seasonal ingredients and curated sake. Perfect for business entertaining.\n\n' +
      '🇻🇳 Nhà hàng kết hợp Nhật-Âu lấy cảm hứng từ hanami. Ẩm thực sáng tạo từ nguyên liệu theo mùa và sake tuyển chọn. Lý tưởng cho tiếp khách doanh nghiệp.',
    address: '89 Nam Kỳ Khởi Nghĩa, Phường 6, Quận 3, TP.HCM',
    city: 'Hồ Chí Minh',
    district: 'Quận 3',
    areaCode: 'hcm-q3',
    partnerKey: 'partner1',
    phone: '+84283456005',
    latitude: 10.7835,
    longitude: 106.692,
    mapUrl: 'https://maps.google.com/?q=10.7835,106.692',
    openingHours: restaurantSchedule(),
  },
  {
    slug: 'lotus-massage-spa',
    name: 'Lotus Massage Spa',
    category: 'MASSAGE_SPA',
    description:
      'Late-night massage spa in District 3 with quiet private rooms, sauna, and wellness packages for after-party recovery.\n\n' +
      'Massage spa Quan 3, co phong rieng yen tinh, xong hoi va goi thu gian sau buoi toi.',
    address: '12 Nguyen Dinh Chieu, Quan 3, TP.HCM',
    city: 'Há»“ ChÃ­ Minh',
    district: 'Quáº­n 3',
    areaCode: 'hcm-q3',
    partnerKey: 'partner1',
    phone: '+84283456015',
    latitude: 10.7829,
    longitude: 106.691,
    mapUrl: 'https://maps.google.com/?q=10.7829,106.691',
    openingHours: restaurantSchedule(),
  },

  // ═══════════════ HÀ NỘI (5 stores) ═══════════════
  {
    slug: 'crimson-bar',
    name: 'クリムゾン・バー — Crimson Bar',
    category: 'BAR',
    description:
      "🇯🇵 ハノイ旧市街に佇むシックなバー。ベトナム産クラフトビールと創作カクテル。週末はライブジャズ演奏。\n\n" +
      "🇬🇧 A chic bar nestled in Hanoi's Old Quarter. Vietnamese craft beers and creative cocktails. Live jazz on weekends.\n\n" +
      '🇻🇳 Quán bar sang trọng nằm trong phố cổ Hà Nội. Bia thủ công Việt Nam và cocktail sáng tạo. Nhạc jazz trực tiếp cuối tuần.',
    address: '15 Tạ Hiện, Lương Ngọc Quyến, Hoàn Kiếm, Hà Nội',
    city: 'Hà Nội',
    district: 'Hoàn Kiếm',
    areaCode: 'hn-hoankiem',
    partnerKey: 'partner2',
    phone: '+84243456006',
    latitude: 21.034,
    longitude: 105.852,
    mapUrl: 'https://maps.google.com/?q=21.034,105.852',
    openingHours: nightSchedule(),
  },
  {
    slug: 'neon-club',
    name: 'ネオン・クラブ — Neon Club',
    category: 'CLUB',
    description:
      "🇯🇵 西湖畔の最新鋭クラブ。ネオンライトとレーザーが彩る空間で、アジア最高峰のDJが毎週プレイ。\n\n" +
      "🇬🇧 A cutting-edge club by West Lake. Space illuminated by neon lights and lasers, with Asia's top DJs spinning weekly.\n\n" +
      '🇻🇳 Club hiện đại bên Hồ Tây. Không gian rực rỡ đèn neon và laser, với các DJ hàng đầu châu Á biểu diễn hàng tuần.',
    address: '200 Nghi Tàm, Quảng An, Tây Hồ, Hà Nội',
    city: 'Hà Nội',
    district: 'Tây Hồ',
    areaCode: 'hn-tayho',
    partnerKey: 'partner2',
    phone: '+84243456007',
    latitude: 21.063,
    longitude: 105.822,
    mapUrl: 'https://maps.google.com/?q=21.063,105.822',
    openingHours: nightSchedule(),
  },
  {
    slug: 'jade-lounge',
    name: 'ジェイド・ラウンジ — Jade Lounge',
    category: 'CASINO',
    description:
      '🇯🇵 翡翠をテーマにした高級ラウンジ。ホアンキエム湖を一望するテラス席、プレミアムウイスキーバー、完全個室あり。\n\n' +
      '🇬🇧 A jade-themed luxury lounge. Terrace seating overlooking Hoàn Kiếm Lake, premium whisky bar, fully private rooms available.\n\n' +
      '🇻🇳 Lounge cao cấp chủ đề ngọc bích. Chỗ ngồi sân thượng nhìn ra Hồ Hoàn Kiếm, bar whisky premium, phòng riêng hoàn toàn.',
    address: '88 Lý Thường Kiệt, Trần Hưng Đạo, Hoàn Kiếm, Hà Nội',
    city: 'Hà Nội',
    district: 'Hoàn Kiếm',
    areaCode: 'hn-hoankiem',
    partnerKey: 'partner2',
    phone: '+84243456008',
    latitude: 21.0245,
    longitude: 105.8485,
    mapUrl: 'https://maps.google.com/?q=21.0245,105.8485',
    openingHours: nightSchedule(),
  },
  {
    slug: 'star-ktv',
    name: 'スターKTV — Star KTV',
    category: 'KARAOKE',
    description:
      '🇯🇵 5つ星のKTV体験。最新DAMシステム、プロ仕様の照明、日本語スタッフがお出迎え。接待・宴会にも対応。\n\n' +
      '🇬🇧 Five-star KTV experience. Latest DAM system, professional lighting, Japanese-speaking staff welcome you. Suitable for business entertainment.\n\n' +
      '🇻🇳 Trải nghiệm KTV 5 sao. Hệ thống DAM mới nhất, ánh sáng chuyên nghiệp, nhân viên nói tiếng Nhật đón tiếp. Phù hợp tiếp khách doanh nghiệp.',
    address: '156 Xuân Thủy, Dịch Vọng Hậu, Cầu Giấy, Hà Nội',
    city: 'Hà Nội',
    district: 'Cầu Giấy',
    areaCode: 'hn-caugiay',
    partnerKey: 'partner2',
    phone: '+84243456009',
    latitude: 21.038,
    longitude: 105.783,
    mapUrl: 'https://maps.google.com/?q=21.038,105.783',
    openingHours: ktvSchedule(),
  },
  {
    slug: 'tokyo-kitchen',
    name: '東京キッチン — Tokyo Kitchen',
    category: 'RESTAURANT',
    description:
      '🇯🇵 本格的な日本料理を提供する東京キッチン。寿司、刺身、天ぷら、うなぎ。個室で静かなお食事をお楽しみください。\n\n' +
      '🇬🇧 Tokyo Kitchen serves authentic Japanese cuisine. Sushi, sashimi, tempura, unagi. Enjoy a quiet dining experience in private rooms.\n\n' +
      '🇻🇳 Tokyo Kitchen phục vụ ẩm thực Nhật Bản chính thống. Sushi, sashimi, tempura, unagi. Tận hưởng bữa ăn yên tĩnh trong phòng riêng.',
    address: '50 Xuân Diệu, Quảng An, Tây Hồ, Hà Nội',
    city: 'Hà Nội',
    district: 'Tây Hồ',
    areaCode: 'hn-tayho',
    partnerKey: 'partner2',
    phone: '+84243456010',
    latitude: 21.067,
    longitude: 105.825,
    mapUrl: 'https://maps.google.com/?q=21.067,105.825',
    openingHours: restaurantSchedule(),
  },

  // ═══════════════ ĐÀ NẴNG (2 stores) ═══════════════
  {
    slug: 'dragon-rooftop-da-nang',
    name: 'Dragon Rooftop Club',
    category: 'CLUB',
    description:
      'Rooftop club near the Han River with EDM nights, VIP tables, and late-night bottle service.\n\n' +
      'Club rooftop bên sông Hàn, phù hợp nhóm bạn, sinh nhật và bàn VIP cuối tuần.',
    address: '36 Bạch Đằng, Hải Châu, Đà Nẵng',
    city: 'Đà Nẵng',
    district: 'Hải Châu',
    areaCode: 'dn-haichau',
    partnerKey: 'partner1',
    phone: '+842363456011',
    latitude: 16.0678,
    longitude: 108.2208,
    mapUrl: 'https://maps.google.com/?q=16.0678,108.2208',
    openingHours: nightSchedule(),
  },
  {
    slug: 'son-tra-lounge',
    name: 'Sơn Trà Lounge',
    category: 'LOUNGE',
    description:
      'Premium lounge close to My Khe and Son Tra with cocktails, private rooms, and sea-breeze terrace seating.\n\n' +
      'Lounge cao cấp khu Sơn Trà, có cocktail, phòng riêng và khu ngồi ngoài trời.',
    address: '88 Võ Nguyên Giáp, Sơn Trà, Đà Nẵng',
    city: 'Đà Nẵng',
    district: 'Sơn Trà',
    areaCode: 'dn-sontra',
    partnerKey: 'partner1',
    phone: '+842363456012',
    latitude: 16.0811,
    longitude: 108.2445,
    mapUrl: 'https://maps.google.com/?q=16.0811,108.2445',
    openingHours: nightSchedule(),
  },

  // ═══════════════ HẢI PHÒNG (2 stores) ═══════════════
  {
    slug: 'harbor-ktv-hai-phong',
    name: 'Harbor KTV Hải Phòng',
    category: 'KARAOKE',
    description:
      'Private-room KTV near the old port area with Japanese, Korean, and Vietnamese song catalogs.\n\n' +
      'Karaoke phòng riêng khu trung tâm Hải Phòng, phù hợp tiếp khách và nhóm đông.',
    address: '18 Điện Biên Phủ, Hồng Bàng, Hải Phòng',
    city: 'Hải Phòng',
    district: 'Hồng Bàng',
    areaCode: 'hp-hongbang',
    partnerKey: 'partner2',
    phone: '+842253456013',
    latitude: 20.8644,
    longitude: 106.6838,
    mapUrl: 'https://maps.google.com/?q=20.8644,106.6838',
    openingHours: ktvSchedule(),
  },
  {
    slug: 'opera-spa-hai-phong',
    name: 'Opera Spa Hải Phòng',
    category: 'MASSAGE_SPA',
    description:
      'Late-night wellness spa near the Opera House with massage, sauna, and premium quiet rooms.\n\n' +
      'Spa mở muộn gần Nhà hát Lớn, có massage, xông hơi và phòng riêng cao cấp.',
    address: '12 Trần Phú, Ngô Quyền, Hải Phòng',
    city: 'Hải Phòng',
    district: 'Ngô Quyền',
    areaCode: 'hp-ngoquyen',
    partnerKey: 'partner2',
    phone: '+842253456014',
    latitude: 20.856,
    longitude: 106.6881,
    mapUrl: 'https://maps.google.com/?q=20.856,106.6881',
    openingHours: restaurantSchedule(),
  },
];

export async function seedStores(
  prisma: PrismaClient,
  users: Record<string, User>,
  areas: Record<string, Area>,
  partners: Record<string, PartnerAccount>,
): Promise<Record<string, Store>> {
  console.log('  🏪 Seeding stores...');
  const result: Record<string, Store> = {};

  for (const s of STORES) {
    const ownerId = users[s.partnerKey]?.id ?? null;
    const partnerAccountId = partners[s.partnerKey]?.id ?? null;
    const areaId = areas[s.areaCode]?.id ?? null;

    result[s.slug] = await prisma.store.upsert({
      where: { slug: s.slug },
      update: {
        name: s.name,
        category: s.category,
        description: s.description,
        address: s.address,
        city: s.city,
        district: s.district,
        phone: s.phone,
        latitude: s.latitude,
        longitude: s.longitude,
        openingHours: s.openingHours,
        holidaySchedule: s.holidaySchedule ?? defaultHolidaySchedule(),
        mapUrl: s.mapUrl,
        status: 'ACTIVE',
        ownerId,
        partnerAccountId,
        areaId,
      },
      create: {
        slug: s.slug,
        name: s.name,
        category: s.category,
        description: s.description,
        address: s.address,
        city: s.city,
        district: s.district,
        phone: s.phone,
        latitude: s.latitude,
        longitude: s.longitude,
        openingHours: s.openingHours,
        holidaySchedule: s.holidaySchedule ?? defaultHolidaySchedule(),
        mapUrl: s.mapUrl,
        status: 'ACTIVE',
        ownerId,
        partnerAccountId,
        areaId,
      },
    });
  }

  console.log(`     ✓ ${Object.keys(result).length} stores (P0 taxonomy + DN/HP later-phase seeds)`);
  return result;
}
