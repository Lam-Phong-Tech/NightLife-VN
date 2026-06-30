import {
  Body,
  Controller,
  Delete,
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
  CancelMemberBookingContract,
  ClaimGuestCouponContract,
  CreateGuestBookingContract,
  CreateMemberBillContract,
  CreateMemberBookingContract,
  CreatePartnerRequestContract,
  MemberBookingsContract,
  MemberCastFavoriteStateContract,
  MemberClaimCouponContract,
  MemberCouponIssuesContract,
  MemberFavoriteCastContract,
  MemberFavoriteCastsContract,
  MemberUnfavoriteCastContract,
  PartnerBillsContract,
  PartnerBookingsContract,
  PartnerConfirmCheckInContract,
  PartnerCouponsContract,
  PartnerScanCouponContract,
  PartnerStoresContract,
  PublicCastDetailContract,
  PublicAreasContract,
  PublicCastsContract,
  PublicCouponsContract,
  PublicRankingsContract,
  PublicStoreDetailContract,
  PublicStoresContract,
  ReviewSensitiveBillContract,
} from './nightlife-data.contract';
import { CancelBookingDto } from './dto/cancel-booking.dto';
import { ClaimGuestCouponDto } from './dto/claim-guest-coupon.dto';
import { CreateBillDto } from './dto/create-bill.dto';
import { CreateBookingDto } from './dto/create-booking.dto';
import { CreatePartnerRequestDto } from './dto/create-partner-request.dto';
import {
  AdminRankingQueryDto,
  AdminRankingTargetOptionsQueryDto,
  CreateAdminRankingConfigDto,
  UpdateAdminRankingConfigDto,
} from './dto/admin-ranking.dto';
import {
  PublicDiscoveryQueryDto,
  PublicRankingQueryDto,
} from './dto/public-discovery-query.dto';
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

  @PublicRankingsContract()
  @Get('rankings')
  listPublicRankings(@Query() query: PublicRankingQueryDto) {
    return this.nightlifeDataService.listPublicRankings(query);
  }

  @Roles('ADMIN')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get('admin/rankings')
  listAdminRankingConfigs(@Query() query: AdminRankingQueryDto) {
    return this.nightlifeDataService.listAdminRankingConfigs(query);
  }

  @Roles('ADMIN')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get('admin/rankings/options')
  listAdminRankingTargetOptions(
    @Query() query: AdminRankingTargetOptionsQueryDto,
  ) {
    return this.nightlifeDataService.listAdminRankingTargetOptions(query);
  }

  @Roles('ADMIN')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post('admin/rankings')
  createAdminRankingConfig(
    @Req() request: RequestWithUser,
    @Body() dto: CreateAdminRankingConfigDto,
  ) {
    return this.nightlifeDataService.createAdminRankingConfig(
      request.user,
      dto,
    );
  }

  @Roles('ADMIN')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Patch('admin/rankings/:rankingId')
  updateAdminRankingConfig(
    @Param('rankingId') rankingId: string,
    @Body() dto: UpdateAdminRankingConfigDto,
  ) {
    return this.nightlifeDataService.updateAdminRankingConfig(rankingId, dto);
  }

  @Roles('ADMIN')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Delete('admin/rankings/:rankingId')
  deleteAdminRankingConfig(@Param('rankingId') rankingId: string) {
    return this.nightlifeDataService.deleteAdminRankingConfig(rankingId);
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

  @PublicCastDetailContract()
  @Get('casts/:slug')
  getPublicCastBySlug(@Param('slug') slug: string) {
    return this.nightlifeDataService.getPublicCastBySlug(slug);
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

  @CreatePartnerRequestContract()
  @Post('partner-requests')
  createPartnerRequest(@Body() dto: CreatePartnerRequestDto) {
    return this.nightlifeDataService.createPartnerRequest(dto);
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

  @CancelMemberBookingContract()
  @ActionPolicy('canViewMemberBooking')
  @Roles('USER')
  @UseGuards(JwtAuthGuard, RolesGuard, ActionPolicyGuard)
  @Patch('member/bookings/:bookingId/cancel')
  cancelMemberBooking(
    @Req() request: RequestWithUser,
    @Param('bookingId') bookingId: string,
    @Body() dto: CancelBookingDto,
  ) {
    return this.nightlifeDataService.cancelMemberBooking(
      request.user,
      bookingId,
      dto,
    );
  }

  @MemberBookingsContract()
  @ActionPolicy('canViewMemberBooking')
  @Roles('USER')
  @UseGuards(JwtAuthGuard, RolesGuard, ActionPolicyGuard)
  @Get('member/bookings')
  listMemberBookings(@Req() request: RequestWithUser) {
    return this.nightlifeDataService.listMemberBookings(request.user.id);
  }

  @MemberFavoriteCastsContract()
  @Roles('USER')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get('member/favorite-casts')
  listMemberFavoriteCasts(@Req() request: RequestWithUser) {
    return this.nightlifeDataService.listMemberFavoriteCasts(request.user.id);
  }

  @MemberCastFavoriteStateContract()
  @Roles('USER')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get('member/favorite-casts/:slug')
  getMemberCastFavorite(
    @Req() request: RequestWithUser,
    @Param('slug') slug: string,
  ) {
    return this.nightlifeDataService.getMemberCastFavoriteState(
      request.user.id,
      slug,
    );
  }

  @MemberFavoriteCastContract()
  @Roles('USER')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post('member/favorite-casts/:slug')
  favoriteMemberCast(
    @Req() request: RequestWithUser,
    @Param('slug') slug: string,
  ) {
    return this.nightlifeDataService.favoriteMemberCast(request.user, slug);
  }

  @MemberUnfavoriteCastContract()
  @Roles('USER')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Delete('member/favorite-casts/:slug')
  unfavoriteMemberCast(
    @Req() request: RequestWithUser,
    @Param('slug') slug: string,
  ) {
    return this.nightlifeDataService.unfavoriteMemberCast(request.user, slug);
  }

  @MemberCouponIssuesContract()
  @ActionPolicy('canViewMemberCoupon')
  @Roles('USER')
  @UseGuards(JwtAuthGuard, RolesGuard, ActionPolicyGuard)
  @Get('member/coupon-issues')
  listMemberCouponIssues(@Req() request: RequestWithUser) {
    return this.nightlifeDataService.listMemberCouponIssues(request.user.id);
  }

  @CreateMemberBillContract()
  @Roles('USER')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post('member/bills')
  submitMemberBill(
    @Req() request: RequestWithUser,
    @Body() dto: CreateBillDto,
  ) {
    return this.nightlifeDataService.submitMemberBill(request.user, dto);
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
