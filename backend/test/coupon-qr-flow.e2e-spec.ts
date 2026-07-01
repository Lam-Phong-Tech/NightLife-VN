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
  id: 'coupon-1',
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

function firstHeaderValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
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

  const prisma = {
    coupon: {
      findFirst: jest.fn(),
      update: jest.fn(),
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

    accessService.canClaimMemberCoupon.mockResolvedValue(true);
    accessService.canViewMemberCoupon.mockResolvedValue(true);
    accessService.canConfirmCheckIn.mockResolvedValue(true);
    accessService.ensureStoreAccess.mockResolvedValue(undefined);
    prisma.auditLog.create.mockResolvedValue({ id: 'audit-1' });
    prisma.notificationLog.create.mockResolvedValue({ id: 'notification-1' });
    prisma.notificationLog.findMany.mockResolvedValue([]);
    prisma.coupon.findFirst.mockResolvedValue(couponRecord);
    prisma.coupon.update.mockImplementation(
      async (args: { data: { usedCount?: { increment: number } } }) => {
        couponRecord.usedCount += args.data.usedCount?.increment ?? 0;
        return couponRecord;
      },
    );
    prisma.couponIssue.findFirst.mockImplementation(
      async (args: { where?: { couponId?: string; userId?: string } }) => {
        if (
          issue &&
          issue.couponId === args.where?.couponId &&
          issue.userId === args.where?.userId &&
          issue.status === 'ISSUED'
        ) {
          return { id: issue.id };
        }

        return null;
      },
    );
    prisma.couponIssue.create.mockImplementation(
      async (args: { data: Record<string, unknown> }) => {
        issue = {
          id: String(args.data.id),
          couponId: String(args.data.couponId),
          code: String(args.data.code),
          guestId: null,
          userId: String(args.data.userId),
          status: 'ISSUED',
          expiresAt: args.data.expiresAt as Date,
          usedAt: null,
          scannedById: null,
          createdAt: new Date(),
          metadata: args.data.metadata as Record<string, unknown>,
          booking: null,
          coupon: couponRecord,
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

  it('claims to wallet, scans signed QR, confirms once, and blocks reuse', async () => {
    const claimResponse = await request(app.getHttpServer())
      .post('/coupons/coupon-1/member-claims')
      .set('x-test-role', 'USER')
      .set('x-test-user-id', 'member-1')
      .expect(201);

    expect(claimResponse.body).toEqual(
      expect.objectContaining({
        id: expect.any(String),
        status: 'ISSUED',
        userType: 'MEMBER',
        discountPercent: 8,
        qrPayload: expect.stringContaining('scanToken='),
        qrImageDataUrl: expect.stringMatching(/^data:image\/png;base64,/),
      }),
    );

    const walletResponse = await request(app.getHttpServer())
      .get('/member/coupon-issues')
      .set('x-test-role', 'USER')
      .set('x-test-user-id', 'member-1')
      .expect(200);

    expect(walletResponse.body).toEqual([
      expect.objectContaining({
        id: claimResponse.body.id,
        status: 'ISSUED',
        qrPayload: claimResponse.body.qrPayload,
        qrImageDataUrl: expect.stringMatching(/^data:image\/png;base64,/),
      }),
    ]);

    const scanResponse = await request(app.getHttpServer())
      .post('/partner/coupon-issues/scan')
      .set('x-test-role', 'PARTNER')
      .set('x-test-user-id', 'partner-1')
      .send({ payload: claimResponse.body.qrPayload })
      .expect(201);

    expect(scanResponse.body).toEqual(
      expect.objectContaining({
        id: claimResponse.body.id,
        status: 'ISSUED',
      }),
    );

    const confirmResponse = await request(app.getHttpServer())
      .post(`/partner/coupon-issues/${claimResponse.body.id}/confirm-check-in`)
      .set('x-test-role', 'PARTNER')
      .set('x-test-user-id', 'partner-1')
      .expect(201);

    expect(confirmResponse.body).toEqual(
      expect.objectContaining({
        id: claimResponse.body.id,
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
        id: claimResponse.body.id,
        status: 'USED',
        qrImageDataUrl: null,
      }),
    ]);

    const duplicateResponse = await request(app.getHttpServer())
      .post(`/partner/coupon-issues/${claimResponse.body.id}/confirm-check-in`)
      .set('x-test-role', 'PARTNER')
      .set('x-test-user-id', 'partner-1')
      .expect(422);

    expect(duplicateResponse.body.message).toBe(
      'Coupon issue has already been used',
    );
    expect(couponRecord.usedCount).toBe(1);
  });
});
