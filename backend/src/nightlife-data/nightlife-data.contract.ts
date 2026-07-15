import { applyDecorators } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiUnauthorizedResponse,
  ApiUnprocessableEntityResponse,
} from '@nestjs/swagger';
import {
  CancelBookingDto,
  CancelGuestBookingDto,
} from './dto/cancel-booking.dto';
import { ClaimGuestCouponDto } from './dto/claim-guest-coupon.dto';
import { ScanCouponIssueDto } from './dto/coupon-issue.dto';
import { CreateBillDto } from './dto/create-bill.dto';
import { CreateBookingDto } from './dto/create-booking.dto';
import { RecordProfileViewDto } from './dto/profile-view.dto';
import {
  CreatePartnerRequestDto,
  ReviewPartnerRequestDto,
} from './dto/create-partner-request.dto';
import {
  MemberFavoriteCastDto,
  MemberFavoriteStoreDto,
  PublicCastFavoriteStateDto,
  PublicCastDetailResponseDto,
  PublicCastListResponseDto,
  PublicRankingResponseDto,
  PublicStoreFavoriteStateDto,
  PublicStoreDetailResponseDto,
  PublicStoreListResponseDto,
} from './dto/public-discovery-response.dto';
import { ReviewBillDto } from './dto/review-bill.dto';

const badRequestExample = {
  statusCode: 400,
  message: ['email must be an email'],
  error: 'Bad Request',
};

const publicDiscoveryBadRequestExample = {
  statusCode: 400,
  message: 'city must be a supported city code or all',
  error: 'Bad Request',
};

const unauthorizedExample = {
  statusCode: 401,
  message: 'Unauthorized',
};

const forbiddenExample = {
  statusCode: 403,
  message: 'Forbidden resource',
  error: 'Forbidden',
};

const notFoundExample = {
  statusCode: 404,
  message: 'Coupon not found',
  error: 'Not Found',
};

const unprocessableExample = {
  statusCode: 422,
  message: 'Coupon usage limit has been reached',
  error: 'Unprocessable Entity',
};

const couponExample = {
  id: 'coupon_01',
  code: 'WELCOME20',
  name: 'Welcome 20%',
  description: '20% off for first booking',
  discountType: 'PERCENT',
  discountValue: 20,
  maxDiscountVnd: 200000,
  minSpendVnd: 1000000,
  startsAt: '2026-06-01T00:00:00.000Z',
  endsAt: '2026-07-01T00:00:00.000Z',
  store: {
    id: 'store_01',
    name: 'Luna Lounge',
    slug: 'luna-lounge',
    category: 'LOUNGE',
    city: 'Ho Chi Minh City',
    district: 'District 1',
  },
};

const storeDetailCouponExample = {
  id: 'coupon_01',
  code: 'WELCOME20',
  name: 'Welcome 20%',
  description: '20% off for first booking',
  discountType: 'PERCENT',
  discountValue: 20,
  maxDiscountVnd: 200000,
  minSpendVnd: 1000000,
  startsAt: '2026-06-01T00:00:00.000Z',
  endsAt: '2026-07-01T00:00:00.000Z',
};

const areaExample = {
  id: 'area_01',
  code: 'hn-tayho',
  name: 'Tay Ho',
  city: 'Ha Noi',
  district: 'Tay Ho',
  ward: 'Quang An',
  cityCode: 'hn',
};

const neonStoreImage = '/media/demo/stores/neon-club.jpg';
const crimsonStoreImage = '/media/demo/stores/crimson-bar.jpg';
const yunaCastImage = '/media/demo/casts/yuna-neon.jpg';
const miyukiCastImage = '/media/demo/casts/miyuki-moonlight.jpg';

const storeExample = {
  id: 'store_01',
  name: 'Neon Club',
  slug: 'neon-club',
  category: 'CLUB',
  description: 'Club by West Lake with DJ nights and VIP tables.',
  address: '200 Nghi Tam, Tay Ho, Ha Noi',
  city: 'Ha Noi',
  cityCode: 'hn',
  district: 'Tay Ho',
  area: {
    id: 'area_01',
    code: 'hn-tayho',
    name: 'Tay Ho',
    city: 'Ha Noi',
    district: 'Tay Ho',
    cityCode: 'hn',
  },
  latitude: 21.063,
  longitude: 105.822,
  thumbnailUrl: neonStoreImage,
  distanceKm: 1.4,
};

const storeListExample = {
  data: [storeExample],
  meta: {
    total: 42,
    page: 1,
    limit: 24,
    offset: 0,
    hasMore: true,
    sort: 'nearest',
  },
};

const storeDetailExample = {
  ...storeExample,
  phone: '+84243456007',
  mapUrl: 'https://maps.google.com/?q=21.063,105.822',
  openingHours: {
    monday: { open: '19:00', close: '02:00' },
    friday: { open: '19:00', close: '04:00' },
  },
  holidaySchedule: {
    note: 'Holiday hours are confirmed by the store before each booking.',
    specialClosures: [],
  },
  gallery: [
    {
      id: 'media_01',
      type: 'IMAGE',
      url: neonStoreImage,
      purpose: 'store-hero',
      mimeType: 'image/jpeg',
      alt: 'Neon Club hero',
    },
  ],
  casts: [
    {
      id: 'cast_01',
      slug: 'yuna-neon',
      stageName: 'Yuna',
      publicAlias: 'Yuna',
      publicHeadline: 'Party host',
      thumbnailUrl: yunaCastImage,
      tags: ['party', 'vip'],
      languages: ['ja', 'vi'],
      hourlyRateVnd: 600000,
    },
  ],
  priceReference: {
    currency: 'VND',
    startingFromVnd: 600000,
    note: 'Reference price only; admin confirms final pricing by guest count and time slot.',
    items: [
      {
        label: 'Sushi omakase',
        note: 'Admin menu item shown on the public store menu.',
        group: 'Food',
        displayPrice: '$$',
        tier: 2,
        hot: true,
      },
    ],
  },
  activeCoupons: [storeDetailCouponExample],
  campaigns: [
    {
      id: 'coupon_01',
      title: 'Welcome 20%',
      description: '20% off for first booking',
      source: 'coupon',
      couponId: 'coupon_01',
    },
  ],
  relatedStores: [
    {
      id: 'store_02',
      slug: 'crimson-bar',
      name: 'Crimson Bar',
      category: 'BAR',
      city: 'Ha Noi',
      district: 'Hoan Kiem',
      area: null,
      thumbnailUrl: crimsonStoreImage,
    },
  ],
  seo: {
    title: 'Neon Club | NightLife VN',
    description: 'Neon Club tai Tay Ho, Ha Noi.',
    canonicalPath: '/stores/neon-club',
    ogImage: neonStoreImage,
  },
};

const castExample = {
  id: 'cast_01',
  slug: 'yuna-neon',
  stageName: 'Yuna',
  name: 'Yuna',
  publicAlias: 'Yuna',
  publicHeadline: 'Party host',
  tags: ['party', 'energetic'],
  languages: ['ja', 'vi', 'en'],
  hourlyRateVnd: 600000,
  thumbnailUrl: yunaCastImage,
  distanceKm: 1.4,
  store: {
    id: 'store_01',
    name: 'Neon Club',
    slug: 'neon-club',
    category: 'CLUB',
    city: 'Ha Noi',
    cityCode: 'hn',
    district: 'Tay Ho',
    area: {
      id: 'area_01',
      code: 'hn-tayho',
      name: 'Tay Ho',
      city: 'Ha Noi',
      district: 'Tay Ho',
      cityCode: 'hn',
    },
    latitude: 21.063,
    longitude: 105.822,
  },
};

const castDetailExample = {
  ...castExample,
  publicBio:
    'Yuna hosts public VIP bookings at Neon Club with Japanese, Vietnamese, and English support.',
  monthOfBirth: 9,
  zodiacSign: 'Xử Nữ',
  heightCm: null,
  measurements: null,
  interests: [],
  gallery: [
    {
      id: 'media_01',
      type: 'IMAGE',
      url: yunaCastImage,
      purpose: 'cast-gallery',
      mimeType: 'image/jpeg',
      alt: 'Yuna profile photo',
    },
  ],
  relatedCasts: [
    {
      id: 'cast_02',
      slug: 'miyuki-moonlight',
      stageName: 'Miyuki',
      name: 'Miyuki',
      publicAlias: 'Miyuki',
      publicHeadline: 'Cocktail host',
      tags: ['cocktail', 'calm'],
      languages: ['ja', 'vi'],
      hourlyRateVnd: 500000,
      thumbnailUrl: miyukiCastImage,
      relatedReason: 'same-area',
      store: castExample.store,
    },
  ],
  store: {
    ...castExample.store,
    phone: '+84243456007',
    mapUrl: 'https://maps.google.com/?q=21.063,105.822',
    googlePlaceId: null,
  },
  seo: {
    title: 'Yuna tại Neon Club | NightLife VN',
    description:
      'Yuna hosts public VIP bookings at Neon Club in Tay Ho, Ha Noi.',
    canonicalPath: '/casts/yuna-neon',
    ogImage: yunaCastImage,
  },
};

const castFavoriteStateExample = {
  castId: 'cast_01',
  castSlug: 'yuna-neon',
  favorited: true,
};

const storeFavoriteStateExample = {
  storeId: 'store_01',
  storeSlug: 'neon-club',
  favorited: true,
};

const memberFavoriteCastExample = {
  favoriteId: 'fav_01',
  favoritedAt: '2026-06-30T10:00:00.000Z',
  cast: castDetailExample.relatedCasts[0],
};

const memberFavoriteStoreExample = {
  favoriteId: 'fav_store_01',
  favoritedAt: '2026-06-30T10:00:00.000Z',
  store: storeExample,
};

const castListExample = {
  data: [castExample],
  meta: {
    total: 18,
    page: 1,
    limit: 24,
    offset: 0,
    hasMore: false,
    sort: 'newest',
  },
};

