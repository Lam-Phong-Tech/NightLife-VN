import { PrismaClient, Store, User, Guest, AdminCoupon, Campaign, DiscountType, CouponStatus, CouponIssueStatus, CampaignStatus } from '@prisma/client';
import { seedUuid, seedHash, buildSeedCouponQr, seedDate } from './shared';

export type AdminCouponCampaignContext = {
  stores: Record<string, Store>;
  users: Record<string, User>;
  guests: Record<string, Guest>;
  now: Date;
};

interface AdminCouponSeed {
  key: string;
  code: string;
  name: string;
  discountType: DiscountType;
  discountValue: number;
  targetStores: string[];
  targetAudiences: string[];
  usageLimit?: number;
  usedCount: number;
  status: CouponStatus;
}

interface CampaignSeed {
  key: string;
  name: string;
  discountType: DiscountType;
  discountValue: number;
  targetStoreSlug?: string;
  status: CampaignStatus;
}

const ADMIN_COUPONS: AdminCouponSeed[] = [
  {
    key: 'admin-festive-50k',
    code: 'FESTIVE50K',
    name: 'Admin Festive 50K Discount',
    discountType: DiscountType.FIXED_AMOUNT,
    discountValue: 50000,
    targetStores: ['moonlight-bar', 'crimson-bar'],
    targetAudiences: ['ALL'],
    usageLimit: 100,
    usedCount: 1,
    status: CouponStatus.ACTIVE,
  },
  {
    key: 'admin-vip-15pct',
    code: 'VIP15PERCENT',
    name: 'Admin VIP 15% Off Global',
    discountType: DiscountType.PERCENT,
    discountValue: 15,
    targetStores: [], // Global
    targetAudiences: ['VIP'],
    usageLimit: 50,
    usedCount: 0,
    status: CouponStatus.ACTIVE,
  },
];

const CAMPAIGNS: CampaignSeed[] = [
  {
    key: 'summer-beer-fest',
    name: 'Summer Night Beer Fest',
    discountType: DiscountType.PERCENT,
    discountValue: 20,
    targetStoreSlug: 'crimson-bar',
    status: CampaignStatus.ACTIVE,
  },
  {
    key: 'global-lounge-discount',
    name: 'Global Premium Lounge Discount',
    discountType: DiscountType.FIXED_AMOUNT,
    discountValue: 150000,
    status: CampaignStatus.ACTIVE,
  },
  {
    key: 'autumn-ktv-promo',
    name: 'Autumn Karaoke Promotion',
    discountType: DiscountType.PERCENT,
    discountValue: 10,
    targetStoreSlug: 'golden-voice-ktv',
    status: CampaignStatus.DRAFT,
  },
];

