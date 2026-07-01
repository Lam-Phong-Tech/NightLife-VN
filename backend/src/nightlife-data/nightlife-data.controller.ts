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
  AdminCouponIssuesContract,
  AdminPartnerRequestsContract,
  AdminSensitiveBillsContract,
  CancelAdminBookingContract,
  CancelGuestBookingContract,
  CancelMemberBookingContract,
  AdminContentMutationContract,
  AdminContentsContract,
  ClaimGuestCouponContract,
  CreateGuestBookingContract,
  CreateMemberBillContract,
  CreateMemberBookingContract,
  CreatePartnerRequestContract,
  GuestBookingLookupContract,
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
  PartnerScanCouponPayloadContract,
  PartnerScanCouponContract,
  PartnerStoresContract,
  PublicCastDetailContract,
  PublicAreasContract,
  PublicCastsContract,
  PublicContentDetailContract,
  PublicContentsContract,
  PublicCouponsContract,
  PublicRankingsContract,
  PublicStoreDetailContract,
  PublicStoresContract,
  ReviewSensitiveBillContract,
} from './nightlife-data.contract';
import {
  CancelBookingDto,
  CancelGuestBookingDto,
} from './dto/cancel-booking.dto';
import {
  BookingChatMessageDto,
  GuestBookingChatMessageDto,
  GuestBookingRescheduleDto,
  RequestBookingRescheduleDto,
  ReviewBookingChangeRequestDto,
  UpdateStoreBookingPolicyDto,
} from './dto/booking-p2.dto';
import { ClaimGuestCouponDto } from './dto/claim-guest-coupon.dto';
import {
  AdminCouponIssueQueryDto,
  ScanCouponIssueDto,
} from './dto/coupon-issue.dto';
import {
  AdminContentQueryDto,
  CreateAdminContentDto,
  PublicContentQueryDto,
  UpdateAdminContentDto,
} from './dto/content.dto';
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

  @PublicContentsContract()
  @Get('contents')
  listPublicContents(@Query() query: PublicContentQueryDto) {
    return this.nightlifeDataService.listPublicContents(query);
  }

  @PublicContentDetailContract()
  @Get('contents/:slug')
  getPublicContentBySlug(@Param('slug') slug: string) {
    return this.nightlifeDataService.getPublicContentBySlug(slug);
  }

  @AdminContentsContract()
  @Roles('ADMIN')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get('admin/contents')
  listAdminContents(@Query() query: AdminContentQueryDto) {
    return this.nightlifeDataService.listAdminContents(query);
  }

  @AdminContentMutationContract('create')
  @Roles('ADMIN')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post('admin/contents')
  createAdminContent(
    @Req() request: RequestWithUser,
    @Body() dto: CreateAdminContentDto,
  ) {
    return this.nightlifeDataService.createAdminContent(request.user, dto);
  }

  @AdminContentMutationContract('update')
  @Roles('ADMIN')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Patch('admin/contents/:contentId')
  updateAdminContent(
    @Param('contentId') contentId: string,
    @Body() dto: UpdateAdminContentDto,
  ) {
    return this.nightlifeDataService.updateAdminContent(contentId, dto);
  }

  @AdminContentMutationContract('delete')
  @Roles('ADMIN')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Delete('admin/contents/:contentId')
  deleteAdminContent(@Param('contentId') contentId: string) {
    return this.nightlifeDataService.deleteAdminContent(contentId);
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

  @CancelGuestBookingContract()
  @Patch('bookings/:bookingId/cancel')
  cancelGuestBooking(
    @Param('bookingId') bookingId: string,
    @Body() dto: CancelGuestBookingDto,
  ) {
    return this.nightlifeDataService.cancelGuestBooking(bookingId, dto);
  }

  @Post('bookings/:bookingId/reschedule')
  requestGuestBookingReschedule(
    @Param('bookingId') bookingId: string,
    @Body() dto: GuestBookingRescheduleDto,
  ) {
    return this.nightlifeDataService.requestGuestBookingReschedule(
      bookingId,
      dto,
    );
  }

  @Get('bookings/:bookingId/messages')
  listGuestBookingMessages(
    @Param('bookingId') bookingId: string,
    @Query('phone') phone: string,
  ) {
    return this.nightlifeDataService.listGuestBookingMessages(
      bookingId,
      phone,
    );
  }

  @Post('bookings/:bookingId/messages')
  createGuestBookingMessage(
    @Param('bookingId') bookingId: string,
    @Body() dto: GuestBookingChatMessageDto,
  ) {
    return this.nightlifeDataService.createGuestBookingMessage(bookingId, dto);
  }

  @GuestBookingLookupContract()
  @Get('bookings/:bookingCode')
  getGuestBookingByCode(
    @Param('bookingCode') bookingCode: string,
    @Query('phone') phone: string,
  ) {
    return this.nightlifeDataService.getGuestBookingByCode(bookingCode, phone);
  }

  @CreatePartnerRequestContract()
  @Post('partner-requests')
  createPartnerRequest(@Body() dto: CreatePartnerRequestDto) {
    return this.nightlifeDataService.createPartnerRequest(dto);
  }

  @ClaimGuestCouponContract()
  @Post('coupons/:couponId/guest-claims')
  claimGuestCoupon(
    @Req() request: express.Request,
    @Param('couponId') couponId: string,
    @Body() dto: ClaimGuestCouponDto,
  ) {
    return this.nightlifeDataService.claimGuestCoupon(
      couponId,
      dto,
      this.couponRequestContext(request),
    );
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
    return this.nightlifeDataService.claimMemberCoupon(
      couponId,
      request.user,
      this.couponRequestContext(request),
    );
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

  @PartnerScanCouponPayloadContract()
  @Roles('PARTNER', 'ADMIN', 'OPERATOR')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post('partner/coupon-issues/scan')
  scanCouponIssuePayload(
    @Req() request: RequestWithUser,
    @Body() dto: ScanCouponIssueDto,
  ) {
    return this.nightlifeDataService.scanCouponIssuePayload(
      dto,
      request.user,
    );
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

  @CancelAdminBookingContract('operator')
  @Roles('OPERATOR', 'ADMIN')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Patch('operator/bookings/:bookingId/cancel')
  cancelBookingAsOperator(
    @Req() request: RequestWithUser,
    @Param('bookingId') bookingId: string,
    @Body() dto: CancelBookingDto,
  ) {
    return this.nightlifeDataService.cancelAdminBooking(
      request.user,
      bookingId,
      dto,
    );
  }

  @Roles('OPERATOR', 'ADMIN')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get('operator/booking-change-requests')
  listOperatorBookingChangeRequests(
    @Req() request: RequestWithUser,
    @Query() query: { status?: string; storeId?: string },
  ) {
    return this.nightlifeDataService.listAdminBookingChangeRequests(
      request.user,
      query,
    );
  }

  @Roles('OPERATOR', 'ADMIN')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Patch('operator/booking-change-requests/:requestId/review')
  reviewBookingChangeRequestAsOperator(
    @Req() request: RequestWithUser,
    @Param('requestId') requestId: string,
    @Body() dto: ReviewBookingChangeRequestDto,
  ) {
    return this.nightlifeDataService.reviewBookingChangeRequest(
      request.user,
      requestId,
      dto,
    );
  }

  @Roles('OPERATOR', 'ADMIN')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get('operator/bookings/:bookingId/messages')
  listOperatorBookingMessages(
    @Req() request: RequestWithUser,
    @Param('bookingId') bookingId: string,
  ) {
    return this.nightlifeDataService.listAdminBookingMessages(
      request.user,
      bookingId,
    );
  }

  @Roles('OPERATOR', 'ADMIN')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post('operator/bookings/:bookingId/messages')
  createOperatorBookingMessage(
    @Req() request: RequestWithUser,
    @Param('bookingId') bookingId: string,
    @Body() dto: BookingChatMessageDto,
  ) {
    return this.nightlifeDataService.createAdminBookingMessage(
      request.user,
      bookingId,
      dto,
    );
  }

  @Roles('OPERATOR', 'ADMIN')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get('operator/bookings/cancel-analytics')
  getOperatorBookingCancelAnalytics(
    @Req() request: RequestWithUser,
    @Query() query: { days?: string | number },
  ) {
    return this.nightlifeDataService.getAdminBookingCancelAnalytics(
      request.user,
      query,
    );
  }

  @Roles('OPERATOR', 'ADMIN')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Patch('operator/stores/:storeId/booking-policy')
  updateOperatorStoreBookingPolicy(
    @Req() request: RequestWithUser,
    @Param('storeId') storeId: string,
    @Body() dto: UpdateStoreBookingPolicyDto,
  ) {
    return this.nightlifeDataService.updateStoreBookingPolicy(
      request.user,
      storeId,
      dto,
    );
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

  @Roles('USER')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post('member/bookings/:bookingId/reschedule')
  requestMemberBookingReschedule(
    @Req() request: RequestWithUser,
    @Param('bookingId') bookingId: string,
    @Body() dto: RequestBookingRescheduleDto,
  ) {
    return this.nightlifeDataService.requestMemberBookingReschedule(
      request.user,
      bookingId,
      dto,
    );
  }

  @Roles('USER')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get('member/bookings/:bookingId/messages')
  listMemberBookingMessages(
    @Req() request: RequestWithUser,
    @Param('bookingId') bookingId: string,
  ) {
    return this.nightlifeDataService.listMemberBookingMessages(
      request.user,
      bookingId,
    );
  }

  @Roles('USER')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post('member/bookings/:bookingId/messages')
  createMemberBookingMessage(
    @Req() request: RequestWithUser,
    @Param('bookingId') bookingId: string,
    @Body() dto: BookingChatMessageDto,
  ) {
    return this.nightlifeDataService.createMemberBookingMessage(
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

  @AdminPartnerRequestsContract()
  @Roles('ADMIN')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get('admin/partner-requests')
  listAdminPartnerRequests() {
    return this.nightlifeDataService.listAdminPartnerRequests();
  }

  @AdminCouponIssuesContract()
  @Roles('ADMIN')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get('admin/coupon-issues')
  listAdminCouponIssues(@Query() query: AdminCouponIssueQueryDto) {
    return this.nightlifeDataService.listAdminCouponIssues(query);
  }

  @CancelAdminBookingContract('admin')
  @Roles('ADMIN')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Patch('admin/bookings/:bookingId/cancel')
  cancelBookingAsAdmin(
    @Req() request: RequestWithUser,
    @Param('bookingId') bookingId: string,
    @Body() dto: CancelBookingDto,
  ) {
    return this.nightlifeDataService.cancelAdminBooking(
      request.user,
      bookingId,
      dto,
    );
  }

  @Roles('ADMIN')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get('admin/booking-change-requests')
  listAdminBookingChangeRequests(
    @Req() request: RequestWithUser,
    @Query() query: { status?: string; storeId?: string },
  ) {
    return this.nightlifeDataService.listAdminBookingChangeRequests(
      request.user,
      query,
    );
  }

  @Roles('ADMIN')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Patch('admin/booking-change-requests/:requestId/review')
  reviewBookingChangeRequest(
    @Req() request: RequestWithUser,
    @Param('requestId') requestId: string,
    @Body() dto: ReviewBookingChangeRequestDto,
  ) {
    return this.nightlifeDataService.reviewBookingChangeRequest(
      request.user,
      requestId,
      dto,
    );
  }

  @Roles('ADMIN')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get('admin/bookings/:bookingId/messages')
  listAdminBookingMessages(
    @Req() request: RequestWithUser,
    @Param('bookingId') bookingId: string,
  ) {
    return this.nightlifeDataService.listAdminBookingMessages(
      request.user,
      bookingId,
    );
  }

  @Roles('ADMIN')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post('admin/bookings/:bookingId/messages')
  createAdminBookingMessage(
    @Req() request: RequestWithUser,
    @Param('bookingId') bookingId: string,
    @Body() dto: BookingChatMessageDto,
  ) {
    return this.nightlifeDataService.createAdminBookingMessage(
      request.user,
      bookingId,
      dto,
    );
  }

  @Roles('ADMIN')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get('admin/bookings/cancel-analytics')
  getAdminBookingCancelAnalytics(
    @Req() request: RequestWithUser,
    @Query() query: { days?: string | number },
  ) {
    return this.nightlifeDataService.getAdminBookingCancelAnalytics(
      request.user,
      query,
    );
  }

  @Roles('ADMIN')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Patch('admin/stores/:storeId/booking-policy')
  updateAdminStoreBookingPolicy(
    @Req() request: RequestWithUser,
    @Param('storeId') storeId: string,
    @Body() dto: UpdateStoreBookingPolicyDto,
  ) {
    return this.nightlifeDataService.updateStoreBookingPolicy(
      request.user,
      storeId,
      dto,
    );
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

  private couponRequestContext(request: express.Request) {
    const forwardedFor = request.headers['x-forwarded-for'];
    const deviceId = request.headers['x-device-id'];
    const userAgent = request.headers['user-agent'];
    const forwardedIp = Array.isArray(forwardedFor)
      ? forwardedFor[0]
      : forwardedFor;

    return {
      ip:
        forwardedIp?.split(',')[0]?.trim() ||
        request.ip ||
        request.socket.remoteAddress ||
        null,
      userAgent: Array.isArray(userAgent) ? userAgent[0] : userAgent ?? null,
      deviceId: Array.isArray(deviceId) ? deviceId[0] : deviceId ?? null,
    };
  }
}