const rankingExample = {
  data: [
    {
      rank: 1,
      targetType: 'CAST',
      targetId: 'cast_01',
      name: 'Yuna',
      slug: 'yuna-neon',
      image: yunaCastImage,
      area: 'Tay Ho',
      city: 'Ha Noi',
      cityCode: 'hn',
      category: 'CLUB',
      sponsored: true,
      pinRank: 1,
      manualScore: 100,
      href: '/casts/yuna-neon',
    },
  ],
  meta: {
    targetType: 'CAST',
    city: 'all',
    category: null,
    limit: 5,
    total: 1,
  },
};

const guestClaimExample = {
  issue: {
    id: 'issue_01',
    code: 'GUEST-550e8400-e29b-41d4-a716-446655440000',
    status: 'ISSUED',
    statusLabel: 'Đang giữ chỗ',
    qrPayload:
      'https://nightlife.vn/partner/scan?scanToken=opaque-token.signature',
    qrImageDataUrl: 'data:image/png;base64,...',
    userType: 'GUEST',
    discountPercent: 5,
    discountRuleSnapshot: {
      type: 'PERCENT',
      value: 5,
      discountPercent: 5,
      userType: 'GUEST',
      tier: null,
      sourceType: 'PERCENT',
      sourceValue: 5,
    },
    expiresAt: '2026-06-27T10:00:00.000Z',
    createdAt: '2026-06-26T10:00:00.000Z',
    coupon: {
      id: 'coupon_01',
      code: 'GUEST5',
      name: 'Guest Discount 5%',
      discountType: 'PERCENT',
      discountValue: 5,
      maxDiscountVnd: 500000,
      minSpendVnd: null,
      store: { id: 'store_01', name: 'Luna Lounge', slug: 'luna-lounge' },
    },
  },
  guest: { id: 'guest_01' },
};

const memberClaimExample = {
  id: 'issue_02',
  code: 'MEMBER-550e8400-e29b-41d4-a716-446655440000',
  status: 'ISSUED',
  statusLabel: 'Đang giữ chỗ',
  qrPayload:
    'https://nightlife.vn/partner/scan?scanToken=opaque-token.signature',
  qrImageDataUrl: 'data:image/png;base64,...',
  userType: 'VIP',
  discountPercent: 10,
  discountRuleSnapshot: {
    type: 'PERCENT',
    value: 10,
    discountPercent: 10,
    userType: 'VIP',
    tier: 'VIP',
    sourceType: 'PERCENT',
    sourceValue: 8,
  },
  expiresAt: '2026-07-03T10:00:00.000Z',
  createdAt: '2026-06-26T10:00:00.000Z',
  coupon: {
    id: 'coupon_02',
    code: 'MEMBER8',
    name: 'Member Discount 8%',
    discountType: 'PERCENT',
    discountValue: 8,
    maxDiscountVnd: 800000,
    minSpendVnd: null,
    store: { id: 'store_01', name: 'Luna Lounge', slug: 'luna-lounge' },
  },
};

const partnerStoreExample = {
  id: 'store_01',
  name: 'Luna Lounge',
  slug: 'luna-lounge',
  category: 'LOUNGE',
  status: 'ACTIVE',
  city: 'Ho Chi Minh City',
  district: 'District 1',
  createdAt: '2026-06-01T00:00:00.000Z',
};

const partnerCouponExample = {
  id: 'coupon_01',
  storeId: 'store_01',
  code: 'WELCOME20',
  name: 'Welcome 20%',
  status: 'ACTIVE',
  usedCount: 12,
  usageLimit: 100,
  startsAt: '2026-06-01T00:00:00.000Z',
  endsAt: '2026-07-01T00:00:00.000Z',
  store: { id: 'store_01', name: 'Luna Lounge', slug: 'luna-lounge' },
};

const partnerLiteDashboardExample = {
  period: 'seven',
  from: '2026-07-01T00:00:00.000Z',
  to: '2026-07-07T23:59:59.999Z',
  bookingCount: 18,
  profileViewCount: 240,
  customerArrivalCount: 12,
  customerArrivalSource: 'QR_USED',
  qrUsedCount: 12,
  billApprovedCount: 8,
  storeCount: 2,
  stores: [
    {
      id: 'store_01',
      name: 'Luna Lounge',
      slug: 'luna-lounge',
      bookingCount: 10,
      profileViewCount: 140,
      customerArrivalCount: 7,
    },
  ],
  weeklyBookings: [
    { label: 'T2', date: '2026-07-01', count: 3 },
    { label: 'T3', date: '2026-07-02', count: 4 },
  ],
  privacy: {
    customerDetailVisible: false,
    note: 'Partner dashboard returns aggregate metrics only.',
  },
};

const bookingExample = {
  id: 'booking_01',
  storeId: 'store_01',
  status: 'CONFIRMED',
  scheduledAt: '2026-06-30T13:00:00.000Z',
  partySize: 4,
  subtotalVnd: 2000000,
  discountVnd: 200000,
  totalVnd: 1800000,
  store: { id: 'store_01', name: 'Luna Lounge', slug: 'luna-lounge' },
  coupon: { id: 'coupon_01', code: 'WELCOME20', name: 'Welcome 20%' },
  user: { id: 'user_01', displayName: 'Minh Nguyen', tier: 'VIP' },
  guest: { id: 'guest_01', displayName: 'Guest Name' },
};

const createBookingExample = {
  ...bookingExample,
  status: 'REQUESTED',
  scheduledAt: '2026-06-30T14:00:00.000Z',
  subtotalVnd: 0,
  discountVnd: 0,
  totalVnd: 0,
  note: 'Can phong VIP, uu tien nhan vien noi tieng Nhat.',
  cast: {
    id: 'cast_01',
    slug: 'yuna-neon',
    stageName: 'Yuna',
    publicAlias: 'Yuna',
  },
};

const cancelledBookingExample = {
  ...createBookingExample,
  status: 'CANCELLED',
  cancelledAt: '2026-06-26T10:20:00.000Z',
};

const scannedCouponIssueExample = {
  id: 'issue_01',
  code: 'GUEST-550e8400-e29b-41d4-a716-446655440000',
  status: 'ISSUED',
  statusLabel: 'Đang giữ chỗ',
  qrPayload:
    'https://nightlife.vn/partner/scan?scanToken=opaque-token.signature',
  qrImageDataUrl: 'data:image/png;base64,...',
  userType: 'GUEST',
  customer: { type: 'GUEST', label: 'Khách vãng lai' },
  discountPercent: 5,
  expiresAt: '2026-06-27T10:00:00.000Z',
  usedAt: null,
  booking: {
    status: 'CONFIRMED',
    scheduledAt: '2026-06-30T13:00:00.000Z',
  },
  coupon: {
    id: 'coupon_01',
    code: 'GUEST5',
    name: 'Guest Discount 5%',
    store: { id: 'store_01', name: 'Luna Lounge', slug: 'luna-lounge' },
  },
};

const confirmedCheckInExample = {
  id: 'issue_01',
  code: 'GUEST-550e8400-e29b-41d4-a716-446655440000',
  status: 'USED',
  statusLabel: 'Đã sử dụng',
  qrPayload:
    'https://nightlife.vn/partner/scan?scanToken=opaque-token.signature',
  qrImageDataUrl: null,
  userType: 'GUEST',
  discountPercent: 5,
  expiresAt: '2026-06-27T10:00:00.000Z',
  usedAt: '2026-06-26T10:15:00.000Z',
  scannedById: 'partner_01',
  customer: { type: 'GUEST', label: 'Khách vãng lai' },
  coupon: {
    id: 'coupon_01',
    code: 'GUEST5',
    name: 'Guest Discount 5%',
    store: { id: 'store_01', name: 'Luna Lounge', slug: 'luna-lounge' },
  },
};

const billExample = {
  id: 'bill_01',
  storeId: 'store_01',
  billNumber: 'BILL-2026-0001',
  status: 'SUBMITTED',
  submitterType: 'MEMBER',
  subtotalVnd: 1800000,
  discountVnd: 0,
  totalVnd: 1800000,
  usedAt: '2026-06-30T14:00:00.000Z',
  submittedAt: '2026-07-01T10:00:00.000Z',
  reviewedAt: null,
  verifiedAt: null,
  rejectedAt: null,
  reviewedById: null,
  verifiedById: null,
  rejectedById: null,
  rejectReason: null,
  store: { id: 'store_01', name: 'Luna Lounge', slug: 'luna-lounge' },
  booking: {
    id: 'booking_01',
    status: 'CONFIRMED',
    scheduledAt: '2026-06-30T13:00:00.000Z',
  },
  coupon: { id: 'coupon_01', code: 'WELCOME20', name: 'Welcome 20%' },
};

const memberCouponIssueExample = {
  id: 'issue_01',
  code: 'MEMBER-2026-0001',
  status: 'ISSUED',
  statusLabel: 'Đang giữ chỗ',
  qrPayload:
    'https://nightlife.vn/partner/scan?scanToken=opaque-token.signature',
  qrImageDataUrl: 'data:image/png;base64,...',
  userType: 'VIP',
  discountPercent: 10,
  expiresAt: '2026-07-01T00:00:00.000Z',
  usedAt: null,
  coupon: {
    id: 'coupon_01',
    code: 'WELCOME20',
    name: 'Welcome 20%',
    store: { id: 'store_01', name: 'Luna Lounge', slug: 'luna-lounge' },
  },
};

const memberPointSummaryExample = {
  availablePoints: 156,
  earnedPoints: 186,
  spentPoints: 30,
  expiredPoints: 40,
  expiringSoonPoints: 6,
  nextTierName: 'Premium+',
  nextTierThreshold: 250,
  pointsToNextTier: 94,
  progressPercent: 62,
  asOf: '2026-07-03T10:00:00.000Z',
  recentLedgers: [
    {
      id: 'ledger_01',
      type: 'EARN',
      billId: 'bill_01',
      bookingId: 'booking_01',
      amountVnd: 18000000,
      points: 180,
      description: 'Loyalty points from approved bill bill_01',
      expiresAt: '2027-07-03T10:00:00.000Z',
      postedAt: '2026-07-03T10:00:00.000Z',
      createdAt: '2026-07-03T10:00:00.000Z',
    },
  ],
};

