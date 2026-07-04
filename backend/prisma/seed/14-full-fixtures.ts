import {
  Area,
  Content,
  Coupon,
  MediaAccess,
  MediaStatus,
  MediaType,
  NotificationChannel,
  NotificationStatus,
  Prisma,
  PrismaClient,
  Role,
  Store,
  User,
} from '@prisma/client';
import { TransactionSeedResult } from './12-bookings-bills';
import {
  materializeSeedUpload,
  seedDate,
  seedHash,
  seedStorageUrl,
  seedUuid,
} from './shared';

type FullFixtureContext = {
  passwordHash: string;
  roles: Record<string, Role>;
  users: Record<string, User>;
  areas: Record<string, Area>;
  stores: Record<string, Store>;
  coupons: Record<string, Coupon>;
  transactions: TransactionSeedResult;
  now: Date;
};

export async function seedFullFixtures(
  prisma: PrismaClient,
  context: FullFixtureContext,
) {
  console.log('  🧪 Seeding full lifecycle and technical fixtures...');
  const {
    passwordHash,
    roles,
    users,
    areas,
    stores,
    coupons,
    transactions,
    now,
  } = context;

  const fullUsers = [
    {
      key: 'premium',
      email: 'seed.premium@nightlife.vn',
      displayName: 'Seed Premium Member',
      role: 'USER' as const,
      tier: 'PREMIUM' as const,
      status: 'ACTIVE' as const,
      roleKey: 'member',
      profileStatus: 'HIDDEN' as const,
      deletedAt: null,
    },
    {
      key: 'suspended',
      email: 'seed.suspended@nightlife.vn',
      displayName: 'Seed Suspended User',
      role: 'USER' as const,
      tier: 'MEMBER' as const,
      status: 'SUSPENDED' as const,
      roleKey: 'member',
      profileStatus: 'ACTIVE' as const,
      deletedAt: null,
    },
    {
      key: 'deleted',
      email: 'seed.deleted@nightlife.vn',
      displayName: 'Seed Deleted User',
      role: 'USER' as const,
      tier: 'FREE' as const,
      status: 'DELETED' as const,
      roleKey: 'member',
      profileStatus: 'DELETED' as const,
      deletedAt: seedDate(now, -30, 12),
    },
    {
      key: 'partner-state',
      email: 'seed.partner.states@nightlife.vn',
      displayName: 'Seed Partner States',
      role: 'PARTNER' as const,
      tier: 'FREE' as const,
      status: 'ACTIVE' as const,
      roleKey: 'partner',
      profileStatus: 'ACTIVE' as const,
      deletedAt: null,
    },
  ];
  const fullUserMap: Record<string, User> = {};
  for (const fixture of fullUsers) {
    const id = seedUuid(`full-user:${fixture.key}`);
    const user = await prisma.user.upsert({
      where: { id },
      update: {
        email: fixture.email,
        passwordHash,
        displayName: fixture.displayName,
        role: fixture.role,
        tier: fixture.tier,
        status: fixture.status,
        deletedAt: fixture.deletedAt,
      },
      create: {
        id,
        email: fixture.email,
        passwordHash,
        displayName: fixture.displayName,
        role: fixture.role,
        tier: fixture.tier,
        status: fixture.status,
        deletedAt: fixture.deletedAt,
      },
    });
    fullUserMap[fixture.key] = user;

    await prisma.profile.upsert({
      where: { userId: user.id },
      update: {
        fullName: fixture.displayName,
        bio: 'Full seed lifecycle fixture',
        status: fixture.profileStatus,
        deletedAt:
          fixture.profileStatus === 'DELETED' ? seedDate(now, -30, 12) : null,
      },
      create: {
        id: seedUuid(`full-profile:${fixture.key}`),
        userId: user.id,
        fullName: fixture.displayName,
        bio: 'Full seed lifecycle fixture',
        status: fixture.profileStatus,
        deletedAt:
          fixture.profileStatus === 'DELETED' ? seedDate(now, -30, 12) : null,
      },
    });

    const role = roles[fixture.roleKey];
    if (role) {
      await prisma.userRoleAssignment.upsert({
        where: {
          userId_roleId: { userId: user.id, roleId: role.id },
        },
        update: {},
        create: {
          id: seedUuid(`full-role-assignment:${fixture.key}`),
          userId: user.id,
          roleId: role.id,
        },
      });
    }
  }

  for (const fixture of [
    {
      key: 'seed-inactive-role',
      name: 'Seed Inactive Role',
      status: 'INACTIVE' as const,
      deletedAt: null,
    },
    {
      key: 'seed-deleted-role',
      name: 'Seed Deleted Role',
      status: 'DELETED' as const,
      deletedAt: seedDate(now, -30, 12),
    },
  ]) {
    const id = seedUuid(`full-role:${fixture.key}`);
    await prisma.role.upsert({
      where: { id },
      update: {
        key: fixture.key,
        name: fixture.name,
        description: 'Full seed role lifecycle fixture',
        status: fixture.status,
        deletedAt: fixture.deletedAt,
      },
      create: {
        id,
        key: fixture.key,
        name: fixture.name,
        description: 'Full seed role lifecycle fixture',
        status: fixture.status,
        deletedAt: fixture.deletedAt,
      },
    });
  }

  const partnerStateUser = fullUserMap['partner-state'];
  for (const status of [
    'PENDING_REVIEW',
    'SUSPENDED',
    'CLOSED',
    'DELETED',
  ] as const) {
    const id = seedUuid(`full-partner-account:${status}`);
    await prisma.partnerAccount.upsert({
      where: { id },
      update: {
        userId: partnerStateUser.id,
        businessName: `Seed Partner ${status}`,
        contactName: 'Seed Partner State',
        contactPhone: '+84908888000',
        contactEmail: `seed.partner.${status.toLowerCase()}@nightlife.vn`,
        status,
        deletedAt: status === 'DELETED' ? seedDate(now, -30, 12) : null,
      },
      create: {
        id,
        userId: partnerStateUser.id,
        businessName: `Seed Partner ${status}`,
        contactName: 'Seed Partner State',
        contactPhone: '+84908888000',
        contactEmail: `seed.partner.${status.toLowerCase()}@nightlife.vn`,
        status,
        deletedAt: status === 'DELETED' ? seedDate(now, -30, 12) : null,
      },
    });
  }

  for (const fixture of [
    { key: 'inactive', status: 'INACTIVE' as const, deletedAt: null },
    {
      key: 'deleted',
      status: 'DELETED' as const,
      deletedAt: seedDate(now, -30, 12),
    },
  ]) {
    const id = seedUuid(`full-area:${fixture.key}`);
    await prisma.area.upsert({
      where: { id },
      update: {
        code: `seed-${fixture.key}-area`,
        name: `Seed ${fixture.key} area`,
        city: 'Seed City',
        district: 'Seed District',
        status: fixture.status,
        deletedAt: fixture.deletedAt,
      },
      create: {
        id,
        code: `seed-${fixture.key}-area`,
        name: `Seed ${fixture.key} area`,
        city: 'Seed City',
        district: 'Seed District',
        status: fixture.status,
        deletedAt: fixture.deletedAt,
      },
    });
  }

  const storeStates = [
    'DRAFT',
    'PENDING_REVIEW',
    'SUSPENDED',
    'CLOSED',
    'DELETED',
  ] as const;
  const fullStoreMap: Record<string, Store> = {};
  for (const [index, status] of storeStates.entries()) {
    const id = seedUuid(`full-store:${status}`);
    const deletedAt = status === 'DELETED' ? seedDate(now, -30, 12) : null;
    fullStoreMap[status] = await prisma.store.upsert({
      where: { id },
      update: {
        ownerId: partnerStateUser.id,
        areaId: areas['hcm-q1']?.id ?? null,
        name: `Seed ${status} Store`,
        slug: `seed-${status.toLowerCase().replace('_', '-')}-store`,
        category: index % 2 === 0 ? 'BAR' : 'LOUNGE',
        description: `Full seed store status ${status}`,
        city: 'Ho Chi Minh City',
        district: 'Quận 1',
        status,
        deletedAt,
      },
      create: {
        id,
        ownerId: partnerStateUser.id,
        areaId: areas['hcm-q1']?.id ?? null,
        name: `Seed ${status} Store`,
        slug: `seed-${status.toLowerCase().replace('_', '-')}-store`,
        category: index % 2 === 0 ? 'BAR' : 'LOUNGE',
        description: `Full seed store status ${status}`,
        city: 'Ho Chi Minh City',
        district: 'Quận 1',
        status,
        deletedAt,
      },
    });
  }

  for (const status of [
    'DRAFT',
    'PENDING_REVIEW',
    'OFF_DUTY',
    'SUSPENDED',
    'DELETED',
  ] as const) {
    const id = seedUuid(`full-cast:${status}`);
    const data: Prisma.CastUncheckedCreateInput = {
      storeId: stores['moonlight-bar'].id,
      stageName: `Seed ${status} Cast`,
      slug: `seed-${status.toLowerCase().replace('_', '-')}-cast`,
      bio: `Full seed cast status ${status}`,
      isPublic: status === 'OFF_DUTY',
      status,
      deletedAt: status === 'DELETED' ? seedDate(now, -30, 12) : null,
    };
    await prisma.cast.upsert({
      where: { id },
      update: data,
      create: { ...data, id },
    });
  }

  for (const fixture of [
    {
      key: 'cancelled',
      bookingKey: 'cancelled-guest',
      status: 'CANCELLED' as const,
    },
    {
      key: 'expired',
      bookingKey: 'no-show-guest',
      status: 'EXPIRED' as const,
    },
  ]) {
    const booking = transactions.bookings[fixture.bookingKey];
    const id = seedUuid(`full-booking-change:${fixture.key}`);
    const data = {
      bookingId: booking.id,
      storeId: booking.storeId,
      castId: booking.castId,
      requestedById: booking.userId,
      guestId: booking.guestId,
      reviewedById: null,
      type: 'RESCHEDULE' as const,
      status: fixture.status,
      currentScheduledAt: booking.scheduledAt,
      requestedScheduledAt: seedDate(now, 2, 20),
      reason: `Full seed ${fixture.status.toLowerCase()} request`,
      reviewedAt: null,
      createdAt: seedDate(now, -7, 10),
    };
    await prisma.bookingChangeRequest.upsert({
      where: { id },
      update: data,
      create: { id, ...data },
    });
  }

  for (const [index, status] of (
    ['DRAFT', 'PAUSED', 'EXPIRED', 'ARCHIVED', 'DELETED'] as const
  ).entries()) {
    const id = seedUuid(`full-coupon:${status}`);
    const deletedAt = status === 'DELETED' ? seedDate(now, -30, 12) : null;
    const data = {
      storeId: stores['moonlight-bar'].id,
      code: `SEED-COUPON-${status}`,
      name: `Seed ${status} Coupon`,
      description: `Full seed coupon status ${status}`,
      discountType:
        index % 2 === 0 ? ('PERCENT' as const) : ('FIXED_AMOUNT' as const),
      discountValue: index % 2 === 0 ? 5 : 100_000,
      usageLimit: 10,
      startsAt: seedDate(now, status === 'DRAFT' ? 5 : -30, 0),
      endsAt: seedDate(now, status === 'EXPIRED' ? -1 : 30, 23, 59),
      status,
      deletedAt,
    };
    await prisma.coupon.upsert({
      where: { id },
      update: data,
      create: { id, ...data },
    });
  }

  const draftBillId = seedUuid('full-bill:draft');
  const premiumUser = fullUserMap.premium;
  await prisma.bill.upsert({
    where: { id: draftBillId },
    update: {
      userId: premiumUser.id,
      storeId: stores['moonlight-bar'].id,
      status: 'DRAFT',
      submitterType: 'MEMBER',
      submittedByUserId: premiumUser.id,
      billNumber: 'SEED-BILL-DRAFT',
      subtotalVnd: 900_000,
      totalVnd: 900_000,
      paidVnd: 900_000,
      usedAt: seedDate(now, -1, 21),
      deletedAt: null,
    },
    create: {
      id: draftBillId,
      userId: premiumUser.id,
      storeId: stores['moonlight-bar'].id,
      status: 'DRAFT',
      submitterType: 'MEMBER',
      submittedByUserId: premiumUser.id,
      billNumber: 'SEED-BILL-DRAFT',
      subtotalVnd: 900_000,
      totalVnd: 900_000,
      paidVnd: 900_000,
      usedAt: seedDate(now, -1, 21),
    },
  });

  for (const [index, status] of (['INACTIVE', 'ARCHIVED'] as const).entries()) {
    const id = seedUuid(`full-commission:${status}`);
    const data = {
      storeId: stores['moonlight-bar'].id,
      createdById: users.admin?.id ?? null,
      commissionType:
        index === 0 ? ('FIXED_AMOUNT' as const) : ('PERCENT' as const),
      commissionValue: index === 0 ? 250_000 : 15,
      pointEarnRate: 0.01,
      status,
      activeFrom: seedDate(now, -60, 0),
      activeTo: seedDate(now, -30, 23, 59),
      ruleSnapshot: { seed: true, lifecycleStatus: status },
    };
    await prisma.commissionConfig.upsert({
      where: { id },
      update: data,
      create: { id, ...data },
    });
  }

  const earnLedger =
    transactions.pointLedgers['completed-member-paid'] ??
    Object.values(transactions.pointLedgers)[0];
  const ledgerFixtures = [
    {
      key: 'redeem',
      type: 'REDEEM' as const,
      status: 'POSTED' as const,
      points: -5,
      reversedLedgerId: null,
    },
    {
      key: 'adjust-pending',
      type: 'ADJUST' as const,
      status: 'PENDING' as const,
      points: 5,
      reversedLedgerId: null,
    },
    {
      key: 'reverse',
      type: 'REVERSE' as const,
      status: 'REVERSED' as const,
      points: -(earnLedger?.points ?? 1),
      reversedLedgerId: earnLedger?.id ?? null,
    },
    {
      key: 'expire',
      type: 'EXPIRE' as const,
      status: 'EXPIRED' as const,
      points: -10,
      reversedLedgerId: null,
    },
  ];
  for (const fixture of ledgerFixtures) {
    const id = seedUuid(`full-point-ledger:${fixture.key}`);
    const data = {
      userId: users.member.id,
      bookingId: null,
      billId: fixture.type === 'REVERSE' ? (earnLedger?.billId ?? null) : null,
      reversedLedgerId: fixture.reversedLedgerId,
      type: fixture.type,
      status: fixture.status,
      amountVnd: 0,
      points: fixture.points,
      balanceAfter: 0,
      description: `Full seed ${fixture.type.toLowerCase()} ledger`,
      ruleSnapshot: { seed: true },
      expiresAt: fixture.type === 'EXPIRE' ? seedDate(now, -1, 23, 59) : null,
      postedAt: fixture.status === 'POSTED' ? seedDate(now, -2, 12) : null,
      createdAt: seedDate(now, -3, 12),
    };
    await prisma.pointLedger.upsert({
      where: { id },
      update: data,
      create: { id, ...data },
    });
  }

  const mediaFixtures: Array<{
    key: string;
    type: MediaType;
    access: MediaAccess;
    status: MediaStatus;
    mimeType: string;
  }> = [
    {
      key: 'document-protected',
      type: 'DOCUMENT',
      access: 'PROTECTED',
      status: 'READY',
      mimeType: 'application/pdf',
    },
    {
      key: 'other-uploading',
      type: 'OTHER',
      access: 'PROTECTED',
      status: 'UPLOADING',
      mimeType: 'application/octet-stream',
    },
    {
      key: 'image-hidden',
      type: 'IMAGE',
      access: 'PUBLIC',
      status: 'HIDDEN',
      mimeType: 'image/jpeg',
    },
    {
      key: 'video-deleted',
      type: 'VIDEO',
      access: 'PUBLIC',
      status: 'DELETED',
      mimeType: 'video/mp4',
    },
  ];
  const documentStorageKey = 'seed-full-document-protected.pdf';
  materializeSeedUpload(
    documentStorageKey,
    [
      '%PDF-1.1',
      '1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj',
      '2 0 obj<</Type/Pages/Count 0/Kids[]>>endobj',
      'trailer<</Root 1 0 R>>',
      '%%EOF',
    ].join('\n'),
  );
  for (const fixture of mediaFixtures) {
    const id = seedUuid(`full-media:${fixture.key}`);
    const storageKey =
      fixture.key === 'document-protected'
        ? documentStorageKey
        : `seed-full-${fixture.key}.fixture`;
    const data = {
      ownerId: users.admin.id,
      storeId: stores['moonlight-bar'].id,
      storageKey,
      originalName: `${fixture.key}.fixture`,
      mimeType: fixture.mimeType,
      sizeBytes: 1_024,
      url: seedStorageUrl(fixture.access, storageKey),
      purpose: 'FULL_SEED_COVERAGE',
      type: fixture.type,
      access: fixture.access,
      status: fixture.status,
      metadata: { seed: true },
      deletedAt: fixture.status === 'DELETED' ? seedDate(now, -30, 12) : null,
    };
    await prisma.media.upsert({
      where: { id },
      update: data,
      create: { id, ...data },
    });
  }

  const fullContent: Array<{
    key: string;
    type: 'BANNER' | 'FAQ' | 'BLOG';
    status: 'DRAFT' | 'ARCHIVED' | 'DELETED';
  }> = [
    { key: 'banner-draft', type: 'BANNER', status: 'DRAFT' },
    { key: 'faq-archived', type: 'FAQ', status: 'ARCHIVED' },
    { key: 'blog-deleted', type: 'BLOG', status: 'DELETED' },
  ];
  const fullContentMap: Record<string, Content> = {};
  for (const fixture of fullContent) {
    const id = seedUuid(`full-content:${fixture.key}`);
    const data = {
      authorId: users.admin.id,
      storeId: stores['moonlight-bar'].id,
      title: `Seed ${fixture.key}`,
      slug: `seed-${fixture.key}`,
      type: fixture.type,
      status: fixture.status,
      excerpt: 'Full seed content lifecycle fixture',
      body: 'This record exists for full seed coverage.',
      metadata: { seed: true },
      publishedAt: fixture.status === 'ARCHIVED' ? seedDate(now, -30, 8) : null,
      deletedAt: fixture.status === 'DELETED' ? seedDate(now, -30, 12) : null,
    };
    fullContentMap[fixture.key] = await prisma.content.upsert({
      where: { id },
      update: data,
      create: { id, ...data },
    });
  }

  const channels: NotificationChannel[] = [
    'EMAIL',
    'SMS',
    'PUSH',
    'IN_APP',
    'ZALO',
    'TELEGRAM',
    'LINE',
  ];
  const notificationStatuses: NotificationStatus[] = [
    'QUEUED',
    'SENT',
    'FAILED',
    'CANCELLED',
  ];
  for (const [index, channel] of channels.entries()) {
    const status = notificationStatuses[index % notificationStatuses.length];
    const id = seedUuid(`full-notification:${channel}`);
    const data = {
      userId: premiumUser.id,
      channel,
      status,
      recipient: `seed-${channel.toLowerCase()}-recipient`,
      templateKey: `seed.full.${channel.toLowerCase()}.v1`,
      payload: { seed: true, channel },
      error: status === 'FAILED' ? 'Seed delivery error' : null,
      sentAt: status === 'SENT' ? seedDate(now, -1, 12) : null,
      createdAt: seedDate(now, -1, 11),
    };
    await prisma.notificationLog.upsert({
      where: { id },
      update: data,
      create: { id, ...data },
    });
  }

  const rankTargets = [
    {
      key: 'coupon-paused',
      targetType: 'COUPON' as const,
      targetId: coupons.GUEST5.id,
      status: 'PAUSED' as const,
    },
    {
      key: 'content-expired',
      targetType: 'CONTENT' as const,
      targetId: fullContentMap['faq-archived'].id,
      status: 'EXPIRED' as const,
    },
    {
      key: 'content-deleted',
      targetType: 'CONTENT' as const,
      targetId: fullContentMap['blog-deleted'].id,
      status: 'DELETED' as const,
    },
  ];
  for (const [index, fixture] of rankTargets.entries()) {
    const id = seedUuid(`full-ranking:${fixture.key}`);
    const data = {
      createdById: users.admin.id,
      areaId: areas['hcm-q1']?.id ?? null,
      targetType: fixture.targetType,
      targetId: fixture.targetId,
      cityCode: 'hcm',
      scope: 'full-seed',
      manualScore: 30 - index,
      pinRank: null,
      sponsored: false,
      reason: `Full seed ${fixture.targetType} ranking`,
      status: fixture.status,
      startsAt: seedDate(now, -30, 0),
      endsAt: seedDate(now, -1, 23, 59),
      deletedAt:
        fixture.status === 'DELETED' ? seedDate(now, -1, 23, 59) : null,
    };
    await prisma.rankingConfig.upsert({
      where: { id },
      update: data,
      create: { id, ...data },
    });
  }

  const sessionFixtures = [
    {
      key: 'active',
      status: 'ACTIVE' as const,
      expiresAt: seedDate(now, 7, 23, 59),
      revokedAt: null,
    },
    {
      key: 'revoked',
      status: 'REVOKED' as const,
      expiresAt: seedDate(now, 7, 23, 59),
      revokedAt: seedDate(now, -1, 12),
    },
    {
      key: 'expired',
      status: 'EXPIRED' as const,
      expiresAt: seedDate(now, -1, 23, 59),
      revokedAt: null,
    },
  ];
  for (const fixture of sessionFixtures) {
    const id = seedUuid(`full-session:${fixture.key}`);
    const data = {
      userId: premiumUser.id,
      jti: `seed-session-${fixture.key}`,
      status: fixture.status,
      userAgent: 'NightLife Seed Validator',
      ipAddress: '127.0.0.1',
      expiresAt: fixture.expiresAt,
      lastSeenAt: seedDate(now, -1, 10),
      revokedAt: fixture.revokedAt,
      createdAt: seedDate(now, -2, 10),
    };
    await prisma.userSession.upsert({
      where: { id },
      update: data,
      create: { id, ...data },
    });
  }

  const blacklistId = seedUuid('full-token-blacklist:revoked');
  await prisma.tokenBlacklist.upsert({
    where: { id: blacklistId },
    update: {
      jti: 'seed-session-revoked',
      userId: premiumUser.id,
      reason: 'Full seed revoked token fixture; no matching JWT exists',
      expiresAt: seedDate(now, 7, 23, 59),
    },
    create: {
      id: blacklistId,
      jti: 'seed-session-revoked',
      userId: premiumUser.id,
      reason: 'Full seed revoked token fixture; no matching JWT exists',
      expiresAt: seedDate(now, 7, 23, 59),
    },
  });

  for (const fixture of [
    { key: 'used', verified: true, used: true },
    { key: 'expired', verified: false, used: false },
  ]) {
    const id = seedUuid(`full-password-reset:${fixture.key}`);
    const data = {
      userId: premiumUser.id,
      email: premiumUser.email,
      codeHash: seedHash(`non-usable-seed-code:${fixture.key}`),
      resetTokenHash: fixture.verified
        ? seedHash(`non-usable-seed-reset-token:${fixture.key}`)
        : null,
      expiresAt: seedDate(now, -1, 12),
      verifiedAt: fixture.verified ? seedDate(now, -2, 12) : null,
      usedAt: fixture.used ? seedDate(now, -2, 13) : null,
      createdAt: seedDate(now, -3, 12),
    };
    await prisma.passwordResetToken.upsert({
      where: { id },
      update: data,
      create: { id, ...data },
    });
  }

  const permissionFixtures = [
    {
      key: 'inactive',
      store: fullStoreMap.DRAFT,
      status: 'INACTIVE' as const,
      deletedAt: null,
    },
    {
      key: 'deleted',
      store: fullStoreMap.DELETED,
      status: 'DELETED' as const,
      deletedAt: seedDate(now, -30, 12),
    },
  ];
  for (const fixture of permissionFixtures) {
    const id = seedUuid(`full-store-permission:${fixture.key}`);
    const data = {
      userId: partnerStateUser.id,
      storeId: fixture.store.id,
      permissions: ['store.partner.view'],
      status: fixture.status,
      deletedAt: fixture.deletedAt,
    };
    await prisma.storePermission.upsert({
      where: { id },
      update: data,
      create: { id, ...data },
    });
  }

  for (const fixture of [
    {
      key: 'guest-converted',
      status: 'CONVERTED' as const,
      convertedUserId: premiumUser.id,
      deletedAt: null,
    },
    {
      key: 'guest-blocked',
      status: 'BLOCKED' as const,
      convertedUserId: null,
      deletedAt: null,
    },
    {
      key: 'guest-deleted',
      status: 'DELETED' as const,
      convertedUserId: null,
      deletedAt: seedDate(now, -30, 12),
    },
  ]) {
    const id = seedUuid(`full-${fixture.key}`);
    await prisma.guest.upsert({
      where: { id },
      update: {
        convertedUserId: fixture.convertedUserId,
        displayName: `Seed ${fixture.status} Guest`,
        email: `${fixture.key}@guest.nightlife.vn`,
        status: fixture.status,
        deletedAt: fixture.deletedAt,
      },
      create: {
        id,
        convertedUserId: fixture.convertedUserId,
        displayName: `Seed ${fixture.status} Guest`,
        email: `${fixture.key}@guest.nightlife.vn`,
        status: fixture.status,
        deletedAt: fixture.deletedAt,
      },
    });
  }

  console.log(
    '     ✓ every schema model plus lifecycle, media/content, ranking and auth technical states',
  );
}
