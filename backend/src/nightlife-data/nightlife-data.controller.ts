import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import type * as express from 'express';
import { ActionPolicy } from '../access/action-policy.decorator';
import { ActionPolicyGuard } from '../access/action-policy.guard';
import { AuthenticatedUser } from '../access/access.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import {
  AdminSensitiveBillsContract,
  ClaimGuestCouponContract,
  CreateGuestBookingContract,
  CreateMemberBookingContract,
  MemberBookingsContract,
  MemberClaimCouponContract,
  MemberCouponIssuesContract,
  PartnerBillsContract,
  PartnerBookingsContract,
  PartnerConfirmCheckInContract,
  PartnerCouponsContract,
  PartnerScanCouponContract,
  PartnerStoresContract,
  PublicAreasContract,
  PublicCastsContract,
  PublicCouponsContract,
  PublicStoreDetailContract,
  PublicStoresContract,
  ReviewSensitiveBillContract,
} from './nightlife-data.contract';
import { ClaimGuestCouponDto } from './dto/claim-guest-coupon.dto';
import { CreateBookingDto } from './dto/create-booking.dto';
import { PublicDiscoveryQueryDto } from './dto/public-discovery-query.dto';
import { ReviewBillDto } from './dto/review-bill.dto';
import { NightlifeDataService } from './nightlife-data.service';

type RequestWithUser = express.Request & {
  user: AuthenticatedUser;
};

@ApiTags('nightlife-data')
@Controller()
export class NightlifeDataController {
  constructor(private readonly nightlifeDataService: NightlifeDataService) {}

  @PublicAreasContract()
  @Get('areas')
  listPublicAreas(@Query() query: PublicDiscoveryQueryDto) {
    return this.nightlifeDataService.listPublicAreas(query);
  }

  @PublicStoresContract()
  @Get('stores')
  listPublicStores(@Query() query: PublicDiscoveryQueryDto) {
    return this.nightlifeDataService.listPublicStores(query);
  }

  @PublicStoreDetailContract()
  @Get('stores/:slug')
  getPublicStoreBySlug(@Param('slug') slug: string) {
    return this.nightlifeDataService.getPublicStoreBySlug(slug);
  }

  @PublicCastsContract()
  @Get('casts')
  listPublicCasts(@Query() query: PublicDiscoveryQueryDto) {
    return this.nightlifeDataService.listPublicCasts(query);
  }

  @PublicCouponsContract()
  @Get('coupons')
  listPublicCoupons() {
    return this.nightlifeDataService.listPublicCoupons();
  }

  @CreateGuestBookingContract()
  @Post('bookings')
  createGuestBooking(@Body() dto: CreateBookingDto) {
    return this.nightlifeDataService.createGuestBooking(dto);
  }

  @ClaimGuestCouponContract()
  @Post('coupons/:couponId/guest-claims')
  claimGuestCoupon(
    @Param('couponId') couponId: string,
    @Body() dto: ClaimGuestCouponDto,
  ) {
    return this.nightlifeDataService.claimGuestCoupon(couponId, dto);
  }

  @MemberClaimCouponContract()
  @ActionPolicy('canClaimMemberCoupon')
  @Roles('USER')
  @UseGuards(JwtAuthGuard, RolesGuard, ActionPolicyGuard)
  @Post('coupons/:couponId/member-claims')
  claimMemberCoupon(
    @Req() request: RequestWithUser,
    @Param('couponId') couponId: string,
  ) {
    return this.nightlifeDataService.claimMemberCoupon(couponId, request.user);
  }

  @PartnerStoresContract()
  @ActionPolicy('canViewPartnerStore')
  @Roles('PARTNER', 'ADMIN')
  @UseGuards(JwtAuthGuard, RolesGuard, ActionPolicyGuard)
  @Get('partner/stores')
  listPartnerStores(@Req() request: RequestWithUser) {
    return this.nightlifeDataService.listPartnerStores(request.user);
  }

  @PartnerCouponsContract()
  @ActionPolicy('canViewPartnerCoupon')
  @Roles('PARTNER', 'ADMIN')
  @UseGuards(JwtAuthGuard, RolesGuard, ActionPolicyGuard)
  @Get('partner/coupons')
  listPartnerCoupons(@Req() request: RequestWithUser) {
    return this.nightlifeDataService.listPartnerCoupons(request.user);
  }

  @PartnerBookingsContract()
  @ActionPolicy('canViewPartnerBooking')
  @Roles('PARTNER', 'ADMIN')
  @UseGuards(JwtAuthGuard, RolesGuard, ActionPolicyGuard)
  @Get('partner/bookings')
  listPartnerBookings(@Req() request: RequestWithUser) {
    return this.nightlifeDataService.listPartnerBookings(request.user);
  }

  @PartnerScanCouponContract()
  @ActionPolicy('canScanCoupon')
  @Roles('PARTNER', 'ADMIN', 'OPERATOR')
  @UseGuards(JwtAuthGuard, RolesGuard, ActionPolicyGuard)
  @Post('partner/coupon-issues/:code/scan')
  scanCouponIssue(
    @Req() request: RequestWithUser,
    @Param('code') code: string,
  ) {
    return this.nightlifeDataService.scanCouponIssue(code, request.user);
  }