const adminCouponIssueExample = {
  ...memberCouponIssueExample,
  qrPayloadHash: '5f70bf18a086007016b3f5200f5ec3c9c1ed4f0d...',
  campaignSnapshot: {
    id: 'coupon_01',
    code: 'WELCOME20',
    name: 'Welcome 20%',
    storeId: 'store_01',
    store: { id: 'store_01', name: 'Luna Lounge', slug: 'luna-lounge' },
  },
  auditLogs: [
    {
      id: 'audit_01',
      action: 'COUPON_ISSUE_SCANNED',
      actorId: 'partner_01',
      targetId: 'issue_01',
      metadata: { source: 'signed_qr' },
      createdAt: '2026-06-26T10:12:00.000Z',
    },
  ],
  user: { id: 'user_01', displayName: 'Minh Nguyen', tier: 'VIP' },
  guest: null,
  scannedBy: { id: 'partner_01', displayName: 'Partner Staff' },
  createdAt: '2026-06-26T10:00:00.000Z',
};

const sensitiveBillExample = {
  ...billExample,
  subtotalVnd: 1800000,
  discountVnd: 180000,
  serviceChargeVnd: 100000,
  taxVnd: 180000,
  grossRevenueVnd: 1800000,
  netRevenueVnd: 1620000,
  payableVnd: 1900000,
  totalVnd: 1620000,
  paidVnd: 1900000,
  commissionAmountVnd: 0,
  pointsEarned: 18,
  discountRuleSnapshot: {
    version: 'ba-v3.2',
    basis: 'bill_gross_before_discount',
    grossRevenueVnd: 1800000,
    discountVnd: 180000,
    netRevenueVnd: 1620000,
    payableVnd: 1900000,
    serviceChargeVnd: 100000,
    taxVnd: 180000,
  },
  commissionRuleSnapshot: {
    version: 'ba-v3.2',
    basis: 'bill_gross_before_discount',
    grossRevenueVnd: 1800000,
    discountVnd: 180000,
    netRevenueVnd: 1620000,
    payableVnd: 1900000,
    serviceChargeVnd: 100000,
    taxVnd: 180000,
    grossCommissionVnd: 180000,
    commissionVnd: 0,
    commissionAmountVnd: 0,
    flags: [],
  },
  pointRuleSnapshot: {
    version: 'v2.2',
    basis: 'bill_subtotal_vnd',
    amountVnd: 1800000,
    vndPerPoint: 100000,
    pointsPerMillionVnd: 10,
    expiresAfterDays: 365,
  },
  user: {
    id: 'user_01',
    email: 'member@example.com',
    displayName: 'Minh Nguyen',
    phone: '+84901234567',
    tier: 'VIP',
  },
  guest: null,
  media: [
    {
      id: 'media_01',
      storageKey: 'bills/bill_01.jpg',
      originalName: 'receipt.jpg',
      mimeType: 'image/jpeg',
      access: 'PROTECTED',
      url: null,
    },
  ],
};

const reviewedBillExample = {
  id: 'bill_01',
  status: 'VERIFIED',
  verifiedAt: '2026-06-26T10:15:00.000Z',
  rejectedAt: null,
  rejectReason: null,
  reviewedAt: '2026-06-26T10:15:00.000Z',
  reviewedById: 'admin_01',
  verifiedById: 'admin_01',
  rejectedById: null,
};

const adminRevenueReportExample = {
  filters: {
    from: '2026-06-30T17:00:00.000Z',
    to: '2026-07-31T16:59:59.999Z',
    fromDate: '2026-07-01',
    toDate: '2026-07-31',
    timezone: 'Asia/Ho_Chi_Minh',
    dateField: 'usedAt',
    statusIn: ['VERIFIED', 'PAID'],
    flag: null,
    billStatusIncluded: ['VERIFIED', 'PAID'],
    partnerAccountId: null,
    areaId: null,
    castId: null,
    exportEnabled: false,
    exportFormats: [],
  },
  meta: {
    billStatusIncluded: ['VERIFIED', 'PAID'],
    timezone: 'Asia/Ho_Chi_Minh',
    generatedAt: '2026-07-03T10:00:00.000Z',
    exportEnabled: false,
    exportFormats: [],
    formula: {
      grossVnd: 'subtotalVnd',
      discountVnd: 'discountVnd',
      netVnd: 'subtotalVnd - discountVnd',
      payableVnd: 'netVnd + serviceChargeVnd + taxVnd',
      commissionVnd: 'commissionAmountVnd',
    },
  },
  totals: {
    billCount: 3,
    grossVnd: 6200000,
    discountVnd: 500000,
    netVnd: 5700000,
    payableVnd: 6040000,
    commissionVnd: 620000,
  },
  days: [
    {
      date: '2026-07-02',
      billCount: 2,
      grossVnd: 4200000,
      discountVnd: 300000,
      netVnd: 3900000,
      payableVnd: 4160000,
      commissionVnd: 420000,
      stores: [
        {
          store: { id: 'store_01', name: 'Neon Club', slug: 'neon-club' },
          billCount: 2,
          grossVnd: 4200000,
          discountVnd: 300000,
          netVnd: 3900000,
          payableVnd: 4160000,
          commissionVnd: 420000,
          coupons: [
            {
              coupon: {
                id: 'coupon_01',
                code: 'MEMBER8',
                name: 'Member 8',
              },
              billCount: 2,
              grossVnd: 4200000,
              discountVnd: 300000,
              netVnd: 3900000,
              payableVnd: 4160000,
              commissionVnd: 420000,
              bills: [
                {
                  id: 'bill_01',
                  billNumber: 'BILL-20260702-ABC12345',
                  status: 'VERIFIED',
                  usedAt: '2026-07-02T14:00:00.000Z',
                  billCount: 1,
                  grossVnd: 2000000,
                  discountVnd: 160000,
                  netVnd: 1840000,
                  commissionVnd: 240000,
                },
              ],
            },
          ],
        },
      ],
    },
  ],
};

const partnerRequestExample = {
  id: 'PARTNER-7F3A91BC',
  status: 'PENDING_REVIEW',
  submittedAt: '2026-06-26T10:20:00.000Z',
  draft: {
    storeId: 'store_draft_01',
    storeName: 'Neon Club Tay Ho',
    storeSlug: 'neon-club-tay-ho-partner-7f3a91bc',
    castCount: 2,
    mediaCount: 4,
    contentCount: 1,
  },
  message: 'Partner request submitted for admin review',
};

const adminPartnerRequestExample = {
  id: 'PARTNER-7F3A91BC',
  notificationId: 'notification_01',
  notificationStatus: 'SENT',
  submittedAt: '2026-06-26T10:20:00.000Z',
  status: 'PENDING_REVIEW',
  reviewReason: null,
  reviewedAt: null,
  publicState: 'HIDDEN',
  draftStoreId: 'store_draft_01',
  draftStoreName: 'Neon Club Tay Ho',
  draftStoreSlug: 'neon-club-tay-ho-partner-7f3a91bc',
  draftCastCount: 2,
  draftMediaCount: 4,
  draftContentCount: 1,
  partnerUserId: null,
  partnerAccountId: null,
  businessName: 'Neon Club',
  businessType: 'Club / Lounge',
  area: 'Ha Noi - Tay Ho',
  contactName: 'Nguyen Van A',
  contactPhone: '+84901234567',
  contactEmail: 'owner@example.com',
  note: 'We want to join the booking and coupon program.',
  storeDescription: 'Premium lounge with live DJ and private tables.',
  menuSummary: 'Bottle service and cocktail menu submitted by partner.',
};

const contentExample = {
  id: 'content_01',
  title: 'Hướng dẫn trọn vẹn một đêm ở Tây Hồ',
  slug: 'tay-ho-night-guide',
  type: 'BLOG',
  status: 'PUBLISHED',
  excerpt:
    'Lộ trình gợi ý cho khách muốn đi lounge, club và ăn khuya ở Tây Hồ.',
  body: null,
  metadata: {
    category: 'Cẩm nang khu vực',
    tags: ['Tây Hồ', 'Lounge'],
    image:
      'https://images.unsplash.com/photo-1572116469696-31de0f17cc34?auto=format&fit=crop&w=1200&q=78',
    imageAlt: 'Không gian lounge ban đêm với ánh đèn ấm',
    noindex: false,
  },
  noindex: false,
  publishedAt: '2026-06-21T00:00:00.000Z',
  createdAt: '2026-06-20T10:00:00.000Z',
  updatedAt: '2026-06-30T10:00:00.000Z',
};

export function PublicContentsContract() {
  return applyDecorators(
    ApiOperation({
      summary: 'Public content: list published blog/policy content',
      description:
        'Auth guard: none. Returns PUBLISHED Content records for blog and policy pages. Draft, archived, deleted, and future-published records are excluded.',
    }),
    ApiQuery({
      name: 'type',
      required: false,
      description: 'Content type: BLOG or POLICY.',
      example: 'BLOG',
    }),
    ApiQuery({ name: 'q', required: false, example: 'tay ho' }),
    ApiQuery({ name: 'limit', required: false, example: '50' }),
    ApiOkResponse({
      description: 'Published content list.',
      schema: { example: { data: [contentExample] } },
    }),
    ApiBadRequestResponse({
      description: 'Invalid content filter.',
      schema: { example: publicDiscoveryBadRequestExample },
    }),
  );
}

export function PublicContentDetailContract() {
  return applyDecorators(
    ApiOperation({
      summary: 'Public content: get published content by slug',
      description:
        'Auth guard: none. Returns one PUBLISHED Content record by slug for public blog/policy detail pages.',
    }),
    ApiParam({
      name: 'slug',
      description: 'Public content slug.',
      example: 'tay-ho-night-guide',
    }),
    ApiOkResponse({
      description: 'Published content detail.',
      schema: { example: contentExample },
    }),
    ApiNotFoundResponse({
      description: 'Content does not exist or is not published.',
      schema: { example: { ...notFoundExample, message: 'Content not found' } },
    }),
  );
}

export function AdminContentsContract() {
  return guardedListContract(
    'Admin content: list blog and policy records',
    'Auth guard: JwtAuthGuard + RolesGuard(ADMIN). Lists non-deleted Content records with type/status/search filters for CMS review.',
    contentExample,
  );
}

