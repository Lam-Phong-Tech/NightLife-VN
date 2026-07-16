# Analysis and Recommendations: Seed Synchronization and VPS Deployment

This report outlines the plan to integrate 9 new entities into the database seed script, ensure 100% schema verification coverage, and deploy the new seed files to the remote VPS server using a new Paramiko-based Python script.

---

## 1. Integrating Tours & Coupons-Campaigns Seeds

To support the 9 new entities, we will update the seed fixtures and index files.

### 1.1 Seeding `MemberFavoriteStore`, `SupportTicket`, and `SupportMessage` in `13-api-fixtures.ts`
We recommend adding the following code blocks to `backend/prisma/seed/13-api-fixtures.ts` within the `seedApiFixtures` function:

- **Favorite Store Fixtures:**
  ```typescript
  // Seeding MemberFavoriteStore
  const favoriteStorePairs = [
    ['member', 'moonlight-bar'],
    ['vip', 'velvet-club'],
  ] as const;
  for (const [userKey, storeSlug] of favoriteStorePairs) {
    const user = users[userKey];
    const store = stores[storeSlug];
    if (!user || !store) {
      throw new Error(`Missing favorite store fixture relation: ${userKey}/${storeSlug}`);
    }
    const id = seedUuid(`favorite-store:${userKey}:${storeSlug}`);
    await prisma.memberFavoriteStore.upsert({
      where: { id },
      update: { userId: user.id, storeId: store.id },
      create: { id, userId: user.id, storeId: store.id },
    });
  }
  ```

- **Support Ticket and Message Fixtures:**
  ```typescript
  // Seeding SupportTicket and SupportMessage
  const adminUser = users.admin;
  const memberUser = users.member;
  
  const ticket1Id = seedUuid('support-ticket:member-active');
  await prisma.supportTicket.upsert({
    where: { id: ticket1Id },
    update: {
      userId: memberUser.id,
      assignedAdminId: adminUser.id,
      status: 'ACTIVE',
    },
    create: {
      id: ticket1Id,
      userId: memberUser.id,
      assignedAdminId: adminUser.id,
      status: 'ACTIVE',
      createdAt: seedDate(now, -1, 10),
    },
  });

  const msg1_1Id = seedUuid('support-message:member-msg-1');
  await prisma.supportMessage.upsert({
    where: { id: msg1_1Id },
    update: {
      ticketId: ticket1Id,
      senderId: memberUser.id,
      senderType: 'USER',
      content: 'Chào Admin, tôi gặp lỗi khi thanh toán hóa đơn.',
      isRead: true,
    },
    create: {
      id: msg1_1Id,
      ticketId: ticket1Id,
      senderId: memberUser.id,
      senderType: 'USER',
      content: 'Chào Admin, tôi gặp lỗi khi thanh toán hóa đơn.',
      isRead: true,
      createdAt: seedDate(now, -1, 10),
    },
  });

  const msg1_2Id = seedUuid('support-message:admin-msg-2');
  await prisma.supportMessage.upsert({
    where: { id: msg1_2Id },
    update: {
      ticketId: ticket1Id,
      senderId: adminUser.id,
      senderType: 'ADMIN',
      content: 'Chào bạn, bạn hãy gửi mã hóa đơn để chúng tôi kiểm tra.',
      isRead: false,
    },
    create: {
      id: msg1_2Id,
      ticketId: ticket1Id,
      senderId: adminUser.id,
      senderType: 'ADMIN',
      content: 'Chào bạn, bạn hãy gửi mã hóa đơn để chúng tôi kiểm tra.',
      isRead: false,
      createdAt: seedDate(now, -1, 11),
    },
  });

  // Guest Ticket
  const ticket2Id = seedUuid('support-ticket:guest-pending');
  await prisma.supportTicket.upsert({
    where: { id: ticket2Id },
    update: {
      guestSessionId: 'guest-session-123',
      status: 'PENDING',
    },
    create: {
      id: ticket2Id,
      guestSessionId: 'guest-session-123',
      status: 'PENDING',
      createdAt: seedDate(now, 0, -2),
    },
  });

  const msg2_1Id = seedUuid('support-message:guest-msg-1');
  await prisma.supportMessage.upsert({
    where: { id: msg2_1Id },
    update: {
      ticketId: ticket2Id,
      senderId: null,
      senderType: 'GUEST',
      content: 'Làm thế nào để đặt bàn cho nhóm 10 người?',
      isRead: false,
    },
    create: {
      id: msg2_1Id,
      ticketId: ticket2Id,
      senderId: null,
      senderType: 'GUEST',
      content: 'Làm thế nào để đặt bàn cho nhóm 10 người?',
      isRead: false,
      createdAt: seedDate(now, 0, -2),
    },
  });
  ```

