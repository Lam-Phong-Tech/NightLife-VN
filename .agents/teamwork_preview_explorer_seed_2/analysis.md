# Analysis — Seeding Tours & Admin Coupons/Campaigns

This report details the design and plan for seeding `Tour`, `TourStop`, `AdminCoupon`, `AdminCouponScan`, `AdminCouponIssue`, and `Campaign` entities.

## 1. Summary of Findings

- **Tour and TourStop Models**:
  - `Tour` has only `id` as a unique identifier. We will use deterministic UUID generation using `seedUuid('tour-' + tourSlug)` to prevent duplicate insertions across seed runs.
  - `TourStop` has a compound unique constraint `@@unique([tourId, storeId])` mapped to `tourId_storeId` in Prisma client. We will use this compound key for upserts.
  
- **Admin Coupons and Campaigns**:
  - `AdminCoupon` has unique columns `code` and `qrPayloadHash`.
  - `AdminCouponScan` has no unique constraint other than `id`, which we will seed using `seedUuid('admin-coupon-scan-' + scanKey)`.
  - `AdminCouponIssue` has unique columns `code` and `qrPayloadHash`.
  - `Campaign` has only `id` as a unique identifier. We will use deterministic UUID generation using `seedUuid('campaign-' + campaignSlug)`.
  - Relationships link back to existing users, guests, and stores seeded in previous files.

---

## 2. Proposed Seed Implementation

### A. Seeding Tours (`backend/prisma/seed/16-tours.ts`)

This script seeds the `Tour` and `TourStop` models, providing structured nightlife tours in both Hanoi and Hồ Chí Minh. It relates to the stores seeded in `04-stores.ts`.

```typescript
import { PrismaClient, Tour, Store } from '@prisma/client';
import { seedUuid } from './shared';

interface TourStopSeed {
  storeSlug: string;
  order: number;
}

interface TourSeed {
  key: string;
  title: string;
  subtitle: string;
  city: string;
  durationHours: number;
  priceTier: number;
  coverUrl: string;
  departureTimes: string[];
  stops: TourStopSeed[];
}

const TOURS: TourSeed[] = [
  {
    key: 'hanoi-old-quarter-crawl',
    title: 'Hanoi Old Quarter Pub & Lounge Crawl',
    subtitle: 'Discover the hidden gems, craft beers, and speakeasy lounges in the historic heart of Hanoi.',
    city: 'Hà Nội',
    durationHours: 4,
    priceTier: 2,
    coverUrl: 'https://images.unsplash.com/photo-1506157786151-b8491531f063?w=1200&h=800&fit=crop&q=80',
    departureTimes: ['19:00', '20:30'],
    stops: [
      { storeSlug: 'crimson-bar', order: 1 },
      { storeSlug: 'star-ktv', order: 2 },
      { storeSlug: 'jade-lounge', order: 3 },
    ],
  },
  {
    key: 'saigon-nightlife-vip',
    title: 'Saigon Premium VIP Experience',
    subtitle: 'Experience Saigon’s most exclusive bars, high-end lounges, and elite clubs in District 1.',
    city: 'Hồ Chí Minh',
    durationHours: 5,
    priceTier: 3,
    coverUrl: 'https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=1200&h=800&fit=crop&q=80',
    departureTimes: ['20:00', '21:30'],
    stops: [
      { storeSlug: 'moonlight-bar', order: 1 },
      { storeSlug: 'sakura-lounge', order: 2 },
      { storeSlug: 'velvet-club', order: 3 },
    ],
  },
];

export async function seedTours(
  prisma: PrismaClient,
  stores: Record<string, Store>,
): Promise<Record<string, Tour>> {
  console.log('  🗺️ Seeding tours...');
  const result: Record<string, Tour> = {};

  for (const t of TOURS) {
    const id = seedUuid(`tour:${t.key}`);

    // 1. Upsert Tour
    const tour = await prisma.tour.upsert({
      where: { id },
      update: {
        title: t.title,
        subtitle: t.subtitle,
        city: t.city,
        durationHours: t.durationHours,
        priceTier: t.priceTier,
        coverUrl: t.coverUrl,
        departureTimes: t.departureTimes,
        status: 'ACTIVE',
      },
      create: {
        id,
        title: t.title,
        subtitle: t.subtitle,
        city: t.city,
        durationHours: t.durationHours,
        priceTier: t.priceTier,
        coverUrl: t.coverUrl,
        departureTimes: t.departureTimes,
        status: 'ACTIVE',
      },
    });

    result[t.key] = tour;

    // 2. Upsert Tour Stops
    for (const stop of t.stops) {
      const store = stores[stop.storeSlug];
      if (!store) {
        console.warn(`     ⚠ Store not found for tour stop: ${stop.storeSlug}`);
        continue;
      }

      await prisma.tourStop.upsert({
        where: {
          tourId_storeId: {
            tourId: tour.id,
            storeId: store.id,
          },
        },
        update: {
          order: stop.order,
        },
        create: {
          id: seedUuid(`tourstop:${t.key}:${stop.storeSlug}`),
          tourId: tour.id,
          storeId: store.id,
          order: stop.order,
        },
      });
    }
  }

  console.log(`     ✓ ${Object.keys(result).length} tours & related stops successfully seeded`);
  return result;
}
```

