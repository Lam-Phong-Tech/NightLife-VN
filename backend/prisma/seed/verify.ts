import { PrismaClient } from '@prisma/client';
import { SeedProfile, seedDate } from './shared';

type StatusRow = { status: string };

function requireCondition(
  condition: unknown,
  message: string,
): asserts condition {
  if (!condition) {
    throw new Error(`Seed verification failed: ${message}`);
  }
}

function requireStatuses(
  name: string,
  rows: StatusRow[],
  expected: readonly string[],
) {
  const actual = new Set(rows.map((row) => row.status));
  const missing = expected.filter((status) => !actual.has(status));
  requireCondition(
    missing.length === 0,
    `${name} is missing statuses: ${missing.join(', ')}`,
  );
}

function requireValues(
  name: string,
  actualValues: readonly string[],
  expected: readonly string[],
) {
  const actual = new Set(actualValues);
  const missing = expected.filter((value) => !actual.has(value));
  requireCondition(
    missing.length === 0,
    `${name} is missing values: ${missing.join(', ')}`,
  );
}

export async function verifySeedCoverage(
  prisma: PrismaClient,
  profile: SeedProfile,
  now = new Date(),
) {
  const modelCounts = {
    User: await prisma.user.count(),
    Guest: await prisma.guest.count(),
    Profile: await prisma.profile.count(),
    Role: await prisma.role.count(),
    Permission: await prisma.permission.count(),
    RolePermission: await prisma.rolePermission.count(),
    UserRoleAssignment: await prisma.userRoleAssignment.count(),
    PartnerAccount: await prisma.partnerAccount.count(),
    Area: await prisma.area.count(),
    Store: await prisma.store.count(),
    Cast: await prisma.cast.count(),
    MemberFavoriteCast: await prisma.memberFavoriteCast.count(),
    Booking: await prisma.booking.count(),
    BookingQr: await prisma.bookingQr.count(),
    BookingChangeRequest: await prisma.bookingChangeRequest.count(),
    BookingChatMessage: await prisma.bookingChatMessage.count(),
    Coupon: await prisma.coupon.count(),
    CouponIssue: await prisma.couponIssue.count(),
    Bill: await prisma.bill.count(),
    PointLedger: await prisma.pointLedger.count(),
    Media: await prisma.media.count(),
    Content: await prisma.content.count(),
    NotificationLog: await prisma.notificationLog.count(),
    PartnerRequest: await prisma.partnerRequest.count(),
    AuditLog: await prisma.auditLog.count(),
    UserSession: await prisma.userSession.count(),
    TokenBlacklist: await prisma.tokenBlacklist.count(),
    PasswordResetToken: await prisma.passwordResetToken.count(),
    StorePermission: await prisma.storePermission.count(),
    RankingConfig: await prisma.rankingConfig.count(),
    Category: await prisma.category.count(),
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
  };

  const demoRequiredModels = [
    'User',
    'Guest',
    'Profile',
    'Role',
    'Permission',
    'RolePermission',
    'UserRoleAssignment',
    'PartnerAccount',
    'Area',
    'Store',
    'Cast',
    'MemberFavoriteCast',
    'Booking',
    'BookingQr',
    'BookingChangeRequest',
    'BookingChatMessage',
    'Coupon',
    'CouponIssue',
    'Bill',
    'PointLedger',
    'Media',
    'Content',
    'NotificationLog',
    'PartnerRequest',
    'AuditLog',
    'StorePermission',
    'RankingConfig',
    'Category',
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
  ] as const;
  const fullOnlyModels = [
    'UserSession',
    'TokenBlacklist',
    'PasswordResetToken',
  ] as const;
  const requiredModels =
    profile === 'full'
      ? [...demoRequiredModels, ...fullOnlyModels]
      : [...demoRequiredModels];
  const emptyModels = requiredModels.filter(
    (model) => modelCounts[model] === 0,
  );
  requireCondition(
    emptyModels.length === 0,
    `models without rows: ${emptyModels.join(', ')}`,
  );

  const [
    bookingStatuses,
    qrStatuses,
    issueStatuses,
    billStatuses,
    changeStatuses,
    partnerRequestStatuses,
    notificationStatuses,
  ] = await Promise.all([
    prisma.booking.findMany({ distinct: ['status'], select: { status: true } }),
    prisma.bookingQr.findMany({
      distinct: ['status'],
      select: { status: true },
    }),
    prisma.couponIssue.findMany({
      distinct: ['status'],
      select: { status: true },
    }),
    prisma.bill.findMany({ distinct: ['status'], select: { status: true } }),
    prisma.bookingChangeRequest.findMany({
      distinct: ['status'],
      select: { status: true },
    }),
    prisma.partnerRequest.findMany({
      distinct: ['status'],
      select: { status: true },
    }),
    prisma.notificationLog.findMany({
      distinct: ['status'],
      select: { status: true },
    }),
  ]);

  requireStatuses('Booking', bookingStatuses, [
    'REQUESTED',
    'CONFIRMED',
    'CHECKED_IN',
    'COMPLETED',
    'CANCELLED',
    'NO_SHOW',
  ]);
  requireStatuses('BookingQr', qrStatuses, [
    'ACTIVE',
    'USED',
    'EXPIRED',
    'REVOKED',
  ]);
  requireStatuses('CouponIssue', issueStatuses, [
    'ISSUED',
    'USED',
    'EXPIRED',
    'REVOKED',
  ]);
  requireStatuses('Bill', billStatuses, [
    'SUBMITTED',
    'PENDING_PM_BA',
    'VERIFIED',
    'REJECTED',
    'PAID',
    'VOIDED',
    ...(profile === 'full' ? ['DRAFT'] : []),
  ]);
  requireStatuses('BookingChangeRequest', changeStatuses, [
    'REQUESTED',
    'APPROVED',
    'REJECTED',
    ...(profile === 'full' ? ['CANCELLED', 'EXPIRED'] : []),
  ]);
  requireStatuses('PartnerRequest', partnerRequestStatuses, [
    'PENDING_REVIEW',
    'APPROVED',
    'REJECTED',
  ]);
  requireStatuses('NotificationLog', notificationStatuses, [
    'QUEUED',
    'SENT',
    'FAILED',
    ...(profile === 'full' ? ['CANCELLED'] : []),
  ]);

  const [
    deterministicBookings,
    deterministicBills,
    protectedEvidence,
    activePartnerQr,
    reviewableBills,
    revenueBills,
    relationChain,
    telegramLogs,
    profileViews,
  ] = await Promise.all([
    prisma.booking.count({ where: { note: { startsWith: 'Seed' } } }),
    prisma.bill.count({
      where: { billNumber: { startsWith: 'SEED-BILL-' } },
    }),
    prisma.media.count({
      where: {
        purpose: 'BILL_EVIDENCE',
        access: 'PROTECTED',
        status: 'READY',
        billId: { not: null },
      },
    }),
    prisma.bookingQr.count({
      where: {
        status: 'ACTIVE',
        booking: {
          store: { slug: { in: ['moonlight-bar', 'velvet-club'] } },
        },
      },
    }),
    prisma.bill.count({
      where: { status: { in: ['SUBMITTED', 'PENDING_PM_BA', 'REJECTED'] } },
    }),
    prisma.bill.count({
      where: {
        status: { in: ['VERIFIED', 'PAID'] },
        usedAt: { gte: seedDate(now, -30, 0), lte: seedDate(now, 1, 0) },
      },
    }),
    prisma.bill.count({
      where: {
        bookingId: { not: null },
        couponId: { not: null },
        couponIssueId: { not: null },
        booking: { couponIssueId: { not: null } },
        pointLedgers: { some: {} },
      },
    }),
    prisma.notificationLog.count({
      where: {
        channel: 'TELEGRAM',
        templateKey: { startsWith: 'telegram.admin.' },
      },
    }),
    prisma.auditLog.count({
      where: { action: 'PROFILE_VIEW_RECORDED' },
    }),
  ]);

  requireCondition(
    deterministicBookings === 20,
    `expected 20 deterministic bookings, found ${deterministicBookings}`,
  );
  requireCondition(
    deterministicBills >= 12,
    `expected at least 12 deterministic bills, found ${deterministicBills}`,
  );
  requireCondition(protectedEvidence > 0, 'protected bill evidence is missing');
  requireCondition(
    activePartnerQr > 0,
    'partner-scannable booking QR is missing',
  );
  requireCondition(reviewableBills > 0, 'admin bill review queue is empty');
  requireCondition(revenueBills > 0, 'revenue report has no recent bill');
  requireCondition(
    relationChain > 0,
    'coupon → issue → booking → bill → ledger relation is missing',
  );
  requireCondition(
    telegramLogs > 0,
    'admin Telegram dashboard logs are missing',
  );
  requireCondition(profileViews > 0, 'profile view audit fixtures are missing');

  if (profile === 'full') {
    const [
      userRows,
      guestRows,
      profileRows,
      roleRows,
      partnerRows,
      areaRows,
      storeRows,
      castRows,
      couponRows,
      pointRows,
      mediaRows,
      contentRows,
      sessionRows,
      rankingRows,
      notificationChannels,
      userRoles,
      userTiers,
      storeCategories,
      chatSenderTypes,
      chatTopics,
      discountTypes,
      pointTypes,
      mediaTypes,
      mediaAccess,
      contentTypes,
      rankingTargetTypes,
      supportTicketStatuses,
      supportSenderTypes,
      campaignStatuses,
      adminCouponStatuses,
      adminCouponIssueStatuses,
      tourStatuses,
    ] = await Promise.all([
      prisma.user.findMany({ distinct: ['status'], select: { status: true } }),
      prisma.guest.findMany({ distinct: ['status'], select: { status: true } }),
      prisma.profile.findMany({
        distinct: ['status'],
        select: { status: true },
      }),
      prisma.role.findMany({ distinct: ['status'], select: { status: true } }),
      prisma.partnerAccount.findMany({
        distinct: ['status'],
        select: { status: true },
      }),
      prisma.area.findMany({ distinct: ['status'], select: { status: true } }),
      prisma.store.findMany({ distinct: ['status'], select: { status: true } }),
      prisma.cast.findMany({ distinct: ['status'], select: { status: true } }),
      prisma.coupon.findMany({
        distinct: ['status'],
        select: { status: true },
      }),
      prisma.pointLedger.findMany({
        distinct: ['status'],
        select: { status: true },
      }),
      prisma.media.findMany({ distinct: ['status'], select: { status: true } }),
      prisma.content.findMany({
        distinct: ['status'],
        select: { status: true },
      }),
      prisma.userSession.findMany({
        distinct: ['status'],
        select: { status: true },
      }),
      prisma.rankingConfig.findMany({
        distinct: ['status'],
        select: { status: true },
      }),
      prisma.notificationLog.findMany({
        distinct: ['channel'],
        select: { channel: true },
      }),
      prisma.user.findMany({ distinct: ['role'], select: { role: true } }),
      prisma.user.findMany({ distinct: ['tier'], select: { tier: true } }),
      prisma.store.findMany({
        distinct: ['category'],
        select: { category: true },
      }),
      prisma.bookingChatMessage.findMany({
        distinct: ['senderType'],
        select: { senderType: true },
      }),
      prisma.bookingChatMessage.findMany({
        distinct: ['topic'],
        select: { topic: true },
      }),
      prisma.coupon.findMany({
        distinct: ['discountType'],
        select: { discountType: true },
      }),
      prisma.pointLedger.findMany({
        distinct: ['type'],
        select: { type: true },
      }),
      prisma.media.findMany({ distinct: ['type'], select: { type: true } }),
      prisma.media.findMany({ distinct: ['access'], select: { access: true } }),
      prisma.content.findMany({ distinct: ['type'], select: { type: true } }),
      prisma.rankingConfig.findMany({
        distinct: ['targetType'],
        select: { targetType: true },
      }),
      prisma.supportTicket.findMany({ distinct: ['status'], select: { status: true } }),
      prisma.supportMessage.findMany({ distinct: ['senderType'], select: { senderType: true } }),
      prisma.campaign.findMany({ distinct: ['status'], select: { status: true } }),
      prisma.adminCoupon.findMany({ distinct: ['status'], select: { status: true } }),
      prisma.adminCouponIssue.findMany({ distinct: ['status'], select: { status: true } }),
      prisma.tour.findMany({ distinct: ['status'], select: { status: true } }),
    ]);

    requireStatuses('User', userRows, ['ACTIVE', 'SUSPENDED', 'DELETED']);
    requireStatuses('Guest', guestRows, [
      'ACTIVE',
      'CONVERTED',
      'BLOCKED',
      'DELETED',
    ]);
    requireStatuses('Profile', profileRows, ['ACTIVE', 'HIDDEN', 'DELETED']);
    requireStatuses('Role', roleRows, ['ACTIVE', 'INACTIVE', 'DELETED']);
    requireStatuses('PartnerAccount', partnerRows, [
      'PENDING_REVIEW',
      'ACTIVE',
      'SUSPENDED',
      'CLOSED',
      'DELETED',
    ]);
    requireStatuses('Area', areaRows, ['ACTIVE', 'INACTIVE', 'DELETED']);
    requireStatuses('Store', storeRows, [
      'DRAFT',
      'PENDING_REVIEW',
      'ACTIVE',
      'SUSPENDED',
      'CLOSED',
      'DELETED',
    ]);
    requireStatuses('Cast', castRows, [
      'DRAFT',
      'PENDING_REVIEW',
      'ACTIVE',
      'OFF_DUTY',
      'SUSPENDED',
      'DELETED',
    ]);
    requireStatuses('Coupon', couponRows, [
      'DRAFT',
      'ACTIVE',
      'PAUSED',
      'EXPIRED',
      'ARCHIVED',
      'DELETED',
    ]);
    requireStatuses('PointLedger', pointRows, [
      'PENDING',
      'POSTED',
      'REVERSED',
      'EXPIRED',
    ]);
    requireStatuses('Media', mediaRows, [
      'UPLOADING',
      'READY',
      'HIDDEN',
      'DELETED',
    ]);
    requireStatuses('Content', contentRows, [
      'DRAFT',
      'PUBLISHED',
      'ARCHIVED',
      'DELETED',
    ]);
    requireStatuses('UserSession', sessionRows, [
      'ACTIVE',
      'REVOKED',
      'EXPIRED',
    ]);
    requireStatuses('RankingConfig', rankingRows, [
      'ACTIVE',
      'PAUSED',
      'EXPIRED',
      'DELETED',
    ]);

    const actualChannels = new Set(
      notificationChannels.map((row) => row.channel),
    );
    const missingChannels = (
      ['EMAIL', 'SMS', 'PUSH', 'IN_APP', 'ZALO', 'TELEGRAM', 'LINE'] as const
    ).filter((channel) => !actualChannels.has(channel));
    requireCondition(
      missingChannels.length === 0,
      `NotificationLog is missing channels: ${missingChannels.join(', ')}`,
    );
    requireValues(
      'UserRole',
      userRoles.map((row) => row.role),
      ['USER', 'PARTNER', 'OPERATOR', 'STAFF', 'ADMIN'],
    );
    requireValues(
      'UserTier',
      userTiers.map((row) => row.tier),
      ['FREE', 'MEMBER', 'PREMIUM', 'VIP'],
    );
    requireValues(
      'StoreCategory',
      storeCategories.map((row) => row.category),
      [
        'BAR',
        'CLUB',
        'LOUNGE',
        'GIRLS_BAR',
        'KARAOKE',
        'MASSAGE_SPA',
        'RESTAURANT',
        'CASINO',
      ],
    );
    requireValues(
      'BookingChatSenderType',
      chatSenderTypes.map((row) => row.senderType),
      ['GUEST', 'MEMBER', 'ADMIN', 'OPERATOR', 'SYSTEM'],
    );
    requireValues(
      'BookingChatTopic',
      chatTopics.map((row) => row.topic),
      ['GENERAL', 'RESCHEDULE', 'CANCEL'],
    );
    requireValues(
      'DiscountType',
      discountTypes.map((row) => row.discountType),
      ['PERCENT', 'FIXED_AMOUNT'],
    );
    requireValues(
      'PointLedgerType',
      pointTypes.map((row) => row.type),
      ['EARN', 'REDEEM', 'ADJUST', 'REVERSE', 'EXPIRE'],
    );
    requireValues(
      'MediaType',
      mediaTypes.map((row) => row.type),
      ['IMAGE', 'VIDEO', 'DOCUMENT', 'OTHER'],
    );
    requireValues(
      'MediaAccess',
      mediaAccess.map((row) => row.access),
      ['PUBLIC', 'PROTECTED'],
    );
    requireValues(
      'ContentType',
      contentTypes.map((row) => row.type),
      ['BLOG', 'STORE_POST', 'BANNER', 'POLICY', 'FAQ'],
    );
    requireValues(
      'RankingTargetType',
      rankingTargetTypes.map((row) => row.targetType),
      ['STORE', 'CAST', 'COUPON', 'CONTENT'],
    );
    requireStatuses('SupportTicket', supportTicketStatuses, ['PENDING', 'ACTIVE', 'CLOSED']);
    requireValues(
      'SupportSenderType',
      supportSenderTypes.map((row) => row.senderType),
      ['GUEST', 'USER', 'ADMIN', 'SYSTEM'],
    );
    requireStatuses('Campaign', campaignStatuses, ['ACTIVE', 'PAUSED', 'DRAFT', 'EXPIRED', 'DELETED']);
    requireStatuses('AdminCoupon', adminCouponStatuses, ['DRAFT', 'ACTIVE', 'PAUSED', 'EXPIRED', 'ARCHIVED', 'DELETED']);
    requireStatuses('AdminCouponIssue', adminCouponIssueStatuses, ['ISSUED', 'USED', 'EXPIRED', 'REVOKED']);
    requireStatuses('Tour', tourStatuses, ['ACTIVE', 'HIDDEN', 'DELETED']);
  }

  console.log(
    `  ✅ Seed coverage verified (${profile}): ${requiredModels.length}/${profile === 'full' ? 42 : 39} required models`,
  );

  return { profile, modelCounts };
}
