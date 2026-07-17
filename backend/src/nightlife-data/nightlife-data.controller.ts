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
  Res,
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
  MemberFavoriteStoreContract,
  MemberFavoriteStoresContract,
  MemberPointSummaryContract,
  MemberUnfavoriteCastContract,
  MemberUnfavoriteStoreContract,
  MemberStoreFavoriteStateContract,
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
import {
  AutoReverseBillsDto,
  BillOcrPreviewDto,
  ReverseBillDto,
} from './dto/bill-p2.dto';
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
  ConfirmTourBookingCheckInDto,
  CreateTourBookingDto,
  ScanTourBookingQrDto,
} from './dto/tour-booking.dto';
import {
  AdminPartnerRequestQueryDto,
  CreatePartnerRequestDto,
  ReviewPartnerRequestDto,
} from './dto/create-partner-request.dto';
import { PartnerListingDraftDto } from './dto/partner-listing.dto';
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
import { UpdateBillStatusDto } from './dto/update-bill-status.dto';
import {
  AdminQaAuditTrailQueryDto,
  AdminUatDashboardQueryDto,
  AutoBillFraudReversalDto,
} from './dto/qa-p2.dto';
import {
  AdminCommissionOverrideQueryDto,
  CreateCommissionOverrideDto,
  UpdateCommissionOverrideDto,
} from './dto/commission-override.dto';
import { NightlifeDataService } from './nightlife-data.service';
import {
  AdminStoreVideoQueryDto,
  PublicHomeContentQueryDto,
  PublicHotVideoInteractionDto,
  UpdateHotVideosDto,
} from './dto/admin-video.dto';

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
  @Get('admin/media/store-videos')
  adminListStoreVideos(@Query() query: AdminStoreVideoQueryDto) {
    return this.nightlifeDataService.adminListStoreVideos(query);
  }

  @Get('content/hot-videos/:cityCode')
  listPublicHotVideos(@Param('cityCode') cityCode: string) {
    return this.nightlifeDataService.listPublicHotVideos(cityCode);
  }

  @Get('content/recommendations')
  listPublicHomeRecommendations(@Query() query: PublicHomeContentQueryDto) {
    return this.nightlifeDataService.listPublicHomeRecommendations(query);
  }

  @Get('content/tours')
  listPublicTours(@Query() query: PublicHomeContentQueryDto) {
    return this.nightlifeDataService.listPublicTours(query);
  }

  @Post('content/hot-videos/:mediaId/view')
  trackPublicHotVideoView(
    @Param('mediaId') mediaId: string,
    @Body() dto: PublicHotVideoInteractionDto,
  ) {
    return this.nightlifeDataService.trackPublicHotVideoInteraction(
      mediaId,
      'view',
      dto,
    );
  }

  @Post('content/hot-videos/:mediaId/like')
  trackPublicHotVideoLike(
    @Param('mediaId') mediaId: string,
    @Body() dto: PublicHotVideoInteractionDto,
  ) {
    return this.nightlifeDataService.trackPublicHotVideoInteraction(
      mediaId,
      'like',
      dto,
    );
  }

  @Roles('ADMIN')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get('admin/content/hot-videos/:cityCode')
  adminGetHotVideos(@Param('cityCode') cityCode: string) {
    return this.nightlifeDataService.adminGetHotVideos(cityCode);
  }

  @Roles('ADMIN')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Put('admin/content/hot-videos/:cityCode')
  adminUpdateHotVideos(
    @Param('cityCode') cityCode: string,
    @Body() dto: UpdateHotVideosDto,
    @Req() req: RequestWithUser,
  ) {
    return this.nightlifeDataService.adminUpdateHotVideos(
      cityCode,
      dto,
      req.user.id,
    );
  }

  @ActionPolicy('canManageRanking')
  @Roles('ADMIN')
  @UseGuards(JwtAuthGuard, RolesGuard, ActionPolicyGuard)
  @Get('admin/rankings')
  listAdminRankingConfigs(@Query() query: AdminRankingQueryDto) {
    return this.nightlifeDataService.listAdminRankingConfigs(query);
  }

  @ActionPolicy('canManageRanking')
  @Roles('ADMIN')
  @UseGuards(JwtAuthGuard, RolesGuard, ActionPolicyGuard)
  @Get('admin/rankings/options')
  listAdminRankingTargetOptions(
    @Query() query: AdminRankingTargetOptionsQueryDto,
  ) {
    return this.nightlifeDataService.listAdminRankingTargetOptions(query);
  }

  @ActionPolicy('canManageRanking')
  @Roles('ADMIN')
  @UseGuards(JwtAuthGuard, RolesGuard, ActionPolicyGuard)
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

  @ActionPolicy('canManageRanking')
  @Roles('ADMIN')
  @UseGuards(JwtAuthGuard, RolesGuard, ActionPolicyGuard)
  @Patch('admin/rankings/:rankingId')
  updateAdminRankingConfig(
    @Req() request: RequestWithUser,
    @Param('rankingId') rankingId: string,
    @Body() dto: UpdateAdminRankingConfigDto,
  ) {
    return this.nightlifeDataService.updateAdminRankingConfig(
      request.user,
      rankingId,
      dto,
    );
  }

  @ActionPolicy('canManageRanking')
  @Roles('ADMIN')
  @UseGuards(JwtAuthGuard, RolesGuard, ActionPolicyGuard)
  @Delete('admin/rankings/:rankingId')
  deleteAdminRankingConfig(
    @Req() request: RequestWithUser,
    @Param('rankingId') rankingId: string,
  ) {
    return this.nightlifeDataService.deleteAdminRankingConfig(
      request.user,
      rankingId,
    );
  }

  @PublicContentsContract()
  @Get('contents')
  listPublicContents(@Query() query: PublicContentQueryDto) {
    return this.nightlifeDataService.listPublicContents(query);
  }

  @PublicContentDetailContract()
  @Get('contents/:slug')
  getPublicContentBySlug(
    @Param('slug') slug: string,
    @Query('preview') preview?: string,
  ) {
    return this.nightlifeDataService.getPublicContentBySlug(
      slug,
      preview === '1',
    );
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

  @Post('tours/:tourId/bookings')
  createGuestTourBooking(
    @Req() request: express.Request,
    @Param('tourId') tourId: string,
    @Body() dto: CreateTourBookingDto,
  ) {
    return this.nightlifeDataService.createGuestTourBooking(
      tourId,
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

  @Post('admin-coupons/:couponId/member-claims')
  @Roles('USER')
  @UseGuards(JwtAuthGuard, RolesGuard)
  claimAdminGlobalCouponForMember(
    @Req() request: RequestWithUser,
    @Param('couponId') couponId: string,
  ) {
    return this.nightlifeDataService.claimAdminGlobalCouponForMember(
      couponId,
      request.user,
      this.couponRequestContext(request),
    );
  }

  @Post('admin-coupons/:couponId/guest-claims')
  claimAdminGlobalCouponForGuest(
    @Req() request: express.Request,
    @Param('couponId') couponId: string,
    @Body() dto: ClaimGuestCouponDto,
  ) {
    return this.nightlifeDataService.claimAdminGlobalCouponForGuest(
      couponId,
      dto,
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

  @Roles('PARTNER', 'ADMIN')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get('partner/listing-draft/:storeId')
  getPartnerListingDraft(
    @Req() request: RequestWithUser,
    @Param('storeId') storeId: string,
  ) {
    return this.nightlifeDataService.getPartnerListingDraft(
      request.user,
      storeId,
    );
  }

  @Roles('PARTNER', 'ADMIN')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Put('partner/listing-draft/:storeId')
  savePartnerListingDraft(
    @Req() request: RequestWithUser,
    @Param('storeId') storeId: string,
    @Body() dto: PartnerListingDraftDto,
  ) {
    return this.nightlifeDataService.savePartnerListingDraft(
      request.user,
      storeId,
      dto,
    );
  }

  @Roles('PARTNER', 'ADMIN')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post('partner/listing-draft/:storeId/submit')
  submitPartnerListingDraft(
    @Req() request: RequestWithUser,
    @Param('storeId') storeId: string,
    @Body() dto: PartnerListingDraftDto,
  ) {
    return this.nightlifeDataService.submitPartnerListingDraft(
      request.user,
      storeId,
      dto,
    );
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

  @Roles('PARTNER', 'ADMIN', 'OPERATOR')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post('partner/tour-booking-qrs/scan')
  scanPartnerTourBookingQr(
    @Req() request: RequestWithUser,
    @Body() dto: ScanTourBookingQrDto,
  ) {
    return this.nightlifeDataService.scanPartnerTourBookingQr(
      dto,
      request.user,
    );
  }

  @Roles('PARTNER', 'ADMIN', 'OPERATOR')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post('partner/tour-booking-qrs/confirm-check-in')
  confirmPartnerTourBookingQrCheckIn(
    @Req() request: RequestWithUser,
    @Body() dto: ConfirmTourBookingCheckInDto,
  ) {
    return this.nightlifeDataService.confirmPartnerTourBookingQrCheckIn(
      dto,
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
  @ActionPolicy('canCancelBooking')
  @Roles('OPERATOR', 'ADMIN')
  @UseGuards(JwtAuthGuard, RolesGuard, ActionPolicyGuard)
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

  @ActionPolicy('canReviewBookingReschedule')
  @Roles('OPERATOR', 'ADMIN')
  @UseGuards(JwtAuthGuard, RolesGuard, ActionPolicyGuard)
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

  @ActionPolicy('canReviewBookingReschedule')
  @Roles('OPERATOR', 'ADMIN')
  @UseGuards(JwtAuthGuard, RolesGuard, ActionPolicyGuard)
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

  @ActionPolicy('canManageBookingChat')
  @Roles('OPERATOR', 'ADMIN')
  @UseGuards(JwtAuthGuard, RolesGuard, ActionPolicyGuard)
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

  @ActionPolicy('canManageBookingChat')
  @Roles('OPERATOR', 'ADMIN')
  @UseGuards(JwtAuthGuard, RolesGuard, ActionPolicyGuard)
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

  @ActionPolicy('canViewCancelAnalytics')
  @Roles('OPERATOR', 'ADMIN')
  @UseGuards(JwtAuthGuard, RolesGuard, ActionPolicyGuard)
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

  @ActionPolicy('canUpdateStorePolicy')
  @Roles('OPERATOR', 'ADMIN')
  @UseGuards(JwtAuthGuard, RolesGuard, ActionPolicyGuard)
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

  @Roles('USER')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post('member/tours/:tourId/bookings')
  createMemberTourBooking(
    @Req() request: RequestWithUser,
    @Param('tourId') tourId: string,
    @Body() dto: CreateTourBookingDto,
  ) {
    return this.nightlifeDataService.createMemberTourBooking(
      request.user,
      tourId,
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

  @MemberFavoriteStoresContract()
  @Roles('USER')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get('member/favorite-stores')
  listMemberFavoriteStores(@Req() request: RequestWithUser) {
    return this.nightlifeDataService.listMemberFavoriteStores(request.user.id);
  }

  @MemberStoreFavoriteStateContract()
  @Roles('USER')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get('member/favorite-stores/:slug')
  getMemberStoreFavorite(
    @Req() request: RequestWithUser,
    @Param('slug') slug: string,
  ) {
    return this.nightlifeDataService.getMemberStoreFavoriteState(
      request.user.id,
      slug,
    );
  }

  @MemberFavoriteStoreContract()
  @Roles('USER')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post('member/favorite-stores/:slug')
  favoriteMemberStore(
    @Req() request: RequestWithUser,
    @Param('slug') slug: string,
  ) {
    return this.nightlifeDataService.favoriteMemberStore(request.user, slug);
  }

  @MemberUnfavoriteStoreContract()
  @Roles('USER')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Delete('member/favorite-stores/:slug')
  unfavoriteMemberStore(
    @Req() request: RequestWithUser,
    @Param('slug') slug: string,
  ) {
    return this.nightlifeDataService.unfavoriteMemberStore(request.user, slug);
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

  @ApiOperation({
    summary: 'Member action: list in-app notifications',
  })
  @Roles('USER')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get('member/notifications')
  listMemberNotifications(
    @Req() request: RequestWithUser,
    @Query() query: { limit?: string | number },
  ) {
    return this.nightlifeDataService.listMemberNotifications(
      request.user,
      query,
    );
  }

  @ApiOperation({
    summary: 'Member action: mark all in-app notifications as read',
  })
  @Roles('USER')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Patch('member/notifications/read-all')
  markAllMemberNotificationsRead(@Req() request: RequestWithUser) {
    return this.nightlifeDataService.markAllMemberNotificationsRead(
      request.user,
    );
  }

  @ApiOperation({
    summary: 'Member action: mark one in-app notification as read',
  })
  @Roles('USER')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Patch('member/notifications/:notificationId/read')
  markMemberNotificationRead(
    @Req() request: RequestWithUser,
    @Param('notificationId') notificationId: string,
  ) {
    return this.nightlifeDataService.markMemberNotificationRead(
      request.user,
      notificationId,
    );
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
    summary: 'Deprecated: campaign commission overrides are disabled',
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
    summary: 'Deprecated: campaign commission override creation is disabled',
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
    summary: 'Deprecated: campaign commission override updates are disabled',
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
    summary: 'Deprecated: campaign commission override deletion is disabled',
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
  @ActionPolicy('canManageCouponIssue')
  @Roles('ADMIN')
  @UseGuards(JwtAuthGuard, RolesGuard, ActionPolicyGuard)
  @Get('admin/coupon-issues')
  listAdminCouponIssues(@Query() query: AdminCouponIssueQueryDto) {
    return this.nightlifeDataService.listAdminCouponIssues(query);
  }

  @ActionPolicy('canManageCouponIssue')
  @Roles('ADMIN')
  @UseGuards(JwtAuthGuard, RolesGuard, ActionPolicyGuard)
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

  @ActionPolicy('canManageCouponIssue')
  @Roles('ADMIN')
  @UseGuards(JwtAuthGuard, RolesGuard, ActionPolicyGuard)
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
  @ActionPolicy('canCancelBooking')
  @Roles('ADMIN')
  @UseGuards(JwtAuthGuard, RolesGuard, ActionPolicyGuard)
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

  @ActionPolicy('canReviewBookingReschedule')
  @Roles('ADMIN')
  @UseGuards(JwtAuthGuard, RolesGuard, ActionPolicyGuard)
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

  @ActionPolicy('canReviewBookingReschedule')
  @Roles('ADMIN')
  @UseGuards(JwtAuthGuard, RolesGuard, ActionPolicyGuard)
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

  @ActionPolicy('canManageBookingChat')
  @Roles('ADMIN')
  @UseGuards(JwtAuthGuard, RolesGuard, ActionPolicyGuard)
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

  @ActionPolicy('canManageBookingChat')
  @Roles('ADMIN')
  @UseGuards(JwtAuthGuard, RolesGuard, ActionPolicyGuard)
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

  @ActionPolicy('canViewCancelAnalytics')
  @Roles('ADMIN')
  @UseGuards(JwtAuthGuard, RolesGuard, ActionPolicyGuard)
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

  @ActionPolicy('canUpdateStorePolicy')
  @Roles('ADMIN')
  @UseGuards(JwtAuthGuard, RolesGuard, ActionPolicyGuard)
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
    summary: 'Bill P2: auto-reverse high-risk duplicate or fake bills',
  })
  @ActionPolicy('canReverseBill')
  @Roles('ADMIN')
  @UseGuards(JwtAuthGuard, RolesGuard, ActionPolicyGuard)
  @Post('admin/sensitive-bills/auto-reverse')
  autoReverseSensitiveBills(
    @Req() request: RequestWithUser,
    @Body() dto: AutoReverseBillsDto,
  ) {
    return this.nightlifeDataService.autoReverseSensitiveBills(
      request.user.id,
      dto,
    );
  }

  @ApiOperation({
    summary: 'Admin action: preview bill approval before changing status',
  })
  @ActionPolicy('canPreviewBillApproval')
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
    summary:
      'Admin action: confirm a negative commission bill after PM/BA review',
  })
  @ActionPolicy('canConfirmBillPmBa')
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
  @ActionPolicy('canVoidBill')
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
  @ActionPolicy('canApproveBill')
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
  @ActionPolicy('canReverseBill')
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

  @ActionPolicy('canReverseBill')
  @Roles('ADMIN')
  @UseGuards(JwtAuthGuard, RolesGuard, ActionPolicyGuard)
  @Post('admin/bills/:billId/fraud-reversal')
  autoBillFraudReversal(
    @Req() request: RequestWithUser,
    @Param('billId') billId: string,
    @Body() dto: AutoBillFraudReversalDto,
  ) {
    return this.nightlifeDataService.autoBillFraudReversal(
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
    @Query() query: { page?: number; limit?: number; search?: string },
  ) {
    return this.nightlifeDataService.listAdminGlobalCoupons(query);
  }

  @ApiOperation({
    summary: 'Admin action: Create a coupon',
  })
  @Roles('ADMIN')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post('admin/coupons')
  createAdminCoupon(
    @Body() dto: import('./dto/create-admin-coupon.dto').CreateAdminCouponDto,
  ) {
    return this.nightlifeDataService.createAdminCoupon(dto);
  }

  @ApiOperation({
    summary: 'Admin action: Update a coupon',
  })
  @Roles('ADMIN')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Patch('admin/coupons/:id')
  updateAdminCoupon(
    @Param('id') id: string,
    @Body() dto: import('./dto/update-admin-coupon.dto').UpdateAdminCouponDto,
  ) {
    return this.nightlifeDataService.updateAdminCoupon(id, dto);
  }

  @ApiOperation({
    summary: 'Admin action: Delete a coupon',
  })
  @Roles('ADMIN')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Delete('admin/coupons/:id')
  deleteAdminCoupon(@Param('id') id: string) {
    return this.nightlifeDataService.deleteAdminCoupon(id);
  }

  @ApiOperation({
    summary: 'Admin action: List coupon issues',
  })
  @Roles('ADMIN')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get('admin/coupons/issues')
  listAdminCampaignCouponIssues(
    @Query()
    query: {
      page?: number;
      limit?: number;
      search?: string;
      status?: import('@prisma/client').CouponIssueStatus;
      adminCouponId?: string;
    },
  ) {
    return this.nightlifeDataService.listAdminGlobalCouponIssues(query);
  }

  // --- LEGACY COMPATIBILITY ALIASES ---

  @Roles('ADMIN')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post('admin/global-coupons')
  createAdminGlobalCoupon(
    @Body() dto: import('./dto/create-admin-coupon.dto').CreateAdminCouponDto,
  ) {
    return this.nightlifeDataService.createAdminCoupon(dto);
  }

  @Roles('ADMIN')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get('admin/global-coupons')
  listAdminGlobalCoupons(
    @Query() query: { page?: number; limit?: number; search?: string },
  ) {
    return this.nightlifeDataService.listAdminGlobalCoupons(query);
  }

  @Roles('ADMIN')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get('admin/global-coupons/issues')
  listAdminGlobalCouponIssues(
    @Query()
    query: {
      page?: number;
      limit?: number;
      search?: string;
      status?: import('@prisma/client').CouponIssueStatus;
      adminCouponId?: string;
    },
  ) {
    return this.nightlifeDataService.listAdminGlobalCouponIssues(query);
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

  @ApiOperation({
    summary: 'Admin action: List partner accounts for store linking',
  })
  @Roles('ADMIN')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get('admin/partner-accounts')
  listAdminPartnerAccounts(
    @Query() query: { search?: string; status?: string },
  ) {
    return this.nightlifeDataService.listAdminPartnerAccounts(query);
  }

  @ApiOperation({ summary: 'Admin action: Check if a store slug is available' })
  @ApiOkResponse({
    schema: {
      type: 'object',
      properties: { available: { type: 'boolean' } },
      example: { available: true },
    },
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

  @ApiOperation({
    summary: 'Admin action: Link or unlink store partner account',
  })
  @Roles('ADMIN')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Patch('admin/stores/:id/partner-account')
  linkAdminStorePartnerAccount(
    @Param('id') id: string,
    @Body()
    dto: import('./dto/admin-store.dto').LinkAdminStorePartnerAccountDto,
  ) {
    return this.nightlifeDataService.linkAdminStorePartnerAccount(id, dto);
  }

  @ApiOperation({ summary: 'Admin action: Delete a store (soft or hard)' })
  @Roles('ADMIN')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Delete('admin/stores/:id')
  deleteAdminStore(
    @Req() request: RequestWithUser,
    @Param('id') id: string,
    @Query('hard') hard?: string,
  ) {
    return this.nightlifeDataService.deleteAdminStore(
      request.user,
      id,
      hard === 'true',
    );
  }

  @ApiOperation({ summary: 'Admin action: Restore a soft-deleted store' })
  @Roles('ADMIN')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Patch('admin/stores/:id/restore')
  restoreAdminStore(@Param('id') id: string) {
    return this.nightlifeDataService.restoreAdminStore(id);
  }

  // ==========================================
  // ADMIN CASTS
  // ==========================================

  @ApiOperation({ summary: 'Admin action: List casts' })
  @Roles('ADMIN')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get('admin/casts')
  listAdminCasts(
    @Query() query: import('./dto/admin-store.dto').AdminStoreQueryDto,
  ) {
    return this.nightlifeDataService.listAdminCasts(query);
  }

  @ApiOperation({ summary: 'Admin action: Check cast slug availability' })
  @ApiOkResponse({
    schema: {
      type: 'object',
      properties: { available: { type: 'boolean' } },
      example: { available: true },
    },
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
  updateAdminCast(@Param('id') id: string, @Body() dto: any) {
    return this.nightlifeDataService.updateAdminCast(id, dto);
  }

  @Roles('ADMIN')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Delete('admin/casts/:id')
  deleteAdminCast(
    @Req() request: RequestWithUser,
    @Param('id') id: string,
    @Query('hard') hard?: string,
  ) {
    return this.nightlifeDataService.deleteAdminCast(
      request.user,
      id,
      hard === 'true',
    );
  }

  @ApiOperation({ summary: 'Admin action: Approve or reject a bill' })
  @Roles('ADMIN')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Patch('admin/bills/:id/status')
  async updateAdminBillStatusAlias(
    @Req() request: RequestWithUser,
    @Param('id') id: string,
    @Body() dto: UpdateBillStatusDto,
  ) {
    return this.nightlifeDataService.updateAdminBillStatus(
      id,
      dto,
      request.user as any,
    );
  }

  @ApiOperation({ summary: 'Admin action: Approve or reject a bill' })
  @Roles('ADMIN')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Put('admin/bills/:id/status')
  async updateAdminBillStatus(
    @Req() request: RequestWithUser,
    @Param('id') id: string,
    @Body() dto: UpdateBillStatusDto,
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
  async getAdminDashboardStats(
    @Query() query: { timeframe?: string; city?: string; category?: string },
  ) {
    return this.nightlifeDataService.getAdminDashboardStats(query);
  }

  @Roles('ADMIN')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get('admin/qa/audit-trail')
  exportAdminQaAuditTrail(
    @Req() request: RequestWithUser,
    @Query() query: AdminQaAuditTrailQueryDto,
  ) {
    return this.nightlifeDataService.exportAdminQaAuditTrail(
      request.user,
      query,
    );
  }

  @Roles('ADMIN')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get('admin/qa/uat-dashboard')
  getAdminUatDashboard(
    @Req() request: RequestWithUser,
    @Query() query: AdminUatDashboardQueryDto,
  ) {
    return this.nightlifeDataService.getAdminUatDashboard(request.user, query);
  }

  @Roles('ADMIN')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get('admin/layout/badges')
  async getAdminLayoutBadges() {
    return this.nightlifeDataService.getAdminLayoutBadges();
  }

  @Roles('ADMIN')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get('admin/dashboard/export')
  async getAdminDashboardExport(
    @Query() query: { timeframe?: string; city?: string; category?: string },
    @Res() res: express.Response,
  ) {
    const buffer =
      await this.nightlifeDataService.getAdminDashboardExport(query);
    const timeframe = ['today', 'week', 'month'].includes(query.timeframe || '')
      ? query.timeframe
      : 'today';
    const exportDate = new Date().toISOString().slice(0, 10);
    const filename = `bao_cao_nightlife_${timeframe}_${exportDate}.xlsx`;
    res.set({
      'Content-Type':
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Content-Length': buffer.byteLength,
    });
    res.send(buffer);
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