---

### 1.2 Creating `16-tours.ts`
We recommend creating a new file `backend/prisma/seed/16-tours.ts` to seed `Tour` and `TourStop` models.

**Proposed File Content:**
```typescript
import { PrismaClient, Tour, Store } from '@prisma/client';
import { seedUuid } from './shared';

export async function seedTours(
  prisma: PrismaClient,
  stores: Record<string, Store>,
): Promise<Record<string, Tour>> {
  console.log('  🧳 Seeding tours...');
  const result: Record<string, Tour> = {};

  const tour1Id = seedUuid('tour:hanoi-night-tour');
  const tour1 = await prisma.tour.upsert({
    where: { id: tour1Id },
    update: {
      title: 'Hanoi Nightlife Experience',
      subtitle: 'Explore the best bars and clubs of Vietnam’s capital',
      city: 'Hanoi',
      durationHours: 4,
      priceTier: 3,
      coverUrl: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5',
      status: 'ACTIVE',
      departureTimes: ['19:00', '20:00'],
    },
    create: {
      id: tour1Id,
      title: 'Hanoi Nightlife Experience',
      subtitle: 'Explore the best bars and clubs of Vietnam’s capital',
      city: 'Hanoi',
      durationHours: 4,
      priceTier: 3,
      coverUrl: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5',
      status: 'ACTIVE',
      departureTimes: ['19:00', '20:00'],
    },
  });
  result['hanoi-night-tour'] = tour1;

  const stops1 = [
    { slug: 'crimson-bar', order: 1 },
    { slug: 'neon-club', order: 2 },
  ];
  for (const stop of stops1) {
    const store = stores[stop.slug];
    if (store) {
      await prisma.tourStop.upsert({
        where: { tourId_storeId: { tourId: tour1.id, storeId: store.id } },
        update: { order: stop.order },
        create: {
          id: seedUuid(`tourstop:hanoi-night-tour:${stop.slug}`),
          tourId: tour1.id,
          storeId: store.id,
          order: stop.order,
        },
      });
    }
  }

  const tour2Id = seedUuid('tour:hcm-vip-tour');
  const tour2 = await prisma.tour.upsert({
    where: { id: tour2Id },
    update: {
      title: 'Saigon Luxury Night Out',
      subtitle: 'Exclusive bars and premium lounges in District 1',
      city: 'Ho Chi Minh',
      durationHours: 5,
      priceTier: 4,
      coverUrl: 'https://images.unsplash.com/photo-1517457373958-b7bdd4587205',
      status: 'ACTIVE',
      departureTimes: ['18:30', '19:30'],
    },
    create: {
      id: tour2Id,
      title: 'Saigon Luxury Night Out',
      subtitle: 'Exclusive bars and premium lounges in District 1',
      city: 'Ho Chi Minh',
      durationHours: 5,
      priceTier: 4,
      coverUrl: 'https://images.unsplash.com/photo-1517457373958-b7bdd4587205',
      status: 'ACTIVE',
      departureTimes: ['18:30', '19:30'],
    },
  });
  result['hcm-vip-tour'] = tour2;

  const stops2 = [
    { slug: 'moonlight-bar', order: 1 },
    { slug: 'velvet-club', order: 2 },
    { slug: 'sakura-lounge', order: 3 },
  ];
  for (const stop of stops2) {
    const store = stores[stop.slug];
    if (store) {
      await prisma.tourStop.upsert({
        where: { tourId_storeId: { tourId: tour2.id, storeId: store.id } },
        update: { order: stop.order },
        create: {
          id: seedUuid(`tourstop:hcm-vip-tour:${stop.slug}`),
          tourId: tour2.id,
          storeId: store.id,
          order: stop.order,
        },
      });
    }
  }

  console.log('     ✓ 2 tours and stops seeded successfully.');
  return result;
}
```

