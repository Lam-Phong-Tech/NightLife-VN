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
import { AccessService } from '../src/access/access.service';
import { ActionPolicyGuard } from '../src/access/action-policy.guard';
import { JwtAuthGuard } from '../src/auth/jwt-auth.guard';
import { RolesGuard } from '../src/auth/roles.guard';
import { NightlifeDataController } from '../src/nightlife-data/nightlife-data.controller';
import { NightlifeDataService } from '../src/nightlife-data/nightlife-data.service';
import { AdminNotificationService } from '../src/notifications/admin-notification.service';
import { PrismaService } from '../src/prisma/prisma.service';

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

function firstHeaderValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

describe('Admin Coupon API (e2e)', () => {
  let app: INestApplication;

  const prisma = {
    $transaction: jest.fn(),
    adminCoupon: {
      findFirst: jest.fn(),
      update: jest.fn(),
    },
    adminCouponIssue: {
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    guest: {
      findFirst: jest.fn(),
      create: jest.fn(),
    },
    auditLog: {
      create: jest.fn(),
      findMany: jest.fn().mockResolvedValue([]),
    },
  };

  const accessService = {};
  const adminNotificationService = {};

  beforeEach(async () => {
    jest.clearAllMocks();
    prisma.$transaction.mockImplementation((callback: (tx: any) => unknown) => {
      return callback(prisma);
    });

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
      new ValidationPipe({ transform: true, whitelist: true }),
    );
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it('allows a member to claim an active admin coupon', async () => {
    const couponId = 'admin-coupon-1';
    prisma.adminCoupon.findFirst.mockResolvedValue({
      id: couponId,
      code: 'GLOBAL20',
      name: 'Global 20%',
      discountType: 'PERCENT',
      discountValue: 20,
      status: 'ACTIVE',
      startsAt: new Date(Date.now() - 3600000),
      endsAt: new Date(Date.now() + 3600000),
      usageLimit: 100,
      usedCount: 0,
      targetAudiences: ['MEMBER'],
    });

    prisma.adminCouponIssue.findFirst.mockResolvedValue(null);
    prisma.adminCouponIssue.create.mockResolvedValue({
      id: 'issue-1',
      adminCouponId: couponId,
      userId: 'member-1',
      code: 'MEMBER-claim-1',
      status: 'ISSUED',
      metadata: {},
    });

    const res = await request(app.getHttpServer())
      .post(`/admin-coupons/${couponId}/member-claims`)
      .set('x-test-role', 'USER')
      .set('x-test-user-id', 'member-1')
      .set('x-test-tier', 'MEMBER')
      .expect(201);

    const body = res.body as { id: string; code: string };
    expect(body.id).toBe('issue-1');
    expect(body.code).toBe('MEMBER-claim-1');
  });

  it('allows a guest to claim an active admin coupon', async () => {
    const couponId = 'admin-coupon-1';
    prisma.adminCoupon.findFirst.mockResolvedValue({
      id: couponId,
      code: 'GLOBAL20',
      name: 'Global 20%',
      discountType: 'PERCENT',
      discountValue: 20,
      status: 'ACTIVE',
      startsAt: new Date(Date.now() - 3600000),
      endsAt: new Date(Date.now() + 3600000),
      usageLimit: 100,
      usedCount: 0,
      targetAudiences: ['GUEST'],
    });

    prisma.guest.findFirst.mockResolvedValue({ id: 'guest-1' });
    prisma.adminCouponIssue.findFirst.mockResolvedValue(null);
    prisma.adminCouponIssue.create.mockResolvedValue({
      id: 'issue-2',
      adminCouponId: couponId,
      guestId: 'guest-1',
      code: 'GUEST-claim-1',
      status: 'ISSUED',
      metadata: {},
    });

    const res = await request(app.getHttpServer())
      .post(`/admin-coupons/${couponId}/guest-claims`)
      .send({
        phone: '+84901234567',
        displayName: 'Guest User',
      })
      .expect(201);

    const body = res.body as { id: string };
    expect(body.id).toBe('issue-2');
  });
});