export function AdminPartnerRequestsContract() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({
      summary: 'Admin partner: list partner requests from CMS records',
      description:
        'Auth guard: JwtAuthGuard + RolesGuard(ADMIN). Lists durable PartnerRequest CMS records with optional status, keyword, and submitted date filters. Telegram is only a delivery channel; submitted store/cast/media/menu drafts remain hidden until the admin review endpoint approves them.',
    }),
    ApiQuery({
      name: 'status',
      required: false,
      enum: ['PENDING_REVIEW', 'APPROVED', 'REJECTED'],
    }),
    ApiQuery({ name: 'keyword', required: false, example: 'Neon Club' }),
    ApiQuery({
      name: 'submittedFrom',
      required: false,
      example: '2026-07-01T00:00:00.000Z',
    }),
    ApiQuery({
      name: 'submittedTo',
      required: false,
      example: '2026-07-03T23:59:59.999Z',
    }),
    ApiQuery({ name: 'page', required: false, example: 1 }),
    ApiQuery({ name: 'limit', required: false, example: 50 }),
    ApiOkResponse({
      description: 'Partner request list.',
      schema: { example: [adminPartnerRequestExample] },
    }),
    ApiUnauthorizedResponse({
      description: 'Missing or invalid access token.',
      schema: { example: unauthorizedExample },
    }),
    ApiForbiddenResponse({
      description: 'Admin role is required.',
      schema: { example: forbiddenExample },
    }),
  );
}

export function ReviewPartnerRequestContract() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({
      summary: 'Admin partner: approve or reject a partner request',
      description:
        'Auth guard: JwtAuthGuard + RolesGuard(ADMIN). Transactionally approves a pending partner request by publishing the submitted draft store/cast/media/menu and onboarding the partner account, or rejects it while keeping those records non-public. The request row is updated conditionally from PENDING_REVIEW to prevent double review, and a reason is required for the CMS audit trail.',
    }),
    ApiParam({ name: 'requestId', example: 'PARTNER-7F3A91BC' }),
    ApiBody({ type: ReviewPartnerRequestDto }),
    ApiOkResponse({
      description: 'Partner request reviewed.',
      schema: {
        example: {
          ...adminPartnerRequestExample,
          status: 'APPROVED',
          reviewReason: 'Thong tin hop le, duyet public.',
          reviewedAt: '2026-06-26T10:40:00.000Z',
          reviewedById: 'admin_01',
          publicState: 'PUBLIC',
        },
      },
    }),
    ApiBadRequestResponse({
      description: 'Invalid review body.',
      schema: { example: badRequestExample },
    }),
    ApiUnauthorizedResponse({
      description: 'Missing or invalid admin token.',
      schema: { example: unauthorizedExample },
    }),
    ApiForbiddenResponse({
      description: 'Authenticated user is not an admin.',
      schema: { example: forbiddenExample },
    }),
    ApiNotFoundResponse({
      description: 'Partner request not found.',
      schema: {
        example: { ...notFoundExample, message: 'Partner request not found' },
      },
    }),
    ApiUnprocessableEntityResponse({
      description: 'Partner request has already been reviewed.',
      schema: {
        example: {
          statusCode: 422,
          message: 'Partner request has already been reviewed',
          error: 'Unprocessable Entity',
        },
      },
    }),
  );
}

export function AdminContentMutationContract(
  action: 'create' | 'update' | 'delete',
) {
  const summaries = {
    create: 'Admin content: create blog or policy record',
    update: 'Admin content: update blog or policy record',
    delete: 'Admin content: soft delete blog or policy record',
  };

  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({
      summary: summaries[action],
      description:
        'Auth guard: JwtAuthGuard + RolesGuard(ADMIN). Mutates Content records used by public blog and legal/policy pages.',
    }),
    ApiOkResponse({
      description: 'Content mutation result.',
      schema: { example: contentExample },
    }),
    ApiUnauthorizedResponse({
      description: 'Missing or invalid bearer token.',
      schema: { example: unauthorizedExample },
    }),
    ApiForbiddenResponse({
      description: 'Authenticated user is not an admin.',
      schema: { example: forbiddenExample },
    }),
    ApiNotFoundResponse({
      description: 'Content does not exist.',
      schema: { example: { ...notFoundExample, message: 'Content not found' } },
    }),
  );
}

export function PublicAreasContract() {
  return applyDecorators(
    ApiOperation({
      summary: 'Public discovery: list active areas',
      description:
        'Auth guard: none. Supports all current Vietnam province-level city codes plus all.',
    }),
    ApiQuery({
      name: 'city',
      required: false,
      description: 'City code or alias such as all, hn, hcm, dn, ninhbinh.',
      example: 'all',
    }),
    ApiOkResponse({
      description: 'Active areas used by public store and cast filters.',
      schema: { example: [areaExample] },
    }),
    ApiBadRequestResponse({
      description: 'Invalid city filter.',
      schema: { example: publicDiscoveryBadRequestExample },
    }),
  );
}

export function PublicRankingsContract() {
  return applyDecorators(
    ApiOperation({
      summary: 'Public discovery: list curated rankings',
      description:
        'Auth guard: none. Returns public CAST or STORE rankings from active RankingConfig records scoped by city/category. Only active public casts and active stores are returned.',
    }),
    ApiQuery({
      name: 'targetType',
      required: false,
      description: 'Ranking target type: CAST or STORE. Defaults to CAST.',
      example: 'CAST',
    }),
    ApiQuery({
      name: 'city',
      required: false,
      description:
        'City filter: all or a supported Vietnam province-level city code. Defaults to all.',
      example: 'all',
    }),
    ApiQuery({
      name: 'category',
      required: false,
      description:
        'P0 category: BAR, CLUB, LOUNGE, GIRLS_BAR, KARAOKE, MASSAGE_SPA, RESTAURANT, CASINO. Lowercase aliases such as girls_bar and massage_spa are accepted.',
      example: 'club',
    }),
    ApiQuery({ name: 'limit', required: false, example: '5' }),
    ApiOkResponse({
      description: 'Curated public ranking response.',
      type: PublicRankingResponseDto,
      schema: { example: rankingExample },
    }),
    ApiBadRequestResponse({
      description: 'Invalid ranking filter.',
      schema: { example: publicDiscoveryBadRequestExample },
    }),
  );
}

export function PublicStoresContract() {
  return applyDecorators(
    ApiOperation({
      summary: 'Public discovery: search active stores',
      description:
        'Auth guard: none. Filters by name, category, city, area, active coupon, and supports newest, nearest, or priority sort. Nearest sort requires lat/lng.',
    }),
    publicDiscoveryQueries(),
    ApiOkResponse({
      description: 'Active stores matching the discovery filters.',
      type: PublicStoreListResponseDto,
      schema: { example: storeListExample },
    }),
    ApiBadRequestResponse({
      description: 'Invalid discovery filter.',
      schema: { example: publicDiscoveryBadRequestExample },
    }),
  );
}

export function PublicStoreDetailContract() {
  return applyDecorators(
    ApiOperation({
      summary: 'Public discovery: get active store detail by slug',
      description:
        'Auth guard: none. Returns public store detail for SEO/detail pages, including gallery, public casts, active coupons/campaigns, map/opening data, related stores, and SEO metadata.',
    }),
    ApiParam({
      name: 'slug',
      description: 'Public store slug.',
      example: 'neon-club',
    }),
    ApiOkResponse({
      description: 'Active public store detail.',
      type: PublicStoreDetailResponseDto,
      schema: { example: storeDetailExample },
    }),
    ApiNotFoundResponse({
      description: 'Store does not exist or is not public.',
      schema: {
        example: {
          statusCode: 404,
          message: 'Store not found',
          error: 'Not Found',
        },
      },
    }),
  );
}

export function PublicCastsContract() {
  return applyDecorators(
    ApiOperation({
      summary: 'Public discovery: search active casts',
      description:
        'Auth guard: none. Filters by cast/store name, store category, city, area, active coupon, language, and tag. Supports newest, nearest, or priority sort.',
    }),
    publicDiscoveryQueries({ includeCastFilters: true }),
    ApiOkResponse({
      description: 'Active public casts matching the discovery filters.',
      type: PublicCastListResponseDto,
      schema: { example: castListExample },
    }),
    ApiBadRequestResponse({
      description: 'Invalid discovery filter.',
      schema: { example: publicDiscoveryBadRequestExample },
    }),
  );
}

export function PublicCastDetailContract() {
  return applyDecorators(
    ApiOperation({
      summary: 'Public discovery: get active cast detail by slug',
      description:
        'Auth guard: none. Returns only ACTIVE, public, non-deleted cast data for SEO/detail pages. Does not return empty schedules, private bio, user links, or other sensitive fields.',
    }),
    ApiParam({
      name: 'slug',
      description: 'Public cast slug.',
      example: 'yuna-neon',
    }),
    ApiOkResponse({
      description: 'Active public cast detail.',
      type: PublicCastDetailResponseDto,
      schema: { example: castDetailExample },
    }),
    ApiNotFoundResponse({
      description: 'Cast does not exist or is not public.',
      schema: {
        example: {
          statusCode: 404,
          message: 'Cast not found',
          error: 'Not Found',
        },
      },
    }),
  );
}

export function MemberStoreFavoriteStateContract() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({
      summary: 'Member action: get own favorite state for a store',
      description:
        'Auth guard: JwtAuthGuard + RolesGuard(USER). Returns whether the current member has saved the active public store.',
    }),
    ApiParam({ name: 'slug', example: 'neon-club' }),
    ApiOkResponse({
      description: 'Favorite state for the current member.',
      type: PublicStoreFavoriteStateDto,
      schema: { example: storeFavoriteStateExample },
    }),
    ApiUnauthorizedResponse({
      description: 'Missing or invalid bearer token.',
      schema: { example: unauthorizedExample },
    }),
    ApiForbiddenResponse({
      description: 'Authenticated user is not a member account.',
      schema: { example: forbiddenExample },
    }),
    ApiNotFoundResponse({
      description: 'Store does not exist or is not public.',
      schema: { example: notFoundExample },
    }),
  );
}

