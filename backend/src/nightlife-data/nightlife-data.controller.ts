import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiOkResponse } from '@nestjs/swagger';
import type * as express from 'express';
import { ActionPolicy } from '../access/action-policy.decorator';
import { ActionPolicyGuard } from '../access/action-policy.guard';
import { AuthenticatedUser } from '../access/access.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import {
  AdminCouponIssuesContract,
  AdminDashboardStatsContract,
  AdminPartnerRequestsContract,
  AdminRevenueReportContract,
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
  CreatePartnerBillContract,
  CreatePartnerRequestContract,
  GuestBookingLookupContract,
  MemberBillsContract,
  MemberBookingsContract,
  MemberCastFavoriteStateContract,
  MemberClaimCouponContract,
  MemberCouponIssuesContract,
  MemberFavoriteCastContract,
  MemberFavoriteCastsContract,
  MemberPointSummaryContract,
  MemberUnfavoriteCastContract,
  PartnerBillsContract,
  PartnerBookingsContract,
  PartnerLiteDashboardContract,
  PartnerConfirmCheckInContract,
  PartnerCouponsContract,
  RecordProfileViewContract,
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
  ReviewPartnerRequestContract,
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
import { BillOcrPreviewDto, ReverseBillDto } from './dto/bill-p2.dto';
import { ClaimGuestCouponDto } from './dto/claim-guest-coupon.dto';
import {
  AdminCouponIssueQueryDto,
  ScanBookingQrDto,
  ScanCouponIssueDto,
} from './dto/coupon-issue.dto';
import {
  AdminContentQueryDto,
  CreateAdminContentDto,
  PublicContentQueryDto,
  UpdateAdminContentDto,
} from './dto/content.dto';
import {
  AdminSensitiveBillQueryDto,
  CreateBillDto,
} from './dto/create-bill.dto';
import { CreateBookingDto } from './dto/create-booking.dto';
import {
  AdminPartnerRequestQueryDto,
  CreatePartnerRequestDto,
  ReviewPartnerRequestDto,
} from './dto/create-partner-request.dto';
import {
  AdminRankingQueryDto,
  AdminRankingTargetOptionsQueryDto,
  CreateAdminRankingConfigDto,
  UpdateAdminRankingConfigDto,
} from './dto/admin-ranking.dto';
import { AdminBookingQueryDto } from './dto/admin-booking.dto';
import { AdminRevenueReportQueryDto } from './dto/admin-revenue-report.dto';
import {
  PublicDiscoveryQueryDto,
  PublicRankingQueryDto,
} from './dto/public-discovery-query.dto';
import { RecordProfileViewDto } from './dto/profile-view.dto';
import {
  ConfirmNegativeCommissionDto,
  ReviewBillDto,
  VoidBillDto,
} from './dto/review-bill.dto';
import {
  AdminCommissionOverrideQueryDto,
  CreateCommissionOverrideDto,
  UpdateCommissionOverrideDto,
} from './dto/commission-override.dto';
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

  @RecordProfileViewContract()
  @Post('analytics/profile-view')
  recordProfileView(@Body() dto: RecordProfileViewDto) {
    return this.nightlifeDataService.recordPublicProfileView(dto);
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
  createGuestBooking(
    @Req() request: express.Request,
    @Body() dto: CreateBookingDto,
  ) {
    return this.nightlifeDataService.createGuestBooking(
      dto,
      this.couponRequestContext(request),
    );
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
    return this.nightlifeDataService.listGuestBookingMessages(bookingId, phone);
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

  @PartnerLiteDashboardContract()
  @ActionPolicy('canViewPartnerStore')
  @Roles('PARTNER', 'ADMIN')
  @UseGuards(JwtAuthGuard, RolesGuard, ActionPolicyGuard)
  @Get('partner/dashboard-lite')
  getPartnerLiteDashboard(
    @Req() request: RequestWithUser,
    @Query('period') period?: string,
  ) {
    return this.nightlifeDataService.getPartnerLiteDashboard(
      request.user,
      period,
    );
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
    return this.nightlifeDataService.scanCouponIssuePayload(dto, request.user);
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

  @Roles('PARTNER', 'ADMIN', 'OPERATOR')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post('partner/booking-qrs/scan')
  scanPartnerBookingQr(
    @Req() request: RequestWithUser,
    @Body() dto: ScanBookingQrDto,
  ) {
    return this.nightlifeDataService.scanPartnerBookingQr(dto, request.user);
  }

  @Roles('PARTNER', 'ADMIN', 'OPERATOR')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post('partner/booking-qrs/:bookingId/confirm-check-in')
  confirmPartnerBookingQrCheckIn(
    @Req() request: RequestWithUser,
    @Param('bookingId') bookingId: string,
  ) {
    return this.nightlifeDataService.confirmPartnerBookingQrCheckIn(
      bookingId,
      request.user,
    );
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

  @CreatePartnerBillContract()
  @Roles('PARTNER', 'ADMIN')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post('partner/bills')
  submitPartnerBill(
    @Req() request: RequestWithUser,
    @Body() dto: CreateBillDto,
  ) {
    return this.nightlifeDataService.submitPartnerBill(request.user, dto);
  }

  @ApiOperation({
    summary: 'Bill P2: OCR/AI preview helper for uploaded bill evidence',
  })
  @Roles('USER', 'PARTNER', 'ADMIN')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post('bills/ocr-preview')
  previewBillOcr(
    @Req() request: RequestWithUser,
    @Body() dto: BillOcrPreviewDto,
  ) {
    return this.nightlifeDataService.previewBillOcr(request.user, dto);
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
    return this.nightlifeDataService.createMemberBooking(
      request.user,
      dto,
      this.couponRequestContext(request),
    );
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

  @MemberPointSummaryContract()
  @Roles('USER')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get('member/points/summary')
  getMemberPointSummary(@Req() request: RequestWithUser) {
    return this.nightlifeDataService.getMemberPointSummary(request.user.id);
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

  @MemberBillsContract()
  @Roles('USER')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get('member/bills')
  listMemberBills(@Req() request: RequestWithUser) {
    return this.nightlifeDataService.listMemberBills(request.user);
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
  listSensitiveBillsForAdmin(
    @Req() request: RequestWithUser,
    @Query() query: AdminSensitiveBillQueryDto,
  ) {
    return this.nightlifeDataService.listSensitiveBillsForAdmin(
      request.user,
      query,
    );
  }

  @AdminRevenueReportContract()
  @ActionPolicy('canViewRevenueReport')
  @Roles('ADMIN')
  @UseGuards(JwtAuthGuard, RolesGuard, ActionPolicyGuard)
  @Get('admin/reports/revenue')
  getAdminRevenueReport(
    @Req() request: RequestWithUser,
    @Query() query: AdminRevenueReportQueryDto,
  ) {
    return this.nightlifeDataService.getAdminRevenueReport(request.user, query);
  }

  @ApiOperation({
    summary: 'Admin action: list campaign commission overrides',
  })
  @Roles('ADMIN')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get('admin/commission-overrides')
  listAdminCommissionOverrides(
    @Query() query: AdminCommissionOverrideQueryDto,
  ) {
    return this.nightlifeDataService.listAdminCommissionOverrides(query);
  }

  @ApiOperation({
    summary: 'Admin action: create campaign commission override',
  })
  @Roles('ADMIN')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post('admin/commission-overrides')
  createAdminCommissionOverride(
    @Req() request: RequestWithUser,
    @Body() dto: CreateCommissionOverrideDto,
  ) {
    return this.nightlifeDataService.createAdminCommissionOverride(
      request.user.id,
      dto,
    );
  }

  @ApiOperation({
    summary: 'Admin action: update campaign commission override',
  })
  @Roles('ADMIN')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Patch('admin/commission-overrides/:storeId/:couponId')
  updateAdminCommissionOverride(
    @Req() request: RequestWithUser,
    @Param('storeId') storeId: string,
    @Param('couponId') couponId: string,
    @Body() dto: UpdateCommissionOverrideDto,
  ) {
    return this.nightlifeDataService.updateAdminCommissionOverride(
      request.user.id,
      storeId,
      couponId,
      dto,
    );
  }

  @ApiOperation({
    summary: 'Admin action: delete campaign commission override',
  })
  @Roles('ADMIN')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Delete('admin/commission-overrides/:storeId/:couponId')
  deleteAdminCommissionOverride(
    @Req() request: RequestWithUser,
    @Param('storeId') storeId: string,
    @Param('couponId') couponId: string,
  ) {
    return this.nightlifeDataService.deleteAdminCommissionOverride(
      request.user.id,
      storeId,
      couponId,
    );
  }

  @AdminPartnerRequestsContract()
  @Roles('ADMIN')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get('admin/partner-requests')
  listAdminPartnerRequests(@Query() query: AdminPartnerRequestQueryDto) {
    return this.nightlifeDataService.listAdminPartnerRequests(query);
  }

  @ReviewPartnerRequestContract()
  @Roles('ADMIN')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Patch('admin/partner-requests/:requestId/review')
  reviewPartnerRequest(
    @Req() request: RequestWithUser,
    @Param('requestId') requestId: string,
    @Body() dto: ReviewPartnerRequestDto,
  ) {
    return this.nightlifeDataService.reviewPartnerRequest(
      request.user.id,
      requestId,
      dto,
    );
  }

  @AdminCouponIssuesContract()
  @Roles('ADMIN')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get('admin/coupon-issues')
  listAdminCouponIssues(@Query() query: AdminCouponIssueQueryDto) {
    return this.nightlifeDataService.listAdminCouponIssues(query);
  }

  @Roles('ADMIN')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Patch('admin/coupon-issues/:issueId/revoke-qr')
  revokeAdminCouponIssueQrToken(
    @Req() request: RequestWithUser,
    @Param('issueId') issueId: string,
  ) {
    return this.nightlifeDataService.revokeAdminCouponIssueQrToken(
      issueId,
      request.user,
    );
  }

  @Roles('ADMIN')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post('admin/coupon-issues/:issueId/rotate-qr')
  rotateAdminCouponIssueQrToken(
    @Req() request: RequestWithUser,
    @Param('issueId') issueId: string,
  ) {
    return this.nightlifeDataService.rotateAdminCouponIssueQrToken(
      issueId,
      request.user,
    );
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

  @ApiOperation({
    summary: 'Admin action: preview bill approval before changing status',
  })
  @ActionPolicy('canReviewBill')
  @Roles('ADMIN')
  @UseGuards(JwtAuthGuard, RolesGuard, ActionPolicyGuard)
  @Get('admin/sensitive-bills/:billId/approval-preview')
  previewSensitiveBillApproval(
    @Req() request: RequestWithUser,
    @Param('billId') billId: string,
  ) {
    return this.nightlifeDataService.previewSensitiveBillApproval(
      request.user.id,
      billId,
    );
  }

  @ApiOperation({
    summary: 'Admin action: confirm a negative commission bill after PM/BA review',
  })
  @ActionPolicy('canReviewBill')
  @Roles('ADMIN')
  @UseGuards(JwtAuthGuard, RolesGuard, ActionPolicyGuard)
  @Patch('admin/sensitive-bills/:billId/confirm-negative-commission')
  confirmSensitiveBillNegativeCommission(
    @Req() request: RequestWithUser,
    @Param('billId') billId: string,
    @Body() dto: ConfirmNegativeCommissionDto,
  ) {
    return this.nightlifeDataService.reviewSensitiveBill(
      request.user.id,
      billId,
      {
        approve: true,
        confirmNegativeCommission: true,
        pmBaReason: dto.reason,
      },
    );
  }

  @ApiOperation({
    summary: 'Admin action: void or refund a reviewed bill and reverse points',
  })
  @ActionPolicy('canReviewBill')
  @Roles('ADMIN')
  @UseGuards(JwtAuthGuard, RolesGuard, ActionPolicyGuard)
  @Patch('admin/sensitive-bills/:billId/void')
  voidSensitiveBill(
    @Req() request: RequestWithUser,
    @Param('billId') billId: string,
    @Body() dto: VoidBillDto,
  ) {
    return this.nightlifeDataService.voidSensitiveBill(
      request.user.id,
      billId,
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

  @ApiOperation({
    summary: 'Bill P2: reverse an approved bill and related loyalty impact',
  })
  @ActionPolicy('canReviewBill')
  @Roles('ADMIN')
  @UseGuards(JwtAuthGuard, RolesGuard, ActionPolicyGuard)
  @Patch('admin/sensitive-bills/:billId/reverse')
  reverseSensitiveBill(
    @Req() request: RequestWithUser,
    @Param('billId') billId: string,
    @Body() dto: ReverseBillDto,
  ) {
    return this.nightlifeDataService.reverseSensitiveBill(
      request.user.id,
      billId,
      dto,
    );
  }

  @ApiOperation({
    summary: 'Admin action: List bookings with filters and pagination',
  })
  @Roles('ADMIN')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get('admin/bookings')
  listAdminBookings(@Query() query: AdminBookingQueryDto) {
    return this.nightlifeDataService.listAdminBookings(query);
  }

  @ApiOperation({
    summary: 'Admin action: List bills with filters and pagination',
  })
  @Roles('ADMIN')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get('admin/bills')
  listAdminBills(
    @Query() query: import('./dto/admin-bill.dto').AdminBillQueryDto,
  ) {
    return this.nightlifeDataService.listAdminBills(query);
  }

  @ApiOperation({ summary: 'Admin action: Update booking status' })
  @Roles('ADMIN')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Patch('admin/bookings/:bookingId/status')
  async updateAdminBookingStatus(
    @Param('bookingId') bookingId: string,
    @Body() dto: import('./dto/admin-booking.dto').UpdateAdminBookingStatusDto,
  ) {
    return this.nightlifeDataService.updateAdminBookingStatus(
      bookingId,
      dto.status,
    );
  }

  @ApiOperation({
    summary: 'Admin action: List coupons with filters and pagination',
  })
  @Roles('ADMIN')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get('admin/coupons')
  listAdminCoupons(
    @Query() query: import('./dto/admin-coupon.dto').AdminCouponQueryDto,
  ) {
    return this.nightlifeDataService.listAdminCoupons(query);
  }

  @ApiOperation({
    summary: 'Admin action: List stores with filters and pagination',
  })
  @Roles('ADMIN')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get('admin/stores')
  listAdminStores(
    @Query() query: import('./dto/admin-store.dto').AdminStoreQueryDto,
  ) {
    return this.nightlifeDataService.listAdminStores(query);
  }

  @ApiOperation({ summary: 'Admin action: Check if a store slug is available' })
  @ApiOkResponse({
    schema: {
      type: 'object',
      properties: { available: { type: 'boolean' } },
      example: { available: true }
    }
  })
  @Roles('ADMIN')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get('admin/stores/check-slug')
  checkAdminStoreSlug(@Query('slug') slug: string) {
    return this.nightlifeDataService.checkAdminStoreSlug(slug);
  }

  @ApiOperation({ summary: 'Admin action: Create a new store' })
  @Roles('ADMIN')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post('admin/stores')
  createAdminStore(
    @Body() dto: import('./dto/admin-store.dto').CreateAdminStoreDto,
  ) {
    return this.nightlifeDataService.createAdminStore(dto);
  }

  @ApiOperation({ summary: 'Admin action: Update an existing store' })
  @Roles('ADMIN')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Patch('admin/stores/:id')
  updateAdminStore(
    @Param('id') id: string,
    @Body() dto: import('./dto/admin-store.dto').UpdateAdminStoreDto,
  ) {
    return this.nightlifeDataService.updateAdminStore(id, dto);
  }

  // ==========================================
  // ADMIN CASTS
  // ==========================================

  @ApiOperation({ summary: 'Admin action: List casts' })
  @Roles('ADMIN')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get('admin/casts')
  listAdminCasts(@Query() query: import('./dto/admin-store.dto').AdminStoreQueryDto) {
    return this.nightlifeDataService.listAdminCasts(query);
  }

  @ApiOperation({ summary: 'Admin action: Check cast slug availability' })
  @ApiOkResponse({
    schema: {
      type: 'object',
      properties: { available: { type: 'boolean' } },
      example: { available: true }
    }
  })
  @Roles('ADMIN')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get('admin/casts/check-slug')
  checkAdminCastSlug(@Query('slug') slug: string) {
    return this.nightlifeDataService.checkAdminCastSlug(slug);
  }

  @ApiOperation({ summary: 'Admin action: Create a new cast' })
  @Roles('ADMIN')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post('admin/casts')
  createAdminCast(
    @Body() dto: import('./dto/admin-cast.dto').CreateAdminCastDto,
  ) {
    return this.nightlifeDataService.createAdminCast(dto);
  }

  @ApiOperation({ summary: 'Admin action: Update an existing cast' })
  @Roles('ADMIN')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Patch('admin/casts/:id')
  updateAdminCast(
    @Param('id') id: string,
    @Body() dto: import('./dto/admin-cast.dto').UpdateAdminCastDto,
  ) {
    return this.nightlifeDataService.updateAdminCast(id, dto);
  }

  @ApiOperation({ summary: 'Admin action: Approve or reject a bill' })
  @Roles('ADMIN')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Put('admin/bills/:id/status')
  async updateAdminBillStatus(
    @Req() request: RequestWithUser,
    @Param('id') id: string,
    @Body() dto: import('./dto/update-bill-status.dto').UpdateBillStatusDto,
  ) {
    return this.nightlifeDataService.updateAdminBillStatus(
      id,
      dto,
      request.user as any,
    );
  }

  @AdminDashboardStatsContract()
  @Roles('ADMIN')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get('admin/dashboard/stats')
  async getAdminDashboardStats(@Query('timeframe') timeframe?: string) {
    return this.nightlifeDataService.getAdminDashboardStats(timeframe);
  }

  private couponRequestContext(request: express.Request) {
    const forwardedFor = request.headers['x-forwarded-for'];
    const deviceId = request.headers['x-device-id'];
    const sessionId = request.headers['x-session-id'];
    const userAgent = request.headers['user-agent'];
    const forwardedIp = Array.isArray(forwardedFor)
      ? forwardedFor[0]
      : forwardedFor;
    const requestUser = (request as Partial<RequestWithUser>).user;

    return {
      ip:
        forwardedIp?.split(',')[0]?.trim() ||
        request.ip ||
        request.socket.remoteAddress ||
        null,
      userAgent: Array.isArray(userAgent) ? userAgent[0] : (userAgent ?? null),
      deviceId: Array.isArray(deviceId) ? deviceId[0] : (deviceId ?? null),
      sessionId: Array.isArray(sessionId)
        ? sessionId[0]
        : (sessionId ?? requestUser?.jti ?? null),
    };
  }
}
