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
      user?: { id: string; role: string };
    }>();
    const role = firstHeaderValue(req.headers['x-test-role']);

    if (!role) {
      throw new UnauthorizedException();
    }

    req.user = {
      id: firstHeaderValue(req.headers['x-test-user-id']) ?? 'admin-1',
      role,
    };

    return true;
  }
}

function firstHeaderValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

describe('Bill approval API (e2e)', () => {
  let app: INestApplication;

  const prisma = {
    $transaction: jest.fn(),
    bill: {
      findFirst: jest.fn(),
      update: jest.fn(),
    },
    commissionConfig: {
      findFirst: jest.fn(),
    },
    auditLog: {
      create: jest.fn(),
    },
    notificationLog: {
      create: jest.fn(),
    },
    pointLedger: {
      upsert: jest.fn(),
    },
  };
  const accessService = {
    canReviewBill: jest.fn(),
    canApproveBill: jest.fn(),
    canConfirmBillPmBa: jest.fn(),
  };
  const adminNotificationService = {
    notifyBillReviewed: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    jest.useFakeTimers().setSystemTime(new Date('2026-07-03T10:00:00.000Z'));
    prisma.$transaction.mockImplementation((callback) => callback(prisma));
    prisma.auditLog.create.mockResolvedValue({ id: 'audit-1' });
    accessService.canReviewBill.mockResolvedValue(true);
    accessService.canApproveBill.mockResolvedValue(true);
    accessService.canConfirmBillPmBa.mockResolvedValue(true);

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
    jest.useRealTimers();
    await app.close();
  });

  it('approves a bill through the admin API with net and payable split', async () => {
    prisma.bill.findFirst.mockResolvedValue(submittedBill());
    prisma.commissionConfig.findFirst.mockResolvedValue(
      activeCommissionConfig(),
    );
    prisma.bill.update.mockResolvedValue(reviewedBill());

    const response = await request(app.getHttpServer())
      .patch('/admin/sensitive-bills/bill-api-1/review')
      .set('x-test-role', 'ADMIN')
      .set('x-test-user-id', 'admin-1')
      .send({ approve: true })
      .expect(200);

    expect(response.body).toEqual(
      expect.objectContaining({
        id: 'bill-api-1',
        status: 'VERIFIED',
        subtotalVnd: 2000000,
        discountVnd: 160000,
        serviceChargeVnd: 100000,
        taxVnd: 50000,
        totalVnd: 1840000,
        paidVnd: 1990000,
        grossRevenueVnd: 2000000,
        netRevenueVnd: 1840000,
        payableVnd: 1990000,
        commissionAmountVnd: 80000,
      }),
    );
    expect(response.body.discountRuleSnapshot).toEqual(
      expect.objectContaining({
        grossRevenueVnd: 2000000,
        netRevenueVnd: 1840000,
        payableVnd: 1990000,
      }),
    );
    expect(response.body.commissionRuleSnapshot).toEqual(
      expect.objectContaining({
        grossRevenueVnd: 2000000,
        netRevenueVnd: 1840000,
        payableVnd: 1990000,
        commissionAmountVnd: 80000,
        flags: [],
      }),
    );
    expect(accessService.canApproveBill).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'admin-1', role: 'ADMIN' }),
      'bill-api-1',
    );
    expect(accessService.canReviewBill).not.toHaveBeenCalled();
    expect(prisma.bill.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          totalVnd: 1840000,
          paidVnd: 1990000,
          commissionAmountVnd: 80000,
        }),
      }),
    );
    expect(adminNotificationService.notifyBillReviewed).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 'bill-api-1',
        payableVnd: 1990000,
      }),
      { approve: true, reviewedById: 'admin-1' },
    );
  });

  it('returns 422 through the admin API when CommissionConfig is missing', async () => {
    prisma.bill.findFirst.mockResolvedValue(submittedBill());
    prisma.commissionConfig.findFirst.mockResolvedValue(null);

    const response = await request(app.getHttpServer())
      .patch('/admin/sensitive-bills/bill-api-1/review')
      .set('x-test-role', 'ADMIN')
      .set('x-test-user-id', 'admin-1')
      .send({ approve: true })
      .expect(422);

    expect(response.body).toEqual(
      expect.objectContaining({
        code: 'MISSING_ACTIVE_COMMISSION_CONFIG',
        flags: ['MISSING_ACTIVE_COMMISSION_CONFIG'],
        reason:
          'Bill approval requires an active CommissionConfig before commission can be calculated.',
      }),
    );
    expect(prisma.bill.update).not.toHaveBeenCalled();
    expect(prisma.auditLog.create).not.toHaveBeenCalled();
    expect(adminNotificationService.notifyBillReviewed).not.toHaveBeenCalled();
  });

  it('moves negative commission to PM/BA pending and verifies after confirmation reason', async () => {
    prisma.bill.findFirst
      .mockResolvedValueOnce(submittedBill())
      .mockResolvedValueOnce(pendingNegativeCommissionBill());
    prisma.commissionConfig.findFirst.mockResolvedValue(
      activeCommissionConfig(6),
    );
    prisma.bill.update
      .mockResolvedValueOnce(pendingNegativeCommissionBill())
      .mockResolvedValueOnce(verifiedNegativeCommissionBill());

    const pendingResponse = await request(app.getHttpServer())
      .patch('/admin/sensitive-bills/bill-api-1/review')
      .set('x-test-role', 'ADMIN')
      .set('x-test-user-id', 'admin-1')
      .send({ approve: true })
      .expect(200);

    expect(pendingResponse.body).toEqual(
      expect.objectContaining({
        id: 'bill-api-1',
        status: 'PENDING_PM_BA',
        commissionAmountVnd: -40000,
      }),
    );
    expect(pendingResponse.body.commissionRuleSnapshot).toEqual(
      expect.objectContaining({
        flags: ['NEGATIVE_COMMISSION_PM_BA_CONFIRMATION_REQUIRED'],
        requiresPmBaConfirmation: true,
      }),
    );
    expect(adminNotificationService.notifyBillReviewed).not.toHaveBeenCalled();

    const confirmedResponse = await request(app.getHttpServer())
      .patch('/admin/sensitive-bills/bill-api-1/confirm-negative-commission')
      .set('x-test-role', 'ADMIN')
      .set('x-test-user-id', 'admin-1')
      .send({ reason: 'PM/BA confirmed July launch loss leader.' })
      .expect(200);

    expect(confirmedResponse.body).toEqual(
      expect.objectContaining({
        id: 'bill-api-1',
        status: 'VERIFIED',
        commissionAmountVnd: -40000,
      }),
    );
    expect(confirmedResponse.body.commissionRuleSnapshot).toEqual(
      expect.objectContaining({
        flags: ['NEGATIVE_COMMISSION_PM_BA_CONFIRMATION_REQUIRED'],
        pmBaConfirmationReason: 'PM/BA confirmed July launch loss leader.',
        pmBaConfirmationConfirmed: true,
      }),
    );
    expect(accessService.canConfirmBillPmBa).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'admin-1', role: 'ADMIN' }),
      'bill-api-1',
    );
    expect(adminNotificationService.notifyBillReviewed).toHaveBeenCalledTimes(
      1,
    );
  });

  it('rejects a bill through the admin API and logs audit & Telegram', async () => {
    prisma.bill.findFirst.mockResolvedValue(submittedBill());
    prisma.bill.update.mockResolvedValue({
      ...submittedBill(),
      status: 'REJECTED',
      rejectReason: 'Gửi nhầm quán',
      rejectedAt: new Date(),
    });

    const response = await request(app.getHttpServer())
      .patch('/admin/sensitive-bills/bill-api-1/review')
      .set('x-test-role', 'ADMIN')
      .set('x-test-user-id', 'admin-1')
      .send({ approve: false, rejectReason: 'Gửi nhầm quán' })
      .expect(200);

    expect(response.body).toEqual(
      expect.objectContaining({
        id: 'bill-api-1',
        status: 'REJECTED',
        rejectReason: 'Gửi nhầm quán',
      }),
    );
    expect(prisma.bill.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ id: 'bill-api-1' }),
        data: expect.objectContaining({
          status: 'REJECTED',
          rejectReason: 'Gửi nhầm quán',
        }),
      }),
    );
    expect(adminNotificationService.notifyBillReviewed).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 'bill-api-1',
        status: 'REJECTED',
        rejectReason: 'Gửi nhầm quán',
      }),
      { approve: false, reviewedById: 'admin-1' },
    );
  });

  it('returns 422 when the bill is not in a reviewable status (concurrency conflict)', async () => {
    prisma.bill.findFirst.mockResolvedValue(submittedBill());
    prisma.commissionConfig.findFirst.mockResolvedValue(
      activeCommissionConfig(),
    );
    const prismaError = new Error('Record to update not found');
    (prismaError as any).code = 'P2025';
    prisma.bill.update.mockRejectedValue(prismaError);

    const response = await request(app.getHttpServer())
      .patch('/admin/sensitive-bills/bill-api-1/review')
      .set('x-test-role', 'ADMIN')
      .set('x-test-user-id', 'admin-1')
      .send({ approve: true })
      .expect(422);

    expect(response.body.message).toBe('Bill is not in a reviewable status');
  });
});