export function MemberFavoriteStoreContract() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({
      summary: 'Member action: save a public store',
      description:
        'Auth guard: JwtAuthGuard + RolesGuard(USER). Creates or keeps the current member favorite for an active public store.',
    }),
    ApiParam({ name: 'slug', example: 'neon-club' }),
    ApiCreatedResponse({
      description: 'Store saved for the current member.',
      type: PublicStoreFavoriteStateDto,
      schema: { example: storeFavoriteStateExample },
    }),
    ApiUnauthorizedResponse({
      description: 'Missing or invalid bearer token.',
      schema: { example: unauthorizedExample },
    }),
    ApiForbiddenResponse({
      description: 'Authenticated user is not a member account.',
      schema: { example: forbiddenExample },
    }),
    ApiNotFoundResponse({
      description: 'Store does not exist or is not public.',
      schema: { example: notFoundExample },
    }),
  );
}

export function MemberUnfavoriteStoreContract() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({
      summary: 'Member action: remove a saved public store',
      description:
        'Auth guard: JwtAuthGuard + RolesGuard(USER). Removes the current member favorite for an active public store.',
    }),
    ApiParam({ name: 'slug', example: 'neon-club' }),
    ApiOkResponse({
      description: 'Store removed from current member favorites.',
      type: PublicStoreFavoriteStateDto,
      schema: { example: { ...storeFavoriteStateExample, favorited: false } },
    }),
    ApiUnauthorizedResponse({
      description: 'Missing or invalid bearer token.',
      schema: { example: unauthorizedExample },
    }),
    ApiForbiddenResponse({
      description: 'Authenticated user is not a member account.',
      schema: { example: forbiddenExample },
    }),
    ApiNotFoundResponse({
      description: 'Store does not exist or is not public.',
      schema: { example: notFoundExample },
    }),
  );
}

export function MemberFavoriteStoresContract() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({
      summary: 'Member action: list own saved public stores',
      description:
        'Auth guard: JwtAuthGuard + RolesGuard(USER). Own-resource route.',
    }),
    ApiOkResponse({
      description: 'Saved stores for the current member.',
      type: [MemberFavoriteStoreDto],
      schema: { example: [memberFavoriteStoreExample] },
    }),
    ApiUnauthorizedResponse({
      description: 'Missing or invalid bearer token.',
      schema: { example: unauthorizedExample },
    }),
    ApiForbiddenResponse({
      description: 'Authenticated user is not a member account.',
      schema: { example: forbiddenExample },
    }),
  );
}

export function MemberCastFavoriteStateContract() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({
      summary: 'Member action: get own favorite state for a cast',
      description:
        'Auth guard: JwtAuthGuard + RolesGuard(USER). Returns whether the current member has saved the active public cast.',
    }),
    ApiParam({ name: 'slug', example: 'yuna-neon' }),
    ApiOkResponse({
      description: 'Favorite state for the current member.',
      type: PublicCastFavoriteStateDto,
      schema: { example: castFavoriteStateExample },
    }),
    ApiUnauthorizedResponse({
      description: 'Missing or invalid bearer token.',
      schema: { example: unauthorizedExample },
    }),
    ApiForbiddenResponse({
      description: 'Authenticated user is not a member account.',
      schema: { example: forbiddenExample },
    }),
    ApiNotFoundResponse({
      description: 'Cast does not exist or is not public.',
      schema: { example: notFoundExample },
    }),
  );
}

export function MemberFavoriteCastContract() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({
      summary: 'Member action: save a public cast',
      description:
        'Auth guard: JwtAuthGuard + RolesGuard(USER). Creates or keeps the current member favorite for an active public cast.',
    }),
    ApiParam({ name: 'slug', example: 'yuna-neon' }),
    ApiCreatedResponse({
      description: 'Cast saved for the current member.',
      type: PublicCastFavoriteStateDto,
      schema: { example: castFavoriteStateExample },
    }),
    ApiUnauthorizedResponse({
      description: 'Missing or invalid bearer token.',
      schema: { example: unauthorizedExample },
    }),
    ApiForbiddenResponse({
      description: 'Authenticated user is not a member account.',
      schema: { example: forbiddenExample },
    }),
    ApiNotFoundResponse({
      description: 'Cast does not exist or is not public.',
      schema: { example: notFoundExample },
    }),
  );
}

export function MemberUnfavoriteCastContract() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({
      summary: 'Member action: remove a saved public cast',
      description:
        'Auth guard: JwtAuthGuard + RolesGuard(USER). Removes the current member favorite for an active public cast.',
    }),
    ApiParam({ name: 'slug', example: 'yuna-neon' }),
    ApiOkResponse({
      description: 'Cast removed from current member favorites.',
      type: PublicCastFavoriteStateDto,
      schema: { example: { ...castFavoriteStateExample, favorited: false } },
    }),
    ApiUnauthorizedResponse({
      description: 'Missing or invalid bearer token.',
      schema: { example: unauthorizedExample },
    }),
    ApiForbiddenResponse({
      description: 'Authenticated user is not a member account.',
      schema: { example: forbiddenExample },
    }),
    ApiNotFoundResponse({
      description: 'Cast does not exist or is not public.',
      schema: { example: notFoundExample },
    }),
  );
}

export function MemberFavoriteCastsContract() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({
      summary: 'Member action: list own saved public casts',
      description:
        'Auth guard: JwtAuthGuard + RolesGuard(USER). Own-resource route.',
    }),
    ApiOkResponse({
      description: 'Saved casts for the current member.',
      type: [MemberFavoriteCastDto],
      schema: { example: [memberFavoriteCastExample] },
    }),
    ApiUnauthorizedResponse({
      description: 'Missing or invalid bearer token.',
      schema: { example: unauthorizedExample },
    }),
    ApiForbiddenResponse({
      description: 'Authenticated user is not a member account.',
      schema: { example: forbiddenExample },
    }),
  );
}

export function PublicCouponsContract() {
  return applyDecorators(
    ApiOperation({
      summary: 'Public action: list active coupons',
      description: 'Auth guard: none. Returns public coupon data only.',
    }),
    ApiOkResponse({
      description: 'Active public coupons.',
      schema: { example: [couponExample] },
    }),
  );
}

export function CreateGuestBookingContract() {
  return applyDecorators(
    ApiOperation({
      summary: 'Booking action: guest creates a booking request',
      description:
        'Auth guard: none. Creates a guest contact snapshot and a booking with status REQUESTED. Booking details are not edited in place; customers must cancel and rebook or contact Admin for changes. Sends P0 Telegram admin notification using template telegram.admin.booking.created.v1.',
    }),
    ApiBody({ type: CreateBookingDto }),
    ApiCreatedResponse({
      description: 'Guest booking request created.',
      schema: { example: createBookingExample },
    }),
    ApiBadRequestResponse({
      description: 'Invalid booking request body.',
      schema: { example: badRequestExample },
    }),
    ApiNotFoundResponse({
      description: 'Store or cast does not exist or is not bookable.',
      schema: { example: notFoundExample },
    }),
  );
}

export function CancelGuestBookingContract() {
  return applyDecorators(
    ApiOperation({
      summary: 'Booking action: guest cancels own booking by phone',
      description:
        'Auth guard: none. Verifies the submitted phone against the guest booking contact snapshot, marks a guest booking as CANCELLED only when it is at least 1 hour before scheduledAt, writes AuditLog action BOOKING_CANCELLED with reason/beforeStatus/afterStatus, then sends P0 Telegram admin notification using template telegram.admin.booking.cancelled.v1.',
    }),
    ApiParam({ name: 'bookingId', example: 'booking_01' }),
    ApiBody({ type: CancelGuestBookingDto }),
    ApiOkResponse({
      description: 'Guest booking cancelled.',
      schema: { example: cancelledBookingExample },
    }),
    ApiBadRequestResponse({
      description: 'Invalid cancel request body.',
      schema: { example: badRequestExample },
    }),
    ApiNotFoundResponse({
      description:
        'Booking does not exist, is not a guest booking, or phone does not match.',
      schema: {
        example: {
          statusCode: 404,
          message: 'Booking not found',
          error: 'Not Found',
        },
      },
    }),
    ApiUnprocessableEntityResponse({
      description:
        'Booking cannot be cancelled in its current state or is inside the 1 hour cutoff.',
      schema: {
        example: {
          statusCode: 422,
          message:
            'Booking can only be cancelled at least 1 hour before scheduled time',
          error: 'Unprocessable Entity',
        },
      },
    }),
  );
}

export function GuestBookingLookupContract() {
  return applyDecorators(
    ApiOperation({
      summary: 'Booking action: guest looks up a booking by code and phone',
      description:
        'Auth guard: none. Resolves #BK-style booking codes or id prefixes for guest bookings only when the submitted phone matches the guest contact snapshot.',
    }),
    ApiParam({ name: 'bookingCode', example: 'BK-550E8400' }),
    ApiQuery({
      name: 'phone',
      required: true,
      example: '+84901234567',
      description: 'Phone number submitted with the guest booking.',
    }),
    ApiOkResponse({
      description: 'Guest booking found.',
      schema: { example: createBookingExample },
    }),
    ApiBadRequestResponse({
      description: 'Invalid lookup request.',
      schema: { example: badRequestExample },
    }),
    ApiNotFoundResponse({
      description: 'Booking code does not exist or phone does not match.',
      schema: {
        example: {
          statusCode: 404,
          message: 'Booking not found',
          error: 'Not Found',
        },
      },
    }),
  );
}

export function CreatePartnerRequestContract() {
  return applyDecorators(
    ApiOperation({
      summary: 'Partner action: submit a partner request',
      description:
        'Auth guard: none. Accepts a public partner request and sends P0 Telegram admin notification using template telegram.admin.partner.requested.v1. CMS link: /admin?tab=partners.',
    }),
    ApiBody({ type: CreatePartnerRequestDto }),
    ApiCreatedResponse({
      description: 'Partner request submitted for admin review.',
      schema: { example: partnerRequestExample },
    }),
    ApiBadRequestResponse({
      description: 'Invalid partner request body.',
      schema: { example: badRequestExample },
    }),
  );
}

