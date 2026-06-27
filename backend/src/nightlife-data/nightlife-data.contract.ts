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
import { ClaimGuestCouponDto } from './dto/claim-guest-coupon.dto';
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

const areaExample = {
  id: 'area_01',
  code: 'hn-tayho',
  name: 'Tay Ho',
  city: 'Ha Noi',
  district: 'Tay Ho',
  ward: 'Quang An',
  cityCode: 'hn',
};

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
  thumbnailUrl: null,
  distanceKm: 1.4,
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
  thumbnailUrl: null,
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
        'Auth guard: none. Filters by name, category, city, area, and sorts nearest first when lat/lng are provided.',
    }),
    publicDiscoveryQueries(),
    ApiOkResponse({
      description: 'Active stores matching the discovery filters.',
      schema: { example: [storeExample] },
    }),
    ApiBadRequestResponse({
      description: 'Invalid discovery filter.',
      schema: { example: publicDiscoveryBadRequestExample },
    }),
  );
}

export function PublicCastsContract() {
  return applyDecorators(
    ApiOperation({
      summary: 'Public discovery: search active casts',
      description:
        'Auth guard: none. Filters by cast/store name, store category, city, area, language, and tag. P0 cast listing does not require nearest-first UI.',
    }),
    publicDiscoveryQueries({ includeCastFilters: true }),
    ApiOkResponse({
      description: 'Active public casts matching the discovery filters.',
      schema: { example: [castExample] },
    }),
    ApiBadRequestResponse({
      description: 'Invalid discovery filter.',
      schema: { example: publicDiscoveryBadRequestExample },
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
        'Auth guard: JwtAuthGuard + RolesGuard(ADMIN/OPERATOR depending on route) + ActionPolicy(canReviewBill). Writes AuditLog beforeJson/afterJson snapshots.',
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
    ApiQuery({ name: 'limit', required: false, example: '24' }),
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
