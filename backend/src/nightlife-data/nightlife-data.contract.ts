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
import { CancelBookingDto } from './dto/cancel-booking.dto';
import { ClaimGuestCouponDto } from './dto/claim-guest-coupon.dto';
import { CreateBillDto } from './dto/create-bill.dto';
import { CreateBookingDto } from './dto/create-booking.dto';
import { CreatePartnerRequestDto } from './dto/create-partner-request.dto';
import {
  MemberFavoriteCastDto,
  PublicCastFavoriteStateDto,
  PublicCastDetailResponseDto,
  PublicCastListResponseDto,
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
  message: 'city must be hn, hcm, or all',
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
        label: 'Cast hourly rate',
        amountVnd: 600000,
        unit: 'hour',
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

const memberFavoriteCastExample = {
  favoriteId: 'fav_01',
  favoritedAt: '2026-06-30T10:00:00.000Z',
  cast: castDetailExample.relatedCasts[0],
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

const guestClaimExample = {
  issue: {
    id: 'issue_01',
    code: 'GUEST-550e8400-e29b-41d4-a716-446655440000',
    status: 'ISSUED',
    expiresAt: '2026-06-27T10:00:00.000Z',
    createdAt: '2026-06-26T10:00:00.000Z',
    coupon: {
      id: 'coupon_01',
      code: 'WELCOME20',
      name: 'Welcome 20%',
    },
  },
  guest: { id: 'guest_01' },
};

const memberClaimExample = {
  id: 'issue_02',
  code: 'MEMBER-550e8400-e29b-41d4-a716-446655440000',
  status: 'ISSUED',
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
  expiresAt: '2026-06-27T10:00:00.000Z',
  usedAt: null,
  user: null,
  guest: { id: 'guest_01', displayName: 'Guest Name' },
  booking: {
    id: 'booking_01',
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
  expiresAt: '2026-06-27T10:00:00.000Z',
  usedAt: '2026-06-26T10:15:00.000Z',
  scannedById: 'partner_01',
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
  subtotalVnd: 2000000,
  discountVnd: 200000,
  totalVnd: 1800000,
  submittedAt: '2026-06-26T10:00:00.000Z',
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
  expiresAt: '2026-07-01T00:00:00.000Z',
  usedAt: null,
  coupon: {
    id: 'coupon_01',
    code: 'WELCOME20',
    name: 'Welcome 20%',
    store: { id: 'store_01', name: 'Luna Lounge', slug: 'luna-lounge' },
  },
};

const sensitiveBillExample = {
  ...billExample,
  serviceChargeVnd: 100000,
  taxVnd: 180000,
  paidVnd: 2080000,
  commissionAmountVnd: 180000,
  pointsEarned: 180,
  discountRuleSnapshot: { type: 'PERCENT', value: 10 },
  commissionRuleSnapshot: { rate: 0.1 },
  pointRuleSnapshot: { vndPerPoint: 10000 },
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

const partnerRequestExample = {
  id: 'PARTNER-7F3A91BC',
  status: 'PENDING_REVIEW',
  submittedAt: '2026-06-26T10:20:00.000Z',
  message: 'Partner request submitted for admin review',
};

export function PublicAreasContract() {
  return applyDecorators(
    ApiOperation({
      summary: 'Public discovery: list active areas',
      description:
        'Auth guard: none. P0 supports hn, hcm, and all only. Da Nang/Hai Phong seed data is reserved for later phases and is not rendered by P0 public listing.',
    }),
    ApiQuery({
      name: 'city',
      required: false,
      description: 'P0 city code or alias: hn, hcm, all.',
      example: 'hn',
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
      description: 'Auth guard: none. Creates a guest and coupon issue.',
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

export function MemberClaimCouponContract() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({
      summary: 'Coupon action: member claims a public coupon',
      description:
        'Auth guard: JwtAuthGuard + RolesGuard(USER) + ActionPolicy(canClaimMemberCoupon). Creates a 7-day member coupon issue capped by coupon end date.',
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

export function PartnerCouponsContract() {
  return guardedListContract(
    'Partner action: list own coupons',
    'Auth guard: JwtAuthGuard + RolesGuard(PARTNER, ADMIN) + ActionPolicy(canViewPartnerCoupon).',
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
        'Auth guard: JwtAuthGuard + RolesGuard(PARTNER, ADMIN, OPERATOR) + ActionPolicy(canScanCoupon). Validates DB permission and store access, then returns masked customer data.',
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

export function PartnerConfirmCheckInContract(paramName = 'couponIssueId') {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({
      summary: 'Partner action: confirm customer check-in',
      description:
        'Auth guard: JwtAuthGuard + RolesGuard(PARTNER, ADMIN, OPERATOR) + ActionPolicy(canConfirmCheckIn). Marks the coupon issue used and linked booking checked in.',
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
          message: 'Coupon issue is not claimable',
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
    'Auth guard: JwtAuthGuard + RolesGuard(USER) + ActionPolicy(canViewMemberCoupon). Own-resource route.',
    memberCouponIssueExample,
  );
}

export function CreateMemberBillContract() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({
      summary: 'Bill action: member submits a bill',
      description:
        'Auth guard: JwtAuthGuard + RolesGuard(USER). Creates a SUBMITTED bill, optionally links it to an own booking, and sends P0 Telegram admin notification using template telegram.admin.bill.submitted.v1. CMS link: /admin?tab=bills.',
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
      description: 'Bill cannot be submitted for the requested booking.',
      schema: {
        example: {
          statusCode: 422,
          message: 'Booking already has a submitted bill',
          error: 'Unprocessable Entity',
        },
      },
    }),
  );
}

export function AdminSensitiveBillsContract() {
  return guardedListContract(
    'Admin action: list sensitive bill reviews',
    'Auth guard: JwtAuthGuard + RolesGuard(ADMIN) + ActionPolicy(canViewSensitiveBill).',
    sensitiveBillExample,
  );
}

export function ReviewSensitiveBillContract() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({
      summary: 'Admin action: review a sensitive bill',
      description:
        'Auth guard: JwtAuthGuard + RolesGuard(ADMIN/OPERATOR depending on route) + ActionPolicy(canReviewBill). Writes AuditLog beforeJson/afterJson snapshots and sends P0 Telegram admin notification using template telegram.admin.bill.verified.v1 or telegram.admin.bill.rejected.v1.',
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
      description: 'Bill exists but cannot be reviewed in the requested state.',
      schema: {
        example: {
          statusCode: 422,
          message: 'Bill has already been verified',
          error: 'Unprocessable Entity',
        },
      },
    }),
  );
}

function publicDiscoveryQueries(
  options: { includeCastFilters?: boolean } = {},
) {
  const decorators = [
    ApiQuery({ name: 'q', required: false, example: 'neon' }),
    ApiQuery({
      name: 'city',
      required: false,
      description:
        'P0 city code or alias: hn, hcm, all. Da Nang/Hai Phong are later-phase data and are not returned by P0 listing.',
      example: 'hn',
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