function submittedBill() {
  return {
    id: 'bill-api-1',
    billNumber: 'BILL-API-1',
    status: 'SUBMITTED',
    reviewedAt: null,
    verifiedAt: null,
    rejectedAt: null,
    reviewedById: null,
    verifiedById: null,
    rejectedById: null,
    rejectReason: null,
    subtotalVnd: 2000000,
    discountVnd: 0,
    serviceChargeVnd: 100000,
    taxVnd: 50000,
    totalVnd: 2150000,
    paidVnd: 2150000,
    commissionAmountVnd: 0,
    pointsEarned: 0,
    discountRuleSnapshot: null,
    commissionRuleSnapshot: null,
    store: { id: 'store-api-1', name: 'API Club', slug: 'api-club' },
    booking: { id: 'booking-api-1', status: 'CONFIRMED', scheduledAt: null },
    coupon: {
      id: 'coupon-api-1',
      code: 'MEMBER8',
      name: 'Member 8%',
      discountType: 'PERCENT',
      discountValue: 8,
      maxDiscountVnd: null,
      minSpendVnd: null,
    },
    couponIssue: {
      id: 'issue-api-1',
      code: 'MEMBER-code',
      status: 'USED',
      metadata: {
        discountPercent: 8,
        discountRuleSnapshot: {
          type: 'PERCENT',
          value: 8,
          discountPercent: 8,
        },
      },
    },
    user: null,
    guest: { id: 'guest-api-1', displayName: 'Walk-in', phone: '+84901234567' },
  };
}

