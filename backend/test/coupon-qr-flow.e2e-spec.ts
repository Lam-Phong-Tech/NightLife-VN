import {
  CanActivate,
  ExecutionContext,
  INestApplication,
  UnauthorizedException,
  ValidationPipe,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { ActionPolicyGuard } from '../src/access/action-policy.guard';
import { AccessService } from '../src/access/access.service';
import { JwtAuthGuard } from '../src/auth/jwt-auth.guard';
import { RolesGuard } from '../src/auth/roles.guard';
import { NightlifeDataController } from '../src/nightlife-data/nightlife-data.controller';
import { NightlifeDataService } from '../src/nightlife-data/nightlife-data.service';
import { AdminNotificationService } from '../src/notifications/admin-notification.service';
import { PrismaService } from '../src/prisma/prisma.service';

type TestCouponIssue = {
  id: string;
  couponId: string;
  code: string;
  guestId: string | null;
  userId: string | null;
  status: string;
  expiresAt: Date | null;
  usedAt: Date | null;
  scannedById: string | null;
  createdAt: Date;
  metadata: Record<string, unknown>;
  booking: null;
  coupon: typeof couponRecord;
  guestPhone?: string | null;
};

class TestJwtGuard implements CanActivate {
  canActivate(context: ExecutionContext) {
    const req = context.switchToHttp().getRequest<{
      headers: Record<string, string | string[] | undefined>;
      user?: { id: string; role: string; tier?: string };
    }>();
    const role = firstHeaderValue(req.headers['x-test-role']);

    if (!role) {
      throw new UnauthorizedException();
    }

    req.user = {
      id: firstHeaderValue(req.headers['x-test-user-id']) ?? 'member-1',
      role,
      tier: firstHeaderValue(req.headers['x-test-tier']) ?? undefined,
    };

    return true;
  }
}

const storeRecord = {
  id: 'store-1',
  name: 'Neon Club',
  slug: 'neon-club',
};

const couponRecord = {
  id: '550e8400-e29b-41d4-a716-446655440002',
  code: 'MEMBER8',
  name: 'Member 8%',
  storeId: storeRecord.id,
  discountType: 'PERCENT',
  discountValue: 8,
  maxDiscountVnd: 800000,
  minSpendVnd: null,
  endsAt: null,
  usageLimit: 10,
  usedCount: 0,
  store: storeRecord,
};

const DAY_MS = 24 * 60 * 60 * 1000;

function firstHeaderValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function expectExpiresWithin(value: string, maxMs: number, startMs: number) {
  const expiresAt = new Date(value).getTime();

  expect(Number.isFinite(expiresAt)).toBe(true);
  expect(expiresAt).toBeGreaterThanOrEqual(startMs);
  expect(expiresAt).toBeLessThanOrEqual(startMs + maxMs + 5000);
}

function issueSnapshot(issue: TestCouponIssue) {
  return {
    ...issue,
    coupon: {
      ...issue.coupon,
      store: { ...issue.coupon.store },
    },
  };
}

function restoreEnv(key: string, value: string | undefined) {
  if (value === undefined) {
    delete process.env[key];
    return;
  }

  process.env[key] = value;
}

describe('Coupon QR full flow (e2e)', () => {
  let app: INestApplication;
  let issue: TestCouponIssue | null;
  let previousNodeEnv: string | undefined;
  let previousCouponQrSecret: string | undefined;
  let previousCouponQrPartnerUrl: string | undefined;
  let lastGuestPhone: string | null;

  const prisma = {
    $transaction: jest.fn(),
    guest: {
      create: jest.fn(),
    },
    coupon: {
      findFirst: jest.fn(),
      update: jest.fn(),
    },
    store: {
      findFirst: jest.fn(),
    },
    booking: {
      create: jest.fn(),
      findFirst: jest.fn(),
    },
    couponIssue: {
      create: jest.fn(),
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
      updateMany: jest.fn(),
    },
    auditLog: {
      create: jest.fn(),
    },
    notificationLog: {
      create: jest.fn(),
      findMany: jest.fn(),
    },
  };
  const accessService = {
    canClaimMemberCoupon: jest.fn(),
    canViewMemberCoupon: jest.fn(),
    canConfirmCheckIn: jest.fn(),
    ensureStoreAccess: jest.fn(),
  };
  const adminNotificationService = {
    notifyBookingCreated: jest.fn(),
    notifyBookingCancelled: jest.fn(),
    notifyBillSubmitted: jest.fn(),
    notifyBillReviewed: jest.fn(),
    notifyPartnerRequest: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    previousNodeEnv = process.env.NODE_ENV;
    previousCouponQrSecret = process.env.COUPON_QR_SECRET;
    previousCouponQrPartnerUrl = process.env.COUPON_QR_PARTNER_URL;
    process.env.NODE_ENV = 'test';
    process.env.COUPON_QR_SECRET = '0123456789abcdef0123456789abcdef';
    process.env.COUPON_QR_PARTNER_URL = 'https://nightlife.test/partner';
    couponRecord.usedCount = 0;
    issue = null;
    lastGuestPhone = null;

    prisma.$transaction.mockImplementation((callback) => callback(prisma));
    prisma.booking.findFirst.mockResolvedValue(null);
    accessService.canClaimMemberCoupon.mockResolvedValue(true);
    accessService.canViewMemberCoupon.mockResolvedValue(true);
    accessService.canConfirmCheckIn.mockResolvedValue(true);
    accessService.ensureStoreAccess.mockResolvedValue(undefined);
    prisma.auditLog.create.mockResolvedValue({ id: 'audit-1' });
    prisma.notificationLog.create.mockResolvedValue({ id: 'notification-1' });
    prisma.notificationLog.findMany.mockResolvedValue([]);
    prisma.store.findFirst.mockResolvedValue(storeRecord);
    prisma.booking.create.mockImplementation(
      async (args: { data: Record<string, unknown> }) => ({
        id: 'booking-1',
        storeId: args.data.storeId,
        userId: args.data.userId ?? null,
        guestId: args.data.guestId,
        status: args.data.status,
        scheduledAt: args.data.scheduledAt,
        partySize: args.data.partySize,
        couponId: args.data.couponId ?? null,
        couponIssueId: args.data.couponIssueId ?? null,
        guest: {
          id: args.data.guestId,
          displayName: 'Member QA',
          phone: '+84900000001',
          email: null,
        },
        user: {
          id: args.data.userId,
          displayName: 'Member QA',
          tier: 'FREE',
        },
        store: storeRecord,
        coupon: args.data.couponId
          ? {
              id: couponRecord.id,
              code: couponRecord.code,
              name: couponRecord.name,
            }
          : null,
        couponIssue: issue
          ? { id: issue.id, code: issue.code, status: issue.status }
          : null,
      }),
    );
    prisma.guest.create.mockImplementation(
      async (args: { data: { phone?: string } }) => {
        lastGuestPhone = args.data.phone ?? null;
        return { id: 'guest-1' };
      },
    );
    prisma.coupon.findFirst.mockResolvedValue(couponRecord);
    prisma.coupon.update.mockImplementation(
      async (args: { data: { usedCount?: { increment: number } } }) => {
        couponRecord.usedCount += args.data.usedCount?.increment ?? 0;
        return couponRecord;
      },
    );
    prisma.couponIssue.findFirst.mockImplementation(
      async (args: {
        where?: {
          couponId?: string;
          userId?: string;
          guest?: { is?: { phone?: string } };
        };
      }) => {
        const where = args.where ?? {};
        const guestPhone = where.guest?.is?.phone;

        if (
          !issue ||
          issue.couponId !== where.couponId ||
          issue.status !== 'ISSUED'
        ) {
          return null;
        }

        if (
          (where.userId && issue.userId === where.userId) ||
          (guestPhone && issue.guestPhone === guestPhone)
        ) {
          return { id: issue.id };
        }

        return null;
      },
    );
    prisma.couponIssue.create.mockImplementation(
      async (args: { data: Record<string, unknown> }) => {
        const guestId =
          typeof args.data.guestId === 'string' ? args.data.guestId : null;
        const userId =
          typeof args.data.userId === 'string' ? args.data.userId : null;
        issue = {
          id: String(args.data.id),
          couponId: String(args.data.couponId),
          code: String(args.data.code),
          guestId,
          userId,
          status: 'ISSUED',
          expiresAt: args.data.expiresAt as Date,
          usedAt: null,
          scannedById: null,
          createdAt: new Date(),
          metadata: args.data.metadata as Record<string, unknown>,
          booking: null,
          coupon: couponRecord,
          guestPhone: guestId ? lastGuestPhone : null,
        };

        return issueSnapshot(issue);
      },
    );
    prisma.couponIssue.findUnique.mockImplementation(async () =>
      issue ? issueSnapshot(issue) : null,
    );
    prisma.couponIssue.findMany.mockImplementation(
      async (args: { where?: { userId?: string } }) =>
        issue && issue.userId === args.where?.userId
          ? [issueSnapshot(issue)]
          : [],
    );
    prisma.couponIssue.update.mockImplementation(
      async (args: { data: { scannedById?: string } }) => {
        if (!issue) {
          return null;
        }

        issue = {
          ...issue,
          scannedById: args.data.scannedById ?? issue.scannedById,
        };
        return issueSnapshot(issue);
      },
    );
    prisma.couponIssue.updateMany.mockImplementation(
      async (args: {
        where?: Record<string, unknown>;
        data?: Record<string, unknown>;
      }) => {
        if (!issue) {
          return { count: 0 };
        }

        const where = args.where ?? {};
        const data = args.data ?? {};
        const expiresAt =
          issue.expiresAt?.getTime() ?? Number.POSITIVE_INFINITY;
        const now = Date.now();

        if (
          'expiresAt' in where &&
          issue.status === 'ISSUED' &&
          expiresAt <= now
        ) {
          issue = { ...issue, status: 'EXPIRED' };
          return { count: 1 };
        }

        if (
          where.id === issue.id &&
          where.status === 'ISSUED' &&
          issue.status === 'ISSUED' &&
          expiresAt > now
        ) {
          issue = {
            ...issue,
            status: 'USED',
            usedAt: data.usedAt as Date,
            scannedById: String(data.scannedById),
          };
          return { count: 1 };
        }

        return { count: 0 };
      },
    );

    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [NightlifeDataController],
      providers: [
        Reflector,
        RolesGuard,
        ActionPolicyGuard,
        NightlifeDataService,
        { provide: PrismaService, useValue: prisma },
        { provide: AccessService, useValue: accessService },
        {
          provide: AdminNotificationService,
          useValue: adminNotificationService,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useClass(TestJwtGuard)
      .compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        forbidNonWhitelisted: true,
        transform: true,
        whitelist: true,
      }),
    );
    await app.init();
  });

  afterEach(async () => {
    restoreEnv('NODE_ENV', previousNodeEnv);
    restoreEnv('COUPON_QR_SECRET', previousCouponQrSecret);
    restoreEnv('COUPON_QR_PARTNER_URL', previousCouponQrPartnerUrl);
    jest.useRealTimers();
    await app.close();
  });

  it('rejects independent guest coupon claim after Booking QR scope change', async () => {
    const response = await request(app.getHttpServer())
      .post('/coupons/coupon-1/guest-claims')
      .send({ displayName: 'Guest QA', phone: '+84900000001' })
      .expect(410);

    expect(response.body.message).toContain(
      'Independent coupon claim is not part of MVP v3.2',
    );
  });

  it('rejects independent member coupon claim after Booking QR scope change', async () => {
    const response = await request(app.getHttpServer())
      .post('/coupons/coupon-1/member-claims')
      .set('x-test-role', 'USER')
      .set('x-test-user-id', 'vip-1')
      .set('x-test-tier', 'VIP')
      .expect(410);

    expect(response.body.message).toContain(
      'Independent coupon claim is not part of MVP v3.2',
    );
  });

  it('issues Booking QR from booking, scans signed QR, confirms once, and blocks reuse', async () => {
    const scheduledAt = new Date(Date.now() + 2 * DAY_MS).toISOString();

    const bookingResponse = await request(app.getHttpServer())
      .post('/member/bookings')
      .set('x-test-role', 'USER')
      .set('x-test-user-id', 'member-1')
      .set('x-test-tier', 'MEMBER')
      .send({
        storeSlug: storeRecord.slug,
        couponId: couponRecord.id,
        displayName: 'Member QA',
        phone: '+84900000001',
        scheduledAt,
        partySize: 2,
      })
      .expect(201);

    expect(bookingResponse.body.couponIssue).toEqual(
      expect.objectContaining({
        id: expect.any(String),
        status: 'ISSUED',
      }),
    );

    const walletResponse = await request(app.getHttpServer())
      .get('/member/coupon-issues')
      .set('x-test-role', 'USER')
      .set('x-test-user-id', 'member-1')
      .set('x-test-tier', 'MEMBER')
      .expect(200);

    expect(walletResponse.body).toEqual([
      expect.objectContaining({
        id: bookingResponse.body.couponIssue.id,
        status: 'ISSUED',
        userType: 'MEMBER',
        discountPercent: 8,
        qrPayload: expect.stringContaining('scanToken='),
        qrImageDataUrl: expect.stringMatching(/^data:image\/png;base64,/),
      }),
    ]);
    expect(walletResponse.body[0].discountRuleSnapshot).toEqual(
      expect.objectContaining({
        discountPercent: 8,
        userType: 'MEMBER',
      }),
    );
    expectExpiresWithin(
      walletResponse.body[0].expiresAt,
      7 * DAY_MS,
      new Date(scheduledAt).getTime(),
    );

    const scanResponse = await request(app.getHttpServer())
      .post('/partner/coupon-issues/scan')
      .set('x-test-role', 'PARTNER')
      .set('x-test-user-id', 'partner-1')
      .send({ payload: walletResponse.body[0].qrPayload })
      .expect(201);

    expect(scanResponse.body).toEqual(
      expect.objectContaining({
        id: bookingResponse.body.couponIssue.id,
        status: 'ISSUED',
      }),
    );

    const confirmResponse = await request(app.getHttpServer())
      .post(
        `/partner/coupon-issues/${bookingResponse.body.couponIssue.id}/confirm-check-in`,
      )
      .set('x-test-role', 'PARTNER')
      .set('x-test-user-id', 'partner-1')
      .expect(201);

    expect(confirmResponse.body).toEqual(
      expect.objectContaining({
        id: bookingResponse.body.couponIssue.id,
        status: 'USED',
      }),
    );

    const usedWalletResponse = await request(app.getHttpServer())
      .get('/member/coupon-issues')
      .set('x-test-role', 'USER')
      .set('x-test-user-id', 'member-1')
      .expect(200);

    expect(usedWalletResponse.body).toEqual([
      expect.objectContaining({
        id: bookingResponse.body.couponIssue.id,
        status: 'USED',
        qrImageDataUrl: null,
      }),
    ]);

    const duplicateResponse = await request(app.getHttpServer())
      .post(
        `/partner/coupon-issues/${bookingResponse.body.couponIssue.id}/confirm-check-in`,
      )
      .set('x-test-role', 'PARTNER')
      .set('x-test-user-id', 'partner-1')
      .expect(422);

    expect(duplicateResponse.body.message).toBe(
      'Coupon issue has already been used',
    );
    expect(couponRecord.usedCount).toBe(1);
  });

  it('expires stale issued coupon issues and hides the wallet QR for EXPIRED', async () => {
    const scheduledAt = new Date(Date.now() + 2 * DAY_MS).toISOString();

    const bookingResponse = await request(app.getHttpServer())
      .post('/member/bookings')
      .set('x-test-role', 'USER')
      .set('x-test-user-id', 'member-expire-1')
      .send({
        storeSlug: storeRecord.slug,
        couponId: couponRecord.id,
        displayName: 'Member QA',
        phone: '+84900000001',
        scheduledAt,
        partySize: 2,
      })
      .expect(201);

    expect(bookingResponse.body.couponIssue.status).toBe('ISSUED');

    issue = issue
      ? { ...issue, expiresAt: new Date(Date.now() - 60_000) }
      : issue;

    const service = app.get(NightlifeDataService);
    await expect(service.expireCouponIssuesEveryFiveMinutes()).resolves.toEqual(
      { count: 1 },
    );
    expect(issue?.status).toBe('EXPIRED');

    const walletResponse = await request(app.getHttpServer())
      .get('/member/coupon-issues')
      .set('x-test-role', 'USER')
      .set('x-test-user-id', 'member-expire-1')
      .expect(200);

    expect(walletResponse.body).toEqual([
      expect.objectContaining({
        id: bookingResponse.body.couponIssue.id,
        status: 'EXPIRED',
        qrImageDataUrl: null,
      }),
    ]);
  });
});