---

### B. Seeding Admin Coupons & Campaigns (`backend/prisma/seed/17-admin-coupons-campaigns.ts`)

This script seeds the `AdminCoupon`, `AdminCouponScan`, `AdminCouponIssue`, and `Campaign` models. It references seeded `Store` records, registered `User` profiles (e.g. `member`, `vip`), and walk-in `Guest` profiles.

```typescript
import { PrismaClient, Store, User, Guest, AdminCoupon, Campaign } from '@prisma/client';
import { seedUuid, seedHash } from './shared';

interface AdminCouponSeed {
  key: string;
  code: string;
  name: string;
  discountType: 'PERCENT' | 'FIXED_AMOUNT';
  discountValue: number;
  targetStores: string[];
  targetAudiences: string[];
  usageLimit?: number;
  usedCount: number;
  status: 'ACTIVE' | 'DRAFT' | 'PAUSED' | 'EXPIRED';
}

interface AdminCouponIssueSeed {
  code: string;
  couponKey: string;
  userKey?: string;
  guestKey?: string;
  storeSlug?: string;
  scannedByPrefix?: string;
  status: 'ISSUED' | 'USED' | 'EXPIRED' | 'REVOKED';
  usedOffsetMinutes?: number;
}

interface CampaignSeed {
  key: string;
  name: string;
  discountType: 'PERCENT' | 'FIXED_AMOUNT';
  discountValue: number;
  targetStoreSlug?: string;
  status: 'ACTIVE' | 'PAUSED' | 'DRAFT' | 'EXPIRED';
}

const ADMIN_COUPONS: AdminCouponSeed[] = [
  {
    key: 'admin-festive-50k',
    code: 'FESTIVE50K',
    name: 'Admin Festive 50K Discount',
    discountType: 'FIXED_AMOUNT',
    discountValue: 50000,
    targetStores: ['moonlight-bar', 'crimson-bar'],
    targetAudiences: ['ALL'],
    usageLimit: 100,
    usedCount: 1,
    status: 'ACTIVE',
  },
  {
    key: 'admin-vip-15pct',
    code: 'VIP15PERCENT',
    name: 'Admin VIP 15% Off Global',
    discountType: 'PERCENT',
    discountValue: 15,
    targetStores: [], // Global
    targetAudiences: ['VIP'],
    usageLimit: 50,
    usedCount: 0,
    status: 'ACTIVE',
  },
];

const CAMPAIGNS: CampaignSeed[] = [
  {
    key: 'summer-beer-fest',
    name: 'Summer Night Beer Fest',
    discountType: 'PERCENT',
    discountValue: 20,
    targetStoreSlug: 'crimson-bar',
    status: 'ACTIVE',
  },
  {
    key: 'global-lounge-discount',
    name: 'Global Premium Lounge Discount',
    discountType: 'FIXED_AMOUNT',
    discountValue: 150000,
    status: 'ACTIVE',
  },
  {
    key: 'autumn-ktv-promo',
    name: 'Autumn Karaoke Promotion',
    discountType: 'PERCENT',
    discountValue: 10,
    targetStoreSlug: 'golden-voice-ktv',
    status: 'DRAFT',
  },
];

export async function seedAdminCouponsAndCampaigns(
  prisma: PrismaClient,
  context: {
    stores: Record<string, Store>;
    users: Record<string, User>;
    guests: Record<string, Guest>;
    now: Date;
  },
): Promise<{
  adminCoupons: Record<string, AdminCoupon>;
  campaigns: Record<string, Campaign>;
}> {
  console.log('  🎫 Seeding admin coupons & campaigns...');
  const { stores, users, guests, now } = context;

  const adminCouponsResult: Record<string, AdminCoupon> = {};
  const campaignsResult: Record<string, Campaign> = {};

  const thirtyDaysLater = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

  // 1. Seed Admin Coupons
  for (const c of ADMIN_COUPONS) {
    const id = seedUuid(`admin-coupon:${c.key}`);
    const qrPayload = `ADMIN_COUPON::${c.code}::seed`;
    const qrPayloadHash = seedHash(qrPayload);

    // Resolve store slugs to IDs
    const resolvedTargetStoreIds = c.targetStores
      .map((slug) => stores[slug]?.id)
      .filter((id): id is string => !!id);

    const coupon = await prisma.adminCoupon.upsert({
      where: { code: c.code },
      update: {
        qrPayloadHash,
        name: c.name,
        discountType: c.discountType,
        discountValue: c.discountValue,
        targetStores: resolvedTargetStoreIds,
        targetAudiences: c.targetAudiences,
        startsAt: now,
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
        startsAt: now,
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
    const issueCode = `${festiveCoupon.code}-MEMBER-01`;
    const issuePayload = `ADMIN_COUPON_ISSUE::${issueCode}::seed`;
    const issueHash = seedHash(issuePayload);
    const usedAt = new Date(now.getTime() - 10 * 60 * 1000); // 10 minutes ago

    const issue = await prisma.adminCouponIssue.upsert({
      where: { code: issueCode },
      update: {
        status: 'USED',
        usedAt,
      },
      create: {
        id: seedUuid(`admin-coupon-issue:${issueCode}`),
        adminCouponId: festiveCoupon.id,
        userId: memberUser.id,
        storeId: moonlightBar.id,
        scannedByUserId: partner1User.id,
        code: issueCode,
        qrPayloadHash: issueHash,
        status: 'USED',
        expiresAt: thirtyDaysLater,
        usedAt,
      },
    });

    // Create related Scan record
    await prisma.adminCouponScan.upsert({
      where: { id: seedUuid(`admin-coupon-scan:${issue.id}`) },
      update: {},
      create: {
        id: seedUuid(`admin-coupon-scan:${issue.id}`),
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
    const issueCode = `${vipCoupon.code}-VIP-01`;
    const issuePayload = `ADMIN_COUPON_ISSUE::${issueCode}::seed`;
    const issueHash = seedHash(issuePayload);

    await prisma.adminCouponIssue.upsert({
      where: { code: issueCode },
      update: {
        status: 'ISSUED',
      },
      create: {
        id: seedUuid(`admin-coupon-issue:${issueCode}`),
        adminCouponId: vipCoupon.id,
        userId: vipUser.id,
        code: issueCode,
        qrPayloadHash: issueHash,
        status: 'ISSUED',
        expiresAt: thirtyDaysLater,
      },
    });
  }

  // Issue 3: Active issued coupon for guest 'g1'
  const guest1 = guests['g1'];
  if (guest1 && vipCoupon) {
    const issueCode = `${vipCoupon.code}-GUEST-01`;
    const issuePayload = `ADMIN_COUPON_ISSUE::${issueCode}::seed`;
    const issueHash = seedHash(issuePayload);

    await prisma.adminCouponIssue.upsert({
      where: { code: issueCode },
      update: {
        status: 'ISSUED',
      },
      create: {
        id: seedUuid(`admin-coupon-issue:${issueCode}`),
        adminCouponId: vipCoupon.id,
        guestId: guest1.id,
        code: issueCode,
        qrPayloadHash: issueHash,
        status: 'ISSUED',
        expiresAt: thirtyDaysLater,
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
        startsAt: now,
        endsAt: thirtyDaysLater,
        status: c.status,
      },
      create: {
        id,
        name: c.name,
        discountType: c.discountType,
        discountValue: c.discountValue,
        targetStoreId,
        startsAt: now,
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
```

