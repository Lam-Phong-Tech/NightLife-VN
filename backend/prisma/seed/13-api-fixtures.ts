import {
  BookingChangeRequestStatus,
  Coupon,
  CouponIssueStatus,
  Prisma,
  PrismaClient,
  Store,
  User,
} from '@prisma/client';
import { TransactionSeedResult } from './12-bookings-bills';
import {
  buildSeedCouponQr,
  materializeSeedUpload,
  seedDate,
  seedStorageUrl,
  seedUuid,
} from './shared';

type ApiFixtureContext = {
  stores: Record<string, Store>;
  casts: Record<string, { id: string }>;
  users: Record<string, User>;
  coupons: Record<string, Coupon>;
  transactions: TransactionSeedResult;
  now: Date;
};

const CHANGE_REQUESTS: Array<{
  key: string;
  bookingKey: string;
  status: BookingChangeRequestStatus;
  requester: 'member' | 'guest';
}> = [
  {
    key: 'member-requested',
    bookingKey: 'confirmed-member',
    status: 'REQUESTED',
    requester: 'member',
  },
  {
    key: 'vip-approved',
    bookingKey: 'confirmed-vip',
    status: 'APPROVED',
    requester: 'member',
  },
  {
    key: 'guest-rejected',
    bookingKey: 'confirmed-guest',
    status: 'REJECTED',
    requester: 'guest',
  },
];