---

### 1.3 Creating `17-admin-coupons-campaigns.ts`
We recommend creating a new file `backend/prisma/seed/17-admin-coupons-campaigns.ts` to seed `AdminCoupon`, `AdminCouponScan`, `AdminCouponIssue`, and `Campaign` models.

**Proposed File Content:**
```typescript
import { PrismaClient, Store, User, Guest, AdminCoupon, Campaign } from '@prisma/client';
import { seedUuid, seedDate, seedHash, buildSeedCouponQr } from './shared';

export type AdminCouponCampaignContext = {
  stores: Record<string, Store>;
  users: Record<string, User>;
  guests: Record<string, Guest>;
  now: Date;
};

export async function seedAdminCouponsAndCampaigns(
  prisma: PrismaClient,
  context: AdminCouponCampaignContext,
): Promise<{ adminCoupons: Record<string, AdminCoupon>; campaigns: Record<string, Campaign> }> {
  console.log('  🎫 Seeding admin coupons and campaigns...');
  const { stores, users, guests, now } = context;

  const adminCouponsResult: Record<string, AdminCoupon> = {};
  const campaignsResult: Record<string, Campaign> = {};

  const adminCoupon1Id = seedUuid('admin-coupon:summer-promo');
  const qr1Payload = `https://nightlife.vn/admin-coupon/SUMMER2026?id=${adminCoupon1Id}`;
  const adminCoupon1 = await prisma.adminCoupon.upsert({
    where: { id: adminCoupon1Id },
    update: {
      code: 'SUMMER2026',
      qrPayloadHash: seedHash(qr1Payload),
      name: 'Summer Promo Campaign 2026',
      discountType: 'PERCENT',
      discountValue: 15,
      targetStores: [stores['moonlight-bar']?.id, stores['velvet-club']?.id].filter(Boolean),
      targetAudiences: ['MEMBER', 'VIP'],
      startsAt: seedDate(now, -10),
      endsAt: seedDate(now, 20),
      usageLimit: 500,
      usedCount: 1,
      status: 'ACTIVE',
    },
    create: {
      id: adminCoupon1Id,
      code: 'SUMMER2026',
      qrPayloadHash: seedHash(qr1Payload),
      name: 'Summer Promo Campaign 2026',
      discountType: 'PERCENT',
      discountValue: 15,
      targetStores: [stores['moonlight-bar']?.id, stores['velvet-club']?.id].filter(Boolean),
      targetAudiences: ['MEMBER', 'VIP'],
      startsAt: seedDate(now, -10),
      endsAt: seedDate(now, 20),
      usageLimit: 500,
      usedCount: 1,
      status: 'ACTIVE',
    },
  });
  adminCouponsResult['summer-promo'] = adminCoupon1;

  const scanId = seedUuid('admin-coupon-scan:summer-scan-1');
  await prisma.adminCouponScan.upsert({
    where: { id: scanId },
    update: {
      adminCouponId: adminCoupon1.id,
      storeId: stores['moonlight-bar']?.id,
      scannedByUserId: users.operator?.id ?? null,
      scannedAt: seedDate(now, -5),
    },
    create: {
      id: scanId,
      adminCouponId: adminCoupon1.id,
      storeId: stores['moonlight-bar']?.id,
      scannedByUserId: users.operator?.id ?? null,
      scannedAt: seedDate(now, -5),
    },
  });

  const issue1Id = seedUuid('admin-coupon-issue:member-summer');
  const qrIssue1 = buildSeedCouponQr(issue1Id, now, 'member-summer');
  await prisma.adminCouponIssue.upsert({
    where: { id: issue1Id },
    update: {
      adminCouponId: adminCoupon1.id,
      userId: users.member?.id ?? null,
      guestId: null,
      storeId: stores['moonlight-bar']?.id,
      scannedByUserId: users.operator?.id ?? null,
      code: 'ISSUE-SUMMER-MEM',
      qrPayloadHash: qrIssue1.payloadHash,
      status: 'USED',
      expiresAt: seedDate(now, 5),
      usedAt: seedDate(now, -1),
      metadata: { seed: true, qrPayload: qrIssue1.payload },
    },
    create: {
      id: issue1Id,
      adminCouponId: adminCoupon1.id,
      userId: users.member?.id ?? null,
      guestId: null,
      storeId: stores['moonlight-bar']?.id,
      scannedByUserId: users.operator?.id ?? null,
      code: 'ISSUE-SUMMER-MEM',
      qrPayloadHash: qrIssue1.payloadHash,
      status: 'USED',
      expiresAt: seedDate(now, 5),
      usedAt: seedDate(now, -1),
      metadata: { seed: true, qrPayload: qrIssue1.payload },
    },
  });

  const issue2Id = seedUuid('admin-coupon-issue:guest-summer');
  const qrIssue2 = buildSeedCouponQr(issue2Id, now, 'guest-summer');
  await prisma.adminCouponIssue.upsert({
    where: { id: issue2Id },
    update: {
      adminCouponId: adminCoupon1.id,
      userId: null,
      guestId: guests.g1?.id ?? null,
      storeId: null,
      scannedByUserId: null,
      code: 'ISSUE-SUMMER-GST',
      qrPayloadHash: qrIssue2.payloadHash,
      status: 'ISSUED',
      expiresAt: seedDate(now, 5),
      usedAt: null,
      metadata: { seed: true, qrPayload: qrIssue2.payload },
    },
    create: {
      id: issue2Id,
      adminCouponId: adminCoupon1.id,
      userId: null,
      guestId: guests.g1?.id ?? null,
      storeId: null,
      scannedByUserId: null,
      code: 'ISSUE-SUMMER-GST',
      qrPayloadHash: qrIssue2.payloadHash,
      status: 'ISSUED',
      expiresAt: seedDate(now, 5),
      usedAt: null,
      metadata: { seed: true, qrPayload: qrIssue2.payload },
    },
  });

  const campaign1Id = seedUuid('campaign:mid-autumn-2026');
  const campaign1 = await prisma.campaign.upsert({
    where: { id: campaign1Id },
    update: {
      name: 'Mid-Autumn Festival Campaign 2026',
      discountType: 'PERCENT',
      discountValue: 20,
      targetStoreId: stores['moonlight-bar']?.id ?? null,
      startsAt: seedDate(now, -5),
      endsAt: seedDate(now, 5),
      status: 'ACTIVE',
    },
    create: {
      id: campaign1Id,
      name: 'Mid-Autumn Festival Campaign 2026',
      discountType: 'PERCENT',
      discountValue: 20,
      targetStoreId: stores['moonlight-bar']?.id ?? null,
      startsAt: seedDate(now, -5),
      endsAt: seedDate(now, 5),
      status: 'ACTIVE',
    },
  });
  campaignsResult['mid-autumn-2026'] = campaign1;

  console.log('     ✓ Admin coupons, scans, issues, and campaigns seeded successfully.');
  return { adminCoupons: adminCouponsResult, campaigns: campaignsResult };
}
```

---

### 1.4 Seeding Extra Lifecycle States in `14-full-fixtures.ts`
To achieve 100% enum and status coverage during `seed:full` execution, we must seed the remaining statuses of the enums used by these 9 models in `backend/prisma/seed/14-full-fixtures.ts`.

**Proposed Additions to `seedFullFixtures`:**
```typescript
  // SupportTicket CLOSED status
  const closedTicketId = seedUuid('support-ticket:closed');
  await prisma.supportTicket.upsert({
    where: { id: closedTicketId },
    update: {
      userId: users.member.id,
      assignedAdminId: users.admin.id,
      status: 'CLOSED',
      closedAt: seedDate(now, -1, 15),
    },
    create: {
      id: closedTicketId,
      userId: users.member.id,
      assignedAdminId: users.admin.id,
      status: 'CLOSED',
      closedAt: seedDate(now, -1, 15),
    },
  });

  // SupportMessage SYSTEM senderType
  const systemMsgId = seedUuid('support-message:system-msg');
  await prisma.supportMessage.upsert({
    where: { id: systemMsgId },
    update: {
      ticketId: seedUuid('support-ticket:member-active'),
      senderId: null,
      senderType: 'SYSTEM',
      content: 'Hệ thống tự động: Yêu cầu của bạn đã được tiếp nhận.',
      isRead: true,
    },
    create: {
      id: systemMsgId,
      ticketId: seedUuid('support-ticket:member-active'),
      senderId: null,
      senderType: 'SYSTEM',
      content: 'Hệ thống tự động: Yêu cầu của bạn đã được tiếp nhận.',
      isRead: true,
      createdAt: seedDate(now, -1, 9),
    },
  });

  // Campaign statuses: PAUSED, DRAFT, EXPIRED, DELETED
  for (const status of ['PAUSED', 'DRAFT', 'EXPIRED', 'DELETED'] as const) {
    const id = seedUuid(`full-campaign:${status}`);
    await prisma.campaign.upsert({
      where: { id },
      update: {
        name: `Seed Campaign ${status}`,
        discountType: 'PERCENT',
        discountValue: 10,
        targetStoreId: stores['moonlight-bar']?.id ?? null,
        status,
        deletedAt: status === 'DELETED' ? seedDate(now, -30, 12) : null,
      },
      create: {
        id,
        name: `Seed Campaign ${status}`,
        discountType: 'PERCENT',
        discountValue: 10,
        targetStoreId: stores['moonlight-bar']?.id ?? null,
        status,
        deletedAt: status === 'DELETED' ? seedDate(now, -30, 12) : null,
      },
    });
  }

  // Tour statuses: HIDDEN, DELETED
  for (const status of ['HIDDEN', 'DELETED'] as const) {
    const id = seedUuid(`full-tour:${status}`);
    await prisma.tour.upsert({
      where: { id },
      update: {
        title: `Seed Tour ${status}`,
        city: 'Hanoi',
        status,
        deletedAt: status === 'DELETED' ? seedDate(now, -30, 12) : null,
      },
      create: {
        id,
        title: `Seed Tour ${status}`,
        city: 'Hanoi',
        status,
        deletedAt: status === 'DELETED' ? seedDate(now, -30, 12) : null,
      },
    });
  }

  // AdminCoupon statuses: DRAFT, PAUSED, EXPIRED, ARCHIVED, DELETED
  for (const status of ['DRAFT', 'PAUSED', 'EXPIRED', 'ARCHIVED', 'DELETED'] as const) {
    const id = seedUuid(`full-admin-coupon:${status}`);
    const qrPayload = `https://nightlife.vn/admin-coupon/SEED-${status}?id=${id}`;
    await prisma.adminCoupon.upsert({
      where: { id },
      update: {
        code: `SEED-ADMIN-COUPON-${status}`,
        qrPayloadHash: seedHash(qrPayload),
        name: `Seed Admin Coupon ${status}`,
        discountType: 'PERCENT',
        discountValue: 10,
        startsAt: seedDate(now, -5),
        status,
        deletedAt: status === 'DELETED' ? seedDate(now, -30, 12) : null,
      },
      create: {
        id,
        code: `SEED-ADMIN-COUPON-${status}`,
        qrPayloadHash: seedHash(qrPayload),
        name: `Seed Admin Coupon ${status}`,
        discountType: 'PERCENT',
        discountValue: 10,
        startsAt: seedDate(now, -5),
        status,
        deletedAt: status === 'DELETED' ? seedDate(now, -30, 12) : null,
      },
    });
  }

  // AdminCouponIssue statuses: EXPIRED, REVOKED
  const adminCouponActiveId = seedUuid('admin-coupon:summer-promo');
  for (const status of ['EXPIRED', 'REVOKED'] as const) {
    const id = seedUuid(`full-admin-coupon-issue:${status}`);
    const qrPayload = `https://nightlife.vn/admin-coupon-issue/SEED-${status}?id=${id}`;
    await prisma.adminCouponIssue.upsert({
      where: { id },
      update: {
        adminCouponId: adminCouponActiveId,
        userId: users.member.id,
        code: `SEED-ADMIN-ISSUE-${status}`,
        qrPayloadHash: seedHash(qrPayload),
        status,
        expiresAt: seedDate(now, -1),
        revokedAt: status === 'REVOKED' ? seedDate(now, -2) : null,
      },
      create: {
        id,
        adminCouponId: adminCouponActiveId,
        userId: users.member.id,
        code: `SEED-ADMIN-ISSUE-${status}`,
        qrPayloadHash: seedHash(qrPayload),
        status,
        expiresAt: seedDate(now, -1),
        revokedAt: status === 'REVOKED' ? seedDate(now, -2) : null,
      },
    });
  }
