# Quality & Precision Code Review Report — Milestone 2 (PR 2)

**Target Milestone**: Milestone 2 (PR 2: Backend Activity Contracts & Stable Pagination)  
**Reviewer**: teamwork_preview_reviewer (PR2 Precision Reviewer & Adversarial Critic)  
**Verdict**: **APPROVE**  

---

## 1. Review Summary

The implementation of **Milestone 2 (PR 2: Backend Activity Contracts & Stable Pagination)** has been thoroughly reviewed across correctness, security, multi-tenant store scoping, performance, and contract compliance.

All verification commands executed cleanly with zero errors:
- **Backend Unit Tests**: `npm test -- nightlife-data.service.spec.ts` — **PASSED** (185/185 tests passed, 100% pass rate).
- **Frontend Typecheck**: `pnpm check-types` in `frontend/apps/web` — **PASSED** (0 errors).

---

## 2. Detailed Dimension Findings

### 2.1 Correctness & API Endpoints
- **DTO Validation (`PartnerActivityQueryDto`)**:
  - `limit`: Validated with `@IsInt()`, `@Min(1)`, `@Max(50)`, default 20.
  - `cursor`: Validated as base64 string. Handled gracefully by `decodeCursor`.
  - `type`: Restricted via `@IsIn(['ALL', 'COUPON_USAGE', 'BILL_PAYMENT', 'BOOKING_CHECKIN'])`.
  - `startDate` & `endDate`: Validated via `@IsDateString()`.
  - `search` & `storeId`: Validated via `@IsString()`.
- **Cursor Encoding/Decoding (`encodeCursor` / `decodeCursor`)**:
  - Opaque tokens are base64-encoded strings of format `<activityAt_iso>_<id>`.
  - Malformed cursors return `null` and fall back to top-of-feed without crashing or throwing 500.
- **GET `/partner/home`**:
  - Correctly aggregates metrics: total revenue from `VERIFIED` and `PAID` bills (`_sum.totalVnd`), non-draft bill count, total booking count, active coupon issues (`ISSUED` status).
  - Fetches top 5 recent activities for authorized store scope.
  - Returns zeroed metrics when accessible store scope is empty.
- **GET `/partner/activity`**:
  - Implements compound ordering `(activityAt DESC, id DESC)` across streams (`BILL`, `COUPON_ISSUE`, `BOOKING`).
  - Correctly deduplicates coupon usages: Standalone `CouponIssue` items (`status = USED`) are filtered with `bill: { is: null }` so bill-linked coupon scan events are merged under `BILL` activity feed items.
- **GET `/partner/activity/:activityId`**:
  - Handles prefixed activity IDs (`bill:<id>`, `coupon:<id>`, `booking:<id>`) and raw UUID fallback.
  - Validates store ownership per entity; throws `NotFoundException` (404) or `ForbiddenException` (403) as required.

### 2.2 Security & Guard Enforcement
- **Role Authorization**:
  - Controller methods `@Get('partner/home')`, `@Get('partner/activity')`, `@Get('partner/activity/:activityId')` are decorated with `@Roles('PARTNER', 'ADMIN')` and `@UseGuards(JwtAuthGuard, RolesGuard)`.
  - Accounts with role `STAFF` calling these management endpoints are rejected by `RolesGuard` with HTTP 403 Forbidden.
- **Integrity Inspection**:
  - No hardcoded test responses, dummy facade implementations, or cheating shortcuts detected.

### 2.3 Multi-tenant Store Scoping
- Scope resolution uses `AccessService.ensureStoreAccess(user, storeId)` when explicit `storeId` is passed, and `AccessService.getAccessibleStoreIds(user, 'store.partner.view')` when `storeId` is omitted.
- Store ownership isolation is strictly enforced across multi-tenant partner accounts.

---

## 3. Verified Claims

| Claim | Verification Method | Result |
|---|---|---|
| All 185 unit tests in backend spec pass | `npm test -- nightlife-data.service.spec.ts` in `backend/` | **PASS** (185/185) |
| Frontend TypeScript compilation succeeds without errors | `pnpm check-types` in `frontend/apps/web/` | **PASS** (0 errors) |
| `@Roles('PARTNER', 'ADMIN')` blocks `STAFF` with 403 Forbidden | Inspection of `nightlife-data.controller.ts` & `RolesGuard` logic | **PASS** |
| Keyset cursor pagination uses stable compound tie-breaking | Inspection of `decodeCursor`, `encodeCursor`, and merge-sort logic in `nightlife-data.service.ts` | **PASS** |
| Deduplication of coupon scans with bill | `bill: { is: null }` query filter on `CouponIssue` | **PASS** |

---

## 4. Adversarial Challenge & Stress-Test Summary

- **Attack Scenario 1: Malformed or Tampered Cursor Token**
  - *Test*: Supplying invalid base64 string or string without separator.
  - *Result*: `decodeCursor` catches parsing error, returns `null`, service defaults to starting page safely without error leakage.
- **Attack Scenario 2: Timestamp Collision in Keyset Pagination**
  - *Test*: Multiple activity items share exact same millisecond timestamp.
  - *Result*: Tie-breaker `item.id < decodedCursor.id` prevents missing or duplicated entries.
- **Attack Scenario 3: Cross-tenant Store Query Injection**
  - *Test*: Partner user passes `storeId` belonging to another partner.
  - *Result*: `AccessService.ensureStoreAccess` throws `ForbiddenException`.

---

## 5. Final Recommendation

**Verdict**: **APPROVE**  
The Milestone 2 (PR 2) implementation meets all functional, architectural, security, and verification requirements. Proceed to Milestone 3.