  @PartnerConfirmCheckInContract('id')
  @ActionPolicy('canConfirmCheckIn')
  @Roles('PARTNER', 'ADMIN', 'OPERATOR')
  @UseGuards(JwtAuthGuard, RolesGuard, ActionPolicyGuard)
  @Post('partner/coupon-issues/:id/confirm-check-in')
  confirmCouponIssueCheckInByIssueId(
    @Req() request: RequestWithUser,
    @Param('id') couponIssueId: string,
  ) {
    return this.nightlifeDataService.confirmCouponIssueCheckIn(
      couponIssueId,
      request.user,
    );
  }

  @PartnerConfirmCheckInContract()
  @ActionPolicy('canConfirmCheckIn')
  @Roles('PARTNER', 'ADMIN', 'OPERATOR')
  @UseGuards(JwtAuthGuard, RolesGuard, ActionPolicyGuard)
  @Post('partner/check-ins/:couponIssueId/confirm')
  confirmCouponIssueCheckIn(
    @Req() request: RequestWithUser,
    @Param('couponIssueId') couponIssueId: string,
  ) {
    return this.nightlifeDataService.confirmCouponIssueCheckIn(
      couponIssueId,
      request.user,
    );
  }

  @PartnerBillsContract()
  @ActionPolicy('canViewPartnerBill')
  @Roles('PARTNER', 'ADMIN')
  @UseGuards(JwtAuthGuard, RolesGuard, ActionPolicyGuard)
  @Get('partner/bills')
  listPartnerBills(@Req() request: RequestWithUser) {
    return this.nightlifeDataService.listPartnerBills(request.user);
  }

  @PartnerBookingsContract()
  @ActionPolicy('canViewPartnerBooking')
  @Roles('OPERATOR', 'ADMIN')
  @UseGuards(JwtAuthGuard, RolesGuard, ActionPolicyGuard)
  @Get('operator/bookings')
  listOperatorBookings(@Req() request: RequestWithUser) {
    return this.nightlifeDataService.listOperatorBookings(request.user);
  }

  @PartnerBillsContract()
  @ActionPolicy('canViewPartnerBill')
  @Roles('OPERATOR', 'ADMIN')
  @UseGuards(JwtAuthGuard, RolesGuard, ActionPolicyGuard)
  @Get('operator/bills')
  listOperatorBills(@Req() request: RequestWithUser) {
    return this.nightlifeDataService.listOperatorBills(request.user);
  }

  @ReviewSensitiveBillContract()
  @ActionPolicy('canReviewBill')
  @Roles('OPERATOR', 'ADMIN')
  @UseGuards(JwtAuthGuard, RolesGuard, ActionPolicyGuard)
  @Patch('operator/bills/:billId/review')
  reviewSensitiveBillAsOperator(
    @Req() request: RequestWithUser,
    @Param('billId') billId: string,
    @Body() dto: ReviewBillDto,
  ) {
    return this.nightlifeDataService.reviewSensitiveBill(
      request.user.id,
      billId,
      dto,
    );
  }

  @CreateMemberBookingContract()
  @Roles('USER')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post('member/bookings')
  createMemberBooking(
    @Req() request: RequestWithUser,
    @Body() dto: CreateBookingDto,
  ) {
    return this.nightlifeDataService.createMemberBooking(request.user, dto);
  }

  @MemberBookingsContract()
  @ActionPolicy('canViewMemberBooking')
  @Roles('USER')
  @UseGuards(JwtAuthGuard, RolesGuard, ActionPolicyGuard)
  @Get('member/bookings')
  listMemberBookings(@Req() request: RequestWithUser) {
    return this.nightlifeDataService.listMemberBookings(request.user.id);
  }

  @MemberCouponIssuesContract()
  @ActionPolicy('canViewMemberCoupon')
  @Roles('USER')
  @UseGuards(JwtAuthGuard, RolesGuard, ActionPolicyGuard)
  @Get('member/coupon-issues')
  listMemberCouponIssues(@Req() request: RequestWithUser) {
    return this.nightlifeDataService.listMemberCouponIssues(request.user.id);
  }

  @AdminSensitiveBillsContract()
  @ActionPolicy('canViewSensitiveBill')
  @Roles('ADMIN')
  @UseGuards(JwtAuthGuard, RolesGuard, ActionPolicyGuard)
  @Get('admin/sensitive-bills')
  listSensitiveBillsForAdmin(@Req() request: RequestWithUser) {
    return this.nightlifeDataService.listSensitiveBillsForAdmin(request.user);
  }

  @ReviewSensitiveBillContract()
  @ActionPolicy('canReviewBill')
  @Roles('ADMIN')
  @UseGuards(JwtAuthGuard, RolesGuard, ActionPolicyGuard)
  @Patch('admin/sensitive-bills/:billId/review')
  reviewSensitiveBill(
    @Req() request: RequestWithUser,
    @Param('billId') billId: string,
    @Body() dto: ReviewBillDto,
  ) {
    return this.nightlifeDataService.reviewSensitiveBill(
      request.user.id,
      billId,
      dto,
    );
  }
}
