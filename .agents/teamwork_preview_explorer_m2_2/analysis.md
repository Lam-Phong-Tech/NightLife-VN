# Technical Analysis Report — Milestone 2 (PR 2: Backend Activity Contracts & Stable Pagination)

**Role:** `teamwork_preview_explorer` (PR2 Controller, DTO & Pagination Explorer)  
**Working Directory:** `d:\laragon\www\NightLife-VN\.agents\teamwork_preview_explorer_m2_2\`  
**Date:** 2026-08-05  

---

## Executive Summary

This report establishes the complete technical design for Milestone 2 (PR 2: Backend Activity Contracts & Stable Pagination). Currently, `partner-activity-query.dto.ts` is missing in `backend/src/nightlife-data/dto/`, and endpoints `GET /partner/home`, `GET /partner/activity`, and `GET /partner/activity/:activityId` are not yet declared in `nightlife-data.controller.ts`. This document specifies the DTO validation rules, compound cursor pagination scheme (`activityAt DESC, id DESC`), activity deduplication, Swagger contracts, controller routes, and StoreScope / RoleGuard security constraints (enforcing HTTP 403 for `STAFF` roles on partner management endpoints).

---

## 1. DTO Design & Stable Cursor Specification (`partner-activity-query.dto.ts`)

### 1.1 Field Definitions and Validation Rules

File location to create: `backend/src/nightlife-data/dto/partner-activity-query.dto.ts`

```typescript
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDateString, IsIn, IsInt, IsOptional, IsString, IsUUID, Max, Min } from 'class-validator';

export class PartnerActivityQueryDto {
  @ApiPropertyOptional({
    description: 'Base64-encoded compound cursor tuple containing { activityAt: string, id: string }',
  })
  @IsOptional()
  @IsString()
  cursor?: string;

