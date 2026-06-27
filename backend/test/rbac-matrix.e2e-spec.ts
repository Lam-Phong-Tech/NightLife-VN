import {
  CanActivate,
  Controller,
  ExecutionContext,
  Get,
  INestApplication,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { ActionPolicy } from '../src/access/action-policy.decorator';
import { ActionPolicyGuard } from '../src/access/action-policy.guard';
import { AccessService } from '../src/access/access.service';
import { Roles } from '../src/auth/roles.decorator';
import { RolesGuard } from '../src/auth/roles.guard';

class TestUserGuard implements CanActivate {
  canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest<{
      headers: Record<string, string>;
      user?: { id: string; role: string };
    }>();

    request.user = {
      id: request.headers['x-test-user-id'] ?? 'user-1',
      role: request.headers['x-test-role'] ?? 'USER',
    };

    return true;
  }
}

@Controller()
class RbacMatrixController {
  @Get('partner/bookings')
  @Roles('PARTNER', 'ADMIN')
  @ActionPolicy('canViewPartnerBooking')
  @UseGuards(TestUserGuard, RolesGuard, ActionPolicyGuard)
  partnerBookings(@Req() request: { user: { role: string } }) {
    return { role: request.user.role };
  }

  @Post('partner/coupon-issues/:code/scan')
  @Roles('PARTNER', 'ADMIN', 'STAFF')
  @ActionPolicy('canScanCoupon')
  @UseGuards(TestUserGuard, RolesGuard, ActionPolicyGuard)
  scanCoupon(@Req() request: { user: { role: string } }) {
    return { role: request.user.role };
  }

  @Patch('operator/bills/:billId/review')
  @Roles('STAFF', 'ADMIN')
  @ActionPolicy('canReviewBill')
  @UseGuards(TestUserGuard, RolesGuard, ActionPolicyGuard)
  reviewBill(@Req() request: { user: { role: string } }) {
    return { role: request.user.role };
  }
}

describe('RBAC matrix (e2e)', () => {
  let app: INestApplication;
  const accessService = {
    canViewPartnerBooking: jest.fn(),
    canScanCoupon: jest.fn(),
    canReviewBill: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    accessService.canViewPartnerBooking.mockResolvedValue(true);
    accessService.canScanCoupon.mockResolvedValue(true);
    accessService.canReviewBill.mockResolvedValue(true);

    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [RbacMatrixController],
      providers: [
        Reflector,
        RolesGuard,
        ActionPolicyGuard,
        { provide: AccessService, useValue: accessService },
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it('allows partner to view partner bookings but blocks member', async () => {
    await request(app.getHttpServer())
      .get('/partner/bookings')
      .set('x-test-role', 'PARTNER')
      .expect(200);

    await request(app.getHttpServer())
      .get('/partner/bookings')
      .set('x-test-role', 'USER')
      .expect(403);
  });

  it('allows partner/operator/admin to scan coupons', async () => {
    for (const role of ['PARTNER', 'STAFF', 'ADMIN']) {
      await request(app.getHttpServer())
        .post('/partner/coupon-issues/GUEST-code/scan')
        .set('x-test-role', role)
        .expect(201);
    }
  });

  it('allows operator/admin to review bills and blocks partner', async () => {
    await request(app.getHttpServer())
      .patch('/operator/bills/bill-1/review')
      .set('x-test-role', 'STAFF')
      .expect(200);

    await request(app.getHttpServer())
      .patch('/operator/bills/bill-1/review')
      .set('x-test-role', 'ADMIN')
      .expect(200);

    await request(app.getHttpServer())
      .patch('/operator/bills/bill-1/review')
      .set('x-test-role', 'PARTNER')
      .expect(403);
  });

  it('blocks an allowed role when action policy denies scope', async () => {
    accessService.canScanCoupon.mockResolvedValue(false);

    await request(app.getHttpServer())
      .post('/partner/coupon-issues/GUEST-code/scan')
      .set('x-test-role', 'PARTNER')
      .expect(403);
  });
});