export async function seedApiFixtures(
  prisma: PrismaClient,
  context: ApiFixtureContext,
) {
  console.log('  🧩 Seeding API workflow fixtures...');
  const { stores, casts, users, coupons, transactions, now } = context;

  const categories = [
    ['nightlife-guide', 'Cẩm nang nightlife', 'BLOG'],
    ['events', 'Sự kiện', 'BLOG'],
    ['promotions', 'Ưu đãi', 'CAMPAIGN'],
    ['policies', 'Chính sách', 'POLICY'],
  ] as const;
  for (const [slug, name, type] of categories) {
    const id = seedUuid(`category:${slug}`);
    await prisma.category.upsert({
      where: { id },
      update: {
        slug,
        name,
        type,
        description: `Seed category for ${type.toLowerCase()} APIs`,
      },
      create: {
        id,
        slug,
        name,
        type,
        description: `Seed category for ${type.toLowerCase()} APIs`,
      },
    });
  }

  const favoritePairs = [
    ['member', 'sakura-moonlight'],
    ['member', 'rina-velvet'],
    ['vip', 'akari-jade'],
  ] as const;
  for (const [userKey, castSlug] of favoritePairs) {
    const user = users[userKey];
    const cast = casts[castSlug];
    if (!user || !cast) {
      throw new Error(
        `Missing favorite fixture relation: ${userKey}/${castSlug}`,
      );
    }
    const id = seedUuid(`favorite:${userKey}:${castSlug}`);
    await prisma.memberFavoriteCast.upsert({
      where: { id },
      update: { userId: user.id, castId: cast.id },
      create: { id, userId: user.id, castId: cast.id },
    });
  }

  const changeRequestIds: Record<string, string> = {};
  for (const fixture of CHANGE_REQUESTS) {
    const booking = transactions.bookings[fixture.bookingKey];
    if (!booking) {
      throw new Error(
        `Missing booking for change request: ${fixture.bookingKey}`,
      );
    }
    const id = seedUuid(`booking-change:${fixture.key}`);
    changeRequestIds[fixture.key] = id;
    const reviewed = fixture.status !== 'REQUESTED';
    const requestedAt = new Date(
      booking.scheduledAt.getTime() + 24 * 60 * 60 * 1000,
    );
    const data = {
      bookingId: booking.id,
      storeId: booking.storeId,
      castId: booking.castId,
      requestedById: fixture.requester === 'member' ? booking.userId : null,
      guestId: fixture.requester === 'guest' ? booking.guestId : null,
      reviewedById: reviewed ? (users.operator?.id ?? users.admin?.id) : null,
      type: 'RESCHEDULE' as const,
      status: fixture.status,
      currentScheduledAt: booking.scheduledAt,
      requestedScheduledAt: requestedAt,
      reason: `Seed reschedule scenario: ${fixture.key}`,
      adminNote: reviewed
        ? `Seed ${fixture.status.toLowerCase()} decision`
        : null,
      reviewedAt: reviewed ? seedDate(now, -1, 14) : null,
      createdAt: seedDate(now, -2, 9),
    };
    await prisma.bookingChangeRequest.upsert({
      where: { id },
      update: data,
      create: { id, ...data },
    });
  }

  const chatFixtures = [
    {
      key: 'member-general',
      bookingKey: 'confirmed-member',
      changeKey: null,
      senderType: 'MEMBER' as const,
      senderUserKey: 'member',
      guestKey: null,
      topic: 'GENERAL' as const,
      body: 'Cho mình xin xác nhận bàn gần sân khấu.',
    },
    {
      key: 'guest-reschedule',
      bookingKey: 'confirmed-guest',
      changeKey: 'guest-rejected',
      senderType: 'GUEST' as const,
      senderUserKey: null,
      guestKey: 'g8',
      topic: 'RESCHEDULE' as const,
      body: 'Tôi muốn đổi lịch sang ngày mai.',
    },
    {
      key: 'operator-reschedule',
      bookingKey: 'confirmed-member',
      changeKey: 'member-requested',
      senderType: 'OPERATOR' as const,
      senderUserKey: 'operator',
      guestKey: null,
      topic: 'RESCHEDULE' as const,
      body: 'Đã nhận yêu cầu, chúng tôi đang kiểm tra với quán.',
    },
    {
      key: 'admin-cancel',
      bookingKey: 'cancelled-guest',
      changeKey: null,
      senderType: 'ADMIN' as const,
      senderUserKey: 'admin',
      guestKey: null,
      topic: 'CANCEL' as const,
      body: 'Booking đã được hủy theo yêu cầu.',
    },
    {
      key: 'system-general',
      bookingKey: 'confirmed-vip',
      changeKey: 'vip-approved',
      senderType: 'SYSTEM' as const,
      senderUserKey: null,
      guestKey: null,
      topic: 'RESCHEDULE' as const,
      body: 'Lịch đặt chỗ đã được cập nhật.',
    },
  ];
  for (const fixture of chatFixtures) {
    const booking = transactions.bookings[fixture.bookingKey];
    const guest = fixture.guestKey
      ? transactions.guests[fixture.guestKey]
      : null;
    const sender = fixture.senderUserKey ? users[fixture.senderUserKey] : null;
    if (!booking) {
      throw new Error(`Missing booking for chat: ${fixture.bookingKey}`);
    }
    const id = seedUuid(`booking-chat:${fixture.key}`);
    const data = {
      bookingId: booking.id,
      changeRequestId: fixture.changeKey
        ? changeRequestIds[fixture.changeKey]
        : null,
      storeId: booking.storeId,
      senderUserId: sender?.id ?? null,
      guestId: guest?.id ?? null,
      senderType: fixture.senderType,
      topic: fixture.topic,
      body: fixture.body,
      createdAt: seedDate(now, -1, 15),
    };
    await prisma.bookingChatMessage.upsert({
      where: { id },
      update: data,
      create: { id, ...data },
    });
  }

  const extraIssues: Array<{
    key: string;
    couponCode: string;
    status: CouponIssueStatus;
    userKey?: string;
    guestKey?: string;
  }> = [
    {
      key: 'standalone-expired',
      couponCode: 'GUEST5',
      status: 'EXPIRED',
      guestKey: 'g4',
    },
    {
      key: 'standalone-revoked',
      couponCode: 'MEMBER8',
      status: 'REVOKED',
      userKey: 'member',
    },
  ];
  for (const fixture of extraIssues) {
    const coupon = coupons[fixture.couponCode];
    const user = fixture.userKey ? users[fixture.userKey] : null;
    const guest = fixture.guestKey
      ? transactions.guests[fixture.guestKey]
      : null;
    if (!coupon) {
      throw new Error(`Missing coupon for issue: ${fixture.couponCode}`);
    }
    const id = seedUuid(`coupon-issue:${fixture.key}`);
    const qr = buildSeedCouponQr(id, now, fixture.key);
    const data = {
      couponId: coupon.id,
      userId: user?.id ?? null,
      guestId: guest?.id ?? null,
      issuedById: users.admin?.id ?? null,
      scannedById: null,
      code: `SEED-${fixture.key.toUpperCase()}`,
      qrPayloadHash: qr.payloadHash,
      status: fixture.status,
      expiresAt: seedDate(now, -1, 12),
      usedAt: null,
      revokedAt: fixture.status === 'REVOKED' ? seedDate(now, -2, 12) : null,
      metadata: {
        seedKey: fixture.key,
        qrPayload: qr.payload,
        qrTokenHash: qr.tokenHash,
        userType: user ? 'MEMBER' : 'GUEST',
      },
      createdAt: seedDate(now, -5, 10),
    };
    await prisma.couponIssue.upsert({
      where: { id },
      update: data,
      create: { id, ...data },
    });
  }

  const submittedBill =
    transactions.bills['completed-guest-submitted'] ??
    transactions.bills['completed-guest-submitted-fixed'];
  if (!submittedBill) {
    throw new Error('Missing submitted bill for protected evidence fixture');
  }
  const evidenceStorageKey = 'seed-bill-evidence-submitted.png';
  const evidenceBytes = Buffer.from(
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAusB9WlS3ioAAAAASUVORK5CYII=',
    'base64',
  );
  materializeSeedUpload(evidenceStorageKey, evidenceBytes);
  const evidenceMediaId = seedUuid('media:bill-evidence');
  await prisma.media.upsert({
    where: { id: evidenceMediaId },
    update: {
      ownerId: users.partner1?.id ?? null,
      billId: submittedBill.id,
      storageKey: evidenceStorageKey,
      originalName: 'seed-bill-evidence.png',
      mimeType: 'image/png',
      sizeBytes: evidenceBytes.length,
      url: seedStorageUrl('PROTECTED', evidenceStorageKey),
      access: 'PROTECTED',
      status: 'READY',
      type: 'IMAGE',
      purpose: 'BILL_EVIDENCE',
      deletedAt: null,
    },
    create: {
      id: evidenceMediaId,
      ownerId: users.partner1?.id ?? null,
      billId: submittedBill.id,
      storageKey: evidenceStorageKey,
      originalName: 'seed-bill-evidence.png',
      mimeType: 'image/png',
      sizeBytes: evidenceBytes.length,
      url: seedStorageUrl('PROTECTED', evidenceStorageKey),
      access: 'PROTECTED',
      status: 'READY',
      type: 'IMAGE',
      purpose: 'BILL_EVIDENCE',
      metadata: { seed: true, note: 'Materialized protected seed fixture' },
    },
  });

  const draftContentId = seedUuid('content:partner-listing-draft');
  const draftStore = stores['moonlight-bar'];
  await prisma.content.upsert({
    where: { id: draftContentId },
    update: {
      authorId: users.partner1?.id ?? null,
      storeId: draftStore.id,
      title: 'Seed partner listing draft',
      slug: 'seed-partner-listing-draft',
      type: 'STORE_POST',
      status: 'DRAFT',
      body: 'Draft content used by partner review APIs.',
      metadata: {
        kind: 'PARTNER_LISTING_DRAFT',
        version: 1,
        seed: true,
      },
      publishedAt: null,
      deletedAt: null,
    },
    create: {
      id: draftContentId,
      authorId: users.partner1?.id ?? null,
      storeId: draftStore.id,
      title: 'Seed partner listing draft',
      slug: 'seed-partner-listing-draft',
      type: 'STORE_POST',
      status: 'DRAFT',
      body: 'Draft content used by partner review APIs.',
      metadata: {
        kind: 'PARTNER_LISTING_DRAFT',
        version: 1,
        seed: true,
      },
    },
  });

  const notificationIds: Record<string, string> = {};
  const notificationFixtures = [
    {
      key: 'booking-created',
      status: 'SENT' as const,
      templateKey: 'telegram.admin.booking.created.v1',
      bookingKey: 'requested-member',
      billKey: null,
      error: null,
    },
    {
      key: 'bill-submitted',
      status: 'QUEUED' as const,
      templateKey: 'telegram.admin.bill.submitted.v1',
      bookingKey: null,
      billKey: 'completed-guest-submitted',
      error: null,
    },
    {
      key: 'bill-rejected',
      status: 'FAILED' as const,
      templateKey: 'telegram.admin.bill.rejected.v1',
      bookingKey: null,
      billKey: 'completed-member-rejected',
      error: 'Seed Telegram delivery failure',
    },
    {
      key: 'partner-requested',
      status: 'SENT' as const,
      templateKey: 'telegram.admin.partner.requested.v1',
      bookingKey: null,
      billKey: null,
      error: null,
    },
  ];
  for (const fixture of notificationFixtures) {
    const id = seedUuid(`notification:${fixture.key}`);
    notificationIds[fixture.key] = id;
    const booking = fixture.bookingKey
      ? transactions.bookings[fixture.bookingKey]
      : null;
    const bill = fixture.billKey ? transactions.bills[fixture.billKey] : null;
    const data = {
      userId: booking?.userId ?? bill?.userId ?? null,
      guestId: booking?.guestId ?? bill?.guestId ?? null,
      storeId: booking?.storeId ?? bill?.storeId ?? null,
      bookingId: booking?.id ?? null,
      billId: bill?.id ?? null,
      channel: 'TELEGRAM' as const,
      status: fixture.status,
      recipient: 'SEED_ADMIN_CHAT',
      templateKey: fixture.templateKey,
      payload: { seed: true, fixture: fixture.key },
      error: fixture.error,
      sentAt: fixture.status === 'SENT' ? seedDate(now, -1, 16) : null,
      createdAt: seedDate(now, -1, 16),
    };
    await prisma.notificationLog.upsert({
      where: { id },
      update: data,
      create: { id, ...data },
    });
  }

  const requestFixtures = [
    {
      id: 'SEED-PARTNER-PENDING',
      status: 'PENDING_REVIEW' as const,
      storeSlug: 'moonlight-bar',
      reviewed: false,
      publicState: 'HIDDEN',
      notificationLogId: notificationIds['partner-requested'],
    },
    {
      id: 'SEED-PARTNER-APPROVED',
      status: 'APPROVED' as const,
      storeSlug: 'velvet-club',
      reviewed: true,
      publicState: 'PUBLIC',
      notificationLogId: null,
    },
    {
      id: 'SEED-PARTNER-REJECTED',
      status: 'REJECTED' as const,
      storeSlug: 'crimson-bar',
      reviewed: true,
      publicState: 'HIDDEN',
      notificationLogId: null,
    },
  ];
  for (const fixture of requestFixtures) {
    const store = stores[fixture.storeSlug];
    const data = {
      storeId: store.id,
      partnerUserId: store.ownerId,
      partnerAccountId: store.partnerAccountId,
      reviewedById: fixture.reviewed ? (users.admin?.id ?? null) : null,
      notificationLogId: fixture.notificationLogId,
      status: fixture.status,
      businessName: `${store.name} seed listing`,
      businessType: store.category,
      area: [store.district, store.city].filter(Boolean).join(', '),
      contactName: 'Seed Partner Contact',
      contactPhone: '+84909999000',
      contactEmail: `seed.${fixture.status.toLowerCase()}@nightlife.vn`,
      note: `Seed ${fixture.status.toLowerCase()} partner request`,
      storeDescription: store.description,
      storeAddress: store.address,
      storeCity: store.city,
      storeDistrict: store.district,
      openingHours: '18:00-02:00',
      menuSummary: 'Seed menu and pricing',
      mediaUrls: [],
      castProfiles: Prisma.JsonNull,
      draftCastIds: [],
      draftMediaIds: [],
      draftContentIds:
        fixture.status === 'PENDING_REVIEW' ? [draftContentId] : [],
      reviewReason: fixture.reviewed
        ? `Seed ${fixture.status.toLowerCase()} decision`
        : null,
      publicState: fixture.publicState,
      submittedAt: seedDate(now, -3, 10),
      reviewedAt: fixture.reviewed ? seedDate(now, -2, 10) : null,
      createdAt: seedDate(now, -3, 10),
    };
    await prisma.partnerRequest.upsert({
      where: { id: fixture.id },
      update: data,
      create: { id: fixture.id, ...data },
    });
  }

  const profileViewTargets = [
    ['STORE', stores['moonlight-bar'].id],
    ['STORE', stores['velvet-club'].id],
    ['CAST', casts['sakura-moonlight'].id],
    ['CAST', casts['rina-velvet'].id],
  ] as const;
  for (const [index, [targetType, targetId]] of profileViewTargets.entries()) {
    const id = seedUuid(`audit:profile-view:${index}`);
    await prisma.auditLog.upsert({
      where: { id },
      update: {
        actorId: null,
        actorType: 'SYSTEM',
        actorName: 'System',
        actorRole: 'SYSTEM',
        module: targetType === 'STORE' ? 'Store' : 'Cast',
        changeSummary: `Recorded profile view for ${targetType} ${targetId}`,
        result: 'SUCCESS',
        action: 'PROFILE_VIEW_RECORDED',
        targetType,
        targetId,
        metadata: { seed: true, source: 'public_profile' },
        createdAt: seedDate(now, -index, 18),
      },
      create: {
        id,
        actorId: null,
        actorType: 'SYSTEM',
        actorName: 'System',
        actorRole: 'SYSTEM',
        module: targetType === 'STORE' ? 'Store' : 'Cast',
        changeSummary: `Recorded profile view for ${targetType} ${targetId}`,
        result: 'SUCCESS',
        action: 'PROFILE_VIEW_RECORDED',
        targetType,
        targetId,
        metadata: { seed: true, source: 'public_profile' },
        createdAt: seedDate(now, -index, 18),
      },
    });
  }

  const commissionConfig = await prisma.commissionConfig.findFirst({
    where: { storeId: stores['moonlight-bar'].id, status: 'ACTIVE' },
    orderBy: { activeFrom: 'desc' },
  });
  const overrideCoupon = coupons.GUEST5;
  if (commissionConfig && overrideCoupon) {
    const current =
      commissionConfig.ruleSnapshot &&
      typeof commissionConfig.ruleSnapshot === 'object' &&
      !Array.isArray(commissionConfig.ruleSnapshot)
        ? commissionConfig.ruleSnapshot
        : {};
    const override = {
      couponId: overrideCoupon.id,
      couponCode: overrideCoupon.code,
      couponName: overrideCoupon.name,
      commissionPercent: 18,
      active: true,
      note: 'Seed campaign commission override',
      createdAt: seedDate(now, -30).toISOString(),
      createdById: users.admin?.id ?? null,
      updatedAt: now.toISOString(),
      updatedById: users.admin?.id ?? null,
    };
    await prisma.commissionConfig.update({
      where: { id: commissionConfig.id },
      data: {
        ruleSnapshot: {
          ...current,
          campaignCommissionOverrides: [override],
          campaignCommissionRates: {
            [overrideCoupon.id]: {
              commissionPercent: override.commissionPercent,
              active: true,
            },
            [overrideCoupon.code]: {
              commissionPercent: override.commissionPercent,
              active: true,
            },
          },
        },
      },
    });
  }

  console.log(
    '     ✓ categories, favorites, change requests, chat, partner review, notifications and audit fixtures',
  );
}