function activeCommissionConfig(commissionValue = 12) {
  return {
    id: 'commission-api-1',
    commissionType: 'PERCENT',
    commissionValue,
    minBillVnd: null,
    ruleSnapshot: {
      formula: 'Admin commission = gross x (12% - customer discount %)',
    },
    activeFrom: new Date('2026-01-01T00:00:00.000Z'),
    activeTo: null,
  };
}

function reviewedBill() {
  return {
    ...submittedBill(),
    status: 'VERIFIED',
    reviewedAt: new Date('2026-07-03T10:00:00.000Z'),
    verifiedAt: new Date('2026-07-03T10:00:00.000Z'),
    reviewedById: 'admin-1',
    verifiedById: 'admin-1',
    discountVnd: 160000,
    totalVnd: 1840000,
    paidVnd: 1990000,
    commissionAmountVnd: 80000,
    discountRuleSnapshot: {
      version: 'ba-v3.2',
      grossRevenueVnd: 2000000,
      netRevenueVnd: 1840000,
      payableVnd: 1990000,
    },
    commissionRuleSnapshot: {
      version: 'ba-v3.2',
      grossRevenueVnd: 2000000,
      netRevenueVnd: 1840000,
      payableVnd: 1990000,
      commissionAmountVnd: 80000,
      flags: [],
    },
  };
}

function pendingNegativeCommissionBill() {
  return {
    ...reviewedBill(),
    status: 'PENDING_PM_BA',
    verifiedAt: null,
    verifiedById: null,
    commissionAmountVnd: -40000,
    commissionRuleSnapshot: {
      version: 'ba-v3.2',
      grossRevenueVnd: 2000000,
      netRevenueVnd: 1840000,
      payableVnd: 1990000,
      commissionAmountVnd: -40000,
      flags: ['NEGATIVE_COMMISSION_PM_BA_CONFIRMATION_REQUIRED'],
      requiresPmBaConfirmation: true,
      pmBaConfirmationReason: null,
      pmBaConfirmationConfirmed: false,
    },
  };
}

function verifiedNegativeCommissionBill() {
  return {
    ...pendingNegativeCommissionBill(),
    status: 'VERIFIED',
    verifiedAt: new Date('2026-07-03T10:00:00.000Z'),
    verifiedById: 'admin-1',
    commissionRuleSnapshot: {
      ...(pendingNegativeCommissionBill().commissionRuleSnapshot as Record<
        string,
        unknown
      >),
      status: 'VERIFIED',
      pmBaConfirmationReason: 'PM/BA confirmed July launch loss leader.',
      pmBaConfirmationConfirmed: true,
    },
  };
}
