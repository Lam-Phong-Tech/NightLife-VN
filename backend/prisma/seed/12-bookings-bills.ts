import {
  Bill,
  BillStatus,
  Booking,
  BookingQr,
  BookingStatus,
  Cast,
  Coupon,
  CouponIssue,
  CouponIssueStatus,
  Guest,
  PointLedger,
  PrismaClient,
  Store,
  User,
} from '@prisma/client';
import { buildSeedCouponQr, seedDate, seedHash, seedUuid } from './shared';

type BookingSeed = {
  key: string;
  storeSlug: string;
  castSlug?: string;
  userKey?: string;
  guestKey?: string;
  status: BookingStatus;
  scheduledDaysOffset: number;
  partySize: number;
  note?: string;
  subtotalVnd: number;
  discountVnd: number;
  couponCode?: string;
  withQr?: boolean;
  billStatus?: BillStatus;
};

type GuestSeed = {
  key: string;
  displayName: string;
  phone: string;
  email: string;
  note?: string;
};

export type TransactionSeedResult = {
  guests: Record<string, Guest>;
  bookings: Record<string, Booking>;
  bookingQrs: Record<string, BookingQr>;
  couponIssues: Record<string, CouponIssue>;
  bills: Record<string, Bill>;
  pointLedgers: Record<string, PointLedger>;
};

const GUESTS: GuestSeed[] = [
  {
    key: 'g1',
    displayName: 'Tanaka Hiroshi',
    phone: '+81801234001',
    email: 'tanaka.h@guest.nightlife.vn',
    note: 'Prefers private booth',
  },
  {
    key: 'g2',
    displayName: 'Suzuki Yuki',
    phone: '+81801234002',
    email: 'suzuki.y@guest.nightlife.vn',
    note: 'First visit from Japan',
  },
  {
    key: 'g3',
    displayName: 'Trần Minh Đức',
    phone: '+84901234003',
    email: 'minhduc@guest.nightlife.vn',
  },
  {
    key: 'g4',
    displayName: 'Nguyễn Thu Hà',
    phone: '+84901234004',
    email: 'thuha@guest.nightlife.vn',
  },
  {
    key: 'g5',
    displayName: 'Watanabe Kenji',
    phone: '+81901234005',
    email: 'watanabe.k@guest.nightlife.vn',
  },
  {
    key: 'g6',
    displayName: 'Lê Hoàng Nam',
    phone: '+84911234006',
    email: 'hoangnam@guest.nightlife.vn',
  },
  {
    key: 'g7',
    displayName: 'Sato Akiko',
    phone: '+81701234007',
    email: 'sato.a@guest.nightlife.vn',
  },
  {
    key: 'g8',
    displayName: 'Phạm Quang Huy',
    phone: '+84921234008',
    email: 'quanghuy@guest.nightlife.vn',
  },
  {
    key: 'g9',
    displayName: 'Yamamoto Ren',
    phone: '+81801234009',
    email: 'yamamoto.r@guest.nightlife.vn',
  },
  {
    key: 'g10',
    displayName: 'Đỗ Thị Lan',
    phone: '+84931234010',
    email: 'thilan@guest.nightlife.vn',
  },
];