```

---

### 1.5 Integrating into `index.ts`
We recommend importing the new functions and calling them in `backend/prisma/seed/index.ts`.

- **Imports to add:**
  ```typescript
  import { seedTours } from './16-tours';
  import { seedAdminCouponsAndCampaigns } from './17-admin-coupons-campaigns';
  ```

- **Function Calls to add within `seedAll`:**
  ```typescript
    // Inside seedAll, after seedApiFixtures(...)
    const tours = await seedTours(prisma, stores);
    await seedAdminCouponsAndCampaigns(prisma, {
      stores,
      users,
      guests: transactions.guests,
      now: options.now,
    });
  ```

- **Logs Updates:**
  We recommend appending the following lines to the end-of-seed logs printed to stdout (lines 80-110):
  ```typescript
    console.log('  • Favorite Stores: 2 custom member/VIP store preferences');
    console.log('  • Support:       2 tickets (1 active member, 1 pending guest) with 3 messages');
    console.log('  • Tours:         2 custom night tours across stores');
    console.log('  • Admin Coupons: 1 campaign coupon with scans and issued tokens');
    console.log('  • Campaigns:     1 active mid-autumn marketing campaign');
  ```

---

## 2. Seeding Verification & 100% Schema Coverage (`verify.ts`)

To ensure 100% coverage, we must check **all 42 models** in `schema.prisma`. 

- The current implementation of `verify.ts` only counts 32 models.
- 9 new models were introduced.
- 1 existing model (`SystemConfig`) was seeded but omitted from the counts.

### 2.1 Updating `modelCounts` and required lists:
Modify `backend/prisma/seed/verify.ts` to include the missing 10 models in the model count calculations and required list assertions.

- **Changes in `modelCounts` object definition:**
  ```typescript
    // Add the following fields to modelCounts
    SupportTicket: await prisma.supportTicket.count(),
    SupportMessage: await prisma.supportMessage.count(),
    MemberFavoriteStore: await prisma.memberFavoriteStore.count(),
    Tour: await prisma.tour.count(),
    TourStop: await prisma.tourStop.count(),
    AdminCoupon: await prisma.adminCoupon.count(),
    AdminCouponScan: await prisma.adminCouponScan.count(),
    AdminCouponIssue: await prisma.adminCouponIssue.count(),
    Campaign: await prisma.campaign.count(),
    SystemConfig: await prisma.systemConfig.count(),
  ```

- **Changes in `demoRequiredModels` array:**
  ```typescript
    // Add to demoRequiredModels
    'SupportTicket',
    'SupportMessage',
    'MemberFavoriteStore',
    'Tour',
    'TourStop',
    'AdminCoupon',
    'AdminCouponScan',
    'AdminCouponIssue',
    'Campaign',
    'SystemConfig',
  ```

- **Update verification output log string (line 583):**
  Change:
  `✅ Seed coverage verified (${profile}): ${requiredModels.length}/32 required models`
  To:
  `✅ Seed coverage verified (${profile}): ${requiredModels.length}/42 required models`

### 2.2 Adding Enum/Status Checks inside `verifySeedCoverage` (for full profile):
We will query and verify the coverage of the distinct enum values inside the `if (profile === 'full')` block.

```typescript
    const [
      supportTicketStatuses,
      supportSenderTypes,
      campaignStatuses,
      adminCouponStatuses,
      adminCouponIssueStatuses,
    ] = await Promise.all([
      prisma.supportTicket.findMany({ distinct: ['status'], select: { status: true } }),
      prisma.supportMessage.findMany({ distinct: ['senderType'], select: { senderType: true } }),
      prisma.campaign.findMany({ distinct: ['status'], select: { status: true } }),
      prisma.adminCoupon.findMany({ distinct: ['status'], select: { status: true } }),
      prisma.adminCouponIssue.findMany({ distinct: ['status'], select: { status: true } }),
    ]);

    requireStatuses('SupportTicket', supportTicketStatuses, ['PENDING', 'ACTIVE', 'CLOSED']);
    requireValues(
      'SupportSenderType',
      supportSenderTypes.map((row) => row.senderType),
      ['GUEST', 'USER', 'ADMIN', 'SYSTEM'],
    );
    requireStatuses('Campaign', campaignStatuses, ['ACTIVE', 'PAUSED', 'DRAFT', 'EXPIRED', 'DELETED']);
    requireStatuses('AdminCoupon', adminCouponStatuses, ['DRAFT', 'ACTIVE', 'PAUSED', 'EXPIRED', 'ARCHIVED', 'DELETED']);
    requireStatuses('AdminCouponIssue', adminCouponIssueStatuses, ['ISSUED', 'USED', 'EXPIRED', 'REVOKED']);
