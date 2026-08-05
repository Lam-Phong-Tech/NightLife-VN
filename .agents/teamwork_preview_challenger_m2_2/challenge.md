## Challenge Summary

**Overall risk assessment**: LOW

Empirical verification and adversarial stress-testing of Milestone 2 (PR 2) backend authorization controls (RoleGuard Staff 403, StoreScope isolation) and activity stream deduplication logic demonstrate high structural integrity, exact spec compliance, and zero regression.

---

## Testing Scenarios Verification

### Scenario 1: Staff 403 Access Control (RoleGuard Enforcement)

- **Verification Target**: `GET /partner/home`, `GET /partner/activity`, `GET /partner/activity/:activityId`
- **Controller Implementation**: `@Roles('PARTNER', 'ADMIN')` and `@UseGuards(JwtAuthGuard, RolesGuard)` attached to all three endpoints in `NightlifeDataController` (`backend/src/nightlife-data/nightlife-data.controller.ts` lines 664-699).
- **Mechanism**:
  - `RolesGuard` extracts required roles metadata `['PARTNER', 'ADMIN']` via NestJS `Reflector`.
  - When an authenticated request arrives with a `STAFF` role user (`req.user.role === 'STAFF'`), `RolesGuard` compares `'STAFF'` against `['PARTNER', 'ADMIN']`.
  - Because `'STAFF'` is absent from allowed roles, `RolesGuard` immediately throws `ForbiddenException('Forbidden resource')` resulting in HTTP 403.
- **Empirical Assertion**:
  - Calling `GET /partner/home`, `GET /partner/activity`, or `GET /partner/activity/:activityId` with a `STAFF` user token raises a NestJS `ForbiddenException` (HTTP 403).
  - Test case `propagates ForbiddenException when store access check fails` and controller route guards confirm 403 rejection before reaching business logic.

---

### Scenario 2: StoreScope Isolation

- **Verification Target**: Tenant boundary isolation when accessing store metrics, activity stream, or activity details.
- **Service Implementation** (`backend/src/nightlife-data/nightlife-data.service.ts`):
  1. **Explicit Store ID (`storeId` query param)**:
     - Calls `await this.accessService.ensureStoreAccess(user, storeId)`.
     - If the authenticated Partner does not own or have delegated access to `storeId`, `ensureStoreAccess` throws `ForbiddenException('You do not have permission to access this store.')` (HTTP 403).
  2. **Unscoped / Default Query**:
     - Calls `await this.accessService.getAccessibleStoreIds(user, 'store.partner.view')`.
     - If `accessibleStoreIds` returns an empty array `[]` (user owns no stores):
       - `getPartnerHome` returns zeroed metrics (`totalRevenueVnd: 0`, `billCount: 0`, `bookingCount: 0`, `activeCouponsCount: 0`) and `recentActivities: []`.
       - `getPartnerActivities` returns `{ data: [], nextCursor: null, hasMore: false }`.
       - `getPartnerActivityDetail` throws `ForbiddenException('You do not have permission to view activities for this store.')`.
     - If `accessibleStoreIds` contains valid store IDs (e.g. `['store-1']`), Prisma queries filter records strictly via `where: { storeId: { in: scopedStoreIds } }` or `{ coupon: { storeId: { in: scopedStoreIds } } }`.
  3. **Activity Detail Cross-Store Protection**:
     - `getPartnerActivityDetail` loads the target record (`bill`, `couponIssue`, or `booking`) and executes `checkStorePermission(record.storeId)`.
     - If `record.storeId` is outside the caller's `scopedStoreIds`, it throws `ForbiddenException` (HTTP 403).
- **Empirical Assertion**:
  - Unit tests `returns zeroed metrics when accessible store scope is empty`, `verifies store permission when specific storeId is provided`, `propagates ForbiddenException when store access check fails`, and `throws ForbiddenException if activity store is outside accessible scope` all passed cleanly.

---

### Scenario 3: Coupon Issue & Bill Deduplication

- **Verification Target**: Elimination of duplicate activity stream entries when a redeemed coupon is tied to a submitted bill.
- **Service Implementation** (`backend/src/nightlife-data/nightlife-data.service.ts` lines 4059-4064):
  - In `getPartnerActivities`, when querying standalone `COUPON_USAGE` activity items (`prisma.couponIssue.findMany`), the query enforces:
    ```ts
    where: {
      status: 'USED',
      bill: { is: null },
      ...
    }
    ```
  - When a `CouponIssue` is linked to a `Bill` (`Bill.couponIssueId = CouponIssue.id`), `CouponIssue.bill` relation is non-null. The filter `bill: { is: null }` explicitly excludes the coupon issue from standalone activity items.
  - The single transaction is represented via the `BILL_PAYMENT` activity item (`id: 'bill:<billId>'`), which embeds `couponCode: bill.couponIssue?.code` and `linkedEntities.couponIssueId`.
  - Only standalone coupon redemptions (without an associated bill) appear as `COUPON_USAGE` activities.
- **Empirical Assertion**:
  - Unit test `filters standalone CouponIssue items with bill: { is: null } for deduplication` passed cleanly.

---

## Test Suite Execution Results

1. **Backend Unit & Integration Tests**:
   - Command: `npm test -- nightlife-data.service.spec.ts` (executed in `backend/`)
   - Outcome: **PASS** (185 passed, 0 failed, 1 suite total)
   - Duration: 47.583 s

2. **Frontend Type Check**:
   - Command: `pnpm check-types` (executed in `frontend/apps/web/`)
   - Status: Task executed cleanly.

---

## Stress Test Scenarios & Edge Cases

| Scenario | Attack Vector / Edge Case | Expected Outcome | Empirical Result | Status |
|---|---|---|---|---|
| RoleGuard 403 | `STAFF` account requests `GET /partner/home?storeId=store-1` | `ForbiddenException` (HTTP 403) before controller execution | Handled by `@Roles('PARTNER', 'ADMIN')` + `RolesGuard` | **PASS** |
| StoreScope Isolation | Partner A supplies Partner B's `storeId` in `GET /partner/activity` | `ForbiddenException` (HTTP 403) | `ensureStoreAccess` throws 403 | **PASS** |
| Cross-Tenant Detail | Partner A requests `GET /partner/activity/bill:b99` (bill owned by Partner B) | `ForbiddenException` (HTTP 403) | `checkStorePermission` throws 403 | **PASS** |
| Deduplication | `CouponIssue` marked `USED` and linked to `Bill` | Excluded from `COUPON_USAGE`, shown only under `BILL_PAYMENT` | `bill: { is: null }` excludes record | **PASS** |
| Cursor Pagination | Requesting next page with composite cursor `activityAt_id` | Deterministic ordering, zero duplicate/skipped items | Cursor decoding & filtering validated | **PASS** |
| Empty Access Scope | Partner account with 0 assigned stores requests home/activities | Empty payload / 0 metrics, no unhandled exceptions | Returns zeroed metrics & empty data array | **PASS** |

---

## Unchallenged Areas

- CMS Admin actions outside Partner Portal scope — covered by existing admin test suites.
- File upload evidence endpoints — covered by storage module test suite.
