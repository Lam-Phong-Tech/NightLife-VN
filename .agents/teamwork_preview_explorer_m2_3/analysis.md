# Technical Analysis Report: Milestone 2 Backend Activity Contracts & Unit Test Suite Design

**Agent**: `teamwork_preview_explorer` (PR2 Unit Tests & Verification Explorer)  
**Working Directory**: `d:\laragon\www\NightLife-VN\.agents\teamwork_preview_explorer_m2_3\`  
**Target Milestone**: Milestone 2 — PR 2: Backend Activity Contracts & Stable Pagination  
**Date**: 2026-08-05  

---

## 1. Executive Summary

This report establishes the complete unit testing architecture and test suite specification for **Milestone 2 (PR 2: Backend Activity Contracts & Stable Pagination)**. Based on technical reconnaissance of `nightlife-data.service.spec.ts`, `partner-staff.controller.spec.ts`, `nightlife-data.controller.ts`, and project architectural guidelines in `PROJECT.md` and `ORIGINAL_REQUEST.md`, this analysis details:
1. Architectural patterns for testing NestJS services/controllers with Prisma mocks and multi-tenant store authorization (`AccessService`).
2. Specification of DTOs (`PartnerActivityQueryDto`, `PartnerHomeQueryDto`).
3. Complete test suite design for `GET /partner/home`, `GET /partner/activity` (cursor pagination, filtering, deduplication), `GET /partner/activity/:activityId`, and RoleGuard authorization (`PARTNER` 200 vs `STAFF` 403).

---

## 2. Analysis of Existing Backend Unit Test Patterns

### 2.1 Test Architecture in `nightlife-data.service.spec.ts`
The existing service test suite (`11,837 lines`) establishes clear patterns for mocking dependencies and asserting behavior:

- **Prisma Mocking Structure**:
  - `PrismaService` is mocked as a typed object containing `jest.fn()` mocks for model delegates (`booking`, `bill`, `couponIssue`, `store`, `auditLog`, `user`, etc.).
  - `prisma.$transaction` is mocked to execute callback functions synchronously passing the mock `prisma` instance:
    ```typescript
    prisma.$transaction.mockImplementation((callback) => callback(prisma));
    ```
- **Access Control Mocking (`AccessService`)**:
  - `accessService.getAccessibleStoreIds` returns `string[] | undefined`. Returning `['store-a']` scopes queries to accessible stores; returning `undefined` (for Admin) allows cross-store access.
  - `accessService.ensureStoreAccess` resolves for authorized access or throws `ForbiddenException('You do not have access to this store')`.
- **Date & Time Controls**:
  - Uses `jest.useFakeTimers().setSystemTime(new Date('2026-07-03T10:00:00.000Z'))` to pin system time for period metrics (e.g. today/7d/30d) and time boundary filters in `Asia/Ho_Chi_Minh`.
  - Reverts timers in `afterEach(() => { jest.useRealTimers(); })`.
- **Data Privacy & Assertion Guards**:
  - Strict assertions ensure response payloads mask sensitive PII (e.g. `expect(JSON.stringify(result)).not.toContain('phone')`).

### 2.2 Controller & Guard Testing in `partner-staff.controller.spec.ts`
- Uses `@nestjs/testing` `Test.createTestingModule` to compile controller instances with mocked services.
- Verifies delegation to `accessService.ensureStoreAccess(req.user, storeId)` before invoking business logic.
- Verifies HTTP exception propagation (`BadRequestException`, `ForbiddenException`, `NotFoundException`).

---

## 3. Specification of Data Structures & Contracts for PR2

### 3.1 DTO Definitions

#### `PartnerActivityQueryDto` (`backend/src/nightlife-data/dto/partner-activity-query.dto.ts`)
```typescript
export enum ActivityTypeFilter {
  ALL = 'ALL',
  COUPON_USAGE = 'COUPON_USAGE',
  BILL_PAYMENT = 'BILL_PAYMENT',
  BOOKING_CHECKIN = 'BOOKING_CHECKIN',
}

export class PartnerActivityQueryDto {
  @IsOptional()
  @IsEnum(ActivityTypeFilter)
  type?: ActivityTypeFilter = ActivityTypeFilter.ALL;

  @IsOptional()
  @IsString()
  storeId?: string;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsString()
  q?: string;