```

---

## 3. Remote VPS Seeding Deployment Script (`seed_vps_full.py`)

A new script `backend/seed_vps_full.py` will be created. It uses the `paramiko` library to establish an SSH and SFTP connection to the remote server `45.119.83.233` (using root credentials) and deploys all local seed files.

**Proposed Implementation Code (`backend/seed_vps_full.py`):**
```python
import os
import paramiko

def main():
    # Setup paths relative to script location
    script_dir = os.path.dirname(os.path.abspath(__file__))
    local_prisma_dir = os.path.join(script_dir, 'prisma')
    local_seed_dir = os.path.join(local_prisma_dir, 'seed')
    
    remote_base = '/var/www/api.demonightlight.test9.io.vn/prisma'
    remote_seed_dir = remote_base + '/seed'

    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())

    print("Connecting to VPS (45.119.83.233)...")
    try:
        ssh.connect('45.119.83.233', username='root', password='Tailoc@2026')
        print("Connected successfully!")
    except Exception as e:
        print(f"Failed to connect: {e}")
        return

    # Ensure remote seed directory exists
    print("Creating remote seed directory if not exists...")
    ssh.exec_command(f"mkdir -p {remote_seed_dir}")

    # Copy files using SFTP
    print("Opening SFTP channel...")
    sftp = ssh.open_sftp()
    
    # 1. Upload seed.ts entry point
    local_seed_entry = os.path.join(local_prisma_dir, 'seed.ts')
    remote_seed_entry = remote_base + '/seed.ts'
    if os.path.exists(local_seed_entry):
        print(f"Uploading {local_seed_entry} -> {remote_seed_entry}")
        sftp.put(local_seed_entry, remote_seed_entry)
        
    # 2. Upload seed files recursively
    if os.path.exists(local_seed_dir):
        for filename in os.listdir(local_seed_dir):
            if filename.endswith('.ts'):
                local_file = os.path.join(local_seed_dir, filename)
                remote_file = remote_seed_dir + '/' + filename
                print(f"Uploading {local_file} -> {remote_file}")
                sftp.put(local_file, remote_file)
                
    sftp.close()
    print("File upload completed.")

    # Execute prisma seed command
    # We will trigger the prisma client db seed via npm run seed command on VPS
    seed_cmd = "cd /var/www/api.demonightlight.test9.io.vn && npx prisma db seed"
    print(f"Executing remote command: {seed_cmd}")
    stdin, stdout, stderr = ssh.exec_command(seed_cmd)
    
    exit_status = stdout.channel.recv_exit_status()
    print(f"Exit Status: {exit_status}")
    print("STDOUT:")
    print(stdout.read().decode('utf-8', errors='replace'))
    print("STDERR:")
    print(stderr.read().decode('utf-8', errors='replace'))

    ssh.close()
    print("Seeding on VPS done.")

if __name__ == '__main__':
    main()
```

---

## 4. Verification Plan

Once implemented, the seeding integrity can be verified locally and remotely:
1. Run the local prisma seed command to verify there are no compilation or runtime issues:
   `npm run seed` or `npm run seed:full`
2. Inspect the console logs output to make sure all 9 new entities are listed under the seed summary:
   - Favorite Stores (2 custom member/VIP store preferences)
   - Support (2 tickets, 3 messages)
   - Tours (2 custom night tours)
   - Admin Coupons (1 campaign coupon with scans/issues)
   - Campaigns (1 active campaign)
3. Check the output of the coverage report to confirm:
   `✅ Seed coverage verified (demo): 39/39 required models`
   `✅ Seed coverage verified (full): 42/42 required models`
4. Run `backend/seed_vps_full.py` to trigger remote deployment and execution, then inspect stdout logs for successful connection and seed logs matching local output.
