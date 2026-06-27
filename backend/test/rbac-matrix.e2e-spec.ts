import {
  CanActivate,
  ExecutionContext,
  INestApplication,
  NotFoundException,
  UnauthorizedException,
  UnprocessableEntityException,
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

class TestJwtGuard implements CanActivate {
  canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest<{
      headers: Record<string, string | string[] | undefined>;
      user?: { id: string; role: string };
    }>();
    const role = firstHeaderValue(request.headers['x-test-role']);

    if (!role) {
      throw new UnauthorizedException();
    }

    request.user = {
      id: firstHeaderValue(request.headers['x-test-user-id']) ?? 'user-1',
      role,
    };

    return true;
  }
}

function firstHeaderValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

describe('RBAC matrix (e2e)', () => {
  let app: INestApplication;
  const nightlifeDataService = {
    claimGuestCoupon: jest.fn(),
    listPartnerStores: jest.fn(),
    listOperatorBills: jest.fn(),
    scanCouponIssue: jest.fn(),
    confirmCouponIssueCheckIn: jest.fn(),
    listMemberBookings: jest.fn(),
    listSensitiveBillsForAdmin: jest.fn(),
    reviewSensitiveBill: jest.fn(),
  };
  const accessService = {
    canViewPartnerStore: jest.fn(),
    canViewPartnerCoupon: jest.fn(),
    canViewPartnerBooking: jest.fn(),
    canViewPartnerBill: jest.fn(),
    canScanCoupon: jest.fn(),
    canConfirmCheckIn: jest.fn(),
    canReviewBill: jest.fn(),
    canViewSensitiveBill: jest.fn(),
    canViewMemberBooking: jest.fn(),
    canViewMemberCoupon: jest.fn(),
    canClaimMemberCoupon: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    nightlifeDataService.claimGuestCoupon.mockResolvedValue({
      issue: { id: 'issue-1' },
      guest: { id: 'guest-1' },
    });
    nightlifeDataService.listPartnerStores.mockResolvedValue([
      { id: 'store-a', name: 'Partner A Store' },
    ]);
    nightlifeDataService.listOperatorBills.mockResolvedValue([
      { id: 'bill-1', status: 'SUBMITTED' },
    ]);
    nightlifeDataService.scanCouponIssue.mockResolvedValue({
      id: 'issue-1',
      status: 'ISSUED',
    });
    nightlifeDataService.confirmCouponIssueCheckIn.mockResolvedValue({
      id: 'issue-1',
      status: 'USED',
    });
    nightlifeDataService.listMemberBookings.mockResolvedValue([]);
    nightlifeDataService.listSensitiveBillsForAdmin.mockResolvedValue([]);
    nightlifeDataService.reviewSensitiveBill.mockResolvedValue({
      id: 'bill-1',
      status: 'VERIFIED',
    });
    accessService.canViewPartnerStore.mockResolvedValue(true);
    accessService.canViewPartnerCoupon.mockResolvedValue(true);
    accessService.canViewPartnerBooking.mockResolvedValue(true);
    accessService.canViewPartnerBill.mockResolvedValue(true);
    accessService.canScanCoupon.mockResolvedValue(true);
    accessService.canConfirmCheckIn.mockResolvedValue(true);
    accessService.canReviewBill.mockResolvedValue(true);
    accessService.canViewSensitiveBill.mockResolvedValue(true);
    accessService.canViewMemberBooking.mockResolvedValue(true);
    accessService.canViewMemberCoupon.mockResolvedValue(true);
    accessService.canClaimMemberCoupon.mockResolvedValue(true);

    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [NightlifeDataController],
      providers: [
        Reflector,
        RolesGuard,
        ActionPolicyGuard,
        { provide: AccessService, useValue: accessService },
        { provide: NightlifeDataService, useValue: nightlifeDataService },
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
    await app.close();
  });

  it('returns 401 when an unauthenticated guest calls member bookings', async () => {
    await request(app.getHttpServer()).get('/member/bookings').expect(401);

    expect(nightlifeDataService.listMemberBookings).not.toHaveBeenCalled();
  });

  it('returns 403 when a member calls partner stores', async () => {
    await request(app.getHttpServer())
      .get('/partner/stores')
      .set('x-test-role', 'USER')
      .set('x-test-user-id', 'member-1')
      .expect(403);

    expect(nightlifeDataService.listPartnerStores).not.toHaveBeenCalled();
  });

  it('passes partner identity to store scoping and omits partner B data', async () => {
    const response = await request(app.getHttpServer())
      .get('/partner/stores')
      .set('x-test-role', 'PARTNER')
      .set('x-test-user-id', 'partner-a')
      .expect(200);

    expect(response.body).toEqual([{ id: 'store-a', name: 'Partner A Store' }]);
    expect(response.body).not.toEqual(
      expect.arrayContaining([expect.objectContaining({ id: 'store-b' })]),
    );
    expect(nightlifeDataService.listPartnerStores).toHaveBeenCalledWith({
      id: 'partner-a',
      role: 'PARTNER',
    });
  });

  it('exposes partner QR scan and confirm check-in endpoints', async () => {
    await request(app.getHttpServer())
      .post('/partner/coupon-issues/GUEST-code/scan')
      .set('x-test-role', 'PARTNER')
      .set('x-test-user-id', 'partner-a')
      .expect(201);

    await request(app.getHttpServer())
      .post('/partner/coupon-issues/issue-1/confirm-check-in')
      .set('x-test-role', 'PARTNER')
      .set('x-test-user-id', 'partner-a')
      .expect(201);

    expect(accessService.canScanCoupon).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'partner-a', role: 'PARTNER' }),
      { code: 'GUEST-code', couponIssueId: undefined },
    );
    expect(accessService.canConfirmCheckIn).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'partner-a', role: 'PARTNER' }),
      { couponIssueId: 'issue-1' },
    );
    expect(nightlifeDataService.confirmCouponIssueCheckIn).toHaveBeenCalledWith(
      'issue-1',
      expect.objectContaining({ id: 'partner-a', role: 'PARTNER' }),
    );
  });

  it('allows operator but blocks staff on operator bill queues', async () => {
    await request(app.getHttpServer())
      .get('/operator/bills')
      .set('x-test-role', 'OPERATOR')
      .set('x-test-user-id', 'operator-1')
      .expect(200);

    await request(app.getHttpServer())
      .get('/operator/bills')
      .set('x-test-role', 'STAFF')
      .set('x-test-user-id', 'staff-1')
      .expect(403);
  });

  it('returns 403 when a partner calls admin sensitive bills', async () => {
    await request(app.getHttpServer())
      .get('/admin/sensitive-bills')
      .set('x-test-role', 'PARTNER')
      .set('x-test-user-id', 'partner-a')
      .expect(403);

    expect(
      nightlifeDataService.listSensitiveBillsForAdmin,
    ).not.toHaveBeenCalled();
  });

  it('returns 404 when admin reviews a missing bill', async () => {
    nightlifeDataService.reviewSensitiveBill.mockRejectedValueOnce(
      new NotFoundException('Bill not found'),
    );

    await request(app.getHttpServer())
      .patch('/admin/sensitive-bills/missing-bill/review')
      .set('x-test-role', 'ADMIN')
      .set('x-test-user-id', 'admin-1')
      .send({ approve: true })
      .expect(404);
  });

  it('returns 400 when rejecting a bill without rejectReason', async () => {
    await request(app.getHttpServer())
      .patch('/admin/sensitive-bills/bill-1/review')
      .set('x-test-role', 'ADMIN')
      .set('x-test-user-id', 'admin-1')
      .send({ approve: false })
      .expect(400);

    expect(nightlifeDataService.reviewSensitiveBill).not.toHaveBeenCalled();
  });

  it('returns 422 when a public coupon has exhausted its usage limit', async () => {
    nightlifeDataService.claimGuestCoupon.mockRejectedValueOnce(
      new UnprocessableEntityException('Coupon usage limit has been reached'),
    );

    await request(app.getHttpServer())
      .post('/coupons/coupon-1/guest-claims')
      .send({ phone: '+84901234567' })
      .expect(422);
  });
});