  @IsOptional()
  @IsString()
  cursor?: string; // Base64 encoded compound cursor: ISOString_id

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(50)
  limit?: number = 20;
}
```

#### Activity Feed Item & Stable Pagination Contract
```typescript
export interface PartnerActivityItem {
  id: string; // e.g. "act_bill_123" or "act_coupon_456"
  type: 'COUPON_USAGE' | 'BILL_PAYMENT' | 'BOOKING_CHECKIN';
  activityAt: string; // ISO string
  storeId: string;
  storeName: string;
  title: string;
  subtitle: string;
  amountVnd?: number | null;
  status: string; // e.g. "USED", "APPROVED", "COMPLETED"
  customerName?: string | null;
  customerPhoneMasked?: string | null;
  referenceId: string; // Original database entity ID (billId, couponIssueId, bookingId)
  linkedEntities?: {
    bookingId?: string | null;
    couponIssueId?: string | null;
    billId?: string | null;
  };
}

export interface PartnerActivityResponse {
  data: PartnerActivityItem[];
  meta: {
    limit: number;
    hasNextPage: boolean;
    nextCursor: string | null;
  };
}
```

---

## 4. Comprehensive Unit Test Suite Design for PR2

The unit tests for PR2 should be organized in `backend/src/nightlife-data/partner-activity.service.spec.ts` (or added to `nightlife-data.service.spec.ts`) and `backend/src/nightlife-data/partner-activity.controller.spec.ts`.

### 4.1 Test Suite 1: `GET /partner/home` Overview Data Aggregation

| Test Case ID | Test Case Title | Input / Pre-conditions | Expected Behavior / Assertions |
|---|---|---|---|
| `HOME-01` | Aggregate metrics for accessible stores | User with role `PARTNER`, owns `store-1` & `store-2`. DB has 5 bookings, 3 approved bills (total 4,500,000 VND), 2 used coupons. | Returns object with `totalRevenueVnd: 4500000`, `billCount: 3`, `bookingCount: 5`, `couponUsedCount: 2`, and `recentActivities` array (max 5 items). Prisma `count` & `aggregate` called with `storeId: { in: ['store-1', 'store-2'] }`. |
| `HOME-02` | Single store scoping via `storeId` parameter | Partner specifies `storeId: 'store-1'`. | Invokes `accessService.ensureStoreAccess(user, 'store-1')`. Queries are strictly scoped to `storeId: 'store-1'`. |
| `HOME-03` | Empty metrics for new store | Store has 0 bookings, 0 bills, 0 coupon usages. | Returns `{ totalRevenueVnd: 0, billCount: 0, bookingCount: 0, couponUsedCount: 0, recentActivities: [] }`. No `NaN` or `null` metric outputs. |
| `HOME-04` | Timezone boundary aggregation (`Asia/Ho_Chi_Minh`) | System date `2026-08-05T00:30:00+07:00` (UTC `2026-08-04T17:30:00Z`). | Today metrics filter using local Ho Chi Minh midnight (`2026-08-04T17:00:00.000Z` to `2026-08-05T16:59:59.999Z`). |
| `HOME-05` | Unauthorized store access handling | User requests `store-99` which they do not own. | `accessService.ensureStoreAccess` rejects with `ForbiddenException`. Endpoint propagates `ForbiddenException`. |

### 4.2 Test Suite 2: `GET /partner/activity` Cursor Pagination

| Test Case ID | Test Case Title | Input / Pre-conditions | Expected Behavior / Assertions |
|---|---|---|---|
| `PAG-01` | First page request (no cursor) | Request `limit: 10`. DB has 15 activity items. | Executes Prisma query with `take: 11` (limit + 1). Returns 10 items. `hasNextPage: true`. `nextCursor` is base64 encoded string containing ISO timestamp and ID of 10th item. |
| `PAG-02` | Forward pagination with valid cursor | Request `cursor: <encoded_cursor_10th>`, `limit: 10`. DB has 15 activity items. | Decodes cursor into `cursorAt` and `cursorId`. Applies compound condition `OR: [{ activityAt: { lt: cursorAt } }, { activityAt: cursorAt, id: { lt: cursorId } }]`. Returns remaining 5 items. `hasNextPage: false`, `nextCursor: null`. |
| `PAG-03` | Ordering consistency | Multiple activities share identical timestamp `2026-08-05T10:00:00.000Z`. | Strict compound sorting `activityAt DESC, id DESC`. Ensures zero item skipping or duplication across page boundaries. |
| `PAG-04` | Last page / exact limit count | Request `limit: 10`. DB has exactly 10 activity items. | Returns 10 items. `hasNextPage: false`, `nextCursor: null`. |
| `PAG-05` | Empty result set | DB has 0 activities matching query or cursor is beyond oldest item. | Returns `{ data: [], meta: { limit: 10, hasNextPage: false, nextCursor: null } }`. |
| `PAG-06` | Invalid / malformed cursor payload | Pass `cursor: "invalid-base64-!!! "` or invalid JSON. | Throws `BadRequestException('Invalid pagination cursor format')`. |

### 4.3 Test Suite 3: Activity Filtering (`type`, `startDate`, `endDate`, `q`)

| Test Case ID | Test Case Title | Input / Pre-conditions | Expected Behavior / Assertions |
|---|---|---|---|
| `FIL-01` | Filter by `type: COUPON_USAGE` | Query `type=COUPON_USAGE`. DB contains coupons and bills. | Unified query filters for `type: COUPON_USAGE` (only `CouponIssue` records with `status: USED`). Bill activities excluded. |
| `FIL-02` | Filter by `type: BILL_PAYMENT` | Query `type=BILL_PAYMENT`. | Returns only `Bill` records (`status: APPROVED` / `PENDING`). |
| `FIL-03` | Date range filtering (`startDate` & `endDate`) | Query `startDate=2026-08-01`, `endDate=2026-08-05`. | Parses dates to UTC boundaries reflecting `Asia/Ho_Chi_Minh`. Applies `gte: 2026-07-31T17:00:00.000Z` and `lte: 2026-08-05T16:59:59.999Z` to `activityAt`. |
| `FIL-04` | Search query `q` matching customer name / bill code | Query `q=Nguyen` or `q=BILL-1002`. | Applies case-insensitive substring search `mode: 'insensitive'` across customer name, phone, bill code, or coupon code. |
| `FIL-05` | Combined multi-filter query | Query `type=BILL_PAYMENT&q=VIP&startDate=2026-08-01&limit=5`. | Combines all criteria in Prisma `where.AND` block. |

### 4.4 Test Suite 4: Deduplication of Coupon Usage & Bill Activities

| Test Case ID | Test Case Title | Input / Pre-conditions | Expected Behavior / Assertions |
|---|---|---|---|
| `DEDUP-01` | Correlated Coupon Scan & Bill Payment | Booking `book-1` has `CouponIssue` scanned at 10:00:00 and `Bill` created at 10:05:00 referencing `bookingId: 'book-1'`. | Activity feed consolidates them into **1 primary activity card** (`type: BILL_PAYMENT`) containing linked coupon info in `linkedEntities`. Deduplicates redundant standalone coupon entry. |
| `DEDUP-02` | Standalone Coupon Scan (No linked bill) | `CouponIssue` scanned at 10:00:00, no bill generated. | Displayed as standalone `COUPON_USAGE` activity item. |
| `DEDUP-03` | Direct Bill Payment (No coupon used) | `Bill` created for booking without coupon. | Displayed as standalone `BILL_PAYMENT` activity item. |

### 4.5 Test Suite 5: `GET /partner/activity/:activityId` Detail Fetch & Error Cases

| Test Case ID | Test Case Title | Input / Pre-conditions | Expected Behavior / Assertions |
|---|---|---|---|
| `DET-01` | Successful detail fetch | Pass valid `activityId: "act_bill_789"`. User owns store. | Returns full activity detail object including store name, items breakdown, discount snapshot (`discountVnd`), payment timestamp, and masked customer info. |
| `DET-02` | Activity Not Found (404) | Pass non-existent `activityId: "act_bill_99999"`. | Throws `NotFoundException('Activity not found')`. |
| `DET-03` | Store Ownership Violation (403) | `activityId` belongs to `store-2`. Authenticated user only owns `store-1`. | `accessService.ensureStoreAccess` throws `ForbiddenException`. Endpoint propagates 403 error response. |

### 4.6 Test Suite 6: Authorization & RoleGuard Assertions (Staff 403 vs Partner 200)

| Test Case ID | Test Case Title | Input / Pre-conditions | Expected Behavior / Assertions |
|---|---|---|---|
| `AUTH-01` | Partner Role Access (200 OK) | Request headers with JWT token for `user.role = 'PARTNER'`. | Controller guard passes. Returns HTTP 200 with activity / overview data. |
| `AUTH-02` | Staff Role Restricted Access (403 Forbidden) | Request headers with JWT token for `user.role = 'STAFF'` without `activity.view` permission. | `RolesGuard` / `PermissionsGuard` intercepts request before controller execution and returns HTTP 403 Forbidden. |
| `AUTH-03` | Staff Role Granted Access (200 OK) | Request headers with JWT for `user.role = 'STAFF'` with `activity.view` permission for `store-1`. | Guard passes. Scopes queries strictly to `store-1`. |
| `AUTH-04` | Unauthenticated Request (401 Unauthorized) | No JWT authorization header provided. | `JwtAuthGuard` returns HTTP 401 Unauthorized. |

---

## 5. Mock Setup & Code Snippets for PR2 Implementation

### 5.1 Service Unit Test Setup Code Snippet
```typescript
describe('NightlifeDataService - Partner Activity Contracts', () => {
  let service: NightlifeDataService;
  let prisma: jest.Mocked<PrismaService>;
  let accessService: jest.Mocked<AccessService>;

  beforeEach(async () => {
    // Setup standard mocks matching existing patterns in nightlife-data.service.spec.ts
    accessService.getAccessibleStoreIds.mockResolvedValue(['store-1']);
    accessService.ensureStoreAccess.mockResolvedValue(undefined);
  });

  it('HOME-01: aggregates partner home overview metrics correctly', async () => {
    prisma.bill.aggregate.mockResolvedValue({
      _sum: { totalVnd: 5000000 },
      _count: { id: 10 },
    } as never);
    prisma.booking.count.mockResolvedValue(8);
    prisma.couponIssue.count.mockResolvedValue(4);

    const result = await service.getPartnerHome({ id: 'partner-1', role: 'PARTNER' });

    expect(accessService.getAccessibleStoreIds).toHaveBeenCalledWith(
      { id: 'partner-1', role: 'PARTNER' },
      'store.partner.view',
    );
    expect(result.summary).toEqual({
      totalRevenueVnd: 5000000,
      billCount: 10,
      bookingCount: 8,
      couponUsedCount: 4,
    });
  });

  it('PAG-02: executes forward cursor pagination with compound ordering', async () => {
    const cursor = Buffer.from(
      JSON.stringify({ timestamp: '2026-08-05T10:00:00.000Z', id: 'bill-10' }),
    ).toString('base64');

    prisma.bill.findMany.mockResolvedValue([
      {
        id: 'bill-09',
        createdAt: new Date('2026-08-05T09:30:00.000Z'),
        totalVnd: 1500000,
        storeId: 'store-1',
        store: { name: 'Neon Club' },
        booking: null,
        couponIssue: null,
      },
    ] as never);

    const result = await service.getPartnerActivities(
      { id: 'partner-1', role: 'PARTNER' },
      { cursor, limit: 10 },
    );

    expect(prisma.bill.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        take: 11,
        orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
        where: expect.objectContaining({
          OR: [
            { createdAt: { lt: new Date('2026-08-05T10:00:00.000Z') } },
            {
              createdAt: new Date('2026-08-05T10:00:00.000Z'),
              id: { lt: 'bill-10' },
            },
          ],
        }),
      }),
    );
    expect(result.meta.hasNextPage).toBe(false);
  });
});
```

---

## 6. Conclusion & Recommendations

1. **Test Coverage Strategy**:
   - Write unit tests in NestJS test modules targeting service logic (`NightlifeDataService`) and controller endpoint routing/guards (`NightlifeDataController`).
   - Mock `PrismaService` delegate calls and `AccessService` store permissions.
2. **Stable Pagination Compliance**:
   - Ensure tests enforce compound sorting (`activityAt DESC, id DESC`) to guarantee deterministic pagination without gaps or duplicates.
3. **Data Protection Assertion**:
   - Include PII masking assertions (`phoneMasked`, no raw email/phone in general activity feeds) across all activity test cases.