  @ApiPropertyOptional({ description: 'Number of items to return per page', default: 20, minimum: 1, maximum: 100 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 20;

  @ApiPropertyOptional({
    description: 'Filter by activity type',
    enum: ['ALL', 'BOOKING', 'BILL', 'COUPON_SCAN'],
    default: 'ALL',
  })
  @IsOptional()
  @IsString()
  @IsIn(['ALL', 'BOOKING', 'BILL', 'COUPON_SCAN'])
  type?: string = 'ALL';

  @ApiPropertyOptional({ description: 'Start date boundary (ISO 8601 string, e.g. 2026-08-01)' })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({ description: 'End date boundary (ISO 8601 string, e.g. 2026-08-31)' })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiPropertyOptional({ description: 'Search keyword matching bill number, booking code, customer name or phone' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ description: 'Optional explicit store ID (must belong to partner account)' })
  @IsOptional()
  @IsString()
  @IsUUID()
  storeId?: string;
}
```

### 1.2 Compound Cursor Encoding & Decoding

- **Tuple Definition**: `{ activityAt: string (ISO 8601), id: string (UUID) }`
- **Primary Order**: `activityAt DESC`
- **Secondary Order**: `id DESC` (guarantees strict total ordering when multiple activities occur within the same millisecond).
- **Encoding Implementation**:
  ```typescript
  export function encodeCursor(activityAt: Date | string, id: string): string {
    const isoDate = activityAt instanceof Date ? activityAt.toISOString() : activityAt;
    const payload = JSON.stringify({ activityAt: isoDate, id });
    return Buffer.from(payload, 'utf-8').toString('base64url');
  }
  ```
- **Decoding Implementation**:
  ```typescript
  export interface DecodedCursor {
    activityAt: string;
    id: string;
  }

  export function decodeCursor(cursorString?: string): DecodedCursor | null {
    if (!cursorString) return null;
    try {
      const decoded = Buffer.from(cursorString, 'base64url').toString('utf-8');
      const parsed = JSON.parse(decoded);
      if (parsed && typeof parsed.activityAt === 'string' && typeof parsed.id === 'string') {
        return { activityAt: parsed.activityAt, id: parsed.id };
      }
      return null;
    } catch {
      return null;
    }
  }
  ```

### 1.3 Compound Cursor Database Filtering

When `decodedCursor` is present:
```typescript
const cursorFilter = decodedCursor ? {
  OR: [
    { activityAt: { lt: new Date(decodedCursor.activityAt) } },
    {
      activityAt: new Date(decodedCursor.activityAt),
      id: { lt: decodedCursor.id },
    },
  ],
} : {};
```

### 1.4 Activity Event Deduplication Strategy

In NightLife-VN's relational model:
- A customer scans a coupon -> `CouponIssue` marked `USED` (`usedAt`).
- A `Bill` is submitted/approved referencing `couponIssueId` and `bookingId`.
- A `Booking` is created/completed referencing `couponIssueId`.

**Deduplication Rule**:
1. When generating the unified activity feed from `Bill`, `Booking`, and `CouponIssue`:
   - If a `Bill` references a `couponIssueId`, suppress the standalone `COUPON_SCAN` activity item if its scan time is within 15 minutes of the bill submission.
   - If a `Bill` references a `bookingId`, merge booking details directly into the `BILL` activity payload rather than returning separate redundant cards.
2. Unified Activity Schema:
   ```typescript
   export interface PartnerActivityItem {
     id: string; // Activity ID (Bill ID, Booking ID, or CouponIssue ID)
     type: 'BOOKING' | 'BILL' | 'COUPON_SCAN';
     activityAt: string; // ISO Timestamp used for sorting
     storeId: string;
     storeName: string;
     title: string;
     subtitle?: string;
     status: string;
     amountVnd?: number | null;
     customerName?: string;
     customerPhone?: string;
     referenceCode?: string; // Bill Number, Booking Code, or Coupon Code
     rawDetails: {
       billId?: string;
       bookingId?: string;
       couponIssueId?: string;
     };
   }
   ```

---

## 2. Controller Routing & Contracts (`nightlife-data.controller.ts` & `nightlife-data.contract.ts`)

### 2.1 API Endpoint Declarations in Controller

Add to `backend/src/nightlife-data/nightlife-data.controller.ts`:

```typescript
  @ApiOperation({ summary: 'Partner Portal: Get home summary metrics and recent activities' })
  @Roles('PARTNER', 'ADMIN')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get('partner/home')
  getPartnerHomeSummary(
    @Req() request: RequestWithUser,
    @Query('storeId') storeId?: string,
  ) {
    return this.nightlifeDataService.getPartnerHomeSummary(request.user, storeId);
  }

  @ApiOperation({ summary: 'Partner Portal: List partner activities with stable cursor pagination' })
  @Roles('PARTNER', 'ADMIN')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get('partner/activity')
  listPartnerActivities(
    @Req() request: RequestWithUser,
    @Query() query: PartnerActivityQueryDto,
  ) {
    return this.nightlifeDataService.listPartnerActivities(request.user, query);
  }

  @ApiOperation({ summary: 'Partner Portal: Get single activity detail by ID' })
  @Roles('PARTNER', 'ADMIN')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get('partner/activity/:activityId')
  getPartnerActivityDetail(
    @Req() request: RequestWithUser,
    @Param('activityId') activityId: string,
    @Query('storeId') storeId?: string,
  ) {
    return this.nightlifeDataService.getPartnerActivityDetail(
      request.user,
      activityId,
      storeId,
    );
  }
```

### 2.2 Contract Decorators in `nightlife-data.contract.ts`

Define explicit OpenAPI contracts:
- `PartnerHomeSummaryContract()`
- `PartnerActivitiesContract()`
- `PartnerActivityDetailContract()`

---

## 3. Authorization, StoreScope & Guard Enforcement

### 3.1 StoreScope Access Control

1. **Access Service Integration**:
   ```typescript
   const accessibleStoreIds = await this.accessService.getAccessibleStoreIds(user, 'store.partner.view');
   ```
2. **Explicit Store Filtering**:
   - If `query.storeId` is provided by caller:
     ```typescript
     await this.accessService.ensureStoreAccess(user, query.storeId);
     const targetStoreId = query.storeId;
     ```
   - If `query.storeId` is omitted:
     - Filter queries by `storeId: { in: accessibleStoreIds }`.
     - If `accessibleStoreIds` is empty, return empty dataset (`{ data: [], meta: { limit, nextCursor: null, hasMore: false } }`).

### 3.2 RoleGuard & Staff Permissions (403 Forbidden Enforcement)

- **Requirement**: Return `403 Forbidden` for `STAFF` role attempts to access partner management endpoints `/partner/home`, `/partner/activity`, `/partner/activity/:activityId`.
- **Implementation Mechanism**:
  Decorate endpoints with `@Roles('PARTNER', 'ADMIN')` and `@UseGuards(JwtAuthGuard, RolesGuard)`.
  In `RolesGuard.canActivate()`:
  - `requiredRoles = ['PARTNER', 'ADMIN']`
  - For `STAFF` users, `request.user.role === 'STAFF'` is NOT contained in `['PARTNER', 'ADMIN']`.
  - `RolesGuard` returns `false`, causing NestJS to throw a standard `ForbiddenException` (HTTP 403).
- **Contrast with Operational Endpoints**:
  Operational endpoints like `/partner/coupon-issues/:code/scan` use `@Roles('PARTNER', 'STAFF', 'ADMIN', 'OPERATOR')` and `@ActionPolicy('canScanCoupon')`, allowing `STAFF` with delegated store permissions to execute scans. Management endpoints `/partner/home` and `/partner/activity` strictly restrict access to `PARTNER` and `ADMIN`.

---

## 4. Proposed Implementation Blueprint for Worker

1. **File 1**: Create `backend/src/nightlife-data/dto/partner-activity-query.dto.ts` containing DTO definition, cursor encoder/decoder, and activity item interfaces.
2. **File 2**: Create `backend/src/nightlife-data/dto/partner-activity-query.dto.spec.ts` testing DTO validation (valid/invalid limit, dates, cursor string).
3. **File 3**: Update `backend/src/nightlife-data/nightlife-data.contract.ts` with Swagger documentation contracts.
4. **File 4**: Update `backend/src/nightlife-data/nightlife-data.controller.ts` with route handlers `@Get('partner/home')`, `@Get('partner/activity')`, `@Get('partner/activity/:activityId')`.
5. **File 5**: Implement service logic in `backend/src/nightlife-data/nightlife-data.service.ts` (`getPartnerHomeSummary`, `listPartnerActivities`, `getPartnerActivityDetail`).
6. **File 6**: Add unit tests in `backend/src/nightlife-data/nightlife-data.service.spec.ts` covering:
   - Paginated activity query with `nextCursor`.
   - StoreScope validation (accessing another store -> `403 Forbidden`).
   - RoleGuard check (`STAFF` user -> `403 Forbidden`).
   - Event deduplication (Bill with coupon issue merges coupon scan entry).

---

## 5. Verification Method

1. **DTO Validation Test**:
   ```bash
   npx jest backend/src/nightlife-data/dto/partner-activity-query.dto.spec.ts
   ```
2. **Service & Controller Test**:
   ```bash
   npx jest backend/src/nightlife-data/nightlife-data.service.spec.ts -t "listPartnerActivities"
   ```
3. **Full Suite Typecheck & Test Verification**:
   ```bash
   pnpm --filter backend check-types
   pnpm --filter backend test
   ```