---

## 3. Required Modifications to Existing Files

### A. Updating `backend/prisma/seed/index.ts`

Import and execute the two new seed routines inside the main `seedAll` orchestrator function:

```typescript
// Add imports at the top
import { seedTours } from './16-tours';
import { seedAdminCouponsAndCampaigns } from './17-admin-coupons-campaigns';

// Within the seedAll function (e.g. after seedSystemConfigs):
export async function seedAll(...) {
  // ... existing seeding steps ...

  await seedSystemConfigs(prisma);

  // Seeding Tours
  await seedTours(prisma, stores);

  // Seeding Admin Coupons and Campaigns
  await seedAdminCouponsAndCampaigns(prisma, {
    stores,
    users,
    guests: transactions.guests,
    now: options.now,
  });

  // ... rest of seedAll execution ...
}
```

### B. Updating `backend/prisma/seed/verify.ts`

Ensure the newly created data counts are validated during `prisma db seed` execution:

```typescript
// 1. Add model counts in verifySeedCoverage:
const modelCounts = {
  // ... existing counts ...
  Category: await prisma.category.count(),
  
  // New verification targets
  Tour: await prisma.tour.count(),
  TourStop: await prisma.tourStop.count(),
  AdminCoupon: await prisma.adminCoupon.count(),
  AdminCouponScan: await prisma.adminCouponScan.count(),
  AdminCouponIssue: await prisma.adminCouponIssue.count(),
  Campaign: await prisma.campaign.count(),
};

// 2. Add to demoRequiredModels list:
const demoRequiredModels = [
  // ... existing models ...
  'Category',
  
  'Tour',
  'TourStop',
  'AdminCoupon',
  'AdminCouponScan',
  'AdminCouponIssue',
  'Campaign',
] as const;
```

---

## 4. Verification & Testing Strategy

To verify this implementation once written by the implementer agent:
1. Run the local build command:
   ```bash
   npm run build
   ```
2. Run database migration / seed command:
   ```bash
   npx prisma db seed
   ```
3. Run verification check scripts:
   ```bash
   npm run seed:check
   ```
4. Verify using prisma studio or a direct query that the rows exist and are correctly linked (e.g. `Tour` has its corresponding `TourStop` mapping records, and `AdminCouponScan`/`Issue` correctly point to `AdminCoupon`, `Store`, and `User`/`Guest` objects).