export async function seedAdminCouponsAndCampaigns(
  prisma: PrismaClient,
  context: AdminCouponCampaignContext,
): Promise<{
  adminCoupons: Record<string, AdminCoupon>;
  campaigns: Record<string, Campaign>;
}> {
  console.log('  🎫 Seeding admin coupons & campaigns...');
  const { stores, users, guests, now } = context;

  const adminCouponsResult: Record<string, AdminCoupon> = {};
  const campaignsResult: Record<string, Campaign> = {};

  const thirtyDaysLater = seedDate(now, 30);

  // 1. Seed Admin Coupons
  for (const c of ADMIN_COUPONS) {
    const id = seedUuid(`admin-coupon:${c.key}`);
    const qrPayload = `https://nightlife.vn/admin-coupon/${c.code}?id=${id}`;
    const qrPayloadHash = seedHash(qrPayload);

    // Resolve store slugs to IDs
    const resolvedTargetStoreIds = c.targetStores
      .map((slug) => stores[slug]?.id)
      .filter((id): id is string => !!id);

    const coupon = await prisma.adminCoupon.upsert({
      where: { id },
      update: {
        code: c.code,
        qrPayloadHash,
        name: c.name,
        discountType: c.discountType,
        discountValue: c.discountValue,
        targetStores: resolvedTargetStoreIds,
        targetAudiences: c.targetAudiences,
        startsAt: seedDate(now, -5),
        endsAt: thirtyDaysLater,
        usageLimit: c.usageLimit ?? null,
        usedCount: c.usedCount,
        status: c.status,
      },
      create: {
        id,
        code: c.code,
        qrPayloadHash,
        name: c.name,
        discountType: c.discountType,
        discountValue: c.discountValue,
        targetStores: resolvedTargetStoreIds,
        targetAudiences: c.targetAudiences,
        startsAt: seedDate(now, -5),
        endsAt: thirtyDaysLater,
        usageLimit: c.usageLimit ?? null,
        usedCount: c.usedCount,
        status: c.status,
      },
    });

    adminCouponsResult[c.key] = coupon;
  }

  // 2. Seed Admin Coupon Issues and Scans
  // Issue 1: Used by 'member' at 'moonlight-bar', scanned by 'partner1'
  const memberUser = users['member'];
  const partner1User = users['partner1'];
  const moonlightBar = stores['moonlight-bar'];
  const festiveCoupon = adminCouponsResult['admin-festive-50k'];

  if (memberUser && partner1User && moonlightBar && festiveCoupon) {
    const issueId = seedUuid('admin-coupon-issue:member-festive-1');
    const qr = buildSeedCouponQr(issueId, now, 'member-festive-1');
    const issueCode = `ISSUE-FESTIVE-MEM`;
    const usedAt = seedDate(now, -1);

    const issue = await prisma.adminCouponIssue.upsert({
      where: { id: issueId },
      update: {
        adminCouponId: festiveCoupon.id,
        userId: memberUser.id,
        guestId: null,
        storeId: moonlightBar.id,
        scannedByUserId: partner1User.id,
        code: issueCode,
        qrPayloadHash: qr.payloadHash,
        status: CouponIssueStatus.USED,
        expiresAt: thirtyDaysLater,
        usedAt,
        metadata: { seed: true, qrPayload: qr.payload },
      },
      create: {
        id: issueId,
        adminCouponId: festiveCoupon.id,
        userId: memberUser.id,
        guestId: null,
        storeId: moonlightBar.id,
        scannedByUserId: partner1User.id,
        code: issueCode,
        qrPayloadHash: qr.payloadHash,
        status: CouponIssueStatus.USED,
        expiresAt: thirtyDaysLater,
        usedAt,
        metadata: { seed: true, qrPayload: qr.payload },
      },
    });

    // Create related Scan record
    const scanId = seedUuid('admin-coupon-scan:member-festive-scan-1');
    await prisma.adminCouponScan.upsert({
      where: { id: scanId },
      update: {
        adminCouponId: festiveCoupon.id,
        storeId: moonlightBar.id,
        scannedByUserId: partner1User.id,
        scannedAt: usedAt,
      },
      create: {
        id: scanId,
        adminCouponId: festiveCoupon.id,
        storeId: moonlightBar.id,
        scannedByUserId: partner1User.id,
        scannedAt: usedAt,
      },
    });
  }

  // Issue 2: Active issued coupon for VIP user
  const vipUser = users['vip'];
  const vipCoupon = adminCouponsResult['admin-vip-15pct'];
  if (vipUser && vipCoupon) {
    const issueId = seedUuid('admin-coupon-issue:vip-vip15-1');
    const qr = buildSeedCouponQr(issueId, now, 'vip-vip15-1');
    const issueCode = `ISSUE-VIP15-VIP`;

    await prisma.adminCouponIssue.upsert({
      where: { id: issueId },
      update: {
        adminCouponId: vipCoupon.id,
        userId: vipUser.id,
        guestId: null,
        storeId: null,
        scannedByUserId: null,
        code: issueCode,
        qrPayloadHash: qr.payloadHash,
        status: CouponIssueStatus.ISSUED,
        expiresAt: thirtyDaysLater,
        metadata: { seed: true, qrPayload: qr.payload },
      },
      create: {
        id: issueId,
        adminCouponId: vipCoupon.id,
        userId: vipUser.id,
        guestId: null,
        storeId: null,
        scannedByUserId: null,
        code: issueCode,
        qrPayloadHash: qr.payloadHash,
        status: CouponIssueStatus.ISSUED,
        expiresAt: thirtyDaysLater,
        metadata: { seed: true, qrPayload: qr.payload },
      },
    });
  }

  // Issue 3: Active issued coupon for guest 'g1'
  const guest1 = guests['g1'];
  if (guest1 && vipCoupon) {
    const issueId = seedUuid('admin-coupon-issue:guest-vip15-1');
    const qr = buildSeedCouponQr(issueId, now, 'guest-vip15-1');
    const issueCode = `ISSUE-VIP15-GST`;

    await prisma.adminCouponIssue.upsert({
      where: { id: issueId },
      update: {
        adminCouponId: vipCoupon.id,
        userId: null,
        guestId: guest1.id,
        storeId: null,
        scannedByUserId: null,
        code: issueCode,
        qrPayloadHash: qr.payloadHash,
        status: CouponIssueStatus.ISSUED,
        expiresAt: thirtyDaysLater,
        metadata: { seed: true, qrPayload: qr.payload },
      },
      create: {
        id: issueId,
        adminCouponId: vipCoupon.id,
        userId: null,
        guestId: guest1.id,
        storeId: null,
        scannedByUserId: null,
        code: issueCode,
        qrPayloadHash: qr.payloadHash,
        status: CouponIssueStatus.ISSUED,
        expiresAt: thirtyDaysLater,
        metadata: { seed: true, qrPayload: qr.payload },
      },
    });
  }

  // 3. Seed Campaigns
  for (const c of CAMPAIGNS) {
    const id = seedUuid(`campaign:${c.key}`);
    const targetStoreId = c.targetStoreSlug ? stores[c.targetStoreSlug]?.id : null;

    const campaign = await prisma.campaign.upsert({
      where: { id },
      update: {
        name: c.name,
        discountType: c.discountType,
        discountValue: c.discountValue,
        targetStoreId,
        startsAt: seedDate(now, -5),
        endsAt: thirtyDaysLater,
        status: c.status,
      },
      create: {
        id,
        name: c.name,
        discountType: c.discountType,
        discountValue: c.discountValue,
        targetStoreId,
        startsAt: seedDate(now, -5),
        endsAt: thirtyDaysLater,
        status: c.status,
      },
    });

    campaignsResult[c.key] = campaign;
  }

  console.log(`     ✓ Seeding complete:`);
  console.log(`       • ${Object.keys(adminCouponsResult).length} admin coupons`);
  console.log(`       • 3 admin coupon issue records`);
  console.log(`       • 1 admin coupon scan record`);
  console.log(`       • ${Object.keys(campaignsResult).length} campaigns`);

  return {
    adminCoupons: adminCouponsResult,
    campaigns: campaignsResult,
  };
}