const BOOKINGS: BookingSeed[] = [
  {
    key: 'completed-member-paid',
    storeSlug: 'moonlight-bar',
    castSlug: 'sakura-moonlight',
    userKey: 'member',
    status: 'COMPLETED',
    scheduledDaysOffset: -15,
    partySize: 2,
    note: 'Seed: member completed and paid',
    subtotalVnd: 1_800_000,
    discountVnd: 90_000,
    couponCode: 'GUEST5',
    withQr: true,
    billStatus: 'PAID',
  },
  {
    key: 'completed-vip-verified',
    storeSlug: 'velvet-club',
    castSlug: 'aya-velvet',
    userKey: 'vip',
    status: 'COMPLETED',
    scheduledDaysOffset: -12,
    partySize: 4,
    note: 'Seed: VIP verified bill',
    subtotalVnd: 5_200_000,
    discountVnd: 416_000,
    couponCode: 'MEMBER8',
    withQr: true,
    billStatus: 'VERIFIED',
  },
  {
    key: 'completed-guest-submitted',
    storeSlug: 'sakura-lounge',
    castSlug: 'yuki-sakura-lounge',
    guestKey: 'g1',
    status: 'COMPLETED',
    scheduledDaysOffset: -10,
    partySize: 2,
    note: 'Seed: partner-submitted guest bill',
    subtotalVnd: 2_400_000,
    discountVnd: 240_000,
    couponCode: 'VIP10',
    withQr: true,
    billStatus: 'SUBMITTED',
  },
  {
    key: 'completed-guest-submitted-fixed',
    storeSlug: 'golden-voice-ktv',
    castSlug: 'mai-golden',
    guestKey: 'g3',
    status: 'COMPLETED',
    scheduledDaysOffset: -8,
    partySize: 6,
    note: 'Seed: fixed coupon bill pending review',
    subtotalVnd: 3_600_000,
    discountVnd: 100_000,
    couponCode: 'WELCOME100K',
    withQr: true,
    billStatus: 'SUBMITTED',
  },
  {
    key: 'completed-negative-commission',
    storeSlug: 'hanami-dining',
    castSlug: 'kaori-hanami',
    guestKey: 'g5',
    status: 'COMPLETED',
    scheduledDaysOffset: -7,
    partySize: 3,
    note: 'Seed: PM/BA negative commission review',
    subtotalVnd: 4_200_000,
    discountVnd: 800_000,
    billStatus: 'PENDING_PM_BA',
  },
  {
    key: 'completed-member-rejected',
    storeSlug: 'crimson-bar',
    castSlug: 'misaki-crimson',
    userKey: 'member',
    status: 'COMPLETED',
    scheduledDaysOffset: -5,
    partySize: 2,
    note: 'Seed: rejected evidence bill',
    subtotalVnd: 1_500_000,
    discountVnd: 200_000,
    couponCode: 'SPECIAL200K',
    withQr: true,
    billStatus: 'REJECTED',
  },
  {
    key: 'completed-guest-voided',
    storeSlug: 'neon-club',
    castSlug: 'yuna-neon',
    guestKey: 'g7',
    status: 'COMPLETED',
    scheduledDaysOffset: -4,
    partySize: 5,
    note: 'Seed: voided bill',
    subtotalVnd: 6_800_000,
    discountVnd: 0,
    withQr: true,
    billStatus: 'VOIDED',
  },
  {
    key: 'completed-guest-verified',
    storeSlug: 'tokyo-kitchen',
    castSlug: 'kotone-tokyo',
    guestKey: 'g9',
    status: 'COMPLETED',
    scheduledDaysOffset: -3,
    partySize: 4,
    subtotalVnd: 3_800_000,
    discountVnd: 0,
    billStatus: 'VERIFIED',
  },
  {
    key: 'completed-guest-paid-dn',
    storeSlug: 'dragon-rooftop-da-nang',
    castSlug: 'lina-dragon-rooftop',
    guestKey: 'g4',
    status: 'COMPLETED',
    scheduledDaysOffset: -6,
    partySize: 8,
    subtotalVnd: 7_200_000,
    discountVnd: 200_000,
    withQr: true,
    billStatus: 'PAID',
  },
  {
    key: 'completed-guest-paid-spa',
    storeSlug: 'lotus-massage-spa',
    castSlug: 'sumi-lotus-massage-spa',
    guestKey: 'g10',
    status: 'COMPLETED',
    scheduledDaysOffset: -2,
    partySize: 1,
    subtotalVnd: 1_200_000,
    discountVnd: 0,
    billStatus: 'PAID',
  },
  {
    key: 'completed-guest-paid-hn',
    storeSlug: 'jade-lounge',
    castSlug: 'akari-jade',
    guestKey: 'g2',
    status: 'COMPLETED',
    scheduledDaysOffset: -9,
    partySize: 2,
    subtotalVnd: 3_200_000,
    discountVnd: 0,
    withQr: true,
    billStatus: 'PAID',
  },
  {
    key: 'completed-guest-paid-ktv',
    storeSlug: 'star-ktv',
    castSlug: 'erika-star',
    guestKey: 'g6',
    status: 'COMPLETED',
    scheduledDaysOffset: -11,
    partySize: 5,
    subtotalVnd: 4_500_000,
    discountVnd: 0,
    billStatus: 'PAID',
  },
  {
    key: 'confirmed-vip',
    storeSlug: 'moonlight-bar',
    castSlug: 'miyuki-moonlight',
    userKey: 'vip',
    status: 'CONFIRMED',
    scheduledDaysOffset: 3,
    partySize: 2,
    note: 'Seed: active member booking QR',
    subtotalVnd: 2_000_000,
    discountVnd: 100_000,
    couponCode: 'GUEST5',
    withQr: true,
  },
  {
    key: 'confirmed-guest',
    storeSlug: 'sakura-lounge',
    castSlug: 'hana-sakura-lounge',
    guestKey: 'g8',
    status: 'CONFIRMED',
    scheduledDaysOffset: 5,
    partySize: 3,
    subtotalVnd: 2_700_000,
    discountVnd: 0,
    withQr: true,
  },
  {
    key: 'confirmed-member',
    storeSlug: 'velvet-club',
    castSlug: 'rina-velvet',
    userKey: 'member',
    status: 'CONFIRMED',
    scheduledDaysOffset: 7,
    partySize: 4,
    subtotalVnd: 4_800_000,
    discountVnd: 384_000,
    couponCode: 'MEMBER8',
    withQr: true,
  },
  {
    key: 'requested-guest',
    storeSlug: 'crimson-bar',
    guestKey: 'g2',
    status: 'REQUESTED',
    scheduledDaysOffset: 2,
    partySize: 2,
    subtotalVnd: 1_600_000,
    discountVnd: 0,
  },
  {
    key: 'requested-member',
    storeSlug: 'harbor-ktv-hai-phong',
    castSlug: 'mika-harbor-ktv',
    userKey: 'member',
    status: 'REQUESTED',
    scheduledDaysOffset: 4,
    partySize: 6,
    subtotalVnd: 3_000_000,
    discountVnd: 0,
  },
  {
    key: 'cancelled-guest',
    storeSlug: 'hanami-dining',
    guestKey: 'g6',
    status: 'CANCELLED',
    scheduledDaysOffset: -1,
    partySize: 2,
    subtotalVnd: 2_000_000,
    discountVnd: 0,
    withQr: true,
  },
  {
    key: 'no-show-guest',
    storeSlug: 'son-tra-lounge',
    guestKey: 'g8',
    status: 'NO_SHOW',
    scheduledDaysOffset: -2,
    partySize: 2,
    subtotalVnd: 1_800_000,
    discountVnd: 0,
    withQr: true,
  },
  {
    key: 'checked-in-guest',
    storeSlug: 'opera-spa-hai-phong',
    castSlug: 'yuri-opera-spa',
    guestKey: 'g10',
    status: 'CHECKED_IN',
    scheduledDaysOffset: 0,
    partySize: 1,
    subtotalVnd: 1_400_000,
    discountVnd: 0,
    withQr: true,
  },
];