export function ClaimGuestCouponContract() {
  return applyDecorators(
    ApiOperation({
      summary: 'Coupon action: guest claims a public coupon',
      description:
        'Auth guard: none. Creates a guest and one-time coupon issue with Guest 5% discount snapshot, QR payload, and 24-hour expiry capped by coupon end date.',
    }),
    ApiParam({ name: 'couponId', example: 'coupon_01' }),
    ApiBody({ type: ClaimGuestCouponDto }),
    ApiCreatedResponse({
      description: 'Guest coupon issue created.',
      schema: { example: guestClaimExample },
    }),
    ApiBadRequestResponse({
      description: 'Invalid request body.',
      schema: { example: badRequestExample },
    }),
    ApiNotFoundResponse({
      description: 'Coupon does not exist or is not claimable.',
      schema: { example: notFoundExample },
    }),
    ApiUnprocessableEntityResponse({
      description: 'Coupon exists but cannot be claimed.',
      schema: { example: unprocessableExample },
    }),
  );
}

export function CreateMemberBookingContract() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({
      summary: 'Booking action: member creates own booking request',
      description:
        'Auth guard: JwtAuthGuard + RolesGuard(USER). Creates a member booking with status REQUESTED, stores the submitted contact snapshot, and sends P0 Telegram admin notification using template telegram.admin.booking.created.v1. No deposit or payment is collected. Booking details are not edited in place; customers must cancel and rebook or contact Admin for changes.',
    }),
    ApiBody({ type: CreateBookingDto }),
    ApiCreatedResponse({
      description: 'Member booking request created.',
      schema: {
        example: {
          ...createBookingExample,
          user: { id: 'user_01', displayName: 'Minh Nguyen', tier: 'VIP' },
          guest: {
            id: 'guest_01',
            displayName: 'Minh Nguyen',
            phone: '+84901234567',
          },
        },
      },
    }),
    ApiBadRequestResponse({
      description: 'Invalid booking request body.',
      schema: { example: badRequestExample },
    }),
    ApiUnauthorizedResponse({
      description: 'Missing or invalid bearer token.',
      schema: { example: unauthorizedExample },
    }),
    ApiForbiddenResponse({
      description: 'Authenticated user is not a member account.',
      schema: { example: forbiddenExample },
    }),
    ApiNotFoundResponse({
      description: 'Store or cast does not exist or is not bookable.',
      schema: { example: notFoundExample },
    }),
  );
}

export function CancelMemberBookingContract() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({
      summary: 'Booking action: member cancels own booking',
      description:
        'Auth guard: JwtAuthGuard + RolesGuard(USER) + ActionPolicy(canViewMemberBooking). Marks an own booking as CANCELLED only when it is at least 1 hour before scheduledAt, then sends P0 Telegram admin notification using template telegram.admin.booking.cancelled.v1. Booking details are not edited in place; customers must cancel and rebook or contact Admin for changes.',
    }),
    ApiParam({ name: 'bookingId', example: 'booking_01' }),
    ApiBody({ type: CancelBookingDto }),
    ApiOkResponse({
      description: 'Booking cancelled.',
      schema: { example: cancelledBookingExample },
    }),
    ApiBadRequestResponse({
      description: 'Invalid cancel request body.',
      schema: { example: badRequestExample },
    }),
    ApiUnauthorizedResponse({
      description: 'Missing or invalid bearer token.',
      schema: { example: unauthorizedExample },
    }),
    ApiForbiddenResponse({
      description: 'Authenticated user is not a member account.',
      schema: { example: forbiddenExample },
    }),
    ApiNotFoundResponse({
      description: 'Booking does not exist or does not belong to the member.',
      schema: {
        example: {
          statusCode: 404,
          message: 'Booking not found',
          error: 'Not Found',
        },
      },
    }),
    ApiUnprocessableEntityResponse({
      description:
        'Booking cannot be cancelled in its current state or is inside the 1 hour cutoff.',
      schema: {
        example: {
          statusCode: 422,
          message:
            'Booking can only be cancelled at least 1 hour before scheduled time',
          error: 'Unprocessable Entity',
        },
      },
    }),
  );
}

export function CancelAdminBookingContract(scope: 'admin' | 'operator') {
  const isAdmin = scope === 'admin';

  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({
      summary: `Booking action: ${isAdmin ? 'admin' : 'operator'} cancels a customer booking`,
      description:
        'Auth guard: JwtAuthGuard + RolesGuard(ADMIN/OPERATOR). Cancels a customer booking on behalf of the customer with a reason, bypasses the self-service 1 hour cutoff, writes AuditLog action BOOKING_CANCELLED with beforeStatus/afterStatus/reason/actorId, queues a customer notification log, then sends P0 Telegram admin notification.',
    }),
    ApiParam({ name: 'bookingId', example: 'booking_01' }),
    ApiBody({ type: CancelBookingDto }),
    ApiOkResponse({
      description: 'Booking cancelled by staff.',
      schema: { example: cancelledBookingExample },
    }),
    ApiBadRequestResponse({
      description: 'Invalid cancel request body.',
      schema: { example: badRequestExample },
    }),
    ApiUnauthorizedResponse({
      description: 'Missing or invalid bearer token.',
      schema: { example: unauthorizedExample },
    }),
    ApiForbiddenResponse({
      description: isAdmin
        ? 'Authenticated user is not an admin.'
        : 'Authenticated user is not an operator/admin or lacks store access.',
      schema: { example: forbiddenExample },
    }),
    ApiNotFoundResponse({
      description: 'Booking does not exist.',
      schema: {
        example: {
          statusCode: 404,
          message: 'Booking not found',
          error: 'Not Found',
        },
      },
    }),
    ApiUnprocessableEntityResponse({
      description:
        'Booking has already ended, checked in, no-show, or cancelled.',
      schema: {
        example: {
          statusCode: 422,
          message: 'Booking cannot be cancelled in its current state',
          error: 'Unprocessable Entity',
        },
      },
    }),
  );
}

export function MemberClaimCouponContract() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({
      summary: 'Coupon action: member claims a public coupon',
      description:
        'Auth guard: JwtAuthGuard + RolesGuard(USER) + ActionPolicy(canClaimMemberCoupon). Creates a one-time coupon issue with Member 8% or VIP 10% discount snapshot, QR payload, and 7-day expiry capped by coupon end date.',
    }),
    ApiParam({ name: 'couponId', example: 'coupon_01' }),
    ApiCreatedResponse({
      description: 'Member coupon issue created.',
      schema: { example: memberClaimExample },
    }),
    ApiUnauthorizedResponse({
      description: 'Missing or invalid bearer token.',
      schema: { example: unauthorizedExample },
    }),
    ApiForbiddenResponse({
      description: 'Authenticated user is not a member account.',
      schema: { example: forbiddenExample },
    }),
    ApiNotFoundResponse({
      description: 'Coupon does not exist or is not claimable.',
      schema: { example: notFoundExample },
    }),
    ApiUnprocessableEntityResponse({
      description: 'Coupon exists but cannot be claimed.',
      schema: { example: unprocessableExample },
    }),
  );
}

export function PartnerStoresContract() {
  return guardedListContract(
    'Partner action: list own stores',
    'Auth guard: JwtAuthGuard + RolesGuard(PARTNER, ADMIN) + ActionPolicy(canViewPartnerStore).',
    partnerStoreExample,
  );
}

export function RecordProfileViewContract() {
  return applyDecorators(
    ApiOperation({
      summary: 'Analytics action: record a public profile view',
      description:
        'Public endpoint for lightweight store/cast profile view counting. Stores only target type/id in AuditLog and does not store customer identity, phone, email, or raw visitor details.',
    }),
    ApiBody({ type: RecordProfileViewDto }),
    ApiCreatedResponse({
      description: 'Profile view recorded.',
      schema: { example: { recorded: true } },
    }),
    ApiBadRequestResponse({
      description: 'Invalid target type or target id.',
      schema: { example: badRequestExample },
    }),
    ApiNotFoundResponse({
      description: 'Target store or cast does not exist.',
      schema: { example: notFoundExample },
    }),
  );
}

export function PartnerLiteDashboardContract() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({
      summary: 'Partner action: lite dashboard aggregate metrics',
      description:
        'Auth guard: JwtAuthGuard + RolesGuard(PARTNER, ADMIN) + ActionPolicy(canViewPartnerStore). Returns only aggregate metrics for stores in the partner access scope: bookings, public profile views, and customer arrivals. Customer detail records are not returned.',
    }),
    ApiQuery({
      name: 'period',
      required: false,
      enum: ['today', 'seven', 'thirty'],
      example: 'seven',
    }),
    ApiOkResponse({
      description: 'Partner lite dashboard metrics.',
      schema: { example: partnerLiteDashboardExample },
    }),
    ApiUnauthorizedResponse({
      description: 'Missing or invalid bearer token.',
      schema: { example: unauthorizedExample },
    }),
    ApiForbiddenResponse({
      description: 'Authenticated user cannot view partner store data.',
      schema: { example: forbiddenExample },
    }),
  );
}

export function PartnerCouponsContract() {
  return guardedListContract(
    'Partner action: list own coupons',
    'Auth guard: JwtAuthGuard + RolesGuard(PARTNER, ADMIN) + ActionPolicy(canViewPartnerCoupon). usageLimit is the successful USED redemption cap, not the number of issued codes.',
    partnerCouponExample,
  );
}

export function PartnerBookingsContract() {
  return guardedListContract(
    'Booking action: partner lists bookings',
    'Auth guard: JwtAuthGuard + RolesGuard(PARTNER, ADMIN/OPERATOR depending on route) + ActionPolicy(canViewPartnerBooking).',
    bookingExample,
  );
}

