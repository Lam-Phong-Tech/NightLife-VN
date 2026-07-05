import {
  BadRequestException,
  GoneException,
  HttpException,
  HttpStatus,
  Injectable,
  Logger,
  NotFoundException,
  Optional,
  UnprocessableEntityException,
} from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import {
  BookingStatus,
  BookingChangeRequestStatus,
  BookingChatSenderType,
  BookingChatTopic,
  ContentStatus,
  ContentType,
  CouponIssueStatus,
  Prisma,
  RankingConfigStatus,
  RankingTargetType,
  StoreCategory,
  UserTier,
} from '@prisma/client';
import {
  createHash,
  createHmac,
  timingSafeEqual,
  randomUUID,
} from 'node:crypto';
import QRCode from 'qrcode';
import { AccessService, AuthenticatedUser } from '../access/access.service';
import {
  ADMIN_TELEGRAM_TEMPLATES,
  AdminNotificationService,
} from '../notifications/admin-notification.service';
import { EmailNotificationService } from '../notifications/email-notification.service';
import { SocketGateway } from '../notifications/socket.gateway';
import { PasswordService } from '../common/password.service';
import { PrismaService } from '../prisma/prisma.service';
import {
  AdminRankingQueryDto,
  AdminRankingTargetOptionsQueryDto,
  CreateAdminRankingConfigDto,
  UpdateAdminRankingConfigDto,
} from './dto/admin-ranking.dto';
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
import {
  AutoReverseBillsDto,
  BillOcrPreviewDto,
  ReverseBillDto,
} from './dto/bill-p2.dto';
import {
  AdminCommissionOverrideQueryDto,
  CreateCommissionOverrideDto,
  UpdateCommissionOverrideDto,
} from './dto/commission-override.dto';
import { AdminRevenueReportQueryDto } from './dto/admin-revenue-report.dto';
import { CreateBookingDto } from './dto/create-booking.dto';
import {
  AdminPartnerRequestQueryDto,
  CreatePartnerRequestDto,
  PartnerRequestCastDto,
  ReviewPartnerRequestDto,
} from './dto/create-partner-request.dto';
import {
  PartnerListingCastDto,
  PartnerListingDraftDto,
  PartnerListingPricingDto,
} from './dto/partner-listing.dto';
import {
  PublicDiscoveryQueryDto,
  PublicRankingQueryDto,
} from './dto/public-discovery-query.dto';
import { RecordProfileViewDto } from './dto/profile-view.dto';
import { ReviewBillDto, VoidBillDto } from './dto/review-bill.dto';
import {
  AdminStoreVideoQueryDto,
  UpdateHotVideosDto,
} from './dto/admin-video.dto';

const DAY_MS = 24 * 60 * 60 * 1000;
const BILL_SUBMISSION_DEADLINE_DAYS = 10;
const BILL_SUBMISSION_DEADLINE_MS = BILL_SUBMISSION_DEADLINE_DAYS * DAY_MS;
const BILL_SUBMISSION_RATE_LIMIT_WINDOW_MS = 60 * 1000;
const BILL_SUBMISSION_RATE_LIMIT = 5;
const BILL_DUPLICATE_WINDOW_MS = 10 * 60 * 1000;
const BILL_FRAUD_DUPLICATE_WINDOW_MS = 10 * 60 * 1000;
const BILL_REVENUE_RULE_VERSION = 'ba-v3.2';
const BILL_LOYALTY_RULE_VERSION = 'v2.2';
const BILL_LOYALTY_VND_PER_POINT = 100_000;
const BILL_LOYALTY_POINTS_PER_1M_VND = 10;
const NEGATIVE_COMMISSION_FLAG =
  'NEGATIVE_COMMISSION_PM_BA_CONFIRMATION_REQUIRED';
const MISSING_COMMISSION_CONFIG_FLAG = 'MISSING_ACTIVE_COMMISSION_CONFIG';
const DEFAULT_REVENUE_REPORT_TIMEZONE = 'Asia/Ho_Chi_Minh';
const REVENUE_REPORT_TIMEZONE_OFFSETS_MINUTES: Record<string, number> = {
  'Asia/Ho_Chi_Minh': 7 * 60,
  UTC: 0,
};
const REVENUE_REPORT_BILL_STATUSES = ['VERIFIED', 'PAID'] as const;
const MEMBER_POINT_TIER_THRESHOLDS = [
  { name: 'Premium+', points: 250 },
  { name: 'Elite', points: 500 },
  { name: 'Diamond', points: 1000 },
] as const;
const POINT_EXPIRING_SOON_MS = 30 * DAY_MS;
const BOOKING_CANCEL_CUTOFF_MS = 60 * 60 * 1000;
const BOOKING_DATE_WINDOW_DAYS = 14;
const BOOKING_RATE_LIMIT_WINDOW_MS = 60 * 1000;
const BOOKING_CREATE_RATE_LIMIT = 5;
const BOOKING_CANCEL_RATE_LIMIT = 5;
const COUPON_CLAIM_RATE_LIMIT_WINDOW_MS = 5 * 60 * 1000;
const COUPON_CLAIM_RATE_LIMIT = 5;
const COUPON_CLAIM_FRAUD_WINDOW_MS = 60 * 60 * 1000;
const COUPON_CLAIM_FRAUD_THRESHOLD = 5;
const BOOKING_POLICY_CUTOFF_MINUTES = [30, 60, 120] as const;
const DEFAULT_BOOKING_CUTOFF_MINUTES = 60;
const DEFAULT_PUBLIC_LIMIT = 24;
const DEFAULT_RANKING_LIMIT = 5;
const MAX_RANKING_LIMIT = 20;
const MAX_PUBLIC_LIMIT = 100;
const DEFAULT_PUBLIC_PAGE = 1;
const MAX_PUBLIC_OFFSET = 10000;
const MAX_PUBLIC_SORT_WINDOW = 500;
const MVP_CITY_CODES = ['hn', 'hcm'] as const;

type BookingStatusActorType =
  | 'MEMBER'
  | 'GUEST'
  | 'ADMIN'
  | 'OPERATOR'
  | 'PARTNER'
  | 'SYSTEM';

type BookingCancelTarget = {
  id: string;
  storeId?: string | null;
  castId?: string | null;
  userId?: string | null;
  guestId?: string | null;
  user?: { id: string } | null;
  guest?: { id: string } | null;
  store?: {
    id?: string;
    name?: string | null;
    slug?: string | null;
    bookingCancelCutoffMinutes?: number | null;
  } | null;
  status: string;
  scheduledAt?: Date | string | null;
  cancelledAt?: Date | string | null;
};

type BookingNotificationRecord = {
  id: string;
  storeId?: string | null;
  status: string;
  scheduledAt?: Date | string | null;
  partySize?: number | null;
  subtotalVnd?: number | null;
  discountVnd?: number | null;
  totalVnd?: number | null;
  discountSnapshot?: Prisma.JsonValue | null;
  note?: string | null;
  user?: {
    id: string;
    email: string | null;
    displayName: string | null;
    tier: string | null;
  } | null;
  guest?: {
    id: string;
    displayName: string | null;
    phone: string | null;
    email: string | null;
  } | null;
  store?: {
    id: string;
    name?: string | null;
    slug?: string | null;
    bookingCancelCutoffMinutes?: number | null;
  } | null;
  cast?: {
    id: string;
    slug: string;
    stageName: string;
    publicAlias?: string | null;
  } | null;
  coupon?: { id: string; code: string; name: string } | null;
  couponIssue?: { id: string; code: string; status: string } | null;
};

type CustomerNotificationRecord = {
  id: string;
  status: string;
  templateKey: string | null;
  payload: Prisma.JsonValue | null;
  createdAt: Date;
  sentAt: Date | null;
  billId: string | null;
  bookingId: string | null;
  store: { id: string; name: string; slug: string | null } | null;
  booking: {
    id: string;
    status: string;
    scheduledAt: Date;
    store: { id: string; name: string; slug: string | null } | null;
  } | null;
  bill: {
    id: string;
    billNumber: string | null;
    status: string;
    totalVnd: number | null;
    pointsEarned: number | null;
    rejectReason: string | null;
    submittedAt: Date | null;
    reviewedAt: Date | null;
    verifiedAt: Date | null;
    rejectedAt: Date | null;
    store: { id: string; name: string; slug: string | null } | null;
  } | null;
};

type BookingChangeRequestRecord = {
  id: string;
  bookingId: string;
  storeId: string;
  castId: string | null;
  requestedById: string | null;
  guestId: string | null;
  reviewedById: string | null;
  type: string;
  status: string;
  currentScheduledAt: Date | string;
  requestedScheduledAt: Date | string | null;
  reason: string | null;
  adminNote: string | null;
  reviewedAt: Date | string | null;
  createdAt: Date | string;
  updatedAt: Date | string;
  booking?: BookingNotificationRecord | null;
  store?: { id: string; name: string; slug: string } | null;
  cast?: {
    id: string;
    slug: string;
    stageName: string;
    publicAlias: string | null;
  } | null;
  requestedBy?: { id: string; displayName: string | null } | null;
  guest?: {
    id: string;
    displayName: string | null;
    phone: string | null;
  } | null;
  reviewedBy?: { id: string; displayName: string | null } | null;
};

type BookingChatMessageRecord = {
  id: string;
  bookingId: string;
  changeRequestId: string | null;
  storeId: string;
  senderUserId: string | null;
  guestId: string | null;
  senderType: string;
  topic: string;
  body: string;
  createdAt: Date | string;
  senderUser?: { id: string; displayName: string | null; role: string } | null;
  guest?: {
    id: string;
    displayName: string | null;
    phone: string | null;
  } | null;
};

type CancelAnalyticsMetric = Record<string, unknown> & {
  totalBookings: number;
  cancelledBookings: number;
  cancelRate: number;
};

type BookingRateLimitBucket = {
  count: number;
  resetAt: number;
};

type CouponClaimContext = {
  ip?: string | null;
  userAgent?: string | null;
  deviceId?: string | null;
  sessionId?: string | null;
};

type PartnerDashboardPeriod = 'today' | 'seven' | 'thirty';
type PartnerCustomerArrivalSource = 'QR_USED' | 'BILL_APPROVED';

type RevenueReportMoneyTotals = {
  billCount: number;
  grossVnd: number;
  discountVnd: number;
  netVnd: number;
  payableVnd: number;
  commissionVnd: number;
};

type RevenueReportBillDetail = RevenueReportMoneyTotals & {
  id: string;
  billNumber: string | null;
  status: string;
  usedAt: string;
};

type RevenueReportWindow = {
  from: Date;
  to: Date;
  fromDate: string;
  toDate: string;
  timezone: string;
  timezoneOffsetMinutes: number;
};

type RevenueReportDimensionNode = RevenueReportMoneyTotals & {
  id: string | null;
  code: string;
  name: string;
  secondary: string | null;
};

type RevenueReportBreakdowns = {
  stores: RevenueReportDimensionNode[];
  partners: RevenueReportDimensionNode[];
  campaigns: RevenueReportDimensionNode[];
  coupons: RevenueReportDimensionNode[];
  areas: RevenueReportDimensionNode[];
  casts: RevenueReportDimensionNode[];
};

type RevenueReportFunnelStep = {
  key: string;
  label: string;
  count: number;
  rateFromPrevious: number | null;
  commissionVnd?: number;
};

type RevenueReportComparisonMetric = {
  current: number;
  previous: number;
  delta: number;
  deltaPercent: number | null;
};

type BillRevenueApprovalSnapshot = {
  grossVnd: number;
  discountVnd: number;
  netVnd: number;
  payableVnd: number;
  commissionVnd: number;
  discountRuleSnapshot: Record<string, unknown>;
  commissionRuleSnapshot: Record<string, unknown>;
};

type MutableRevenueReportCouponNode = RevenueReportMoneyTotals & {
  coupon: { id: string | null; code: string; name: string };
  bills: RevenueReportBillDetail[];
};

type MutableRevenueReportStoreNode = RevenueReportMoneyTotals & {
  store: { id: string; name: string; slug: string | null };
  coupons: Map<string, MutableRevenueReportCouponNode>;
};

type MutableRevenueReportDayNode = RevenueReportMoneyTotals & {
  date: string;
  stores: Map<string, MutableRevenueReportStoreNode>;
};

type NightlifePrismaClient = PrismaService | Prisma.TransactionClient;

type PartnerRequestCmsRecord = {
  id: string;
  status: PartnerRequestReviewStatus;
  businessName: string;
  businessType: string | null;
  area: string | null;
  contactName: string;
  contactPhone: string;
  contactEmail: string | null;
  note: string | null;
  storeDescription: string | null;
  storeAddress: string | null;
  storeCity: string | null;
  storeDistrict: string | null;
  openingHours: string | null;
  menuSummary: string | null;
  mediaUrls: string[];
  castProfiles: Prisma.JsonValue | null;
  draftCastIds: string[];
  draftMediaIds: string[];
  draftContentIds: string[];
  reviewReason: string | null;
  publicState: string;
  submittedAt: Date;
  reviewedAt: Date | null;
  reviewedById: string | null;
  partnerUserId: string | null;
  partnerAccountId: string | null;
  createdAt: Date;
  store: {
    id: string;
    name: string;
    slug: string;
    status: string;
  };
  notificationLog: {
    id: string;
    status: string;
    error: string | null;
    sentAt: Date | null;
  } | null;
};

type PartnerRequestReviewStatus = 'PENDING_REVIEW' | 'APPROVED' | 'REJECTED';

type PartnerListingDraftPayload = {
  storeName: string;
  businessType: string | null;
  storeCategory: string | null;
  area: string | null;
  storeCity: string | null;
  storeDistrict: string | null;
  storeAddress: string | null;
  phone: string | null;
  openingHours: string | null;
  priceRange: string | null;
  description: string | null;
  note: string | null;
  menuSummary: string | null;
  pricingItems: PartnerListingPricingDto[];
  castProfiles: PartnerListingCastDto[];
  mediaUrls: string[];
};

const bookingRateLimits = new Map<string, BookingRateLimitBucket>();
const couponClaimRateLimits = new Map<string, BookingRateLimitBucket>();
const PARTNER_LISTING_DRAFT_KIND = 'PARTNER_LISTING_DRAFT';
const COUPON_DISCOUNT_PERCENT_BY_USER_TYPE = {
  GUEST: 5,
  MEMBER: 8,
  VIP: 10,
} as const;
const COUPON_FRAUD_SIGNAL_TEMPLATE = 'coupon.fraud.claim_signal.v1';
const COUPON_ISSUE_STATUS_LABELS: Record<string, string> = {
  ISSUED: 'Đang giữ chỗ',
  USED: 'Đã sử dụng',
  EXPIRED: 'Hết hạn',
  REVOKED: 'Đã hủy',
};
const INDEPENDENT_COUPON_CLAIM_REMOVED_MESSAGE =
  'Independent coupon claim is not part of MVP v3.2. Create a booking to receive the Booking QR.';

type CouponUserType = keyof typeof COUPON_DISCOUNT_PERCENT_BY_USER_TYPE;

type PartnerCouponIssueRecord = {
  id: string;
  code: string;
  status: string;
  expiresAt?: Date | string | null;
  usedAt?: Date | string | null;
  scannedById?: string | null;
  userId?: string | null;
  guestId?: string | null;
  metadata?: unknown;
  booking?: { status: string; scheduledAt?: Date | string | null } | null;
  coupon?: {
    id?: string;
    code?: string;
    name?: string;
    discountType?: string;
    discountValue?: number;
    maxDiscountVnd?: number | null;
    minSpendVnd?: number | null;
    store?: { id?: string; name?: string; slug?: string } | null;
  } | null;
};

const CITY_ALIASES: Record<string, string> = {
  all: 'all',
  'tat-ca': 'all',
  'tong-hop': 'all',
  hn: 'hn',
  hanoi: 'hn',
  'ha-noi': 'hn',
  'ha noi': 'hn',
  hcm: 'hcm',
  tphcm: 'hcm',
  'tp-hcm': 'hcm',
  'tp hcm': 'hcm',
  'ho-chi-minh': 'hcm',
  'tp-ho-chi-minh': 'hcm',
  'thanh-pho-ho-chi-minh': 'hcm',
  saigon: 'hcm',
  sai_gon: 'hcm',
  'sai-gon': 'hcm',
};

const CATEGORY_ALIASES: Record<string, StoreCategory> = {
  bar: 'BAR',
  club: 'CLUB',
  lounge: 'LOUNGE',
  'girls-bar': 'GIRLS_BAR',
  girlsbar: 'GIRLS_BAR',
  hostess: 'GIRLS_BAR',
  'hostess-bar': 'GIRLS_BAR',
  karaoke: 'KARAOKE',
  'karaoke-ktv': 'KARAOKE',
  ktv: 'KARAOKE',
  'massage-spa': 'MASSAGE_SPA',
  massage: 'MASSAGE_SPA',
  spa: 'MASSAGE_SPA',
  restaurant: 'RESTAURANT',
  nhahang: 'RESTAURANT',
  'nha-hang': 'RESTAURANT',
  casino: 'CASINO',
};

const STORE_SLUG_ALIASES: Record<string, string> = {
  'club-lumiere': 'neon-club',
  'yakitori-hanoi': 'tokyo-kitchen',
  'ktv-hoang-gia': 'golden-voice-ktv',
  'diamond-bar': 'crimson-bar',
  'sora-lounge': 'jade-lounge',
};

const PARTNER_DASHBOARD_DAY_LABELS = [
  'CN',
  'T2',
  'T3',
  'T4',
  'T5',
  'T6',
  'T7',
] as const;

const CAST_SLUG_ALIASES: Record<string, string> = {
  aiko: 'aya-velvet',
  hana: 'hana-sakura-lounge',
  michi: 'miyuki-moonlight',
  rina: 'rina-velvet',
  yuki: 'yuki-sakura-lounge',
  'kotone-tokyo-kitchen': 'kotone-tokyo',
  'sakura-moonlight-q1': 'sakura-moonlight',
  'yuna-neon-district': 'yuna-neon',
};

type Coordinates = {
  lat: number;
  lng: number;
};

type PublicSort = 'newest' | 'nearest' | 'priority';

type PublicPagination = {
  limit: number;
  offset: number;
  page: number;
};

type PublicSortableItem = {
  id: string;
  createdAt: Date | string;
  distanceKm: number | null;
};

type RankingScore = {
  pinRank: number | null;
  manualScore: number;
};

type PublicRankingConfig = {
  targetId: string;
  cityCode: string;
  category: StoreCategory | null;
  scope: string;
  manualScore: number;
  pinRank: number | null;
  sponsored: boolean;
  updatedAt: Date | string;
};

type PublicRankingItem = {
  rank: number;
  targetType: 'CAST' | 'STORE';
  targetId: string;
  name: string;
  slug: string;
  image: string | null;
  area: string | null;
  city: string;
  cityCode?: string;
  category: StoreCategory;
  sponsored: boolean;
  pinRank: number | null;
  manualScore: number;
  href: string;
  phone?: string | null;
};

type PublicRankingItemDraft = Omit<PublicRankingItem, 'rank'>;

type AdminRankingConfigRecord = {
  id: string;
  targetType: RankingTargetType;
  targetId: string;
  areaId: string | null;
  cityCode: string;
  category: StoreCategory | null;
  scope: string;
  manualScore: number;
  pinRank: number | null;
  sponsored: boolean;
  reason: string | null;
  status: string;
  startsAt: Date | null;
  endsAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  area: {
    id: string;
    code: string;
    name: string;
    city: string;
    district: string | null;
  } | null;
};

type RankingTargetSummary = {
  id: string;
  name: string;
  slug: string;
  image: string | null;
  city: string;
  area: string | null;
  category: StoreCategory;
  status: string;
};

const demoStoreImageSlugs = new Set([
  'crimson-bar',
  'crimson-bar-hoan-kiem',
  'dragon-rooftop-da-nang',
  'golden-voice-ktv',
  'golden-voice-ktv-quan-7',
  'hanami-dining',
  'harbor-ktv-hai-phong',
  'jade-casino-hoan-kiem',
  'jade-lounge',
  'lotus-massage-spa',
  'lotus-massage-spa-quan-3',
  'moonlight-bar',
  'moonlight-q1-bar',
  'neon-club',
  'neon-district-club',
  'opera-spa-hai-phong',
  'sakura-lounge',
  'sakura-lounge-quan-3',
  'son-tra-lounge',
  'star-ktv',
  'tokyo-kitchen',
  'tokyo-kitchen-old-quarter',
  'velvet-club',
]);

const demoCastImageSlugs = new Set([
  'akari-jade',
  'aoi-tokyo',
  'aya-velvet',
  'eri-son-tra',
  'erika-star',
  'hana-harbor-ktv',
  'hana-sakura-lounge',
  'hikaru-jade',
  'kaori-hanami',
  'kotone-tokyo',
  'kotone-tokyo-kitchen',
  'lina-dragon-rooftop',
  'linh-crimson-bar',
  'mai-dragon-rooftop',
  'mai-golden',
  'mika-golden-ktv',
  'mika-harbor-ktv',
  'misaki-crimson',
  'miyuki-moonlight',
  'nami-son-tra',
  'nana-golden',
  'rei-crimson',
  'rina-velvet',
  'rumi-hanami',
  'sakura-moonlight',
  'sakura-moonlight-q1',
  'sora-neon',
  'sumi-lotus-massage-spa',
  'sumi-opera-spa',
  'tsubasa-star',
  'yuki-sakura-lounge',
  'yuna-neon',
  'yuna-neon-district',
  'yuri-opera-spa',
]);

type ContentRecord = {
  id: string;
  title: string;
  slug: string;
  type: ContentType;
  status: ContentStatus;
  excerpt: string | null;
  body: string | null;
  metadata: Prisma.JsonValue | null;
  publishedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  author: {
    id: string;
    displayName: string | null;
    email: string;
  } | null;
  store: {
    id: string;
    name: string;
    slug: string;
  } | null;
};

type BookingTarget = {
  store: {
    id: string;
    name: string;
    slug: string;
  };
  cast?: {
    id: string;
    slug: string;
    stageName: string;
    publicAlias: string | null;
  };
};

type StoreSummary = {
  id: string;
  name: string;
  slug: string;
};

type CouponSummary = {
  id: string;
  code: string;
  name: string;
};

@Injectable()
export class NightlifeDataService {
  private readonly logger = new Logger(NightlifeDataService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly accessService: AccessService,
    @Optional()
    private readonly adminNotificationService?: AdminNotificationService,
    @Optional()
    private readonly socketGateway?: SocketGateway,
    @Optional()
    private readonly emailNotificationService?: EmailNotificationService,
    @Optional()
    private readonly passwordService?: PasswordService,
  ) {}

  async listPublicContents(query: PublicContentQueryDto = {}) {
    const type = this.resolveContentType(query.type, { strict: true });
    const q = this.cleanText(query.q);
    const limit = Math.min(query.limit ?? 50, 100);
    const now = new Date();

    const contents = await this.prisma.content.findMany({
      where: {
        deletedAt: null,
        status: 'PUBLISHED',
        ...(type ? { type } : {}),
        OR: [{ publishedAt: null }, { publishedAt: { lte: now } }],
        ...(q
          ? {
              AND: [
                {
                  OR: [
                    { title: this.containsInsensitive(q) },
                    { slug: this.containsInsensitive(this.normalizeToken(q)) },
                    { excerpt: this.containsInsensitive(q) },
                    { body: this.containsInsensitive(q) },
                  ],
                },
              ],
            }
          : {}),
      },
      orderBy: [{ publishedAt: 'desc' }, { updatedAt: 'desc' }],
      take: limit,
      select: this.contentSelect(),
    });

    let result = contents.map((content) => this.mapContent(content));

    if (type === 'BANNER') {
      result.sort((a, b) => {
        const posA = (a.metadata as any)?.position || '';
        const posB = (b.metadata as any)?.position || '';
        if (posA.includes('Trang chủ #1') && !posB.includes('Trang chủ #1'))
          return -1;
        if (!posA.includes('Trang chủ #1') && posB.includes('Trang chủ #1'))
          return 1;
        return 0;
      });
    }

    return { data: result };
  }

  async getPublicContentBySlug(slug: string, isPreview: boolean = false) {
    const now = new Date();
    const content = await this.prisma.content.findFirst({
      where: {
        slug: this.normalizeContentSlug(slug),
        deletedAt: null,
        ...(isPreview
          ? {}
          : {
              status: 'PUBLISHED',
              OR: [{ publishedAt: null }, { publishedAt: { lte: now } }],
            }),
      },
      select: this.contentSelect(),
    });

    if (!content) {
      throw new NotFoundException('Content not found');
    }

    return this.mapContent(content);
  }

  async listAdminContents(query: AdminContentQueryDto = {}) {
    const type = this.resolveContentType(query.type, { strict: true });
    const status = this.resolveContentStatus(query.status, { strict: true });
    const q = this.cleanText(query.q);
    const limit = Math.min(query.limit ?? 100, 100);

    const contents = await this.prisma.content.findMany({
      where: {
        deletedAt: null,
        ...(type ? { type } : {}),
        ...(status ? { status } : {}),
        ...(q
          ? {
              OR: [
                { title: this.containsInsensitive(q) },
                { slug: this.containsInsensitive(this.normalizeToken(q)) },
                { excerpt: this.containsInsensitive(q) },
                { body: this.containsInsensitive(q) },
              ],
            }
          : {}),
      },
      orderBy: [{ updatedAt: 'desc' }],
      take: limit,
      select: this.contentSelect(),
    });

    return contents.map((content) => this.mapContent(content));
  }

  async createAdminContent(
    user: AuthenticatedUser,
    dto: CreateAdminContentDto,
  ) {
    const type = this.resolveContentType(dto.type, { strict: true })!;
    const status = this.resolveContentStatus(dto.status ?? 'DRAFT', {
      strict: true,
    })!;
    const title = this.cleanRequiredText(dto.title, 'title');
    const slug = this.normalizeContentSlug(dto.slug || title);
    const publishedAt =
      dto.publishedAt !== undefined
        ? this.parseOptionalDate(dto.publishedAt, 'publishedAt')
        : status === 'PUBLISHED'
          ? new Date()
          : null;

    if (type === 'BANNER' && status === 'PUBLISHED') {
      const activeBannersCount = await this.prisma.content.count({
        where: { type: 'BANNER', status: 'PUBLISHED', deletedAt: null },
      });
      if (activeBannersCount >= 3) {
        throw new BadRequestException(
          'Hệ thống chỉ cho phép tối đa 3 banner được hiển thị. Vui lòng ẩn bớt banner cũ trước khi đăng banner này.',
        );
      }
    }

    await this.assertContentSlugAvailable(slug);

    const content = await this.prisma.content.create({
      data: {
        authorId: user.id,
        storeId: dto.storeId ?? null,
        title,
        slug,
        type,
        status,
        excerpt: this.cleanNullableText(dto.excerpt),
        body: this.cleanNullableText(dto.body),
        metadata: this.toPrismaJson(dto.metadata),
        publishedAt,
      },
      select: this.contentSelect(),
    });

    return this.mapContent(content);
  }

  async updateAdminContent(contentId: string, dto: UpdateAdminContentDto) {
    const existing = await this.prisma.content.findFirst({
      where: { id: contentId, deletedAt: null },
      select: {
        id: true,
        slug: true,
        type: true,
        status: true,
        publishedAt: true,
      },
    });

    if (!existing) {
      throw new NotFoundException('Content not found');
    }

    const nextSlug =
      dto.slug !== undefined ? this.normalizeContentSlug(dto.slug) : undefined;
    if (nextSlug && nextSlug !== existing.slug) {
      await this.assertContentSlugAvailable(nextSlug, contentId);
    }

    const nextStatus =
      dto.status !== undefined
        ? this.resolveContentStatus(dto.status, { strict: true })
        : undefined;
    const publishedAt =
      dto.publishedAt !== undefined
        ? this.parseOptionalDate(dto.publishedAt, 'publishedAt')
        : nextStatus === 'PUBLISHED' && !existing.publishedAt
          ? new Date()
          : undefined;

    const nextType =
      dto.type !== undefined
        ? this.resolveContentType(dto.type, { strict: true })
        : existing.type;
    if (
      nextType === 'BANNER' &&
      nextStatus === 'PUBLISHED' &&
      existing.status !== 'PUBLISHED'
    ) {
      const activeBannersCount = await this.prisma.content.count({
        where: { type: 'BANNER', status: 'PUBLISHED', deletedAt: null },
      });
      if (activeBannersCount >= 3) {
        throw new BadRequestException(
          'Hệ thống chỉ cho phép tối đa 3 banner được hiển thị. Vui lòng ẩn bớt banner cũ trước khi đăng banner này.',
        );
      }
    }

    const content = await this.prisma.content.update({
      where: { id: contentId },
      data: {
        ...(dto.type !== undefined
          ? { type: this.resolveContentType(dto.type, { strict: true }) }
          : {}),
        ...(dto.title !== undefined
          ? { title: this.cleanRequiredText(dto.title, 'title') }
          : {}),
        ...(nextSlug ? { slug: nextSlug } : {}),
        ...(nextStatus ? { status: nextStatus } : {}),
        ...(dto.excerpt !== undefined
          ? { excerpt: this.cleanNullableText(dto.excerpt) }
          : {}),
        ...(dto.body !== undefined
          ? { body: this.cleanNullableText(dto.body) }
          : {}),
        ...(dto.metadata !== undefined
          ? { metadata: this.toPrismaJson(dto.metadata) }
          : {}),
        ...(dto.storeId !== undefined ? { storeId: dto.storeId ?? null } : {}),
        ...(publishedAt !== undefined ? { publishedAt } : {}),
      },
      select: this.contentSelect(),
    });

    return this.mapContent(content);
  }

  async deleteAdminContent(contentId: string) {
    const existing = await this.prisma.content.findFirst({
      where: { id: contentId, deletedAt: null },
      select: { id: true },
    });

    if (!existing) {
      throw new NotFoundException('Content not found');
    }

    const content = await this.prisma.content.update({
      where: { id: contentId },
      data: {
        status: 'DELETED',
        deletedAt: new Date(),
      },
      select: this.contentSelect(),
    });

    return this.mapContent(content);
  }

  async listPublicAreas(query: PublicDiscoveryQueryDto = {}) {
    const cityCode = this.normalizeCityCode(query.city, { strict: true });
    const where: Prisma.AreaWhereInput = {
      deletedAt: null,
      status: 'ACTIVE',
      ...this.buildMvpAreaCodeWhere(cityCode),
    };

    const areas = await this.prisma.area.findMany({
      where,
      orderBy: [{ city: 'asc' }, { name: 'asc' }],
      select: {
        id: true,
        code: true,
        name: true,
        city: true,
        district: true,
        ward: true,
      },
    });

    return areas.map((area) => ({
      ...area,
      cityCode: this.cityCodeFromAreaCode(area.code),
    }));
  }

  async listPublicRankings(query: PublicRankingQueryDto = {}) {
    const targetType = this.resolveRankingTargetType(query.targetType);
    const cityCode = this.normalizeCityCode(query.city ?? 'all', {
      strict: true,
    });
    const category = this.normalizeCategory(query.category, { strict: true });
    const scope = this.resolveAdminRankingScope(query.scope);
    const limit = this.resolveRankingLimit(query.limit);
    const now = new Date();
    const configs = await this.prisma.rankingConfig.findMany({
      where: {
        targetType,
        scope,
        status: 'ACTIVE',
        deletedAt: null,
        ...(cityCode ? { OR: [{ cityCode: 'all' }, { cityCode }] } : {}),
        ...(category ? { OR: [{ category: null }, { category }] } : {}),
        AND: [
          { OR: [{ startsAt: null }, { startsAt: { lte: now } }] },
          { OR: [{ endsAt: null }, { endsAt: { gt: now } }] },
        ],
      },
      orderBy: [
        { pinRank: 'asc' },
        { manualScore: 'desc' },
        { updatedAt: 'desc' },
      ],
      take: limit * 4,
      select: {
        targetId: true,
        cityCode: true,
        category: true,
        scope: true,
        manualScore: true,
        pinRank: true,
        sponsored: true,
        updatedAt: true,
      },
    });
    const configByTargetId = this.mapRankingConfigs(configs);
    const rankedItems =
      targetType === 'STORE'
        ? await this.loadStoreRankingItems(configByTargetId, {
            cityCode,
            category,
          })
        : await this.loadCastRankingItems(configByTargetId, {
            cityCode,
            category,
          });
    const allowFallback = scope === 'global';
    const fallbackItems =
      allowFallback && rankedItems.length < limit
        ? await this.loadRankingFallbackItems(targetType, {
            cityCode,
            category,
            excludeIds: rankedItems.map((item) => item.targetId),
            take: limit - rankedItems.length,
          })
        : [];
    const data = [...rankedItems, ...fallbackItems]
      .slice(0, limit)
      .map((item, index) => ({
        ...item,
        rank: index + 1,
      }));

    return {
      data,
      meta: {
        targetType,
        city: cityCode ?? 'all',
        category: category ?? null,
        scope,
        limit,
        total: data.length,
      },
    };
  }

  async listAdminRankingConfigs(query: AdminRankingQueryDto = {}) {
    const targetType = query.targetType
      ? this.resolveRankingTargetType(query.targetType)
      : undefined;
    const cityCode =
      query.city !== undefined && query.city !== ''
        ? this.resolveAdminRankingCityCode(query.city)
        : undefined;
    const hasCategoryFilter =
      query.category !== undefined && query.category !== '';
    const category = hasCategoryFilter
      ? this.resolveAdminRankingCategory(query.category)
      : undefined;
    const scope =
      query.scope !== undefined && query.scope !== ''
        ? this.resolveAdminRankingScope(query.scope)
        : undefined;

    const configs = await this.prisma.rankingConfig.findMany({
      where: {
        deletedAt: null,
        ...(targetType ? { targetType } : {}),
        ...(cityCode ? { cityCode } : {}),
        ...(hasCategoryFilter ? { category } : {}),
        ...(scope ? { scope } : {}),
      },
      orderBy: [
        { targetType: 'asc' },
        { cityCode: 'asc' },
        { category: 'asc' },
        { scope: 'asc' },
        { pinRank: 'asc' },
        { manualScore: 'desc' },
        { updatedAt: 'desc' },
      ],
      select: this.adminRankingConfigSelect(),
    });

    return this.mapAdminRankingConfigs(configs as AdminRankingConfigRecord[]);
  }

  async listAdminRankingTargetOptions(
    query: AdminRankingTargetOptionsQueryDto = {},
  ) {
    const targetType = this.resolveRankingTargetType(query.targetType);
    const cityCode = this.normalizeCityCode(query.city, { strict: true });
    const category =
      this.resolveAdminRankingCategory(query.category) ?? undefined;
    const q = this.cleanText(query.q);
    const limit = Math.min(query.limit ?? 50, 100);

    if (targetType === 'STORE') {
      const stores = await this.prisma.store.findMany({
        where: {
          status: 'ACTIVE',
          ...(category ? { category } : {}),
          ...(cityCode
            ? {
                OR: [
                  {
                    city:
                      cityCode === 'hcm'
                        ? 'Ho Chi Minh City'
                        : cityCode === 'hn'
                          ? 'Hanoi'
                          : cityCode,
                  },
                  { area: { is: { ...this.buildMvpAreaCodeWhere(cityCode) } } },
                ],
              }
            : {}),
          ...(q
            ? {
                OR: [
                  { name: this.containsInsensitive(q) },
                  { slug: this.containsInsensitive(this.normalizeToken(q)) },
                ],
              }
            : {}),
        },
        orderBy: [{ name: 'asc' }],
        take: limit,
        select: {
          id: true,
          name: true,
          slug: true,
          category: true,
          status: true,
          city: true,
          district: true,
          area: {
            select: {
              id: true,
              code: true,
              name: true,
              city: true,
              district: true,
            },
          },
          media: {
            where: {
              deletedAt: null,
              access: 'PUBLIC',
              status: 'READY',
              type: 'IMAGE',
            },
            orderBy: { createdAt: 'desc' },
            take: 1,
            select: { url: true },
          },
        },
      });

      return stores.map((store) => ({
        id: store.id,
        targetType: 'STORE' as const,
        name: store.name,
        slug: store.slug,
        image: store.media[0]?.url ?? null,
        area: store.area?.name ?? store.district,
        city: store.area?.city ?? store.city,
        cityCode: store.area?.code
          ? this.cityCodeFromAreaCode(store.area.code)
          : this.normalizeCityCode(store.city),
        category: store.category,
        status: store.status,
      }));
    }

    const casts = await this.prisma.cast.findMany({
      where: {
        deletedAt: null,
        status: 'ACTIVE',
        isPublic: true,
        ...(cityCode || category
          ? {
              store: {
                ...(category ? { category } : {}),
                ...(cityCode
                  ? {
                      OR: [
                        {
                          city:
                            cityCode === 'hcm'
                              ? 'Ho Chi Minh City'
                              : cityCode === 'hn'
                                ? 'Hanoi'
                                : cityCode,
                        },
                        {
                          area: {
                            is: { ...this.buildMvpAreaCodeWhere(cityCode) },
                          },
                        },
                      ],
                    }
                  : {}),
              },
            }
          : {}),
        ...(q
          ? {
              OR: [
                { stageName: this.containsInsensitive(q) },
                { publicAlias: this.containsInsensitive(q) },
                { slug: this.containsInsensitive(this.normalizeToken(q)) },
                {
                  store: {
                    name: this.containsInsensitive(q),
                  },
                },
              ],
            }
          : {}),
      },
      orderBy: [{ stageName: 'asc' }],
      take: limit,
      select: {
        id: true,
        slug: true,
        stageName: true,
        publicAlias: true,
        status: true,
        media: {
          where: {
            deletedAt: null,
            access: 'PUBLIC',
            status: 'READY',
            type: 'IMAGE',
          },
          orderBy: { createdAt: 'desc' },
          take: 1,
          select: { url: true },
        },
        store: {
          select: {
            category: true,
            city: true,
            district: true,
            area: {
              select: {
                id: true,
                code: true,
                name: true,
                city: true,
                district: true,
              },
            },
          },
        },
      },
    });

    return casts.map((cast) => ({
      id: cast.id,
      targetType: 'CAST' as const,
      name: cast.publicAlias ?? cast.stageName,
      slug: cast.slug,
      image: cast.media[0]?.url ?? null,
      area: cast.store.area?.name ?? cast.store.district,
      city: cast.store.area?.city ?? cast.store.city,
      cityCode: cast.store.area?.code
        ? this.cityCodeFromAreaCode(cast.store.area.code)
        : this.normalizeCityCode(cast.store.city),
      category: cast.store.category,
      status: cast.status,
    }));
  }

  async createAdminRankingConfig(
    user: AuthenticatedUser,
    dto: CreateAdminRankingConfigDto,
  ) {
    const targetType = this.resolveRankingTargetType(dto.targetType);
    const cityCode = this.resolveAdminRankingCityCode(dto.cityCode);
    const category = this.resolveAdminRankingCategory(dto.category);
    const scope = this.resolveAdminRankingScope(dto.scope);
    const pinRank = dto.pinRank ?? null;
    const manualScore = dto.manualScore ?? 0;
    const { startsAt, endsAt } = this.resolveRankingWindow(
      dto.startsAt,
      dto.endsAt,
    );

    await this.assertAdminRankingTargetExists(targetType, dto.targetId);
    await this.assertNoPinnedRankingCollision({
      targetType,
      cityCode,
      category,
      scope,
      pinRank,
    });

    const config = await this.prisma.$transaction(async (tx) => {
      const created = await tx.rankingConfig.create({
        data: {
          createdById: user.id,
          targetType,
          targetId: dto.targetId,
          areaId: dto.areaId ?? null,
          cityCode,
          category,
          scope,
          pinRank,
          manualScore,
          sponsored: dto.sponsored ?? false,
          reason: this.cleanText(dto.reason ?? undefined) || null,
          status: (dto.status ?? 'ACTIVE') as RankingConfigStatus,
          startsAt,
          endsAt,
        },
        select: this.adminRankingConfigSelect(),
      });

      await tx.auditLog.create({
        data: {
          actorId: user.id,
          action: 'ranking.config.create',
          targetType: 'RankingConfig',
          targetId: created.id,
          beforeJson: Prisma.JsonNull,
          afterJson: this.toPrismaJson(
            this.buildRankingConfigAuditSnapshot(
              created as AdminRankingConfigRecord,
            ),
          ),
          metadata: this.toPrismaJson(
            this.buildMinimalSensitiveMetadata({
              actorId: user.id,
              action: 'ranking.config.create',
              refType: 'RankingConfig',
              refId: created.id,
              metadata: {
                targetType,
                targetId: dto.targetId,
                cityCode,
                category,
                scope,
              },
            }),
          ),
        },
      });

      await this.recordSensitiveActionNotification(tx, {
        actorId: user.id,
        action: 'ranking.config.create',
        refType: 'RankingConfig',
        refId: created.id,
        templateKey: 'audit.ranking.config.create.v1',
        payload: {
          targetType,
          targetId: dto.targetId,
          cityCode,
          category,
          scope,
        },
      });

      return created;
    });

    return (
      await this.mapAdminRankingConfigs([config as AdminRankingConfigRecord])
    )[0];
  }

  async updateAdminRankingConfig(
    user: AuthenticatedUser,
    rankingId: string,
    dto: UpdateAdminRankingConfigDto,
  ) {
    const existing = await this.prisma.rankingConfig.findFirst({
      where: { id: rankingId, deletedAt: null },
      select: this.adminRankingConfigSelect(),
    });

    if (!existing) {
      throw new NotFoundException('Ranking config not found');
    }

    const current = existing as AdminRankingConfigRecord;
    const targetType = dto.targetType
      ? this.resolveRankingTargetType(dto.targetType)
      : current.targetType;
    const targetId = dto.targetId ?? current.targetId;
    const cityCode =
      dto.cityCode !== undefined
        ? this.resolveAdminRankingCityCode(dto.cityCode)
        : current.cityCode;
    const category =
      dto.category !== undefined
        ? this.resolveAdminRankingCategory(dto.category)
        : current.category;
    const scope =
      dto.scope !== undefined
        ? this.resolveAdminRankingScope(dto.scope)
        : current.scope;
    const pinRank =
      dto.pinRank !== undefined ? (dto.pinRank ?? null) : current.pinRank;
    const startsAtInput =
      dto.startsAt !== undefined
        ? dto.startsAt
        : (current.startsAt?.toISOString() ?? null);
    const endsAtInput =
      dto.endsAt !== undefined
        ? dto.endsAt
        : (current.endsAt?.toISOString() ?? null);
    const { startsAt, endsAt } = this.resolveRankingWindow(
      startsAtInput,
      endsAtInput,
    );

    if (dto.targetType !== undefined || dto.targetId !== undefined) {
      await this.assertAdminRankingTargetExists(targetType, targetId);
    }
    await this.assertNoPinnedRankingCollision({
      targetType,
      cityCode,
      category,
      scope,
      pinRank,
      excludeId: rankingId,
    });

    const config = await this.prisma.$transaction(async (tx) => {
      const updated = await tx.rankingConfig.update({
        where: { id: rankingId },
        data: {
          ...(dto.targetType !== undefined ? { targetType } : {}),
          ...(dto.targetId !== undefined ? { targetId } : {}),
          ...(dto.areaId !== undefined ? { areaId: dto.areaId ?? null } : {}),
          ...(dto.cityCode !== undefined ? { cityCode } : {}),
          ...(dto.category !== undefined ? { category } : {}),
          ...(dto.scope !== undefined ? { scope } : {}),
          ...(dto.pinRank !== undefined ? { pinRank } : {}),
          ...(dto.manualScore !== undefined
            ? { manualScore: dto.manualScore }
            : {}),
          ...(dto.sponsored !== undefined ? { sponsored: dto.sponsored } : {}),
          ...(dto.reason !== undefined
            ? { reason: this.cleanText(dto.reason ?? undefined) || null }
            : {}),
          ...(dto.status !== undefined
            ? { status: dto.status as RankingConfigStatus }
            : {}),
          ...(dto.startsAt !== undefined ? { startsAt } : {}),
          ...(dto.endsAt !== undefined ? { endsAt } : {}),
        },
        select: this.adminRankingConfigSelect(),
      });

      await tx.auditLog.create({
        data: {
          actorId: user.id,
          action: 'ranking.config.update',
          targetType: 'RankingConfig',
          targetId: rankingId,
          beforeJson: this.toPrismaJson(
            this.buildRankingConfigAuditSnapshot(current),
          ),
          afterJson: this.toPrismaJson(
            this.buildRankingConfigAuditSnapshot(
              updated as AdminRankingConfigRecord,
            ),
          ),
          metadata: this.toPrismaJson(
            this.buildMinimalSensitiveMetadata({
              actorId: user.id,
              action: 'ranking.config.update',
              refType: 'RankingConfig',
              refId: rankingId,
              metadata: {
                targetType,
                targetId,
                cityCode,
                category,
                scope,
              },
            }),
          ),
        },
      });

      await this.recordSensitiveActionNotification(tx, {
        actorId: user.id,
        action: 'ranking.config.update',
        refType: 'RankingConfig',
        refId: rankingId,
        templateKey: 'audit.ranking.config.update.v1',
        payload: {
          targetType,
          targetId,
          cityCode,
          category,
          scope,
        },
      });

      return updated;
    });

    return (
      await this.mapAdminRankingConfigs([config as AdminRankingConfigRecord])
    )[0];
  }

  async deleteAdminRankingConfig(user: AuthenticatedUser, rankingId: string) {
    const existing = await this.prisma.rankingConfig.findFirst({
      where: { id: rankingId, deletedAt: null },
      select: this.adminRankingConfigSelect(),
    });

    if (!existing) {
      throw new NotFoundException('Ranking config not found');
    }

    const current = existing as AdminRankingConfigRecord;
    const now = new Date();

    await this.prisma.$transaction(async (tx) => {
      const deleted = await tx.rankingConfig.update({
        where: { id: rankingId },
        data: {
          status: 'DELETED',
          deletedAt: now,
        },
        select: this.adminRankingConfigSelect(),
      });

      await tx.auditLog.create({
        data: {
          actorId: user.id,
          action: 'ranking.config.delete',
          targetType: 'RankingConfig',
          targetId: rankingId,
          beforeJson: this.toPrismaJson(
            this.buildRankingConfigAuditSnapshot(current),
          ),
          afterJson: this.toPrismaJson(
            this.buildRankingConfigAuditSnapshot(
              deleted as AdminRankingConfigRecord,
            ),
          ),
          metadata: this.toPrismaJson(
            this.buildMinimalSensitiveMetadata({
              actorId: user.id,
              action: 'ranking.config.delete',
              refType: 'RankingConfig',
              refId: rankingId,
              occurredAt: now,
              metadata: {
                targetType: current.targetType,
                targetId: current.targetId,
                cityCode: current.cityCode,
                category: current.category,
                scope: current.scope,
              },
            }),
          ),
        },
      });

      await this.recordSensitiveActionNotification(tx, {
        actorId: user.id,
        action: 'ranking.config.delete',
        refType: 'RankingConfig',
        refId: rankingId,
        occurredAt: now,
        templateKey: 'audit.ranking.config.delete.v1',
        payload: {
          targetType: current.targetType,
          targetId: current.targetId,
          cityCode: current.cityCode,
          category: current.category,
          scope: current.scope,
        },
      });
    });

    return { id: rankingId, deleted: true };
  }

  async listPublicStores(query: PublicDiscoveryQueryDto = {}) {
    const coordinates = this.parseCoordinates(query);
    const pagination = this.resolvePagination(query);
    const sort = this.resolveSort(query.sort, coordinates);
    const readArgs = this.resolvePublicReadArgs(sort, pagination);
    const where = this.buildPublicStoreWhere(query, { includeCastName: true });
    const [total, stores] = await Promise.all([
      this.prisma.store.count({ where }),
      this.prisma.store.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        ...readArgs,
        select: {
          id: true,
          createdAt: true,
          name: true,
          slug: true,
          category: true,
          description: true,
          address: true,
          city: true,
          district: true,
          latitude: true,
          longitude: true,
          area: {
            select: {
              id: true,
              code: true,
              name: true,
              city: true,
              district: true,
            },
          },
          media: {
            where: {
              deletedAt: null,
              access: 'PUBLIC',
              status: 'READY',
              type: 'IMAGE',
            },
            orderBy: { createdAt: 'desc' },
            take: 1,
            select: {
              url: true,
            },
          },
        },
      }),
    ]);

    const mappedStores = stores.map((store) => ({
      id: store.id,
      createdAt: store.createdAt,
      name: store.name,
      slug: store.slug,
      category: store.category,
      description: store.description,
      address: store.address,
      city: store.city,
      cityCode: store.area?.code
        ? this.cityCodeFromAreaCode(store.area.code)
        : this.normalizeCityCode(store.city),
      district: store.district,
      area: store.area
        ? {
            id: store.area.id,
            code: store.area.code,
            name: store.area.name,
            city: store.area.city,
            district: store.area.district,
            cityCode: this.cityCodeFromAreaCode(store.area.code),
          }
        : null,
      latitude: this.toNumber(store.latitude),
      longitude: this.toNumber(store.longitude),
      thumbnailUrl: store.media[0]?.url ?? null,
      distanceKm: this.calculateDistanceKm(
        coordinates,
        store.latitude,
        store.longitude,
      ),
    }));
    const rankedStores =
      sort === 'priority'
        ? await this.loadRankingMap(
            'STORE',
            mappedStores.map((store) => store.id),
          )
        : new Map<string, RankingScore>();
    const data = this.finalizePublicItems(
      mappedStores,
      sort,
      pagination,
      rankedStores,
    );

    return this.buildPublicListResponse(data, total, pagination, sort);
  }

  async getPublicStoreBySlug(slug: string) {
    const normalizedSlug = this.normalizeStoreSlug(slug);
    if (!normalizedSlug) {
      throw new BadRequestException('slug is required');
    }

    const now = new Date();
    const store = await this.prisma.store.findFirst({
      where: {
        slug: normalizedSlug,
        deletedAt: null,
        status: 'ACTIVE',
      },
      select: {
        id: true,
        areaId: true,
        createdAt: true,
        updatedAt: true,
        name: true,
        slug: true,
        category: true,
        description: true,
        address: true,
        city: true,
        district: true,
        phone: true,
        latitude: true,
        longitude: true,
        openingHours: true,
        holidaySchedule: true,
        pricingInfo: true,
        mapUrl: true,
        googlePlaceId: true,
        area: {
          select: {
            id: true,
            code: true,
            name: true,
            city: true,
            district: true,
            ward: true,
          },
        },
        media: {
          where: {
            deletedAt: null,
            access: 'PUBLIC',
            status: 'READY',
            type: { in: ['IMAGE', 'VIDEO'] },
          },
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            type: true,
            url: true,
            purpose: true,
            mimeType: true,
            originalName: true,
            createdAt: true,
          },
        },
        casts: {
          where: {
            deletedAt: null,
            status: 'ACTIVE',
            isPublic: true,
          },
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            slug: true,
            stageName: true,
            publicAlias: true,
            publicHeadline: true,
            tags: true,
            languages: true,
            hourlyRateVnd: true,
            media: {
              where: {
                deletedAt: null,
                access: 'PUBLIC',
                status: 'READY',
                type: 'IMAGE',
              },
              orderBy: { createdAt: 'desc' },
              take: 1,
              select: {
                url: true,
              },
            },
          },
        },
        coupons: {
          where: this.buildActiveCouponWhere(now),
          orderBy: { startsAt: 'desc' },
          select: {
            id: true,
            code: true,
            name: true,
            description: true,
            discountType: true,
            discountValue: true,
            maxDiscountVnd: true,
            minSpendVnd: true,
            startsAt: true,
            endsAt: true,
            usageLimit: true,
            usedCount: true,
          },
        },
      },
    });

    if (!store) {
      throw new NotFoundException('Store not found');
    }

    const relatedStores = await this.prisma.store.findMany({
      where: {
        id: { not: store.id },
        deletedAt: null,
        status: 'ACTIVE',
        OR: [
          ...(store.areaId ? [{ areaId: store.areaId }] : []),
          { category: store.category, city: store.city },
          { city: store.city },
        ],
      },
      orderBy: { createdAt: 'desc' },
      take: 4,
      select: {
        id: true,
        name: true,
        slug: true,
        category: true,
        city: true,
        district: true,
        area: {
          select: {
            id: true,
            code: true,
            name: true,
            city: true,
            district: true,
            ward: true,
          },
        },
        media: {
          where: {
            deletedAt: null,
            access: 'PUBLIC',
            status: 'READY',
            type: 'IMAGE',
          },
          orderBy: { createdAt: 'desc' },
          take: 1,
          select: {
            url: true,
          },
        },
      },
    });

    const gallery = store.media.map((media) => ({
      id: media.id,
      type: media.type,
      url: media.url,
      purpose: media.purpose,
      mimeType: media.mimeType,
      alt: media.originalName || store.name,
    }));
    const activeCoupons = store.coupons.map((coupon) => ({
      id: coupon.id,
      code: coupon.code,
      name: coupon.name,
      description: coupon.description,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
      maxDiscountVnd: coupon.maxDiscountVnd,
      minSpendVnd: coupon.minSpendVnd,
      startsAt: coupon.startsAt,
      endsAt: coupon.endsAt,
      usageLimit: coupon.usageLimit,
      usedCount: coupon.usedCount,
    }));
    const seoDescription = this.buildStoreSeoDescription(store);

    return {
      id: store.id,
      slug: store.slug,
      name: store.name,
      category: store.category,
      description: store.description,
      area: this.mapPublicArea(store.area),
      address: store.address,
      city: store.city,
      cityCode: store.area?.code
        ? this.cityCodeFromAreaCode(store.area.code)
        : this.normalizeCityCode(store.city),
      district: store.district,
      phone: store.phone,
      latitude: this.toNumber(store.latitude),
      longitude: this.toNumber(store.longitude),
      mapUrl: store.mapUrl,
      googlePlaceId: store.googlePlaceId,
      openingHours: store.openingHours,
      holidaySchedule: store.holidaySchedule,
      gallery,
      casts: store.casts.map((cast) => ({
        id: cast.id,
        slug: cast.slug,
        stageName: cast.stageName,
        publicAlias: cast.publicAlias,
        publicHeadline: cast.publicHeadline,
        thumbnailUrl: cast.media[0]?.url ?? null,
        tags: cast.tags,
        languages: cast.languages,
        hourlyRateVnd: cast.hourlyRateVnd,
      })),
      priceReference: this.buildStorePriceReference(
        store.pricingInfo,
        store.casts,
      ),
      activeCoupons,
      campaigns: activeCoupons.map((coupon) => ({
        id: coupon.id,
        title: coupon.name,
        description: coupon.description,
        source: 'coupon' as const,
        couponId: coupon.id,
      })),
      relatedStores: relatedStores.map((relatedStore) => ({
        id: relatedStore.id,
        slug: relatedStore.slug,
        name: relatedStore.name,
        category: relatedStore.category,
        city: relatedStore.city,
        district: relatedStore.district,
        area: this.mapPublicArea(relatedStore.area),
        thumbnailUrl: relatedStore.media[0]?.url ?? null,
        relatedReason:
          relatedStore.area?.id && relatedStore.area.id === store.areaId
            ? 'same-area'
            : relatedStore.category === store.category &&
                relatedStore.city === store.city
              ? 'same-category'
              : 'same-city',
      })),
      seo: {
        title: `${store.name} | NightLife VN`,
        description: seoDescription,
        canonicalPath: `/stores/${store.slug}`,
        ogImage: gallery.find((item) => item.type === 'IMAGE')?.url ?? null,
      },
      createdAt: store.createdAt,
      updatedAt: store.updatedAt,
    };
  }

  async listPublicCasts(query: PublicDiscoveryQueryDto = {}) {
    const coordinates = this.parseCoordinates(query);
    const pagination = this.resolvePagination(query);
    const sort = this.resolveSort(query.sort, coordinates);
    const readArgs = this.resolvePublicReadArgs(sort, pagination);
    const searchTerm = this.cleanText(query.q);
    const searchToken = this.normalizeToken(searchTerm);
    const language = this.normalizeToken(query.language);
    const tag = this.normalizeToken(query.tag);
    const where: Prisma.CastWhereInput = {
      deletedAt: null,
      status: 'ACTIVE',
      isPublic: true,
      store: this.buildPublicStoreWhere(query, { includeTextSearch: false }),
      ...(language ? { languages: { has: language } } : {}),
      ...(tag ? { tags: { has: tag } } : {}),
      ...(searchTerm
        ? {
            OR: [
              { stageName: this.containsInsensitive(searchTerm) },
              { publicAlias: this.containsInsensitive(searchTerm) },
              { publicHeadline: this.containsInsensitive(searchTerm) },
              { bio: this.containsInsensitive(searchTerm) },
              { publicBio: this.containsInsensitive(searchTerm) },
              ...(searchToken
                ? [
                    { tags: { has: searchToken } },
                    { languages: { has: searchToken } },
                  ]
                : []),
              {
                store: {
                  name: this.containsInsensitive(searchTerm),
                  deletedAt: null,
                  status: 'ACTIVE',
                },
              },
            ],
          }
        : {}),
    };
    const [total, casts] = await Promise.all([
      this.prisma.cast.count({ where }),
      this.prisma.cast.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        ...readArgs,
        select: {
          id: true,
          createdAt: true,
          slug: true,
          stageName: true,
          publicAlias: true,
          publicHeadline: true,
          tags: true,
          languages: true,
          hourlyRateVnd: true,
          store: {
            select: {
              id: true,
              name: true,
              slug: true,
              category: true,
              city: true,
              district: true,
              latitude: true,
              longitude: true,
              area: {
                select: {
                  id: true,
                  code: true,
                  name: true,
                  city: true,
                  district: true,
                },
              },
            },
          },
          media: {
            where: {
              deletedAt: null,
              access: 'PUBLIC',
              status: 'READY',
              type: 'IMAGE',
            },
            orderBy: { createdAt: 'desc' },
            take: 1,
            select: {
              url: true,
            },
          },
        },
      }),
    ]);

    const mappedCasts = casts.map((cast) => ({
      id: cast.id,
      createdAt: cast.createdAt,
      slug: cast.slug,
      stageName: cast.stageName,
      name: cast.publicAlias ?? cast.stageName,
      publicAlias: cast.publicAlias,
      publicHeadline: cast.publicHeadline,
      tags: cast.tags,
      languages: cast.languages,
      hourlyRateVnd: cast.hourlyRateVnd,
      thumbnailUrl: cast.media[0]?.url ?? null,
      distanceKm: this.calculateDistanceKm(
        coordinates,
        cast.store.latitude,
        cast.store.longitude,
      ),
      store: {
        id: cast.store.id,
        name: cast.store.name,
        slug: cast.store.slug,
        category: cast.store.category,
        city: cast.store.city,
        cityCode: cast.store.area?.code
          ? this.cityCodeFromAreaCode(cast.store.area.code)
          : this.normalizeCityCode(cast.store.city),
        district: cast.store.district,
        area: cast.store.area
          ? {
              id: cast.store.area.id,
              code: cast.store.area.code,
              name: cast.store.area.name,
              city: cast.store.area.city,
              district: cast.store.area.district,
              cityCode: this.cityCodeFromAreaCode(cast.store.area.code),
            }
          : null,
        latitude: this.toNumber(cast.store.latitude),
        longitude: this.toNumber(cast.store.longitude),
      },
    }));
    const rankedCasts =
      sort === 'priority'
        ? await this.loadRankingMap(
            'CAST',
            mappedCasts.map((cast) => cast.id),
          )
        : new Map<string, RankingScore>();
    const data = this.finalizePublicItems(
      mappedCasts,
      sort,
      pagination,
      rankedCasts,
    );

    return this.buildPublicListResponse(data, total, pagination, sort);
  }

  async getPublicCastBySlug(slug: string) {
    const normalizedSlug = this.normalizeCastSlug(slug);
    if (!normalizedSlug) {
      throw new BadRequestException('slug is required');
    }

    const cast = await this.prisma.cast.findFirst({
      where: {
        slug: normalizedSlug,
        deletedAt: null,
        status: 'ACTIVE',
        isPublic: true,
        store: {
          deletedAt: null,
          status: 'ACTIVE',
        },
      },
      select: {
        id: true,
        slug: true,
        storeId: true,
        stageName: true,
        publicAlias: true,
        publicHeadline: true,
        publicBio: true,
        tags: true,
        languages: true,
        hourlyRateVnd: true,
        store: {
          select: {
            id: true,
            name: true,
            slug: true,
            category: true,
            description: true,
            address: true,
            city: true,
            district: true,
            phone: true,
            latitude: true,
            longitude: true,
            mapUrl: true,
            googlePlaceId: true,
            area: {
              select: {
                id: true,
                code: true,
                name: true,
                city: true,
                district: true,
                ward: true,
              },
            },
          },
        },
        media: {
          where: {
            deletedAt: null,
            access: 'PUBLIC',
            status: 'READY',
            type: { in: ['IMAGE', 'VIDEO'] },
          },
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            type: true,
            url: true,
            purpose: true,
            mimeType: true,
            originalName: true,
            createdAt: true,
          },
        },
      },
    });

    if (!cast) {
      throw new NotFoundException('Cast not found');
    }

    const gallery = cast.media.map((media) => ({
      id: media.id,
      type: media.type,
      url: media.url,
      purpose: media.purpose,
      mimeType: media.mimeType,
      alt: media.originalName || cast.publicAlias || cast.stageName,
    }));
    const thumbnailUrl =
      gallery.find((item) => item.type === 'IMAGE')?.url ?? null;
    const name = cast.publicAlias ?? cast.stageName;
    const seoDescription = this.buildCastSeoDescription(cast);
    const relatedCasts = await this.loadRelatedPublicCasts(cast);

    return {
      id: cast.id,
      slug: cast.slug,
      stageName: cast.stageName,
      name,
      publicAlias: cast.publicAlias,
      publicHeadline: cast.publicHeadline,
      publicBio: cast.publicBio,
      monthOfBirth: null,
      zodiacSign: null,
      heightCm: null,
      measurements: null,
      interests: [],
      tags: cast.tags,
      languages: cast.languages,
      hourlyRateVnd: cast.hourlyRateVnd,
      thumbnailUrl,
      gallery,
      relatedCasts,
      store: {
        id: cast.store.id,
        name: cast.store.name,
        slug: cast.store.slug,
        category: cast.store.category,
        description: cast.store.description,
        address: cast.store.address,
        city: cast.store.city,
        cityCode: cast.store.area?.code
          ? this.cityCodeFromAreaCode(cast.store.area.code)
          : this.normalizeCityCode(cast.store.city),
        district: cast.store.district,
        area: this.mapPublicArea(cast.store.area),
        phone: cast.store.phone,
        latitude: this.toNumber(cast.store.latitude),
        longitude: this.toNumber(cast.store.longitude),
        mapUrl: cast.store.mapUrl,
        googlePlaceId: cast.store.googlePlaceId,
      },
      seo: {
        title: `${name} tại ${cast.store.name} | NightLife VN`,
        description: seoDescription,
        canonicalPath: `/casts/${cast.slug}`,
        ogImage: thumbnailUrl,
      },
    };
  }

  async recordPublicProfileView(dto: RecordProfileViewDto) {
    const targetType = dto.targetType;

    const target =
      targetType === 'STORE'
        ? await this.prisma.store.findFirst({
            where: {
              id: dto.targetId,
              deletedAt: null,
              status: 'ACTIVE',
            },
            select: { id: true },
          })
        : await this.prisma.cast.findFirst({
            where: {
              id: dto.targetId,
              deletedAt: null,
              status: 'ACTIVE',
              isPublic: true,
              store: {
                deletedAt: null,
                status: 'ACTIVE',
              },
            },
            select: { id: true },
          });

    if (!target) {
      throw new NotFoundException('Profile target not found');
    }

    await this.prisma.auditLog.create({
      data: {
        actorId: null,
        action: 'PROFILE_VIEW_RECORDED',
        targetType,
        targetId: target.id,
        metadata: {
          source: 'public_profile',
        },
      },
    });

    return { recorded: true };
  }

  listPublicCoupons() {
    const now = new Date();

    return this.prisma.coupon.findMany({
      where: {
        status: 'ACTIVE',
        deletedAt: null,
        startsAt: { lte: now },
        OR: [{ endsAt: null }, { endsAt: { gt: now } }],
        store: {
          status: 'ACTIVE',
          deletedAt: null,
        },
      },
      orderBy: { startsAt: 'desc' },
      select: {
        id: true,
        code: true,
        name: true,
        description: true,
        discountType: true,
        discountValue: true,
        maxDiscountVnd: true,
        minSpendVnd: true,
        startsAt: true,
        endsAt: true,
        store: {
          select: {
            id: true,
            name: true,
            slug: true,
            category: true,
            city: true,
            district: true,
            media: {
              where: {
                deletedAt: null,
                access: 'PUBLIC',
                status: 'READY',
                type: 'IMAGE',
              },
              orderBy: { createdAt: 'desc' },
              take: 1,
              select: {
                url: true,
              },
            },
          },
        },
      },
    });
  }

  async claimGuestCoupon(
    couponId: string,
    dto: ClaimGuestCouponDto,
    context: CouponClaimContext = {},
  ) {
    void couponId;
    void dto;
    void context;
    throw new GoneException(INDEPENDENT_COUPON_CLAIM_REMOVED_MESSAGE);
  }

  async claimMemberCoupon(
    couponId: string,
    user: AuthenticatedUser,
    context: CouponClaimContext = {},
  ) {
    void couponId;
    void user;
    void context;
    throw new GoneException(INDEPENDENT_COUPON_CLAIM_REMOVED_MESSAGE);
  }

  async listPartnerStores(user: AuthenticatedUser) {
    const storeIds = await this.accessService.getAccessibleStoreIds(
      user,
      'store.partner.view',
    );

    return this.prisma.store.findMany({
      where: {
        deletedAt: null,
        ...(storeIds ? { id: { in: storeIds } } : {}),
      },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        slug: true,
        category: true,
        status: true,
        city: true,
        district: true,
        createdAt: true,
      },
    });
  }

  async getPartnerListingDraft(user: AuthenticatedUser, storeId: string) {
    const store = await this.getPartnerListingStore(user, storeId);
    const draft = await this.findPartnerListingDraft(store.id);
    const payload = this.partnerListingDraftPayloadFromContent(draft, store);

    return this.partnerListingDraftResponse(store, draft, payload, {
      message: draft
        ? 'Partner listing draft loaded'
        : 'Current store data loaded as listing draft',
      review: await this.getLatestPartnerListingReview(store.id),
    });
  }

  async savePartnerListingDraft(
    user: AuthenticatedUser,
    storeId: string,
    dto: PartnerListingDraftDto,
  ) {
    const store = await this.getPartnerListingStore(user, storeId);
    const payload = this.normalizePartnerListingDraft(dto, store);
    const draft = await this.upsertPartnerListingDraftContent(
      user,
      store,
      payload,
    );

    return this.partnerListingDraftResponse(store, draft, payload, {
      message: 'Partner listing draft saved',
      review: await this.getLatestPartnerListingReview(store.id),
    });
  }

  async submitPartnerListingDraft(
    user: AuthenticatedUser,
    storeId: string,
    dto: PartnerListingDraftDto,
  ) {
    const store = await this.getPartnerListingStore(user, storeId);
    const payload = this.normalizePartnerListingDraft(dto, store);
    const submittedAt = new Date();
    const requestId = `LISTING-${randomUUID().slice(0, 8).toUpperCase()}`;

    const submitted = await this.prisma.$transaction(async (tx) => {
      const draft = await this.upsertPartnerListingDraftContent(
        user,
        store,
        payload,
        tx,
      );
      const contact = await this.partnerListingContact(user, store, tx);
      const draftCastIds: string[] = [];
      const draftMediaIds: string[] = [];
      const castProfiles = this.normalizePartnerRequestCasts(
        payload.castProfiles,
      );

      for (const [index, castProfile] of castProfiles.entries()) {
        const cast = await tx.cast.create({
          data: {
            storeId: store.id,
            stageName: castProfile.stageName,
            slug: this.buildPartnerRequestSlug(
              castProfile.stageName,
              requestId,
              `cast-${index + 1}`,
            ),
            bio: castProfile.bio,
            publicBio: castProfile.bio,
            tags: castProfile.tags,
            languages: castProfile.languages,
            hourlyRateVnd: castProfile.hourlyRateVnd,
            isPublic: false,
            status: 'DRAFT',
          },
          select: { id: true },
        });
        draftCastIds.push(cast.id);

        for (const [mediaIndex, url] of castProfile.mediaUrls.entries()) {
          const media = await this.createPartnerRequestMedia(
            {
              requestId,
              url,
              index: mediaIndex,
              castId: cast.id,
              purpose: 'PARTNER_LISTING_CAST',
            },
            tx,
          );
          draftMediaIds.push(media.id);
        }
      }

      for (const [index, url] of payload.mediaUrls.entries()) {
        const media = await this.createPartnerRequestMedia(
          {
            requestId,
            url,
            index,
            storeId: store.id,
            purpose: 'PARTNER_LISTING_STORE',
          },
          tx,
        );
        draftMediaIds.push(media.id);
      }

      const menuSummary =
        payload.menuSummary ?? this.partnerListingMenuSummary(payload);

      const request = await tx.partnerRequest.create({
        data: {
          id: requestId,
          storeId: store.id,
          partnerUserId: user.id,
          partnerAccountId: contact.partnerAccountId,
          status: 'PENDING_REVIEW',
          businessName: payload.storeName,
          businessType: payload.businessType,
          area: payload.area,
          contactName: contact.contactName,
          contactPhone: contact.contactPhone,
          contactEmail: contact.contactEmail,
          note: payload.note,
          storeDescription: payload.description,
          storeAddress: payload.storeAddress,
          storeCity: payload.storeCity,
          storeDistrict: payload.storeDistrict,
          openingHours: payload.openingHours,
          menuSummary,
          mediaUrls: payload.mediaUrls,
          castProfiles: castProfiles.length
            ? (castProfiles as unknown as Prisma.InputJsonValue)
            : Prisma.JsonNull,
          draftCastIds,
          draftMediaIds,
          draftContentIds: [draft.id],
          publicState: 'HIDDEN',
          submittedAt,
        },
        select: this.partnerRequestSelect(),
      });

      await tx.content.update({
        where: { id: draft.id },
        data: {
          metadata: this.toPrismaJson({
            kind: PARTNER_LISTING_DRAFT_KIND,
            version: 1,
            listing: payload,
            savedAt: submittedAt.toISOString(),
            savedById: user.id,
            submittedAt: submittedAt.toISOString(),
            submittedRequestId: request.id,
          }),
        },
        select: { id: true },
      });

      return {
        draft,
        request: request as unknown as PartnerRequestCmsRecord,
      };
    });

    await this.notifyPartnerRequestDelivery(submitted.request);

    return {
      id: submitted.request.id,
      status: submitted.request.status,
      submittedAt: submitted.request.submittedAt.toISOString(),
      message: 'Partner listing submitted for admin review',
      draft: {
        contentId: submitted.draft.id,
        storeId: store.id,
        storeName: payload.storeName,
        storeSlug: store.slug,
        castCount: submitted.request.draftCastIds.length,
        mediaCount: submitted.request.draftMediaIds.length,
        contentCount: submitted.request.draftContentIds.length,
      },
    };
  }

  async getPartnerLiteDashboard(user: AuthenticatedUser, periodInput?: string) {
    const period = this.resolvePartnerDashboardPeriod(periodInput);
    const { from, to } = this.resolvePartnerDashboardWindow(period);
    const arrivalSource = this.resolvePartnerArrivalSource();
    const storeIds = await this.accessService.getAccessibleStoreIds(
      user,
      'store.partner.view',
    );
    const storeScopeWhere = storeIds ? { id: { in: storeIds } } : {};
    const scopedStores = await this.prisma.store.findMany({
      where: {
        deletedAt: null,
        ...storeScopeWhere,
      },
      orderBy: { createdAt: 'desc' },
      select: { id: true, name: true, slug: true },
    });
    const scopedStoreIds = scopedStores.map((store) => store.id);
    const scopedCastRecords = await this.prisma.cast.findMany({
      where: {
        deletedAt: null,
        ...(storeIds ? { storeId: { in: storeIds } } : {}),
      },
      select: { id: true, storeId: true },
    });
    const scopedCastIds = scopedCastRecords.map((cast) => cast.id);
    const bookingWhere = this.partnerBookingCountWhere(
      scopedStoreIds,
      from,
      to,
    );
    const qrUsedWhere = this.partnerQrUsedCountWhere(scopedStoreIds, from, to);
    const approvedBillWhere = this.partnerApprovedBillCountWhere(
      scopedStoreIds,
      from,
      to,
    );
    const profileViewWhere = this.partnerProfileViewWhere(
      scopedStoreIds,
      scopedCastIds,
      from,
      to,
    );
    const bookingRows = await this.prisma.booking.findMany({
      where: bookingWhere,
      orderBy: { createdAt: 'asc' },
      select: { createdAt: true },
    });

    const [bookingCount, profileViewCount, qrUsedCount, billApprovedCount] =
      await Promise.all([
        this.prisma.booking.count({ where: bookingWhere }),
        this.prisma.auditLog.count({ where: profileViewWhere }),
        this.prisma.couponIssue.count({ where: qrUsedWhere }),
        this.prisma.bill.count({ where: approvedBillWhere }),
      ]);

    const castsByStoreId = scopedCastRecords.reduce(
      (acc, cast) => {
        acc[cast.storeId] = [...(acc[cast.storeId] ?? []), cast.id];
        return acc;
      },
      {} as Record<string, string[]>,
    );
    const stores = await Promise.all(
      scopedStores.map(async (store) => {
        const storeCastIds = castsByStoreId[store.id] ?? [];
        const storeIdsForCount = [store.id];
        const storeBookingWhere = this.partnerBookingCountWhere(
          storeIdsForCount,
          from,
          to,
        );
        const storeProfileViewWhere = this.partnerProfileViewWhere(
          storeIdsForCount,
          storeCastIds,
          from,
          to,
        );
        const storeCustomerArrivalCountPromise =
          arrivalSource === 'BILL_APPROVED'
            ? this.prisma.bill.count({
                where: this.partnerApprovedBillCountWhere(
                  storeIdsForCount,
                  from,
                  to,
                ),
              })
            : this.prisma.couponIssue.count({
                where: this.partnerQrUsedCountWhere(storeIdsForCount, from, to),
              });
        const [
          storeBookingCount,
          storeProfileViewCount,
          storeCustomerArrivalCount,
        ] = await Promise.all([
          this.prisma.booking.count({ where: storeBookingWhere }),
          this.prisma.auditLog.count({ where: storeProfileViewWhere }),
          storeCustomerArrivalCountPromise,
        ]);

        return {
          id: store.id,
          name: store.name,
          slug: store.slug,
          bookingCount: storeBookingCount,
          profileViewCount: storeProfileViewCount,
          customerArrivalCount: storeCustomerArrivalCount,
        };
      }),
    );

    return {
      period,
      from: from.toISOString(),
      to: to.toISOString(),
      bookingCount,
      profileViewCount,
      customerArrivalCount:
        arrivalSource === 'BILL_APPROVED' ? billApprovedCount : qrUsedCount,
      customerArrivalSource: arrivalSource,
      qrUsedCount,
      billApprovedCount,
      storeCount: scopedStores.length,
      stores,
      weeklyBookings: this.mapPartnerWeeklyBookings(bookingRows, to),
      privacy: {
        customerDetailVisible: false,
        note: 'Partner dashboard returns aggregate metrics only.',
      },
    };
  }

  async listPartnerCoupons(user: AuthenticatedUser) {
    const storeIds = await this.accessService.getAccessibleStoreIds(
      user,
      'coupon.partner.view',
    );

    return this.prisma.coupon.findMany({
      where: {
        deletedAt: null,
        ...(storeIds ? { storeId: { in: storeIds } } : {}),
      },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        storeId: true,
        code: true,
        name: true,
        status: true,
        usedCount: true,
        usageLimit: true,
        startsAt: true,
        endsAt: true,
        store: { select: { id: true, name: true, slug: true } },
      },
    });
  }

  async listPartnerBookings(user: AuthenticatedUser) {
    const storeIds = await this.accessService.getAccessibleStoreIds(
      user,
      'booking.partner.view',
    );

    return this.prisma.booking.findMany({
      where: {
        deletedAt: null,
        ...(storeIds ? { storeId: { in: storeIds } } : {}),
      },
      orderBy: { scheduledAt: 'desc' },
      select: {
        id: true,
        storeId: true,
        status: true,
        scheduledAt: true,
        partySize: true,
        subtotalVnd: true,
        discountVnd: true,
        totalVnd: true,
        store: { select: { id: true, name: true, slug: true } },
        cast: {
          select: {
            id: true,
            slug: true,
            stageName: true,
            publicAlias: true,
          },
        },
        coupon: { select: { id: true, code: true, name: true } },
        couponIssue: { select: { id: true, code: true, status: true } },
        user: { select: { id: true, displayName: true, tier: true } },
        guest: { select: { id: true, displayName: true } },
        note: true,
        createdAt: true,
      },
    });
  }

  async listOperatorBookings(user: AuthenticatedUser) {
    return this.listPartnerBookings(user);
  }

  async createGuestBooking(
    dto: CreateBookingDto,
    context: CouponClaimContext = {},
  ) {
    const target = await this.resolveBookingTarget(dto);
    const contact = this.sanitizeBookingContact(dto);
    this.resolveBookingScheduledAt(dto.scheduledAt);
    this.assertBookingRateLimit(
      `booking:create:guest:${contact.email ?? contact.phone}`,
      BOOKING_CREATE_RATE_LIMIT,
      'Too many booking requests. Please try again shortly.',
    );
    const guest = await this.prisma.guest.create({
      data: {
        displayName: contact.displayName,
        phone: contact.phone || undefined,
        email: contact.email || '',
      },
      select: {
        id: true,
      },
    });

    const booking = await this.createBookingRecord({
      dto,
      target,
      note: contact.note,
      guestId: guest.id,
      phone: contact.phone,
      context,
    });

    await this.adminNotificationService?.notifyBookingCreated(booking);
    await this.notifyGuestBookingQrEmail(booking);

    return booking;
  }

  async createMemberBooking(
    user: AuthenticatedUser,
    dto: CreateBookingDto,
    context: CouponClaimContext = {},
  ) {
    const target = await this.resolveBookingTarget(dto);
    const contact = this.sanitizeBookingContact(dto);
    this.resolveBookingScheduledAt(dto.scheduledAt);
    this.assertBookingRateLimit(
      `booking:create:member:${user.id}`,
      BOOKING_CREATE_RATE_LIMIT,
      'Too many booking requests. Please try again shortly.',
    );
    const guest = await this.prisma.guest.create({
      data: {
        convertedUserId: user.id,
        displayName: contact.displayName,
        phone: contact.phone || undefined,
        email: contact.email || user.email || '',
      },
      select: {
        id: true,
      },
    });

    const booking = await this.createBookingRecord({
      dto,
      target,
      note: contact.note,
      user,
      userId: user.id,
      guestId: guest.id,
      phone: contact.phone,
      context: {
        ...context,
        sessionId: context.sessionId ?? user.jti ?? null,
      },
    });

    await this.adminNotificationService?.notifyBookingCreated(booking);

    return booking;
  }

  async cancelMemberBooking(
    user: AuthenticatedUser,
    bookingId: string,
    dto: CancelBookingDto = {},
  ) {
    this.assertBookingRateLimit(
      `booking:cancel:member:${user.id}`,
      BOOKING_CANCEL_RATE_LIMIT,
      'Too many cancellation requests. Please try again shortly.',
    );
    const booking = await this.prisma.booking.findFirst({
      where: {
        id: bookingId,
        userId: user.id,
        deletedAt: null,
      },
      select: {
        id: true,
        storeId: true,
        userId: true,
        guestId: true,
        status: true,
        scheduledAt: true,
        cancelledAt: true,
        store: { select: { bookingCancelCutoffMinutes: true } },
      },
    });

    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    return this.cancelBookingRecord({
      booking,
      actorId: user.id,
      actorType: 'MEMBER',
      reason: dto.reason,
      enforceCutoff: true,
    });
  }

  async cancelGuestBooking(bookingId: string, dto: CancelGuestBookingDto) {
    const phone = this.cleanText(dto.phone);
    if (!phone) {
      throw new BadRequestException('phone is required');
    }
    this.assertBookingRateLimit(
      `booking:cancel:guest:${phone}`,
      BOOKING_CANCEL_RATE_LIMIT,
      'Too many cancellation requests. Please try again shortly.',
    );

    const booking = await this.prisma.booking.findFirst({
      where: {
        id: bookingId,
        userId: null,
        deletedAt: null,
        guest: {
          is: {
            phone,
          },
        },
      },
      select: {
        id: true,
        storeId: true,
        userId: true,
        guestId: true,
        status: true,
        scheduledAt: true,
        cancelledAt: true,
        store: { select: { bookingCancelCutoffMinutes: true } },
      },
    });

    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    return this.cancelBookingRecord({
      booking,
      actorType: 'GUEST',
      reason: dto.reason,
      enforceCutoff: true,
    });
  }

  async getGuestBookingByCode(bookingCode: string, phone: string) {
    const cleanedPhone = this.cleanText(phone);
    if (!cleanedPhone) {
      throw new BadRequestException('phone is required');
    }

    const lookupCode = this.normalizeBookingLookupCode(bookingCode);
    const bookings = await this.prisma.booking.findMany({
      where: {
        userId: null,
        deletedAt: null,
        guest: { is: { phone: cleanedPhone } },
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
      select: this.bookingNotificationSelect(),
    });
    const booking = bookings.find((item) =>
      this.bookingMatchesLookupCode(item.id, lookupCode),
    );

    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    return booking;
  }

  async requestMemberBookingReschedule(
    user: AuthenticatedUser,
    bookingId: string,
    dto: RequestBookingRescheduleDto,
  ) {
    const booking = await this.prisma.booking.findFirst({
      where: {
        id: bookingId,
        userId: user.id,
        deletedAt: null,
      },
      select: this.bookingChangeTargetSelect(),
    });

    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    return this.createBookingRescheduleRequest({
      booking,
      actorId: user.id,
      actorType: 'MEMBER',
      dto,
    });
  }

  async requestGuestBookingReschedule(
    bookingId: string,
    dto: GuestBookingRescheduleDto,
  ) {
    const phone = this.cleanText(dto.phone);
    if (!phone) {
      throw new BadRequestException('phone is required');
    }

    const booking = await this.prisma.booking.findFirst({
      where: {
        id: bookingId,
        userId: null,
        deletedAt: null,
        guest: {
          is: {
            phone,
          },
        },
      },
      select: this.bookingChangeTargetSelect(),
    });

    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    return this.createBookingRescheduleRequest({
      booking,
      actorType: 'GUEST',
      dto,
    });
  }

  async listAdminBookingChangeRequests(
    user: AuthenticatedUser,
    query: { status?: string; storeId?: string } = {},
  ) {
    const storeIds = await this.accessService.getAccessibleStoreIds(
      user,
      'booking.change.review',
    );
    const requestedStatus = this.cleanText(query.status).toUpperCase();
    const storeId = this.cleanText(query.storeId);

    return this.prisma.bookingChangeRequest.findMany({
      where: {
        ...(requestedStatus
          ? { status: requestedStatus as BookingChangeRequestStatus }
          : {}),
        ...(storeId ? { storeId } : {}),
        ...(storeIds ? { storeId: { in: storeIds } } : {}),
      },
      orderBy: { createdAt: 'desc' },
      take: 100,
      select: this.bookingChangeRequestSelect(),
    });
  }

  async reviewBookingChangeRequest(
    user: AuthenticatedUser,
    requestId: string,
    dto: ReviewBookingChangeRequestDto,
  ) {
    const changeRequest = await this.prisma.bookingChangeRequest.findUnique({
      where: { id: requestId },
      select: this.bookingChangeRequestSelect(),
    });

    if (!changeRequest) {
      throw new NotFoundException('Booking change request not found');
    }

    await this.accessService.ensureStoreAccess(
      user,
      changeRequest.storeId,
      'booking.change.review',
    );

    if (changeRequest.status !== 'REQUESTED') {
      throw new UnprocessableEntityException(
        'Booking change request has already been reviewed',
      );
    }

    const now = new Date();
    const note = this.cleanText(dto.note);

    if (!dto.approve) {
      const rejected = await this.prisma.bookingChangeRequest.update({
        where: { id: changeRequest.id },
        data: {
          status: 'REJECTED',
          reviewedById: user.id,
          reviewedAt: now,
          adminNote: note || null,
        },
        select: this.bookingChangeRequestSelect(),
      });

      await this.createBookingChangeAudit({
        actorId: user.id,
        action: 'BOOKING_RESCHEDULE_REJECTED',
        before: changeRequest,
        after: rejected,
        metadata: { note: note || null },
      });
      await this.notifyBookingCustomerTemplate(
        rejected.booking,
        'customer.booking.reschedule_rejected.v1',
        {
          requestId: rejected.id,
          note: note || null,
        },
      );

      return rejected;
    }

    if (!changeRequest.requestedScheduledAt) {
      throw new UnprocessableEntityException(
        'Reschedule request is missing requestedScheduledAt',
      );
    }

    const requestedScheduledAt = new Date(changeRequest.requestedScheduledAt);
    if (!Number.isFinite(requestedScheduledAt.getTime())) {
      throw new BadRequestException(
        'requestedScheduledAt must be a valid ISO date',
      );
    }

    const updatedBooking = await this.prisma.booking.update({
      where: { id: changeRequest.bookingId },
      data: { scheduledAt: requestedScheduledAt },
      select: this.bookingNotificationSelect(),
    });
    const approved = await this.prisma.bookingChangeRequest.update({
      where: { id: changeRequest.id },
      data: {
        status: 'APPROVED',
        reviewedById: user.id,
        reviewedAt: now,
        adminNote: note || null,
      },
      select: this.bookingChangeRequestSelect(),
    });

    await this.createBookingChangeAudit({
      actorId: user.id,
      action: 'BOOKING_RESCHEDULE_APPROVED',
      before: changeRequest,
      after: approved,
      metadata: {
        note: note || null,
        previousScheduledAt: this.toAuditIso(changeRequest.currentScheduledAt),
        nextScheduledAt: requestedScheduledAt.toISOString(),
      },
    });
    await this.notifyBookingCustomerTemplate(
      updatedBooking,
      'customer.booking.rescheduled.v1',
      {
        requestId: approved.id,
        previousScheduledAt: this.toAuditIso(changeRequest.currentScheduledAt),
        scheduledAt: requestedScheduledAt.toISOString(),
        note: note || null,
      },
    );

    if (updatedBooking.user?.id) {
      this.socketGateway?.notifyBookingStatusUpdate(
        updatedBooking.user.id,
        updatedBooking,
      );
    }

    return approved;
  }

  async updateStoreBookingPolicy(
    user: AuthenticatedUser,
    storeId: string,
    dto: UpdateStoreBookingPolicyDto,
  ) {
    const cutoff = Number(dto.cancelCutoffMinutes);
    if (
      !BOOKING_POLICY_CUTOFF_MINUTES.includes(
        cutoff as (typeof BOOKING_POLICY_CUTOFF_MINUTES)[number],
      )
    ) {
      throw new BadRequestException(
        'cancelCutoffMinutes must be 30, 60, or 120',
      );
    }

    const store = await this.prisma.store.findFirst({
      where: { id: storeId, deletedAt: null },
      select: {
        id: true,
        name: true,
        slug: true,
        bookingCancelCutoffMinutes: true,
      },
    });

    if (!store) {
      throw new NotFoundException('Store not found');
    }

    await this.accessService.ensureStoreAccess(
      user,
      store.id,
      'booking.policy.update',
    );

    const updated = await this.prisma.store.update({
      where: { id: store.id },
      data: { bookingCancelCutoffMinutes: cutoff },
      select: {
        id: true,
        name: true,
        slug: true,
        bookingCancelCutoffMinutes: true,
      },
    });

    await this.prisma.auditLog.create({
      data: {
        actorId: user.id,
        action: 'BOOKING_POLICY_UPDATED',
        targetType: 'Store',
        targetId: store.id,
        beforeJson: {
          id: store.id,
          bookingCancelCutoffMinutes: store.bookingCancelCutoffMinutes,
        },
        afterJson: {
          id: updated.id,
          bookingCancelCutoffMinutes: updated.bookingCancelCutoffMinutes,
        },
        metadata: {
          actorType: this.bookingActorTypeFor(user),
          cutoffMinutes: cutoff,
        },
      },
    });

    return updated;
  }

  async listMemberBookingMessages(user: AuthenticatedUser, bookingId: string) {
    const booking = await this.findMemberBookingChatTarget(user, bookingId);
    return this.listBookingChatMessages(booking.id);
  }

  async createMemberBookingMessage(
    user: AuthenticatedUser,
    bookingId: string,
    dto: BookingChatMessageDto,
  ) {
    const booking = await this.findMemberBookingChatTarget(user, bookingId);
    return this.createBookingChatMessage({
      booking,
      dto,
      senderType: 'MEMBER',
      senderUserId: user.id,
      guestId: booking.guestId,
    });
  }

  async listGuestBookingMessages(bookingId: string, phone: string) {
    const booking = await this.findGuestBookingChatTarget(bookingId, phone);
    return this.listBookingChatMessages(booking.id);
  }

  async createGuestBookingMessage(
    bookingId: string,
    dto: GuestBookingChatMessageDto,
  ) {
    const booking = await this.findGuestBookingChatTarget(bookingId, dto.phone);
    return this.createBookingChatMessage({
      booking,
      dto,
      senderType: 'GUEST',
      guestId: booking.guestId,
    });
  }

  async listAdminBookingMessages(user: AuthenticatedUser, bookingId: string) {
    const booking = await this.findAdminBookingChatTarget(user, bookingId);
    return this.listBookingChatMessages(booking.id);
  }

  async createAdminBookingMessage(
    user: AuthenticatedUser,
    bookingId: string,
    dto: BookingChatMessageDto,
  ) {
    const booking = await this.findAdminBookingChatTarget(user, bookingId);
    return this.createBookingChatMessage({
      booking,
      dto,
      senderType: this.resolveBookingChatSenderType(user),
      senderUserId: user.id,
      guestId: booking.guestId,
    });
  }

  async getAdminBookingCancelAnalytics(
    user: AuthenticatedUser,
    query: { days?: string | number } = {},
  ) {
    const storeIds = await this.accessService.getAccessibleStoreIds(
      user,
      'booking.analytics.view',
    );
    const days = this.resolveAnalyticsDays(query.days);
    const to = new Date();
    const from = new Date(to.getTime() - days * DAY_MS);
    const bookings = await this.prisma.booking.findMany({
      where: {
        deletedAt: null,
        createdAt: { gte: from, lte: to },
        ...(storeIds ? { storeId: { in: storeIds } } : {}),
      },
      select: {
        id: true,
        status: true,
        storeId: true,
        castId: true,
        userId: true,
        guestId: true,
        createdAt: true,
        cancelledAt: true,
        store: {
          select: {
            id: true,
            name: true,
            slug: true,
            bookingCancelCutoffMinutes: true,
          },
        },
        cast: {
          select: {
            id: true,
            slug: true,
            stageName: true,
            publicAlias: true,
          },
        },
      },
    });

    const byStore = new Map<string, CancelAnalyticsMetric>();
    const byCast = new Map<string, CancelAnalyticsMetric>();
    const byChannel = new Map<string, CancelAnalyticsMetric>();

    for (const booking of bookings) {
      const cancelled = booking.status === 'CANCELLED';
      this.addCancelAnalyticsMetric(
        byStore,
        booking.storeId,
        {
          storeId: booking.storeId,
          storeName: booking.store.name,
          storeSlug: booking.store.slug,
          cancelCutoffMinutes: booking.store.bookingCancelCutoffMinutes,
        },
        cancelled,
      );

      if (booking.cast) {
        this.addCancelAnalyticsMetric(
          byCast,
          booking.cast.id,
          {
            castId: booking.cast.id,
            castName: booking.cast.publicAlias ?? booking.cast.stageName,
            castSlug: booking.cast.slug,
            storeId: booking.storeId,
          },
          cancelled,
        );
      } else {
        this.addCancelAnalyticsMetric(
          byCast,
          'none',
          {
            castId: null,
            castName: 'No cast selected',
            castSlug: null,
            storeId: null,
          },
          cancelled,
        );
      }

      const channel = booking.userId ? 'MEMBER' : 'GUEST';
      this.addCancelAnalyticsMetric(byChannel, channel, { channel }, cancelled);
    }

    const totalBookings = bookings.length;
    const cancelledBookings = bookings.filter(
      (booking) => booking.status === 'CANCELLED',
    ).length;

    return {
      meta: {
        from: from.toISOString(),
        to: to.toISOString(),
        days,
        totalBookings,
        cancelledBookings,
        cancelRate: this.calculateCancelRate(cancelledBookings, totalBookings),
      },
      byStore: this.sortCancelAnalyticsMetrics(byStore),
      byCast: this.sortCancelAnalyticsMetrics(byCast),
      byChannel: this.sortCancelAnalyticsMetrics(byChannel),
    };
  }

  async cancelAdminBooking(
    user: AuthenticatedUser,
    bookingId: string,
    dto: CancelBookingDto = {},
  ) {
    this.assertBookingRateLimit(
      `booking:cancel:staff:${user.id}`,
      BOOKING_CANCEL_RATE_LIMIT,
      'Too many cancellation requests. Please try again shortly.',
    );

    const booking = await this.prisma.booking.findFirst({
      where: {
        id: bookingId,
        deletedAt: null,
      },
      select: {
        id: true,
        storeId: true,
        userId: true,
        guestId: true,
        status: true,
        scheduledAt: true,
        cancelledAt: true,
        store: { select: { bookingCancelCutoffMinutes: true } },
      },
    });

    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    await this.accessService.ensureStoreAccess(
      user,
      booking.storeId,
      'booking.cancel',
    );

    return this.cancelBookingRecord({
      booking,
      actorId: user.id,
      actorType: this.bookingActorTypeFor(user),
      reason: dto.reason,
      enforceCutoff: false,
    });
  }

  private async cancelBookingRecord(input: {
    booking: BookingCancelTarget;
    actorId?: string | null;
    actorType: BookingStatusActorType;
    reason?: string | null;
    enforceCutoff?: boolean;
  }) {
    this.assertBookingCanBeCancelled(input.booking, {
      enforceCutoff: input.enforceCutoff ?? true,
    });

    const now = new Date();
    const reason = this.cleanText(input.reason);
    const result = await this.updateBookingStatusWithAudit({
      booking: input.booking,
      nextStatus: 'CANCELLED',
      actorId: input.actorId,
      actorType: input.actorType,
      action: 'BOOKING_CANCELLED',
      reason,
      now,
      data: { cancelledAt: now },
    });

    await this.adminNotificationService?.notifyBookingCancelled(result, {
      reason,
    });

    return result;
  }

  async scanCouponIssue(code: string, user: AuthenticatedUser) {
    return this.scanCouponIssueByUnique({ code }, user, {
      source: 'LEGACY_CODE',
    });
  }

  async scanCouponIssuePayload(
    dto: ScanCouponIssueDto,
    user: AuthenticatedUser,
  ) {
    const token = this.resolveCouponIssueTokenFromQrPayload(dto.payload);
    return this.scanCouponIssueByUnique({ id: token.issueId }, user, {
      source: 'SIGNED_QR_PAYLOAD',
      offline: Boolean(dto.offline),
      qrTokenHash: token.tokenHash,
    });
  }

  async scanPartnerBookingQr(dto: ScanBookingQrDto, user: AuthenticatedUser) {
    const parsedPayload = this.parseBookingQrPayload(dto.payload);
    const booking = await this.findBookingFromQrPayload(parsedPayload);

    await this.accessService.ensureStoreAccess(
      user,
      booking.storeId,
      'booking.partner.view',
    );
    this.assertBookingQrCanBeScanned(booking);

    await this.prisma.auditLog.create({
      data: {
        actorId: user.id,
        action: 'BOOKING_QR_SCANNED',
        targetType: 'Booking',
        targetId: booking.id,
        metadata: this.toPrismaJson({
          source: 'PARTNER_BOOKING_QR_SCAN',
          offline: Boolean(dto.offline),
          storeId: booking.storeId,
          payloadStoreSlug: parsedPayload.storeSlug ?? null,
          payloadScheduledAt: parsedPayload.scheduledAt ?? null,
        }),
      },
    });

    return this.decoratePartnerBookingQr(booking);
  }

  async confirmPartnerBookingQrCheckIn(
    bookingId: string,
    user: AuthenticatedUser,
  ) {
    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
      select: this.partnerBookingQrSelect(),
    });

    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    await this.accessService.ensureStoreAccess(
      user,
      booking.storeId,
      'checkin.confirm',
    );
    this.assertBookingQrCanBeScanned(booking);

    if (!['CHECKED_IN', 'COMPLETED'].includes(booking.status)) {
      const now = new Date();

      await this.prisma.bookingQr.updateMany({
        where: { bookingId: booking.id, status: 'ACTIVE' },
        data: { status: 'USED', usedAt: now },
      });

      await this.updateBookingStatusWithAudit({
        booking,
        nextStatus: 'CHECKED_IN',
        actorId: user.id,
        actorType: this.bookingActorTypeFor(user),
        action: 'BOOKING_STATUS_CHANGED',
        reason: 'Booking QR check-in confirmed',
        now,
      });
    }

    const updatedBooking = await this.prisma.booking.findUnique({
      where: { id: booking.id },
      select: this.partnerBookingQrSelect(),
    });

    if (!updatedBooking) {
      throw new NotFoundException('Booking not found');
    }

    return this.decoratePartnerBookingQr(updatedBooking);
  }

  private parseBookingQrPayload(payload: string) {
    const value = this.cleanText(payload);
    if (!value) {
      throw new BadRequestException('payload is required');
    }

    const parts = value.split('|').map((part) => part.trim());
    if (parts[0] !== 'NLBOOKING') {
      throw new BadRequestException('Invalid booking QR payload');
    }

    return {
      bookingId: parts[1] ?? '',
      bookingCode: parts[2] ?? '',
      storeSlug: parts[3] ?? '',
      scheduledAt: parts[4] ?? '',
    };
  }

  private async findBookingFromQrPayload(input: {
    bookingId?: string;
    bookingCode?: string;
    storeSlug?: string;
    scheduledAt?: string;
  }) {
    const select = this.partnerBookingQrSelect();
    const bookingId = this.cleanText(input.bookingId);
    if (bookingId && this.isUuid(bookingId)) {
      const booking = await this.prisma.booking.findFirst({
        where: { id: bookingId, deletedAt: null },
        select,
      });
      if (booking) {
        return booking;
      }
    }

    const lookupCodeSource = this.cleanText(input.bookingCode) || bookingId;
    const lookupCode = this.normalizeBookingLookupCode(lookupCodeSource);
    const storeSlug = this.cleanText(input.storeSlug);
    const candidates = await this.prisma.booking.findMany({
      where: {
        deletedAt: null,
        ...(storeSlug ? { store: { slug: storeSlug } } : {}),
      },
      orderBy: { createdAt: 'desc' },
      take: 100,
      select,
    });
    const booking = candidates.find((item) =>
      this.bookingMatchesLookupCode(item.id, lookupCode),
    );

    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    return booking;
  }

  private assertBookingQrCanBeScanned(booking: {
    status: string;
    qr?: { status: string; expiresAt: Date | string | null } | null;
  }) {
    if (['CANCELLED', 'NO_SHOW'].includes(booking.status)) {
      throw new UnprocessableEntityException(
        'Booking is not available for check-in',
      );
    }

    if (booking.qr?.status === 'REVOKED') {
      throw new UnprocessableEntityException('Booking QR has been revoked');
    }

    if (booking.qr?.status === 'EXPIRED') {
      throw new UnprocessableEntityException('Booking QR has expired');
    }

    if (booking.qr?.expiresAt && new Date(booking.qr.expiresAt) <= new Date()) {
      throw new UnprocessableEntityException('Booking QR has expired');
    }
  }

  private decoratePartnerBookingQr(booking: {
    id: string;
    storeId: string;
    status: string;
    scheduledAt: Date | string;
    cancelledAt?: Date | string | null;
    userId?: string | null;
    guestId?: string | null;
    store: { id: string; name: string; slug: string };
    coupon?: { id: string; code: string; name: string } | null;
    couponIssue?: { id: string; code: string; status: string } | null;
    user?: {
      id: string;
      displayName: string | null;
      tier: string | null;
    } | null;
    guest?: {
      id: string;
      displayName: string | null;
      phone?: string | null;
    } | null;
    qr?: {
      id: string;
      code: string;
      status: string;
      expiresAt: Date | string;
      usedAt: Date | string | null;
    } | null;
  }) {
    const isUsed =
      ['CHECKED_IN', 'COMPLETED'].includes(booking.status) ||
      booking.qr?.status === 'USED';
    const status = isUsed ? 'USED' : 'ISSUED';
    const customerType = booking.userId ? 'MEMBER' : 'GUEST';

    return {
      scanType: 'BOOKING_QR',
      id: booking.id,
      code: booking.qr?.code ?? this.bookingPublicCode(booking.id),
      status,
      statusLabel: isUsed ? 'Đã check-in' : 'Booking hợp lệ',
      expiresAt: this.toAuditIso(booking.qr?.expiresAt),
      usedAt: this.toAuditIso(booking.qr?.usedAt),
      customer: {
        type: customerType,
        label: booking.userId ? 'Hội viên' : 'Khách vãng lai',
      },
      booking: {
        id: booking.id,
        status: booking.status,
        scheduledAt: this.toAuditIso(booking.scheduledAt),
      },
      coupon: {
        id: booking.coupon?.id ?? booking.id,
        code: booking.coupon?.code ?? 'BOOKING',
        name: booking.coupon?.name ?? 'Booking đặt chỗ',
        store: booking.store,
      },
      couponIssue: booking.couponIssue,
    };
  }

  private async scanCouponIssueByUnique(
    where: Prisma.CouponIssueWhereUniqueInput,
    user: AuthenticatedUser,
    metadata: { source: string; offline?: boolean; qrTokenHash?: string },
  ) {
    const issue = await this.prisma.couponIssue.findUnique({
      where,
      select: {
        id: true,
        couponId: true,
        code: true,
        guestId: true,
        userId: true,
        status: true,
        expiresAt: true,
        usedAt: true,
        metadata: true,
        booking: { select: { id: true, status: true, scheduledAt: true } },
        coupon: {
          select: {
            id: true,
            code: true,
            name: true,
            storeId: true,
            store: { select: { id: true, name: true, slug: true } },
          },
        },
      },
    });

    if (!issue) {
      throw new NotFoundException('Coupon issue not found');
    }

    await this.accessService.ensureStoreAccess(
      user,
      issue.coupon.storeId,
      'coupon.scan',
    );
    this.assertCouponQrTokenUsable(issue.metadata, metadata.qrTokenHash);
    await this.assertIssueCanBeConfirmed(issue);

    await this.writeCouponIssueAudit({
      action: 'COUPON_ISSUE_SCANNED',
      issue,
      actorId: user.id,
      metadata: {
        source: metadata.source,
        offline: Boolean(metadata.offline),
        couponId: issue.couponId,
        status: issue.status,
      },
    });

    const scannedIssue = await this.prisma.couponIssue.update({
      where: { id: issue.id },
      data: { scannedById: user.id },
      select: {
        id: true,
        couponId: true,
        code: true,
        guestId: true,
        userId: true,
        status: true,
        expiresAt: true,
        usedAt: true,
        metadata: true,
        booking: { select: { id: true, status: true, scheduledAt: true } },
        coupon: {
          select: {
            id: true,
            code: true,
            name: true,
            discountType: true,
            discountValue: true,
            maxDiscountVnd: true,
            minSpendVnd: true,
            store: { select: { id: true, name: true, slug: true } },
          },
        },
      },
    });

    await this.recordCouponLifecycleEvent(
      'coupon.issue.scanned.v1',
      scannedIssue,
      {
        actorId: user.id,
        source: metadata.source,
        offline: Boolean(metadata.offline),
      },
    );

    return this.decoratePartnerCouponIssue(scannedIssue);
  }

  async confirmCouponIssueCheckIn(
    couponIssueId: string,
    user: AuthenticatedUser,
  ) {
    const issue = await this.prisma.couponIssue.findUnique({
      where: { id: couponIssueId },
      select: {
        id: true,
        code: true,
        couponId: true,
        guestId: true,
        userId: true,
        status: true,
        expiresAt: true,
        usedAt: true,
        scannedById: true,
        metadata: true,
        coupon: { select: { storeId: true } },
        booking: {
          select: {
            id: true,
            userId: true,
            guestId: true,
            status: true,
            scheduledAt: true,
            cancelledAt: true,
          },
        },
      },
    });

    if (!issue) {
      throw new NotFoundException('Coupon issue not found');
    }

    await this.accessService.ensureStoreAccess(
      user,
      issue.coupon.storeId,
      'checkin.confirm',
    );
    await this.assertIssueCanBeConfirmed(issue);

    const now = new Date();

    const usedIssue = await this.prisma.couponIssue.updateMany({
      where: {
        id: issue.id,
        status: 'ISSUED',
        OR: [{ expiresAt: null }, { expiresAt: { gt: now } }],
      },
      data: {
        status: 'USED',
        usedAt: now,
        scannedById: user.id,
      },
    });

    if (usedIssue.count !== 1) {
      throw new UnprocessableEntityException(
        'Coupon issue has already been used',
      );
    }

    const updatedIssue = await this.prisma.couponIssue.findUnique({
      where: { id: issue.id },
      select: {
        id: true,
        couponId: true,
        code: true,
        guestId: true,
        userId: true,
        status: true,
        expiresAt: true,
        usedAt: true,
        scannedById: true,
        metadata: true,
        coupon: {
          select: {
            id: true,
            code: true,
            name: true,
            discountType: true,
            discountValue: true,
            maxDiscountVnd: true,
            minSpendVnd: true,
            store: { select: { id: true, name: true, slug: true } },
          },
        },
      },
    });

    if (!updatedIssue) {
      throw new NotFoundException('Coupon issue not found');
    }

    await this.writeCouponIssueAudit({
      action: 'COUPON_ISSUE_USED',
      issue: {
        ...issue,
        code: updatedIssue.code,
        couponId: issue.couponId,
        coupon: {
          storeId: issue.coupon.storeId,
        },
      },
      actorId: user.id,
      beforeJson: this.buildCouponIssueUsageAuditSnapshot(issue),
      afterJson: this.buildCouponIssueUsageAuditSnapshot(updatedIssue),
      metadata: {
        source: 'PARTNER_CONFIRM_CHECK_IN',
        couponId: issue.couponId,
        previousStatus: issue.status,
        nextStatus: 'USED',
        usedAt: now.toISOString(),
      },
    });

    await this.recordCouponLifecycleEvent(
      'coupon.issue.used.v1',
      updatedIssue,
      {
        actorId: user.id,
        source: 'PARTNER_CONFIRM_CHECK_IN',
        previousStatus: issue.status,
        usedAt: now.toISOString(),
      },
    );

    await this.prisma.coupon.update({
      where: { id: issue.couponId },
      data: { usedCount: { increment: 1 } },
    });

    if (issue.booking) {
      await this.updateBookingStatusWithAudit({
        booking: issue.booking,
        nextStatus: 'CHECKED_IN',
        actorId: user.id,
        actorType: this.bookingActorTypeFor(user),
        action: 'BOOKING_STATUS_CHANGED',
        reason: 'Coupon check-in confirmed',
      });
    }

    return this.decoratePartnerCouponIssue(updatedIssue);
  }

  async listPartnerBills(user: AuthenticatedUser) {
    const storeIds = await this.accessService.getAccessibleStoreIds(
      user,
      'bill.partner.view',
    );

    return this.prisma.bill.findMany({
      where: {
        deletedAt: null,
        ...(storeIds ? { storeId: { in: storeIds } } : {}),
      },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        storeId: true,
        billNumber: true,
        status: true,
        submitterType: true,
        subtotalVnd: true,
        discountVnd: true,
        totalVnd: true,
        submittedAt: true,
        reviewedAt: true,
        verifiedAt: true,
        rejectedAt: true,
        reviewedById: true,
        verifiedById: true,
        rejectedById: true,
        rejectReason: true,
        usedAt: true,
        store: { select: { id: true, name: true, slug: true } },
        booking: { select: { id: true, status: true, scheduledAt: true } },
        coupon: { select: { id: true, code: true, name: true } },
        couponIssue: { select: { id: true, code: true, status: true } },
        media: {
          select: {
            id: true,
            storageKey: true,
            originalName: true,
            mimeType: true,
            access: true,
            url: true,
          },
        },
      },
    });
  }

  async listOperatorBills(user: AuthenticatedUser) {
    return this.listPartnerBills(user);
  }

  async listMemberBills(user: AuthenticatedUser) {
    return this.prisma.bill.findMany({
      where: {
        deletedAt: null,
        OR: [{ userId: user.id }, { submittedByUserId: user.id }],
      },
      orderBy: { submittedAt: 'desc' },
      select: {
        id: true,
        storeId: true,
        billNumber: true,
        status: true,
        submitterType: true,
        subtotalVnd: true,
        discountVnd: true,
        totalVnd: true,
        submittedAt: true,
        reviewedAt: true,
        verifiedAt: true,
        rejectedAt: true,
        reviewedById: true,
        verifiedById: true,
        rejectedById: true,
        rejectReason: true,
        usedAt: true,
        store: { select: { id: true, name: true, slug: true } },
        booking: { select: { id: true, status: true, scheduledAt: true } },
        coupon: { select: { id: true, code: true, name: true } },
        couponIssue: { select: { id: true, code: true, status: true } },
        media: {
          select: {
            id: true,
            storageKey: true,
            originalName: true,
            mimeType: true,
            access: true,
            url: true,
          },
        },
      },
    });
  }

  async listMemberNotifications(
    user: AuthenticatedUser,
    query: { limit?: string | number } = {},
  ) {
    const parsedLimit = Number(query.limit ?? 20);
    const take = Number.isFinite(parsedLimit)
      ? Math.min(Math.max(Math.trunc(parsedLimit), 1), 50)
      : 20;
    const where: Prisma.NotificationLogWhereInput = {
      userId: user.id,
      channel: 'IN_APP',
      status: { not: 'CANCELLED' },
      templateKey: { startsWith: 'customer.' },
    };
    const [items, unreadCount] = await Promise.all([
      this.prisma.notificationLog.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take,
        select: this.customerNotificationSelect(),
      }),
      this.prisma.notificationLog.count({
        where: {
          ...where,
          status: { notIn: ['SENT', 'CANCELLED'] },
        },
      }),
    ]);

    return {
      data: items.map((item) => this.toCustomerNotification(item)),
      unreadCount,
    };
  }

  async markMemberNotificationRead(
    user: AuthenticatedUser,
    notificationId: string,
  ) {
    const result = await this.prisma.notificationLog.updateMany({
      where: {
        id: notificationId,
        userId: user.id,
        channel: 'IN_APP',
        templateKey: { startsWith: 'customer.' },
      },
      data: {
        status: 'SENT',
        sentAt: new Date(),
      },
    });

    if (result.count === 0) {
      throw new NotFoundException('Notification not found');
    }

    return { id: notificationId, read: true };
  }

  async markAllMemberNotificationsRead(user: AuthenticatedUser) {
    const result = await this.prisma.notificationLog.updateMany({
      where: {
        userId: user.id,
        channel: 'IN_APP',
        templateKey: { startsWith: 'customer.' },
        status: { notIn: ['SENT', 'CANCELLED'] },
      },
      data: {
        status: 'SENT',
        sentAt: new Date(),
      },
    });

    return { updatedCount: result.count };
  }

  listMemberBookings(userId: string) {
    return this.prisma.booking.findMany({
      where: {
        userId,
        deletedAt: null,
      },
      orderBy: { scheduledAt: 'desc' },
      select: {
        id: true,
        status: true,
        scheduledAt: true,
        partySize: true,
        subtotalVnd: true,
        discountVnd: true,
        totalVnd: true,
        store: { select: { id: true, name: true, slug: true } },
        cast: {
          select: {
            id: true,
            slug: true,
            stageName: true,
            publicAlias: true,
          },
        },
        coupon: { select: { id: true, code: true, name: true } },
        couponIssue: { select: { id: true, code: true, status: true } },
        user: { select: { id: true, displayName: true, tier: true } },
        guest: { select: { id: true, displayName: true, phone: true } },
        note: true,
        createdAt: true,
      },
    });
  }

  async getMemberPointSummary(userId: string) {
    const now = new Date();
    const expiringSoonCutoff = new Date(now.getTime() + POINT_EXPIRING_SOON_MS);
    const ledgers = await this.prisma.pointLedger.findMany({
      where: {
        userId,
        status: 'POSTED',
      },
      orderBy: [{ postedAt: 'desc' }, { createdAt: 'desc' }],
      select: {
        id: true,
        type: true,
        amountVnd: true,
        points: true,
        billId: true,
        bookingId: true,
        description: true,
        expiresAt: true,
        postedAt: true,
        createdAt: true,
      },
    });

    let availablePoints = 0;
    let earnedPoints = 0;
    let spentPoints = 0;
    let expiredPoints = 0;
    let expiringSoonPoints = 0;

    for (const ledger of ledgers) {
      const points = Number.isFinite(ledger.points) ? ledger.points : 0;
      const isPositiveLedger =
        ledger.type === 'EARN' || (ledger.type === 'ADJUST' && points > 0);
      const isExpired =
        isPositiveLedger &&
        Boolean(ledger.expiresAt && ledger.expiresAt <= now);

      if (isExpired) {
        expiredPoints += Math.max(points, 0);
        continue;
      }

      if (ledger.type === 'EARN') {
        earnedPoints += points;
        availablePoints += points;
        if (ledger.expiresAt && ledger.expiresAt <= expiringSoonCutoff) {
          expiringSoonPoints += points;
        }
        continue;
      }

      if (ledger.type === 'ADJUST') {
        availablePoints += points;
        if (points >= 0) {
          earnedPoints += points;
          if (ledger.expiresAt && ledger.expiresAt <= expiringSoonCutoff) {
            expiringSoonPoints += points;
          }
        } else {
          spentPoints += Math.abs(points);
        }
        continue;
      }

      if (
        ledger.type === 'REDEEM' ||
        ledger.type === 'REVERSE' ||
        ledger.type === 'EXPIRE'
      ) {
        const pointsUsed = Math.abs(points);
        spentPoints += pointsUsed;
        availablePoints -= pointsUsed;
      }
    }

    availablePoints = Math.max(0, availablePoints);
    const nextTier =
      MEMBER_POINT_TIER_THRESHOLDS.find(
        (tier) => availablePoints < tier.points,
      ) ??
      MEMBER_POINT_TIER_THRESHOLDS[MEMBER_POINT_TIER_THRESHOLDS.length - 1];
    const pointsToNextTier = Math.max(nextTier.points - availablePoints, 0);
    const progressPercent = Math.min(
      100,
      Math.round((availablePoints / nextTier.points) * 100),
    );

    return {
      availablePoints,
      earnedPoints,
      spentPoints,
      expiredPoints,
      expiringSoonPoints,
      nextTierName: nextTier.name,
      nextTierThreshold: nextTier.points,
      pointsToNextTier,
      progressPercent,
      asOf: now.toISOString(),
      recentLedgers: ledgers.slice(0, 10).map((ledger) => ({
        id: ledger.id,
        type: ledger.type,
        billId: ledger.billId,
        bookingId: ledger.bookingId,
        amountVnd: ledger.amountVnd,
        points: ledger.points,
        description: ledger.description,
        expiresAt: ledger.expiresAt?.toISOString() ?? null,
        postedAt: ledger.postedAt?.toISOString() ?? null,
        createdAt: ledger.createdAt.toISOString(),
      })),
    };
  }

  async listMemberFavoriteCasts(userId: string) {
    const favorites = await this.prisma.memberFavoriteCast.findMany({
      where: {
        userId,
        cast: {
          deletedAt: null,
          status: 'ACTIVE',
          isPublic: true,
          store: {
            deletedAt: null,
            status: 'ACTIVE',
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        createdAt: true,
        cast: {
          select: {
            id: true,
            slug: true,
            stageName: true,
            publicAlias: true,
            publicHeadline: true,
            tags: true,
            languages: true,
            hourlyRateVnd: true,
            media: {
              where: {
                deletedAt: null,
                access: 'PUBLIC',
                status: 'READY',
                type: 'IMAGE',
              },
              orderBy: { createdAt: 'desc' },
              take: 1,
              select: { url: true },
            },
            store: {
              select: {
                id: true,
                name: true,
                slug: true,
                category: true,
                description: true,
                address: true,
                city: true,
                district: true,
                latitude: true,
                longitude: true,
                area: {
                  select: {
                    id: true,
                    code: true,
                    name: true,
                    city: true,
                    district: true,
                    ward: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    return favorites.map((favorite) => ({
      favoriteId: favorite.id,
      favoritedAt: favorite.createdAt,
      cast: this.mapPublicRelatedCast(favorite.cast, 'same-store'),
    }));
  }

  async getMemberCastFavoriteState(userId: string, slug: string) {
    const cast = await this.resolvePublicCastForMemberFavorite(slug);
    const favorite = await this.prisma.memberFavoriteCast.findUnique({
      where: {
        userId_castId: {
          userId,
          castId: cast.id,
        },
      },
      select: { id: true },
    });

    return {
      castId: cast.id,
      castSlug: cast.slug,
      favorited: Boolean(favorite),
    };
  }

  async favoriteMemberCast(user: AuthenticatedUser, slug: string) {
    const cast = await this.resolvePublicCastForMemberFavorite(slug);

    await this.prisma.memberFavoriteCast.upsert({
      where: {
        userId_castId: {
          userId: user.id,
          castId: cast.id,
        },
      },
      update: {},
      create: {
        userId: user.id,
        castId: cast.id,
      },
    });

    return {
      castId: cast.id,
      castSlug: cast.slug,
      favorited: true,
    };
  }

  async unfavoriteMemberCast(user: AuthenticatedUser, slug: string) {
    const cast = await this.resolvePublicCastForMemberFavorite(slug);

    await this.prisma.memberFavoriteCast.deleteMany({
      where: {
        userId: user.id,
        castId: cast.id,
      },
    });

    return {
      castId: cast.id,
      castSlug: cast.slug,
      favorited: false,
    };
  }

  @Cron('*/5 * * * *')
  async expireCouponIssuesEveryFiveMinutes() {
    const result = await this.expireIssuedCouponIssues({});
    if (result.count > 0) {
      this.logger.log(
        `Expired ${result.count} coupon issue(s) from scheduled maintenance.`,
      );
    }
    return result;
  }

  async listMemberCouponIssues(userId: string) {
    await this.expireIssuedCouponIssues({ userId });

    const issues = await this.prisma.couponIssue.findMany({
      where: {
        userId,
      },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        code: true,
        status: true,
        expiresAt: true,
        usedAt: true,
        metadata: true,
        coupon: {
          select: {
            id: true,
            code: true,
            name: true,
            discountType: true,
            discountValue: true,
            maxDiscountVnd: true,
            minSpendVnd: true,
            store: { select: { id: true, name: true, slug: true } },
          },
        },
      },
    });

    return Promise.all(issues.map((issue) => this.decorateCouponIssue(issue)));
  }

  async listAdminCouponIssues(query: AdminCouponIssueQueryDto = {}) {
    await this.expireIssuedCouponIssues({});

    const issues = await this.prisma.couponIssue.findMany({
      where: {
        ...(query.couponId ? { couponId: query.couponId } : {}),
        ...(query.status ? { status: query.status as CouponIssueStatus } : {}),
        coupon: {
          deletedAt: null,
          ...(query.storeId ? { storeId: query.storeId } : {}),
        },
      },
      orderBy: { createdAt: 'desc' },
      take: Math.min(query.limit ?? 50, 100),
      select: {
        id: true,
        code: true,
        guestId: true,
        userId: true,
        qrPayloadHash: true,
        status: true,
        expiresAt: true,
        usedAt: true,
        createdAt: true,
        metadata: true,
        user: { select: { id: true, displayName: true, tier: true } },
        guest: { select: { id: true, displayName: true } },
        scannedBy: { select: { id: true, displayName: true } },
        booking: { select: { id: true, status: true, scheduledAt: true } },
        bill: {
          select: {
            id: true,
            billNumber: true,
            status: true,
            totalVnd: true,
          },
        },
        coupon: {
          select: {
            id: true,
            code: true,
            name: true,
            discountType: true,
            discountValue: true,
            maxDiscountVnd: true,
            minSpendVnd: true,
            store: { select: { id: true, name: true, slug: true } },
          },
        },
      },
    });

    const auditLogsByIssueId = await this.listCouponIssueAuditLogs(
      issues.map((issue) => issue.id),
    );

    return Promise.all(
      issues.map(async (issue) => {
        const metadata = this.asRecord(issue.metadata);
        return {
          ...(await this.decorateCouponIssue(issue)),
          campaignSnapshot: this.asRecord(metadata?.campaignSnapshot) ?? null,
          auditLogs: auditLogsByIssueId.get(issue.id) ?? [],
        };
      }),
    );
  }

  previewBillOcr(user: AuthenticatedUser, dto: BillOcrPreviewDto) {
    const text = [dto.text, dto.fileName].filter(Boolean).join('\n');
    const amount = this.extractBillOcrAmount(text);
    const usedAt = this.extractBillOcrUsedAt(text);
    const normalizedText = text.trim().replace(/\s+/g, ' ');
    const warnings: string[] = [];

    if (!amount) {
      warnings.push('Không đọc được tổng tiền, cần nhập tay totalVnd.');
    } else if (amount < 50_000) {
      warnings.push(
        'Tổng tiền OCR thấp bất thường, cần kiểm tra lại bill gốc.',
      );
    } else if (amount > 500_000_000) {
      warnings.push('Tổng tiền OCR rất lớn, cần kiểm tra lại bill gốc.');
    }

    if (!usedAt) {
      warnings.push('Không đọc được ngày/giờ sử dụng, cần nhập tay usedAt.');
    } else if (usedAt.getTime() > Date.now()) {
      warnings.push('Thời gian OCR nằm trong tương lai, cần nhập lại usedAt.');
    } else if (Date.now() - usedAt.getTime() > BILL_SUBMISSION_DEADLINE_MS) {
      warnings.push('Thời gian OCR đã quá hạn nhận bill 10 ngày.');
    }

    if (!dto.text?.trim()) {
      warnings.push(
        'Chưa có text OCR từ file ảnh/PDF; hệ thống đang dùng tên file làm fallback.',
      );
    }

    const confidence =
      0.15 +
      (amount ? 0.45 : 0) +
      (usedAt ? 0.3 : 0) +
      (dto.text?.trim() ? 0.1 : 0);
    const confidenceScore = Math.min(0.95, Math.round(confidence * 100) / 100);

    return {
      phase: 'P2_OCR_PREVIEW',
      source: 'HEURISTIC_OCR_AI_MVP',
      model: 'rule-based-v1',
      actorId: user.id,
      input: {
        fileName: dto.fileName ?? null,
        textHash: normalizedText
          ? createHash('sha256').update(normalizedText).digest('hex')
          : null,
        hasExtractedText: Boolean(dto.text?.trim()),
      },
      suggestions: {
        totalVnd: amount,
        usedAt: usedAt?.toISOString() ?? null,
      },
      extractedFields: {
        totalVnd: {
          value: amount,
          confidence: amount ? 0.86 : 0,
          source: amount ? 'text_or_filename_amount_pattern' : 'not_found',
        },
        usedAt: {
          value: usedAt?.toISOString() ?? null,
          confidence: usedAt ? 0.76 : 0,
          source: usedAt ? 'text_or_filename_date_pattern' : 'not_found',
        },
      },
      confidence: confidenceScore,
      warnings,
      nextAction:
        warnings.length > 0 || confidenceScore < 0.75
          ? 'MANUAL_REVIEW'
          : 'CAN_PREFILL_FORM',
      requiresManualReview: warnings.length > 0,
    };
  }

  async revokeAdminCouponIssueQrToken(
    issueId: string,
    user: AuthenticatedUser,
  ) {
    const issue = await this.prisma.couponIssue.findUnique({
      where: { id: issueId },
      select: {
        id: true,
        code: true,
        couponId: true,
        qrPayloadHash: true,
        status: true,
        expiresAt: true,
        usedAt: true,
        metadata: true,
        coupon: {
          select: {
            id: true,
            code: true,
            name: true,
            discountType: true,
            discountValue: true,
            maxDiscountVnd: true,
            minSpendVnd: true,
            store: { select: { id: true, name: true, slug: true } },
          },
        },
      },
    });

    if (!issue) {
      throw new NotFoundException('Coupon issue not found');
    }

    if (issue.status !== 'ISSUED') {
      throw new UnprocessableEntityException(
        'Only issued coupon QR tokens can be revoked',
      );
    }

    const now = new Date();
    const metadata = this.asRecord(issue.metadata) ?? {};
    const nextMetadata = {
      ...metadata,
      qrRevokedAt: now.toISOString(),
      qrRevokedBy: user.id,
      revokedQrTokenHashes: this.mergeRevokedQrTokenHashes(metadata),
    };

    const updated = await this.prisma.couponIssue.update({
      where: { id: issue.id },
      data: {
        status: 'REVOKED',
        revokedAt: now,
        metadata: this.toPrismaJson(nextMetadata),
      },
      select: this.adminCouponIssueSelect(),
    });

    await this.writeCouponIssueAudit({
      action: 'COUPON_QR_TOKEN_REVOKED',
      issue: {
        ...updated,
        coupon: { storeId: updated.coupon.store?.id ?? null },
      },
      actorId: user.id,
      beforeJson: {
        id: issue.id,
        status: issue.status,
        qrPayloadHash: issue.qrPayloadHash,
      },
      afterJson: {
        id: updated.id,
        status: updated.status,
        qrPayloadHash: updated.qrPayloadHash,
      },
      metadata: {
        source: 'ADMIN_QR_COMPROMISE_RESPONSE',
        revokedAt: now.toISOString(),
      },
    });

    await this.recordCouponLifecycleEvent(
      'coupon.issue.qr_revoked.v1',
      updated,
      {
        actorId: user.id,
        source: 'ADMIN_QR_COMPROMISE_RESPONSE',
        revokedAt: now.toISOString(),
      },
    );

    return this.decorateAdminCouponIssue(updated);
  }

  async rotateAdminCouponIssueQrToken(
    issueId: string,
    user: AuthenticatedUser,
  ) {
    const issue = await this.prisma.couponIssue.findUnique({
      where: { id: issueId },
      select: this.adminCouponIssueSelect(),
    });

    if (!issue) {
      throw new NotFoundException('Coupon issue not found');
    }

    if (issue.status !== 'ISSUED') {
      throw new UnprocessableEntityException(
        'Only issued coupon QR tokens can be rotated',
      );
    }

    const now = new Date();
    const metadata = this.asRecord(issue.metadata) ?? {};
    const qrPayload = this.buildCouponQrPayload(issue.id);
    const qrTokenHash = this.buildCouponQrTokenHashFromPayload(qrPayload);
    const rotationCount =
      typeof metadata.qrRotationCount === 'number'
        ? metadata.qrRotationCount + 1
        : 1;
    const nextMetadata = {
      ...metadata,
      qrPayload,
      qrPayloadType: 'SIGNED_DEEP_LINK',
      qrTokenHash,
      qrRotatedAt: now.toISOString(),
      qrRotatedBy: user.id,
      qrRotationCount: rotationCount,
      revokedQrTokenHashes: this.mergeRevokedQrTokenHashes(metadata),
    };

    const updated = await this.prisma.couponIssue.update({
      where: { id: issue.id },
      data: {
        qrPayloadHash: this.buildCouponQrPayloadHash(qrPayload),
        metadata: this.toPrismaJson(nextMetadata),
      },
      select: this.adminCouponIssueSelect(),
    });

    await this.writeCouponIssueAudit({
      action: 'COUPON_QR_TOKEN_ROTATED',
      issue: {
        ...updated,
        coupon: { storeId: updated.coupon.store?.id ?? null },
      },
      actorId: user.id,
      beforeJson: {
        id: issue.id,
        status: issue.status,
        qrPayloadHash: issue.qrPayloadHash,
      },
      afterJson: {
        id: updated.id,
        status: updated.status,
        qrPayloadHash: updated.qrPayloadHash,
      },
      metadata: {
        source: 'ADMIN_QR_COMPROMISE_RESPONSE',
        rotatedAt: now.toISOString(),
        rotationCount,
      },
    });

    await this.recordCouponLifecycleEvent(
      'coupon.issue.qr_rotated.v1',
      updated,
      {
        actorId: user.id,
        source: 'ADMIN_QR_COMPROMISE_RESPONSE',
        rotatedAt: now.toISOString(),
        rotationCount,
      },
    );

    return this.decorateAdminCouponIssue(updated);
  }

  async submitMemberBill(user: AuthenticatedUser, dto: CreateBillDto) {
    const booking = dto.bookingId
      ? await this.prisma.booking.findFirst({
          where: {
            id: dto.bookingId,
            userId: user.id,
            deletedAt: null,
          },
          select: {
            id: true,
            status: true,
            userId: true,
            storeId: true,
            guestId: true,
            couponId: true,
            couponIssueId: true,
            scheduledAt: true,
            store: { select: { id: true, name: true, slug: true } },
            guest: { select: { id: true, displayName: true, phone: true } },
            coupon: { select: { id: true, code: true, name: true } },
            couponIssue: { select: { id: true, code: true, status: true } },
          },
        })
      : null;

    if (dto.bookingId && !booking) {
      throw new NotFoundException('Booking not found');
    }

    if (booking?.status === 'CANCELLED') {
      throw new UnprocessableEntityException(
        'Cancelled booking cannot submit a bill',
      );
    }

    if (booking?.id) {
      const existingBill = await this.prisma.bill.findFirst({
        where: {
          deletedAt: null,
          OR: [
            { bookingId: booking.id },
            ...(booking.couponIssueId
              ? [{ couponIssueId: booking.couponIssueId }]
              : []),
          ],
        },
        select: { id: true },
      });

      if (existingBill) {
        throw new UnprocessableEntityException(
          'Booking already has a submitted bill',
        );
      }
    }

    const store = booking?.store ?? (await this.resolveBillStore(dto));
    const couponLink = await this.resolveBillCouponLink({
      dto,
      booking,
      store,
      user,
    });
    const now = new Date();
    const usedAt = this.resolveBillUsedAt(dto);
    this.assertBillSubmissionWindow(usedAt, now);
    await this.assertBillSubmissionRateLimitAndDuplicate({
      submitterType: 'MEMBER',
      userId: user.id,
      submittedByUserId: user.id,
      storeId: store.id,
      totalVnd: dto.totalVnd,
      usedAt,
      now,
    });

    const bill = await this.prisma.bill.create({
      data: {
        bookingId: booking?.id ?? null,
        userId: user.id,
        guestId: booking?.guestId ?? null,
        storeId: store.id,
        couponId: couponLink.couponId,
        couponIssueId: couponLink.couponIssueId,
        submitterType: 'MEMBER',
        submittedByUserId: user.id,
        status: 'SUBMITTED',
        billNumber: this.buildBillNumber(now),
        subtotalVnd: dto.totalVnd,
        discountVnd: 0,
        serviceChargeVnd: 0,
        taxVnd: 0,
        totalVnd: dto.totalVnd,
        paidVnd: dto.totalVnd,
        usedAt,
        submittedAt: now,
      },
      select: this.billNotificationSelect(),
    });

    await this.recordBillSubmissionAudit({
      actorId: user.id,
      actorRole: user.role,
      billId: bill.id,
      submitterType: 'MEMBER',
      storeId: store.id,
      bookingId: booking?.id ?? null,
      couponId: couponLink.couponId ?? null,
      couponIssueId: couponLink.couponIssueId ?? null,
      submittedByUserId: user.id,
      submittedByPartnerAccountId: null,
      totalVnd: dto.totalVnd,
      usedAt,
      submittedAt: now,
    });
    await this.recordBillCouponLinkAudit({
      actorId: user.id,
      actorRole: user.role,
      billId: bill.id,
      storeId: store.id,
      bookingId: booking?.id ?? null,
      couponId: couponLink.couponId ?? null,
      couponIssueId: couponLink.couponIssueId ?? null,
      couponIssueStatus: couponLink.couponIssueStatus ?? null,
      source:
        booking?.couponId || booking?.couponIssueId ? 'booking' : 'direct',
    });
    await this.adminNotificationService?.notifyBillSubmitted(bill);
    await this.recordCustomerBillNotification(this.prisma, {
      templateKey: 'customer.bill.submitted.v1',
      userId: user.id,
      storeId: store.id,
      bookingId: booking?.id ?? null,
      billId: bill.id,
      bill,
      payload: {
        source: 'member_bill_submission',
        previousStatus: null,
        nextStatus: bill.status,
      },
    });
    if (couponLink.couponIssueId) {
      await this.recordCouponLifecycleEvent(
        'coupon.analytics.bill_submitted.v1',
        {
          id: couponLink.couponIssueId,
          code: couponLink.couponIssueCode ?? couponLink.couponIssueId,
          status: couponLink.couponIssueStatus ?? 'USED',
          userId: user.id,
          guestId: booking?.guestId,
          coupon: {
            id: couponLink.couponId ?? couponLink.couponIssueId,
            code: couponLink.coupon?.code ?? '',
            name: couponLink.coupon?.name ?? 'Coupon',
            store: {
              id: store.id,
              name: store.name,
              slug: store.slug,
            },
          },
        },
        {
          billId: bill.id,
          totalVnd: bill.totalVnd,
          bookingId: booking?.id ?? null,
        },
      );
    }

    return bill;
  }

  async submitPartnerBill(user: AuthenticatedUser, dto: CreateBillDto) {
    const booking = dto.bookingId
      ? await this.prisma.booking.findFirst({
          where: {
            id: dto.bookingId,
            deletedAt: null,
          },
          select: {
            id: true,
            status: true,
            userId: true,
            storeId: true,
            guestId: true,
            couponId: true,
            couponIssueId: true,
            scheduledAt: true,
            store: { select: { id: true, name: true, slug: true } },
            guest: { select: { id: true, displayName: true, phone: true } },
            coupon: { select: { id: true, code: true, name: true } },
            couponIssue: { select: { id: true, code: true, status: true } },
          },
        })
      : null;

    if (dto.bookingId && !booking) {
      throw new NotFoundException('Booking not found');
    }

    if (booking?.status === 'CANCELLED') {
      throw new UnprocessableEntityException(
        'Cancelled booking cannot submit a bill',
      );
    }

    if (booking?.id) {
      const existingBill = await this.prisma.bill.findFirst({
        where: {
          deletedAt: null,
          OR: [
            { bookingId: booking.id },
            ...(booking.couponIssueId
              ? [{ couponIssueId: booking.couponIssueId }]
              : []),
          ],
        },
        select: { id: true },
      });

      if (existingBill) {
        throw new UnprocessableEntityException(
          'Booking already has a submitted bill',
        );
      }
    }

    const store = booking?.store ?? (await this.resolveBillStore(dto));
    await this.accessService.ensureStoreAccess(
      user,
      store.id,
      'bill.partner.view',
    );
    const couponLink = await this.resolveBillCouponLink({
      dto,
      booking,
      store,
      user,
    });

    const now = new Date();
    const usedAt = this.resolveBillUsedAt(dto);
    this.assertBillSubmissionWindow(usedAt, now);
    const submitter = await this.resolvePartnerBillSubmitter(user);
    await this.assertBillSubmissionRateLimitAndDuplicate({
      submitterType: 'PARTNER',
      submittedByUserId: submitter.submittedByUserId,
      submittedByPartnerAccountId: submitter.submittedByPartnerAccountId,
      storeId: store.id,
      totalVnd: dto.totalVnd,
      usedAt,
      now,
    });

    const bill = await this.prisma.bill.create({
      data: {
        bookingId: booking?.id ?? null,
        userId: booking?.userId ?? couponLink.userId ?? null,
        guestId: booking?.guestId ?? couponLink.guestId ?? null,
        storeId: store.id,
        couponId: couponLink.couponId,
        couponIssueId: couponLink.couponIssueId,
        submitterType: 'PARTNER',
        submittedByUserId: submitter.submittedByUserId,
        submittedByPartnerAccountId: submitter.submittedByPartnerAccountId,
        status: 'SUBMITTED',
        billNumber: this.buildBillNumber(now),
        subtotalVnd: dto.totalVnd,
        discountVnd: 0,
        serviceChargeVnd: 0,
        taxVnd: 0,
        totalVnd: dto.totalVnd,
        paidVnd: dto.totalVnd,
        usedAt,
        submittedAt: now,
      },
      select: this.billNotificationSelect(),
    });

    await this.recordBillSubmissionAudit({
      actorId: user.id,
      actorRole: user.role,
      billId: bill.id,
      submitterType: 'PARTNER',
      storeId: store.id,
      bookingId: booking?.id ?? null,
      couponId: couponLink.couponId ?? null,
      couponIssueId: couponLink.couponIssueId ?? null,
      submittedByUserId: submitter.submittedByUserId,
      submittedByPartnerAccountId: submitter.submittedByPartnerAccountId,
      totalVnd: dto.totalVnd,
      usedAt,
      submittedAt: now,
    });
    await this.recordBillCouponLinkAudit({
      actorId: user.id,
      actorRole: user.role,
      billId: bill.id,
      storeId: store.id,
      bookingId: booking?.id ?? null,
      couponId: couponLink.couponId ?? null,
      couponIssueId: couponLink.couponIssueId ?? null,
      couponIssueStatus: couponLink.couponIssueStatus ?? null,
      source:
        booking?.couponId || booking?.couponIssueId ? 'booking' : 'direct',
    });
    await this.adminNotificationService?.notifyBillSubmitted(bill);
    return bill;
  }

  async createPartnerRequest(dto: CreatePartnerRequestDto) {
    const submittedAt = new Date();
    const requestId = `PARTNER-${randomUUID().slice(0, 8).toUpperCase()}`;
    const businessName = this.cleanRequiredText(
      dto.businessName,
      'businessName',
    );
    const area = this.cleanNullableText(dto.area);
    const storeName = this.cleanNullableText(dto.storeName) ?? businessName;
    const storeDescription =
      this.cleanNullableText(dto.storeDescription) ??
      this.cleanNullableText(dto.note);
    const openingHours = this.cleanNullableText(dto.openingHours);
    const menuSummary = this.cleanNullableText(dto.menuSummary);
    const mediaUrls = this.cleanStringArray(dto.mediaUrls, 12);
    const castProfiles = this.normalizePartnerRequestCasts(dto.castProfiles);
    const category = this.normalizePartnerRequestCategory(
      dto.storeCategory ?? dto.businessType,
    );
    const contactName = this.cleanRequiredText(dto.contactName, 'contactName');
    const contactPhone = this.cleanRequiredText(
      dto.contactPhone,
      'contactPhone',
    );
    const contactEmail = this.cleanEmail(dto.contactEmail) || null;
    const businessType = this.cleanText(dto.businessType) || null;
    const note = this.cleanText(dto.note) || null;
    const storeAddress = this.cleanNullableText(dto.storeAddress);
    const storeCity = this.cleanNullableText(dto.storeCity);
    const storeDistrict = this.cleanNullableText(dto.storeDistrict);

    const request = await this.prisma.$transaction(async (tx) => {
      const store = await tx.store.create({
        data: {
          name: storeName,
          slug: this.buildPartnerRequestSlug(storeName, requestId),
          category,
          description: storeDescription,
          address: storeAddress,
          city:
            storeCity ?? this.partnerCityFromArea(area) ?? 'Ho Chi Minh City',
          district: storeDistrict ?? this.partnerDistrictFromArea(area),
          phone: contactPhone,
          openingHours: openingHours
            ? this.toPrismaJson({ summary: openingHours })
            : undefined,
          status: 'PENDING_REVIEW',
        },
        select: { id: true, name: true, slug: true, status: true },
      });

      const draftCastIds: string[] = [];
      const draftMediaIds: string[] = [];
      const draftContentIds: string[] = [];

      for (const [index, castProfile] of castProfiles.entries()) {
        const cast = await tx.cast.create({
          data: {
            storeId: store.id,
            stageName: castProfile.stageName,
            slug: this.buildPartnerRequestSlug(
              castProfile.stageName,
              requestId,
              `cast-${index + 1}`,
            ),
            bio: castProfile.bio,
            publicBio: castProfile.bio,
            tags: castProfile.tags,
            languages: castProfile.languages,
            hourlyRateVnd: castProfile.hourlyRateVnd,
            isPublic: false,
            status: 'DRAFT',
          },
          select: { id: true },
        });
        draftCastIds.push(cast.id);

        for (const [mediaIndex, url] of castProfile.mediaUrls.entries()) {
          const media = await this.createPartnerRequestMedia(
            {
              requestId,
              url,
              index: mediaIndex,
              castId: cast.id,
              purpose: 'PARTNER_REQUEST_CAST',
            },
            tx,
          );
          draftMediaIds.push(media.id);
        }
      }

      for (const [index, url] of mediaUrls.entries()) {
        const media = await this.createPartnerRequestMedia(
          {
            requestId,
            url,
            index,
            storeId: store.id,
            purpose: 'PARTNER_REQUEST_STORE',
          },
          tx,
        );
        draftMediaIds.push(media.id);
      }

      if (menuSummary) {
        const content = await tx.content.create({
          data: {
            storeId: store.id,
            title: `${storeName} menu draft`,
            slug: this.buildPartnerRequestSlug(
              `${storeName} menu`,
              requestId,
              'menu',
            ),
            type: 'STORE_POST',
            status: 'DRAFT',
            excerpt: `Draft menu from ${requestId}`,
            body: menuSummary,
            metadata: this.toPrismaJson({ partnerRequestId: requestId }),
          },
          select: { id: true },
        });
        draftContentIds.push(content.id);
      }

      return tx.partnerRequest.create({
        data: {
          id: requestId,
          storeId: store.id,
          status: 'PENDING_REVIEW',
          businessName,
          businessType,
          area,
          contactName,
          contactPhone,
          contactEmail,
          note,
          storeDescription,
          storeAddress,
          storeCity,
          storeDistrict,
          openingHours,
          menuSummary,
          mediaUrls,
          castProfiles: castProfiles.length
            ? (castProfiles as unknown as Prisma.InputJsonValue)
            : Prisma.JsonNull,
          draftCastIds,
          draftMediaIds,
          draftContentIds,
          publicState: 'HIDDEN',
          submittedAt,
        },
        select: this.partnerRequestSelect(),
      });
    });

    await this.notifyPartnerRequestDelivery(
      request as unknown as PartnerRequestCmsRecord,
    );

    return {
      id: request.id,
      status: 'PENDING_REVIEW',
      submittedAt,
      draft: {
        storeId: request.store.id,
        storeName: request.store.name,
        storeSlug: request.store.slug,
        castCount: request.draftCastIds.length,
        mediaCount: request.draftMediaIds.length,
        contentCount: request.draftContentIds.length,
      },
      message: 'Partner request submitted for admin review',
    };
  }

  async listAdminPartnerRequests(query: AdminPartnerRequestQueryDto = {}) {
    const page = Math.max(1, query.page ?? 1);
    const limit = Math.min(Math.max(1, query.limit ?? 50), 100);
    const where = this.buildAdminPartnerRequestWhere(query);

    const requests = await this.prisma.partnerRequest.findMany({
      where,
      orderBy: { submittedAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
      select: this.partnerRequestSelect(),
    });

    return requests.map((request) =>
      this.mapPartnerRequestRecord(
        request as unknown as PartnerRequestCmsRecord,
      ),
    );
  }

  async reviewPartnerRequest(
    adminId: string,
    requestId: string,
    dto: ReviewPartnerRequestDto,
  ) {
    const reason = this.cleanRequiredText(dto.reason, 'reason');
    const lookup = this.cleanRequiredText(requestId, 'requestId');
    const now = new Date();
    const nextStatus: PartnerRequestReviewStatus = dto.approve
      ? 'APPROVED'
      : 'REJECTED';
    const reviewAction = dto.approve
      ? 'PARTNER_REQUEST_APPROVED'
      : 'PARTNER_REQUEST_REJECTED';

    const reviewed = await this.prisma.$transaction(async (tx) => {
      const request = await this.findPartnerRequest(lookup, tx);

      if (!request) {
        throw new NotFoundException('Partner request not found');
      }

      const statusUpdate = await tx.partnerRequest.updateMany({
        where: { id: request.id, status: 'PENDING_REVIEW' },
        data: {
          status: nextStatus,
          reviewReason: reason,
          reviewedAt: now,
          reviewedById: adminId,
          publicState: dto.approve ? 'PUBLIC' : 'HIDDEN',
        },
      });

      if (statusUpdate.count !== 1) {
        throw new UnprocessableEntityException(
          'Partner request has already been reviewed',
        );
      }

      const onboarding = dto.approve
        ? await this.ensurePartnerOnboarding(tx, request)
        : null;
      const listingStoreUpdate = dto.approve
        ? await this.partnerListingStoreUpdateFromRequest(tx, request)
        : {};

      if (dto.approve) {
        await tx.store.update({
          where: { id: request.store.id },
          data: {
            ...listingStoreUpdate,
            status: 'ACTIVE',
            ownerId: onboarding?.userId,
            partnerAccountId: onboarding?.partnerAccountId,
          },
          select: { id: true },
        });
        if (request.draftCastIds.length) {
          await tx.cast.updateMany({
            where: { id: { in: request.draftCastIds } },
            data: { status: 'ACTIVE', isPublic: true },
          });
        }
        if (request.draftMediaIds.length) {
          await tx.media.updateMany({
            where: { id: { in: request.draftMediaIds } },
            data: { status: 'READY', access: 'PUBLIC' },
          });
        }
        if (request.draftContentIds.length) {
          await tx.content.updateMany({
            where: { id: { in: request.draftContentIds } },
            data: { status: 'PUBLISHED', publishedAt: now },
          });
        }
      } else {
        await tx.store.update({
          where: { id: request.store.id },
          data: { status: 'DRAFT' },
          select: { id: true },
        });
        if (request.draftCastIds.length) {
          await tx.cast.updateMany({
            where: { id: { in: request.draftCastIds } },
            data: { status: 'DRAFT', isPublic: false },
          });
        }
        if (request.draftMediaIds.length) {
          await tx.media.updateMany({
            where: { id: { in: request.draftMediaIds } },
            data: { status: 'HIDDEN', access: 'PROTECTED' },
          });
        }
        if (request.draftContentIds.length) {
          await tx.content.updateMany({
            where: { id: { in: request.draftContentIds } },
            data: { status: 'DRAFT', publishedAt: null },
          });
        }
      }

      const afterJson = this.partnerRequestAuditJson({
        ...request,
        status: nextStatus,
        reviewReason: reason,
        reviewedAt: now,
        reviewedById: adminId,
        partnerUserId: onboarding?.userId ?? request.partnerUserId,
        partnerAccountId:
          onboarding?.partnerAccountId ?? request.partnerAccountId,
        publicState: dto.approve ? 'PUBLIC' : 'HIDDEN',
      });

      await tx.auditLog.create({
        data: {
          actorId: adminId,
          action: reviewAction,
          targetType: 'PARTNER_REQUEST',
          targetId: request.id,
          metadata: this.toPrismaJson(
            this.buildMinimalSensitiveMetadata({
              actorId: adminId,
              action: reviewAction,
              refType: 'PARTNER_REQUEST',
              refId: request.id,
              occurredAt: now,
              metadata: {
                reason,
                approve: dto.approve,
                draftStoreId: request.store.id,
                draftCastIds: request.draftCastIds,
                draftMediaIds: request.draftMediaIds,
                draftContentIds: request.draftContentIds,
                partnerUserId: onboarding?.userId ?? null,
                partnerAccountId: onboarding?.partnerAccountId ?? null,
                temporaryPasswordIssued: Boolean(onboarding?.temporaryPassword),
              },
            }),
          ),
          beforeJson: this.partnerRequestAuditJson(request),
          afterJson,
        },
      });

      await this.recordSensitiveActionNotification(tx, {
        actorId: adminId,
        action: reviewAction,
        refType: 'PARTNER_REQUEST',
        refId: request.id,
        occurredAt: now,
        templateKey: 'audit.partner_request.review.v1',
        recipient: `partnerRequest:${request.id}`,
        storeId: request.store.id,
        payload: {
          status: nextStatus,
          reason,
          approve: dto.approve,
          draftStoreId: request.store.id,
        },
      });

      if (request.notificationLog) {
        await tx.notificationLog.update({
          where: { id: request.notificationLog.id },
          data: {
            payload: this.toPrismaJson({
              ...this.partnerRequestNotificationPayload(request),
              status: nextStatus,
              reviewReason: reason,
              reviewedAt: now.toISOString(),
              reviewedById: adminId,
              partnerUserId: onboarding?.userId ?? null,
              partnerAccountId: onboarding?.partnerAccountId ?? null,
              publicState: dto.approve ? 'PUBLIC' : 'HIDDEN',
            }),
          },
        });
      }

      if (onboarding) {
        await tx.partnerRequest.update({
          where: { id: request.id },
          data: {
            partnerUserId: onboarding.userId,
            partnerAccountId: onboarding.partnerAccountId,
          },
          select: { id: true },
        });
      }

      return tx.partnerRequest.findUniqueOrThrow({
        where: { id: request.id },
        select: this.partnerRequestSelect(),
      });
    });

    return this.mapPartnerRequestRecord(
      reviewed as unknown as PartnerRequestCmsRecord,
    );
  }

  async listSensitiveBillsForAdmin(
    user: AuthenticatedUser,
    query: AdminSensitiveBillQueryDto = {},
  ) {
    const where: Prisma.BillWhereInput = {
      deletedAt: null,
      status: { in: ['SUBMITTED', 'PENDING_PM_BA', 'REJECTED'] },
    };
    const bookingId = this.cleanText(query.bookingId);
    const couponId = this.cleanText(query.couponId);
    const couponIssueId = this.cleanText(query.couponIssueId);

    if (bookingId) {
      where.bookingId = bookingId;
    }

    if (couponId) {
      where.couponId = couponId;
    }

    if (couponIssueId) {
      where.couponIssueId = couponIssueId;
    }

    const bills = await this.prisma.bill.findMany({
      where,
      orderBy: { submittedAt: 'desc' },
      select: {
        id: true,
        billNumber: true,
        storeId: true,
        status: true,
        submitterType: true,
        subtotalVnd: true,
        discountVnd: true,
        serviceChargeVnd: true,
        taxVnd: true,
        totalVnd: true,
        paidVnd: true,
        commissionAmountVnd: true,
        pointsEarned: true,
        discountRuleSnapshot: true,
        commissionRuleSnapshot: true,
        pointRuleSnapshot: true,
        submittedAt: true,
        reviewedAt: true,
        verifiedAt: true,
        rejectedAt: true,
        reviewedById: true,
        verifiedById: true,
        rejectedById: true,
        rejectReason: true,
        usedAt: true,
        store: { select: { id: true, name: true, slug: true } },
        booking: { select: { id: true, status: true, scheduledAt: true } },
        coupon: {
          select: { id: true, code: true, name: true, minSpendVnd: true },
        },
        couponIssue: { select: { id: true, code: true, status: true } },
        user: {
          select: {
            id: true,
            email: true,
            displayName: true,
            phone: true,
            tier: true,
          },
        },
        guest: {
          select: {
            id: true,
            displayName: true,
            phone: true,
            email: true,
          },
        },
        media: {
          select: {
            id: true,
            storageKey: true,
            originalName: true,
            mimeType: true,
            access: true,
            url: true,
          },
        },
      },
    });

    const billsWithFraudWarnings = await Promise.all(
      bills.map(async (bill) => ({
        ...bill,
        fraudWarnings: await this.buildBillFraudWarnings(bill),
      })),
    );

    return billsWithFraudWarnings.map((bill) =>
      this.maskSensitiveBillForRole(this.withBillRevenueAliases(bill), user),
    );
  }

  private async buildBillFraudWarnings(bill: {
    id: string;
    billNumber?: string | null;
    storeId?: string | null;
    totalVnd?: number | null;
    usedAt?: Date | null;
    booking?: { id: string; scheduledAt?: Date | null } | null;
    coupon?: { id: string; code: string; minSpendVnd?: number | null } | null;
    couponIssue?: { id: string; code: string; status: string } | null;
    media?: Array<{
      id: string;
      access?: string | null;
      originalName?: string | null;
      mimeType?: string | null;
    }> | null;
  }) {
    const warnings: Array<{
      code: string;
      severity: 'LOW' | 'MEDIUM' | 'HIGH';
      message: string;
      evidence?: Record<string, unknown>;
    }> = [];

    if (!bill.media?.length) {
      warnings.push({
        code: 'NO_EVIDENCE_MEDIA',
        severity: bill.booking || bill.couponIssue ? 'MEDIUM' : 'HIGH',
        message: 'Bill chưa có ảnh/PDF chứng từ đính kèm.',
      });
    }

    if (bill.media?.some((media) => media.access !== 'PROTECTED')) {
      warnings.push({
        code: 'EVIDENCE_NOT_PROTECTED',
        severity: 'MEDIUM',
        message: 'Chứng từ bill không ở chế độ PROTECTED.',
      });
    }

    const suspiciousEvidence = bill.media?.find((media) => {
      const originalName = media.originalName ?? '';
      const mimeType = media.mimeType ?? '';
      const normalizedName = originalName
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '');

      return (
        (Boolean(mimeType) &&
          !mimeType.startsWith('image/') &&
          mimeType !== 'application/pdf') ||
        /(fake|sample|demo|test|template|mau|gia|sua-bill|bill-gia)/i.test(
          normalizedName,
        )
      );
    });

    if (suspiciousEvidence) {
      warnings.push({
        code: 'SUSPICIOUS_EVIDENCE_FILE',
        severity: 'HIGH',
        message:
          'Chứng từ bill có dấu hiệu là file mẫu/test hoặc không đúng định dạng bill.',
        evidence: {
          mediaId: suspiciousEvidence.id,
          originalName: suspiciousEvidence.originalName ?? null,
          mimeType: suspiciousEvidence.mimeType ?? null,
        },
      });
    }

    if (
      typeof bill.totalVnd === 'number' &&
      typeof bill.coupon?.minSpendVnd === 'number' &&
      bill.coupon.minSpendVnd > 0 &&
      bill.totalVnd < bill.coupon.minSpendVnd
    ) {
      warnings.push({
        code: 'TOTAL_BELOW_MIN_SPEND',
        severity: 'HIGH',
        message: 'Tổng bill thấp hơn min spend của mã giảm giá.',
        evidence: {
          totalVnd: bill.totalVnd,
          minSpendVnd: bill.coupon.minSpendVnd,
          couponCode: bill.coupon.code,
        },
      });
    }

    if (bill.booking?.scheduledAt && bill.usedAt) {
      const driftHours =
        Math.abs(bill.usedAt.getTime() - bill.booking.scheduledAt.getTime()) /
        3_600_000;
      if (driftHours > 12) {
        warnings.push({
          code: 'USED_AT_BOOKING_DRIFT',
          severity: 'MEDIUM',
          message: 'Thời gian sử dụng lệch xa lịch booking.',
          evidence: { driftHours: Math.round(driftHours * 10) / 10 },
        });
      }
    }

    if (
      bill.storeId &&
      bill.usedAt &&
      typeof bill.totalVnd === 'number' &&
      bill.totalVnd > 0
    ) {
      const duplicates = await this.prisma.bill.findMany({
        where: {
          id: { not: bill.id },
          deletedAt: null,
          storeId: bill.storeId,
          totalVnd: bill.totalVnd,
          status: { not: 'VOIDED' },
          usedAt: {
            gte: new Date(
              bill.usedAt.getTime() - BILL_FRAUD_DUPLICATE_WINDOW_MS,
            ),
            lte: new Date(
              bill.usedAt.getTime() + BILL_FRAUD_DUPLICATE_WINDOW_MS,
            ),
          },
        },
        select: { id: true, billNumber: true, status: true },
        take: 3,
      });

      if (duplicates.length) {
        warnings.push({
          code: 'POSSIBLE_DUPLICATE_BILL',
          severity: 'HIGH',
          message:
            'Có bill khác cùng quán, cùng tổng tiền, gần cùng thời gian.',
          evidence: {
            duplicateBills: duplicates.map((item) => ({
              id: item.id,
              billNumber: item.billNumber,
              status: item.status,
            })),
          },
        });
      }
    }

    return warnings;
  }

  async getAdminRevenueReport(
    user: AuthenticatedUser,
    query: AdminRevenueReportQueryDto = {},
  ) {
    void user;
    const reportWindow = this.resolveAdminRevenueReportWindow(query);
    const { from, to } = reportWindow;
    const where: Prisma.BillWhereInput = {
      deletedAt: null,
      status: { in: [...REVENUE_REPORT_BILL_STATUSES] },
      usedAt: { gte: from, lte: to },
    };
    const storeId = this.cleanText(query.storeId);
    const couponId = this.cleanText(query.couponId);
    const flag = this.cleanText(query.flag);
    const partnerAccountId = this.cleanText(query.partnerAccountId);
    const areaId = this.cleanText(query.areaId);
    const castId = this.cleanText(query.castId);

    if (storeId) {
      where.storeId = storeId;
    }

    if (couponId) {
      where.couponId = couponId;
    }

    if (flag) {
      where.commissionRuleSnapshot = {
        path: ['flags'],
        array_contains: [flag],
      };
    }

    if (partnerAccountId || areaId) {
      where.store = {
        ...(partnerAccountId ? { partnerAccountId } : {}),
        ...(areaId ? { areaId } : {}),
      };
    }

    if (castId) {
      where.booking = { castId };
    }

    const bills = await this.prisma.bill.findMany({
      where,
      orderBy: [{ usedAt: 'asc' }, { storeId: 'asc' }, { couponId: 'asc' }],
      select: {
        id: true,
        billNumber: true,
        status: true,
        usedAt: true,
        subtotalVnd: true,
        discountVnd: true,
        serviceChargeVnd: true,
        taxVnd: true,
        totalVnd: true,
        paidVnd: true,
        commissionAmountVnd: true,
        store: {
          select: {
            id: true,
            name: true,
            slug: true,
            city: true,
            district: true,
            partnerAccount: {
              select: { id: true, businessName: true, status: true },
            },
            area: {
              select: {
                id: true,
                code: true,
                name: true,
                city: true,
                district: true,
              },
            },
          },
        },
        coupon: { select: { id: true, code: true, name: true } },
        couponIssue: { select: { id: true, code: true, status: true } },
        booking: {
          select: {
            id: true,
            cast: { select: { id: true, stageName: true, slug: true } },
          },
        },
      },
    });

    const totals = this.emptyRevenueReportTotals();
    const days = new Map<string, MutableRevenueReportDayNode>();
    const breakdownMaps = this.emptyRevenueReportBreakdownMaps();

    for (const bill of bills) {
      if (!bill.usedAt) {
        continue;
      }

      const money = this.billRevenueReportMoney(bill);
      this.addRevenueReportTotals(totals, money);
      this.addRevenueReportBreakdown(
        breakdownMaps.stores,
        this.revenueReportStoreDimension(bill.store),
        money,
      );
      this.addRevenueReportBreakdown(
        breakdownMaps.partners,
        this.revenueReportPartnerDimension(bill.store),
        money,
      );
      this.addRevenueReportBreakdown(
        breakdownMaps.campaigns,
        this.revenueReportCampaignDimension(bill),
        money,
      );
      this.addRevenueReportBreakdown(
        breakdownMaps.coupons,
        this.revenueReportCampaignDimension(bill),
        money,
      );
      this.addRevenueReportBreakdown(
        breakdownMaps.areas,
        this.revenueReportAreaDimension(bill.store),
        money,
      );
      this.addRevenueReportBreakdown(
        breakdownMaps.casts,
        this.revenueReportCastDimension(bill),
        money,
      );

      const day = this.getRevenueReportDay(
        days,
        this.toRevenueReportDateKey(
          bill.usedAt,
          reportWindow.timezoneOffsetMinutes,
        ),
      );
      this.addRevenueReportTotals(day, money);

      const store = this.getRevenueReportStore(day, bill.store);
      this.addRevenueReportTotals(store, money);

      const coupon = this.getRevenueReportCoupon(store, bill);
      this.addRevenueReportTotals(coupon, money);
      coupon.bills.push({
        id: bill.id,
        billNumber: bill.billNumber ?? null,
        status: bill.status,
        usedAt: bill.usedAt.toISOString(),
        ...money,
      });
    }

    return {
      filters: {
        from: from.toISOString(),
        to: to.toISOString(),
        fromDate: reportWindow.fromDate,
        toDate: reportWindow.toDate,
        timezone: reportWindow.timezone,
        dateField: 'usedAt',
        statusIn: [...REVENUE_REPORT_BILL_STATUSES],
        billStatusIncluded: [...REVENUE_REPORT_BILL_STATUSES],
        storeId: storeId || null,
        couponId: couponId || null,
        flag: flag || null,
        partnerAccountId: partnerAccountId || null,
        areaId: areaId || null,
        castId: castId || null,
        exportEnabled: true,
        exportFormats: ['excel', 'pdf'],
      },
      meta: {
        billStatusIncluded: [...REVENUE_REPORT_BILL_STATUSES],
        timezone: reportWindow.timezone,
        generatedAt: new Date().toISOString(),
        exportEnabled: true,
        exportFormats: ['excel', 'pdf'],
        formula: {
          grossVnd: 'subtotalVnd',
          discountVnd: 'discountVnd',
          netVnd: 'subtotalVnd - discountVnd',
          payableVnd: 'netVnd + serviceChargeVnd + taxVnd',
          commissionVnd: 'commissionAmountVnd',
        },
      },
      totals,
      days: Array.from(days.values()).map((day) => ({
        date: day.date,
        billCount: day.billCount,
        grossVnd: day.grossVnd,
        discountVnd: day.discountVnd,
        netVnd: day.netVnd,
        payableVnd: day.payableVnd,
        commissionVnd: day.commissionVnd,
        stores: Array.from(day.stores.values()).map((store) => ({
          store: store.store,
          billCount: store.billCount,
          grossVnd: store.grossVnd,
          discountVnd: store.discountVnd,
          netVnd: store.netVnd,
          payableVnd: store.payableVnd,
          commissionVnd: store.commissionVnd,
          coupons: Array.from(store.coupons.values()).map((coupon) => ({
            coupon: coupon.coupon,
            billCount: coupon.billCount,
            grossVnd: coupon.grossVnd,
            discountVnd: coupon.discountVnd,
            netVnd: coupon.netVnd,
            payableVnd: coupon.payableVnd,
            commissionVnd: coupon.commissionVnd,
            bills: coupon.bills,
          })),
        })),
      })),
      breakdowns: this.finalizeRevenueReportBreakdowns(breakdownMaps),
      funnel: await this.buildRevenueReportFunnel(query, reportWindow, totals),
      comparison: await this.buildRevenueReportComparison(
        query,
        reportWindow,
        where,
        totals,
      ),
    };
  }

  async listAdminCommissionOverrides(
    query: AdminCommissionOverrideQueryDto = {},
  ) {
    const storeId = this.cleanText(query.storeId);
    const couponId = this.cleanText(query.couponId);
    const configs = await this.prisma.commissionConfig.findMany({
      where: {
        status: 'ACTIVE',
        ...(storeId ? { storeId } : {}),
      },
      orderBy: [{ storeId: 'asc' }, { activeFrom: 'desc' }],
      select: {
        id: true,
        storeId: true,
        commissionType: true,
        commissionValue: true,
        ruleSnapshot: true,
        activeFrom: true,
        activeTo: true,
        store: { select: { id: true, name: true, slug: true } },
      },
    });

    const data = configs.flatMap((config) =>
      this.readCampaignCommissionOverrides(
        this.asRecord(config.ruleSnapshot) ?? {},
      )
        .filter((override) => !couponId || override.couponId === couponId)
        .map((override) => ({
          ...override,
          commissionConfig: {
            id: config.id,
            storeId: config.storeId,
            commissionType: config.commissionType,
            commissionValue: config.commissionValue,
            activeFrom: config.activeFrom.toISOString(),
            activeTo: config.activeTo?.toISOString() ?? null,
          },
          store: config.store,
        })),
    );

    return {
      data,
      meta: {
        total: data.length,
        storeId: storeId || null,
        couponId: couponId || null,
      },
    };
  }

  async createAdminCommissionOverride(
    adminId: string,
    dto: CreateCommissionOverrideDto,
  ) {
    return this.upsertAdminCommissionOverride(adminId, dto.storeId, dto);
  }

  async updateAdminCommissionOverride(
    adminId: string,
    storeId: string,
    couponId: string,
    dto: UpdateCommissionOverrideDto,
  ) {
    return this.upsertAdminCommissionOverride(adminId, storeId, {
      ...dto,
      couponId,
    });
  }

  async deleteAdminCommissionOverride(
    adminId: string,
    storeId: string,
    couponId: string,
  ) {
    return this.upsertAdminCommissionOverride(adminId, storeId, {
      couponId,
      active: false,
      note: 'Disabled by admin',
    });
  }

  async previewSensitiveBillApproval(adminId: string, billId: string) {
    void adminId;
    const bill = await this.findSensitiveBillForReview(billId);

    if (!['SUBMITTED', 'PENDING_PM_BA'].includes(bill.status)) {
      throw new UnprocessableEntityException(
        'Only submitted or pending PM/BA bills can be previewed',
      );
    }

    const previewedAt = new Date();
    const revenueApproval = await this.buildBillRevenueApprovalSnapshot(
      bill,
      previewedAt,
    );
    const flags = this.extractSnapshotFlags(
      revenueApproval.commissionRuleSnapshot,
    );
    const requiresPmBaConfirmation = flags.includes(NEGATIVE_COMMISSION_FLAG);
    const loyaltyAward = this.buildBillLoyaltyAward(
      {
        ...bill,
        subtotalVnd: revenueApproval.grossVnd,
        totalVnd: revenueApproval.netVnd,
        paidVnd: revenueApproval.payableVnd,
      },
      previewedAt,
    );

    return {
      bill: this.withBillRevenueAliases(bill),
      preview: {
        ruleVersion: BILL_REVENUE_RULE_VERSION,
        previewedAt: previewedAt.toISOString(),
        nextStatus: requiresPmBaConfirmation ? 'PENDING_PM_BA' : 'VERIFIED',
        requiresPmBaConfirmation,
        pmBaConfirmationReason:
          typeof revenueApproval.commissionRuleSnapshot
            .pmBaConfirmationReason === 'string'
            ? revenueApproval.commissionRuleSnapshot.pmBaConfirmationReason
            : null,
        flags,
        grossRevenueVnd: revenueApproval.grossVnd,
        discountVnd: revenueApproval.discountVnd,
        netRevenueVnd: revenueApproval.netVnd,
        payableVnd: revenueApproval.payableVnd,
        commissionAmountVnd: revenueApproval.commissionVnd,
        loyaltyPoints: loyaltyAward?.points ?? 0,
        loyaltyExpiresAt: loyaltyAward?.expiresAt.toISOString() ?? null,
        discountRuleSnapshot: revenueApproval.discountRuleSnapshot,
        commissionRuleSnapshot: revenueApproval.commissionRuleSnapshot,
      },
    };
  }

  async reviewSensitiveBill(
    adminId: string,
    billId: string,
    dto: ReviewBillDto,
  ) {
    const bill = await this.findSensitiveBillForReview(billId);

    if (bill.status === 'VERIFIED') {
      throw new UnprocessableEntityException('Bill has already been verified');
    }

    if (bill.status === 'PAID' || bill.status === 'VOIDED') {
      throw new UnprocessableEntityException(
        'Paid or voided bills cannot be reviewed',
      );
    }

    if (!['SUBMITTED', 'PENDING_PM_BA'].includes(bill.status)) {
      throw new UnprocessableEntityException(
        'Bill is not in a reviewable status',
      );
    }

    const now = new Date();
    const revenueApproval = dto.approve
      ? await this.buildBillRevenueApprovalSnapshot(bill, now)
      : null;
    const revenueFlags = revenueApproval
      ? this.extractSnapshotFlags(revenueApproval.commissionRuleSnapshot)
      : [];
    const requiresPmBaConfirmation = revenueFlags.includes(
      NEGATIVE_COMMISSION_FLAG,
    );
    const pmBaReason = this.cleanText(dto.pmBaReason);
    const nextApproveStatus =
      dto.approve && requiresPmBaConfirmation && !dto.confirmNegativeCommission
        ? 'PENDING_PM_BA'
        : 'VERIFIED';
    const reviewAction = dto.approve
      ? nextApproveStatus === 'PENDING_PM_BA'
        ? 'bill.review.pending_pm_ba'
        : 'bill.review.approve'
      : 'bill.review.reject';

    if (
      dto.approve &&
      requiresPmBaConfirmation &&
      dto.confirmNegativeCommission &&
      !pmBaReason
    ) {
      throw new BadRequestException(
        'PM/BA confirmation reason is required for negative commission approval',
      );
    }

    const reviewedCommissionSnapshot =
      revenueApproval?.commissionRuleSnapshot && dto.approve
        ? this.decorateBillCommissionReviewSnapshot(
            revenueApproval.commissionRuleSnapshot,
            {
              status: nextApproveStatus,
              reviewedAt: now,
              reviewedById: adminId,
              confirmNegativeCommission:
                Boolean(dto.confirmNegativeCommission) &&
                requiresPmBaConfirmation,
              pmBaReason,
            },
          )
        : null;
    const loyaltyAward =
      dto.approve && nextApproveStatus === 'VERIFIED'
        ? this.buildBillLoyaltyAward(
            revenueApproval
              ? {
                  ...bill,
                  subtotalVnd: revenueApproval.grossVnd,
                  totalVnd: revenueApproval.netVnd,
                  paidVnd: revenueApproval.payableVnd,
                }
              : bill,
            now,
          )
        : null;

    const result = await this.prisma.$transaction(async (tx) => {
      const reviewedBill = await tx.bill.update({
        where: { id: billId },
        data: dto.approve
          ? {
              status: nextApproveStatus,
              verifiedAt: nextApproveStatus === 'VERIFIED' ? now : null,
              reviewedById: adminId,
              verifiedById: nextApproveStatus === 'VERIFIED' ? adminId : null,
              reviewedAt: now,
              rejectedAt: null,
              rejectedById: null,
              rejectReason: null,
              subtotalVnd: revenueApproval?.grossVnd ?? bill.subtotalVnd,
              discountVnd: revenueApproval?.discountVnd ?? bill.discountVnd,
              totalVnd: revenueApproval?.netVnd ?? bill.totalVnd,
              paidVnd: revenueApproval?.payableVnd ?? bill.paidVnd,
              commissionAmountVnd:
                revenueApproval?.commissionVnd ?? bill.commissionAmountVnd,
              discountRuleSnapshot: revenueApproval
                ? this.toPrismaJson(revenueApproval.discountRuleSnapshot)
                : Prisma.JsonNull,
              commissionRuleSnapshot: revenueApproval
                ? this.toPrismaJson(
                    reviewedCommissionSnapshot ??
                      revenueApproval.commissionRuleSnapshot,
                  )
                : Prisma.JsonNull,
              pointsEarned: loyaltyAward?.points ?? 0,
              pointRuleSnapshot: loyaltyAward
                ? this.toPrismaJson(loyaltyAward.ruleSnapshot)
                : Prisma.JsonNull,
            }
          : {
              status: 'REJECTED',
              rejectedAt: now,
              reviewedById: adminId,
              rejectedById: adminId,
              reviewedAt: now,
              verifiedById: null,
              verifiedAt: null,
              rejectReason: dto.rejectReason ?? 'Rejected by admin review',
            },
        select: this.billNotificationSelect(),
      });

      if (loyaltyAward) {
        await this.recordBillLoyaltyLedger(tx, loyaltyAward);
      }

      await tx.auditLog.create({
        data: {
          actorId: adminId,
          action: reviewAction,
          targetType: 'Bill',
          targetId: billId,
          beforeJson: this.buildBillReviewAuditSnapshot(bill),
          afterJson: this.buildBillReviewAuditSnapshot(reviewedBill),
          metadata: this.toPrismaJson(
            this.buildMinimalSensitiveMetadata({
              actorId: adminId,
              action: reviewAction,
              refType: 'Bill',
              refId: billId,
              occurredAt: now,
              metadata: {
                approve: dto.approve,
                rejectReason: dto.rejectReason ?? null,
                previousStatus: bill.status,
                nextStatus: reviewedBill.status,
                reviewedAt: now.toISOString(),
                requiresPmBaConfirmation,
                pmBaConfirmationReason:
                  reviewedCommissionSnapshot?.pmBaConfirmationReason ?? null,
                pmBaConfirmed:
                  reviewedCommissionSnapshot?.pmBaConfirmationConfirmed ??
                  false,
                pmBaReason: pmBaReason || null,
                loyaltyPoints: loyaltyAward?.points ?? 0,
                loyaltyAmountVnd: loyaltyAward?.amountVnd ?? 0,
                loyaltyExpiresAt: loyaltyAward?.expiresAt.toISOString() ?? null,
                revenueSnapshot: revenueApproval
                  ? {
                      grossVnd: revenueApproval.grossVnd,
                      discountVnd: revenueApproval.discountVnd,
                      netVnd: revenueApproval.netVnd,
                      payableVnd: revenueApproval.payableVnd,
                      commissionVnd: revenueApproval.commissionVnd,
                      discountRuleSnapshot:
                        revenueApproval.discountRuleSnapshot,
                      commissionRuleSnapshot:
                        revenueApproval.commissionRuleSnapshot,
                    }
                  : null,
              },
            }),
          ),
        },
      });

      await this.recordSensitiveActionNotification(tx, {
        actorId: adminId,
        action: reviewAction,
        refType: 'Bill',
        refId: billId,
        occurredAt: now,
        templateKey: 'audit.bill.review.v1',
        recipient: `bill:${billId}`,
        billId,
        userId: reviewedBill.user?.id ?? null,
        guestId: reviewedBill.guest?.id ?? null,
        bookingId: reviewedBill.booking?.id ?? null,
        storeId: reviewedBill.store?.id ?? null,
        payload: {
          previousStatus: bill.status,
          nextStatus: reviewedBill.status,
          approve: dto.approve,
        },
      });

      const customerTemplateKey =
        reviewedBill.status === 'VERIFIED'
          ? 'customer.bill.verified.v1'
          : reviewedBill.status === 'REJECTED'
            ? 'customer.bill.rejected.v1'
            : null;

      if (customerTemplateKey && reviewedBill.user?.id) {
        await this.recordCustomerBillNotification(tx, {
          templateKey: customerTemplateKey,
          userId: reviewedBill.user.id,
          storeId: reviewedBill.store?.id ?? null,
          bookingId: reviewedBill.booking?.id ?? null,
          billId: reviewedBill.id,
          bill: reviewedBill,
          payload: {
            source: 'admin_bill_review',
            previousStatus: bill.status,
            nextStatus: reviewedBill.status,
            approve: dto.approve,
            reviewedById: adminId,
            rejectReason: reviewedBill.rejectReason ?? null,
            pointsEarned: reviewedBill.pointsEarned ?? 0,
          },
        });
      }

      return reviewedBill;
    });

    const resultWithRevenueAliases = this.withBillRevenueAliases(result);

    if (result.status === 'VERIFIED' || result.status === 'REJECTED') {
      await this.adminNotificationService?.notifyBillReviewed(
        resultWithRevenueAliases,
        {
          approve: dto.approve,
          reviewedById: adminId,
        },
      );
    }

    return resultWithRevenueAliases;
  }

  async reverseSensitiveBill(
    adminId: string,
    billId: string,
    dto: ReverseBillDto = {},
  ) {
    return this.applySensitiveBillReversal(adminId, billId, dto, {
      action: 'bill.reversal',
      defaultReason: 'Bill reversed by admin reconciliation',
    });
  }

  async autoReverseSensitiveBills(
    adminId: string,
    dto: AutoReverseBillsDto = {},
  ) {
    const limit = Math.min(Math.max(dto.limit ?? 10, 1), 25);
    const execute = dto.execute === true;
    const reason =
      this.cleanText(dto.reason) ??
      'Auto reversal for high-risk duplicate/fake bill signals';
    const scanLimit = Math.max(limit * 3, 25);
    const bills = await this.prisma.bill.findMany({
      where: {
        deletedAt: null,
        status: { in: ['VERIFIED', 'PAID'] },
      },
      orderBy: [{ reviewedAt: 'desc' }, { submittedAt: 'desc' }],
      take: scanLimit,
      select: {
        id: true,
        billNumber: true,
        status: true,
        storeId: true,
        totalVnd: true,
        usedAt: true,
        submittedAt: true,
        store: { select: { id: true, name: true, slug: true } },
        booking: { select: { id: true, scheduledAt: true } },
        coupon: {
          select: { id: true, code: true, minSpendVnd: true },
        },
        couponIssue: { select: { id: true, code: true, status: true } },
        media: {
          select: {
            id: true,
            access: true,
            originalName: true,
            mimeType: true,
          },
        },
      },
    });

    const candidates: Array<{
      billId: string;
      billNumber: string | null;
      status: string;
      store: { id?: string; name: string; slug?: string | null } | null;
      totalVnd: number | null;
      usedAt: string | null;
      warningCodes: string[];
      warnings: Array<{
        code: string;
        severity: 'LOW' | 'MEDIUM' | 'HIGH';
        message: string;
        evidence?: Record<string, unknown>;
      }>;
      reversed?: boolean;
    }> = [];

    for (const bill of bills) {
      const warnings = await this.buildBillFraudWarnings(bill);
      const highRiskWarnings = warnings.filter(
        (warning) =>
          warning.severity === 'HIGH' &&
          ['POSSIBLE_DUPLICATE_BILL', 'SUSPICIOUS_EVIDENCE_FILE'].includes(
            warning.code,
          ),
      );

      if (!highRiskWarnings.length) {
        continue;
      }

      candidates.push({
        billId: bill.id,
        billNumber: bill.billNumber ?? null,
        status: bill.status,
        store: bill.store,
        totalVnd: bill.totalVnd ?? null,
        usedAt: bill.usedAt?.toISOString() ?? null,
        warningCodes: highRiskWarnings.map((warning) => warning.code),
        warnings: highRiskWarnings,
        reversed: false,
      });

      if (candidates.length >= limit) {
        break;
      }
    }

    if (execute) {
      for (const candidate of candidates) {
        await this.applySensitiveBillReversal(
          adminId,
          candidate.billId,
          {
            reason,
          },
          {
            action: 'bill.reversal',
            defaultReason: reason,
          },
        );
        candidate.reversed = true;
      }
    }

    return {
      mode: execute ? 'EXECUTED' : 'DRY_RUN',
      scannedCount: bills.length,
      candidateCount: candidates.length,
      reversedCount: candidates.filter((candidate) => candidate.reversed)
        .length,
      reason,
      candidates,
    };
  }

  async voidSensitiveBill(adminId: string, billId: string, dto: VoidBillDto) {
    return this.applySensitiveBillReversal(adminId, billId, dto, {
      action: 'bill.review.void',
      defaultReason: 'Bill voided/refunded by admin',
    });
  }

  private async applySensitiveBillReversal(
    adminId: string,
    billId: string,
    dto: { reason?: string; refundReference?: string } = {},
    options: {
      action: 'bill.reversal' | 'bill.review.void';
      defaultReason: string;
    },
  ) {
    const bill = await this.prisma.bill.findFirst({
      where: { id: billId, deletedAt: null },
      select: {
        ...this.billNotificationSelect(),
        pointLedgers: {
          where: { type: 'EARN', status: 'POSTED' },
          select: {
            id: true,
            userId: true,
            bookingId: true,
            amountVnd: true,
            points: true,
            ruleSnapshot: true,
            postedAt: true,
          },
        },
      },
    });

    if (!bill) {
      throw new NotFoundException('Bill not found');
    }

    if (bill.status === 'VOIDED') {
      return this.withBillRevenueAliases(bill);
    }

    if (!['VERIFIED', 'PAID', 'PENDING_PM_BA'].includes(bill.status)) {
      throw new UnprocessableEntityException(
        'Only verified, paid, or pending PM/BA bills can be voided',
      );
    }

    const now = new Date();
    const reason = this.cleanText(dto.reason) ?? options.defaultReason;
    const refundReference = this.cleanText(dto.refundReference);
    const selectedEarnLedger = Array.isArray(bill.pointLedgers)
      ? (bill.pointLedgers[0] ?? null)
      : null;

    const result = await this.prisma.$transaction(async (tx) => {
      const earnLedger =
        selectedEarnLedger ??
        (await tx.pointLedger.findFirst({
          where: {
            billId,
            type: 'EARN',
            status: 'POSTED',
          },
          select: {
            id: true,
            userId: true,
            bookingId: true,
            amountVnd: true,
            points: true,
          },
        }));
      const reversedBill = await tx.bill.update({
        where: { id: billId },
        data: {
          status: 'VOIDED',
          reviewedAt: now,
          reviewedById: adminId,
          verifiedAt: null,
          verifiedById: null,
          rejectedAt: now,
          rejectedById: adminId,
          rejectReason: reason,
          commissionAmountVnd: 0,
          pointsEarned: 0,
          pointRuleSnapshot: this.toPrismaJson({
            ...(this.asRecord(bill.pointRuleSnapshot) ?? {}),
            reversedAt: now.toISOString(),
            reversedById: adminId,
            refundReference: refundReference || null,
            reason,
          }),
        },
        select: this.billNotificationSelect(),
      });

      if (earnLedger && earnLedger.points > 0) {
        await tx.pointLedger.updateMany({
          where: { id: earnLedger.id, status: 'POSTED' },
          data: { status: 'REVERSED' },
        });

        await this.recordBillLoyaltyReverseLedger(tx, {
          billId,
          bookingId: earnLedger.bookingId,
          userId: earnLedger.userId,
          reversedLedgerId: earnLedger.id,
          amountVnd: -Math.abs(earnLedger.amountVnd),
          points: -Math.abs(earnLedger.points),
          postedAt: now,
          reason,
          refundReference: refundReference || null,
        });
      }

      await tx.auditLog.create({
        data: {
          actorId: adminId,
          action: options.action,
          targetType: 'Bill',
          targetId: billId,
          beforeJson: this.buildBillReviewAuditSnapshot(bill),
          afterJson: this.buildBillReviewAuditSnapshot(reversedBill),
          metadata: this.toPrismaJson({
            reason,
            previousStatus: bill.status,
            nextStatus: reversedBill.status,
            refundReference: refundReference || null,
            reversedAt: now.toISOString(),
            reversedLedgerId: earnLedger?.id ?? null,
            pointsReversed: earnLedger?.points ?? 0,
            reversedPoints: earnLedger?.points ?? 0,
            voidedAt: now.toISOString(),
          }),
        },
      });

      return reversedBill;
    });

    const resultWithRevenueAliases = this.withBillRevenueAliases(result);

    await this.adminNotificationService?.notifyBillReviewed(
      resultWithRevenueAliases,
      {
        approve: false,
        reviewedById: adminId,
      },
    );

    return resultWithRevenueAliases;
  }

  private resolveAdminRevenueReportWindow(
    query: AdminRevenueReportQueryDto,
  ): RevenueReportWindow {
    const { timezone, timezoneOffsetMinutes } =
      this.resolveRevenueReportTimezone(query.timezone);
    const fromDateQuery = this.cleanText(query.fromDate);
    const toDateQuery = this.cleanText(query.toDate);

    if (fromDateQuery || toDateQuery || (!query.from && !query.to)) {
      const toDate =
        toDateQuery ??
        this.toRevenueReportDateKey(new Date(), timezoneOffsetMinutes);
      const fromDate =
        fromDateQuery ?? this.shiftRevenueReportDateKey(toDate, -29);

      this.assertRevenueReportDateKey(fromDate, 'fromDate');
      this.assertRevenueReportDateKey(toDate, 'toDate');

      if (fromDate > toDate) {
        throw new BadRequestException('fromDate must be before toDate');
      }

      return {
        from: this.revenueReportLocalDateStartUtc(
          fromDate,
          timezoneOffsetMinutes,
        ),
        to: this.revenueReportLocalDateEndUtc(toDate, timezoneOffsetMinutes),
        fromDate,
        toDate,
        timezone,
        timezoneOffsetMinutes,
      };
    }

    const to = query.to ? new Date(query.to) : new Date();
    if (Number.isNaN(to.getTime())) {
      throw new BadRequestException('to must be a valid ISO date');
    }

    const from = query.from ? new Date(query.from) : new Date(to);
    if (!query.from) {
      from.setDate(from.getDate() - 29);
    }

    if (Number.isNaN(from.getTime())) {
      throw new BadRequestException('from must be a valid ISO date');
    }

    if (from.getTime() > to.getTime()) {
      throw new BadRequestException('from must be before to');
    }

    return {
      from,
      to,
      fromDate: this.toRevenueReportDateKey(from, timezoneOffsetMinutes),
      toDate: this.toRevenueReportDateKey(to, timezoneOffsetMinutes),
      timezone,
      timezoneOffsetMinutes,
    };
  }

  private resolveRevenueReportTimezone(value?: string) {
    const timezone = this.cleanText(value) || DEFAULT_REVENUE_REPORT_TIMEZONE;
    const timezoneOffsetMinutes =
      REVENUE_REPORT_TIMEZONE_OFFSETS_MINUTES[timezone];

    if (timezoneOffsetMinutes === undefined) {
      throw new BadRequestException(
        `timezone must be one of: ${Object.keys(
          REVENUE_REPORT_TIMEZONE_OFFSETS_MINUTES,
        ).join(', ')}`,
      );
    }

    return { timezone, timezoneOffsetMinutes };
  }

  private assertRevenueReportDateKey(value: string, field: string) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
      throw new BadRequestException(`${field} must be YYYY-MM-DD`);
    }

    const [year, month, day] = value.split('-').map(Number);
    const date = new Date(Date.UTC(year, month - 1, day));
    if (
      !Number.isFinite(date.getTime()) ||
      date.toISOString().slice(0, 10) !== value
    ) {
      throw new BadRequestException(`${field} must be a real calendar date`);
    }
  }

  private revenueReportLocalDateStartUtc(
    dateKey: string,
    timezoneOffsetMinutes: number,
  ) {
    const [year, month, day] = dateKey.split('-').map(Number);
    return new Date(
      Date.UTC(year, month - 1, day) - timezoneOffsetMinutes * 60 * 1000,
    );
  }

  private revenueReportLocalDateEndUtc(
    dateKey: string,
    timezoneOffsetMinutes: number,
  ) {
    const [year, month, day] = dateKey.split('-').map(Number);
    return new Date(
      Date.UTC(year, month - 1, day + 1) -
        timezoneOffsetMinutes * 60 * 1000 -
        1,
    );
  }

  private emptyRevenueReportTotals(): RevenueReportMoneyTotals {
    return {
      billCount: 0,
      grossVnd: 0,
      discountVnd: 0,
      netVnd: 0,
      payableVnd: 0,
      commissionVnd: 0,
    };
  }

  private addRevenueReportTotals(
    target: RevenueReportMoneyTotals,
    source: RevenueReportMoneyTotals,
  ) {
    target.billCount += source.billCount;
    target.grossVnd += source.grossVnd;
    target.discountVnd += source.discountVnd;
    target.netVnd += source.netVnd;
    target.payableVnd += source.payableVnd;
    target.commissionVnd += source.commissionVnd;
  }

  private emptyRevenueReportBreakdownMaps() {
    return {
      stores: new Map<string, RevenueReportDimensionNode>(),
      partners: new Map<string, RevenueReportDimensionNode>(),
      campaigns: new Map<string, RevenueReportDimensionNode>(),
      coupons: new Map<string, RevenueReportDimensionNode>(),
      areas: new Map<string, RevenueReportDimensionNode>(),
      casts: new Map<string, RevenueReportDimensionNode>(),
    };
  }

  private addRevenueReportBreakdown(
    breakdown: Map<string, RevenueReportDimensionNode>,
    dimension: Pick<
      RevenueReportDimensionNode,
      'id' | 'code' | 'name' | 'secondary'
    >,
    money: RevenueReportMoneyTotals,
  ) {
    const key = dimension.id ?? dimension.code;
    let node = breakdown.get(key);
    if (!node) {
      node = {
        ...dimension,
        ...this.emptyRevenueReportTotals(),
      };
      breakdown.set(key, node);
    }

    this.addRevenueReportTotals(node, money);
  }

  private finalizeRevenueReportBreakdowns(breakdowns: {
    stores: Map<string, RevenueReportDimensionNode>;
    partners: Map<string, RevenueReportDimensionNode>;
    campaigns: Map<string, RevenueReportDimensionNode>;
    coupons: Map<string, RevenueReportDimensionNode>;
    areas: Map<string, RevenueReportDimensionNode>;
    casts: Map<string, RevenueReportDimensionNode>;
  }): RevenueReportBreakdowns {
    const sortByCommission = (
      left: RevenueReportDimensionNode,
      right: RevenueReportDimensionNode,
    ) =>
      right.commissionVnd - left.commissionVnd ||
      right.netVnd - left.netVnd ||
      left.name.localeCompare(right.name);

    return {
      stores: Array.from(breakdowns.stores.values()).sort(sortByCommission),
      partners: Array.from(breakdowns.partners.values()).sort(sortByCommission),
      campaigns: Array.from(breakdowns.campaigns.values()).sort(
        sortByCommission,
      ),
      coupons: Array.from(breakdowns.coupons.values()).sort(sortByCommission),
      areas: Array.from(breakdowns.areas.values()).sort(sortByCommission),
      casts: Array.from(breakdowns.casts.values()).sort(sortByCommission),
    };
  }

  private revenueReportStoreDimension(store: {
    id: string;
    name: string;
    slug?: string | null;
    city?: string | null;
    district?: string | null;
  }): Pick<RevenueReportDimensionNode, 'id' | 'code' | 'name' | 'secondary'> {
    return {
      id: store.id,
      code: store.slug ?? store.id,
      name: store.name,
      secondary:
        [store.city, store.district].filter(Boolean).join(' / ') || null,
    };
  }

  private revenueReportPartnerDimension(store: {
    partnerAccount?: {
      id: string;
      businessName: string;
      status: string;
    } | null;
  }): Pick<RevenueReportDimensionNode, 'id' | 'code' | 'name' | 'secondary'> {
    if (!store.partnerAccount) {
      return {
        id: null,
        code: 'NO_PARTNER',
        name: 'No partner assigned',
        secondary: null,
      };
    }

    return {
      id: store.partnerAccount.id,
      code: store.partnerAccount.status,
      name: store.partnerAccount.businessName,
      secondary: store.partnerAccount.status,
    };
  }

  private revenueReportCampaignDimension(bill: {
    coupon?: { id: string; code: string; name: string } | null;
  }): Pick<RevenueReportDimensionNode, 'id' | 'code' | 'name' | 'secondary'> {
    if (!bill.coupon) {
      return {
        id: null,
        code: 'NO_COUPON',
        name: 'No coupon',
        secondary: null,
      };
    }

    return {
      id: bill.coupon.id,
      code: bill.coupon.code,
      name: bill.coupon.name,
      secondary: null,
    };
  }

  private revenueReportAreaDimension(store: {
    city?: string | null;
    district?: string | null;
    area?: {
      id: string;
      code: string;
      name: string;
      city: string;
      district: string | null;
    } | null;
  }): Pick<RevenueReportDimensionNode, 'id' | 'code' | 'name' | 'secondary'> {
    if (!store.area) {
      return {
        id: null,
        code: 'NO_AREA',
        name: store.district ?? store.city ?? 'No area',
        secondary: store.city ?? null,
      };
    }

    return {
      id: store.area.id,
      code: store.area.code,
      name: store.area.name,
      secondary: [store.area.city, store.area.district]
        .filter(Boolean)
        .join(' / '),
    };
  }

  private revenueReportCastDimension(bill: {
    booking?: {
      cast?: { id: string; stageName: string; slug: string } | null;
    } | null;
  }): Pick<RevenueReportDimensionNode, 'id' | 'code' | 'name' | 'secondary'> {
    const cast = bill.booking?.cast;
    if (!cast) {
      return {
        id: null,
        code: 'NO_CAST',
        name: 'No requested cast',
        secondary: null,
      };
    }

    return {
      id: cast.id,
      code: cast.slug,
      name: cast.stageName,
      secondary: null,
    };
  }

  private async buildRevenueReportFunnel(
    query: AdminRevenueReportQueryDto,
    reportWindow: RevenueReportWindow,
    totals: RevenueReportMoneyTotals,
  ): Promise<RevenueReportFunnelStep[]> {
    const storeId = this.cleanText(query.storeId);
    const couponId = this.cleanText(query.couponId);
    const partnerAccountId = this.cleanText(query.partnerAccountId);
    const areaId = this.cleanText(query.areaId);
    const castId = this.cleanText(query.castId);
    const storeRelationFilter =
      partnerAccountId || areaId
        ? {
            ...(partnerAccountId ? { partnerAccountId } : {}),
            ...(areaId ? { areaId } : {}),
          }
        : undefined;
    const bookingRelationFilter =
      couponId || castId
        ? {
            ...(couponId ? { couponId } : {}),
            ...(castId ? { castId } : {}),
          }
        : undefined;
    const bookingQrBaseWhere: Prisma.BookingQrWhereInput = {
      ...(storeId ? { storeId } : {}),
      ...(storeRelationFilter ? { store: storeRelationFilter } : {}),
      ...(bookingRelationFilter ? { booking: bookingRelationFilter } : {}),
    };
    const couponIssueBaseWhere: Prisma.CouponIssueWhereInput = {
      ...(couponId ? { couponId } : {}),
      coupon: {
        deletedAt: null,
        ...(storeId ? { storeId } : {}),
        ...(storeRelationFilter ? { store: storeRelationFilter } : {}),
      },
      ...(castId ? { booking: { castId } } : {}),
    };

    const billSubmittedBaseWhere: Prisma.BillWhereInput = {
      deletedAt: null,
      usedAt: { gte: reportWindow.from, lte: reportWindow.to },
      ...(storeId ? { storeId } : {}),
      ...(couponId ? { couponId } : {}),
      ...(storeRelationFilter ? { store: storeRelationFilter } : {}),
      ...(castId ? { booking: { castId } } : {}),
    };

    const [
      qrIssuedCount,
      couponIssueCount,
      qrUsedCount,
      couponIssueScannedCount,
      couponIssueUsedCount,
      billSubmittedCount,
      billApprovedCount,
    ] = await Promise.all([
      this.prisma.bookingQr.count({
        where: {
          ...bookingQrBaseWhere,
          createdAt: { gte: reportWindow.from, lte: reportWindow.to },
        },
      }),
      this.prisma.couponIssue.count({
        where: {
          ...couponIssueBaseWhere,
          createdAt: { gte: reportWindow.from, lte: reportWindow.to },
        },
      }),
      this.prisma.bookingQr.count({
        where: {
          ...bookingQrBaseWhere,
          status: 'USED',
          usedAt: { gte: reportWindow.from, lte: reportWindow.to },
        },
      }),
      this.prisma.couponIssue.count({
        where: {
          ...couponIssueBaseWhere,
          scannedById: { not: null },
          updatedAt: { gte: reportWindow.from, lte: reportWindow.to },
        },
      }),
      this.prisma.couponIssue.count({
        where: {
          ...couponIssueBaseWhere,
          status: 'USED',
          usedAt: { gte: reportWindow.from, lte: reportWindow.to },
        },
      }),
      this.prisma.bill.count({
        where: {
          ...billSubmittedBaseWhere,
          status: { in: ['SUBMITTED', 'REJECTED', 'VERIFIED', 'PAID'] },
        },
      }),
      this.prisma.bill.count({
        where: {
          ...billSubmittedBaseWhere,
          status: { in: [...REVENUE_REPORT_BILL_STATUSES] },
        },
      }),
    ]);

    const steps = [
      {
        key: 'coupon_qr',
        label: 'Coupon/QR',
        count: qrIssuedCount + couponIssueCount,
      },
      {
        key: 'qr_scan',
        label: 'QR scan',
        count: qrUsedCount + couponIssueScannedCount,
      },
      {
        key: 'confirm_used',
        label: 'Confirm USED',
        count: qrUsedCount + couponIssueUsedCount,
      },
      {
        key: 'bill_submitted',
        label: 'Bill submitted',
        count: billSubmittedCount,
      },
      {
        key: 'bill_approved',
        label: 'Bill approved',
        count: billApprovedCount,
      },
      {
        key: 'commission',
        label: 'Commission',
        count: totals.commissionVnd,
        commissionVnd: totals.commissionVnd,
      },
    ];
    return steps.map((step, index) => {
      const previous = index > 0 ? steps[index - 1] : null;
      const rateFromPrevious =
        previous && previous.count > 0
          ? Math.round((step.count / previous.count) * 10000) / 100
          : null;

      return {
        ...step,
        rateFromPrevious,
      };
    });
  }

  private async buildRevenueReportComparison(
    query: AdminRevenueReportQueryDto,
    reportWindow: RevenueReportWindow,
    currentWhere: Prisma.BillWhereInput,
    currentTotals: RevenueReportMoneyTotals,
  ) {
    void query;
    const previousWindow = this.previousRevenueReportWindow(reportWindow);
    const previousBills = await this.prisma.bill.findMany({
      where: {
        ...currentWhere,
        usedAt: { gte: previousWindow.from, lte: previousWindow.to },
      },
      select: {
        subtotalVnd: true,
        discountVnd: true,
        serviceChargeVnd: true,
        taxVnd: true,
        totalVnd: true,
        paidVnd: true,
        commissionAmountVnd: true,
      },
    });
    const previousTotals = previousBills.reduce((sum, bill) => {
      this.addRevenueReportTotals(sum, this.billRevenueReportMoney(bill));
      return sum;
    }, this.emptyRevenueReportTotals());

    return {
      previousPeriod: {
        from: previousWindow.from.toISOString(),
        to: previousWindow.to.toISOString(),
        fromDate: previousWindow.fromDate,
        toDate: previousWindow.toDate,
      },
      totals: {
        billCount: this.revenueReportComparisonMetric(
          currentTotals.billCount,
          previousTotals.billCount,
        ),
        grossVnd: this.revenueReportComparisonMetric(
          currentTotals.grossVnd,
          previousTotals.grossVnd,
        ),
        discountVnd: this.revenueReportComparisonMetric(
          currentTotals.discountVnd,
          previousTotals.discountVnd,
        ),
        netVnd: this.revenueReportComparisonMetric(
          currentTotals.netVnd,
          previousTotals.netVnd,
        ),
        payableVnd: this.revenueReportComparisonMetric(
          currentTotals.payableVnd,
          previousTotals.payableVnd,
        ),
        commissionVnd: this.revenueReportComparisonMetric(
          currentTotals.commissionVnd,
          previousTotals.commissionVnd,
        ),
      },
    };
  }

  private previousRevenueReportWindow(
    reportWindow: RevenueReportWindow,
  ): RevenueReportWindow {
    const dayCount =
      this.revenueReportDateKeyDistance(
        reportWindow.fromDate,
        reportWindow.toDate,
      ) + 1;
    const toDate = this.shiftRevenueReportDateKey(reportWindow.fromDate, -1);
    const fromDate = this.shiftRevenueReportDateKey(toDate, -(dayCount - 1));

    return {
      from: this.revenueReportLocalDateStartUtc(
        fromDate,
        reportWindow.timezoneOffsetMinutes,
      ),
      to: this.revenueReportLocalDateEndUtc(
        toDate,
        reportWindow.timezoneOffsetMinutes,
      ),
      fromDate,
      toDate,
      timezone: reportWindow.timezone,
      timezoneOffsetMinutes: reportWindow.timezoneOffsetMinutes,
    };
  }

  private revenueReportComparisonMetric(current: number, previous: number) {
    const delta = current - previous;
    const deltaPercent =
      previous > 0 ? Math.round((delta / previous) * 10000) / 100 : null;

    return {
      current,
      previous,
      delta,
      deltaPercent,
    } satisfies RevenueReportComparisonMetric;
  }

  private revenueReportDateKeyDistance(fromDate: string, toDate: string) {
    const [fromYear, fromMonth, fromDay] = fromDate.split('-').map(Number);
    const [toYear, toMonth, toDay] = toDate.split('-').map(Number);
    return Math.max(
      0,
      Math.round(
        (Date.UTC(toYear, toMonth - 1, toDay) -
          Date.UTC(fromYear, fromMonth - 1, fromDay)) /
          (24 * 60 * 60 * 1000),
      ),
    );
  }

  private billRevenueReportMoney(bill: {
    subtotalVnd: number | null;
    discountVnd: number | null;
    serviceChargeVnd: number | null;
    taxVnd: number | null;
    totalVnd: number | null;
    paidVnd: number | null;
    commissionAmountVnd: number | null;
  }): RevenueReportMoneyTotals {
    const discountVnd = Math.max(0, bill.discountVnd ?? 0);
    const serviceChargeVnd = Math.max(0, bill.serviceChargeVnd ?? 0);
    const taxVnd = Math.max(0, bill.taxVnd ?? 0);
    const totalVnd = Math.max(0, bill.totalVnd ?? 0);
    const grossVnd =
      Math.max(0, bill.subtotalVnd ?? 0) || totalVnd + discountVnd;
    const netVnd =
      grossVnd > 0 || discountVnd > 0
        ? Math.max(0, grossVnd - discountVnd)
        : totalVnd;
    const payableVnd =
      Math.max(0, bill.paidVnd ?? 0) ||
      Math.max(0, netVnd + serviceChargeVnd + taxVnd) ||
      netVnd;

    return {
      billCount: 1,
      grossVnd,
      discountVnd,
      netVnd,
      payableVnd,
      commissionVnd: Math.trunc(bill.commissionAmountVnd ?? 0),
    };
  }

  private async buildBillRevenueApprovalSnapshot(
    bill: {
      id: string;
      subtotalVnd?: number | null;
      discountVnd?: number | null;
      serviceChargeVnd?: number | null;
      taxVnd?: number | null;
      totalVnd?: number | null;
      paidVnd?: number | null;
      discountRuleSnapshot?: Prisma.JsonValue | null;
      store?: {
        id?: string | null;
        name?: string | null;
        slug?: string | null;
      } | null;
      coupon?: {
        id: string;
        code: string;
        name: string;
        discountType: string;
        discountValue: number;
        maxDiscountVnd: number | null;
        minSpendVnd: number | null;
      } | null;
      couponIssue?: {
        id: string;
        code: string;
        status: string;
        metadata?: Prisma.JsonValue | null;
      } | null;
    },
    reviewedAt: Date,
  ): Promise<BillRevenueApprovalSnapshot> {
    const previousDiscountVnd = this.nonNegativeVnd(bill.discountVnd);
    const grossVnd =
      this.nonNegativeVnd(bill.subtotalVnd) ||
      this.nonNegativeVnd(bill.totalVnd) + previousDiscountVnd ||
      this.nonNegativeVnd(bill.paidVnd) + previousDiscountVnd;
    const serviceChargeVnd = this.nonNegativeVnd(bill.serviceChargeVnd);
    const taxVnd = this.nonNegativeVnd(bill.taxVnd);
    const discount = this.resolveBillApprovalDiscount(
      bill,
      grossVnd,
      reviewedAt,
    );
    const netVnd = Math.max(0, grossVnd - discount.discountVnd);
    const payableVnd = Math.max(0, netVnd + serviceChargeVnd + taxVnd);
    const commission = await this.resolveBillApprovalCommission({
      bill,
      grossVnd,
      netVnd,
      payableVnd,
      serviceChargeVnd,
      taxVnd,
      discountVnd: discount.discountVnd,
      discountPercent: discount.effectiveDiscountPercent,
      reviewedAt,
    });

    return {
      grossVnd,
      discountVnd: discount.discountVnd,
      netVnd,
      payableVnd,
      commissionVnd: commission.commissionVnd,
      discountRuleSnapshot: {
        ...discount.snapshot,
        grossRevenueVnd: grossVnd,
        netRevenueVnd: netVnd,
        payableVnd,
        serviceChargeVnd,
        taxVnd,
      },
      commissionRuleSnapshot: commission.snapshot,
    };
  }

  private resolveBillApprovalDiscount(
    bill: {
      id: string;
      discountRuleSnapshot?: Prisma.JsonValue | null;
      coupon?: {
        id: string;
        code: string;
        name: string;
        discountType: string;
        discountValue: number;
        maxDiscountVnd: number | null;
        minSpendVnd: number | null;
      } | null;
      couponIssue?: {
        id: string;
        code: string;
        status: string;
        metadata?: Prisma.JsonValue | null;
      } | null;
    },
    grossVnd: number,
    reviewedAt: Date,
  ) {
    const issueMetadata = this.asRecord(bill.couponIssue?.metadata);
    const issueDiscountRule = this.asRecord(
      issueMetadata?.discountRuleSnapshot,
    );
    const existingDiscountRule = this.asRecord(bill.discountRuleSnapshot);
    const sourceRule = issueDiscountRule ?? existingDiscountRule;
    const coupon = bill.coupon ?? null;
    const sourceDiscountPercent =
      this.normalizePercent(issueMetadata?.discountPercent) ??
      this.normalizePercent(sourceRule?.discountPercent) ??
      this.normalizePercent(sourceRule?.value) ??
      (coupon?.discountType === 'PERCENT'
        ? this.normalizePercent(coupon.discountValue)
        : null);
    const maxDiscountVnd =
      this.nullableNonNegativeVnd(sourceRule?.maxDiscountVnd) ??
      this.nullableNonNegativeVnd(coupon?.maxDiscountVnd);
    const minSpendVnd =
      this.nullableNonNegativeVnd(sourceRule?.minSpendVnd) ??
      this.nullableNonNegativeVnd(coupon?.minSpendVnd);
    let rawDiscountVnd = 0;
    let skippedReason: string | null = null;

    if (grossVnd <= 0) {
      skippedReason = 'ZERO_GROSS_BILL';
    } else if (minSpendVnd !== null && grossVnd < minSpendVnd) {
      skippedReason = 'BELOW_MIN_SPEND';
    } else if (sourceDiscountPercent !== null) {
      rawDiscountVnd = Math.round(
        grossVnd * this.percentToRate(sourceDiscountPercent),
      );
    } else if (coupon?.discountType === 'FIXED_AMOUNT') {
      rawDiscountVnd = this.nonNegativeVnd(coupon.discountValue);
    }

    const cappedDiscountVnd =
      maxDiscountVnd !== null
        ? Math.min(rawDiscountVnd, maxDiscountVnd)
        : rawDiscountVnd;
    const discountVnd = Math.min(Math.max(0, cappedDiscountVnd), grossVnd);
    const effectiveDiscountPercent = this.amountToPercent(
      discountVnd,
      grossVnd,
    );
    const source = issueDiscountRule
      ? 'COUPON_ISSUE_SNAPSHOT'
      : existingDiscountRule
        ? 'BILL_SNAPSHOT'
        : coupon
          ? 'COUPON_CAMPAIGN'
          : 'NONE';
    const sourceType =
      typeof sourceRule?.type === 'string'
        ? sourceRule.type
        : (coupon?.discountType ?? null);
    const sourceValue =
      this.toNumber(sourceRule?.sourceValue) ??
      this.toNumber(sourceRule?.value) ??
      this.toNumber(coupon?.discountValue);

    return {
      discountVnd,
      effectiveDiscountPercent,
      snapshot: {
        version: BILL_REVENUE_RULE_VERSION,
        snapshotAt: reviewedAt.toISOString(),
        basis: 'bill_gross_before_discount',
        source,
        sourceType,
        sourceValue,
        sourceDiscountPercent,
        effectiveDiscountPercent,
        discountRate: this.percentToRate(effectiveDiscountPercent),
        grossVnd,
        discountVnd,
        maxDiscountVnd,
        minSpendVnd,
        skippedReason,
        coupon: coupon
          ? { id: coupon.id, code: coupon.code, name: coupon.name }
          : null,
        couponIssue: bill.couponIssue
          ? {
              id: bill.couponIssue.id,
              code: bill.couponIssue.code,
              status: bill.couponIssue.status,
            }
          : null,
      },
    };
  }

  private async resolveBillApprovalCommission(input: {
    bill: {
      id?: string;
      store?: {
        id?: string | null;
        name?: string | null;
        slug?: string | null;
      } | null;
      coupon?: { id: string; code: string; name: string } | null;
      couponIssue?: { id: string; code: string; status: string } | null;
    };
    grossVnd: number;
    netVnd: number;
    payableVnd: number;
    serviceChargeVnd: number;
    taxVnd: number;
    discountVnd: number;
    discountPercent: number;
    reviewedAt: Date;
  }) {
    const storeId = input.bill.store?.id ?? null;
    const commissionConfig = storeId
      ? await this.prisma.commissionConfig.findFirst({
          where: {
            storeId,
            status: 'ACTIVE',
            activeFrom: { lte: input.reviewedAt },
            AND: [
              {
                OR: [
                  { activeTo: null },
                  { activeTo: { gt: input.reviewedAt } },
                ],
              },
              {
                OR: [
                  { minBillVnd: null },
                  { minBillVnd: { lte: input.grossVnd } },
                ],
              },
            ],
          },
          orderBy: [{ activeFrom: 'desc' }, { createdAt: 'desc' }],
          select: {
            id: true,
            commissionType: true,
            commissionValue: true,
            minBillVnd: true,
            ruleSnapshot: true,
            activeFrom: true,
            activeTo: true,
          },
        })
      : null;
    if (storeId && !commissionConfig) {
      throw new UnprocessableEntityException({
        message: 'Missing active CommissionConfig for bill approval',
        error: 'Unprocessable Entity',
        code: MISSING_COMMISSION_CONFIG_FLAG,
        reason:
          'Bill approval requires an active CommissionConfig before commission can be calculated.',
        flags: [MISSING_COMMISSION_CONFIG_FLAG],
        bill: {
          id: input.bill.id ?? null,
        },
        store: {
          id: storeId,
          name: input.bill.store?.name ?? null,
          slug: input.bill.store?.slug ?? null,
        },
      });
    }

    const configRuleSnapshot = this.asRecord(commissionConfig?.ruleSnapshot);
    const campaignOverride = this.resolveCampaignCommissionPercent(
      configRuleSnapshot,
      input.bill.coupon,
    );
    const sourceCommissionPercent =
      campaignOverride.percent ??
      (commissionConfig?.commissionType === 'PERCENT'
        ? this.normalizePercent(commissionConfig.commissionValue)
        : null);
    const grossCommissionVnd =
      commissionConfig?.commissionType === 'FIXED_AMOUNT'
        ? this.nonNegativeVnd(commissionConfig.commissionValue)
        : sourceCommissionPercent !== null
          ? Math.round(
              input.grossVnd * this.percentToRate(sourceCommissionPercent),
            )
          : 0;
    const commissionPercent = this.amountToPercent(
      grossCommissionVnd,
      input.grossVnd,
    );
    const commissionVnd = grossCommissionVnd - input.discountVnd;
    const requiresPmBaConfirmation = commissionVnd < 0;
    const flags = [
      ...(requiresPmBaConfirmation ? [NEGATIVE_COMMISSION_FLAG] : []),
    ];

    return {
      commissionVnd,
      snapshot: {
        version: BILL_REVENUE_RULE_VERSION,
        snapshotAt: input.reviewedAt.toISOString(),
        basis: 'bill_gross_before_discount',
        formula: 'grossVnd * (commission_rate - discount_rate)',
        source: commissionConfig
          ? (campaignOverride.source ?? 'STORE_COMMISSION_CONFIG')
          : 'NO_STORE_COMMISSION_CONFIG',
        grossVnd: input.grossVnd,
        grossRevenueVnd: input.grossVnd,
        discountVnd: input.discountVnd,
        serviceChargeVnd: input.serviceChargeVnd,
        taxVnd: input.taxVnd,
        netRevenueVnd: input.netVnd,
        payableVnd: input.payableVnd,
        grossCommissionVnd,
        commissionVnd,
        commissionAmountVnd: commissionVnd,
        commissionPercent,
        commissionRate: this.percentToRate(commissionPercent),
        discountPercent: input.discountPercent,
        discountRate: this.percentToRate(input.discountPercent),
        requiresPmBaConfirmation,
        pmBaConfirmationReason: requiresPmBaConfirmation
          ? 'Commission is negative because discount rate is higher than commission rate.'
          : null,
        flags,
        store: {
          id: storeId,
          name: input.bill.store?.name ?? null,
          slug: input.bill.store?.slug ?? null,
        },
        coupon: input.bill.coupon
          ? {
              id: input.bill.coupon.id,
              code: input.bill.coupon.code,
              name: input.bill.coupon.name,
            }
          : null,
        couponIssue: input.bill.couponIssue
          ? {
              id: input.bill.couponIssue.id,
              code: input.bill.couponIssue.code,
              status: input.bill.couponIssue.status,
            }
          : null,
        commissionConfig: commissionConfig
          ? {
              id: commissionConfig.id,
              commissionType: commissionConfig.commissionType,
              commissionValue: commissionConfig.commissionValue,
              minBillVnd: commissionConfig.minBillVnd,
              activeFrom: commissionConfig.activeFrom.toISOString(),
              activeTo: commissionConfig.activeTo?.toISOString() ?? null,
              ruleSnapshot: configRuleSnapshot ?? null,
            }
          : null,
      },
    };
  }

  private async upsertAdminCommissionOverride(
    adminId: string,
    storeId: string,
    dto: (CreateCommissionOverrideDto | UpdateCommissionOverrideDto) & {
      couponId?: string;
      couponCode?: string;
    },
  ) {
    const couponId = this.cleanText(dto.couponId);
    const couponCode = this.cleanText(dto.couponCode);

    if (!couponId && !couponCode) {
      throw new BadRequestException('couponId or couponCode is required');
    }

    const [config, coupon] = await Promise.all([
      this.prisma.commissionConfig.findFirst({
        where: {
          storeId,
          status: 'ACTIVE',
          activeFrom: { lte: new Date() },
          OR: [{ activeTo: null }, { activeTo: { gt: new Date() } }],
        },
        orderBy: [{ activeFrom: 'desc' }, { createdAt: 'desc' }],
        select: {
          id: true,
          storeId: true,
          commissionType: true,
          commissionValue: true,
          ruleSnapshot: true,
          store: { select: { id: true, name: true, slug: true } },
        },
      }),
      this.prisma.coupon.findFirst({
        where: {
          storeId,
          deletedAt: null,
          ...(couponId ? { id: couponId } : { code: couponCode }),
        },
        select: { id: true, code: true, name: true, storeId: true },
      }),
    ]);

    if (!config) {
      throw new UnprocessableEntityException({
        message: 'Missing active CommissionConfig for override',
        code: MISSING_COMMISSION_CONFIG_FLAG,
        flags: [MISSING_COMMISSION_CONFIG_FLAG],
        store: { id: storeId },
      });
    }

    if (!coupon) {
      throw new NotFoundException('Coupon campaign not found for store');
    }

    const currentSnapshot = this.asRecord(config.ruleSnapshot) ?? {};
    const overrides = this.readCampaignCommissionOverrides(currentSnapshot);
    const existing = overrides.find(
      (override) =>
        override.couponId === coupon.id || override.couponCode === coupon.code,
    );

    if (
      dto.commissionPercent === undefined &&
      dto.active !== false &&
      !existing
    ) {
      throw new NotFoundException('Commission override not found');
    }

    const now = new Date().toISOString();
    const nextOverride = {
      couponId: coupon.id,
      couponCode: coupon.code,
      couponName: coupon.name,
      commissionPercent:
        dto.commissionPercent ?? existing?.commissionPercent ?? 0,
      active: dto.active ?? existing?.active ?? true,
      note: this.cleanText(dto.note) || existing?.note || null,
      createdAt: existing?.createdAt ?? now,
      createdById: existing?.createdById ?? adminId,
      updatedAt: now,
      updatedById: adminId,
    };

    const nextOverrides = [
      ...overrides.filter(
        (override) =>
          override.couponId !== coupon.id &&
          override.couponCode !== coupon.code,
      ),
      nextOverride,
    ];
    const nextSnapshot = this.withCampaignCommissionOverrides(
      currentSnapshot,
      nextOverrides,
    );

    const updated = await this.prisma.$transaction(async (tx) => {
      const commissionConfig = await tx.commissionConfig.update({
        where: { id: config.id },
        data: { ruleSnapshot: this.toPrismaJson(nextSnapshot) },
        select: {
          id: true,
          storeId: true,
          commissionType: true,
          commissionValue: true,
          ruleSnapshot: true,
          updatedAt: true,
          store: { select: { id: true, name: true, slug: true } },
        },
      });

      await tx.auditLog.create({
        data: {
          actorId: adminId,
          action: nextOverride.active
            ? existing
              ? 'commission.override.update'
              : 'commission.override.create'
            : 'commission.override.disable',
          targetType: 'CommissionConfig',
          targetId: config.id,
          beforeJson: this.toPrismaJson({
            override: existing ?? null,
            ruleSnapshot: currentSnapshot,
          }),
          afterJson: this.toPrismaJson({
            override: nextOverride,
            ruleSnapshot: nextSnapshot,
          }),
          metadata: this.toPrismaJson({
            storeId,
            couponId: coupon.id,
            couponCode: coupon.code,
            commissionPercent: nextOverride.commissionPercent,
            active: nextOverride.active,
          }),
        },
      });

      return commissionConfig;
    });

    return {
      ...nextOverride,
      commissionConfig: {
        id: updated.id,
        storeId: updated.storeId,
        commissionType: updated.commissionType,
        commissionValue: updated.commissionValue,
        updatedAt: updated.updatedAt.toISOString(),
      },
      store: updated.store,
    };
  }

  private resolveCampaignCommissionPercent(
    ruleSnapshot: Record<string, unknown> | undefined,
    coupon?: { id: string; code: string } | null,
  ) {
    if (!ruleSnapshot || !coupon) {
      return { percent: null, source: null };
    }

    const explicitOverride = this.readCampaignCommissionOverrides(
      ruleSnapshot,
    ).find(
      (override) =>
        override.active &&
        (override.couponId === coupon.id ||
          override.couponCode === coupon.code),
    );

    if (explicitOverride) {
      return {
        percent: explicitOverride.commissionPercent,
        source: 'CAMPAIGN_COMMISSION_OVERRIDE',
      };
    }

    const campaignGroups = [
      this.asRecord(ruleSnapshot.campaignCommissionRates),
      this.asRecord(ruleSnapshot.campaignRates),
      this.asRecord(ruleSnapshot.couponCommissionRates),
      this.asRecord(ruleSnapshot.couponRates),
    ].filter((group): group is Record<string, unknown> => Boolean(group));
    const campaignKeys = [coupon.id, coupon.code].filter(Boolean);

    for (const group of campaignGroups) {
      for (const key of campaignKeys) {
        const percent = this.extractCommissionPercent(group[key]);
        if (percent !== null) {
          return { percent, source: 'CAMPAIGN_COMMISSION_OVERRIDE' };
        }
      }
    }

    const directCouponId =
      typeof ruleSnapshot.couponId === 'string' ? ruleSnapshot.couponId : null;
    const directCouponCode =
      typeof ruleSnapshot.couponCode === 'string'
        ? ruleSnapshot.couponCode
        : null;
    if (directCouponId === coupon.id || directCouponCode === coupon.code) {
      const percent = this.extractCommissionPercent(ruleSnapshot);
      if (percent !== null) {
        return { percent, source: 'CAMPAIGN_COMMISSION_OVERRIDE' };
      }
    }

    return { percent: null, source: null };
  }

  private readCampaignCommissionOverrides(
    ruleSnapshot: Record<string, unknown>,
  ) {
    const entries = new Map<
      string,
      {
        couponId: string | null;
        couponCode: string;
        couponName: string | null;
        commissionPercent: number;
        active: boolean;
        note: string | null;
        createdAt: string | null;
        createdById: string | null;
        updatedAt: string | null;
        updatedById: string | null;
      }
    >();
    const addEntry = (
      raw: unknown,
      fallback: { couponId?: string | null; couponCode?: string | null } = {},
    ) => {
      const record = this.asRecord(raw);
      const percent = this.extractCommissionPercent(raw);
      const couponId =
        (typeof record?.couponId === 'string' ? record.couponId : null) ??
        fallback.couponId ??
        null;
      const couponCode =
        (typeof record?.couponCode === 'string' ? record.couponCode : null) ??
        fallback.couponCode ??
        couponId;

      if (percent === null || !couponCode) {
        return;
      }

      entries.set(couponId ?? couponCode, {
        couponId,
        couponCode,
        couponName:
          typeof record?.couponName === 'string'
            ? record.couponName
            : typeof record?.name === 'string'
              ? record.name
              : null,
        commissionPercent: percent,
        active: record?.active !== false,
        note: typeof record?.note === 'string' ? record.note : null,
        createdAt:
          typeof record?.createdAt === 'string' ? record.createdAt : null,
        createdById:
          typeof record?.createdById === 'string' ? record.createdById : null,
        updatedAt:
          typeof record?.updatedAt === 'string' ? record.updatedAt : null,
        updatedById:
          typeof record?.updatedById === 'string' ? record.updatedById : null,
      });
    };

    const overrideList = Array.isArray(ruleSnapshot.campaignCommissionOverrides)
      ? ruleSnapshot.campaignCommissionOverrides
      : [];
    overrideList.forEach((override) => addEntry(override));

    [
      this.asRecord(ruleSnapshot.campaignCommissionRates),
      this.asRecord(ruleSnapshot.campaignRates),
      this.asRecord(ruleSnapshot.couponCommissionRates),
      this.asRecord(ruleSnapshot.couponRates),
    ]
      .filter((group): group is Record<string, unknown> => Boolean(group))
      .forEach((group) => {
        Object.entries(group).forEach(([key, value]) => {
          addEntry(value, { couponId: key, couponCode: key });
        });
      });

    return Array.from(entries.values());
  }

  private withCampaignCommissionOverrides(
    ruleSnapshot: Record<string, unknown>,
    overrides: Array<{
      couponId: string | null;
      couponCode: string;
      couponName: string | null;
      commissionPercent: number;
      active: boolean;
      note: string | null;
      createdAt: string | null;
      createdById: string | null;
      updatedAt: string | null;
      updatedById: string | null;
    }>,
  ) {
    const activeRateMap = overrides.reduce<Record<string, unknown>>(
      (map, override) => {
        if (!override.active) {
          return map;
        }

        const value = {
          commissionPercent: override.commissionPercent,
          active: override.active,
          note: override.note,
          updatedAt: override.updatedAt,
        };

        if (override.couponId) {
          map[override.couponId] = value;
        }
        map[override.couponCode] = value;
        return map;
      },
      {},
    );

    return {
      ...ruleSnapshot,
      version: BILL_REVENUE_RULE_VERSION,
      campaignCommissionOverrides: overrides,
      campaignCommissionRates: activeRateMap,
    };
  }

  private extractSnapshotFlags(snapshot: Record<string, unknown> | null) {
    const flags = Array.isArray(snapshot?.flags) ? snapshot.flags : [];
    return flags.filter((flag): flag is string => typeof flag === 'string');
  }

  private decorateBillCommissionReviewSnapshot(
    snapshot: Record<string, unknown>,
    input: {
      status: string;
      reviewedAt: Date;
      reviewedById: string;
      confirmNegativeCommission: boolean;
      pmBaReason: string;
    },
  ) {
    const requiresPmBaConfirmation = this.extractSnapshotFlags(
      snapshot,
    ).includes(NEGATIVE_COMMISSION_FLAG);

    return {
      ...snapshot,
      workflowStatus: input.status,
      pmBaConfirmationRequired: requiresPmBaConfirmation,
      pmBaConfirmationReason:
        typeof snapshot.pmBaConfirmationReason === 'string'
          ? snapshot.pmBaConfirmationReason
          : requiresPmBaConfirmation
            ? 'Commission is negative and requires PM/BA confirmation.'
            : null,
      pmBaConfirmationConfirmed:
        requiresPmBaConfirmation && input.confirmNegativeCommission,
      pmBaConfirmation: requiresPmBaConfirmation
        ? {
            status: input.confirmNegativeCommission ? 'CONFIRMED' : 'PENDING',
            reason: input.pmBaReason || null,
            reviewedById: input.reviewedById,
            reviewedAt: input.reviewedAt.toISOString(),
          }
        : null,
    };
  }

  private extractCommissionPercent(value: unknown) {
    const record = this.asRecord(value);
    if (!record) {
      return this.normalizePercent(value);
    }

    if (record.active === false) {
      return null;
    }

    return (
      this.normalizePercent(record.commissionPercent) ??
      this.normalizePercent(record.commissionRatePercent) ??
      this.normalizePercent(record.ratePercent) ??
      this.normalizePercent(record.percent) ??
      this.normalizePercent(record.value) ??
      this.normalizePercent(record.rate)
    );
  }

  private nonNegativeVnd(value: unknown) {
    const number = this.toNumber(value) ?? 0;
    return Math.max(0, Math.round(number));
  }

  private nullableNonNegativeVnd(value: unknown) {
    const number = this.toNumber(value);
    return number === null ? null : Math.max(0, Math.round(number));
  }

  private normalizePercent(value: unknown) {
    const number = this.toNumber(value);
    if (number === null || number < 0) {
      return null;
    }

    const percent = number > 0 && number <= 1 ? number * 100 : number;
    return Math.round(percent * 10000) / 10000;
  }

  private percentToRate(percent: number | null) {
    if (percent === null || !Number.isFinite(percent)) {
      return 0;
    }

    return Math.round((percent / 100) * 1000000) / 1000000;
  }

  private amountToPercent(amountVnd: number, grossVnd: number) {
    if (grossVnd <= 0) {
      return 0;
    }

    return Math.round((amountVnd / grossVnd) * 1000000) / 10000;
  }

  private toRevenueReportDateKey(
    value: Date | string,
    timezoneOffsetMinutes: number,
  ) {
    const date = value instanceof Date ? value : new Date(value);
    return new Date(date.getTime() + timezoneOffsetMinutes * 60 * 1000)
      .toISOString()
      .slice(0, 10);
  }

  private shiftRevenueReportDateKey(dateKey: string, days: number) {
    const [year, month, day] = dateKey.split('-').map(Number);
    const date = new Date(Date.UTC(year, month - 1, day));
    date.setUTCDate(date.getUTCDate() + days);
    return date.toISOString().slice(0, 10);
  }

  private getRevenueReportDay(
    days: Map<string, MutableRevenueReportDayNode>,
    date: string,
  ) {
    let day = days.get(date);
    if (!day) {
      day = {
        date,
        ...this.emptyRevenueReportTotals(),
        stores: new Map(),
      };
      days.set(date, day);
    }
    return day;
  }

  private getRevenueReportStore(
    day: MutableRevenueReportDayNode,
    store: { id: string; name: string; slug: string | null },
  ) {
    let node = day.stores.get(store.id);
    if (!node) {
      node = {
        store: { id: store.id, name: store.name, slug: store.slug ?? null },
        ...this.emptyRevenueReportTotals(),
        coupons: new Map(),
      };
      day.stores.set(store.id, node);
    }
    return node;
  }

  private getRevenueReportCoupon(
    store: MutableRevenueReportStoreNode,
    bill: {
      coupon: { id: string; code: string; name: string } | null;
      couponIssue: { id: string; code: string; status: string } | null;
    },
  ) {
    const key = bill.coupon?.id ?? bill.couponIssue?.code ?? 'NO_COUPON';
    let node = store.coupons.get(key);
    if (!node) {
      node = {
        coupon: {
          id: bill.coupon?.id ?? null,
          code: bill.coupon?.code ?? bill.couponIssue?.code ?? 'NO_COUPON',
          name:
            bill.coupon?.name ??
            (bill.couponIssue ? 'Coupon issue' : 'Khong dung ma'),
        },
        ...this.emptyRevenueReportTotals(),
        bills: [],
      };
      store.coupons.set(key, node);
    }
    return node;
  }

  private async resolveBookingTarget(
    dto: CreateBookingDto,
  ): Promise<BookingTarget> {
    const castId = this.cleanText(dto.castId);
    const castSlug = this.cleanText(dto.castSlug);
    const storeId = this.cleanText(dto.storeId);
    const storeSlug = this.cleanText(dto.storeSlug);

    if (castId || castSlug) {
      const cast = await this.prisma.cast.findFirst({
        where: {
          ...(castId ? { id: castId } : { slug: castSlug }),
          deletedAt: null,
          status: 'ACTIVE',
          isPublic: true,
          store: {
            deletedAt: null,
            status: 'ACTIVE',
          },
        },
        select: {
          id: true,
          slug: true,
          stageName: true,
          publicAlias: true,
          store: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
        },
      });

      if (!cast) {
        throw new NotFoundException('Cast not found');
      }

      if (
        (storeId && cast.store.id !== storeId) ||
        (storeSlug && cast.store.slug !== storeSlug)
      ) {
        throw new BadRequestException('Cast does not belong to selected store');
      }

      return {
        store: cast.store,
        cast: {
          id: cast.id,
          slug: cast.slug,
          stageName: cast.stageName,
          publicAlias: cast.publicAlias,
        },
      };
    }

    if (!storeId && !storeSlug) {
      throw new BadRequestException('storeId or storeSlug is required');
    }

    const store = await this.prisma.store.findFirst({
      where: {
        ...(storeId ? { id: storeId } : { slug: storeSlug }),
        deletedAt: null,
        status: 'ACTIVE',
      },
      select: {
        id: true,
        name: true,
        slug: true,
      },
    });

    if (!store) {
      throw new NotFoundException('Store not found');
    }

    return { store };
  }

  private sanitizeBookingContact(dto: CreateBookingDto) {
    const displayName = this.cleanText(dto.displayName);
    const phone = this.cleanText(dto.phone);
    const email = this.cleanEmail(dto.email);

    if (!displayName || (!email && !phone)) {
      throw new BadRequestException('displayName and email are required');
    }

    return {
      displayName,
      phone,
      email,
      note: this.cleanText(dto.note),
    };
  }

  private async resolveBookingCouponLink(input: {
    dto: CreateBookingDto;
    target: BookingTarget;
    userId?: string;
    phone?: string;
    prisma?: Prisma.TransactionClient;
  }) {
    const prisma = input.prisma ?? this.prisma;
    const couponId = this.cleanText(input.dto.couponId);
    const couponIssueId = this.cleanText(input.dto.couponIssueId);

    if (!couponId && !couponIssueId) {
      return {};
    }

    const now = new Date();

    if (couponIssueId) {
      const issue = await prisma.couponIssue.findFirst({
        where: {
          id: couponIssueId,
          coupon: { deletedAt: null },
        },
        select: {
          id: true,
          couponId: true,
          userId: true,
          status: true,
          expiresAt: true,
          guest: { select: { phone: true } },
          booking: { select: { id: true } },
          coupon: {
            select: {
              id: true,
              storeId: true,
            },
          },
        },
      });

      if (!issue) {
        throw new NotFoundException('Coupon issue not found');
      }

      if (couponId && couponId !== issue.couponId) {
        throw new BadRequestException(
          'couponId must match couponIssue.couponId',
        );
      }

      if (issue.coupon.storeId !== input.target.store.id) {
        throw new UnprocessableEntityException(
          'Coupon issue does not belong to the booking store',
        );
      }

      if (issue.booking) {
        throw new UnprocessableEntityException(
          'Coupon issue is already linked to a booking',
        );
      }

      if (input.userId) {
        if (issue.userId && issue.userId !== input.userId) {
          throw new UnprocessableEntityException(
            'Coupon issue does not belong to this member',
          );
        }
      } else if (issue.userId) {
        throw new UnprocessableEntityException(
          'Member coupon issue cannot be linked to a guest booking',
        );
      }

      if (
        issue.guest?.phone &&
        (!input.phone || issue.guest.phone !== input.phone)
      ) {
        throw new UnprocessableEntityException(
          'Coupon issue phone does not match booking phone',
        );
      }

      if (issue.status !== 'ISSUED') {
        throw new UnprocessableEntityException(
          'Coupon issue is not available for booking',
        );
      }

      if (issue.expiresAt && issue.expiresAt <= now) {
        await this.expireIssuedCouponIssues({ id: issue.id }, prisma);
        throw new UnprocessableEntityException('Coupon issue has expired');
      }

      return {
        couponId: issue.couponId,
        couponIssueId: issue.id,
      };
    }

    const coupon = await prisma.coupon.findFirst({
      where: {
        id: couponId,
        storeId: input.target.store.id,
        status: 'ACTIVE',
        deletedAt: null,
        OR: [{ endsAt: null }, { endsAt: { gt: now } }],
      },
      select: { id: true },
    });

    if (!coupon) {
      throw new NotFoundException('Coupon not found');
    }

    return { couponId: coupon.id };
  }

  private resolveBillUsedAt(dto: CreateBillDto) {
    const usedAt = new Date(dto.usedAt);
    if (Number.isNaN(usedAt.getTime())) {
      throw new BadRequestException('usedAt must be a valid ISO date');
    }

    return usedAt;
  }

  private extractBillOcrAmount(text: string) {
    const candidates: number[] = [];
    const normalized = text.replace(/\s+/g, ' ');
    const labeledAmountPattern =
      /(tong|tổng|total|amount|thanh\s*toan|thanh\s*toán|paid|cong|cộng)[^\d]{0,30}([\d][\d.,\s]{3,})/gi;
    let labeledMatch: RegExpExecArray | null;

    while ((labeledMatch = labeledAmountPattern.exec(normalized))) {
      const amount = this.parseBillOcrMoney(labeledMatch[2] ?? '');
      if (amount) {
        candidates.push(amount);
      }
    }

    const anyAmountPattern =
      /(?:vnd|đ|d)?\s*([\d][\d.,\s]{4,})(?:\s*(?:vnd|đ|d))?/gi;
    let anyMatch: RegExpExecArray | null;
    while ((anyMatch = anyAmountPattern.exec(normalized))) {
      const amount = this.parseBillOcrMoney(anyMatch[1] ?? '');
      if (amount) {
        candidates.push(amount);
      }
    }

    return candidates.length ? Math.max(...candidates) : null;
  }

  private parseBillOcrMoney(value: string) {
    const digits = value.replace(/[^\d]/g, '');
    if (digits.length < 5) {
      return null;
    }

    const amount = Number(digits);
    return Number.isSafeInteger(amount) && amount >= 10_000 ? amount : null;
  }

  private extractBillOcrUsedAt(text: string) {
    const isoMatch = text.match(
      /\b(20\d{2})[-/](\d{1,2})[-/](\d{1,2})(?:[ T_-](\d{1,2})[:h-](\d{1,2}))?\b/,
    );
    if (isoMatch) {
      return this.buildBillOcrDate(
        Number(isoMatch[1]),
        Number(isoMatch[2]),
        Number(isoMatch[3]),
        Number(isoMatch[4] ?? 12),
        Number(isoMatch[5] ?? 0),
      );
    }

    const vnMatch = text.match(
      /\b(\d{1,2})[-/](\d{1,2})[-/](20\d{2})(?:[ T_-](\d{1,2})[:h-](\d{1,2}))?\b/,
    );
    if (vnMatch) {
      return this.buildBillOcrDate(
        Number(vnMatch[3]),
        Number(vnMatch[2]),
        Number(vnMatch[1]),
        Number(vnMatch[4] ?? 12),
        Number(vnMatch[5] ?? 0),
      );
    }

    return null;
  }

  private buildBillOcrDate(
    year: number,
    month: number,
    day: number,
    hour: number,
    minute: number,
  ) {
    if (
      !Number.isInteger(year) ||
      !Number.isInteger(month) ||
      !Number.isInteger(day) ||
      month < 1 ||
      month > 12 ||
      day < 1 ||
      day > 31 ||
      hour < 0 ||
      hour > 23 ||
      minute < 0 ||
      minute > 59
    ) {
      return null;
    }

    const date = new Date(Date.UTC(year, month - 1, day, hour - 7, minute));
    return Number.isFinite(date.getTime()) ? date : null;
  }

  private assertBillSubmissionWindow(usedAt: Date, now: Date) {
    const usageAgeMs = now.getTime() - usedAt.getTime();
    if (usageAgeMs < 0) {
      throw new BadRequestException('usedAt cannot be in the future');
    }

    if (usageAgeMs > BILL_SUBMISSION_DEADLINE_MS) {
      throw new UnprocessableEntityException(
        `Bill can only be submitted within ${BILL_SUBMISSION_DEADLINE_DAYS} days of usage time`,
      );
    }
  }

  private async resolvePartnerBillSubmitter(user: AuthenticatedUser) {
    if (user.role !== 'PARTNER') {
      return {
        submittedByUserId: user.id,
        submittedByPartnerAccountId: null,
      };
    }

    const partnerAccount = await this.prisma.partnerAccount.findFirst({
      where: { userId: user.id, deletedAt: null },
      select: { id: true },
    });

    return {
      submittedByUserId: partnerAccount ? null : user.id,
      submittedByPartnerAccountId: partnerAccount?.id ?? null,
    };
  }

  private billSubmitterActorClauses(input: {
    userId?: string | null;
    submittedByUserId?: string | null;
    submittedByPartnerAccountId?: string | null;
  }): Prisma.BillWhereInput[] {
    const clauses: Prisma.BillWhereInput[] = [];

    if (input.userId) {
      clauses.push({ userId: input.userId });
    }

    if (input.submittedByUserId) {
      clauses.push({ submittedByUserId: input.submittedByUserId });
    }

    if (input.submittedByPartnerAccountId) {
      clauses.push({
        submittedByPartnerAccountId: input.submittedByPartnerAccountId,
      });
    }

    return clauses;
  }

  private async assertBillSubmissionRateLimitAndDuplicate(input: {
    submitterType: 'MEMBER' | 'PARTNER';
    userId?: string | null;
    submittedByUserId?: string | null;
    submittedByPartnerAccountId?: string | null;
    storeId: string;
    totalVnd: number;
    usedAt: Date;
    now: Date;
  }) {
    const actorClauses = this.billSubmitterActorClauses(input);
    if (!actorClauses.length) {
      return;
    }

    const recentCount = await this.prisma.bill.count({
      where: {
        deletedAt: null,
        storeId: input.storeId,
        submitterType: input.submitterType,
        submittedAt: {
          gte: new Date(
            input.now.getTime() - BILL_SUBMISSION_RATE_LIMIT_WINDOW_MS,
          ),
          lte: input.now,
        },
        OR: actorClauses,
      },
    });

    if (recentCount >= BILL_SUBMISSION_RATE_LIMIT) {
      throw new UnprocessableEntityException(
        'Too many bill submissions. Please try again later',
      );
    }

    const duplicateBill = await this.prisma.bill.findFirst({
      where: {
        deletedAt: null,
        storeId: input.storeId,
        totalVnd: input.totalVnd,
        status: { not: 'VOIDED' },
        usedAt: {
          gte: new Date(input.usedAt.getTime() - BILL_DUPLICATE_WINDOW_MS),
          lte: new Date(input.usedAt.getTime() + BILL_DUPLICATE_WINDOW_MS),
        },
        OR: actorClauses,
      },
      select: { id: true, billNumber: true },
    });

    if (duplicateBill) {
      throw new UnprocessableEntityException(
        'Possible duplicate bill submission',
      );
    }
  }

  private async recordBillSubmissionAudit(input: {
    actorId?: string | null;
    actorRole?: string | null;
    billId: string;
    submitterType: 'MEMBER' | 'PARTNER';
    storeId: string;
    bookingId?: string | null;
    couponId?: string | null;
    couponIssueId?: string | null;
    submittedByUserId?: string | null;
    submittedByPartnerAccountId?: string | null;
    totalVnd: number;
    usedAt: Date;
    submittedAt: Date;
  }) {
    const snapshot = {
      submitterType: input.submitterType,
      actorRole: input.actorRole ?? null,
      storeId: input.storeId,
      bookingId: input.bookingId ?? null,
      couponId: input.couponId ?? null,
      couponIssueId: input.couponIssueId ?? null,
      submittedByUserId: input.submittedByUserId ?? null,
      submittedByPartnerAccountId: input.submittedByPartnerAccountId ?? null,
      totalVnd: input.totalVnd,
      usedAt: input.usedAt.toISOString(),
      submittedAt: input.submittedAt.toISOString(),
    };

    await this.prisma.auditLog.create({
      data: {
        actorId: input.actorId ?? undefined,
        action: 'bill.submit',
        targetType: 'Bill',
        targetId: input.billId,
        metadata: this.toPrismaJson(snapshot),
        afterJson: this.toPrismaJson(snapshot),
      },
    });
  }

  private async recordBillCouponLinkAudit(input: {
    actorId?: string | null;
    actorRole?: string | null;
    billId: string;
    storeId: string;
    bookingId?: string | null;
    couponId?: string | null;
    couponIssueId?: string | null;
    couponIssueStatus?: string | null;
    source: 'booking' | 'direct';
  }) {
    if (!input.couponId && !input.couponIssueId) {
      return;
    }

    const snapshot = {
      source: input.source,
      actorRole: input.actorRole ?? null,
      storeId: input.storeId,
      bookingId: input.bookingId ?? null,
      couponId: input.couponId ?? null,
      couponIssueId: input.couponIssueId ?? null,
      couponIssueStatus: input.couponIssueStatus ?? null,
    };

    await this.prisma.auditLog.create({
      data: {
        actorId: input.actorId ?? undefined,
        action: 'bill.coupon.link',
        targetType: 'Bill',
        targetId: input.billId,
        metadata: this.toPrismaJson(snapshot),
        afterJson: this.toPrismaJson(snapshot),
      },
    });
  }

  private async resolveBillCouponLink(input: {
    dto: CreateBillDto;
    booking?: {
      id: string;
      guestId: string | null;
      couponId: string | null;
      couponIssueId: string | null;
      coupon?: CouponSummary | null;
      couponIssue?: { id: string; code: string; status: string } | null;
    } | null;
    store: StoreSummary;
    user?: AuthenticatedUser;
  }) {
    const requestedCouponId = this.cleanText(input.dto.couponId);
    const requestedCouponIssueId = this.cleanText(input.dto.couponIssueId);
    let couponId = input.booking?.couponId ?? undefined;
    let couponIssueId = input.booking?.couponIssueId ?? undefined;
    let couponIssueCode = input.booking?.couponIssue?.code;
    let couponIssueStatus = input.booking?.couponIssue?.status;
    let coupon = input.booking?.coupon ?? null;
    let userId: string | null | undefined;
    let guestId: string | null | undefined;

    if (
      requestedCouponIssueId &&
      input.booking?.couponIssueId &&
      requestedCouponIssueId !== input.booking.couponIssueId
    ) {
      throw new BadRequestException(
        'couponIssueId must match the booking couponIssueId',
      );
    }

    if (
      requestedCouponId &&
      input.booking?.couponId &&
      requestedCouponId !== input.booking.couponId
    ) {
      throw new BadRequestException('couponId must match the booking couponId');
    }

    if (requestedCouponIssueId) {
      const issue = await this.prisma.couponIssue.findFirst({
        where: {
          id: requestedCouponIssueId,
          coupon: { deletedAt: null },
        },
        select: {
          id: true,
          code: true,
          couponId: true,
          userId: true,
          guestId: true,
          status: true,
          expiresAt: true,
          bill: { select: { id: true } },
          coupon: {
            select: {
              id: true,
              code: true,
              name: true,
              storeId: true,
            },
          },
        },
      });

      if (!issue) {
        throw new NotFoundException('Coupon issue not found');
      }

      if (issue.coupon.storeId !== input.store.id) {
        throw new UnprocessableEntityException(
          'Coupon issue does not belong to the bill store',
        );
      }

      if (issue.bill) {
        throw new UnprocessableEntityException(
          'Coupon issue is already linked to a bill',
        );
      }

      if (input.user?.role === 'USER') {
        if (issue.userId && issue.userId !== input.user.id) {
          throw new UnprocessableEntityException(
            'Coupon issue does not belong to this member',
          );
        }

        if (!issue.userId && !input.booking) {
          throw new UnprocessableEntityException(
            'Guest coupon issue requires a linked booking for member bill submission',
          );
        }

        if (
          !issue.userId &&
          input.booking?.guestId &&
          issue.guestId !== input.booking.guestId
        ) {
          throw new UnprocessableEntityException(
            'Coupon issue does not belong to the bill booking guest',
          );
        }
      }

      if (!['ISSUED', 'USED'].includes(issue.status)) {
        throw new UnprocessableEntityException(
          'Coupon issue is not available for bill reconciliation',
        );
      }

      if (
        issue.status === 'ISSUED' &&
        issue.expiresAt &&
        issue.expiresAt <= new Date()
      ) {
        await this.expireIssuedCouponIssues({ id: issue.id });
        throw new UnprocessableEntityException('Coupon issue has expired');
      }

      couponId = issue.couponId;
      couponIssueId = issue.id;
      couponIssueCode = issue.code;
      couponIssueStatus = issue.status;
      userId = issue.userId;
      guestId = issue.guestId;
      coupon = {
        id: issue.coupon.id,
        code: issue.coupon.code,
        name: issue.coupon.name,
      };
    }

    if (requestedCouponId) {
      if (couponId && requestedCouponId !== couponId) {
        throw new BadRequestException(
          'couponId must match couponIssue.couponId',
        );
      }

      if (!couponId || !coupon) {
        const requiresActiveCampaign =
          !requestedCouponIssueId &&
          !input.booking?.couponId &&
          !input.booking?.couponIssueId;
        const requestedCoupon = await this.prisma.coupon.findFirst({
          where: {
            id: requestedCouponId,
            storeId: input.store.id,
            deletedAt: null,
            ...(requiresActiveCampaign
              ? {
                  status: 'ACTIVE',
                  OR: [{ endsAt: null }, { endsAt: { gt: new Date() } }],
                }
              : {}),
          },
          select: {
            id: true,
            code: true,
            name: true,
          },
        });

        if (!requestedCoupon) {
          throw new NotFoundException(
            requiresActiveCampaign
              ? 'Active coupon not found'
              : 'Coupon not found',
          );
        }

        couponId = requestedCoupon.id;
        coupon = requestedCoupon;
      }
    }

    return {
      couponId,
      couponIssueId,
      couponIssueCode,
      couponIssueStatus,
      coupon,
      userId,
      guestId,
    };
  }

  private async resolveBillStore(dto: CreateBillDto) {
    const storeId = this.cleanText(dto.storeId);
    const storeSlug = this.cleanText(dto.storeSlug);
    const couponId = this.cleanText(dto.couponId);
    const couponIssueId = this.cleanText(dto.couponIssueId);

    if (!storeId && !storeSlug) {
      if (couponIssueId) {
        const issue = await this.prisma.couponIssue.findFirst({
          where: {
            id: couponIssueId,
            coupon: {
              deletedAt: null,
              store: { deletedAt: null, status: 'ACTIVE' },
            },
          },
          select: {
            coupon: {
              select: {
                store: { select: { id: true, name: true, slug: true } },
              },
            },
          },
        });

        if (!issue) {
          throw new NotFoundException('Coupon issue not found');
        }

        return issue.coupon.store;
      }

      if (couponId) {
        const coupon = await this.prisma.coupon.findFirst({
          where: {
            id: couponId,
            deletedAt: null,
            store: { deletedAt: null, status: 'ACTIVE' },
          },
          select: {
            store: { select: { id: true, name: true, slug: true } },
          },
        });

        if (!coupon) {
          throw new NotFoundException('Coupon not found');
        }

        return coupon.store;
      }

      throw new BadRequestException(
        'bookingId, storeId, storeSlug, couponId, or couponIssueId is required',
      );
    }

    const store = await this.prisma.store.findFirst({
      where: {
        ...(storeId ? { id: storeId } : { slug: storeSlug }),
        deletedAt: null,
        status: 'ACTIVE',
      },
      select: {
        id: true,
        name: true,
        slug: true,
      },
    });

    if (!store) {
      throw new NotFoundException('Store not found');
    }

    return store;
  }

  private buildBillNumber(now: Date) {
    const dateToken = now.toISOString().slice(0, 10).replace(/-/g, '');
    const randomToken = randomUUID().slice(0, 8).toUpperCase();

    return `BILL-${dateToken}-${randomToken}`;
  }

  private async issueBookingCouponQr(input: {
    couponId: string;
    target: BookingTarget;
    user?: AuthenticatedUser;
    guestId: string;
    phone?: string;
    scheduledAt: Date;
    context?: CouponClaimContext;
    prisma?: Prisma.TransactionClient;
  }) {
    const prisma = input.prisma ?? this.prisma;
    const now = new Date();
    const coupon = await prisma.coupon.findFirst({
      where: {
        id: input.couponId,
        storeId: input.target.store.id,
        status: 'ACTIVE',
        deletedAt: null,
        OR: [{ endsAt: null }, { endsAt: { gt: now } }],
      },
      select: {
        id: true,
        code: true,
        name: true,
        storeId: true,
        discountType: true,
        discountValue: true,
        maxDiscountVnd: true,
        minSpendVnd: true,
        endsAt: true,
        usageLimit: true,
        usedCount: true,
        store: { select: { id: true, name: true, slug: true } },
      },
    });

    if (!coupon) {
      throw new NotFoundException('Coupon not found');
    }

    if (coupon.usageLimit !== null && coupon.usedCount >= coupon.usageLimit) {
      throw new UnprocessableEntityException(
        'Coupon usage limit has been reached',
      );
    }

    const userType = input.user
      ? this.resolveCouponUserType(input.user)
      : 'GUEST';
    const recipientType = input.user ? 'MEMBER' : 'GUEST';
    const validityMs = userType === 'GUEST' ? DAY_MS : 7 * DAY_MS;
    const expiresAt = this.capExpiry(
      new Date(input.scheduledAt.getTime() + validityMs),
      coupon.endsAt,
    );
    const issueId = randomUUID();
    const issueCode = `${recipientType}-${randomUUID()}`;
    const qrPayload = this.buildCouponQrPayload(issueId);
    const qrTokenHash = this.buildCouponQrTokenHashFromPayload(qrPayload);
    const discountRuleSnapshot = this.buildCouponDiscountRuleSnapshot(
      coupon,
      userType,
      input.user?.tier ?? null,
    );

    const issue = await prisma.couponIssue.create({
      data: {
        id: issueId,
        couponId: coupon.id,
        userId: input.user?.id,
        guestId: input.guestId,
        code: issueCode,
        qrPayloadHash: this.buildCouponQrPayloadHash(qrPayload),
        expiresAt,
        metadata: {
          sourceFlow: 'BOOKING_QR',
          recipientType,
          userType,
          tier: input.user?.tier ?? null,
          ...(userType === 'GUEST'
            ? { validityHours: 24 }
            : { validityDays: 7 }),
          expiresFrom: 'BOOKING_SCHEDULED_AT',
          bookingScheduledAt: input.scheduledAt.toISOString(),
          qrPayload,
          qrPayloadType: 'SIGNED_DEEP_LINK',
          qrTokenHash,
          revokedQrTokenHashes: [],
          statusLabel: this.couponIssueStatusLabel('ISSUED'),
          discountPercent: discountRuleSnapshot.discountPercent,
          discountRuleSnapshot,
          campaignSnapshot: this.buildCouponCampaignSnapshot(coupon),
          claimContext: this.buildCouponClaimContextSnapshot(
            input.context ?? {},
          ),
        },
      },
      select: {
        id: true,
        code: true,
        couponId: true,
        status: true,
        metadata: true,
        coupon: { select: { storeId: true } },
      },
    });

    await this.writeCouponIssueAudit({
      action: 'COUPON_ISSUE_BOOKING_QR_ISSUED',
      issue,
      actorId: input.user?.id,
      metadata: {
        sourceFlow: 'BOOKING_QR',
        customerType: userType,
        guestId: input.guestId,
        scheduledAt: input.scheduledAt.toISOString(),
      },
      afterJson: {
        id: issue.id,
        code: issue.code,
        couponId: issue.couponId,
        status: issue.status,
        sourceFlow: 'BOOKING_QR',
      },
      prisma,
    });

    const claimKey = input.user
      ? `user:${input.user.id}`
      : `phone:${input.phone ?? input.guestId}`;
    const context = input.context ?? {};
    await this.recordCouponClaimEvent({
      claimKey,
      coupon,
      issue,
      context,
      recipientType,
      userId: input.user?.id,
      guestId: input.guestId,
      prisma,
    });
    await this.detectCouponClaimFraud({
      claimKey,
      coupon,
      issue,
      context,
      prisma,
    });

    return issue;
  }

  private async createBookingRecord(input: {
    dto: CreateBookingDto;
    target: BookingTarget;
    user?: AuthenticatedUser;
    userId?: string;
    guestId: string;
    phone?: string;
    note?: string;
    context?: CouponClaimContext;
  }) {
    const scheduledAt = this.resolveBookingScheduledAt(input.dto.scheduledAt);

    return this.prisma.$transaction(async (prisma) => {
      const couponLink = await this.resolveBookingCouponLink({
        dto: input.dto,
        target: input.target,
        userId: input.userId,
        phone: input.phone,
        prisma,
      });
      const bookingCouponIssueId =
        couponLink.couponIssueId ??
        (couponLink.couponId
          ? (
              await this.issueBookingCouponQr({
                couponId: couponLink.couponId,
                target: input.target,
                user: input.user,
                guestId: input.guestId,
                phone: input.phone,
                scheduledAt,
                context: input.context,
                prisma,
              })
            ).id
          : undefined);

      return prisma.booking.create({
        data: {
          userId: input.userId,
          guestId: input.guestId,
          storeId: input.target.store.id,
          castId: input.target.cast?.id,
          couponId: couponLink.couponId,
          couponIssueId: bookingCouponIssueId,
          status: 'REQUESTED',
          scheduledAt,
          partySize: input.dto.partySize,
          note: input.note,
          discountSnapshot: {
            couponId: couponLink.couponId ?? null,
            couponIssueId: bookingCouponIssueId ?? null,
          } as Prisma.InputJsonValue,
        },
        select: this.bookingNotificationSelect(),
      });
    });
  }

  private resolveBookingScheduledAt(value: string) {
    const scheduledAt = new Date(value);
    if (Number.isNaN(scheduledAt.getTime())) {
      throw new BadRequestException('scheduledAt must be a valid ISO date');
    }
    this.assertBookingDateWindow(scheduledAt);

    return scheduledAt;
  }

  private bookingChangeTargetSelect() {
    return {
      id: true,
      storeId: true,
      castId: true,
      userId: true,
      guestId: true,
      status: true,
      scheduledAt: true,
      cancelledAt: true,
      store: { select: { bookingCancelCutoffMinutes: true } },
    } satisfies Prisma.BookingSelect;
  }

  private bookingChangeRequestSelect() {
    return {
      id: true,
      bookingId: true,
      storeId: true,
      castId: true,
      requestedById: true,
      guestId: true,
      reviewedById: true,
      type: true,
      status: true,
      currentScheduledAt: true,
      requestedScheduledAt: true,
      reason: true,
      adminNote: true,
      reviewedAt: true,
      createdAt: true,
      updatedAt: true,
      booking: { select: this.bookingNotificationSelect() },
      store: {
        select: {
          id: true,
          name: true,
          slug: true,
          bookingCancelCutoffMinutes: true,
        },
      },
      cast: {
        select: {
          id: true,
          slug: true,
          stageName: true,
          publicAlias: true,
        },
      },
      requestedBy: { select: { id: true, displayName: true } },
      guest: { select: { id: true, displayName: true, phone: true } },
      reviewedBy: { select: { id: true, displayName: true } },
    } satisfies Prisma.BookingChangeRequestSelect;
  }

  private bookingChatMessageSelect() {
    return {
      id: true,
      bookingId: true,
      changeRequestId: true,
      storeId: true,
      senderUserId: true,
      guestId: true,
      senderType: true,
      topic: true,
      body: true,
      createdAt: true,
      senderUser: { select: { id: true, displayName: true, role: true } },
      guest: { select: { id: true, displayName: true, phone: true } },
    } satisfies Prisma.BookingChatMessageSelect;
  }

  private async createBookingRescheduleRequest(input: {
    booking: BookingCancelTarget;
    actorId?: string | null;
    actorType: BookingStatusActorType;
    dto: RequestBookingRescheduleDto;
  }) {
    this.assertBookingCanRequestReschedule(input.booking);

    const requestedScheduledAt = this.parseRequestedSchedule(
      input.dto.scheduledAt,
    );
    const currentScheduledAt = new Date(input.booking.scheduledAt ?? '');
    if (!Number.isFinite(currentScheduledAt.getTime())) {
      throw new BadRequestException('scheduledAt must be a valid ISO date');
    }

    if (requestedScheduledAt.getTime() <= Date.now()) {
      throw new UnprocessableEntityException(
        'New booking time must be in the future',
      );
    }

    const activeRequest = await this.prisma.bookingChangeRequest.findFirst({
      where: {
        bookingId: input.booking.id,
        type: 'RESCHEDULE',
        status: 'REQUESTED',
      },
      select: { id: true },
    });

    if (activeRequest) {
      throw new UnprocessableEntityException(
        'Booking already has a pending reschedule request',
      );
    }

    const reason = this.cleanText(input.dto.reason);
    const created = await this.prisma.bookingChangeRequest.create({
      data: {
        bookingId: input.booking.id,
        storeId: input.booking.storeId ?? '',
        castId: input.booking.castId ?? undefined,
        requestedById: input.actorId ?? undefined,
        guestId: input.booking.guestId ?? undefined,
        type: 'RESCHEDULE',
        status: 'REQUESTED',
        currentScheduledAt,
        requestedScheduledAt,
        reason: reason || null,
      },
      select: this.bookingChangeRequestSelect(),
    });

    await this.createBookingChangeAudit({
      actorId: input.actorId,
      action: 'BOOKING_RESCHEDULE_REQUESTED',
      before: null,
      after: created,
      metadata: {
        actorType: input.actorType,
        reason: reason || null,
        requestedScheduledAt: requestedScheduledAt.toISOString(),
      },
    });
    await this.createAdminBookingWorkflowNotification(
      created,
      'admin.booking.reschedule_requested.v1',
    );

    return created;
  }

  private assertBookingCanRequestReschedule(booking: BookingCancelTarget) {
    if (booking.status === 'CANCELLED') {
      throw new UnprocessableEntityException(
        'Cancelled booking cannot be rescheduled',
      );
    }

    if (['CHECKED_IN', 'COMPLETED', 'NO_SHOW'].includes(booking.status)) {
      throw new UnprocessableEntityException(
        'Booking cannot be rescheduled in its current state',
      );
    }

    const cutoffMinutes = this.resolveBookingCutoffMinutes(booking);
    const msUntilBooking =
      new Date(booking.scheduledAt ?? '').getTime() - Date.now();
    if (!Number.isFinite(msUntilBooking)) {
      throw new BadRequestException('scheduledAt must be a valid ISO date');
    }

    if (msUntilBooking < cutoffMinutes * 60 * 1000) {
      throw new UnprocessableEntityException(
        cutoffMinutes === DEFAULT_BOOKING_CUTOFF_MINUTES
          ? 'Booking can only be rescheduled at least 1 hour before scheduled time'
          : `Booking can only be rescheduled at least ${cutoffMinutes} minutes before scheduled time`,
      );
    }
  }

  private parseRequestedSchedule(value: string) {
    const requestedScheduledAt = new Date(value);
    if (!Number.isFinite(requestedScheduledAt.getTime())) {
      throw new BadRequestException('scheduledAt must be a valid ISO date');
    }

    return requestedScheduledAt;
  }

  private async createBookingChangeAudit(input: {
    actorId?: string | null;
    action: string;
    before: BookingChangeRequestRecord | null;
    after: BookingChangeRequestRecord;
    metadata?: Record<string, unknown>;
  }) {
    const beforeJson = this.buildBookingChangeRequestAuditSnapshot(
      input.before,
    );
    const afterJson = this.buildBookingChangeRequestAuditSnapshot(input.after);

    await this.prisma.auditLog.create({
      data: {
        actorId: input.actorId ?? undefined,
        action: input.action,
        targetType: 'BookingChangeRequest',
        targetId: input.after.id,
        beforeJson: this.toPrismaJson(beforeJson),
        afterJson: this.toPrismaJson(afterJson),
        metadata: {
          ...(input.metadata ?? {}),
          beforeStatus: input.before?.status ?? null,
          afterStatus: input.after.status,
        },
      },
    });
  }

  private buildBookingChangeRequestAuditSnapshot(
    request: BookingChangeRequestRecord | null,
  ) {
    if (!request) {
      return null;
    }

    return {
      id: request.id,
      bookingId: request.bookingId,
      storeId: request.storeId,
      castId: request.castId,
      requestedById: request.requestedById,
      guestId: request.guestId,
      reviewedById: request.reviewedById,
      type: request.type,
      status: request.status,
      currentScheduledAt: this.toAuditIso(request.currentScheduledAt),
      requestedScheduledAt: this.toAuditIso(request.requestedScheduledAt),
      reason: request.reason,
      adminNote: request.adminNote,
      reviewedAt: this.toAuditIso(request.reviewedAt),
    };
  }

  private async createAdminBookingWorkflowNotification(
    request: BookingChangeRequestRecord,
    templateKey: string,
  ) {
    await this.prisma.notificationLog.create({
      data: {
        storeId: request.storeId,
        bookingId: request.bookingId,
        channel: 'IN_APP',
        status: 'QUEUED',
        recipient: 'ADMIN',
        templateKey,
        payload: {
          requestId: request.id,
          bookingId: request.bookingId,
          status: request.status,
          reason: request.reason,
          requestedScheduledAt: this.toAuditIso(request.requestedScheduledAt),
          currentScheduledAt: this.toAuditIso(request.currentScheduledAt),
        },
      },
    });
  }

  private async notifyBookingCustomerTemplate(
    booking: BookingNotificationRecord | null | undefined,
    templateKey: string,
    payload: Record<string, unknown>,
  ) {
    if (!booking) {
      return;
    }

    const guestEmail = this.cleanEmail(booking.guest?.email);
    const recipient =
      booking.user?.id ??
      guestEmail ??
      booking.guest?.phone ??
      booking.guest?.id;
    if (!recipient) {
      return;
    }

    const channel = booking.user?.id ? 'IN_APP' : guestEmail ? 'EMAIL' : 'LINE';

    await this.prisma.notificationLog.create({
      data: {
        userId: booking.user?.id,
        guestId: booking.guest?.id,
        storeId: booking.storeId ?? booking.store?.id ?? undefined,
        bookingId: booking.id,
        channel,
        status: 'QUEUED',
        recipient,
        templateKey,
        payload: {
          bookingId: booking.id,
          status: booking.status,
          ...payload,
        },
      },
    });
  }

  private assertBookingDateWindow(scheduledAt: Date) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const maxDate = new Date(today);
    maxDate.setDate(maxDate.getDate() + BOOKING_DATE_WINDOW_DAYS);
    maxDate.setHours(23, 59, 59, 999);

    if (scheduledAt < today) {
      throw new BadRequestException('scheduledAt cannot be in the past');
    }

    if (scheduledAt > maxDate) {
      throw new BadRequestException(
        `scheduledAt can only be within ${BOOKING_DATE_WINDOW_DAYS} days`,
      );
    }
  }

  private async notifyGuestBookingQrEmail(booking: BookingNotificationRecord) {
    const email = this.cleanEmail(booking.guest?.email);

    if (!email) {
      return;
    }

    const bookingCode = this.bookingPublicCode(booking.id);
    const qrPayload = this.bookingQrPayload(booking);
    const qrImageDataUrl = await this.buildBookingQrImageDataUrl(qrPayload);
    const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&margin=10&data=${encodeURIComponent(qrPayload)}`;
    const amountLabel = this.bookingAmountLabel(booking);
    const payload = {
      bookingId: booking.id,
      bookingCode,
      status: booking.status,
      scheduledAt: this.toAuditIso(booking.scheduledAt),
      partySize: booking.partySize ?? null,
      storeName: booking.store?.name ?? null,
      storeSlug: booking.store?.slug ?? null,
      castName: booking.cast?.publicAlias ?? booking.cast?.stageName ?? null,
      guestName: booking.guest?.displayName ?? null,
      amountLabel,
      couponCode: booking.coupon?.code ?? null,
      couponIssueCode: booking.couponIssue?.code ?? null,
      qrPayload,
      qrImageUrl,
    } satisfies Prisma.InputJsonObject;

    let log: { id: string };
    try {
      log = await this.prisma.notificationLog.create({
        data: {
          guestId: booking.guest?.id,
          storeId: booking.storeId ?? booking.store?.id ?? undefined,
          bookingId: booking.id,
          channel: 'EMAIL',
          status: 'QUEUED',
          recipient: email,
          templateKey: 'customer.booking.qr_email.v1',
          payload,
        },
      });
    } catch (error) {
      this.logger.warn(
        `Failed to queue booking QR email notification: ${this.errorMessage(error)}`,
      );
      return;
    }

    try {
      if (!this.emailNotificationService) {
        throw new Error('EmailNotificationService is not available');
      }

      const result = await this.emailNotificationService.sendBookingQrEmail({
        to: email,
        guestName: booking.guest?.displayName,
        bookingId: booking.id,
        bookingCode,
        status: booking.status,
        storeName: booking.store?.name,
        storeSlug: booking.store?.slug,
        castName: booking.cast?.publicAlias ?? booking.cast?.stageName ?? null,
        scheduledAt: booking.scheduledAt,
        partySize: booking.partySize,
        amountLabel,
        note: booking.note,
        qrPayload,
        qrImageUrl,
        qrImageDataUrl,
      });

      await this.prisma.notificationLog.update({
        where: { id: log.id },
        data: {
          status: 'SENT',
          sentAt: new Date(),
          error: null,
          payload: {
            ...payload,
            providerMessageId: result.messageId ?? null,
          },
        },
      });
    } catch (error) {
      this.logger.warn(`Booking QR email failed: ${this.errorMessage(error)}`);
      await this.prisma.notificationLog
        .update({
          where: { id: log.id },
          data: {
            status: 'FAILED',
            error: this.errorMessage(error),
          },
        })
        .catch((logError) => {
          this.logger.warn(
            `Failed to update booking QR email notification log: ${this.errorMessage(logError)}`,
          );
        });
    }
  }

  private bookingPublicCode(bookingId: string) {
    return `BK-${bookingId.slice(0, 8).toUpperCase()}`;
  }

  private bookingQrPayload(booking: BookingNotificationRecord) {
    return [
      'NLBOOKING',
      booking.id,
      this.bookingPublicCode(booking.id),
      booking.store?.slug ?? 'nightlife',
      this.toAuditIso(booking.scheduledAt) ?? '',
    ].join('|');
  }

  private async buildBookingQrImageDataUrl(payload: string) {
    return QRCode.toDataURL(payload, {
      errorCorrectionLevel: 'M',
      margin: 1,
      width: 220,
    });
  }

  private bookingAmountLabel(booking: BookingNotificationRecord) {
    if (typeof booking.totalVnd === 'number' && booking.totalVnd > 0) {
      return this.formatVnd(booking.totalVnd);
    }

    return 'Miễn phí - không thu cọc';
  }

  private formatVnd(value: number) {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      maximumFractionDigits: 0,
    }).format(value);
  }

  private async findMemberBookingChatTarget(
    user: AuthenticatedUser,
    bookingId: string,
  ) {
    const booking = await this.prisma.booking.findFirst({
      where: {
        id: bookingId,
        userId: user.id,
        deletedAt: null,
      },
      select: this.bookingChangeTargetSelect(),
    });

    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    return booking;
  }

  private async findGuestBookingChatTarget(bookingId: string, phone: string) {
    const cleanedPhone = this.cleanText(phone);
    if (!cleanedPhone) {
      throw new BadRequestException('phone is required');
    }

    const booking = await this.prisma.booking.findFirst({
      where: {
        id: bookingId,
        userId: null,
        deletedAt: null,
        guest: {
          is: {
            phone: cleanedPhone,
          },
        },
      },
      select: this.bookingChangeTargetSelect(),
    });

    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    return booking;
  }

  private async findAdminBookingChatTarget(
    user: AuthenticatedUser,
    bookingId: string,
  ) {
    const booking = await this.prisma.booking.findFirst({
      where: {
        id: bookingId,
        deletedAt: null,
      },
      select: this.bookingChangeTargetSelect(),
    });

    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    await this.accessService.ensureStoreAccess(
      user,
      booking.storeId,
      'booking.chat',
    );

    return booking;
  }

  private listBookingChatMessages(bookingId: string) {
    return this.prisma.bookingChatMessage.findMany({
      where: { bookingId },
      orderBy: { createdAt: 'asc' },
      take: 200,
      select: this.bookingChatMessageSelect(),
    });
  }

  private async createBookingChatMessage(input: {
    booking: BookingCancelTarget;
    dto: BookingChatMessageDto;
    senderType: BookingChatSenderType;
    senderUserId?: string | null;
    guestId?: string | null;
  }) {
    const body = this.cleanText(input.dto.message);
    if (!body) {
      throw new BadRequestException('message is required');
    }

    if (input.dto.changeRequestId) {
      await this.assertChangeRequestBelongsToBooking(
        input.dto.changeRequestId,
        input.booking.id,
      );
    }

    const topic = (input.dto.topic ?? 'GENERAL') as BookingChatTopic;
    const message = await this.prisma.bookingChatMessage.create({
      data: {
        bookingId: input.booking.id,
        changeRequestId: input.dto.changeRequestId,
        storeId: input.booking.storeId ?? '',
        senderUserId: input.senderUserId ?? undefined,
        guestId: input.guestId ?? undefined,
        senderType: input.senderType,
        topic,
        body,
      },
      select: this.bookingChatMessageSelect(),
    });

    this.socketGateway?.notifyBookingChatMessage(input.booking.id, message);
    await this.createBookingChatNotification(message);

    return message;
  }

  private async assertChangeRequestBelongsToBooking(
    changeRequestId: string,
    bookingId: string,
  ) {
    const changeRequest = await this.prisma.bookingChangeRequest.findFirst({
      where: { id: changeRequestId, bookingId },
      select: { id: true },
    });

    if (!changeRequest) {
      throw new BadRequestException(
        'changeRequestId does not belong to this booking',
      );
    }
  }

  private async createBookingChatNotification(
    message: BookingChatMessageRecord,
  ) {
    const isStaffMessage = ['ADMIN', 'OPERATOR'].includes(message.senderType);
    await this.prisma.notificationLog.create({
      data: {
        userId: isStaffMessage
          ? undefined
          : (message.senderUserId ?? undefined),
        guestId: message.guestId ?? undefined,
        storeId: message.storeId,
        bookingId: message.bookingId,
        channel: 'IN_APP',
        status: 'QUEUED',
        recipient: isStaffMessage
          ? (message.guest?.phone ?? message.guestId ?? message.bookingId)
          : 'ADMIN',
        templateKey: isStaffMessage
          ? 'customer.booking.chat_message.v1'
          : 'admin.booking.chat_message.v1',
        payload: {
          messageId: message.id,
          bookingId: message.bookingId,
          changeRequestId: message.changeRequestId,
          senderType: message.senderType,
          topic: message.topic,
        },
      },
    });
  }

  private resolveBookingChatSenderType(user: AuthenticatedUser) {
    return user.role === 'OPERATOR' || user.role === 'STAFF'
      ? 'OPERATOR'
      : 'ADMIN';
  }

  private resolveAnalyticsDays(value?: string | number) {
    const days = Number(value ?? 30);
    if (!Number.isInteger(days) || days < 1 || days > 365) {
      throw new BadRequestException('days must be an integer from 1 to 365');
    }

    return days;
  }

  private addCancelAnalyticsMetric(
    metrics: Map<string, CancelAnalyticsMetric>,
    key: string,
    base: Record<string, unknown>,
    cancelled: boolean,
  ) {
    const current =
      metrics.get(key) ??
      ({
        ...base,
        totalBookings: 0,
        cancelledBookings: 0,
        cancelRate: 0,
      } as CancelAnalyticsMetric);

    current.totalBookings += 1;
    if (cancelled) {
      current.cancelledBookings += 1;
    }
    current.cancelRate = this.calculateCancelRate(
      current.cancelledBookings,
      current.totalBookings,
    );
    metrics.set(key, current);
  }

  private sortCancelAnalyticsMetrics(
    metrics: Map<string, CancelAnalyticsMetric>,
  ) {
    return Array.from(metrics.values()).sort((first, second) => {
      if (second.cancelledBookings !== first.cancelledBookings) {
        return second.cancelledBookings - first.cancelledBookings;
      }

      return second.totalBookings - first.totalBookings;
    });
  }

  private calculateCancelRate(
    cancelledBookings: number,
    totalBookings: number,
  ) {
    if (!totalBookings) {
      return 0;
    }

    return Math.round((cancelledBookings / totalBookings) * 10000) / 100;
  }

  private bookingNotificationSelect() {
    return {
      id: true,
      storeId: true,
      castId: true,
      status: true,
      scheduledAt: true,
      partySize: true,
      subtotalVnd: true,
      discountVnd: true,
      totalVnd: true,
      discountSnapshot: true,
      note: true,
      cancelledAt: true,
      createdAt: true,
      store: { select: { id: true, name: true, slug: true } },
      cast: {
        select: {
          id: true,
          slug: true,
          stageName: true,
          publicAlias: true,
        },
      },
      user: {
        select: { id: true, email: true, displayName: true, tier: true },
      },
      guest: {
        select: { id: true, displayName: true, phone: true, email: true },
      },
      coupon: { select: { id: true, code: true, name: true } },
      couponIssue: { select: { id: true, code: true, status: true } },
    } satisfies Prisma.BookingSelect;
  }

  private partnerBookingQrSelect() {
    return {
      id: true,
      storeId: true,
      userId: true,
      guestId: true,
      status: true,
      scheduledAt: true,
      cancelledAt: true,
      store: { select: { id: true, name: true, slug: true } },
      coupon: { select: { id: true, code: true, name: true } },
      couponIssue: { select: { id: true, code: true, status: true } },
      user: { select: { id: true, displayName: true, tier: true } },
      guest: { select: { id: true, displayName: true, phone: true } },
      qr: {
        select: {
          id: true,
          code: true,
          status: true,
          expiresAt: true,
          usedAt: true,
        },
      },
    } satisfies Prisma.BookingSelect;
  }

  private billReviewSelect() {
    return {
      id: true,
      billNumber: true,
      status: true,
      reviewedAt: true,
      verifiedAt: true,
      rejectedAt: true,
      reviewedById: true,
      verifiedById: true,
      rejectedById: true,
      rejectReason: true,
      subtotalVnd: true,
      discountVnd: true,
      serviceChargeVnd: true,
      taxVnd: true,
      totalVnd: true,
      paidVnd: true,
      commissionAmountVnd: true,
      pointsEarned: true,
      discountRuleSnapshot: true,
      commissionRuleSnapshot: true,
      pointRuleSnapshot: true,
      usedAt: true,
      store: { select: { id: true, name: true, slug: true } },
      booking: { select: { id: true, status: true, scheduledAt: true } },
      coupon: {
        select: {
          id: true,
          code: true,
          name: true,
          discountType: true,
          discountValue: true,
          maxDiscountVnd: true,
          minSpendVnd: true,
        },
      },
      couponIssue: {
        select: { id: true, code: true, status: true, metadata: true },
      },
      user: {
        select: { id: true, displayName: true, role: true, tier: true },
      },
      guest: { select: { id: true, displayName: true, phone: true } },
    } satisfies Prisma.BillSelect;
  }

  private async findSensitiveBillForReview(billId: string) {
    const bill = await this.prisma.bill.findFirst({
      where: {
        id: billId,
        deletedAt: null,
      },
      select: this.billReviewSelect(),
    });

    if (!bill) {
      throw new NotFoundException('Bill not found');
    }

    return bill;
  }

  private billNotificationSelect() {
    return {
      id: true,
      billNumber: true,
      status: true,
      submitterType: true,
      subtotalVnd: true,
      discountVnd: true,
      serviceChargeVnd: true,
      taxVnd: true,
      totalVnd: true,
      paidVnd: true,
      commissionAmountVnd: true,
      pointsEarned: true,
      discountRuleSnapshot: true,
      commissionRuleSnapshot: true,
      pointRuleSnapshot: true,
      submittedAt: true,
      reviewedAt: true,
      verifiedAt: true,
      rejectedAt: true,
      reviewedById: true,
      verifiedById: true,
      rejectedById: true,
      rejectReason: true,
      usedAt: true,
      updatedAt: true,
      store: { select: { id: true, name: true, slug: true } },
      booking: { select: { id: true, status: true, scheduledAt: true } },
      coupon: { select: { id: true, code: true, name: true } },
      couponIssue: { select: { id: true, code: true, status: true } },
      user: { select: { id: true, displayName: true, tier: true } },
      guest: { select: { id: true, displayName: true, phone: true } },
    } satisfies Prisma.BillSelect;
  }

  private customerNotificationSelect() {
    return {
      id: true,
      status: true,
      templateKey: true,
      payload: true,
      createdAt: true,
      sentAt: true,
      billId: true,
      bookingId: true,
      store: { select: { id: true, name: true, slug: true } },
      booking: {
        select: {
          id: true,
          status: true,
          scheduledAt: true,
          store: { select: { id: true, name: true, slug: true } },
        },
      },
      bill: {
        select: {
          id: true,
          billNumber: true,
          status: true,
          totalVnd: true,
          pointsEarned: true,
          rejectReason: true,
          submittedAt: true,
          reviewedAt: true,
          verifiedAt: true,
          rejectedAt: true,
          store: { select: { id: true, name: true, slug: true } },
        },
      },
    } satisfies Prisma.NotificationLogSelect;
  }

  private toCustomerNotification(log: CustomerNotificationRecord) {
    const payload = this.asRecord(log.payload);
    const templateKey = log.templateKey ?? 'customer.system.update.v1';
    const billNumber =
      log.bill?.billNumber ??
      (log.billId ? `#${log.billId.slice(0, 8).toUpperCase()}` : 'hóa đơn');
    const storeName =
      log.bill?.store?.name ??
      log.store?.name ??
      log.booking?.store?.name ??
      'Vietyoru';
    const amountLabel =
      typeof log.bill?.totalVnd === 'number' && log.bill.totalVnd > 0
        ? ` (${this.formatVnd(log.bill.totalVnd)})`
        : '';
    const pointsEarned =
      typeof log.bill?.pointsEarned === 'number'
        ? log.bill.pointsEarned
        : (this.toNumber(payload?.pointsEarned) ?? 0);
    const rejectReason =
      log.bill?.rejectReason ??
      (typeof payload?.rejectReason === 'string' ? payload.rejectReason : null);
    const href = log.billId
      ? `/gui-hoa-don?billId=${encodeURIComponent(log.billId)}`
      : log.bookingId
        ? `/lich-su-dat-cho?bookingId=${encodeURIComponent(log.bookingId)}`
        : '/tai-khoan';

    let title = 'Thông báo mới';
    let body = 'Bạn có cập nhật mới từ Vietyoru.';
    let tone: 'gold' | 'green' | 'amber' | 'danger' = 'gold';
    let category: 'bill' | 'booking' | 'system' = 'system';
    let actionLabel = 'Xem chi tiết';

    if (templateKey === 'customer.bill.submitted.v1') {
      title = 'Đã nhận hóa đơn của bạn';
      body = `Hóa đơn ${billNumber} tại ${storeName}${amountLabel} đang chờ Admin duyệt.`;
      category = 'bill';
      actionLabel = 'Xem hóa đơn';
    } else if (templateKey === 'customer.bill.verified.v1') {
      title = 'Hóa đơn đã được duyệt';
      body =
        `Admin đã duyệt hóa đơn ${billNumber} tại ${storeName}.` +
        (pointsEarned > 0 ? ` Bạn được cộng ${pointsEarned} điểm.` : '');
      tone = 'green';
      category = 'bill';
      actionLabel = 'Xem kết quả duyệt';
    } else if (templateKey === 'customer.bill.rejected.v1') {
      title = 'Hóa đơn chưa được duyệt';
      body =
        `Admin đã từ chối hóa đơn ${billNumber} tại ${storeName}.` +
        (rejectReason
          ? ` Lý do: ${rejectReason}.`
          : ' Vui lòng kiểm tra lại chứng từ.');
      tone = 'danger';
      category = 'bill';
      actionLabel = 'Xem lý do';
    } else if (templateKey.startsWith('customer.booking.')) {
      title = 'Cập nhật lịch đặt';
      body = `Lịch đặt tại ${storeName} vừa có cập nhật mới.`;
      tone = 'amber';
      category = 'booking';
    }

    return {
      id: log.id,
      templateKey,
      title,
      body,
      actionLabel,
      href,
      category,
      tone,
      unread: log.status !== 'SENT',
      createdAt: log.createdAt.toISOString(),
      timeLabel: this.relativeNotificationTime(log.createdAt),
      billId: log.billId,
      bookingId: log.bookingId,
      status: log.bill?.status ?? null,
      bill: log.bill
        ? {
            id: log.bill.id,
            billNumber: log.bill.billNumber,
            status: log.bill.status,
            totalVnd: log.bill.totalVnd,
            pointsEarned: log.bill.pointsEarned,
            rejectReason: log.bill.rejectReason,
            storeName,
          }
        : null,
    };
  }

  private relativeNotificationTime(value: Date) {
    const diffMs = Date.now() - value.getTime();
    const minute = 60 * 1000;
    const hour = 60 * minute;
    const day = 24 * hour;

    if (diffMs < minute) return 'Vừa xong';
    if (diffMs < hour)
      return `${Math.max(1, Math.floor(diffMs / minute))} phút`;
    if (diffMs < day) return `${Math.floor(diffMs / hour)} giờ`;
    if (diffMs < 2 * day) return 'Hôm qua';

    return new Intl.DateTimeFormat('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(value);
  }

  private async updateBookingStatusWithAudit(input: {
    booking: BookingCancelTarget;
    nextStatus: BookingStatus;
    actorId?: string | null;
    actorType: BookingStatusActorType;
    action: string;
    reason?: string | null;
    now?: Date;
    data?: Prisma.BookingUpdateInput;
  }) {
    const now = input.now ?? new Date();
    const result = await this.prisma.booking.update({
      where: { id: input.booking.id },
      data: {
        status: input.nextStatus,
        ...(input.data ?? {}),
      },
      select: this.bookingNotificationSelect(),
    });

    await this.prisma.auditLog.create({
      data: {
        actorId: input.actorId ?? undefined,
        action: input.action,
        targetType: 'Booking',
        targetId: input.booking.id,
        beforeJson: this.buildBookingCancelAuditSnapshot(input.booking),
        afterJson: this.buildBookingCancelAuditSnapshot(result),
        metadata: {
          actorType: input.actorType,
          actorId: input.actorId ?? null,
          reason: input.reason ?? null,
          beforeStatus: input.booking.status,
          afterStatus: result.status,
          changedAt: now.toISOString(),
        },
      },
    });

    await this.notifyBookingCustomerStatusChange(result, {
      reason: input.reason,
      actorType: input.actorType,
    });

    return result;
  }

  private async notifyBookingCustomerStatusChange(
    booking: BookingNotificationRecord,
    options: { reason?: string | null; actorType: BookingStatusActorType },
  ) {
    const templateKey = this.customerBookingTemplateKey(booking.status);
    if (!templateKey) {
      return;
    }

    const recipient =
      booking.user?.id ?? booking.guest?.phone ?? booking.guest?.id;
    if (!recipient) {
      return;
    }

    await this.prisma.notificationLog.create({
      data: {
        userId: booking.user?.id,
        guestId: booking.guest?.id,
        storeId: booking.storeId ?? booking.store?.id ?? undefined,
        bookingId: booking.id,
        channel: booking.user?.id ? 'IN_APP' : 'LINE',
        status: 'QUEUED',
        recipient,
        templateKey,
        payload: {
          bookingId: booking.id,
          status: booking.status,
          reason: options.reason ?? null,
          actorType: options.actorType,
        },
      },
    });
  }

  private customerBookingTemplateKey(status: string) {
    if (status === 'CANCELLED') {
      return 'customer.booking.cancelled.v1';
    }

    if (status === 'COMPLETED') {
      return 'customer.booking.completed.v1';
    }

    if (status === 'CHECKED_IN') {
      return 'customer.booking.checked_in.v1';
    }

    return null;
  }

  private assertBookingCanBeCancelled(
    booking: BookingCancelTarget,
    options: { enforceCutoff?: boolean } = {},
  ) {
    if (booking.status === 'CANCELLED') {
      throw new UnprocessableEntityException(
        'Booking has already been cancelled',
      );
    }

    if (['CHECKED_IN', 'COMPLETED', 'NO_SHOW'].includes(booking.status)) {
      throw new UnprocessableEntityException(
        'Booking cannot be cancelled in its current state',
      );
    }

    if (options.enforceCutoff ?? true) {
      const cutoffMinutes = this.resolveBookingCutoffMinutes(booking);
      const cutoffMs = cutoffMinutes * 60 * 1000;
      const msUntilBooking =
        new Date(booking.scheduledAt ?? '').getTime() - Date.now();
      if (!Number.isFinite(msUntilBooking)) {
        throw new BadRequestException('scheduledAt must be a valid ISO date');
      }

      if (msUntilBooking < cutoffMs) {
        throw new UnprocessableEntityException(
          cutoffMinutes === DEFAULT_BOOKING_CUTOFF_MINUTES
            ? 'Booking can only be cancelled at least 1 hour before scheduled time'
            : `Booking can only be cancelled at least ${cutoffMinutes} minutes before scheduled time`,
        );
      }
    }
  }

  private resolveBookingCutoffMinutes(booking: BookingCancelTarget) {
    const cutoff = booking.store?.bookingCancelCutoffMinutes;
    if (
      typeof cutoff === 'number' &&
      BOOKING_POLICY_CUTOFF_MINUTES.includes(
        cutoff as (typeof BOOKING_POLICY_CUTOFF_MINUTES)[number],
      )
    ) {
      return cutoff;
    }

    return DEFAULT_BOOKING_CUTOFF_MINUTES;
  }

  private buildBookingCancelAuditSnapshot(booking: BookingCancelTarget) {
    return {
      id: booking.id,
      userId: booking.userId ?? booking.user?.id ?? null,
      guestId: booking.guestId ?? booking.guest?.id ?? null,
      status: booking.status,
      scheduledAt: this.toAuditIso(booking.scheduledAt),
      cancelledAt: this.toAuditIso(booking.cancelledAt),
    };
  }

  private toAuditIso(value?: Date | string | null) {
    if (!value) {
      return null;
    }

    const date = value instanceof Date ? value : new Date(value);
    return Number.isFinite(date.getTime()) ? date.toISOString() : null;
  }

  private buildBillLoyaltyAward(
    bill: {
      id: string;
      subtotalVnd?: number | null;
      totalVnd?: number | null;
      paidVnd?: number | null;
      booking?: { id: string } | null;
      user?: { id: string; role?: string | null } | null;
    },
    postedAt: Date,
  ) {
    if (!bill.user?.id || bill.user.role !== 'USER') {
      return null;
    }

    const amountVnd = Math.max(
      0,
      Math.trunc(
        typeof bill.subtotalVnd === 'number' && bill.subtotalVnd > 0
          ? bill.subtotalVnd
          : (bill.totalVnd ?? 0),
      ),
    );
    const points = Math.floor(amountVnd / BILL_LOYALTY_VND_PER_POINT);

    if (points <= 0) {
      return null;
    }

    const expiresAt = new Date(postedAt);
    expiresAt.setFullYear(expiresAt.getFullYear() + 1);

    return {
      billId: bill.id,
      bookingId: bill.booking?.id ?? null,
      userId: bill.user.id,
      amountVnd,
      points,
      postedAt,
      expiresAt,
      ruleSnapshot: {
        version: BILL_LOYALTY_RULE_VERSION,
        basis: 'bill_subtotal_vnd',
        amountVnd,
        vndPerPoint: BILL_LOYALTY_VND_PER_POINT,
        pointsPerMillionVnd: BILL_LOYALTY_POINTS_PER_1M_VND,
        expiresAfterDays: 365,
      },
    };
  }

  private async recordBillLoyaltyLedger(
    client: NightlifePrismaClient,
    award: {
      billId: string;
      bookingId: string | null;
      userId: string;
      amountVnd: number;
      points: number;
      postedAt: Date;
      expiresAt: Date;
      ruleSnapshot: Record<string, unknown>;
    },
  ) {
    await client.pointLedger.upsert({
      where: {
        billId_type: {
          billId: award.billId,
          type: 'EARN',
        },
      },
      update: {
        userId: award.userId,
        bookingId: award.bookingId,
        amountVnd: award.amountVnd,
        points: award.points,
        status: 'POSTED',
        description: `Loyalty points from approved bill ${award.billId}`,
        ruleSnapshot: this.toPrismaJson(award.ruleSnapshot),
        expiresAt: award.expiresAt,
        postedAt: award.postedAt,
      },
      create: {
        userId: award.userId,
        bookingId: award.bookingId,
        billId: award.billId,
        type: 'EARN',
        status: 'POSTED',
        amountVnd: award.amountVnd,
        points: award.points,
        description: `Loyalty points from approved bill ${award.billId}`,
        ruleSnapshot: this.toPrismaJson(award.ruleSnapshot),
        expiresAt: award.expiresAt,
        postedAt: award.postedAt,
      },
    });
  }

  private async recordBillLoyaltyReverseLedger(
    client: NightlifePrismaClient,
    reversal: {
      billId: string;
      bookingId: string | null;
      userId: string;
      reversedLedgerId: string;
      amountVnd: number;
      points: number;
      postedAt: Date;
      reason: string;
      refundReference: string | null;
    },
  ) {
    await client.pointLedger.upsert({
      where: {
        billId_type: {
          billId: reversal.billId,
          type: 'REVERSE',
        },
      },
      update: {
        userId: reversal.userId,
        bookingId: reversal.bookingId,
        reversedLedgerId: reversal.reversedLedgerId,
        amountVnd: reversal.amountVnd,
        points: reversal.points,
        status: 'POSTED',
        description: `Reversed loyalty points for voided bill ${reversal.billId}`,
        ruleSnapshot: this.toPrismaJson({
          version: BILL_LOYALTY_RULE_VERSION,
          type: 'BILL_VOID_REVERSAL',
          reason: reversal.reason,
          refundReference: reversal.refundReference,
          reversedLedgerId: reversal.reversedLedgerId,
        }),
        expiresAt: null,
        postedAt: reversal.postedAt,
      },
      create: {
        userId: reversal.userId,
        bookingId: reversal.bookingId,
        billId: reversal.billId,
        reversedLedgerId: reversal.reversedLedgerId,
        type: 'REVERSE',
        status: 'POSTED',
        amountVnd: reversal.amountVnd,
        points: reversal.points,
        description: `Reversed loyalty points for voided bill ${reversal.billId}`,
        ruleSnapshot: this.toPrismaJson({
          version: BILL_LOYALTY_RULE_VERSION,
          type: 'BILL_VOID_REVERSAL',
          reason: reversal.reason,
          refundReference: reversal.refundReference,
          reversedLedgerId: reversal.reversedLedgerId,
        }),
        expiresAt: null,
        postedAt: reversal.postedAt,
      },
    });
  }

  private buildBillReviewAuditSnapshot(bill: {
    id: string;
    status: string;
    reviewedAt?: Date | null;
    verifiedAt?: Date | null;
    rejectedAt?: Date | null;
    reviewedById?: string | null;
    verifiedById?: string | null;
    rejectedById?: string | null;
    rejectReason?: string | null;
    subtotalVnd?: number | null;
    discountVnd?: number | null;
    serviceChargeVnd?: number | null;
    taxVnd?: number | null;
    totalVnd?: number | null;
    paidVnd?: number | null;
    commissionAmountVnd?: number | null;
    pointsEarned?: number | null;
    discountRuleSnapshot?: Prisma.JsonValue | null;
    commissionRuleSnapshot?: Prisma.JsonValue | null;
  }) {
    return {
      id: bill.id,
      status: bill.status,
      reviewedAt: bill.reviewedAt?.toISOString() ?? null,
      verifiedAt: bill.verifiedAt?.toISOString() ?? null,
      rejectedAt: bill.rejectedAt?.toISOString() ?? null,
      reviewedById: bill.reviewedById ?? null,
      verifiedById: bill.verifiedById ?? null,
      rejectedById: bill.rejectedById ?? null,
      rejectReason: bill.rejectReason ?? null,
      subtotalVnd: bill.subtotalVnd ?? null,
      discountVnd: bill.discountVnd ?? null,
      serviceChargeVnd: bill.serviceChargeVnd ?? null,
      taxVnd: bill.taxVnd ?? null,
      totalVnd: bill.totalVnd ?? null,
      paidVnd: bill.paidVnd ?? null,
      commissionAmountVnd: bill.commissionAmountVnd ?? null,
      pointsEarned: bill.pointsEarned ?? null,
      discountRuleSnapshot: bill.discountRuleSnapshot ?? null,
      commissionRuleSnapshot: bill.commissionRuleSnapshot ?? null,
    };
  }

  private mapPublicArea(
    area: {
      id: string;
      code: string;
      name: string;
      city: string;
      district?: string | null;
      ward?: string | null;
    } | null,
  ) {
    if (!area) {
      return null;
    }

    return {
      id: area.id,
      code: area.code,
      name: area.name,
      city: area.city,
      district: area.district ?? null,
      ward: area.ward ?? null,
      cityCode: this.cityCodeFromAreaCode(area.code),
    };
  }

  private buildStorePriceReference(
    pricingInfo: unknown,
    casts: Array<{
      hourlyRateVnd: number | null;
    }>,
  ) {
    const rates = casts
      .map((cast) => cast.hourlyRateVnd)
      .filter((rate): rate is number => typeof rate === 'number' && rate > 0);
    const castStartingFromVnd = rates.length ? Math.min(...rates) : null;
    const pricingRecord = this.asRecord(pricingInfo);
    const menuItems = this.buildStoreMenuPriceItems(pricingRecord);
    const menuAmounts = menuItems
      .map((item) => item.amountVnd)
      .filter(
        (amount): amount is number => typeof amount === 'number' && amount > 0,
      );
    const startingFromVnd = menuAmounts.length
      ? Math.min(...menuAmounts)
      : castStartingFromVnd;

    if (menuItems.length) {
      return {
        currency: 'VND',
        startingFromVnd,
        note:
          this.cleanNullableText(String(pricingRecord?.summary ?? '')) ??
          'Menu và mức chi phí do quán cập nhật, admin xác nhận lại sau khi đặt chỗ.',
        items: menuItems,
      };
    }

    return {
      currency: 'VND',
      startingFromVnd: castStartingFromVnd,
      note: 'Reference price only; admin confirms final pricing by guest count, room type, and time slot.',
      items: [
        ...(castStartingFromVnd
          ? [
              {
                label: 'Cast hourly rate',
                amountVnd: castStartingFromVnd,
                unit: 'hour',
                note: 'Lowest active public cast rate for this store.',
              },
            ]
          : []),
        {
          label: 'Table or room package',
          amountVnd: null,
          unit: null,
          note: 'Confirmed by admin after the booking request.',
        },
      ],
    };
  }

  private buildStoreMenuPriceItems(pricingRecord?: Record<string, unknown>) {
    if (!pricingRecord) {
      return [];
    }

    const rawGroups = Array.isArray(pricingRecord.groups)
      ? pricingRecord.groups
      : [];
    const rawItems = Array.isArray(pricingRecord.items)
      ? [
          {
            name:
              this.cleanNullableText(String(pricingRecord.summary ?? '')) ??
              'Menu',
            items: pricingRecord.items,
          },
        ]
      : [];
    const groups = [...rawGroups, ...rawItems];

    return groups.flatMap((group, groupIndex) => {
      const groupRecord = this.asRecord(group);
      const groupName =
        this.cleanNullableText(
          String(groupRecord?.name ?? groupRecord?.label ?? ''),
        ) ?? `Nhóm ${groupIndex + 1}`;
      const items = Array.isArray(groupRecord?.items) ? groupRecord.items : [];

      return items
        .map((item) => this.normalizeStoreMenuPriceItem(item, groupName))
        .filter((item): item is NonNullable<typeof item> => Boolean(item));
    });
  }

  private normalizeStoreMenuPriceItem(item: unknown, groupName: string) {
    const record = this.asRecord(item);
    if (!record) {
      return null;
    }

    const label = this.cleanNullableText(
      String(record.name ?? record.label ?? record.title ?? ''),
    );
    if (!label) {
      return null;
    }

    const valueText = this.cleanNullableText(
      String(record.value ?? record.priceText ?? record.priceRange ?? ''),
    );
    const amountVnd =
      this.toNumber(record.amountVnd) ??
      this.toNumber(record.priceVnd) ??
      this.toNumber(record.price) ??
      this.parseVndAmountFromText(valueText);
    const tier = this.toNumber(record.tier);
    const imageUrl = this.normalizePublicImageUrl(
      this.cleanNullableText(
        String(record.thumb ?? record.imageUrl ?? record.url ?? ''),
      ),
    );
    const displayPrice =
      valueText ??
      (tier && tier > 0
        ? '$'.repeat(Math.min(Math.max(Math.trunc(tier), 1), 4))
        : null);

    return {
      label,
      amountVnd,
      unit: this.cleanNullableText(String(record.unit ?? '')),
      note: this.cleanNullableText(
        String(record.desc ?? record.description ?? record.note ?? ''),
      ),
      group: groupName,
      imageUrl,
      tier: tier && tier > 0 ? Math.trunc(tier) : null,
      hot: record.hot === true,
      displayPrice,
    };
  }

  private normalizePublicImageUrl(value: string | null) {
    if (!value || value.startsWith('linear-gradient')) {
      return null;
    }

    return value;
  }

  private parseVndAmountFromText(value: string | null) {
    if (!value) {
      return null;
    }

    const match = value.replace(/\s+/g, '').match(/(\d[\d.,]*)/);
    if (!match) {
      return null;
    }

    const numeric = Number(match[1].replace(/[.,]/g, ''));
    return Number.isFinite(numeric) && numeric > 0 ? numeric : null;
  }

  private buildCastSeoDescription(cast: {
    publicAlias: string | null;
    stageName: string;
    publicHeadline: string | null;
    publicBio: string | null;
    languages: string[];
    store: {
      name: string;
      city: string;
      district: string | null;
      area: { name: string } | null;
    };
  }) {
    const publicSummary = (cast.publicBio ?? cast.publicHeadline)
      ?.replace(/\s+/g, ' ')
      .trim();
    const name = cast.publicAlias ?? cast.stageName;
    const location = [
      cast.store.area?.name,
      cast.store.district,
      cast.store.city,
    ]
      .filter(Boolean)
      .join(', ');
    const languageText = cast.languages.length
      ? ` Languages: ${cast.languages.join(', ')}.`
      : '';

    if (publicSummary) {
      return `${publicSummary.slice(0, 130)}${location ? ` ${location}.` : ''}${languageText}`.slice(
        0,
        170,
      );
    }

    return `${name} tại ${cast.store.name}${location ? `, ${location}` : ''}. Xem bio, gallery public, ngôn ngữ hỗ trợ và đặt booking theo cast trên NightLife VN.`;
  }

  private async loadRelatedPublicCasts(cast: {
    id: string;
    storeId: string;
    tags: string[];
    store: {
      city: string;
      area: { id: string; code: string } | null;
    };
  }) {
    const relatedFilters = [
      { storeId: cast.storeId },
      ...(cast.store.area?.id
        ? [{ store: { areaId: cast.store.area.id } }]
        : []),
      ...(cast.tags.length ? [{ tags: { hasSome: cast.tags } }] : []),
      { store: { city: cast.store.city } },
    ];

    const related = await this.prisma.cast.findMany({
      where: {
        id: { not: cast.id },
        deletedAt: null,
        status: 'ACTIVE',
        isPublic: true,
        AND: [
          {
            store: {
              deletedAt: null,
              status: 'ACTIVE',
            },
          },
          {
            OR: relatedFilters,
          },
        ],
      },
      orderBy: { createdAt: 'desc' },
      take: 8,
      select: {
        id: true,
        slug: true,
        storeId: true,
        stageName: true,
        publicAlias: true,
        publicHeadline: true,
        tags: true,
        languages: true,
        hourlyRateVnd: true,
        media: {
          where: {
            deletedAt: null,
            access: 'PUBLIC',
            status: 'READY',
            type: 'IMAGE',
          },
          orderBy: { createdAt: 'desc' },
          take: 1,
          select: { url: true },
        },
        store: {
          select: {
            id: true,
            name: true,
            slug: true,
            category: true,
            description: true,
            address: true,
            city: true,
            district: true,
            latitude: true,
            longitude: true,
            area: {
              select: {
                id: true,
                code: true,
                name: true,
                city: true,
                district: true,
                ward: true,
              },
            },
          },
        },
      },
    });

    const unique = new Map<string, (typeof related)[number]>();
    related.forEach((item) => unique.set(item.id, item));

    return [...unique.values()].map((item) =>
      this.mapPublicRelatedCast(
        item,
        item.storeId === cast.storeId
          ? 'same-store'
          : item.store.area?.id && item.store.area.id === cast.store.area?.id
            ? 'same-area'
            : 'same-tag',
      ),
    );
  }

  private mapPublicRelatedCast(
    cast: {
      id: string;
      slug: string;
      stageName: string;
      publicAlias: string | null;
      publicHeadline: string | null;
      tags: string[];
      languages: string[];
      hourlyRateVnd: number | null;
      media: Array<{ url: string }>;
      store: {
        id: string;
        name: string;
        slug: string;
        category: StoreCategory;
        description: string | null;
        address: string | null;
        city: string;
        district: string | null;
        latitude: Prisma.Decimal | number | string | null;
        longitude: Prisma.Decimal | number | string | null;
        area: {
          id: string;
          code: string;
          name: string;
          city: string;
          district?: string | null;
          ward?: string | null;
        } | null;
      };
    },
    relatedReason: 'same-store' | 'same-area' | 'same-tag',
  ) {
    return {
      id: cast.id,
      slug: cast.slug,
      stageName: cast.stageName,
      name: cast.publicAlias ?? cast.stageName,
      publicAlias: cast.publicAlias,
      publicHeadline: cast.publicHeadline,
      tags: cast.tags,
      languages: cast.languages,
      hourlyRateVnd: cast.hourlyRateVnd,
      thumbnailUrl: cast.media[0]?.url ?? null,
      relatedReason,
      store: {
        id: cast.store.id,
        name: cast.store.name,
        slug: cast.store.slug,
        category: cast.store.category,
        description: cast.store.description,
        address: cast.store.address,
        city: cast.store.city,
        cityCode: cast.store.area?.code
          ? this.cityCodeFromAreaCode(cast.store.area.code)
          : this.normalizeCityCode(cast.store.city),
        district: cast.store.district,
        area: this.mapPublicArea(cast.store.area),
        latitude: this.toNumber(cast.store.latitude),
        longitude: this.toNumber(cast.store.longitude),
      },
    };
  }

  private async resolvePublicCastForMemberFavorite(slug: string) {
    const normalizedSlug = this.normalizeCastSlug(slug);
    if (!normalizedSlug) {
      throw new BadRequestException('slug is required');
    }

    const cast = await this.prisma.cast.findFirst({
      where: {
        slug: normalizedSlug,
        deletedAt: null,
        status: 'ACTIVE',
        isPublic: true,
        store: {
          deletedAt: null,
          status: 'ACTIVE',
        },
      },
      select: {
        id: true,
        slug: true,
      },
    });

    if (!cast) {
      throw new NotFoundException('Cast not found');
    }

    return cast;
  }

  private buildStoreSeoDescription(store: {
    name: string;
    description: string | null;
    city: string;
    district: string | null;
    area: { name: string } | null;
  }) {
    const rawDescription = store.description
      ?.replace(/\s+/g, ' ')
      .trim()
      .slice(0, 155);

    if (rawDescription) {
      return rawDescription;
    }

    const location = [store.area?.name, store.district, store.city]
      .filter(Boolean)
      .join(', ');

    return `${store.name}${location ? ` in ${location}` : ''}. View gallery, public casts, active coupons, map, and opening hours on NightLife VN.`;
  }

  private buildPublicStoreWhere(
    query: PublicDiscoveryQueryDto,
    options: { includeTextSearch?: boolean; includeCastName?: boolean } = {},
  ): Prisma.StoreWhereInput {
    const now = new Date();
    const searchTerm = this.cleanText(query.q);
    const cityCode = this.normalizeCityCode(query.city, { strict: true });
    const area = this.cleanText(query.area);
    const areaCode = this.normalizeToken(area);
    const category = this.normalizeCategory(query.category, { strict: true });
    const hasActiveCoupon = this.parseBooleanFlag(query.hasActiveCoupon);
    const and: Prisma.StoreWhereInput[] = [
      {
        area: {
          is: {
            deletedAt: null,
            status: 'ACTIVE',
            ...this.buildMvpAreaCodeWhere(cityCode),
          },
        },
      },
    ];

    if (options.includeTextSearch !== false && searchTerm) {
      const textFilters: Prisma.StoreWhereInput[] = [
        { name: this.containsInsensitive(searchTerm) },
        { description: this.containsInsensitive(searchTerm) },
        { address: this.containsInsensitive(searchTerm) },
      ];

      if (options.includeCastName) {
        textFilters.push({
          casts: {
            some: {
              deletedAt: null,
              isPublic: true,
              status: 'ACTIVE',
              OR: [
                { stageName: this.containsInsensitive(searchTerm) },
                { publicAlias: this.containsInsensitive(searchTerm) },
              ],
            },
          },
        });
      }

      and.push({ OR: textFilters });
    }

    if (area) {
      and.push({
        OR: [
          { district: this.containsInsensitive(area) },
          {
            area: {
              is: {
                code: this.equalsInsensitive(areaCode),
                deletedAt: null,
                status: 'ACTIVE',
              },
            },
          },
          {
            area: {
              is: {
                name: this.containsInsensitive(area),
                deletedAt: null,
                status: 'ACTIVE',
              },
            },
          },
          {
            area: {
              is: {
                district: this.containsInsensitive(area),
                deletedAt: null,
                status: 'ACTIVE',
              },
            },
          },
        ],
      });
    }

    if (hasActiveCoupon) {
      and.push({
        coupons: {
          some: this.buildActiveCouponWhere(now),
        },
      });
    }

    return {
      deletedAt: null,
      status: 'ACTIVE',
      ...(category ? { category } : {}),
      ...(and.length ? { AND: and } : {}),
    };
  }

  private buildMvpAreaCodeWhere(cityCode?: string): Prisma.AreaWhereInput {
    if (cityCode) {
      return { code: { startsWith: `${cityCode}-` } };
    }

    return {
      OR: MVP_CITY_CODES.map((code) => ({
        code: { startsWith: `${code}-` },
      })),
    };
  }

  private resolvePagination(query: PublicDiscoveryQueryDto): PublicPagination {
    const limit = this.resolveLimit(query.limit);
    const hasOffset =
      query.offset !== undefined &&
      query.offset !== null &&
      query.offset !== '';
    const page = hasOffset ? DEFAULT_PUBLIC_PAGE : this.resolvePage(query.page);
    const offset = hasOffset
      ? this.resolveOffset(query.offset)
      : (page - 1) * limit;

    if (offset > MAX_PUBLIC_OFFSET) {
      throw new BadRequestException(
        `offset must be less than or equal to ${MAX_PUBLIC_OFFSET}`,
      );
    }

    return { limit, offset, page };
  }

  private resolveLimit(limit?: string | number) {
    if (limit === undefined || limit === null || limit === '') {
      return DEFAULT_PUBLIC_LIMIT;
    }

    const parsed = Number(limit);
    if (!Number.isFinite(parsed) || parsed <= 0) {
      throw new BadRequestException('limit must be a positive number');
    }

    if (parsed > MAX_PUBLIC_LIMIT) {
      throw new BadRequestException(
        `limit must be less than or equal to ${MAX_PUBLIC_LIMIT}`,
      );
    }

    return Math.floor(parsed);
  }

  private resolvePage(page?: string | number) {
    if (page === undefined || page === null || page === '') {
      return DEFAULT_PUBLIC_PAGE;
    }

    const parsed = Number(page);
    if (!Number.isFinite(parsed) || parsed <= 0) {
      throw new BadRequestException('page must be a positive number');
    }

    return Math.floor(parsed);
  }

  private resolveOffset(offset?: string | number) {
    if (offset === undefined || offset === null || offset === '') {
      return 0;
    }

    const parsed = Number(offset);
    if (!Number.isFinite(parsed) || parsed < 0) {
      throw new BadRequestException('offset must be zero or a positive number');
    }

    return Math.floor(parsed);
  }

  private resolveSort(
    value: string | undefined,
    coordinates: Coordinates | null,
  ): PublicSort {
    const token = this.normalizeToken(value);

    if (!token) {
      return coordinates ? 'nearest' : 'newest';
    }

    const sort = token === 'ranking' ? 'priority' : token;
    if (!['newest', 'nearest', 'priority'].includes(sort)) {
      throw new BadRequestException(
        'sort must be one of newest, nearest, priority',
      );
    }

    if (sort === 'nearest' && !coordinates) {
      throw new BadRequestException('sort=nearest requires lat and lng');
    }

    return sort as PublicSort;
  }

  private resolvePublicReadArgs(
    sort: PublicSort,
    pagination: PublicPagination,
  ): { skip?: number; take: number } {
    if (sort === 'newest') {
      return { skip: pagination.offset, take: pagination.limit };
    }

    const readWindow = pagination.offset + pagination.limit;
    if (readWindow > MAX_PUBLIC_SORT_WINDOW) {
      throw new BadRequestException(
        `sort=${sort} supports offset + limit up to ${MAX_PUBLIC_SORT_WINDOW}`,
      );
    }

    return { take: readWindow };
  }

  private buildPublicListResponse<T>(
    data: T[],
    total: number,
    pagination: PublicPagination,
    sort: PublicSort,
  ) {
    return {
      data,
      meta: {
        total,
        page: pagination.page,
        limit: pagination.limit,
        offset: pagination.offset,
        hasMore: pagination.offset + data.length < total,
        sort,
      },
    };
  }

  private finalizePublicItems<T extends PublicSortableItem>(
    items: T[],
    sort: PublicSort,
    pagination: PublicPagination,
    rankings: Map<string, RankingScore>,
  ) {
    const sortedItems =
      sort === 'newest'
        ? items
        : this.sortPublicItems(items, sort, rankings).slice(
            pagination.offset,
            pagination.offset + pagination.limit,
          );

    return sortedItems.map(({ createdAt: _createdAt, ...item }) => {
      void _createdAt;
      return item;
    });
  }

  private sortPublicItems<T extends PublicSortableItem>(
    items: T[],
    sort: PublicSort,
    rankings: Map<string, RankingScore>,
  ) {
    if (sort === 'nearest') {
      return this.sortByDistance(items);
    }

    if (sort === 'priority') {
      return [...items].sort((first, second) => {
        const firstRank = rankings.get(first.id);
        const secondRank = rankings.get(second.id);
        const firstPin = firstRank?.pinRank ?? Number.POSITIVE_INFINITY;
        const secondPin = secondRank?.pinRank ?? Number.POSITIVE_INFINITY;

        if (firstPin !== secondPin) {
          return firstPin - secondPin;
        }

        const scoreDiff =
          (secondRank?.manualScore ?? 0) - (firstRank?.manualScore ?? 0);
        if (scoreDiff !== 0) {
          return scoreDiff;
        }

        return (
          this.createdAtMs(second.createdAt) - this.createdAtMs(first.createdAt)
        );
      });
    }

    return [...items].sort(
      (first, second) =>
        this.createdAtMs(second.createdAt) - this.createdAtMs(first.createdAt),
    );
  }

  private async loadRankingMap(
    targetType: 'STORE' | 'CAST',
    targetIds: string[],
  ) {
    if (!targetIds.length) {
      return new Map<string, RankingScore>();
    }

    const now = new Date();
    const configs = await this.prisma.rankingConfig.findMany({
      where: {
        targetType,
        targetId: { in: targetIds },
        status: 'ACTIVE',
        deletedAt: null,
        AND: [
          { OR: [{ startsAt: null }, { startsAt: { lte: now } }] },
          { OR: [{ endsAt: null }, { endsAt: { gt: now } }] },
        ],
      },
      orderBy: [
        { pinRank: 'asc' },
        { manualScore: 'desc' },
        { updatedAt: 'desc' },
      ],
      select: {
        targetId: true,
        manualScore: true,
        pinRank: true,
      },
    });
    const rankingMap = new Map<string, RankingScore>();

    configs.forEach((config) => {
      if (!rankingMap.has(config.targetId)) {
        rankingMap.set(config.targetId, {
          pinRank: config.pinRank,
          manualScore: config.manualScore,
        });
      }
    });

    return rankingMap;
  }

  private buildRankingConfigAuditSnapshot(config: AdminRankingConfigRecord) {
    return {
      id: config.id,
      targetType: config.targetType,
      targetId: config.targetId,
      areaId: config.areaId ?? null,
      cityCode: config.cityCode,
      category: config.category,
      scope: config.scope,
      manualScore: config.manualScore,
      pinRank: config.pinRank ?? null,
      sponsored: config.sponsored,
      reason: config.reason ?? null,
      status: config.status,
      startsAt: this.toAuditIso(config.startsAt),
      endsAt: this.toAuditIso(config.endsAt),
      updatedAt: this.toAuditIso(config.updatedAt),
    };
  }

  private adminRankingConfigSelect(): Prisma.RankingConfigSelect {
    return {
      id: true,
      targetType: true,
      targetId: true,
      areaId: true,
      cityCode: true,
      category: true,
      scope: true,
      manualScore: true,
      pinRank: true,
      sponsored: true,
      reason: true,
      status: true,
      startsAt: true,
      endsAt: true,
      createdAt: true,
      updatedAt: true,
      area: {
        select: {
          id: true,
          code: true,
          name: true,
          city: true,
          district: true,
        },
      },
    };
  }

  private async mapAdminRankingConfigs(configs: AdminRankingConfigRecord[]) {
    const targets = await this.loadAdminRankingTargets(configs);

    return configs.map((config) => {
      const target = targets.get(`${config.targetType}:${config.targetId}`);

      return {
        id: config.id,
        targetType: config.targetType,
        targetId: config.targetId,
        targetName: target?.name ?? 'Unknown target',
        targetSlug: target?.slug ?? null,
        targetImage: target?.image ?? null,
        targetStatus: target?.status ?? null,
        targetCategory: target?.category ?? config.category,
        targetCity: target?.city ?? null,
        targetArea: target?.area ?? config.area?.name ?? null,
        cityCode: config.cityCode,
        areaId: config.areaId,
        area: config.area,
        category: config.category,
        scope: config.scope,
        manualScore: config.manualScore,
        pinRank: config.pinRank,
        sponsored: config.sponsored,
        reason: config.reason,
        status: config.status,
        startsAt: config.startsAt,
        endsAt: config.endsAt,
        createdAt: config.createdAt,
        updatedAt: config.updatedAt,
      };
    });
  }

  private async loadAdminRankingTargets(configs: AdminRankingConfigRecord[]) {
    type StoreTargetRecord = {
      id: string;
      name: string;
      slug: string;
      category: StoreCategory;
      status: string;
      city: string;
      district: string | null;
      area: { name: string; city: string } | null;
      media: Array<{ url: string }>;
    };
    type CastTargetRecord = {
      id: string;
      slug: string;
      stageName: string;
      publicAlias: string | null;
      status: string;
      media: Array<{ url: string }>;
      store: {
        category: StoreCategory;
        city: string;
        district: string | null;
        area: { name: string; city: string } | null;
      };
    };
    const storeIds = configs
      .filter((config) => config.targetType === 'STORE')
      .map((config) => config.targetId);
    const castIds = configs
      .filter((config) => config.targetType === 'CAST')
      .map((config) => config.targetId);
    const targetMap = new Map<string, RankingTargetSummary>();
    const stores: StoreTargetRecord[] = storeIds.length
      ? await this.prisma.store.findMany({
          where: { id: { in: storeIds }, deletedAt: null },
          select: {
            id: true,
            name: true,
            slug: true,
            category: true,
            status: true,
            city: true,
            district: true,
            area: {
              select: {
                name: true,
                city: true,
              },
            },
            media: {
              where: {
                deletedAt: null,
                access: 'PUBLIC',
                status: 'READY',
                type: 'IMAGE',
              },
              orderBy: { createdAt: 'desc' },
              take: 1,
              select: { url: true },
            },
          },
        })
      : [];
    const casts: CastTargetRecord[] = castIds.length
      ? await this.prisma.cast.findMany({
          where: { id: { in: castIds }, deletedAt: null },
          select: {
            id: true,
            slug: true,
            stageName: true,
            publicAlias: true,
            status: true,
            media: {
              where: {
                deletedAt: null,
                access: 'PUBLIC',
                status: 'READY',
                type: 'IMAGE',
              },
              orderBy: { createdAt: 'desc' },
              take: 1,
              select: { url: true },
            },
            store: {
              select: {
                category: true,
                city: true,
                district: true,
                area: {
                  select: {
                    name: true,
                    city: true,
                  },
                },
              },
            },
          },
        })
      : [];

    stores.forEach((store) => {
      targetMap.set(`STORE:${store.id}`, {
        id: store.id,
        name: store.name,
        slug: store.slug,
        image: this.resolveRankingStoreImage(store.slug, store.media),
        city: store.area?.city ?? store.city,
        area: store.area?.name ?? store.district,
        category: store.category,
        status: store.status,
      });
    });
    casts.forEach((cast) => {
      targetMap.set(`CAST:${cast.id}`, {
        id: cast.id,
        name: cast.publicAlias ?? cast.stageName,
        slug: cast.slug,
        image: this.resolveRankingCastImage(cast.slug, cast.media),
        city: cast.store.area?.city ?? cast.store.city,
        area: cast.store.area?.name ?? cast.store.district,
        category: cast.store.category,
        status: cast.status,
      });
    });

    return targetMap;
  }

  private resolveAdminRankingCityCode(value?: string | null) {
    return this.normalizeCityCode(value ?? 'all', { strict: true }) ?? 'all';
  }

  private resolveAdminRankingCategory(value?: string | null) {
    const token = this.normalizeToken(value);

    if (!token || token === 'all' || token === 'tong-hop') {
      return null;
    }

    return this.normalizeCategory(value, { strict: true }) ?? null;
  }

  private resolveAdminRankingScope(value?: string | null) {
    const scope = this.normalizeToken(value) || 'global';

    if (scope.length > 40) {
      throw new BadRequestException('scope must be at most 40 characters');
    }

    return scope;
  }

  private resolveRankingWindow(
    startsAt?: string | null,
    endsAt?: string | null,
  ) {
    const startDate = startsAt ? new Date(startsAt) : null;
    const endDate = endsAt ? new Date(endsAt) : null;

    if (startDate && Number.isNaN(startDate.getTime())) {
      throw new BadRequestException('startsAt must be a valid date');
    }

    if (endDate && Number.isNaN(endDate.getTime())) {
      throw new BadRequestException('endsAt must be a valid date');
    }

    if (startDate && endDate && startDate >= endDate) {
      throw new BadRequestException('startsAt must be before endsAt');
    }

    return { startsAt: startDate, endsAt: endDate };
  }

  private async assertAdminRankingTargetExists(
    targetType: RankingTargetType,
    targetId: string,
  ) {
    const target =
      targetType === 'STORE'
        ? await this.prisma.store.findFirst({
            where: { id: targetId, deletedAt: null },
            select: { id: true },
          })
        : await this.prisma.cast.findFirst({
            where: { id: targetId, deletedAt: null },
            select: { id: true },
          });

    if (!target) {
      throw new NotFoundException('Ranking target not found');
    }
  }

  private async assertNoPinnedRankingCollision(input: {
    targetType: RankingTargetType;
    cityCode: string;
    category: StoreCategory | null;
    scope: string;
    pinRank: number | null;
    excludeId?: string;
  }) {
    return;
  }

  private resolveRankingTargetType(value?: string | null): RankingTargetType {
    const token = value?.trim().toUpperCase() || 'CAST';

    if (token !== 'CAST' && token !== 'STORE') {
      throw new BadRequestException('targetType must be CAST or STORE');
    }

    return token as RankingTargetType;
  }

  private resolveRankingLimit(limit?: string | number) {
    if (limit === undefined || limit === null || limit === '') {
      return DEFAULT_RANKING_LIMIT;
    }

    const parsed = Number(limit);
    if (!Number.isFinite(parsed) || parsed <= 0) {
      throw new BadRequestException('limit must be a positive number');
    }

    if (parsed > MAX_RANKING_LIMIT) {
      throw new BadRequestException(
        `limit must be less than or equal to ${MAX_RANKING_LIMIT}`,
      );
    }

    return Math.floor(parsed);
  }

  private mapRankingConfigs(configs: PublicRankingConfig[]) {
    const configByTargetId = new Map<string, PublicRankingConfig>();

    configs.forEach((config) => {
      if (!configByTargetId.has(config.targetId)) {
        configByTargetId.set(config.targetId, config);
      }
    });

    return configByTargetId;
  }

  private sortMappedRankingItems(items: PublicRankingItemDraft[]) {
    return [...items].sort((first, second) => {
      const firstPin = first.pinRank ?? Number.POSITIVE_INFINITY;
      const secondPin = second.pinRank ?? Number.POSITIVE_INFINITY;

      if (firstPin !== secondPin) {
        return firstPin - secondPin;
      }

      const scoreDiff = second.manualScore - first.manualScore;
      if (scoreDiff !== 0) {
        return scoreDiff;
      }

      return first.name.localeCompare(second.name);
    });
  }

  private async loadStoreRankingItems(
    configByTargetId: Map<string, PublicRankingConfig>,
    filters: { cityCode?: string; category?: StoreCategory },
  ) {
    const targetIds = [...configByTargetId.keys()];
    if (!targetIds.length) {
      return [];
    }

    const stores = await this.prisma.store.findMany({
      where: {
        ...this.buildPublicStoreWhere(
          {
            city: filters.cityCode,
            category: filters.category,
          },
          { includeTextSearch: false },
        ),
        id: { in: targetIds },
      },
      select: {
        id: true,
        name: true,
        slug: true,
        category: true,
        city: true,
        district: true,
        phone: true,
        area: {
          select: {
            id: true,
            code: true,
            name: true,
            city: true,
            district: true,
          },
        },
        media: {
          where: {
            deletedAt: null,
            access: 'PUBLIC',
            status: 'READY',
            type: 'IMAGE',
          },
          orderBy: { createdAt: 'desc' },
          take: 1,
          select: {
            url: true,
          },
        },
      },
    });

    return this.sortMappedRankingItems(
      stores.map((store) =>
        this.mapStoreRankingItem(store, configByTargetId.get(store.id)),
      ),
    );
  }

  private async loadCastRankingItems(
    configByTargetId: Map<string, PublicRankingConfig>,
    filters: { cityCode?: string; category?: StoreCategory },
  ) {
    const targetIds = [...configByTargetId.keys()];
    if (!targetIds.length) {
      return [];
    }

    const casts = await this.prisma.cast.findMany({
      where: {
        id: { in: targetIds },
        deletedAt: null,
        status: 'ACTIVE',
        isPublic: true,
        store: this.buildPublicStoreWhere(
          {
            city: filters.cityCode,
            category: filters.category,
          },
          { includeTextSearch: false },
        ),
      },
      select: {
        id: true,
        slug: true,
        stageName: true,
        publicAlias: true,
        media: {
          where: {
            deletedAt: null,
            access: 'PUBLIC',
            status: 'READY',
            type: 'IMAGE',
          },
          orderBy: { createdAt: 'desc' },
          take: 1,
          select: {
            url: true,
          },
        },
        store: {
          select: {
            category: true,
            city: true,
            district: true,
            area: {
              select: {
                id: true,
                code: true,
                name: true,
                city: true,
                district: true,
              },
            },
          },
        },
      },
    });

    return this.sortMappedRankingItems(
      casts.map((cast) =>
        this.mapCastRankingItem(cast, configByTargetId.get(cast.id)),
      ),
    );
  }

  private async loadRankingFallbackItems(
    targetType: RankingTargetType,
    filters: {
      cityCode?: string;
      category?: StoreCategory;
      excludeIds: string[];
      take: number;
    },
  ) {
    if (filters.take <= 0) {
      return [];
    }

    if (targetType === 'STORE') {
      const stores = await this.prisma.store.findMany({
        where: {
          ...this.buildPublicStoreWhere(
            {
              city: filters.cityCode,
              category: filters.category,
            },
            { includeTextSearch: false },
          ),
          ...(filters.excludeIds.length
            ? { id: { notIn: filters.excludeIds } }
            : {}),
        },
        orderBy: { createdAt: 'desc' },
        take: filters.take,
        select: {
          id: true,
          name: true,
          slug: true,
          category: true,
          city: true,
          district: true,
          phone: true,
          area: {
            select: {
              id: true,
              code: true,
              name: true,
              city: true,
              district: true,
            },
          },
          media: {
            where: {
              deletedAt: null,
              access: 'PUBLIC',
              status: 'READY',
              type: 'IMAGE',
            },
            orderBy: { createdAt: 'desc' },
            take: 1,
            select: {
              url: true,
            },
          },
        },
      });

      return stores.map((store) => this.mapStoreRankingItem(store));
    }

    const casts = await this.prisma.cast.findMany({
      where: {
        ...(filters.excludeIds.length
          ? { id: { notIn: filters.excludeIds } }
          : {}),
        deletedAt: null,
        status: 'ACTIVE',
        isPublic: true,
        store: this.buildPublicStoreWhere(
          {
            city: filters.cityCode,
            category: filters.category,
          },
          { includeTextSearch: false },
        ),
      },
      orderBy: { createdAt: 'desc' },
      take: filters.take,
      select: {
        id: true,
        slug: true,
        stageName: true,
        publicAlias: true,
        media: {
          where: {
            deletedAt: null,
            access: 'PUBLIC',
            status: 'READY',
            type: 'IMAGE',
          },
          orderBy: { createdAt: 'desc' },
          take: 1,
          select: {
            url: true,
          },
        },
        store: {
          select: {
            category: true,
            city: true,
            district: true,
            area: {
              select: {
                id: true,
                code: true,
                name: true,
                city: true,
                district: true,
              },
            },
          },
        },
      },
    });

    return casts.map((cast) => this.mapCastRankingItem(cast));
  }

  private mapStoreRankingItem(
    store: {
      id: string;
      name: string;
      slug: string;
      category: StoreCategory;
      city: string;
      district: string | null;
      phone: string | null;
      area: {
        id: string;
        code: string;
        name: string;
        city: string;
        district?: string | null;
      } | null;
      media: Array<{ url: string }>;
    },
    config?: PublicRankingConfig,
  ): PublicRankingItemDraft {
    const cityCode = store.area?.code
      ? this.cityCodeFromAreaCode(store.area.code)
      : this.normalizeCityCode(store.city);

    return {
      targetType: 'STORE',
      targetId: store.id,
      name: store.name,
      slug: store.slug,
      image: this.resolveRankingStoreImage(store.slug, store.media),
      area: store.area?.name ?? store.district,
      city: store.area?.city ?? store.city,
      cityCode,
      category: store.category,
      sponsored: config?.sponsored ?? false,
      pinRank: config?.pinRank ?? null,
      manualScore: config?.manualScore ?? 0,
      href: `/stores/${store.slug}`,
      phone: store.phone,
    };
  }

  private mapCastRankingItem(
    cast: {
      id: string;
      slug: string;
      stageName: string;
      publicAlias: string | null;
      media: Array<{ url: string }>;
      store: {
        category: StoreCategory;
        city: string;
        district: string | null;
        area: {
          id: string;
          code: string;
          name: string;
          city: string;
          district?: string | null;
        } | null;
      };
    },
    config?: PublicRankingConfig,
  ): PublicRankingItemDraft {
    const cityCode = cast.store.area?.code
      ? this.cityCodeFromAreaCode(cast.store.area.code)
      : this.normalizeCityCode(cast.store.city);

    return {
      targetType: 'CAST',
      targetId: cast.id,
      name: cast.publicAlias ?? cast.stageName,
      slug: cast.slug,
      image: this.resolveRankingCastImage(cast.slug, cast.media),
      area: cast.store.area?.name ?? cast.store.district,
      city: cast.store.area?.city ?? cast.store.city,
      cityCode,
      category: cast.store.category,
      sponsored: config?.sponsored ?? false,
      pinRank: config?.pinRank ?? null,
      manualScore: config?.manualScore ?? 0,
      href: `/casts/${cast.slug}`,
    };
  }

  private resolveRankingStoreImage(
    slug: string,
    media: Array<{ url: string }>,
  ) {
    return (
      media[0]?.url ??
      (demoStoreImageSlugs.has(slug) ? `/media/demo/stores/${slug}.jpg` : null)
    );
  }

  private resolveRankingCastImage(slug: string, media: Array<{ url: string }>) {
    return (
      media[0]?.url ??
      (demoCastImageSlugs.has(slug) ? `/media/demo/casts/${slug}.jpg` : null)
    );
  }

  private buildActiveCouponWhere(now: Date): Prisma.CouponWhereInput {
    return {
      status: 'ACTIVE',
      deletedAt: null,
      startsAt: { lte: now },
      OR: [{ endsAt: null }, { endsAt: { gt: now } }],
    };
  }

  private parseBooleanFlag(value?: string | boolean | null) {
    if (value === undefined || value === null || value === '') {
      return false;
    }

    if (typeof value === 'boolean') {
      return value;
    }

    const token = value.toLowerCase();
    if (token === 'true' || token === '1') {
      return true;
    }

    if (token === 'false' || token === '0') {
      return false;
    }

    throw new BadRequestException('hasActiveCoupon must be true or false');
  }

  private createdAtMs(value: Date | string) {
    const date = value instanceof Date ? value : new Date(value);

    return Number.isFinite(date.getTime()) ? date.getTime() : 0;
  }

  private parseCoordinates(query: PublicDiscoveryQueryDto): Coordinates | null {
    const hasLat =
      query.lat !== undefined && query.lat !== null && query.lat !== '';
    const hasLng =
      query.lng !== undefined && query.lng !== null && query.lng !== '';

    if (!hasLat && !hasLng) {
      return null;
    }

    if (!hasLat || !hasLng) {
      throw new BadRequestException('lat and lng must be provided together');
    }

    const lat = Number(query.lat);
    const lng = Number(query.lng);

    if (
      !Number.isFinite(lat) ||
      !Number.isFinite(lng) ||
      lat < -90 ||
      lat > 90 ||
      lng < -180 ||
      lng > 180
    ) {
      throw new BadRequestException('lat/lng must be valid coordinates');
    }

    return { lat, lng };
  }

  private calculateDistanceKm(
    coordinates: Coordinates | null,
    latitude: unknown,
    longitude: unknown,
  ) {
    const lat = this.toNumber(latitude);
    const lng = this.toNumber(longitude);

    if (!coordinates || lat === null || lng === null) {
      return null;
    }

    const toRadians = (value: number) => (value * Math.PI) / 180;
    const earthRadiusKm = 6371;
    const deltaLat = toRadians(lat - coordinates.lat);
    const deltaLng = toRadians(lng - coordinates.lng);
    const a =
      Math.sin(deltaLat / 2) ** 2 +
      Math.cos(toRadians(coordinates.lat)) *
        Math.cos(toRadians(lat)) *
        Math.sin(deltaLng / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return Math.round(earthRadiusKm * c * 10) / 10;
  }

  private sortByDistance<T extends { distanceKm: number | null }>(items: T[]) {
    if (!items.some((item) => item.distanceKm !== null)) {
      return items;
    }

    return [...items].sort((first, second) => {
      if (first.distanceKm === null && second.distanceKm === null) {
        return 0;
      }

      if (first.distanceKm === null) {
        return 1;
      }

      if (second.distanceKm === null) {
        return -1;
      }

      return first.distanceKm - second.distanceKm;
    });
  }

  private async getPartnerListingStore(
    user: AuthenticatedUser,
    storeId: string,
    client: NightlifePrismaClient = this.prisma,
  ) {
    const id = this.cleanRequiredText(storeId, 'storeId');

    if (!this.isUuid(id)) {
      throw new BadRequestException('storeId must be a valid UUID');
    }

    await this.accessService.ensureStoreAccess(user, id, 'store.partner.view');

    const store = await client.store.findFirst({
      where: { id, deletedAt: null },
      select: {
        id: true,
        name: true,
        slug: true,
        status: true,
        category: true,
        description: true,
        address: true,
        city: true,
        district: true,
        phone: true,
        openingHours: true,
        pricingInfo: true,
        tags: true,
        partnerAccountId: true,
        ownerId: true,
      },
    });

    if (!store) {
      throw new NotFoundException('Partner store not found');
    }

    return store;
  }

  private async findPartnerListingDraft(
    storeId: string,
    client: NightlifePrismaClient = this.prisma,
  ) {
    return client.content.findFirst({
      where: {
        storeId,
        slug: this.partnerListingDraftSlug(storeId),
        type: 'STORE_POST',
        deletedAt: null,
      },
      select: {
        id: true,
        title: true,
        slug: true,
        status: true,
        excerpt: true,
        body: true,
        metadata: true,
        createdAt: true,
        updatedAt: true,
        publishedAt: true,
      },
    });
  }

  private async getLatestPartnerListingReview(storeId: string) {
    const review = await this.prisma.partnerRequest.findFirst({
      where: {
        storeId,
        id: { startsWith: 'LISTING-' },
      },
      orderBy: { submittedAt: 'desc' },
      select: {
        id: true,
        status: true,
        submittedAt: true,
        reviewedAt: true,
        reviewReason: true,
        publicState: true,
      },
    });

    return review
      ? {
          id: review.id,
          status: review.status,
          submittedAt: review.submittedAt.toISOString(),
          reviewedAt: review.reviewedAt?.toISOString() ?? null,
          reviewReason: review.reviewReason,
          publicState: review.publicState,
        }
      : null;
  }

  private async upsertPartnerListingDraftContent(
    user: AuthenticatedUser,
    store: Awaited<ReturnType<NightlifeDataService['getPartnerListingStore']>>,
    payload: PartnerListingDraftPayload,
    client: NightlifePrismaClient = this.prisma,
  ) {
    const savedAt = new Date().toISOString();
    const metadata = this.toPrismaJson({
      kind: PARTNER_LISTING_DRAFT_KIND,
      version: 1,
      listing: payload,
      savedAt,
      savedById: user.id,
    });

    return client.content.upsert({
      where: { slug: this.partnerListingDraftSlug(store.id) },
      update: {
        authorId: user.id,
        storeId: store.id,
        title: `${payload.storeName} listing draft`,
        status: 'DRAFT',
        excerpt: payload.description ?? payload.businessType ?? null,
        body: payload.description,
        metadata,
        publishedAt: null,
        deletedAt: null,
      },
      create: {
        authorId: user.id,
        storeId: store.id,
        title: `${payload.storeName} listing draft`,
        slug: this.partnerListingDraftSlug(store.id),
        type: 'STORE_POST',
        status: 'DRAFT',
        excerpt: payload.description ?? payload.businessType ?? null,
        body: payload.description,
        metadata,
      },
      select: {
        id: true,
        title: true,
        slug: true,
        status: true,
        excerpt: true,
        body: true,
        metadata: true,
        createdAt: true,
        updatedAt: true,
        publishedAt: true,
      },
    });
  }

  private normalizePartnerListingDraft(
    dto: Partial<PartnerListingDraftDto>,
    store: Awaited<ReturnType<NightlifeDataService['getPartnerListingStore']>>,
  ): PartnerListingDraftPayload {
    const openingRecord = this.asRecord(store.openingHours);
    const pricingRecord = this.asRecord(store.pricingInfo);
    const storeArea = [store.district, store.city].filter(Boolean).join(', ');
    const rawPricingItems = Array.isArray(dto.pricingItems)
      ? dto.pricingItems
      : [];
    const pricingItems = rawPricingItems
      .map((item) => ({
        label: this.cleanText(item.label),
        value: this.cleanText(item.value),
        note: this.cleanNullableText(item.note) ?? undefined,
      }))
      .filter((item) => item.label && item.value)
      .slice(0, 12);
    const castProfiles = this.normalizePartnerRequestCasts(
      dto.castProfiles,
    ) as PartnerListingCastDto[];
    const priceRange =
      this.cleanNullableText(dto.priceRange) ??
      this.cleanNullableText(String(pricingRecord?.summary ?? ''));

    return {
      storeName:
        this.cleanNullableText(dto.storeName) ??
        this.cleanRequiredText(store.name, 'storeName'),
      businessType: this.cleanNullableText(dto.businessType) ?? store.category,
      storeCategory:
        this.cleanNullableText(dto.storeCategory) ?? store.category,
      area: this.cleanNullableText(dto.area) ?? (storeArea || null),
      storeCity: this.cleanNullableText(dto.storeCity) ?? store.city,
      storeDistrict:
        this.cleanNullableText(dto.storeDistrict) ?? store.district,
      storeAddress: this.cleanNullableText(dto.storeAddress) ?? store.address,
      phone: this.cleanNullableText(dto.phone) ?? store.phone,
      openingHours:
        this.cleanNullableText(dto.openingHours) ??
        this.cleanNullableText(String(openingRecord?.summary ?? '')),
      priceRange,
      description: this.cleanNullableText(dto.description) ?? store.description,
      note: this.cleanNullableText(dto.note),
      menuSummary:
        this.cleanNullableText(dto.menuSummary) ??
        this.partnerListingMenuSummary({ pricingItems, priceRange }),
      pricingItems,
      castProfiles,
      mediaUrls: this.cleanStringArray(dto.mediaUrls, 12),
    };
  }

  private partnerListingDraftPayloadFromContent(
    draft: Awaited<
      ReturnType<NightlifeDataService['findPartnerListingDraft']>
    > | null,
    store: Awaited<ReturnType<NightlifeDataService['getPartnerListingStore']>>,
  ) {
    const metadata = this.asRecord(draft?.metadata);
    const listing = this.asRecord(metadata?.listing);

    if (metadata?.kind === PARTNER_LISTING_DRAFT_KIND && listing) {
      return this.normalizePartnerListingDraft(
        listing as Partial<PartnerListingDraftDto>,
        store,
      );
    }

    return this.normalizePartnerListingDraft({}, store);
  }

  private partnerListingDraftResponse(
    store: Awaited<ReturnType<NightlifeDataService['getPartnerListingStore']>>,
    draft: Awaited<ReturnType<NightlifeDataService['findPartnerListingDraft']>>,
    payload: PartnerListingDraftPayload,
    options: {
      message: string;
      review?: Awaited<
        ReturnType<NightlifeDataService['getLatestPartnerListingReview']>
      >;
    },
  ) {
    return {
      message: options.message,
      store: {
        id: store.id,
        name: store.name,
        slug: store.slug,
        status: store.status,
      },
      contentId: draft?.id ?? null,
      contentStatus: draft?.status ?? 'DRAFT',
      savedAt: draft?.updatedAt?.toISOString() ?? null,
      publishedAt: draft?.publishedAt?.toISOString() ?? null,
      review: options.review ?? null,
      draft: payload,
    };
  }

  private async partnerListingContact(
    user: AuthenticatedUser,
    store: Awaited<ReturnType<NightlifeDataService['getPartnerListingStore']>>,
    client: NightlifePrismaClient = this.prisma,
  ) {
    const userRecord = await client.user.findUnique({
      where: { id: user.id },
      select: { email: true, displayName: true, phone: true },
    });
    const partnerAccount = await client.partnerAccount.findFirst({
      where: {
        deletedAt: null,
        OR: [
          { userId: user.id },
          ...(store.partnerAccountId ? [{ id: store.partnerAccountId }] : []),
        ],
      },
      orderBy: { updatedAt: 'desc' },
      select: {
        id: true,
        contactName: true,
        contactPhone: true,
        contactEmail: true,
      },
    });

    return {
      partnerAccountId: partnerAccount?.id ?? store.partnerAccountId ?? null,
      contactName:
        this.cleanNullableText(partnerAccount?.contactName) ??
        this.cleanNullableText(userRecord?.displayName) ??
        this.cleanNullableText(userRecord?.email) ??
        this.cleanNullableText(user.email) ??
        'Partner',
      contactPhone:
        this.cleanNullableText(partnerAccount?.contactPhone) ??
        this.cleanNullableText(userRecord?.phone) ??
        this.cleanNullableText(store.phone) ??
        'N/A',
      contactEmail:
        this.cleanEmail(partnerAccount?.contactEmail) ||
        this.cleanEmail(userRecord?.email) ||
        this.cleanEmail(user.email) ||
        null,
    };
  }

  private async partnerListingStoreUpdateFromRequest(
    client: NightlifePrismaClient,
    request: PartnerRequestCmsRecord,
  ): Promise<Prisma.StoreUncheckedUpdateInput> {
    if (!request.draftContentIds.length) {
      return {};
    }

    const draft = await client.content.findFirst({
      where: {
        id: { in: request.draftContentIds },
        storeId: request.store.id,
        type: 'STORE_POST',
        deletedAt: null,
      },
      orderBy: { updatedAt: 'desc' },
      select: {
        id: true,
        title: true,
        slug: true,
        status: true,
        excerpt: true,
        body: true,
        metadata: true,
        createdAt: true,
        updatedAt: true,
        publishedAt: true,
      },
    });

    if (!draft) {
      return {};
    }

    const metadata = this.asRecord(draft.metadata);
    if (metadata?.kind !== PARTNER_LISTING_DRAFT_KIND) {
      return {};
    }

    const store = await client.store.findUnique({
      where: { id: request.store.id },
      select: {
        id: true,
        name: true,
        slug: true,
        status: true,
        category: true,
        description: true,
        address: true,
        city: true,
        district: true,
        phone: true,
        openingHours: true,
        pricingInfo: true,
        tags: true,
        partnerAccountId: true,
        ownerId: true,
      },
    });

    if (!store) {
      return {};
    }

    const payload = this.partnerListingDraftPayloadFromContent(draft, store);
    const data: Prisma.StoreUncheckedUpdateInput = {};

    if (payload.storeName) data.name = payload.storeName;
    if (payload.storeCategory) {
      data.category = this.normalizePartnerRequestCategory(
        payload.storeCategory,
      );
    }
    if (payload.description !== null) data.description = payload.description;
    if (payload.storeAddress !== null) data.address = payload.storeAddress;
    if (payload.storeCity !== null) data.city = payload.storeCity;
    if (payload.storeDistrict !== null) data.district = payload.storeDistrict;
    if (payload.phone !== null) data.phone = payload.phone;
    if (payload.openingHours !== null) {
      data.openingHours = this.toPrismaJson({ summary: payload.openingHours });
    }
    if (payload.priceRange !== null || payload.pricingItems.length) {
      data.pricingInfo = this.toPrismaJson({
        summary: payload.priceRange,
        items: payload.pricingItems,
      });
    }

    return data;
  }

  private partnerListingDraftSlug(storeId: string) {
    return `partner-listing-draft-${storeId}`;
  }

  private partnerListingMenuSummary(
    payload: Pick<PartnerListingDraftPayload, 'priceRange' | 'pricingItems'>,
  ) {
    const lines = [
      payload.priceRange ? `Khoang gia: ${payload.priceRange}` : '',
      ...payload.pricingItems.map((item) =>
        [item.label, item.value, item.note].filter(Boolean).join(' - '),
      ),
    ].filter(Boolean);

    return lines.length ? lines.join('\n') : null;
  }

  private async createPartnerRequestMedia(
    input: {
      requestId: string;
      url: string;
      index: number;
      storeId?: string;
      castId?: string;
      purpose: string;
    },
    client: NightlifePrismaClient = this.prisma,
  ) {
    return client.media.create({
      data: {
        storeId: input.storeId,
        castId: input.castId,
        storageKey: this.partnerRequestMediaStorageKey(
          input.requestId,
          input.url,
          input.index,
        ),
        originalName: this.partnerRequestMediaName(input.url),
        mimeType: this.partnerRequestMimeType(input.url),
        sizeBytes: 0,
        url: input.url,
        purpose: input.purpose,
        type: this.partnerRequestMediaType(input.url),
        access: 'PROTECTED',
        status: 'HIDDEN',
        metadata: this.toPrismaJson({
          partnerRequestId: input.requestId,
          source: 'PARTNER_REQUEST',
        }),
      },
      select: { id: true },
    });
  }

  private partnerRequestSelect() {
    return {
      id: true,
      status: true,
      businessName: true,
      businessType: true,
      area: true,
      contactName: true,
      contactPhone: true,
      contactEmail: true,
      note: true,
      storeDescription: true,
      storeAddress: true,
      storeCity: true,
      storeDistrict: true,
      openingHours: true,
      menuSummary: true,
      mediaUrls: true,
      castProfiles: true,
      draftCastIds: true,
      draftMediaIds: true,
      draftContentIds: true,
      reviewReason: true,
      publicState: true,
      submittedAt: true,
      reviewedAt: true,
      reviewedById: true,
      partnerUserId: true,
      partnerAccountId: true,
      createdAt: true,
      store: {
        select: {
          id: true,
          name: true,
          slug: true,
          status: true,
        },
      },
      notificationLog: {
        select: {
          id: true,
          status: true,
          error: true,
          sentAt: true,
        },
      },
    } satisfies Prisma.PartnerRequestSelect;
  }

  private buildAdminPartnerRequestWhere(
    query: AdminPartnerRequestQueryDto,
  ): Prisma.PartnerRequestWhereInput {
    const keyword = this.cleanText(query.keyword);
    const submittedFrom = this.parseOptionalDate(
      query.submittedFrom,
      'submittedFrom',
    );
    const submittedTo = this.parseOptionalDate(
      query.submittedTo,
      'submittedTo',
    );
    const submittedAt: Prisma.DateTimeFilter = {};

    if (submittedFrom) {
      submittedAt.gte = submittedFrom;
    }
    if (submittedTo) {
      submittedAt.lte = submittedTo;
    }

    return {
      ...(query.status ? { status: query.status } : {}),
      ...(Object.keys(submittedAt).length ? { submittedAt } : {}),
      ...(keyword
        ? {
            OR: [
              { id: { contains: keyword, mode: 'insensitive' } },
              { businessName: { contains: keyword, mode: 'insensitive' } },
              { contactName: { contains: keyword, mode: 'insensitive' } },
              { contactPhone: { contains: keyword, mode: 'insensitive' } },
              { contactEmail: { contains: keyword, mode: 'insensitive' } },
              { store: { name: { contains: keyword, mode: 'insensitive' } } },
            ],
          }
        : {}),
    };
  }

  private async findPartnerRequest(
    requestId: string,
    client: NightlifePrismaClient = this.prisma,
  ) {
    const lookup = this.cleanRequiredText(requestId, 'requestId');
    const or: Prisma.PartnerRequestWhereInput[] = [{ id: lookup }];

    if (this.isUuid(lookup)) {
      or.push({ storeId: lookup }, { notificationLogId: lookup });
    }

    return (await client.partnerRequest.findFirst({
      where: { OR: or },
      select: this.partnerRequestSelect(),
    })) as unknown as PartnerRequestCmsRecord | null;
  }

  private async notifyPartnerRequestDelivery(request: PartnerRequestCmsRecord) {
    try {
      const notificationId =
        await this.adminNotificationService?.notifyPartnerRequest(
          this.partnerRequestNotificationInput(request),
        );

      if (!notificationId) {
        return;
      }

      await this.prisma.partnerRequest.update({
        where: { id: request.id },
        data: { notificationLogId: notificationId },
        select: { id: true },
      });
    } catch (error) {
      this.logger.warn(
        `Partner request Telegram delivery failed: ${this.errorMessage(error)}`,
      );
    }
  }

  private partnerRequestNotificationInput(request: PartnerRequestCmsRecord) {
    return {
      id: request.id,
      draftStoreId: request.store.id,
      draftStoreName: request.store.name,
      draftStoreSlug: request.store.slug,
      draftCastIds: request.draftCastIds,
      draftMediaIds: request.draftMediaIds,
      draftContentIds: request.draftContentIds,
      businessName: request.businessName,
      businessType: request.businessType,
      area: request.area,
      contactName: request.contactName,
      contactPhone: request.contactPhone,
      contactEmail: request.contactEmail,
      note: request.note,
      storeDescription: request.storeDescription,
      storeAddress: request.storeAddress,
      storeCity: request.storeCity,
      storeDistrict: request.storeDistrict,
      openingHours: request.openingHours,
      menuSummary: request.menuSummary,
      mediaUrls: request.mediaUrls,
      castProfiles: this.partnerRequestCastProfiles(request.castProfiles),
      submittedAt: request.submittedAt,
    };
  }

  private partnerRequestNotificationPayload(request: PartnerRequestCmsRecord) {
    return {
      requestId: request.id,
      status: request.status,
      reviewReason: request.reviewReason,
      reviewedAt: this.toIsoDate(request.reviewedAt),
      reviewedById: request.reviewedById,
      partnerUserId: request.partnerUserId,
      partnerAccountId: request.partnerAccountId,
      draftStoreId: request.store.id,
      draftStoreName: request.store.name,
      draftStoreSlug: request.store.slug,
      draftCastIds: request.draftCastIds,
      draftMediaIds: request.draftMediaIds,
      draftContentIds: request.draftContentIds,
      businessName: request.businessName,
      businessType: request.businessType,
      area: request.area,
      contactName: request.contactName,
      contactPhone: request.contactPhone,
      contactEmail: request.contactEmail,
      note: request.note,
      storeDescription: request.storeDescription,
      storeAddress: request.storeAddress,
      storeCity: request.storeCity,
      storeDistrict: request.storeDistrict,
      openingHours: request.openingHours,
      menuSummary: request.menuSummary,
      mediaUrls: request.mediaUrls,
      castProfiles: this.partnerRequestCastProfiles(request.castProfiles),
      submittedAt: this.toIsoDate(request.submittedAt),
      publicState: request.publicState,
    };
  }

  private partnerRequestAuditJson(
    request: PartnerRequestCmsRecord,
  ): Prisma.InputJsonObject {
    return this.partnerRequestNotificationPayload(
      request,
    ) as unknown as Prisma.InputJsonObject;
  }

  private mapPartnerRequestRecord(request: PartnerRequestCmsRecord) {
    return {
      id: request.id,
      notificationId: request.notificationLog?.id ?? null,
      notificationStatus: request.notificationLog?.status ?? null,
      notificationError: request.notificationLog?.error ?? null,
      notifiedAt: request.notificationLog?.sentAt?.toISOString() ?? null,
      submittedAt: request.submittedAt.toISOString(),
      status: request.status,
      reviewReason: request.reviewReason,
      reviewedAt: request.reviewedAt?.toISOString() ?? null,
      reviewedById: request.reviewedById,
      partnerUserId: request.partnerUserId,
      partnerAccountId: request.partnerAccountId,
      publicState: request.publicState,
      draftStoreId: request.store.id,
      draftStoreName: request.store.name,
      draftStoreSlug: request.store.slug,
      draftCastIds: request.draftCastIds,
      draftMediaIds: request.draftMediaIds,
      draftContentIds: request.draftContentIds,
      draftCastCount: request.draftCastIds.length,
      draftMediaCount: request.draftMediaIds.length,
      draftContentCount: request.draftContentIds.length,
      businessName: request.businessName,
      businessType: request.businessType,
      area: request.area,
      contactName: request.contactName,
      contactPhone: request.contactPhone,
      contactEmail: request.contactEmail,
      note: request.note,
      storeDescription: request.storeDescription,
      storeAddress: request.storeAddress,
      storeCity: request.storeCity,
      storeDistrict: request.storeDistrict,
      openingHours: request.openingHours,
      menuSummary: request.menuSummary,
      mediaUrls: request.mediaUrls,
    };
  }

  private async ensurePartnerOnboarding(
    client: NightlifePrismaClient,
    request: PartnerRequestCmsRecord,
  ) {
    const email = this.cleanEmail(request.contactEmail);
    if (!email) {
      throw new UnprocessableEntityException(
        'contactEmail is required to approve and onboard a partner account',
      );
    }

    if (!this.passwordService) {
      throw new UnprocessableEntityException(
        'Password service is required to onboard a partner account',
      );
    }

    const displayName = request.contactName || request.businessName;
    const existingUser = await client.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        role: true,
        status: true,
        deletedAt: true,
      },
    });

    let temporaryPassword: string | null = null;
    const user = existingUser
      ? await this.activateExistingPartnerUser(client, existingUser, {
          displayName,
          phone: request.contactPhone,
        })
      : await (async () => {
          temporaryPassword = `Partner-${randomUUID()}`;
          return client.user.create({
            data: {
              email,
              passwordHash: await this.passwordService!.hash(temporaryPassword),
              displayName,
              phone: request.contactPhone,
              role: 'PARTNER',
              tier: UserTier.FREE,
              status: 'ACTIVE',
            },
            select: { id: true, email: true },
          });
        })();

    const existingAccount = await client.partnerAccount.findFirst({
      where: { userId: user.id, deletedAt: null },
      select: { id: true },
    });
    const partnerAccount = existingAccount
      ? await client.partnerAccount.update({
          where: { id: existingAccount.id },
          data: {
            businessName: request.businessName,
            contactName: request.contactName,
            contactPhone: request.contactPhone,
            contactEmail: request.contactEmail,
            status: 'ACTIVE',
          },
          select: { id: true },
        })
      : await client.partnerAccount.create({
          data: {
            userId: user.id,
            businessName: request.businessName,
            contactName: request.contactName,
            contactPhone: request.contactPhone,
            contactEmail: request.contactEmail,
            status: 'ACTIVE',
          },
          select: { id: true },
        });

    await client.storePermission.upsert({
      where: {
        userId_storeId: {
          userId: user.id,
          storeId: request.store.id,
        },
      },
      update: {
        permissions: this.partnerStorePermissionKeys(),
        status: 'ACTIVE',
        deletedAt: null,
      },
      create: {
        userId: user.id,
        storeId: request.store.id,
        permissions: this.partnerStorePermissionKeys(),
        status: 'ACTIVE',
      },
    });

    return {
      userId: user.id,
      partnerAccountId: partnerAccount.id,
      temporaryPassword,
    };
  }

  private async activateExistingPartnerUser(
    client: NightlifePrismaClient,
    user: {
      id: string;
      email: string;
      role: string;
      status: string;
      deletedAt: Date | null;
    },
    input: { displayName: string; phone: string },
  ) {
    if (user.deletedAt || user.status !== 'ACTIVE') {
      throw new UnprocessableEntityException(
        'Existing partner email belongs to an inactive account',
      );
    }

    if (user.role !== 'USER' && user.role !== 'PARTNER') {
      throw new UnprocessableEntityException(
        'Existing partner email belongs to a restricted staff account',
      );
    }

    return client.user.update({
      where: { id: user.id },
      data: {
        role: 'PARTNER',
        displayName: input.displayName,
        phone: input.phone,
      },
      select: { id: true, email: true },
    });
  }

  private partnerStorePermissionKeys() {
    return [
      'store.partner.view',
      'booking.partner.view',
      'bill.partner.view',
      'coupon.scan',
    ];
  }

  private partnerRequestCastProfiles(
    value: Prisma.JsonValue | null,
  ): PartnerRequestCastDto[] {
    if (!Array.isArray(value)) {
      return [];
    }

    return value
      .map((item): PartnerRequestCastDto | null => {
        if (!item || typeof item !== 'object' || Array.isArray(item)) {
          return null;
        }

        const record = item as Record<string, unknown>;
        const stageName =
          typeof record.stageName === 'string' ? record.stageName.trim() : '';

        if (!stageName) {
          return null;
        }

        const profile: PartnerRequestCastDto = { stageName };
        const tags = this.cleanStringArray(
          Array.isArray(record.tags) ? (record.tags as string[]) : [],
          12,
        );
        const languages = this.cleanStringArray(
          Array.isArray(record.languages) ? (record.languages as string[]) : [],
          8,
        );
        const mediaUrls = this.cleanStringArray(
          Array.isArray(record.mediaUrls) ? (record.mediaUrls as string[]) : [],
          8,
        );

        if (typeof record.bio === 'string' && record.bio.trim()) {
          profile.bio = record.bio;
        }
        if (tags.length) {
          profile.tags = tags;
        }
        if (languages.length) {
          profile.languages = languages;
        }
        if (
          typeof record.hourlyRateVnd === 'number' &&
          Number.isFinite(record.hourlyRateVnd)
        ) {
          profile.hourlyRateVnd = record.hourlyRateVnd;
        }
        if (mediaUrls.length) {
          profile.mediaUrls = mediaUrls;
        }

        return profile;
      })
      .filter((profile): profile is PartnerRequestCastDto => Boolean(profile));
  }

  private toIsoDate(value: Date | string | null | undefined) {
    if (!value) {
      return null;
    }

    const date = value instanceof Date ? value : new Date(value);
    return Number.isFinite(date.getTime()) ? date.toISOString() : null;
  }

  private isUuid(value: string) {
    return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
      value,
    );
  }

  private cleanText(value?: string | null) {
    return value?.trim() ?? '';
  }

  private cleanEmail(value?: string | null) {
    return this.cleanText(value).toLowerCase();
  }

  private errorMessage(error: unknown) {
    return error instanceof Error ? error.message : String(error);
  }

  private cleanStringArray(values?: string[] | null, limit = 12) {
    if (!Array.isArray(values)) {
      return [];
    }

    return values
      .map((value) => this.cleanText(value))
      .filter((value): value is string => Boolean(value))
      .slice(0, limit);
  }

  private normalizePartnerRequestCasts(
    castProfiles?: PartnerRequestCastDto[] | null,
  ) {
    if (!Array.isArray(castProfiles)) {
      return [];
    }

    return castProfiles
      .map((profile) => {
        const stageName = this.cleanText(profile.stageName);
        const hourlyRateVnd =
          typeof profile.hourlyRateVnd === 'number' &&
          Number.isFinite(profile.hourlyRateVnd) &&
          profile.hourlyRateVnd >= 0
            ? Math.trunc(profile.hourlyRateVnd)
            : undefined;

        return {
          stageName,
          bio: this.cleanNullableText(profile.bio),
          tags: this.cleanStringArray(profile.tags, 12),
          languages: this.cleanStringArray(profile.languages, 8),
          hourlyRateVnd,
          mediaUrls: this.cleanStringArray(profile.mediaUrls, 8),
        };
      })
      .filter((profile) => profile.stageName);
  }

  private normalizePartnerRequestCategory(
    value?: string | null,
  ): StoreCategory {
    const category = this.normalizeCategory(value);
    if (category) {
      return category;
    }

    const token = this.normalizeToken(value);
    if (token.includes('karaoke') || token.includes('ktv')) {
      return 'KARAOKE';
    }
    if (token.includes('club')) {
      return 'CLUB';
    }
    if (token.includes('bar')) {
      return 'BAR';
    }
    if (token.includes('spa') || token.includes('massage')) {
      return 'MASSAGE_SPA';
    }
    if (token.includes('restaurant') || token.includes('nha-hang')) {
      return 'RESTAURANT';
    }
    if (token.includes('casino')) {
      return 'CASINO';
    }

    return 'LOUNGE';
  }

  private partnerCityFromArea(area?: string | null) {
    const text = this.cleanText(area);
    const token = this.normalizeToken(text);
    if (!text) {
      return null;
    }

    if (token.includes('ha-noi') || token.includes('hanoi')) {
      return 'Ha Noi';
    }

    if (
      token.includes('hcm') ||
      token.includes('sai-gon') ||
      token.includes('saigon') ||
      token.includes('ho-chi-minh')
    ) {
      return 'Ho Chi Minh City';
    }

    return text.split(/[-,]/)[0]?.trim() || null;
  }

  private partnerDistrictFromArea(area?: string | null) {
    const text = this.cleanText(area);
    const [, district] = text.split(/[-,]/).map((part) => part.trim());
    return district || null;
  }

  private buildPartnerRequestSlug(
    value: string,
    requestId: string,
    suffix?: string,
  ) {
    const base = this.normalizeToken(value) || 'partner';
    const requestToken = this.normalizeToken(requestId) || randomUUID();
    return [base, requestToken, suffix].filter(Boolean).join('-').slice(0, 190);
  }

  private partnerRequestMediaStorageKey(
    requestId: string,
    url: string,
    index: number,
  ) {
    const hash = createHash('sha1').update(url).digest('hex').slice(0, 12);
    const extension = this.partnerRequestMediaExtension(url);
    return `partner-requests/${this.normalizeToken(requestId)}/${index + 1}-${hash}.${extension}`;
  }

  private partnerRequestMediaName(url: string) {
    try {
      const pathname = new URL(url).pathname;
      const fileName = pathname.split('/').filter(Boolean).pop();
      return fileName || 'partner-media';
    } catch {
      return 'partner-media';
    }
  }

  private partnerRequestMediaExtension(url: string) {
    const name = this.partnerRequestMediaName(url).toLowerCase();
    const extension = name.includes('.') ? name.split('.').pop() : null;
    return extension && /^[a-z0-9]{2,5}$/.test(extension) ? extension : 'bin';
  }

  private partnerRequestMimeType(url: string) {
    const extension = this.partnerRequestMediaExtension(url);
    const mimeByExtension: Record<string, string> = {
      jpg: 'image/jpeg',
      jpeg: 'image/jpeg',
      png: 'image/png',
      webp: 'image/webp',
      gif: 'image/gif',
      mp4: 'video/mp4',
      mov: 'video/quicktime',
      webm: 'video/webm',
      pdf: 'application/pdf',
    };

    return mimeByExtension[extension] ?? 'application/octet-stream';
  }

  private partnerRequestMediaType(url: string) {
    const mimeType = this.partnerRequestMimeType(url);
    const token = url.toLowerCase();

    if (
      mimeType.startsWith('video/') ||
      token.includes('youtube.com') ||
      token.includes('youtu.be') ||
      token.includes('vimeo.com')
    ) {
      return 'VIDEO';
    }

    if (mimeType.startsWith('image/')) {
      return 'IMAGE';
    }

    if (mimeType === 'application/pdf') {
      return 'DOCUMENT';
    }

    return 'OTHER';
  }

  private normalizeBookingLookupCode(value?: string | null) {
    const token = this.cleanText(value)
      .replace(/^#?BK[-_]?/i, '')
      .toLowerCase();

    if (!/^[a-f0-9-]{8,36}$/.test(token)) {
      throw new BadRequestException('bookingCode must be a valid booking code');
    }

    return token;
  }

  private bookingMatchesLookupCode(bookingId: string, lookupCode: string) {
    const compactBookingId = bookingId.toLowerCase().replace(/-/g, '');
    const compactLookup = lookupCode.toLowerCase().replace(/-/g, '');

    return compactBookingId.startsWith(compactLookup);
  }

  private bookingActorTypeFor(user: AuthenticatedUser): BookingStatusActorType {
    if (user.role === 'ADMIN') {
      return 'ADMIN';
    }

    if (user.role === 'OPERATOR' || user.role === 'STAFF') {
      return 'OPERATOR';
    }

    if (user.role === 'PARTNER') {
      return 'PARTNER';
    }

    if (user.role === 'USER') {
      return 'MEMBER';
    }

    return 'SYSTEM';
  }

  private assertBookingRateLimit(key: string, limit: number, message: string) {
    const now = Date.now();

    for (const [bucketKey, bucket] of bookingRateLimits) {
      if (bucket.resetAt <= now) {
        bookingRateLimits.delete(bucketKey);
      }
    }

    const bucket = bookingRateLimits.get(key);
    if (!bucket || bucket.resetAt <= now) {
      bookingRateLimits.set(key, {
        count: 1,
        resetAt: now + BOOKING_RATE_LIMIT_WINDOW_MS,
      });
      return;
    }

    if (bucket.count >= limit) {
      throw new HttpException(message, HttpStatus.TOO_MANY_REQUESTS);
    }

    bucket.count += 1;
  }

  private normalizeCityCode(
    value?: string | null,
    options: { strict?: boolean } = {},
  ) {
    const token = this.normalizeToken(value);
    if (!token) {
      return undefined;
    }

    const cityCode =
      CITY_ALIASES[token] ?? CITY_ALIASES[token.replace(/-/g, ' ')];

    if (cityCode === 'all') {
      return undefined;
    }

    if (!cityCode && options.strict) {
      throw new BadRequestException('city must be hn, hcm, or all');
    }

    return cityCode;
  }

  private cityCodeFromAreaCode(code: string) {
    return code.split('-')[0] || undefined;
  }

  private normalizeCategory(
    value?: string | null,
    options: { strict?: boolean } = {},
  ): StoreCategory | undefined {
    const token = this.normalizeToken(value);
    const upperValue = value?.trim().toUpperCase();

    if (!token && !upperValue) {
      return undefined;
    }

    if (upperValue === 'SPA') {
      return 'MASSAGE_SPA';
    }

    if (upperValue && this.isStoreCategory(upperValue)) {
      return upperValue;
    }

    const category = CATEGORY_ALIASES[token];

    if (!category && options.strict) {
      throw new BadRequestException(
        'category must be one of BAR, CLUB, LOUNGE, GIRLS_BAR, KARAOKE, MASSAGE_SPA, RESTAURANT, CASINO',
      );
    }

    return category;
  }

  private isStoreCategory(value: string): value is StoreCategory {
    return [
      'BAR',
      'CLUB',
      'LOUNGE',
      'GIRLS_BAR',
      'KARAOKE',
      'MASSAGE_SPA',
      'RESTAURANT',
      'CASINO',
    ].includes(value);
  }

  private normalizeToken(value?: string | null) {
    return (
      value
        ?.trim()
        .toLowerCase()
        .normalize('NFD')
        .replace(/đ/g, 'd')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[_\s]+/g, '-')
        .replace(/[^a-z0-9-]/g, '')
        .replace(/-+/g, '-')
        .replace(/(^-|-$)/g, '') ?? ''
    );
  }

  private normalizeStoreSlug(value?: string | null) {
    const token = this.normalizeToken(value);
    return STORE_SLUG_ALIASES[token] ?? token;
  }

  private normalizeCastSlug(value?: string | null) {
    const token = this.normalizeToken(value);
    return CAST_SLUG_ALIASES[token] ?? token;
  }

  private containsInsensitive(value: string): Prisma.StringFilter {
    return { contains: value, mode: 'insensitive' };
  }

  private equalsInsensitive(value: string): Prisma.StringFilter {
    return { equals: value, mode: 'insensitive' };
  }

  private contentSelect(): Prisma.ContentSelect {
    return {
      id: true,
      title: true,
      slug: true,
      type: true,
      status: true,
      excerpt: true,
      body: true,
      metadata: true,
      publishedAt: true,
      createdAt: true,
      updatedAt: true,
      author: {
        select: {
          id: true,
          displayName: true,
          email: true,
        },
      },
      store: {
        select: {
          id: true,
          name: true,
          slug: true,
        },
      },
    };
  }

  private mapContent(content: ContentRecord) {
    const metadata = this.asRecord(content.metadata) ?? {};

    return {
      id: content.id,
      title: content.title,
      slug: content.slug,
      type: content.type,
      status: content.status,
      excerpt: content.excerpt,
      body: content.body,
      metadata,
      noindex: metadata.noindex === true,
      publishedAt: content.publishedAt?.toISOString() ?? null,
      createdAt: content.createdAt.toISOString(),
      updatedAt: content.updatedAt.toISOString(),
      author: content.author,
      store: content.store,
    };
  }

  private resolveContentType(
    value?: string | null,
    options: { strict?: boolean } = {},
  ): ContentType | undefined {
    const token = this.normalizeToken(value).replace(/-/g, '_').toUpperCase();
    if (!token) {
      return undefined;
    }

    if (this.isContentType(token)) {
      return token;
    }

    if (options.strict) {
      throw new BadRequestException(
        'Loại nội dung phải là blog, banner hoặc chính sách.',
      );
    }

    return undefined;
  }

  private isContentType(value: string): value is ContentType {
    return ['BLOG', 'POLICY', 'BANNER'].includes(value);
  }

  private resolveContentStatus(
    value?: string | null,
    options: { strict?: boolean } = {},
  ): ContentStatus | undefined {
    const token = this.normalizeToken(value).replace(/-/g, '_').toUpperCase();
    if (!token) {
      return undefined;
    }

    if (this.isContentStatus(token)) {
      return token;
    }

    if (options.strict) {
      throw new BadRequestException(
        'status must be DRAFT, PUBLISHED, ARCHIVED, or DELETED',
      );
    }

    return undefined;
  }

  private isContentStatus(value: string): value is ContentStatus {
    return ['DRAFT', 'PUBLISHED', 'ARCHIVED', 'DELETED'].includes(value);
  }

  private cleanRequiredText(value: string, field: string) {
    const text = this.cleanText(value);
    if (!text) {
      throw new BadRequestException(`${field} is required`);
    }

    return text;
  }

  private cleanNullableText(value?: string | null) {
    const text = this.cleanText(value);
    return text || null;
  }

  private normalizeContentSlug(value: string) {
    const slug = this.normalizeToken(value);
    if (!slug) {
      throw new BadRequestException('slug is required');
    }

    return slug;
  }

  private parseOptionalDate(value: string | null | undefined, field: string) {
    if (value === undefined) {
      return undefined;
    }

    if (value === null || value === '') {
      return null;
    }

    const date = new Date(value);
    if (!Number.isFinite(date.getTime())) {
      throw new BadRequestException(`${field} must be a valid ISO date`);
    }

    return date;
  }

  private toPrismaJson(value?: Record<string, unknown> | null) {
    if (value === undefined) {
      return undefined;
    }

    if (value === null) {
      return Prisma.JsonNull;
    }

    return value as Prisma.InputJsonValue;
  }

  private buildMinimalSensitiveMetadata(input: {
    actorId?: string | null;
    action: string;
    refType: string;
    refId: string;
    occurredAt?: Date;
    metadata?: Record<string, unknown>;
  }) {
    const occurredAt = input.occurredAt ?? new Date();

    return {
      ...(input.metadata ?? {}),
      actorId: input.actorId ?? null,
      action: input.action,
      refType: input.refType,
      refId: input.refId,
      ref_id: input.refId,
      occurredAt: occurredAt.toISOString(),
    };
  }

  private async recordSensitiveActionNotification(
    prisma: Prisma.TransactionClient | PrismaService,
    input: {
      actorId?: string | null;
      action: string;
      refType: string;
      refId: string;
      templateKey: string;
      occurredAt?: Date;
      recipient?: string;
      userId?: string | null;
      guestId?: string | null;
      storeId?: string | null;
      bookingId?: string | null;
      billId?: string | null;
      payload?: Record<string, unknown>;
    },
  ) {
    await prisma.notificationLog.create({
      data: {
        userId: input.userId ?? undefined,
        guestId: input.guestId ?? undefined,
        storeId: input.storeId ?? undefined,
        bookingId: input.bookingId ?? undefined,
        billId: input.billId ?? undefined,
        channel: 'IN_APP',
        status: 'QUEUED',
        recipient: input.recipient ?? `${input.refType}:${input.refId}`,
        templateKey: input.templateKey,
        payload: this.toPrismaJson(
          this.buildMinimalSensitiveMetadata({
            actorId: input.actorId,
            action: input.action,
            refType: input.refType,
            refId: input.refId,
            occurredAt: input.occurredAt,
            metadata: input.payload,
          }),
        ),
      },
    });
  }

  private async recordCustomerBillNotification(
    prisma: Prisma.TransactionClient | PrismaService,
    input: {
      templateKey:
        | 'customer.bill.submitted.v1'
        | 'customer.bill.verified.v1'
        | 'customer.bill.rejected.v1';
      userId?: string | null;
      storeId?: string | null;
      bookingId?: string | null;
      billId: string;
      bill?: {
        id: string;
        billNumber?: string | null;
        status?: string | null;
        totalVnd?: number | null;
        pointsEarned?: number | null;
        rejectReason?: string | null;
        store?: { name?: string | null; slug?: string | null } | null;
      } | null;
      payload?: Record<string, unknown>;
    },
  ) {
    if (!input.userId) return;

    await prisma.notificationLog.create({
      data: {
        userId: input.userId,
        storeId: input.storeId ?? undefined,
        bookingId: input.bookingId ?? undefined,
        billId: input.billId,
        channel: 'IN_APP',
        status: 'QUEUED',
        recipient: `user:${input.userId}`,
        templateKey: input.templateKey,
        payload: this.toPrismaJson({
          ...(input.payload ?? {}),
          billId: input.billId,
          billNumber: input.bill?.billNumber ?? null,
          billStatus: input.bill?.status ?? null,
          totalVnd: input.bill?.totalVnd ?? null,
          pointsEarned: input.bill?.pointsEarned ?? null,
          rejectReason: input.bill?.rejectReason ?? null,
          storeName: input.bill?.store?.name ?? null,
          storeSlug: input.bill?.store?.slug ?? null,
        }),
      },
    });
  }

  private async assertContentSlugAvailable(slug: string, excludeId?: string) {
    const existing = await this.prisma.content.findFirst({
      where: {
        slug,
        ...(excludeId ? { id: { not: excludeId } } : {}),
      },
      select: { id: true },
    });

    if (existing) {
      throw new BadRequestException('Content slug already exists');
    }
  }

  private toNumber(value: unknown) {
    if (value === null || value === undefined) {
      return null;
    }

    if (typeof value === 'number') {
      return Number.isFinite(value) ? value : null;
    }

    if (typeof value === 'string') {
      const parsed = Number(value);
      return Number.isFinite(parsed) ? parsed : null;
    }

    if (
      typeof value === 'object' &&
      'toNumber' in value &&
      typeof value.toNumber === 'function'
    ) {
      const parsed = (value as { toNumber: () => unknown }).toNumber();
      return typeof parsed === 'number' && Number.isFinite(parsed)
        ? parsed
        : null;
    }

    return null;
  }

  private resolveCouponUserType(user: AuthenticatedUser): CouponUserType {
    return user.tier === 'VIP' ? 'VIP' : 'MEMBER';
  }

  private buildCouponDiscountRuleSnapshot(
    coupon: {
      discountType: string;
      discountValue: number;
      maxDiscountVnd: number | null;
      minSpendVnd: number | null;
    },
    userType: CouponUserType,
    tier?: string | null,
  ) {
    const discountPercent = COUPON_DISCOUNT_PERCENT_BY_USER_TYPE[userType];

    return {
      type: 'PERCENT',
      value: discountPercent,
      discountPercent,
      maxDiscountVnd: coupon.maxDiscountVnd,
      minSpendVnd: coupon.minSpendVnd,
      userType,
      tier: userType === 'GUEST' ? null : (tier ?? userType),
      sourceType: coupon.discountType,
      sourceValue: coupon.discountValue,
    };
  }

  private buildCouponCampaignSnapshot(coupon: {
    id: string;
    code: string;
    name: string;
    storeId?: string;
    discountType: string;
    discountValue: number;
    maxDiscountVnd: number | null;
    minSpendVnd: number | null;
    store?: { id: string; name: string; slug: string } | null;
  }) {
    return {
      id: coupon.id,
      code: coupon.code,
      name: coupon.name,
      storeId: coupon.storeId ?? coupon.store?.id ?? null,
      store: coupon.store
        ? {
            id: coupon.store.id,
            name: coupon.store.name,
            slug: coupon.store.slug,
          }
        : null,
      sourceType: coupon.discountType,
      sourceValue: coupon.discountValue,
      maxDiscountVnd: coupon.maxDiscountVnd,
      minSpendVnd: coupon.minSpendVnd,
    };
  }

  private buildCouponQrPayload(issueId: string) {
    const token = this.buildSignedCouponQrToken(issueId);
    const baseUrl = this.couponQrPartnerUrl();
    const url = new URL(baseUrl);
    url.searchParams.set('scanToken', token);
    return url.toString();
  }

  private couponQrPartnerUrl() {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL;
    const configuredUrl =
      process.env.COUPON_QR_PARTNER_URL ??
      (appUrl ? `${appUrl.replace(/\/$/, '')}/partner` : undefined);

    if (configuredUrl) {
      return configuredUrl;
    }

    if (process.env.NODE_ENV === 'production') {
      throw new Error('COUPON_QR_PARTNER_URL is required in production');
    }

    return 'https://nightlife.vn/partner';
  }

  private buildCouponQrPayloadHash(payload: string) {
    return createHash('sha256').update(payload).digest('hex');
  }

  private async buildCouponQrImageDataUrl(payload: string) {
    return QRCode.toDataURL(payload, {
      errorCorrectionLevel: 'M',
      margin: 1,
      width: 220,
    });
  }

  private buildSignedCouponQrToken(issueId: string) {
    const encodedPayload = Buffer.from(
      JSON.stringify({
        v: 1,
        type: 'coupon_issue',
        issueId,
        nonce: randomUUID(),
        iat: Date.now(),
      }),
    ).toString('base64url');
    const signature = this.signCouponQrPayload(encodedPayload);
    return `${encodedPayload}.${signature}`;
  }

  private signCouponQrPayload(
    encodedPayload: string,
    secret = this.couponQrSecret(),
  ) {
    return createHmac('sha256', secret)
      .update(encodedPayload)
      .digest('base64url');
  }

  private couponQrSecret() {
    if (process.env.COUPON_QR_SECRET) {
      return process.env.COUPON_QR_SECRET;
    }

    if (process.env.NODE_ENV === 'production') {
      throw new Error(
        'COUPON_QR_SECRET is required in production for Booking QR signing.',
      );
    }

    return process.env.JWT_SECRET ?? 'nightlife-dev-coupon-qr-secret';
  }

  private resolveCouponIssueIdFromQrPayload(payload: string) {
    return this.resolveCouponIssueTokenFromQrPayload(payload).issueId;
  }

  private resolveCouponIssueTokenFromQrPayload(payload: string) {
    const token = this.extractCouponQrToken(payload);
    const [encodedPayload, signature] = token.split('.');
    if (!encodedPayload || !signature) {
      throw new BadRequestException('Invalid coupon QR payload');
    }

    const matchesKnownSecret = this.couponQrVerificationSecrets().some(
      (secret) =>
        this.safeCompare(
          signature,
          this.signCouponQrPayload(encodedPayload, secret),
        ),
    );
    if (!matchesKnownSecret) {
      throw new BadRequestException('Invalid coupon QR signature');
    }

    try {
      const parsed = JSON.parse(
        Buffer.from(encodedPayload, 'base64url').toString('utf8'),
      ) as { type?: string; issueId?: string };

      if (parsed.type !== 'coupon_issue' || !parsed.issueId) {
        throw new Error('Invalid QR token payload');
      }

      return {
        issueId: parsed.issueId,
        tokenHash: this.buildCouponQrTokenHash(token),
      };
    } catch {
      throw new BadRequestException('Invalid coupon QR payload');
    }
  }

  private extractCouponQrToken(payload: string) {
    const value = this.cleanText(payload);
    if (!value) {
      throw new BadRequestException('payload is required');
    }

    try {
      const url = new URL(value);
      return (
        url.searchParams.get('scanToken') ??
        url.searchParams.get('token') ??
        value
      );
    } catch {
      return value;
    }
  }

  private buildCouponQrTokenHash(token: string) {
    return createHash('sha256').update(token).digest('hex');
  }

  private buildCouponQrTokenHashFromPayload(payload: string) {
    return this.buildCouponQrTokenHash(this.extractCouponQrToken(payload));
  }

  private couponQrVerificationSecrets() {
    const secrets = [
      this.couponQrSecret(),
      ...this.couponQrPreviousSecrets(),
    ].filter((secret) => secret.trim());

    return [...new Set(secrets)];
  }

  private couponQrPreviousSecrets() {
    return (process.env.COUPON_QR_PREVIOUS_SECRETS ?? '')
      .split(',')
      .map((secret) => secret.trim())
      .filter(Boolean);
  }

  private safeCompare(value: string, expected: string) {
    const valueBuffer = Buffer.from(value);
    const expectedBuffer = Buffer.from(expected);
    return (
      valueBuffer.length === expectedBuffer.length &&
      timingSafeEqual(valueBuffer, expectedBuffer)
    );
  }

  private couponIssueStatusLabel(status: string) {
    return COUPON_ISSUE_STATUS_LABELS[status] ?? status;
  }

  private decoratePartnerCouponIssue(issue: PartnerCouponIssueRecord) {
    const metadata = this.asRecord(issue.metadata);
    const discountRuleSnapshot = this.asRecord(metadata?.discountRuleSnapshot);
    const userType = this.partnerCouponUserType(issue, metadata);
    const discountPercent =
      this.toNumber(metadata?.discountPercent) ??
      this.toNumber(discountRuleSnapshot?.discountPercent) ??
      this.toNumber(discountRuleSnapshot?.value);

    return {
      id: issue.id,
      code: issue.code,
      status: issue.status,
      statusLabel: this.couponIssueStatusLabel(issue.status),
      expiresAt: issue.expiresAt ?? null,
      usedAt: issue.usedAt ?? null,
      scannedById: issue.scannedById ?? null,
      userType,
      customer: this.partnerCouponCustomerSummary(userType),
      discountPercent,
      discountRuleSnapshot: discountRuleSnapshot ?? null,
      booking: issue.booking
        ? {
            status: issue.booking.status,
            scheduledAt: issue.booking.scheduledAt ?? null,
          }
        : null,
      coupon: issue.coupon ?? null,
    };
  }

  private partnerCouponUserType(
    issue: Pick<PartnerCouponIssueRecord, 'userId'>,
    metadata?: Record<string, unknown>,
  ) {
    const metadataUserType = metadata?.userType ?? metadata?.recipientType;
    if (typeof metadataUserType === 'string' && metadataUserType.trim()) {
      return metadataUserType.trim().toUpperCase();
    }

    return issue.userId ? 'MEMBER' : 'GUEST';
  }

  private partnerCouponCustomerSummary(userType: string) {
    if (userType === 'VIP') {
      return { type: userType, label: 'Hội viên VIP' };
    }

    if (userType === 'MEMBER') {
      return { type: userType, label: 'Hội viên' };
    }

    if (userType === 'GUEST') {
      return { type: userType, label: 'Khách vãng lai' };
    }

    return { type: userType, label: 'Khách hàng' };
  }

  private async decorateCouponIssue<
    T extends { id?: string; code: string; status: string; metadata?: unknown },
  >(issue: T) {
    const metadata = this.asRecord(issue.metadata);
    const discountRuleSnapshot = this.asRecord(metadata?.discountRuleSnapshot);
    const discountPercent = this.toNumber(metadata?.discountPercent);
    const qrPayload =
      typeof metadata?.qrPayload === 'string'
        ? metadata.qrPayload
        : typeof issue.id === 'string'
          ? this.buildCouponQrPayload(issue.id)
          : issue.code;

    return {
      ...issue,
      qrPayload,
      qrImageDataUrl:
        issue.status === 'ISSUED'
          ? await this.buildCouponQrImageDataUrl(qrPayload)
          : null,
      statusLabel: this.couponIssueStatusLabel(issue.status),
      userType:
        typeof metadata?.userType === 'string'
          ? metadata.userType
          : metadata?.recipientType,
      discountPercent:
        discountPercent ??
        this.toNumber(discountRuleSnapshot?.discountPercent) ??
        this.toNumber(discountRuleSnapshot?.value),
      discountRuleSnapshot: discountRuleSnapshot ?? null,
    };
  }

  private asRecord(value: unknown) {
    if (!value || typeof value !== 'object' || Array.isArray(value)) {
      return undefined;
    }

    return value as Record<string, unknown>;
  }

  private assertCouponClaimRateLimit(key: string, message: string) {
    this.assertRateLimit(
      couponClaimRateLimits,
      key,
      COUPON_CLAIM_RATE_LIMIT,
      COUPON_CLAIM_RATE_LIMIT_WINDOW_MS,
      message,
    );
  }

  private assertRateLimit(
    buckets: Map<string, BookingRateLimitBucket>,
    key: string,
    limit: number,
    windowMs: number,
    message: string,
  ) {
    const now = Date.now();

    for (const [bucketKey, bucket] of buckets) {
      if (bucket.resetAt <= now) {
        buckets.delete(bucketKey);
      }
    }

    const bucket = buckets.get(key);
    if (!bucket || bucket.resetAt <= now) {
      buckets.set(key, {
        count: 1,
        resetAt: now + windowMs,
      });
      return;
    }

    if (bucket.count >= limit) {
      throw new HttpException(message, HttpStatus.TOO_MANY_REQUESTS);
    }

    bucket.count += 1;
  }

  private async assertNoDuplicateActiveGuestCouponIssue(
    couponId: string,
    phone: string,
    now: Date,
  ) {
    const existingIssue = await this.prisma.couponIssue.findFirst({
      where: {
        couponId,
        status: 'ISSUED',
        OR: [{ expiresAt: null }, { expiresAt: { gt: now } }],
        guest: { is: { phone } },
      },
      select: { id: true },
    });

    if (existingIssue) {
      throw new UnprocessableEntityException(
        'Active coupon issue already exists for this phone',
      );
    }
  }

  private async assertNoDuplicateActiveMemberCouponIssue(
    couponId: string,
    userId: string,
    now: Date,
  ) {
    const existingIssue = await this.prisma.couponIssue.findFirst({
      where: {
        couponId,
        userId,
        status: 'ISSUED',
        OR: [{ expiresAt: null }, { expiresAt: { gt: now } }],
      },
      select: { id: true },
    });

    if (existingIssue) {
      throw new UnprocessableEntityException(
        'Active coupon issue already exists for this member',
      );
    }
  }

  private buildCouponClaimContextSnapshot(context: CouponClaimContext) {
    return {
      ip: context.ip ?? null,
      userAgent: context.userAgent ?? null,
      deviceId: context.deviceId ?? null,
      sessionId: context.sessionId ?? null,
    };
  }

  private async recordCouponClaimEvent(input: {
    claimKey: string;
    coupon: {
      id: string;
      code: string;
      storeId: string;
      usageLimit: number | null;
      usedCount: number;
    };
    issue: { id: string; code: string; status: string };
    context: CouponClaimContext;
    recipientType: string;
    userId?: string | null;
    guestId?: string | null;
    prisma?: Prisma.TransactionClient;
  }) {
    const prisma = input.prisma ?? this.prisma;
    await prisma.notificationLog.create({
      data: {
        userId: input.userId ?? undefined,
        guestId: input.guestId ?? undefined,
        storeId: input.coupon.storeId,
        channel: 'IN_APP',
        status: 'QUEUED',
        recipient: input.claimKey,
        templateKey: 'coupon.analytics.claimed.v1',
        payload: {
          couponId: input.coupon.id,
          couponCode: input.coupon.code,
          couponIssueId: input.issue.id,
          issueCode: input.issue.code,
          status: input.issue.status,
          recipientType: input.recipientType,
          context: this.buildCouponClaimContextSnapshot(input.context),
        },
      },
    });
    await this.recordCouponFraudSignals(input);
  }

  private async detectCouponClaimFraud(input: {
    claimKey: string;
    coupon: { id: string; code: string; storeId: string };
    issue: { id: string; code: string };
    context: CouponClaimContext;
    prisma?: Prisma.TransactionClient;
  }) {
    const prisma = input.prisma ?? this.prisma;
    const since = new Date(Date.now() - COUPON_CLAIM_FRAUD_WINDOW_MS);
    const signalKeys = this.couponFraudSignals(
      input.claimKey,
      input.context,
    ).map((signal) => signal.key);
    const [recentClaims, recentSignalClaims] = await Promise.all([
      prisma.notificationLog.findMany({
        where: {
          templateKey: 'coupon.analytics.claimed.v1',
          recipient: input.claimKey,
          createdAt: { gte: since },
        },
        select: { id: true },
        take: COUPON_CLAIM_FRAUD_THRESHOLD,
      }),
      signalKeys.length
        ? prisma.notificationLog.findMany({
            where: {
              templateKey: COUPON_FRAUD_SIGNAL_TEMPLATE,
              recipient: { in: signalKeys },
              createdAt: { gte: since },
            },
            select: { id: true, recipient: true },
            take: signalKeys.length * COUPON_CLAIM_FRAUD_THRESHOLD,
          })
        : Promise.resolve([]),
    ]);
    const signalCounts = new Map<string, number>();
    for (const claim of recentSignalClaims) {
      signalCounts.set(
        claim.recipient,
        (signalCounts.get(claim.recipient) ?? 0) + 1,
      );
    }
    const suspiciousSignals = this.couponFraudSignals(
      input.claimKey,
      input.context,
    )
      .map((signal) => ({
        kind: signal.kind,
        fingerprint: signal.fingerprint,
        count: signalCounts.get(signal.key) ?? 0,
      }))
      .filter((signal) => signal.count >= COUPON_CLAIM_FRAUD_THRESHOLD);

    if (
      recentClaims.length < COUPON_CLAIM_FRAUD_THRESHOLD &&
      !suspiciousSignals.length
    ) {
      return;
    }

    await prisma.notificationLog.create({
      data: {
        storeId: input.coupon.storeId,
        channel: 'IN_APP',
        status: 'QUEUED',
        recipient: 'admin',
        templateKey: 'coupon.fraud.claim_burst.v1',
        payload: {
          claimKey: input.claimKey,
          claimKeyFingerprint: this.hashFraudSignal(input.claimKey),
          couponId: input.coupon.id,
          couponCode: input.coupon.code,
          couponIssueId: input.issue.id,
          recentClaimCount: recentClaims.length,
          suspiciousSignals,
          windowMinutes: Math.round(COUPON_CLAIM_FRAUD_WINDOW_MS / 60000),
          context: this.buildCouponFraudContextSnapshot(input.context),
        },
      },
    });
  }

  private async recordCouponFraudSignals(input: {
    claimKey: string;
    coupon: { id: string; code: string; storeId: string };
    issue: { id: string; code: string; status: string };
    context: CouponClaimContext;
    recipientType: string;
    userId?: string | null;
    guestId?: string | null;
    prisma?: Prisma.TransactionClient;
  }) {
    const prisma = input.prisma ?? this.prisma;
    const signals = this.couponFraudSignals(input.claimKey, input.context);
    await Promise.all(
      signals.map((signal) =>
        prisma.notificationLog.create({
          data: {
            userId: input.userId ?? undefined,
            guestId: input.guestId ?? undefined,
            storeId: input.coupon.storeId,
            channel: 'IN_APP',
            status: 'QUEUED',
            recipient: signal.key,
            templateKey: COUPON_FRAUD_SIGNAL_TEMPLATE,
            payload: {
              signalKind: signal.kind,
              signalFingerprint: signal.fingerprint,
              claimKeyFingerprint: this.hashFraudSignal(input.claimKey),
              couponId: input.coupon.id,
              couponCode: input.coupon.code,
              couponIssueId: input.issue.id,
              issueCode: input.issue.code,
              status: input.issue.status,
              recipientType: input.recipientType,
            },
          },
        }),
      ),
    );
  }

  private couponFraudSignals(claimKey: string, context: CouponClaimContext) {
    const signals: Array<[string, string | null | undefined]> = [
      ['CLAIM', claimKey],
      ['IP', context.ip],
      ['DEVICE', context.deviceId],
      ['SESSION', context.sessionId],
      ['USER_AGENT', context.userAgent],
    ];

    return signals
      .map(([kind, value]) => {
        const text = typeof value === 'string' ? value.trim() : '';
        if (!text) {
          return null;
        }
        const fingerprint = this.hashFraudSignal(text);
        return {
          kind,
          fingerprint,
          key: `coupon:fraud:${String(kind).toLowerCase()}:${fingerprint}`,
        };
      })
      .filter(
        (
          signal,
        ): signal is { kind: string; fingerprint: string; key: string } =>
          Boolean(signal),
      );
  }

  private hashFraudSignal(value: string) {
    return createHash('sha256').update(value).digest('hex').slice(0, 16);
  }

  private buildCouponFraudContextSnapshot(context: CouponClaimContext) {
    return {
      ipFingerprint: context.ip ? this.hashFraudSignal(context.ip) : null,
      userAgentFingerprint: context.userAgent
        ? this.hashFraudSignal(context.userAgent)
        : null,
      deviceFingerprint: context.deviceId
        ? this.hashFraudSignal(context.deviceId)
        : null,
      sessionFingerprint: context.sessionId
        ? this.hashFraudSignal(context.sessionId)
        : null,
    };
  }

  private async writeCouponIssueAudit(input: {
    action: string;
    issue: {
      id: string;
      code?: string;
      couponId?: string | null;
      status: string;
      coupon?: { storeId?: string | null } | null;
    };
    actorId?: string | null;
    metadata?: Record<string, unknown>;
    beforeJson?: Record<string, unknown>;
    afterJson?: Record<string, unknown>;
    prisma?: Prisma.TransactionClient;
  }) {
    const prisma = input.prisma ?? this.prisma;
    const occurredAt = new Date();
    await prisma.auditLog.create({
      data: {
        actorId: input.actorId ?? undefined,
        action: input.action,
        targetType: 'CouponIssue',
        targetId: input.issue.id,
        beforeJson: this.toPrismaJson(input.beforeJson),
        afterJson: this.toPrismaJson(input.afterJson),
        metadata: this.toPrismaJson(
          this.buildMinimalSensitiveMetadata({
            actorId: input.actorId,
            action: input.action,
            refType: 'CouponIssue',
            refId: input.issue.id,
            occurredAt,
            metadata: {
              issueCode: input.issue.code ?? null,
              couponId: input.issue.couponId ?? null,
              storeId: input.issue.coupon?.storeId ?? null,
              status: input.issue.status,
              ...(input.metadata ?? {}),
            },
          }),
        ),
      },
    });
  }

  private adminCouponIssueSelect() {
    return {
      id: true,
      code: true,
      guestId: true,
      userId: true,
      qrPayloadHash: true,
      status: true,
      expiresAt: true,
      usedAt: true,
      revokedAt: true,
      createdAt: true,
      metadata: true,
      user: { select: { id: true, displayName: true, tier: true } },
      guest: { select: { id: true, displayName: true } },
      scannedBy: { select: { id: true, displayName: true } },
      booking: { select: { id: true, status: true, scheduledAt: true } },
      bill: {
        select: {
          id: true,
          billNumber: true,
          status: true,
          totalVnd: true,
        },
      },
      coupon: {
        select: {
          id: true,
          code: true,
          name: true,
          discountType: true,
          discountValue: true,
          maxDiscountVnd: true,
          minSpendVnd: true,
          store: { select: { id: true, name: true, slug: true } },
        },
      },
    } satisfies Prisma.CouponIssueSelect;
  }

  private async decorateAdminCouponIssue<
    T extends { id: string; code: string; status: string; metadata?: unknown },
  >(issue: T) {
    const metadata = this.asRecord(issue.metadata);
    return {
      ...(await this.decorateCouponIssue(issue)),
      campaignSnapshot: this.asRecord(metadata?.campaignSnapshot) ?? null,
      auditLogs:
        (await this.listCouponIssueAuditLogs([issue.id])).get(issue.id) ?? [],
    };
  }

  private mergeRevokedQrTokenHashes(metadata: Record<string, unknown>) {
    const hashes = new Set<string>();
    if (Array.isArray(metadata.revokedQrTokenHashes)) {
      metadata.revokedQrTokenHashes.forEach((value) => {
        if (typeof value === 'string' && value.trim()) {
          hashes.add(value.trim());
        }
      });
    }

    const currentHash =
      typeof metadata.qrTokenHash === 'string'
        ? metadata.qrTokenHash
        : typeof metadata.qrPayload === 'string'
          ? this.buildCouponQrTokenHashFromPayload(metadata.qrPayload)
          : null;
    if (currentHash) {
      hashes.add(currentHash);
    }

    return Array.from(hashes);
  }

  private async listCouponIssueAuditLogs(issueIds: string[]) {
    const uniqueIssueIds = [...new Set(issueIds)].filter(Boolean);
    const logsByIssueId = new Map<string, unknown[]>();

    if (!uniqueIssueIds.length) {
      return logsByIssueId;
    }

    const logs = await this.prisma.auditLog.findMany({
      where: {
        targetType: 'CouponIssue',
        targetId: { in: uniqueIssueIds },
      },
      orderBy: { createdAt: 'desc' },
      take: Math.min(uniqueIssueIds.length * 5, 100),
      select: {
        id: true,
        action: true,
        actorId: true,
        targetId: true,
        metadata: true,
        beforeJson: true,
        afterJson: true,
        createdAt: true,
        actor: { select: { id: true, displayName: true, role: true } },
      },
    });

    for (const log of logs) {
      const currentLogs = logsByIssueId.get(log.targetId) ?? [];
      if (currentLogs.length < 5) {
        currentLogs.push(log);
        logsByIssueId.set(log.targetId, currentLogs);
      }
    }

    return logsByIssueId;
  }

  private buildCouponIssueUsageAuditSnapshot(issue: {
    id: string;
    code?: string | null;
    couponId?: string | null;
    status: string;
    usedAt?: Date | string | null;
    scannedById?: string | null;
  }) {
    return {
      id: issue.id,
      code: issue.code ?? null,
      couponId: issue.couponId ?? null,
      status: issue.status,
      usedAt: this.toAuditIso(issue.usedAt),
      scannedById: issue.scannedById ?? null,
    };
  }

  private async recordCouponLifecycleEvent(
    templateKey: string,
    issue: {
      id: string;
      code: string;
      status: string;
      userId?: string | null;
      guestId?: string | null;
      coupon?: {
        id?: string;
        code?: string;
        name?: string;
        store?: { id?: string; name?: string; slug?: string } | null;
      } | null;
    },
    payload: Record<string, unknown> = {},
  ) {
    const action =
      templateKey === 'coupon.issue.used.v1'
        ? 'COUPON_ISSUE_USED'
        : templateKey === 'coupon.issue.scanned.v1'
          ? 'COUPON_ISSUE_SCANNED'
          : templateKey;
    const actorId =
      typeof payload.actorId === 'string' ? payload.actorId : null;

    await this.prisma.notificationLog.create({
      data: {
        userId: issue.userId ?? undefined,
        guestId: issue.guestId ?? undefined,
        storeId: issue.coupon?.store?.id,
        channel: 'IN_APP',
        status: 'QUEUED',
        recipient: `couponIssue:${issue.id}`,
        templateKey,
        payload: this.toPrismaJson(
          this.buildMinimalSensitiveMetadata({
            actorId,
            action,
            refType: 'CouponIssue',
            refId: issue.id,
            metadata: {
              couponIssueId: issue.id,
              issueCode: issue.code,
              status: issue.status,
              coupon: issue.coupon
                ? {
                    id: issue.coupon.id,
                    code: issue.coupon.code,
                    name: issue.coupon.name,
                    store: issue.coupon.store,
                  }
                : null,
              ...payload,
            },
          }),
        ),
      },
    });
  }

  private async recordCouponExpireEvent(
    count: number,
    where: Prisma.CouponIssueWhereInput,
    prisma: Prisma.TransactionClient | PrismaService = this.prisma,
  ) {
    await prisma.notificationLog.create({
      data: {
        channel: 'IN_APP',
        status: 'QUEUED',
        recipient: 'system',
        templateKey: 'coupon.issue.expired.v1',
        payload: {
          expiredCount: count,
          scope: JSON.parse(JSON.stringify(where)) as Prisma.InputJsonValue,
        } as Prisma.InputJsonValue,
      },
    });
  }

  private async expireIssuedCouponIssues(
    where: Prisma.CouponIssueWhereInput,
    prisma: Prisma.TransactionClient | PrismaService = this.prisma,
  ) {
    const result = await prisma.couponIssue.updateMany({
      where: {
        ...where,
        status: 'ISSUED',
        expiresAt: { lte: new Date() },
      },
      data: { status: 'EXPIRED' },
    });

    if (result.count > 0) {
      await this.recordCouponExpireEvent(result.count, where, prisma);
    }
    return result;
  }

  private maskSensitiveBillForRole<T extends { user: unknown; guest: unknown }>(
    bill: T,
    user: AuthenticatedUser,
  ) {
    if (user.role === 'ADMIN') {
      return bill;
    }

    return {
      ...bill,
      user: this.maskCustomerIdentity(bill.user),
      guest: this.maskCustomerIdentity(bill.guest),
    };
  }

  private withBillRevenueAliases<
    T extends {
      subtotalVnd?: number | null;
      totalVnd?: number | null;
      paidVnd?: number | null;
    },
  >(bill: T) {
    return {
      ...bill,
      grossRevenueVnd: bill.subtotalVnd ?? null,
      netRevenueVnd: bill.totalVnd ?? null,
      payableVnd: bill.paidVnd ?? null,
    };
  }

  private resolvePartnerDashboardPeriod(
    input?: string,
  ): PartnerDashboardPeriod {
    if (input === 'today' || input === 'seven' || input === 'thirty') {
      return input;
    }

    return 'seven';
  }

  private resolvePartnerDashboardWindow(period: PartnerDashboardPeriod) {
    const to = new Date();
    const from = new Date(to);
    from.setHours(0, 0, 0, 0);

    if (period === 'seven') {
      from.setDate(from.getDate() - 6);
    }

    if (period === 'thirty') {
      from.setDate(from.getDate() - 29);
    }

    return { from, to };
  }

  private resolvePartnerArrivalSource(): PartnerCustomerArrivalSource {
    return process.env.PARTNER_CUSTOMER_ARRIVAL_SOURCE === 'BILL_APPROVED'
      ? 'BILL_APPROVED'
      : 'QR_USED';
  }

  private partnerBookingCountWhere(
    storeIds: string[],
    from: Date,
    to: Date,
  ): Prisma.BookingWhereInput {
    return {
      deletedAt: null,
      storeId: { in: storeIds },
      createdAt: { gte: from, lte: to },
    };
  }

  private partnerQrUsedCountWhere(
    storeIds: string[],
    from: Date,
    to: Date,
  ): Prisma.CouponIssueWhereInput {
    return {
      status: 'USED',
      usedAt: { gte: from, lte: to },
      coupon: {
        deletedAt: null,
        storeId: { in: storeIds },
      },
    };
  }

  private partnerApprovedBillCountWhere(
    storeIds: string[],
    from: Date,
    to: Date,
  ): Prisma.BillWhereInput {
    return {
      deletedAt: null,
      storeId: { in: storeIds },
      status: { in: ['VERIFIED', 'PAID'] },
      OR: [
        { reviewedAt: { gte: from, lte: to } },
        { verifiedAt: { gte: from, lte: to } },
        { paidAt: { gte: from, lte: to } },
      ],
    };
  }

  private partnerProfileViewWhere(
    storeIds: string[],
    castIds: string[],
    from: Date,
    to: Date,
  ): Prisma.AuditLogWhereInput {
    return {
      action: 'PROFILE_VIEW_RECORDED',
      createdAt: { gte: from, lte: to },
      OR: [
        { targetType: 'STORE', targetId: { in: storeIds } },
        { targetType: 'CAST', targetId: { in: castIds } },
      ],
    };
  }

  private mapPartnerWeeklyBookings(
    rows: Array<{ createdAt: Date | string }>,
    to: Date,
  ) {
    const days = Array.from({ length: 7 }, (_, index) => {
      const date = new Date(to);
      date.setHours(0, 0, 0, 0);
      date.setDate(date.getDate() - 6 + index);
      return date;
    });
    const countByDate = rows.reduce(
      (acc, row) => {
        const key = new Date(row.createdAt).toISOString().slice(0, 10);
        acc[key] = (acc[key] ?? 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );

    return days.map((date) => {
      const isoDate = date.toISOString().slice(0, 10);
      return {
        label: PARTNER_DASHBOARD_DAY_LABELS[date.getDay()],
        date: isoDate,
        count: countByDate[isoDate] ?? 0,
      };
    });
  }

  private maskCustomerIdentity(customer: unknown) {
    if (!customer || typeof customer !== 'object') {
      return customer;
    }

    const value = customer as {
      phone?: string | null;
      email?: string | null;
      [key: string]: unknown;
    };

    return {
      ...value,
      phone: value.phone ? this.maskPhone(value.phone) : value.phone,
      email: value.email ? this.maskEmail(value.email) : value.email,
    };
  }

  private maskPhone(phone: string) {
    if (phone.length <= 6) {
      return '***';
    }

    return `${phone.slice(0, 3)}****${phone.slice(-3)}`;
  }

  private maskEmail(email: string) {
    const [name, domain] = email.split('@');
    if (!domain) {
      return '***';
    }

    return `${name.slice(0, 2)}***@${domain}`;
  }

  private capExpiry(candidate: Date, couponEndsAt: Date | null) {
    if (couponEndsAt && couponEndsAt < candidate) {
      return couponEndsAt;
    }

    return candidate;
  }

  private async assertIssueCanBeConfirmed(issue: {
    id: string;
    status: string;
    expiresAt: Date | null;
  }) {
    if (issue.status === 'EXPIRED') {
      throw new UnprocessableEntityException('Coupon issue has expired');
    }

    if (issue.status === 'USED') {
      throw new UnprocessableEntityException(
        'Coupon issue has already been used',
      );
    }

    if (issue.status !== 'ISSUED') {
      throw new UnprocessableEntityException('Coupon issue is not usable');
    }

    if (issue.expiresAt && issue.expiresAt <= new Date()) {
      await this.expireIssuedCouponIssues({ id: issue.id });
      throw new UnprocessableEntityException('Coupon issue has expired');
    }
  }

  private assertCouponQrTokenUsable(metadata: unknown, qrTokenHash?: string) {
    if (!qrTokenHash) {
      return;
    }

    const record = this.asRecord(metadata);
    const currentTokenHash =
      typeof record?.qrTokenHash === 'string' ? record.qrTokenHash : null;
    const revokedTokenHashes = Array.isArray(record?.revokedQrTokenHashes)
      ? record.revokedQrTokenHashes.filter(
          (value): value is string => typeof value === 'string',
        )
      : [];

    if (
      revokedTokenHashes.includes(qrTokenHash) ||
      (currentTokenHash && currentTokenHash !== qrTokenHash)
    ) {
      throw new UnprocessableEntityException(
        'Coupon QR token has been revoked or rotated',
      );
    }
  }

  async updateAdminBillStatus(
    id: string,
    dto: import('./dto/update-bill-status.dto').UpdateBillStatusDto,
    adminUser: import('@prisma/client').User,
  ) {
    if (dto.status === 'REJECTED' && !this.cleanText(dto.reason)) {
      throw new BadRequestException('Reason is required when rejecting a bill');
    }

    return this.reviewSensitiveBill(adminUser.id, id, {
      approve: dto.status === 'VERIFIED',
      rejectReason: dto.status === 'REJECTED' ? dto.reason : undefined,
    });

    /*
    const updatedBill = await this.prisma.$transaction(async (tx) => {
      if (dto.status === 'REJECTED') {
        const rejected = await tx.bill.update({
          where: { id },
          data: {
            status: 'REJECTED',
            rejectedById: adminUser.id,
            rejectReason: dto.reason,
          },
          include: { user: true, store: true, booking: true },
        });
        return rejected;
      }

      if (dto.status === 'VERIFIED') {
        const verified = await tx.bill.update({
          where: { id },
          data: {
            status: 'VERIFIED',
            verifiedById: adminUser.id,
          },
          include: { user: true, store: true, booking: true },
        });

        // Earn points for user (1 point per 100,000 VND of subtotal)
        if (verified.userId && verified.subtotalVnd > 0) {
          const pointsEarned = Math.floor(verified.subtotalVnd / 100000);
          if (pointsEarned > 0) {
            await tx.pointLedger.create({
              data: {
                userId: verified.userId,
                billId: verified.id,
                // Assuming points are tracked somehow.
                // The schema PointLedger has:
                // id, userId, bookingId, billId, reversedLedgerId.
                points: pointsEarned,
                type: 'EARN',
                description: 'Duyệt bill',
              },
            });
          }
        }
        return verified;
      }
    });

    // Send Telegram Notification
    try {
      if (this.adminNotificationService) {
        await this.adminNotificationService.notifyBillReviewed(
          // @ts-ignore - ignoring exact type match for NotificationLog
          updatedBill,
          {
            approve: dto.status === 'VERIFIED',
            reviewedById: adminUser.id,
          },
        );
      }
    } catch (e) {
      console.error('Failed to send telegram notification for bill review', e);
    }

    return updatedBill;
    */
  }

  async updateAdminBookingStatus(
    id: string,
    status: import('@prisma/client').BookingStatus,
  ) {
    const booking = await this.prisma.booking.update({
      where: { id },
      data: { status },
      include: {
        store: true,
        cast: true,
        user: true,
      },
    });

    if (booking.user?.id) {
      this.socketGateway?.notifyBookingStatusUpdate(booking.user.id, booking);
    }

    return booking;
  }

  async listAdminBills(
    query: import('./dto/admin-bill.dto').AdminBillQueryDto,
  ) {
    const { page = 1, limit = 10, status, storeId, search, city } = query;
    const skip = (page - 1) * limit;

    let prismaStatus: import('@prisma/client').BillStatus | undefined;
    if (status === 'pending') prismaStatus = 'SUBMITTED';
    else if (status === 'approved') prismaStatus = 'VERIFIED';
    else if (status === 'rejected') prismaStatus = 'REJECTED';

    const where: import('@prisma/client').Prisma.BillWhereInput = {
      ...(prismaStatus && { status: prismaStatus }),
      ...(storeId && { storeId }),
      ...(city && { store: { city } }),
      ...(search && {
        OR: [
          { billNumber: { contains: search, mode: 'insensitive' } },
          { store: { name: { contains: search, mode: 'insensitive' } } },
          { user: { displayName: { contains: search, mode: 'insensitive' } } },
          { guest: { displayName: { contains: search, mode: 'insensitive' } } },
        ],
      }),
    };

    const orderBy = { createdAt: 'desc' } as any;

    const totalPendingAmountRes = await this.prisma.bill
      .aggregate({
        _sum: { totalVnd: true } as any,
        where: { ...where, status: 'SUBMITTED' },
      })
      .catch(() => ({ _sum: { totalVnd: 0 } }));
    const totalAmountPending =
      (totalPendingAmountRes._sum as any)?.totalVnd || 0;

    const [items, total, pendingCount, approvedCount, rejectedCount] =
      await Promise.all([
        this.prisma.bill.findMany({
          where,
          skip,
          take: limit,
          orderBy,
          include: {
            store: true,
            user: true,
            guest: true,
            booking: { include: { cast: true } },
            media: true,
          },
        }),
        this.prisma.bill.count({ where }),
        this.prisma.bill.count({ where: { ...where, status: 'SUBMITTED' } }),
        this.prisma.bill.count({ where: { ...where, status: 'VERIFIED' } }),
        this.prisma.bill.count({ where: { ...where, status: 'REJECTED' } }),
      ]);

    const mappedItems = items.map((bill) => {
      let guestType = 'Khách vãng lai';
      let sender =
        bill.user?.displayName || bill.guest?.displayName || 'Unknown';
      if (bill.user) guestType = bill.user.tier || 'Member';
      if (bill.booking?.cast) guestType = 'Cast';

      return {
        id: bill.id,
        billNumber: bill.billNumber,
        store: bill.store?.name || 'Unknown Store',
        location: bill.store?.slug || '',
        amount: bill.totalVnd || 0,
        date: bill.createdAt.toISOString(),
        sender,
        hasImage: (bill as any).media && (bill as any).media.length > 0,
        images: (bill as any).media
          ? (bill as any).media.map((m: any) => m.url)
          : [],
        status: bill.status,
        guestType,
        discount: bill.discountVnd || 0,
        discountPercent:
          bill.totalVnd && bill.discountVnd
            ? Math.round((bill.discountVnd / bill.totalVnd) * 100)
            : 0,
        commissionPercent: bill.commissionAmountVnd
          ? Math.round((bill.commissionAmountVnd / (bill.totalVnd || 1)) * 100)
          : 0,
        adminCommission: bill.commissionAmountVnd || 0,
        points: bill.pointsEarned ? `+${bill.pointsEarned} điểm` : '+0 điểm',
        rejectReason: bill.rejectReason || '',
      };
    });

    return {
      data: mappedItems,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
      stats: {
        pendingCount,
        approvedCount,
        rejectedCount,
        totalAmountPending,
      },
    };
  }

  async getAdminLayoutBadges() {
    const pendingBills = await this.prisma.bill
      .count({ where: { status: 'SUBMITTED' as any } })
      .catch(() => 0);
    const pendingCasts = await this.prisma.cast
      .count({ where: { status: 'PENDING' as any } })
      .catch(() => 0);
    const pendingPartners = await this.prisma.user
      .count({ where: { role: 'PARTNER' as any, status: 'PENDING' as any } })
      .catch(() => 0);

    return {
      pendingBills,
      pendingCasts,
      pendingPartners,
    };
  }

  async getAdminDashboardExport(timeframe?: string) {
    const ExcelJS = require('exceljs');
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Bao_Cao');

    sheet.columns = [
      { header: 'Mã Booking', key: 'id', width: 20 },
      { header: 'Số Khách', key: 'partySize', width: 15 },
      { header: 'Trạng Thái', key: 'status', width: 20 },
      { header: 'Thời Gian', key: 'time', width: 25 },
    ];

    const recentBookings = await this.prisma.booking
      .findMany({ take: 100, orderBy: { scheduledAt: 'desc' } })
      .catch(() => []);
    for (const b of recentBookings) {
      sheet.addRow({
        id: b.id.substring(0, 8),
        partySize: b.partySize || 1,
        status: b.status,
        time: b.scheduledAt,
      });
    }

    const buffer = await workbook.xlsx.writeBuffer();
    return buffer;
  }

  async getAdminDashboardStats(timeframe?: string) {
    let startDate = new Date();
    startDate.setHours(0, 0, 0, 0);

    let endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 1);

    if (timeframe === 'week') {
      startDate.setDate(startDate.getDate() - 7);
      endDate = new Date(); // Or start of next day for consistent inclusive-exclusive interval
    } else if (timeframe === 'month') {
      startDate.setDate(1);
      endDate = new Date(startDate);
      endDate.setMonth(endDate.getMonth() + 1);
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const activeStores = await this.prisma.store.count({
      where: { status: 'ACTIVE' as any, deletedAt: null },
    });
    const activeStoresHn = await this.prisma.store
      .count({
        where: {
          city: { in: ['Hanoi', 'Hà Nội', 'HN'] },
          status: 'ACTIVE' as any,
          deletedAt: null,
        },
      })
      .catch(() => 0);
    const activeStoresHcm = await this.prisma.store
      .count({
        where: {
          city: { in: ['Ho Chi Minh City', 'Hồ Chí Minh', 'HCM'] },
          status: 'ACTIVE' as any,
          deletedAt: null,
        },
      })
      .catch(() => 0);
    const totalContents = await this.prisma.content.count();
    const totalCasts = await this.prisma.cast
      .count({ where: { deletedAt: null } })
      .catch(() => 0);

    // Using any to bypass strict type checking for statuses we aren't 100% sure about
    const pendingBills = await this.prisma.bill
      .count({ where: { status: 'SUBMITTED' as any } })
      .catch(() => 0);

    const pendingBillsResult = await this.prisma.bill
      .aggregate({
        _sum: { totalVnd: true } as any,
        where: { status: 'SUBMITTED' as any },
      })
      .catch(() => ({ _sum: { totalVnd: 0 } }));
    const pendingBillsAmount = (pendingBillsResult._sum as any)?.totalVnd || 0;

    const pendingCasts = await this.prisma.cast
      .count({ where: { status: 'PENDING_REVIEW' as any, deletedAt: null } })
      .catch(() => 0);
    const pendingPartners = await this.prisma.partnerRequest
      .count({ where: { status: 'PENDING_REVIEW' as any } })
      .catch(() => 0);

    const todaysBookings = await this.prisma.booking.count({
      where: { scheduledAt: { gte: startDate, lt: endDate } },
    });
    const todaysBookingsCompleted = await this.prisma.booking.count({
      where: {
        scheduledAt: { gte: startDate, lt: endDate },
        status: 'COMPLETED' as any,
      },
    });
    const todaysBookingsNew = await this.prisma.booking.count({
      where: {
        scheduledAt: { gte: startDate, lt: endDate },
        status: 'REQUESTED' as any,
      },
    });

    const monthlyRevenueResult = await this.prisma.bill
      .aggregate({
        _sum: { totalVnd: true } as any,
        where: {
          status: { in: ['VERIFIED', 'PAID'] } as any,
          usedAt: { gte: startDate, lt: endDate },
        },
      })
      .catch(() => ({ _sum: { totalVnd: 0 } }));
    const monthlyRevenue = (monthlyRevenueResult._sum as any)?.totalVnd || 0;

    const commissionResult = await this.prisma.bill
      .aggregate({
        _sum: { commissionAmountVnd: true } as any,
        where: {
          status: { in: ['VERIFIED', 'PAID'] } as any,
          usedAt: { gte: startDate, lt: endDate },
        },
      })
      .catch(() => ({ _sum: { commissionAmountVnd: 0 } }));
    const commissionAmount =
      (commissionResult._sum as any)?.commissionAmountVnd || 0;

    const revenue7Days: any[] = [];
    const daysOfWeek = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      d.setHours(0, 0, 0, 0);
      const nextD = new Date(d);
      nextD.setDate(nextD.getDate() + 1);

      const rev = await this.prisma.bill
        .aggregate({
          _sum: { totalVnd: true } as any,
          where: {
            status: { in: ['VERIFIED', 'PAID'] } as any,
            usedAt: { gte: d, lt: nextD },
          },
        })
        .catch(() => ({ _sum: { totalVnd: 0 } }));

      revenue7Days.push({
        date: daysOfWeek[d.getDay()], // format T2, T3...
        revenue: (rev._sum as any)?.totalVnd || 0,
      });
    }

    const recentBookings = await this.prisma.booking
      .findMany({
        take: 5,
        orderBy: { scheduledAt: 'desc' },
        include: { user: true, guest: true, store: true, cast: true },
      })
      .catch(() => []);

    const recentBookingsMapped = recentBookings.map((bk) => ({
      id: bk.id,
      customerName:
        bk.user?.displayName || bk.guest?.displayName || 'Khách Vãng Lai',
      store: bk.store,
      cast: bk.cast,
      partySize: bk.partySize || 1,
      status: bk.status,
      scheduledAt: bk.scheduledAt,
    }));

    const rawTelegramLogs = await this.prisma.notificationLog.findMany({
      where: {
        channel: 'TELEGRAM' as any,
        templateKey: { in: Object.values(ADMIN_TELEGRAM_TEMPLATES) },
      },
      take: 4,
      orderBy: { createdAt: 'desc' },
      include: {
        booking: {
          select: {
            id: true,
            partySize: true,
            store: { select: { name: true } },
          },
        },
        bill: {
          select: {
            id: true,
            totalVnd: true,
            store: { select: { name: true } },
          },
        },
        partnerRequests: {
          select: { businessName: true, storeCity: true },
          take: 1,
        },
      },
    });

    const telegramLogs = rawTelegramLogs.map((log) => ({
      id: log.id,
      templateKey: log.templateKey,
      recipient: log.recipient,
      status: log.status,
      createdAt: log.createdAt,
      payload: log.payload,
      booking: log.booking,
      bill: log.bill,
      partnerRequest: log.partnerRequests?.[0] || null,
    }));

    return {
      activeStores,
      activeStoresHn,
      activeStoresHcm,
      pendingBills,
      pendingBillsAmount,
      pendingCasts,
      pendingPartners,
      todaysBookings,
      todaysBookingsCompleted,
      todaysBookingsNew,
      totalCasts,
      totalContents,
      monthlyRevenue,
      commissionAmount,
      revenue7Days,
      recentBookings: recentBookingsMapped,
      telegramLogs,
    };
  }

  async listAdminStores(
    query: import('./dto/admin-store.dto').AdminStoreQueryDto,
  ) {
    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.max(1, Number(query.limit) || 10);
    const skip = (page - 1) * limit;
    const { type, search } = query;

    let prismaCategory: import('@prisma/client').StoreCategory | undefined;
    if (type && type !== 'all') {
      const typeMap: Record<string, import('@prisma/client').StoreCategory> = {
        club: 'CLUB',
        lounge: 'LOUNGE',
        karaoke: 'KARAOKE',
        bar: 'BAR',
        'girls-bar': 'GIRLS_BAR',
        massage: 'MASSAGE_SPA',
      };
      prismaCategory = typeMap[type];
    }

    const where: import('@prisma/client').Prisma.StoreWhereInput = {
      ...(prismaCategory && { category: prismaCategory }),
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { address: { contains: search, mode: 'insensitive' } },
        ],
      }),
    };

    const [items, total] = await Promise.all([
      this.prisma.store.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          _count: { select: { casts: true } },
          media: true,
        },
      }),
      this.prisma.store.count({ where }),
    ]);

    const mappedItems = items.map((store) => {
      let typeLabel = store.category as string;
      if (store.category === 'GIRLS_BAR') typeLabel = 'Girls bar';
      else if (store.category === 'MASSAGE_SPA') typeLabel = 'Massage';
      else typeLabel = typeLabel.charAt(0) + typeLabel.slice(1).toLowerCase();

      return {
        ...store,
        id: store.id,
        initials: store.name.substring(0, 2).toUpperCase(),
        name: store.name,
        address: store.address || '',
        type: typeLabel,
        area: store.city === 'Ho Chi Minh City' ? 'HCM' : 'HN',
        commission: '15%',
        casts: store._count.casts,
        status: store.status,
      };
    });

    return {
      data: mappedItems,
      total,
      page,
      limit,
    };
  }

  async checkAdminStoreSlug(slug: string) {
    const existing = await this.prisma.store.findUnique({ where: { slug } });
    return { available: !existing };
  }

  // ==========================================
  // ADMIN CASTS
  // ==========================================

  async checkAdminCastSlug(slug: string) {
    const existing = await this.prisma.cast.findUnique({ where: { slug } });
    return { available: !existing };
  }

  async listAdminCasts(
    query: import('./dto/admin-store.dto').AdminStoreQueryDto,
  ) {
    const page = Math.max(1, query.page || 1);
    const limit = Math.max(1, Math.min(100, query.limit || 50));
    const skip = (page - 1) * limit;

    const where: import('@prisma/client').Prisma.CastWhereInput = {
      deletedAt: null,
    };

    if (query.search) {
      const s = this.cleanText(query.search);
      where.OR = [
        { stageName: this.containsInsensitive(s) },
        { tags: { has: s } },
        { store: { name: this.containsInsensitive(s) } },
      ];
    }

    const [total, items] = await Promise.all([
      this.prisma.cast.count({ where }),
      this.prisma.cast.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          store: { select: { id: true, name: true } },
          media: { select: { id: true, url: true } },
        },
      }),
    ]);

    return {
      data: items,
      total,
      page,
      limit,
    };
  }

  async createAdminCast(
    dto: import('./dto/admin-cast.dto').CreateAdminCastDto,
  ) {
    let slug = this.generateSlug(dto.stageName);
    let counter = 1;
    while (!(await this.checkAdminCastSlug(slug)).available) {
      slug = `${this.generateSlug(dto.stageName)}-${counter}`;
      counter++;
    }

    const newCast = await this.prisma.cast.create({
      data: {
        stageName: dto.stageName,
        slug,
        storeId: dto.storeId,
        publicHeadline: dto.publicHeadline,
        bio: dto.bio,
        birthMonth: dto.birthMonth,
        zodiacSign: dto.zodiacSign,
        heightCm: dto.heightCm,
        measurements: dto.measurements,
        languages: dto.languages || [],
        hobbies: dto.hobbies || [],
        tags: dto.tags || [],
        youtubeLinks: dto.youtubeLinks || [],
        isPublic: dto.isPublic !== undefined ? dto.isPublic : true,
        status: dto.status || 'DRAFT',
        ...(dto.mediaIds && dto.mediaIds.length > 0
          ? {
              media: {
                connect: dto.mediaIds.map((id) => ({ id })),
              },
            }
          : {}),
      },
    });

    return newCast;
  }

  async updateAdminCast(
    id: string,
    dto: import('./dto/admin-cast.dto').UpdateAdminCastDto,
  ) {
    await this.prisma.cast.findUniqueOrThrow({ where: { id } });

    const updated = await this.prisma.cast.update({
      where: { id },
      data: {
        ...(dto.stageName && { stageName: dto.stageName }),
        ...(dto.storeId && { storeId: dto.storeId }),
        ...(dto.publicHeadline !== undefined && {
          publicHeadline: dto.publicHeadline,
        }),
        ...(dto.bio !== undefined && { bio: dto.bio }),
        ...(dto.birthMonth !== undefined && { birthMonth: dto.birthMonth }),
        ...(dto.zodiacSign !== undefined && { zodiacSign: dto.zodiacSign }),
        ...(dto.heightCm !== undefined && { heightCm: dto.heightCm }),
        ...(dto.measurements !== undefined && {
          measurements: dto.measurements,
        }),
        ...(dto.languages && { languages: dto.languages }),
        ...(dto.hobbies && { hobbies: dto.hobbies }),
        ...(dto.tags && { tags: dto.tags }),
        ...(dto.youtubeLinks && { youtubeLinks: dto.youtubeLinks }),
        ...(dto.isPublic !== undefined && { isPublic: dto.isPublic }),
        ...(dto.status && { status: dto.status }),
        ...(dto.mediaIds
          ? {
              media: {
                set: dto.mediaIds.map((id) => ({ id })), // Replace existing relations
              },
            }
          : {}),
      },
    });

    return updated;
  }
  private generateSlug(name: string): string {
    return name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/đ/g, 'd')
      .replace(/Đ/g, 'D')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }

  private async inferAreaFromAddress(
    address: string,
    city: string,
  ): Promise<string | undefined> {
    const cityNames =
      city === 'Ho Chi Minh City'
        ? ['Ho Chi Minh City', 'TP.HCM', 'Hồ Chí Minh', 'HCM']
        : city === 'Hanoi'
          ? ['Hanoi', 'Hà Nội', 'HN']
          : [city];

    // A simple inference: look for matching district names in the address
    const areas = await this.prisma.area.findMany({
      where: { city: { in: cityNames }, status: 'ACTIVE' },
    });

    // Find an area where its district name is mentioned in the address
    // e.g. "Tây Hồ", "Hoàn Kiếm", "Quận 1"
    const lowerAddr = address.toLowerCase();
    for (const area of areas) {
      if (area.district && lowerAddr.includes(area.district.toLowerCase())) {
        return area.id;
      }
    }

    // Fallback: just return the first active area in that city
    if (areas.length > 0) return areas[0].id;
    return undefined;
  }

  async createAdminStore(
    dto: import('./dto/admin-store.dto').CreateAdminStoreDto,
  ) {
    let slug = this.generateSlug(dto.name);
    let counter = 1;
    while (!(await this.checkAdminStoreSlug(slug)).available) {
      slug = `${this.generateSlug(dto.name)}-${counter++}`;
    }

    let areaId: string | undefined;
    areaId = await this.inferAreaFromAddress(dto.address || '', dto.city);

    const newStore = await this.prisma.store.create({
      data: {
        name: dto.name,
        slug,
        category: dto.category,
        city: dto.city,
        address: dto.address,
        mapUrl: dto.mapUrl,
        phone: dto.phone,
        description: dto.description,
        tags: dto.tags || [],
        openingHours: dto.openingHours as any,
        pricingInfo: dto.pricingInfo as any,
        status: dto.status || 'ACTIVE',
        areaId,
        ...(dto.mediaIds && dto.mediaIds.length > 0
          ? {
              media: {
                connect: dto.mediaIds.map((id) => ({ id })),
              },
            }
          : {}),
      },
    });

    return newStore;
  }

  async updateAdminStore(
    id: string,
    dto: import('./dto/admin-store.dto').UpdateAdminStoreDto,
  ) {
    const existing = await this.prisma.store.findUniqueOrThrow({
      where: { id },
    });
    let areaId: string | undefined;
    if (dto.address !== undefined || dto.city) {
      areaId = await this.inferAreaFromAddress(
        dto.address || existing.address || '',
        dto.city || existing.city,
      );
    }

    const updated = await this.prisma.store.update({
      where: { id },
      data: {
        ...(dto.name && { name: dto.name }),
        ...(dto.category && { category: dto.category }),
        ...(dto.city && { city: dto.city }),
        ...(dto.address && { address: dto.address }),
        ...(dto.mapUrl !== undefined && { mapUrl: dto.mapUrl }),
        ...(dto.phone !== undefined && { phone: dto.phone }),
        ...(dto.description !== undefined && { description: dto.description }),
        ...(dto.tags !== undefined && { tags: dto.tags }),
        ...(dto.openingHours !== undefined && {
          openingHours: dto.openingHours as any,
        }),
        ...(dto.pricingInfo !== undefined && {
          pricingInfo: dto.pricingInfo as any,
        }),
        ...(dto.status && { status: dto.status }),
        ...(areaId && { areaId }),
        ...(dto.mediaIds
          ? {
              media: {
                set: dto.mediaIds.map((mid) => ({ id: mid })),
              },
            }
          : {}),
      },
    });

    return updated;
  }

  async listAdminCoupons(
    query: import('./dto/admin-coupon.dto').AdminCouponQueryDto,
  ) {
    const { page = 1, limit = 10, status, search } = query;
    const skip = (page - 1) * limit;

    let prismaStatus: import('@prisma/client').CouponIssueStatus | undefined;
    if (status === 'holding') prismaStatus = 'ISSUED';
    else if (status === 'used') prismaStatus = 'USED';
    else if (status === 'expired') prismaStatus = 'EXPIRED';

    const where: import('@prisma/client').Prisma.CouponIssueWhereInput = {
      ...(prismaStatus && { status: prismaStatus }),
      ...(search && {
        OR: [
          { code: { contains: search, mode: 'insensitive' } },
          { coupon: { name: { contains: search, mode: 'insensitive' } } },
        ],
      }),
    };

    const [items, total, pendingCount, usedCount, expiredCount] =
      await Promise.all([
        this.prisma.couponIssue.findMany({
          where,
          skip,
          take: limit,
          orderBy: { createdAt: 'desc' },
          include: {
            coupon: {
              include: { store: true },
            },
            user: true,
            guest: true,
          },
        }),
        this.prisma.couponIssue.count({ where }),
        this.prisma.couponIssue.count({ where: { status: 'ISSUED' } }),
        this.prisma.couponIssue.count({ where: { status: 'USED' } }),
        this.prisma.couponIssue.count({ where: { status: 'EXPIRED' } }),
      ]);

    const mappedItems = items.map((issue) => ({
      id: issue.id,
      code: issue.code,
      discount:
        issue.coupon.discountType === 'PERCENT'
          ? `-${issue.coupon.discountValue}%`
          : `-${issue.coupon.discountValue / 1000}k`,
      title: issue.coupon.name,
      store: issue.coupon.store.name,
      tier: 'Member', // Mocked as Coupon does not have tier
      expiry: issue.expiresAt ? new Date(issue.expiresAt).toISOString() : null,
      status:
        issue.status === 'ISSUED'
          ? 'Đang giữ chỗ'
          : issue.status === 'USED'
            ? 'Đã sử dụng'
            : issue.status === 'EXPIRED'
              ? 'Hết hạn'
              : issue.status,
    }));

    const totalStats = pendingCount + usedCount + expiredCount;
    const usageRate =
      totalStats > 0 ? Math.round((usedCount / totalStats) * 100) : 0;

    return {
      data: mappedItems,
      total,
      page,
      limit,
      stats: {
        holdingCount: pendingCount,
        usedCount,
        expiredCount,
        usageRate,
      },
    };
  }

  async listAdminBookings(
    query: import('./dto/admin-booking.dto').AdminBookingQueryDto,
  ) {
    const {
      page = 1,
      limit = 10,
      status,
      search,
      timeframe,
      storeId,
      source,
      city,
      sortBy = 'newest',
    } = query;
    const skip = (page - 1) * limit;

    let prismaStatus: import('@prisma/client').BookingStatus | undefined;
    if (status === 'new') prismaStatus = 'REQUESTED';
    else if (status === 'completed') prismaStatus = 'COMPLETED';
    else if (status === 'cancelled') prismaStatus = 'CANCELLED';

    let dateFilter = {};
    if (timeframe) {
      const now = new Date();
      let startDate = new Date();
      if (timeframe === 'today') {
        startDate.setHours(0, 0, 0, 0);
      } else if (timeframe === 'week') {
        startDate.setDate(now.getDate() - 7);
      } else if (timeframe === 'month') {
        startDate.setMonth(now.getMonth() - 1);
      }
      dateFilter = { scheduledAt: { gte: startDate } };
    }

    const where: import('@prisma/client').Prisma.BookingWhereInput = {
      ...(prismaStatus && { status: prismaStatus }),
      ...(storeId && { storeId }),
      ...(city && { store: { city } }),
      // TODO: Filter by source when the schema supports it. Currently hardcoded.
      ...dateFilter,
      ...(search && {
        OR: [
          { user: { displayName: { contains: search, mode: 'insensitive' } } },
          { guest: { displayName: { contains: search, mode: 'insensitive' } } },
          { user: { phone: { contains: search, mode: 'insensitive' } } },
          { guest: { phone: { contains: search, mode: 'insensitive' } } },
        ],
      }),
    };

    const orderBy = {
      scheduledAt: sortBy === 'oldest' ? 'asc' : 'desc',
    } as any;

    const [items, total, newCount, completedCount, cancelledCount] =
      await Promise.all([
        this.prisma.booking.findMany({
          where,
          skip,
          take: limit,
          orderBy,
          include: { store: true, cast: true, user: true, guest: true },
        }),
        this.prisma.booking.count({ where }),
        this.prisma.booking.count({ where: { ...where, status: 'REQUESTED' } }),
        this.prisma.booking.count({ where: { ...where, status: 'COMPLETED' } }),
        this.prisma.booking.count({ where: { ...where, status: 'CANCELLED' } }),
      ]);

    const data = items.map((bk) => ({
      id: bk.id,
      customerName:
        bk.user?.displayName || bk.guest?.displayName || 'Khách Vãng Lai',
      customerPhone: bk.user?.phone || bk.guest?.phone || '',
      customerEmail: bk.user?.email || bk.guest?.email || '',
      store: bk.store.name,
      cast: bk.cast?.stageName ? 'Cast: ' + bk.cast.stageName : 'Không cast',
      partySize: bk.partySize,
      scheduledAt: bk.scheduledAt,
      source: 'Telegram', // Hardcoded as requested
      status: bk.status,
      note: bk.note,
    }));

    return {
      data,
      meta: {
        total,
        page,
        limit,
        new: newCount,
        completed: completedCount,
        cancelled: cancelledCount,
        all: newCount + completedCount + cancelledCount,
      },
    };
  }

  async adminListStoreVideos(query: AdminStoreVideoQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 50;
    const skip = (page - 1) * limit;

    const where: Prisma.MediaWhereInput = {
      type: 'VIDEO',
      purpose: 'STORE_VIDEO',
      storeId: { not: null },
    };

    if (query.cityCode && query.cityCode !== 'all') {
      where.store = {
        OR: [
          {
            city:
              query.cityCode === 'hcm'
                ? 'Ho Chi Minh City'
                : query.cityCode === 'hn'
                  ? 'Hanoi'
                  : query.cityCode,
          },
          { area: { is: { ...this.buildMvpAreaCodeWhere(query.cityCode) } } },
        ],
      };
    }

    if (query.search) {
      where.OR = [
        { originalName: { contains: query.search, mode: 'insensitive' } },
        { store: { name: { contains: query.search, mode: 'insensitive' } } },
      ];
    }

    const [items, total] = await Promise.all([
      this.prisma.media.findMany({
        where,
        include: { store: { select: { name: true } } },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.media.count({ where }),
    ]);

    return {
      items: items.map((item) => ({
        id: item.id,
        url: item.url,
        title: item.originalName,
        storeName: item.store?.name,
        createdAt: item.createdAt,
      })),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async listPublicHotVideos(cityCode: string) {
    return this.getHotVideos(cityCode, { publicOnly: true });
  }

  async adminGetHotVideos(cityCode: string) {
    return this.getHotVideos(cityCode, { publicOnly: false });
  }

  private async getHotVideos(
    cityCode: string,
    options: { publicOnly: boolean },
  ) {
    const normalizedCityCode = this.normalizeHotVideoCityCode(cityCode);
    const slug = `hot-videos-${normalizedCityCode}`;
    const content = await this.prisma.content.findUnique({ where: { slug } });
    if (!content || !content.metadata) return [];

    const meta = this.asRecord(content.metadata);
    if (!meta || !Array.isArray(meta.videos)) return [];

    const mediaIds = meta.videos
      .map((video: unknown) => this.asRecord(video)?.mediaId)
      .filter((mediaId): mediaId is string => typeof mediaId === 'string');
    if (!mediaIds.length) return [];

    const medias = await this.prisma.media.findMany({
      where: {
        id: { in: mediaIds },
        ...(options.publicOnly
          ? {
              deletedAt: null,
              access: 'PUBLIC',
              status: 'READY',
              type: 'VIDEO',
            }
          : {}),
      },
      include: { store: { select: { name: true, slug: true } } },
    });

    const sortedMedias = mediaIds
      .map((id) => medias.find((media) => media.id === id))
      .filter((media) => !!media);

    return sortedMedias.map((item) => ({
      id: item!.id,
      url: item!.url,
      title: item!.originalName,
      storeName: item!.store?.name,
      storeSlug: item!.store?.slug,
      href: item!.store?.slug ? `/stores/${item!.store.slug}` : null,
      createdAt: item!.createdAt,
    }));
  }

  async adminUpdateHotVideos(
    cityCode: string,
    dto: UpdateHotVideosDto,
    adminId: string,
  ) {
    const normalizedCityCode = this.normalizeHotVideoCityCode(cityCode);
    const slug = `hot-videos-${normalizedCityCode}`;
    const videosMeta = dto.mediaIds.map((id, index) => ({
      mediaId: id,
      rank: index + 1,
    }));

    await this.prisma.content.upsert({
      where: { slug },
      create: {
        slug,
        title: `Hot Videos - ${normalizedCityCode.toUpperCase()}`,
        type: 'BANNER',
        status: 'PUBLISHED',
        authorId: adminId,
        metadata: this.toPrismaJson({ videos: videosMeta }),
      },
      update: {
        metadata: this.toPrismaJson({ videos: videosMeta }),
        updatedAt: new Date(),
      },
    });

    return { success: true };
  }

  private normalizeHotVideoCityCode(cityCode: string) {
    const normalized = this.normalizeToken(cityCode) || 'all';
    return ['all', 'hn', 'hcm'].includes(normalized) ? normalized : 'all';
  }
}