function issueStatusForBooking(status: BookingStatus): CouponIssueStatus {
  if (status === 'CANCELLED') return 'REVOKED';
  if (status === 'NO_SHOW') return 'EXPIRED';
  if (status === 'COMPLETED' || status === 'CHECKED_IN') return 'USED';
  return 'ISSUED';
}

function qrStatusForBooking(status: BookingStatus) {
  if (status === 'CANCELLED') return 'REVOKED' as const;
  if (status === 'NO_SHOW') return 'EXPIRED' as const;
  if (status === 'COMPLETED' || status === 'CHECKED_IN') {
    return 'USED' as const;
  }
  return 'ACTIVE' as const;
}

export async function seedBookingsAndBills(
  prisma: PrismaClient,
  stores: Record<string, Store>,
  casts: Record<string, Cast>,
  users: Record<string, User>,
  coupons: Record<string, Coupon>,
  now: Date,
): Promise<TransactionSeedResult> {
  console.log('  📅 Seeding deterministic transactions...');

  const result: TransactionSeedResult = {
    guests: {},
    bookings: {},
    bookingQrs: {},
    couponIssues: {},
    bills: {},
    pointLedgers: {},
  };

  for (const fixture of GUESTS) {
    const id = seedUuid(`guest:${fixture.key}`);
    result.guests[fixture.key] = await prisma.guest.upsert({
      where: { id },
      update: {
        displayName: fixture.displayName,
        phone: fixture.phone,
        email: fixture.email,
        note: fixture.note ?? null,
        status: 'ACTIVE',
        deletedAt: null,
      },
      create: {
        id,
        displayName: fixture.displayName,
        phone: fixture.phone,
        email: fixture.email,
        note: fixture.note ?? null,
        status: 'ACTIVE',
      },
    });
  }

  const balances = new Map<string, number>();

  for (const fixture of BOOKINGS) {
    const store = stores[fixture.storeSlug];
    if (!store) {
      throw new Error(
        `Missing store for booking fixture: ${fixture.storeSlug}`,
      );
    }

    const cast = fixture.castSlug ? casts[fixture.castSlug] : undefined;
    if (fixture.castSlug && !cast) {
      throw new Error(`Missing cast for booking fixture: ${fixture.castSlug}`);
    }

    const user = fixture.userKey ? users[fixture.userKey] : undefined;
    const guest = fixture.guestKey
      ? result.guests[fixture.guestKey]
      : undefined;
    if (!user && !guest) {
      throw new Error(`Booking fixture ${fixture.key} has no customer`);
    }

    const coupon = fixture.couponCode ? coupons[fixture.couponCode] : undefined;
    if (fixture.couponCode && !coupon) {
      throw new Error(
        `Missing coupon for booking fixture: ${fixture.couponCode}`,
      );
    }
    if (coupon && coupon.storeId !== store.id) {
      throw new Error(
        `Coupon ${coupon.code} does not belong to ${fixture.storeSlug}`,
      );
    }

    const scheduledAt = seedDate(
      now,
      fixture.scheduledDaysOffset,
      fixture.status === 'CHECKED_IN' ? 21 : 20,
    );
    const createdAt = seedDate(
      now,
      Math.min(fixture.scheduledDaysOffset - 2, -1),
      10,
    );
    const couponIssueId = coupon
      ? seedUuid(`coupon-issue:${fixture.key}`)
      : null;

    if (coupon && couponIssueId) {
      const issueStatus = issueStatusForBooking(fixture.status);
      const qr = buildSeedCouponQr(couponIssueId, now, fixture.key);
      const issueCode = `SEED-${fixture.key.toUpperCase()}`;
      const expiresAt = new Date(scheduledAt.getTime() + 6 * 60 * 60 * 1000);
      const issueData = {
        couponId: coupon.id,
        userId: user?.id ?? null,
        guestId: guest?.id ?? null,
        issuedById: users.admin?.id ?? null,
        scannedById: issueStatus === 'USED' ? (store.ownerId ?? null) : null,
        code: issueCode,
        qrPayloadHash: qr.payloadHash,
        status: issueStatus,
        expiresAt,
        usedAt: issueStatus === 'USED' ? scheduledAt : null,
        revokedAt: issueStatus === 'REVOKED' ? createdAt : null,
        metadata: {
          seedKey: fixture.key,
          qrPayload: qr.payload,
          qrPayloadType: 'SIGNED_DEEP_LINK',
          qrTokenHash: qr.tokenHash,
          userType: user ? (user.tier === 'VIP' ? 'VIP' : 'MEMBER') : 'GUEST',
          discountPercent:
            coupon.discountType === 'PERCENT'
              ? coupon.discountValue
              : Math.round(
                  (fixture.discountVnd / fixture.subtotalVnd) * 10_000,
                ) / 100,
          discountRuleSnapshot: {
            type: coupon.discountType,
            value: coupon.discountValue,
            discountVnd: fixture.discountVnd,
            maxDiscountVnd: coupon.maxDiscountVnd,
            minSpendVnd: coupon.minSpendVnd,
          },
          campaignSnapshot: {
            id: coupon.id,
            code: coupon.code,
            storeId: store.id,
          },
        },
        createdAt,
      };
      result.couponIssues[fixture.key] = await prisma.couponIssue.upsert({
        where: { id: couponIssueId },
        update: issueData,
        create: { id: couponIssueId, ...issueData },
      });
    }

    const bookingId = seedUuid(`booking:${fixture.key}`);
    const bookingCode = `BK-${seedHash(`booking-code:${fixture.key}`)
      .slice(0, 6)
      .toUpperCase()}`;
    const totalVnd = Math.max(0, fixture.subtotalVnd - fixture.discountVnd);
    const bookingData = {
      bookingCode,
      userId: user?.id ?? null,
      guestId: guest?.id ?? null,
      storeId: store.id,
      castId: cast?.id ?? null,
      couponId: coupon?.id ?? null,
      couponIssueId,
      status: fixture.status,
      scheduledAt,
      partySize: fixture.partySize,
      note: fixture.note ?? `Seed booking: ${fixture.key}`,
      subtotalVnd: fixture.subtotalVnd,
      discountVnd: fixture.discountVnd,
      totalVnd,
      discountSnapshot: coupon
        ? {
            couponId: coupon.id,
            code: coupon.code,
            discountType: coupon.discountType,
            discountValue: coupon.discountValue,
          }
        : undefined,
      cancelReason:
        fixture.status === 'CANCELLED' ? 'Seed cancellation scenario' : null,
      cancelledAt:
        fixture.status === 'CANCELLED' ? seedDate(now, -1, 12) : null,
      createdAt,
      deletedAt: null,
    };
    const booking = await prisma.booking.upsert({
      where: { id: bookingId },
      update: bookingData,
      create: { id: bookingId, ...bookingData },
    });
    result.bookings[fixture.key] = booking;

    if (fixture.withQr) {
      const qrId = seedUuid(`booking-qr:${fixture.key}`);
      const code = `SEED-BOOKING-QR-${fixture.key.toUpperCase()}`;
      const qrStatus = qrStatusForBooking(fixture.status);
      const qrData = {
        bookingId: booking.id,
        storeId: store.id,
        code,
        qrPayloadHash: seedHash(`booking-qr-payload:${fixture.key}`),
        discountSnapshot: {
          discountVnd: fixture.discountVnd,
          couponCode: coupon?.code ?? null,
        },
        validFrom: new Date(scheduledAt.getTime() - 60 * 60 * 1000),
        expiresAt: new Date(scheduledAt.getTime() + 6 * 60 * 60 * 1000),
        status: qrStatus,
        usedAt: qrStatus === 'USED' ? scheduledAt : null,
        scannedByPartnerAccountId:
          qrStatus === 'USED' ? (store.partnerAccountId ?? null) : null,
        revokedAt: qrStatus === 'REVOKED' ? seedDate(now, -1, 12) : null,
      };
      result.bookingQrs[fixture.key] = await prisma.bookingQr.upsert({
        where: { id: qrId },
        update: qrData,
        create: { id: qrId, ...qrData },
      });
    }

    if (!fixture.billStatus) continue;

    const billId = seedUuid(`bill:${fixture.key}`);
    const serviceChargeVnd = Math.round(totalVnd * 0.05);
    const taxVnd = Math.round(totalVnd * 0.1);
    const paidVnd = totalVnd + serviceChargeVnd + taxVnd;
    const commissionPercent = 0;
    const commissionAmountVnd = 0;
    const reviewedStatuses: BillStatus[] = [
      'PENDING_PM_BA',
      'VERIFIED',
      'REJECTED',
      'PAID',
      'VOIDED',
    ];
    const verifiedStatuses: BillStatus[] = ['VERIFIED', 'PAID', 'VOIDED'];
    const submittedByUserId = user?.id ?? store.ownerId ?? null;
    const submittedByPartnerAccountId = user
      ? null
      : (store.partnerAccountId ?? null);
    const submittedAt = new Date(scheduledAt.getTime() + 30 * 60 * 1000);
    const reviewedAt = reviewedStatuses.includes(fixture.billStatus)
      ? new Date(submittedAt.getTime() + 30 * 60 * 1000)
      : null;
    const flags: string[] = [];
    const billData = {
      bookingId: booking.id,
      userId: user?.id ?? null,
      guestId: guest?.id ?? null,
      storeId: store.id,
      couponId: coupon?.id ?? null,
      couponIssueId,
      reviewedById: reviewedAt ? (users.admin?.id ?? null) : null,
      verifiedById: verifiedStatuses.includes(fixture.billStatus)
        ? (users.admin?.id ?? null)
        : null,
      rejectedById:
        fixture.billStatus === 'REJECTED'
          ? (users.operator?.id ?? users.admin?.id ?? null)
          : null,
      status: fixture.billStatus,
      submitterType: user ? 'MEMBER' : 'PARTNER',
      submittedByUserId,
      submittedByPartnerAccountId,
      billNumber: `SEED-BILL-${fixture.key.toUpperCase()}`,
      subtotalVnd: fixture.subtotalVnd,
      discountVnd: fixture.discountVnd,
      serviceChargeVnd,
      taxVnd,
      totalVnd,
      paidVnd,
      commissionAmountVnd,
      pointsEarned:
        user && verifiedStatuses.includes(fixture.billStatus)
          ? Math.floor(fixture.subtotalVnd / 100_000)
          : 0,
      discountRuleSnapshot: {
        version: 'bill-revenue-v1',
        basis: 'bill_gross_before_discount',
        couponId: coupon?.id ?? null,
        couponCode: coupon?.code ?? null,
        grossVnd: fixture.subtotalVnd,
        discountVnd: fixture.discountVnd,
      },
      commissionRuleSnapshot: {
        version: 'bill-revenue-v1',
        basis: 'bill_gross_before_discount',
        formula: 'commission disabled',
        source: 'COMMISSION_DISABLED',
        commissionPercent,
        grossVnd: fixture.subtotalVnd,
        discountVnd: fixture.discountVnd,
        commissionAmountVnd,
        requiresPmBaConfirmation: false,
        flags,
      },
      pointRuleSnapshot: {
        version: 'bill-loyalty-v1',
        basis: 'subtotalVnd',
        pointsPer100kVnd: 1,
      },
      submittedAt,
      reviewedAt,
      verifiedAt: verifiedStatuses.includes(fixture.billStatus)
        ? reviewedAt
        : null,
      rejectedAt: fixture.billStatus === 'REJECTED' ? reviewedAt : null,
      rejectReason:
        fixture.billStatus === 'REJECTED'
          ? 'Ảnh chứng từ không rõ tổng tiền'
          : null,
      usedAt: scheduledAt,
      paidAt:
        fixture.billStatus === 'PAID' || fixture.billStatus === 'VOIDED'
          ? new Date(submittedAt.getTime() + 60 * 60 * 1000)
          : null,
      createdAt: submittedAt,
      deletedAt: null,
    };
    const bill = await prisma.bill.upsert({
      where: { id: billId },
      update: billData,
      create: { id: billId, ...billData },
    });
    result.bills[fixture.key] = bill;

    if (
      user &&
      verifiedStatuses.includes(fixture.billStatus) &&
      bill.pointsEarned > 0
    ) {
      const previousBalance = balances.get(user.id) ?? 0;
      const balanceAfter = previousBalance + bill.pointsEarned;
      balances.set(user.id, balanceAfter);
      const ledgerId = seedUuid(`point-ledger:earn:${fixture.key}`);
      const ledgerData = {
        userId: user.id,
        bookingId: booking.id,
        billId: bill.id,
        type: 'EARN' as const,
        status: 'POSTED' as const,
        amountVnd: fixture.subtotalVnd,
        points: bill.pointsEarned,
        balanceAfter,
        description: `Seed points from ${fixture.storeSlug}`,
        ruleSnapshot: {
          basis: 'subtotalVnd',
          pointsPer100kVnd: 1,
        },
        expiresAt: seedDate(now, 365, 23, 59),
        postedAt: bill.verifiedAt,
        createdAt: bill.verifiedAt ?? submittedAt,
      };
      result.pointLedgers[fixture.key] = await prisma.pointLedger.upsert({
        where: { id: ledgerId },
        update: ledgerData,
        create: { id: ledgerId, ...ledgerData },
      });
    }
  }

  console.log(
    `     ✓ ${Object.keys(result.guests).length} guests, ` +
      `${Object.keys(result.bookings).length} bookings, ` +
      `${Object.keys(result.bookingQrs).length} booking QRs`,
  );
  console.log(
    `     ✓ ${Object.keys(result.couponIssues).length} coupon issues, ` +
      `${Object.keys(result.bills).length} bills, ` +
      `${Object.keys(result.pointLedgers).length} point ledgers`,
  );

  return result;
}