export function PartnerScanCouponContract() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({
      summary: 'Partner action: scan a coupon QR code',
      description:
        'Auth guard: JwtAuthGuard + RolesGuard(PARTNER, ADMIN, OPERATOR) + ActionPolicy(canScanCoupon). Validates DB permission and store access, marks stale issued codes EXPIRED, then returns masked customer data.',
    }),
    ApiParam({
      name: 'code',
      example: 'GUEST-550e8400-e29b-41d4-a716-446655440000',
    }),
    ApiOkResponse({
      description: 'Coupon issue scan result.',
      schema: { example: scannedCouponIssueExample },
    }),
    ApiUnauthorizedResponse({
      description: 'Missing or invalid bearer token.',
      schema: { example: unauthorizedExample },
    }),
    ApiForbiddenResponse({
      description: 'Authenticated user cannot access the coupon store.',
      schema: { example: forbiddenExample },
    }),
    ApiNotFoundResponse({
      description: 'Coupon issue code does not exist.',
      schema: {
        example: {
          statusCode: 404,
          message: 'Coupon issue not found',
          error: 'Not Found',
        },
      },
    }),
    ApiUnprocessableEntityResponse({
      description:
        'Coupon issue is expired, used, revoked, or otherwise not valid.',
      schema: {
        example: {
          statusCode: 422,
          message: 'Coupon issue has expired',
          error: 'Unprocessable Entity',
        },
      },
    }),
  );
}

export function PartnerScanCouponPayloadContract() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({
      summary: 'Partner action: scan a signed coupon QR payload',
      description:
        'Auth guard: JwtAuthGuard + RolesGuard(PARTNER, ADMIN, OPERATOR). ActionPolicyGuard is intentionally not used here because the request contains only an opaque signed token; the service resolves the coupon issue and enforces store access with ensureStoreAccess before returning scan evidence. Supports offline queued scan replay, records audit/analytics events, and returns only masked customer summary data.',
    }),
    ApiBody({ type: ScanCouponIssueDto }),
    ApiOkResponse({
      description: 'Coupon issue scan result.',
      schema: { example: scannedCouponIssueExample },
    }),
    ApiBadRequestResponse({
      description: 'Invalid signed QR payload.',
      schema: { example: badRequestExample },
    }),
    ApiUnauthorizedResponse({
      description: 'Missing or invalid bearer token.',
      schema: { example: unauthorizedExample },
    }),
    ApiForbiddenResponse({
      description: 'Authenticated user cannot access the coupon store.',
      schema: { example: forbiddenExample },
    }),
    ApiNotFoundResponse({
      description: 'Coupon issue does not exist.',
      schema: {
        example: {
          statusCode: 404,
          message: 'Coupon issue not found',
          error: 'Not Found',
        },
      },
    }),
    ApiUnprocessableEntityResponse({
      description:
        'Coupon issue is expired, used, revoked, or otherwise not valid.',
      schema: {
        example: {
          statusCode: 422,
          message: 'Coupon issue has expired',
          error: 'Unprocessable Entity',
        },
      },
    }),
  );
}

export function PartnerConfirmCheckInContract(paramName = 'couponIssueId') {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({
      summary: 'Partner action: confirm customer check-in',
      description:
        'Auth guard: JwtAuthGuard + RolesGuard(PARTNER, ADMIN, OPERATOR) + ActionPolicy(canConfirmCheckIn). Atomically marks the one-time coupon issue USED, writes coupon usage audit/log events, and updates the linked booking checked in.',
    }),
    ApiParam({ name: paramName, example: 'issue_01' }),
    ApiOkResponse({
      description: 'Confirmed check-in result.',
      schema: { example: confirmedCheckInExample },
    }),
    ApiUnauthorizedResponse({
      description: 'Missing or invalid bearer token.',
      schema: { example: unauthorizedExample },
    }),
    ApiForbiddenResponse({
      description: 'Authenticated user cannot access the coupon store.',
      schema: { example: forbiddenExample },
    }),
    ApiNotFoundResponse({
      description: 'Coupon issue does not exist.',
      schema: {
        example: {
          statusCode: 404,
          message: 'Coupon issue not found',
          error: 'Not Found',
        },
      },
    }),
    ApiUnprocessableEntityResponse({
      description:
        'Coupon issue is expired, used, revoked, or otherwise not valid.',
      schema: {
        example: {
          statusCode: 422,
          message: 'Coupon issue has already been used',
          error: 'Unprocessable Entity',
        },
      },
    }),
  );
}

export function PartnerBillsContract() {
  return guardedListContract(
    'Bill action: partner lists bills',
    'Auth guard: JwtAuthGuard + RolesGuard(PARTNER, ADMIN/OPERATOR depending on route) + ActionPolicy(canViewPartnerBill).',
    billExample,
  );
}

export function CreatePartnerBillContract() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({
      summary: 'Bill action: partner submits a bill',
      description:
        'Auth guard: JwtAuthGuard + RolesGuard(PARTNER, ADMIN). Creates a SUBMITTED bill within the actor store scope and returns 403 when the partner submits for a store outside their scope. Request body accepts only store/booking reference, original bill total, and service usage time; item or service details are not accepted. Evidence files are encouraged but optional and can be uploaded to /storage/upload with billId after creation. Bills older than 10 days are rejected. Basic duplicate/rate-limit checks run by actor, store, totalVnd, and usedAt.',
    }),
    ApiBody({ type: CreateBillDto }),
    ApiCreatedResponse({
      description: 'Bill submitted for admin review.',
      schema: { example: billExample },
    }),
    ApiBadRequestResponse({
      description: 'Invalid bill request body.',
      schema: { example: badRequestExample },
    }),
    ApiUnauthorizedResponse({
      description: 'Missing or invalid bearer token.',
      schema: { example: unauthorizedExample },
    }),
    ApiForbiddenResponse({
      description: 'Authenticated partner cannot submit for this store.',
      schema: { example: forbiddenExample },
    }),
    ApiNotFoundResponse({
      description: 'Booking or store does not exist.',
      schema: { example: notFoundExample },
    }),
    ApiUnprocessableEntityResponse({
      description: 'Bill is outside the accepted submission window.',
      schema: {
        example: {
          statusCode: 422,
          message: 'Bill can only be submitted within 10 days of usage time',
          error: 'Unprocessable Entity',
        },
      },
    }),
  );
}

export function MemberBookingsContract() {
  return guardedListContract(
    'Booking action: member lists own bookings',
    'Auth guard: JwtAuthGuard + RolesGuard(USER) + ActionPolicy(canViewMemberBooking). Own-resource route.',
    {
      ...bookingExample,
      storeId: undefined,
      user: undefined,
      guest: undefined,
    },
  );
}

export function MemberCouponIssuesContract() {
  return guardedListContract(
    'Coupon action: member lists own coupon issues',
    'Auth guard: JwtAuthGuard + RolesGuard(USER) + ActionPolicy(canViewMemberCoupon). Own-resource route; stale ISSUED codes are marked EXPIRED before returning.',
    memberCouponIssueExample,
  );
}

export function MemberBillsContract() {
  return guardedListContract(
    'Bill action: member lists own bills',
    'Auth guard: JwtAuthGuard + RolesGuard(USER). Own-resource route returning member bill history, submitterType, linked booking/coupon/couponIssue, and protected bill evidence media when present.',
    billExample,
  );
}

export function MemberPointSummaryContract() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({
      summary: 'Loyalty action: member reads current point balance',
      description:
        'Auth guard: JwtAuthGuard + RolesGuard(USER). Computes the member point balance from posted PointLedger rows, excludes expired earn/positive adjustment rows, and returns the next tier progress used by the account screen.',
    }),
    ApiOkResponse({
      description: 'Current member point balance and tier progress.',
      schema: { example: memberPointSummaryExample },
    }),
    ApiUnauthorizedResponse({
      description: 'Missing or invalid bearer token.',
      schema: { example: unauthorizedExample },
    }),
    ApiForbiddenResponse({
      description: 'Authenticated user is not a member account.',
      schema: { example: forbiddenExample },
    }),
  );
}

export function AdminCouponIssuesContract() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({
      summary: 'Admin action: list coupon issues by store, coupon, and status',
      description:
        'Auth guard: JwtAuthGuard + RolesGuard(ADMIN). CMS view for issued coupon wallet/history across stores and campaigns; stale ISSUED codes are marked EXPIRED before returning. Includes admin detail fields for QR payload hash, campaign snapshot, and related CouponIssue audit logs.',
    }),
    ApiQuery({ name: 'storeId', required: false }),
    ApiQuery({ name: 'couponId', required: false }),
    ApiQuery({
      name: 'status',
      required: false,
      enum: ['ISSUED', 'USED', 'EXPIRED', 'REVOKED'],
    }),
    ApiQuery({ name: 'limit', required: false, example: 50 }),
    ApiOkResponse({
      description: 'Coupon issues for admin CMS.',
      schema: { example: [adminCouponIssueExample] },
    }),
    ApiUnauthorizedResponse({
      description: 'Missing or invalid bearer token.',
      schema: { example: unauthorizedExample },
    }),
    ApiForbiddenResponse({
      description: 'Authenticated user is not an admin.',
      schema: { example: forbiddenExample },
    }),
  );
}

export function CreateMemberBillContract() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({
      summary: 'Bill action: member submits a bill',
      description:
        'Auth guard: JwtAuthGuard + RolesGuard(USER). Creates a SUBMITTED bill, optionally links it to an own booking, and sends P0 Telegram admin notification using template telegram.admin.bill.submitted.v1. CMS link: /admin?tab=bills. Request body accepts only store/booking reference, original bill total, and service usage time; item or service details are not accepted. Evidence files are encouraged but optional and can be uploaded to /storage/upload with billId after creation. Bills older than 10 days are rejected. Basic duplicate/rate-limit checks run by actor, store, totalVnd, and usedAt.',
    }),
    ApiBody({ type: CreateBillDto }),
    ApiCreatedResponse({
      description: 'Bill submitted for admin review.',
      schema: { example: billExample },
    }),
    ApiBadRequestResponse({
      description: 'Invalid bill request body.',
      schema: { example: badRequestExample },
    }),
    ApiUnauthorizedResponse({
      description: 'Missing or invalid bearer token.',
      schema: { example: unauthorizedExample },
    }),
    ApiForbiddenResponse({
      description: 'Authenticated user is not a member account.',
      schema: { example: forbiddenExample },
    }),
    ApiNotFoundResponse({
      description: 'Booking or store does not exist.',
      schema: { example: notFoundExample },
    }),
    ApiUnprocessableEntityResponse({
      description:
        'Bill cannot be submitted for the requested booking or usage date.',
      schema: {
        example: {
          statusCode: 422,
          message: 'Bill can only be submitted within 10 days of usage time',
          error: 'Unprocessable Entity',
        },
      },
    }),
  );
}

