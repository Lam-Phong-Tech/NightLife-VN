import { PrismaClient, Store, User } from '@prisma/client';

/**
 * 10 CommissionConfig — 1 per store.
 *
 * Per spec BIL-09: Commission cấu hình theo từng quán / thỏa thuận riêng.
 * Per spec baseline: Hoa hồng = bill GỐC × (% hoa hồng − % giảm giá cho khách).
 * Point rate: 1,000,000₫ = 10 điểm → stored as 0.0100 (Decimal(10,4) scale).
 */

const COMMISSION_RATES: Record<string, { rate: number; note: string }> = {
  'moonlight-bar':    { rate: 20, note: 'Standard bar commission' },
  'velvet-club':      { rate: 25, note: 'Premium club — higher foot traffic' },
  'sakura-lounge':    { rate: 22, note: 'Premium lounge with private rooms' },
  'golden-voice-ktv': { rate: 18, note: 'KTV — lower margin, higher volume' },
  'hanami-dining':    { rate: 15, note: 'Restaurant — lowest commission tier' },
  'crimson-bar':      { rate: 20, note: 'Standard bar commission' },
  'neon-club':        { rate: 25, note: 'Premium club — higher foot traffic' },
  'jade-lounge':      { rate: 22, note: 'Premium lounge with lake view' },
  'star-ktv':         { rate: 18, note: 'KTV — lower margin, higher volume' },
  'tokyo-kitchen':    { rate: 15, note: 'Restaurant — lowest commission tier' },
};

/** Point earn rate: 10 points / 1,000,000 VND. Decimal(10,4) max 4 places. */
const POINT_EARN_RATE = 0.01; // interpreted as "per 1000 VND unit" by app logic

export async function seedCommissions(
  prisma: PrismaClient,
  stores: Record<string, Store>,
  users: Record<string, User>,
): Promise<void> {
  console.log('  💰 Seeding commission configs...');
  const adminId = users['admin']?.id ?? null;
  let count = 0;

  for (const [slug, config] of Object.entries(COMMISSION_RATES)) {
    const store = stores[slug];
    if (!store) continue;

    // Idempotent: check if an ACTIVE config already exists for this store
    const existing = await prisma.commissionConfig.findFirst({
      where: { storeId: store.id, status: 'ACTIVE' },
    });

    const data = {
      commissionType: 'PERCENT' as const,
      commissionValue: config.rate,
      pointEarnRate: POINT_EARN_RATE,
      status: 'ACTIVE' as const,
      ruleSnapshot: {
        description: config.note,
        formula: `Admin commission = Original bill × (${config.rate}% − customer discount %)`,
        pointRule: '1,000,000 VND (original) = 10 points, expires in 1 year',
      },
    };

    if (existing) {
      await prisma.commissionConfig.update({
        where: { id: existing.id },
        data,
      });
    } else {
      await prisma.commissionConfig.create({
        data: {
          storeId: store.id,
          createdById: adminId,
          ...data,
        },
      });
    }
    count++;
  }

  console.log(`     ✓ ${count} commission configs (rates: 15–25%, point rate: 10pts/1M VND)`);
}
