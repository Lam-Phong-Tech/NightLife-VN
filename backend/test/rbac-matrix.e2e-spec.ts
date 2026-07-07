import {
  CanActivate,
  ExecutionContext,
  GoneException,
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
    scanCouponIssuePayload: jest.fn(),
    confirmCouponIssueCheckIn: jest.fn(),
    listMemberCouponIssues: jest.fn(),
    listAdminCouponIssues: jest.fn(),
    revokeAdminCouponIssueQrToken: jest.fn(),
    rotateAdminCouponIssueQrToken: jest.fn(),
    listMemberBookings: jest.fn(),
    listSensitiveBillsForAdmin: jest.fn(),
    previewSensitiveBillApproval: jest.fn(),
    reviewSensitiveBill: jest.fn(),
    updateAdminBillStatus: jest.fn(),
    voidSensitiveBill: jest.fn(),
    reverseSensitiveBill: jest.fn(),
    autoReverseSensitiveBills: jest.fn(),
    autoBillFraudReversal: jest.fn(),
    exportAdminQaAuditTrail: jest.fn(),
    getAdminUatDashboard: jest.fn(),
  };
  const accessService = {
    canViewPartnerStore: jest.fn(),
    canViewPartnerCoupon: jest.fn(),
    canViewPartnerBooking: jest.fn(),
    canViewPartnerBill: jest.fn(),
    canScanCoupon: jest.fn(),
    canConfirmCheckIn: jest.fn(),
    canReviewBill: jest.fn(),
    canPreviewBillApproval: jest.fn(),
    canApproveBill: jest.fn(),
    canConfirmBillPmBa: jest.fn(),
    canVoidBill: jest.fn(),
    canReverseBill: jest.fn(),
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
    nightlifeDataService.scanCouponIssuePayload.mockResolvedValue({
      id: 'issue-1',
      status: 'ISSUED',
    });
    nightlifeDataService.confirmCouponIssueCheckIn.mockResolvedValue({
      id: 'issue-1',
      status: 'USED',
    });
    nightlifeDataService.listMemberCouponIssues.mockResolvedValue([
      {
        id: 'issue-issued',
        code: 'MEMBER-issued',
        status: 'ISSUED',
        statusLabel: 'Đang giữ chỗ',
        qrPayload: 'MEMBER-issued',
      },
      {
        id: 'issue-used',
        code: 'MEMBER-used',
        status: 'USED',
        statusLabel: 'Đã sử dụng',
      },
      {
        id: 'issue-expired',
        code: 'MEMBER-expired',
        status: 'EXPIRED',
        statusLabel: 'Hết hạn',
      },
    ]);
    nightlifeDataService.listMemberBookings.mockResolvedValue([]);
    nightlifeDataService.listSensitiveBillsForAdmin.mockResolvedValue([]);
    nightlifeDataService.listAdminCouponIssues.mockResolvedValue([
      { id: 'issue-1', code: 'MEMBER-code', status: 'ISSUED' },
    ]);
    nightlifeDataService.revokeAdminCouponIssueQrToken.mockResolvedValue({
      id: 'issue-1',
      status: 'REVOKED',
    });
    nightlifeDataService.rotateAdminCouponIssueQrToken.mockResolvedValue({
      id: 'issue-1',
      status: 'ISSUED',
      qrPayloadHash: 'rotated-hash',
    });
    nightlifeDataService.reviewSensitiveBill.mockResolvedValue({
      id: 'bill-1',
      status: 'VERIFIED',
    });
    nightlifeDataService.updateAdminBillStatus.mockResolvedValue({
      id: 'bill-1',
      status: 'VERIFIED',
    });
    nightlifeDataService.previewSensitiveBillApproval.mockResolvedValue({
      billId: 'bill-1',
      netRevenueVnd: 1840000,
      payableVnd: 1990000,
      commissionAmountVnd: 80000,
    });
    nightlifeDataService.voidSensitiveBill.mockResolvedValue({
      id: 'bill-1',
      status: 'VOIDED',
    });
    nightlifeDataService.reverseSensitiveBill.mockResolvedValue({
      id: 'bill-1',
      status: 'VOIDED',
    });
    nightlifeDataService.autoReverseSensitiveBills.mockResolvedValue({
      mode: 'DRY_RUN',
      candidateCount: 0,
      reversedCount: 0,
      candidates: [],
    });
    nightlifeDataService.autoBillFraudReversal.mockResolvedValue({
      billId: 'bill-1',
      mode: 'DRY_RUN',
      reversed: false,
      riskLevel: 'LOW',
    });
    nightlifeDataService.exportAdminQaAuditTrail.mockResolvedValue({
      total: 0,
      rows: [],
      csv: 'id,createdAt,module,action,actorId,targetType,targetId,metadata',
    });
    nightlifeDataService.getAdminUatDashboard.mockResolvedValue({
      total: 0,
      byModule: {},
      byPriority: {},
      dailyTrend: {},
      sla: { targetsHours: { P0: 4, P1: 24, P2: 72 }, openItems: [] },
    });
    accessService.canViewPartnerStore.mockResolvedValue(true);
    accessService.canViewPartnerCoupon.mockResolvedValue(true);
    accessService.canViewPartnerBooking.mockResolvedValue(true);
    accessService.canViewPartnerBill.mockResolvedValue(true);
    accessService.canScanCoupon.mockResolvedValue(true);
    accessService.canConfirmCheckIn.mockResolvedValue(true);
    accessService.canReviewBill.mockResolvedValue(true);
    accessService.canPreviewBillApproval.mockResolvedValue(true);
    accessService.canApproveBill.mockResolvedValue(true);
    accessService.canConfirmBillPmBa.mockResolvedValue(true);
    accessService.canVoidBill.mockResolvedValue(true);
    accessService.canReverseBill.mockResolvedValue(true);
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

  it('exposes signed coupon QR scan without leaking raw issue code in the route', async () => {
    await request(app.getHttpServer())
      .post('/partner/coupon-issues/scan')
      .set('x-test-role', 'PARTNER')
      .set('x-test-user-id', 'partner-a')
      .send({
        payload:
          'https://nightlife.vn/partner?scanToken=opaque-token.signature',
      })
      .expect(201);

    expect(accessService.canScanCoupon).not.toHaveBeenCalled();
    expect(nightlifeDataService.scanCouponIssuePayload).toHaveBeenCalledWith(
      {
        payload:
          'https://nightlife.vn/partner?scanToken=opaque-token.signature',
      },
      expect.objectContaining({ id: 'partner-a', role: 'PARTNER' }),
    );
  });

  it('exposes admin coupon issue CMS listing', async () => {
    const response = await request(app.getHttpServer())
      .get('/admin/coupon-issues?status=ISSUED')
      .set('x-test-role', 'ADMIN')
      .set('x-test-user-id', 'admin-1')
      .expect(200);

    expect(response.body).toEqual([
      expect.objectContaining({ id: 'issue-1', status: 'ISSUED' }),
    ]);
    expect(nightlifeDataService.listAdminCouponIssues).toHaveBeenCalledWith(
      expect.objectContaining({ status: 'ISSUED' }),
    );
  });

  it('exposes admin coupon QR revoke and rotate endpoints', async () => {
    await request(app.getHttpServer())
      .patch('/admin/coupon-issues/issue-1/revoke-qr')
      .set('x-test-role', 'ADMIN')
      .set('x-test-user-id', 'admin-1')
      .expect(200);

    await request(app.getHttpServer())
      .post('/admin/coupon-issues/issue-1/rotate-qr')
      .set('x-test-role', 'ADMIN')
      .set('x-test-user-id', 'admin-1')
      .expect(201);

    expect(
      nightlifeDataService.revokeAdminCouponIssueQrToken,
    ).toHaveBeenCalledWith(
      'issue-1',
      expect.objectContaining({ id: 'admin-1', role: 'ADMIN' }),
    );
    expect(
      nightlifeDataService.rotateAdminCouponIssueQrToken,
    ).toHaveBeenCalledWith(
      'issue-1',
      expect.objectContaining({ id: 'admin-1', role: 'ADMIN' }),
    );
  });

  it('captures Booking QR API evidence from legacy claim rejection through duplicate confirm', async () => {
    const issuedIssue = {
      id: 'issue-1',
      code: 'GUEST-code',
      status: 'ISSUED',
      statusLabel: 'Đang giữ chỗ',
      qrPayload: 'GUEST-code',
    };

    nightlifeDataService.claimGuestCoupon.mockRejectedValueOnce(
      new GoneException(
        'Independent coupon claim is not part of MVP v3.2. Create a booking to receive the Booking QR.',
      ),
    );
    nightlifeDataService.scanCouponIssue.mockResolvedValueOnce(issuedIssue);
    nightlifeDataService.confirmCouponIssueCheckIn
      .mockResolvedValueOnce({
        ...issuedIssue,
        status: 'USED',
        statusLabel: 'Đã sử dụng',
      })
      .mockRejectedValueOnce(
        new UnprocessableEntityException('Coupon issue has already been used'),
      );

    const claimResponse = await request(app.getHttpServer())
      .post('/coupons/coupon-1/guest-claims')
      .send({ phone: '+84901234567' })
      .expect(410);
    expect(claimResponse.body.message).toContain(
      'Independent coupon claim is not part of MVP v3.2',
    );

    const scanResponse = await request(app.getHttpServer())
      .post('/partner/coupon-issues/GUEST-code/scan')
      .set('x-test-role', 'PARTNER')
      .set('x-test-user-id', 'partner-a')
      .expect(201);
    expect(scanResponse.body.status).toBe('ISSUED');

    const confirmResponse = await request(app.getHttpServer())
      .post('/partner/coupon-issues/issue-1/confirm-check-in')
      .set('x-test-role', 'PARTNER')
      .set('x-test-user-id', 'partner-a')
      .expect(201);
    expect(confirmResponse.body.status).toBe('USED');

    const duplicateResponse = await request(app.getHttpServer())
      .post('/partner/coupon-issues/issue-1/confirm-check-in')
      .set('x-test-role', 'PARTNER')
      .set('x-test-user-id', 'partner-a')
      .expect(422);
    expect(duplicateResponse.body.message).toBe(
      'Coupon issue has already been used',
    );
  });

  it('returns member coupon wallet states for issued, used, and expired issues', async () => {
    const response = await request(app.getHttpServer())
      .get('/member/coupon-issues')
      .set('x-test-role', 'USER')
      .set('x-test-user-id', 'member-1')
      .expect(200);

    expect(response.body).toEqual([
      expect.objectContaining({
        status: 'ISSUED',
        statusLabel: 'Đang giữ chỗ',
        qrPayload: 'MEMBER-issued',
      }),
      expect.objectContaining({
        status: 'USED',
        statusLabel: 'Đã sử dụng',
      }),
      expect.objectContaining({
        status: 'EXPIRED',
        statusLabel: 'Hết hạn',
      }),
    ]);
    expect(nightlifeDataService.listMemberCouponIssues).toHaveBeenCalledWith(
      'member-1',
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

  it('does not expose the legacy operator bill review route', async () => {
    await request(app.getHttpServer())
      .patch('/operator/bills/bill-1/review')
      .set('x-test-role', 'OPERATOR')
      .set('x-test-user-id', 'operator-1')
      .send({ approve: true })
      .expect(404);

    expect(accessService.canReviewBill).not.toHaveBeenCalled();
    expect(nightlifeDataService.reviewSensitiveBill).not.toHaveBeenCalled();
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

    expect(accessService.canApproveBill).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'admin-1', role: 'ADMIN' }),
      'missing-bill',
    );
    expect(accessService.canReviewBill).not.toHaveBeenCalled();
  });

  it('protects admin bill preview, PM/BA confirm, void, and reversal with separated policies', async () => {
    await request(app.getHttpServer())
      .get('/admin/sensitive-bills/bill-1/approval-preview')
      .set('x-test-role', 'ADMIN')
      .set('x-test-user-id', 'admin-1')
      .expect(200);

    await request(app.getHttpServer())
      .patch('/admin/sensitive-bills/bill-1/confirm-negative-commission')
      .set('x-test-role', 'ADMIN')
      .set('x-test-user-id', 'admin-1')
      .send({ reason: 'PM/BA confirmed loss leader campaign.' })
      .expect(200);

    await request(app.getHttpServer())
      .patch('/admin/sensitive-bills/bill-1/void')
      .set('x-test-role', 'ADMIN')
      .set('x-test-user-id', 'admin-1')
      .send({ reason: 'Refund confirmed by store.' })
      .expect(200);

    await request(app.getHttpServer())
      .patch('/admin/sensitive-bills/bill-1/reverse')
      .set('x-test-role', 'ADMIN')
      .set('x-test-user-id', 'admin-1')
      .send({ reason: 'Duplicate bill confirmed.' })
      .expect(200);

    await request(app.getHttpServer())
      .post('/admin/sensitive-bills/auto-reverse')
      .set('x-test-role', 'ADMIN')
      .set('x-test-user-id', 'admin-1')
      .send({ execute: false, limit: 5 })
      .expect(201);

    expect(accessService.canPreviewBillApproval).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'admin-1', role: 'ADMIN' }),
      'bill-1',
    );
    expect(accessService.canConfirmBillPmBa).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'admin-1', role: 'ADMIN' }),
      'bill-1',
    );
    expect(accessService.canVoidBill).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'admin-1', role: 'ADMIN' }),
      'bill-1',
    );
    expect(accessService.canReverseBill).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'admin-1', role: 'ADMIN' }),
      'bill-1',
    );
    expect(accessService.canReverseBill).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'admin-1', role: 'ADMIN' }),
      undefined,
    );
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

  it('approves a bill through the admin status alias', async () => {
    await request(app.getHttpServer())
      .patch('/admin/bills/bill-1/status')
      .set('x-test-role', 'ADMIN')
      .set('x-test-user-id', 'admin-1')
      .send({ status: 'VERIFIED' })
      .expect(200);

    expect(nightlifeDataService.updateAdminBillStatus).toHaveBeenCalledWith(
      'bill-1',
      { status: 'VERIFIED' },
      expect.objectContaining({ id: 'admin-1', role: 'ADMIN' }),
    );
  });

  it('rejects a bill through the admin status alias when reason is present', async () => {
    nightlifeDataService.updateAdminBillStatus.mockResolvedValueOnce({
      id: 'bill-1',
      status: 'REJECTED',
      rejectReason: 'Invoice total does not match upload.',
    });

    await request(app.getHttpServer())
      .patch('/admin/bills/bill-1/status')
      .set('x-test-role', 'ADMIN')
      .set('x-test-user-id', 'admin-1')
      .send({
        status: 'REJECTED',
        reason: 'Invoice total does not match upload.',
      })
      .expect(200);

    expect(nightlifeDataService.updateAdminBillStatus).toHaveBeenCalledWith(
      'bill-1',
      {
        status: 'REJECTED',
        reason: 'Invoice total does not match upload.',
      },
      expect.objectContaining({ id: 'admin-1', role: 'ADMIN' }),
    );
  });

  it('returns 400 when the admin status alias rejects a bill without reason', async () => {
    await request(app.getHttpServer())
      .patch('/admin/bills/bill-1/status')
      .set('x-test-role', 'ADMIN')
      .set('x-test-user-id', 'admin-1')
      .send({ status: 'REJECTED' })
      .expect(400);

    expect(nightlifeDataService.updateAdminBillStatus).not.toHaveBeenCalled();
  });

  it('runs P2 fraud reversal, QA audit trail, and UAT dashboard endpoints', async () => {
    await request(app.getHttpServer())
      .post('/admin/bills/bill-1/fraud-reversal')
      .set('x-test-role', 'ADMIN')
      .set('x-test-user-id', 'admin-1')
      .send({ dryRun: true, reason: 'Duplicate bill signal' })
      .expect(201);

    await request(app.getHttpServer())
      .get('/admin/qa/audit-trail?module=bill&days=7&format=csv')
      .set('x-test-role', 'ADMIN')
      .set('x-test-user-id', 'admin-1')
      .expect(200);

    await request(app.getHttpServer())
      .get('/admin/qa/uat-dashboard?days=7')
      .set('x-test-role', 'ADMIN')
      .set('x-test-user-id', 'admin-1')
      .expect(200);

    expect(nightlifeDataService.autoBillFraudReversal).toHaveBeenCalledWith(
      'admin-1',
      'bill-1',
      { dryRun: true, reason: 'Duplicate bill signal' },
    );
    expect(nightlifeDataService.exportAdminQaAuditTrail).toHaveBeenCalled();
    expect(nightlifeDataService.getAdminUatDashboard).toHaveBeenCalled();
  });

  it('returns 410 before legacy public coupon usage-limit checks', async () => {
    nightlifeDataService.claimGuestCoupon.mockRejectedValueOnce(
      new GoneException(
        'Independent coupon claim is not part of MVP v3.2. Create a booking to receive the Booking QR.',
      ),
    );

    const response = await request(app.getHttpServer())
      .post('/coupons/coupon-1/guest-claims')
      .send({ phone: '+84901234567' })
      .expect(410);
    expect(response.body.message).toContain(
      'Independent coupon claim is not part of MVP v3.2',
    );
  });
});
