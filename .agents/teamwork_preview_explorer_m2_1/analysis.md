# PR 2: Backend Activity Contracts & Stable Pagination Analysis Report

## Executive Summary
This document provides a technical investigation into the backend service architecture and database models required for **Milestone 2 (PR 2: Backend Activity Contracts & Stable Pagination)** of the NightLife-VN project. 

The primary objectives of PR 2 are:
1. Exposing unified partner activity endpoints: `GET /partner/home`, `GET /partner/activity`, and `GET /partner/activity/:activityId`.
2. Implementing strict deduplication between scanned/used coupons (`CouponIssue` with status `USED`) and submitted/settled bills (`Bill` records).
3. Defining a stable keyset cursor pagination mechanism ordered by `(activityAt DESC, id DESC)` to prevent feed shifts and duplicate renders.
4. Enforcing multi-tenant store authorization (`StoreScope`) and Staff privilege guards (`RoleGuard`, returning 403 Forbidden on unauthorized store access).

---

## 1. Data Sources and Aggregation Logic

### 1.1 Overview of Underlying Prisma Data Models
Partner activities originate from two primary database tables in `backend/prisma/schema.prisma`:

| Model | Prisma Table | Relevant Fields & Relations | Activity Triggers & Event Types |
|---|---|---|---|
| `Bill` | `bills` | `id`, `billNumber`, `storeId`, `bookingId`, `userId`, `guestId`, `couponIssueId`, `status`, `subtotalVnd`, `discountVnd`, `totalVnd`, `usedAt`, `submittedAt`, `createdAt`, `user`, `guest`, `couponIssue` | `BILL_SUBMIT` (status: `SUBMITTED`, `PENDING_PM_BA`)<br>`BILL_SETTLEMENT` (status: `VERIFIED`, `PAID`, `REJECTED`, `VOIDED`) |
| `CouponIssue` | `coupon_issues` | `id`, `code`, `couponId`, `userId`, `guestId`, `scannedById`, `status`, `usedAt`, `expiresAt`, `createdAt`, `user`, `guest`, `coupon`, `booking`, `bill` | `COUPON_USE` (status: `USED`) |
| `Booking` | `bookings` | `id`, `bookingCode`, `storeId`, `userId`, `guestId`, `status`, `scheduledAt`, `partySize`, `createdAt` | `BOOKING_CHECKIN` (status: `CHECKED_IN`, `COMPLETED`) |

---

### 1.2 Aggregation & Data Flow for Endpoints

#### Endpoint 1: `GET /partner/home`
- **Purpose**: Home dashboard overview statistics and recent activity stream for partner portal.
- **Parameters**:
  - `storeId` (optional string): Filter statistics and activities for a specific store.
  - `period` (optional string): `'today'` | `'seven'` | `'thirty'` (defaults to `'seven'`).
- **Data Aggregation Logic**:
  1. Resolve target stores using `accessService.getAccessibleStoreIds(user, 'store.partner.view')`.
  2. Compute Overview Stats for the window `[from, to]`:
     - `totalBookings`: `prisma.booking.count({ where: { storeId: { in: scopedStoreIds }, createdAt: { gte: from, lte: to } } })`
     - `totalBills`: `prisma.bill.count({ where: { storeId: { in: scopedStoreIds }, submittedAt: { gte: from, lte: to } } })`
     - `totalRevenueVnd`: `prisma.bill.aggregate({ _sum: { totalVnd: true }, where: { storeId: { in: scopedStoreIds }, status: { in: ['VERIFIED', 'PAID'] }, usedAt/paidAt: { gte: from, lte: to } } })`
     - `totalDiscountVnd`: `prisma.bill.aggregate({ _sum: { discountVnd: true }, where: { storeId: { in: scopedStoreIds }, status: { in: ['VERIFIED', 'PAID'] } } })`
     - `usedCouponsCount`: Total unique coupon usages (deduplicated against bills).
  3. Retrieve `recentActivities`:
     - Fetch top 5-10 latest deduplicated activity items sorted by `(activityAt DESC, id DESC)`.
- **Response Format**:
  ```json
  {
    "period": "seven",
    "from": "2026-07-29T00:00:00.000Z",
    "to": "2026-08-05T23:59:59.999Z",
    "overviewStats": {
      "totalBookings": 12,
      "totalBills": 8,
      "totalRevenueVnd": 15400000,
      "totalDiscountVnd": 1200000,
      "usedCouponsCount": 5,
      "checkedInCount": 10
    },
    "recentActivities": [ ...ActivityItemDTOs... ],
    "privacy": {
      "customerDetailVisible": true,
      "note": "Partner store scoped activity overview."
    }
  }
  ```

---