export function AdminSensitiveBillsContract() {
  return applyDecorators(
    guardedListContract(
      'Admin action: list sensitive bill reviews',
      'Auth guard: JwtAuthGuard + RolesGuard(ADMIN) + ActionPolicy(canViewSensitiveBill). Supports bookingId, couponId, and couponIssueId filters for reconciliation.',
      sensitiveBillExample,
    ),
    ApiQuery({
      name: 'bookingId',
      required: false,
      description: 'Filter by linked booking id.',
    }),
    ApiQuery({
      name: 'couponId',
      required: false,
      description: 'Filter by linked coupon campaign id.',
    }),
    ApiQuery({
      name: 'couponIssueId',
      required: false,
      description: 'Filter by linked coupon issue id.',
    }),
  );
}

export function AdminRevenueReportContract() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({
      summary: 'Admin action: P0 revenue report grouped by service date, store, and coupon',
      description:
        'Auth guard: JwtAuthGuard + RolesGuard(ADMIN) + ActionPolicy(canViewRevenueReport). Filters by Bill.usedAt service usage date in the selected timezone and returns P0 revenue totals grouped by date -> store -> discount code. MVP export is disabled by default (`ENABLE_REVENUE_EXPORT=false`) and P2 BI fields are hidden unless `ENABLE_REVENUE_BI=true`.',
    }),
    ApiQuery({
      name: 'from',
      required: false,
      description: 'Inclusive service usage date start (Bill.usedAt).',
      example: '2026-07-01T00:00:00.000Z',
    }),
    ApiQuery({
      name: 'to',
      required: false,
      description: 'Inclusive service usage date end (Bill.usedAt).',
      example: '2026-07-31T23:59:59.999Z',
    }),
    ApiQuery({
      name: 'fromDate',
      required: false,
      description:
        'Local service usage start date. Asia/Ho_Chi_Minh converts 2026-07-01 to 2026-06-30T17:00:00.000Z.',
      example: '2026-07-01',
    }),
    ApiQuery({
      name: 'toDate',
      required: false,
      description:
        'Local service usage end date. Asia/Ho_Chi_Minh converts 2026-07-01 to 2026-07-01T16:59:59.999Z.',
      example: '2026-07-31',
    }),
    ApiQuery({
      name: 'timezone',
      required: false,
      description: 'Timezone used for local date filters and date grouping.',
      example: 'Asia/Ho_Chi_Minh',
    }),
    ApiQuery({
      name: 'storeId',
      required: false,
      description: 'Optional store filter.',
    }),
    ApiQuery({
      name: 'couponId',
      required: false,
      description: 'Optional coupon campaign filter.',
    }),
    ApiQuery({
      name: 'flag',
      required: false,
      description:
        'Optional commission flag filter: NEGATIVE_COMMISSION_PM_BA_CONFIRMATION_REQUIRED or MISSING_ACTIVE_COMMISSION_CONFIG.',
    }),
    ApiQuery({
      name: 'partnerAccountId',
      required: false,
      description: 'Optional partner account filter.',
    }),
    ApiQuery({
      name: 'areaId',
      required: false,
      description: 'Optional area filter.',
    }),
    ApiQuery({
      name: 'castId',
      required: false,
      description: 'Optional requested cast filter.',
    }),
    ApiOkResponse({
      description:
        'MVP revenue report grouped by service usage date, store, and discount code.',
      schema: { example: adminRevenueReportExample },
    }),
    ApiUnauthorizedResponse({
      description: 'Missing or invalid bearer token.',
      schema: { example: unauthorizedExample },
    }),
    ApiForbiddenResponse({
      description: 'Authenticated user is not an admin.',
      schema: { example: forbiddenExample },
    }),
  );
}

export function ReviewSensitiveBillContract() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({
      summary: 'Admin action: review a sensitive bill',
      description:
        'Auth guard: JwtAuthGuard + RolesGuard(ADMIN) + ActionPolicy(canApproveBill). Writes AuditLog beforeJson/afterJson snapshots. Negative commission approval moves to PENDING_PM_BA until PM/BA confirmation reason is provided; verified/rejected notifications are only sent for final VERIFIED/REJECTED outcomes.',
    }),
    ApiParam({ name: 'billId', example: 'bill_01' }),
    ApiBody({ type: ReviewBillDto }),
    ApiOkResponse({
      description: 'Bill review result.',
      schema: { example: reviewedBillExample },
    }),
    ApiBadRequestResponse({
      description: 'Invalid request body.',
      schema: {
        example: {
          statusCode: 400,
          message: ['rejectReason should not be empty when approve is false'],
          error: 'Bad Request',
        },
      },
    }),
    ApiUnauthorizedResponse({
      description: 'Missing or invalid bearer token.',
      schema: { example: unauthorizedExample },
    }),
    ApiForbiddenResponse({
      description: 'Authenticated user is not an admin.',
      schema: { example: forbiddenExample },
    }),
    ApiNotFoundResponse({
      description: 'Bill does not exist or was deleted.',
      schema: {
        example: {
          statusCode: 404,
          message: 'Bill not found',
          error: 'Not Found',
        },
      },
    }),
    ApiUnprocessableEntityResponse({
      description:
        'Bill exists but cannot be reviewed in the requested state or is missing required approval rules.',
      schema: {
        example: {
          statusCode: 422,
          message: 'Missing active CommissionConfig for bill approval',
          code: 'MISSING_ACTIVE_COMMISSION_CONFIG',
          flags: ['MISSING_ACTIVE_COMMISSION_CONFIG'],
          reason:
            'Bill approval requires an active CommissionConfig before commission can be calculated.',
          error: 'Unprocessable Entity',
        },
      },
    }),
  );
}

const adminDashboardStatsExample = {
  activeStores: 24,
  totalCasts: 86,
  todaysBookings: 12,
  pendingBills: 5,
  monthlyRevenue: 312000000,
  pendingPartners: 3,
  revenue7Days: [
    { date: '2026-07-01', revenue: 15000000 },
    { date: '2026-07-02', revenue: 20000000 },
  ],
  recentBookings: [],
  telegramLogs: [],
};

export function AdminDashboardStatsContract() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({
      summary: 'Admin action: Get dashboard statistics',
      description:
        'Auth guard: JwtAuthGuard + RolesGuard(ADMIN). Returns aggregated statistics for the admin dashboard.',
    }),
    ApiOkResponse({
      description: 'Dashboard statistics successfully retrieved.',
      schema: { example: adminDashboardStatsExample },
    }),
    ApiUnauthorizedResponse({
      description: 'Missing or invalid bearer token.',
      schema: { example: unauthorizedExample },
    }),
    ApiForbiddenResponse({
      description: 'Authenticated user is not an admin.',
      schema: { example: forbiddenExample },
    }),
  );
}

export function CatalogParamsContract(
  options: { includeCastFilters?: boolean } = {},
) {
  return publicDiscoveryQueries(options);
}

function publicDiscoveryQueries(
  options: { includeCastFilters?: boolean } = {},
) {
  const decorators = [
    ApiQuery({ name: 'q', required: false, example: 'neon' }),
    ApiQuery({
      name: 'city',
      required: false,
      description: 'City code or alias such as all, hn, hcm, dn, ninhbinh.',
      example: 'all',
    }),
    ApiQuery({
      name: 'area',
      required: false,
      description: 'Area code, area name, or district.',
      example: 'hn-tayho',
    }),
    ApiQuery({
      name: 'category',
      required: false,
      description:
        'P0 category: BAR, CLUB, LOUNGE, GIRLS_BAR, KARAOKE, MASSAGE_SPA, RESTAURANT, CASINO. Alias massage-spa maps to MASSAGE_SPA.',
      example: 'GIRLS_BAR',
    }),
    ApiQuery({
      name: 'lat',
      required: false,
      description: 'Latitude for nearest-first suggestions.',
      example: '21.055',
    }),
    ApiQuery({
      name: 'lng',
      required: false,
      description: 'Longitude for nearest-first suggestions.',
      example: '105.822',
    }),
    ApiQuery({
      name: 'hasActiveCoupon',
      required: false,
      description:
        'When true, only returns stores or casts attached to a store with an active coupon window.',
      example: 'true',
    }),
    ApiQuery({
      name: 'sort',
      required: false,
      description:
        'Sort mode: newest, nearest, priority. Alias ranking maps to priority.',
      example: 'priority',
    }),
    ApiQuery({ name: 'limit', required: false, example: '24' }),
    ApiQuery({ name: 'page', required: false, example: '1' }),
    ApiQuery({ name: 'offset', required: false, example: '0' }),
  ];

  if (options.includeCastFilters) {
    decorators.push(
      ApiQuery({
        name: 'language',
        required: false,
        description: 'Cast language filter, for example ja, vi, or en.',
        example: 'ja',
      }),
      ApiQuery({
        name: 'tag',
        required: false,
        description: 'Cast tag/keyword filter, for example ktv or vip.',
        example: 'ktv',
      }),
      ApiQuery({
        name: 'storeSlug',
        required: false,
        description: 'Only returns public casts attached to the selected store.',
        example: 'tokyo-kitchen',
      }),
    );
  }

  return applyDecorators(...decorators);
}

function guardedListContract(
  summary: string,
  description: string,
  example: Record<string, unknown>,
) {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({ summary, description }),
    ApiOkResponse({
      description: 'List response.',
      schema: { example: [example] },
    }),
    ApiUnauthorizedResponse({
      description: 'Missing or invalid bearer token.',
      schema: { example: unauthorizedExample },
    }),
    ApiForbiddenResponse({
      description: 'Authenticated user does not have the required role.',
      schema: { example: forbiddenExample },
    }),
  );
}
