import { PrismaClient, Coupon, Store } from '@prisma/client';

/**
 * 5 Coupons mapping to the 3 membership tiers + 2 fixed-amount campaigns.
 * Multilingual names & descriptions (JP priority, EN/VN fallback).
 *
 * Per spec MEM-02: Guest 5% · Member 8% · VIP 10%.
 * Per spec MEM-03: Guest 24h · Member 7 days.
 */
interface CouponSeed {
  code: string;
  name: string;
  description: string;
  discountType: 'PERCENT' | 'FIXED_AMOUNT';
  discountValue: number;
  maxDiscountVnd?: number;
  minSpendVnd?: number;
  usageLimit: number;
  storeSlug: string;
}

const COUPONS: CouponSeed[] = [
  {
    code: 'GUEST5',
    name: 'ゲスト割引 5% — Guest Discount 5%',
    description:
      '🇯🇵 ゲスト向け5%割引。24時間有効。初めてのお客様も気軽にご利用ください。\n' +
      '🇬🇧 5% discount for guests. Valid for 24 hours. First-time visitors welcome.\n' +
      '🇻🇳 Giảm 5% cho khách. Hiệu lực 24 giờ. Chào mừng khách lần đầu.',
    discountType: 'PERCENT',
    discountValue: 5,
    maxDiscountVnd: 500000,
    usageLimit: 100,
    storeSlug: 'moonlight-bar',
  },
  {
    code: 'MEMBER8',
    name: 'メンバー割引 8% — Member Discount 8%',
    description:
      '🇯🇵 メンバー向け8%割引。7日間有効。メンバーシップ特典をお楽しみください。\n' +
      '🇬🇧 8% discount for members. Valid for 7 days. Enjoy your membership benefits.\n' +
      '🇻🇳 Giảm 8% cho thành viên. Hiệu lực 7 ngày. Tận hưởng quyền lợi thành viên.',
    discountType: 'PERCENT',
    discountValue: 8,
    maxDiscountVnd: 800000,
    usageLimit: 200,
    storeSlug: 'velvet-club',
  },
  {
    code: 'VIP10',
    name: 'VIP割引 10% — VIP Discount 10%',
    description:
      '🇯🇵 VIP向け10%割引。7日間有効。VIPメンバーだけの特別割引です。\n' +
      '🇬🇧 10% discount for VIP members. Valid for 7 days. Exclusive VIP benefit.\n' +
      '🇻🇳 Giảm 10% cho VIP. Hiệu lực 7 ngày. Ưu đãi đặc biệt dành riêng cho VIP.',
    discountType: 'PERCENT',
    discountValue: 10,
    maxDiscountVnd: 1000000,
    usageLimit: 50,
    storeSlug: 'sakura-lounge',
  },
  {
    code: 'WELCOME100K',
    name: 'ウェルカム 100K — Welcome 100K',
    description:
      '🇯🇵 初回来店で100,000₫割引！最低利用金額500,000₫以上。\n' +
      '🇬🇧 100,000₫ off on your first visit! Minimum spend 500,000₫.\n' +
      '🇻🇳 Giảm 100.000₫ cho lần đầu đến quán! Chi tiêu tối thiểu 500.000₫.',
    discountType: 'FIXED_AMOUNT',
    discountValue: 100000,
    minSpendVnd: 500000,
    usageLimit: 150,
    storeSlug: 'golden-voice-ktv',
  },
  {
    code: 'SPECIAL200K',
    name: 'スペシャル 200K — Special 200K',
    description:
      '🇯🇵 特別キャンペーン！200,000₫割引。最低利用金額1,000,000₫以上。\n' +
      '🇬🇧 Special campaign! 200,000₫ off. Minimum spend 1,000,000₫.\n' +
      '🇻🇳 Chiến dịch đặc biệt! Giảm 200.000₫. Chi tiêu tối thiểu 1.000.000₫.',
    discountType: 'FIXED_AMOUNT',
    discountValue: 200000,
    minSpendVnd: 1000000,
    usageLimit: 80,
    storeSlug: 'crimson-bar',
  },
];

export async function seedCoupons(
  prisma: PrismaClient,
  stores: Record<string, Store>,
): Promise<Record<string, Coupon>> {
  console.log('  🎫 Seeding coupons...');
  const result: Record<string, Coupon> = {};

  const now = new Date();
  const thirtyDaysLater = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

  for (const c of COUPONS) {
    const storeId = stores[c.storeSlug]?.id;
    if (!storeId) {
      console.warn(`     ⚠ Store not found for coupon ${c.code}: ${c.storeSlug}`);
      continue;
    }

    result[c.code] = await prisma.coupon.upsert({
      where: { code: c.code },
      update: {
        name: c.name,
        description: c.description,
        discountType: c.discountType,
        discountValue: c.discountValue,
        maxDiscountVnd: c.maxDiscountVnd ?? null,
        minSpendVnd: c.minSpendVnd ?? null,
        usageLimit: c.usageLimit,
        status: 'ACTIVE',
      },
      create: {
        storeId,
        code: c.code,
        name: c.name,
        description: c.description,
        discountType: c.discountType,
        discountValue: c.discountValue,
        maxDiscountVnd: c.maxDiscountVnd ?? null,
        minSpendVnd: c.minSpendVnd ?? null,
        usageLimit: c.usageLimit,
        startsAt: now,
        endsAt: thirtyDaysLater,
        status: 'ACTIVE',
      },
    });
  }

  console.log(`     ✓ ${Object.keys(result).length} coupons (3 PERCENT: 5%/8%/10% + 2 FIXED: 100K/200K)`);
  return result;
}