#### Endpoint 2: `GET /partner/activity`
- **Purpose**: Paginated list of partner activities combining bills and standalone coupon uses with stable keyset cursor.
- **DTO (`PartnerActivityQueryDto`) Parameters**:
  - `storeId` (optional string): Filter by specific store UUID.
  - `type` (optional enum): `'ALL'` | `'COUPON_USE'` | `'BILL_SUBMIT'` | `'BILL_SETTLEMENT'` | `'BOOKING_CHECKIN'`.
  - `status` (optional string): Filter by status (e.g. `'VERIFIED'`, `'USED'`, `'SUBMITTED'`).
  - `search` (optional string): Search string against bill number, coupon code, customer name, or phone.
  - `from` / `to` (optional ISO dates): Date range filter.
  - `limit` (optional integer): Defaults to 20, max 100.
  - `cursor` (optional string): Base64-encoded cursor token (`<activityAt_iso>_<id>`).
- **Response Format**:
  ```json
  {
    "data": [
      {
        "id": "bill:b9f2d1a3-0000-4000-8000-123456789abc",
        "rawId": "b9f2d1a3-0000-4000-8000-123456789abc",
        "sourceType": "BILL",
        "activityType": "BILL_SETTLEMENT",
        "activityAt": "2026-08-05T12:30:00.000Z",
        "storeId": "s1111111-0000-4000-8000-123456789abc",
        "storeName": "Night Club Saigon",
        "customerName": "Nguyen Van A",
        "customerPhone": "0901234567",
        "customerTier": "VIP",
        "summary": "Hóa đơn HD-10042 • 2.500.000đ (Giảm 250.000đ)",
        "totalVnd": 2500000,
        "discountVnd": 250000,
        "couponCode": "VIP10",
        "billNumber": "HD-10042",
        "status": "VERIFIED",
        "statusLabel": "Đã duyệt",
        "badgeTone": "success"
      }
    ],
    "pagination": {
      "nextCursor": "MjAyNi0wOC0wNVQxMDowMDowMC4wMDBaX2NvdXBvbjpjMTExMTExMS0wMDAwLTQwMDAtODAwMC0xMjM0NTY3ODlhYmM=",
      "hasMore": true,
      "limit": 20
    }
  }
  ```

---

#### Endpoint 3: `GET /partner/activity/:activityId`
- **Purpose**: Detailed view of a single activity item.
- **Identifier Handling**:
  - Accepts prefixed ID (e.g. `bill:<uuid>` or `coupon:<uuid>`) or raw UUID (searches `Bill` first, then `CouponIssue`).
- **Response Format**:
  - Detailed object combining store metadata, customer profile snapshot, bill financial breakdowns (`subtotalVnd`, `discountVnd`, `serviceChargeVnd`, `taxVnd`, `totalVnd`, `paidVnd`), linked coupon code/snapshot, booking details, and reviewer/actor info.

---

## 2. Deduplication Logic Between Used Coupons and Bills

### 2.1 Problem Description
In the database schema:
- A `CouponIssue` is created when a coupon is issued or scanned. When scanned at the store, its `status` transitions to `USED`, and `usedAt` is set.
- When a `Bill` is created for that booking/visit, `Bill.couponIssueId` is linked directly to `CouponIssue.id` (1-to-1 relation `@unique`).
- If an activity feed naively queries both `CouponIssue` (where `status = 'USED'`) and `Bill` (where `status != 'DRAFT'`), transactions that involved a coupon will generate **two separate activity items** for the exact same physical visit:
  1. A `COUPON_USE` activity item from `CouponIssue`.
  2. A `BILL_SUBMIT` / `BILL_SETTLEMENT` activity item from `Bill`.

---

### 2.2 Deduplication Invariant & SQL/Prisma Filter Rule

#### Core Rule:
- When a `CouponIssue` is linked to a `Bill` (`CouponIssue.bill != null` or `Bill.couponIssueId = CouponIssue.id`), the transaction's activity representation is **exclusively owned by the `Bill` record**.
- The `Bill` activity contains complete financial context (total amount, discount snapshot, bill status lifecycle).
- **Standalone `CouponIssue` usages** are defined as `CouponIssue` records with `status = USED` WHERE **no associated `Bill` exists** (`bill IS NULL`).

#### Prisma Query Filter:
- For `Bill` Activities:
  ```typescript
  where: {
    storeId: { in: scopedStoreIds },
    status: { in: ['SUBMITTED', 'PENDING_PM_BA', 'VERIFIED', 'REJECTED', 'PAID', 'VOIDED'] }
  }
  ```
- For Standalone `CouponIssue` Activities:
  ```typescript
  where: {
    coupon: { storeId: { in: scopedStoreIds } },
    status: 'USED',
    bill: { is: null } // Explicit Prisma filter for 0-to-1 relation exclusion
  }
  ```

#### Deduplication Truth Matrix:

| Case | `CouponIssue.status` | `Bill` Record Linked? | Activity Generator | Produced Activity Type |
|---|---|---|---|---|
| 1 | `USED` | Yes (`Bill.couponIssueId = id`) | `Bill` query only | `BILL_SUBMIT` or `BILL_SETTLEMENT` (with coupon details attached) |
| 2 | `USED` | No (`bill: null`) | `CouponIssue` query | `COUPON_USE` (Standalone coupon scan) |
| 3 | `ISSUED` | No | None (not used yet) | None |
| 4 | N/A | Direct Bill (`couponIssueId: null`) | `Bill` query | `BILL_SUBMIT` or `BILL_SETTLEMENT` |

---

## 3. Activity Mapping Schema, Types & Keyset Cursor Pagination

### 3.1 Activity Mapping Schema & Types

```typescript
export type PartnerActivityType =
  | 'COUPON_USE'
  | 'BILL_SUBMIT'
  | 'BILL_SETTLEMENT'
  | 'BOOKING_CHECKIN';

export type PartnerActivitySourceType = 'BILL' | 'COUPON_ISSUE';

export interface PartnerActivityItem {
  id: string;                         // Prefix-qualified ID e.g. "bill:<uuid>" or "coupon:<uuid>"
  rawId: string;                      // Database UUID
  sourceType: PartnerActivitySourceType;
  activityType: PartnerActivityType;
  activityAt: string;                 // ISO 8601 string
  storeId: string;
  storeName: string;
  customerName: string;
  customerPhone?: string;
  customerTier?: string;
  summary: string;
  totalVnd?: number;
  discountVnd?: number;
  couponCode?: string;
  billNumber?: string;
  status: string;
  statusLabel: string;
  badgeTone: 'success' | 'warning' | 'danger' | 'info';
}
```

---

### 3.2 Stable Keyset Cursor Pagination (`activityAt DESC, id DESC`)

#### Why Keyset Pagination?
Offsets break when new events arrive concurrently during scrolling. Keyset cursors provide deterministic, O(1) index-backed pagination.

#### Cursor Format:
- Token format: `<ISO_TIMESTAMP>_<COMPOSITE_ID>`
- Example: `2026-08-05T14:30:00.000Z_bill:b9f2d1a3-0000-4000-8000-123456789abc`
- Transmitted as base64-encoded string in `cursor` query param.

#### Compound Sorting & Merging Logic:
Because activity items are fetched from two separate Prisma tables (`bills` and `coupon_issues`), pagination uses a two-stream merge-sort algorithm:
1. Parse cursor into `(cursorTime: Date, cursorId: string)`.
2. Fetch up to `limit + 1` records from `bills` where `(usedAt/submittedAt < cursorTime) OR (usedAt/submittedAt = cursorTime AND id < cursorIdRaw)` ordered by timestamp DESC, id DESC.
3. Fetch up to `limit + 1` records from `coupon_issues` (`bill: { is: null }`) where `(usedAt < cursorTime) OR (usedAt = cursorTime AND id < cursorIdRaw)` ordered by usedAt DESC, id DESC.
4. Map both record sets into `PartnerActivityItem[]`.
5. Merge-sort the two streams using strict comparator:
   ```typescript
   function compareActivity(a: PartnerActivityItem, b: PartnerActivityItem): number {
     const tA = new Date(a.activityAt).getTime();
     const tB = new Date(b.activityAt).getTime();
     if (tA !== tB) return tB - tA; // DESC
     return b.id.localeCompare(a.id); // DESC
   }
   ```
6. Take the top `limit` items for `data`.
7. If merged results length > `limit`, set `hasMore = true` and build `nextCursor` from the `limit`-th item.

---

## 4. Store Scope & Role Security Analysis

### 4.1 Multi-Tenant Store Scoping (`AccessService`)
- Endpoints must resolve accessible stores via `accessService.getAccessibleStoreIds(user, 'store.partner.view')`.
- If `accessibleStoreIds` is empty (`[]`), return empty list or zeroed stats immediately.
- If specific `storeId` parameter is passed:
  - Verify `accessibleStoreIds === null` (Admin) OR `accessibleStoreIds.includes(storeId)`.
  - If unauthorized, throw `ForbiddenException('You do not have permission to access activities for this store.')`.

### 4.2 Staff Role Restrictions
- User role `STAFF` is assigned to a specific store via `StorePermission`.
- Attempting to query `/partner/activity?storeId=<other_store_id>` MUST return HTTP 403 Forbidden.

---

## 5. Implementation Files Checklist for PR 2

| File Path | Role in PR 2 |
|---|---|
| `backend/src/nightlife-data/dto/partner-activity-query.dto.ts` | New DTO defining query filters, pagination, cursor validation |
| `backend/src/nightlife-data/nightlife-data.controller.ts` | Add `@Get('partner/home')`, `@Get('partner/activity')`, `@Get('partner/activity/:activityId')` |
| `backend/src/nightlife-data/nightlife-data.service.ts` | Implement `getPartnerHome()`, `getPartnerActivities()`, `getPartnerActivityById()` |
| `backend/src/nightlife-data/nightlife-data.service.spec.ts` | Unit tests for deduplication, stable cursor sorting, store scoping, Staff 403 checks |
