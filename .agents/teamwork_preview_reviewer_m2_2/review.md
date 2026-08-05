# Review Report — Milestone 2 (PR 2: Backend Activity Contracts & Stable Pagination)

**Verdict**: **REQUEST_CHANGES**

---

## 1. Review Summary
Milestone 2 (PR 2) introduces backend activity contracts (`GET /partner/home`, `GET /partner/activity`, `GET /partner/activity/:activityId`), DTO validation (`PartnerActivityQueryDto`), base64 cursor encoding/decoding, access control via `RolesGuard` and `AccessService`, and standalone coupon deduplication (`bill: { is: null }`).

While basic happy-path unit tests pass (185/185), an in-depth edge-case and performance analysis revealed **two major technical defects** in the cursor pagination and timezone boundary handling. Specifically, deep pagination truncates prematurely at 60 items due to missing database-level cursor filtering, and date queries misalign with `Asia/Ho_Chi_Minh` timezone boundaries (+7 offset).

---

## 2. Findings & Findings Breakdown

### [Major] Finding 1: Keyset Cursor Deep Pagination Truncation Defect
- **Location**: `backend/src/nightlife-data/nightlife-data.service.ts` (lines 3991–4206)
- **What**: In `getPartnerActivities()`, database `findMany` queries for `Bill`, `CouponIssue`, and `Booking` do **not** include cursor conditions (e.g. `submittedAt: { lte: cursorTime }`) in their Prisma `where` clause. Every request always queries `take: limit * 3` from offset 0 (the top newest records).
- **Why**: When a client requests page 2, 3, 4, etc. using `cursor`:
  1. The DB queries re-fetch the exact same top 60 records (for `limit = 20`).
  2. The in-memory filter (`allActivities.filter(...)`) filters out all items newer than or equal to `decodedCursor`.
  3. By page 4 (item index > 60), ALL 60 items returned from the database are dropped by the in-memory filter.
  4. `allActivities` becomes empty (`[]`), causing `getPartnerActivities` to return `hasMore: false` and `data: []`.
- **Impact**: Any store with > 60 total activities cannot load activity history past the 60th record (for default `limit = 20`). Deep pagination is broken and truncates prematurely.
- **Suggestion**: Pass cursor conditions into individual Prisma `findMany` queries (e.g., `where: { ...where, OR: [{ submittedAt: { lt: cursorTime } }, { submittedAt: cursorTime, id: { lt: cursorId } }] }`), OR construct a database UNION / query helper to handle cursor pagination properly at the database level.

---

### [Major] Finding 2: Naive Date Boundary Timezone Misalignment (`Asia/Ho_Chi_Minh`)
- **Location**: `backend/src/nightlife-data/nightlife-data.service.ts` (lines 3984–3985, 3997–4004)
- **What**: `startDate` and `endDate` query parameters are converted directly using `new Date(dto.startDate)` without applying timezone offset conversion for `Asia/Ho_Chi_Minh` (+07:00).
- **Why**:
  1. Input string `startDate = "2026-08-05"` is parsed by `new Date()` as UTC midnight (`2026-08-05T00:00:00.000Z`).
  2. In Vietnam time (`Asia/Ho_Chi_Minh`), `2026-08-05T00:00:00.000Z` corresponds to `07:00:00` AM on August 5th.
  3. Activities that occurred between 00:00:00 AM and 06:59:59 AM VN time on August 5th (UTC `2026-08-04T17:00:00Z` to `2026-08-04T23:59:59Z`) are **incorrectly excluded** from the query result.
  4. Similarly, `endDate = "2026-08-05"` cuts off at 07:00:00 AM VN time instead of including the full VN day (until `2026-08-05T23:59:59+07:00`).
- **Impact**: Financial and activity reports filtered by date range omit early morning events or cut off late evening events in Vietnam local time.
- **Suggestion**: Use a timezone helper (e.g., leveraging existing `DEFAULT_REVENUE_REPORT_TIMEZONE = 'Asia/Ho_Chi_Minh'` logic) to normalize YYYY-MM-DD input strings to exact `Asia/Ho_Chi_Minh` start-of-day (`00:00:00.000+07:00`) and end-of-day (`23:59:59.999+07:00`) UTC Date instances before querying Prisma.

---

## 3. Review Dimensions Verification

| Criteria | Status | Details |
|---|---|---|
| **Stable Keyset Sorting** | PASS (In-Memory) | `(activityAt DESC, id DESC)` tie-breaking correctly implemented in JS sort comparator `b.id.localeCompare(a.id)`. |
| **Cursor Base64 Token** | PASS | `encodeCursor` & `decodeCursor` handle `<activityAt_iso>_<id>` formatting and safely catch malformed inputs, falling back gracefully to `null`. |
| **Deduplication (`CouponIssue` vs `Bill`)** | PASS | Standalone `CouponIssue` query correctly filters `bill: { is: null }`, avoiding duplicate entries when a coupon usage is linked to a `Bill`. |
| **Access Control & Store Scope** | PASS | `@Roles('PARTNER', 'ADMIN')` prevents `STAFF` access with 403 Forbidden. `AccessService` properly verifies store ownership. |
| **Deep Keyset Pagination** | **FAIL** | DB queries omit cursor conditions, resulting in premature pagination truncation at `limit * 3` items. |
| **Timezone Date Boundaries** | **FAIL** | Naive UTC date parsing causes 7-hour window shift for `Asia/Ho_Chi_Minh` queries. |
| **Unit Verification** | PASS | `npm test -- nightlife-data.service.spec.ts` passed (185/185). |
| **Frontend Type Check** | PASS | `pnpm check-types` passed (0 errors). |
| **Integrity Check** | PASS | Implementation is genuine (no facade/dummy code or hardcoded test returns). |

---

## 4. Required Action Items for Worker (m2_1)
1. **Fix Keyset Pagination SQL Queries**:
   - Update Prisma DB queries in `getPartnerActivities` (`bill.findMany`, `couponIssue.findMany`, `booking.findMany`) to filter records where timestamp < `cursorTime` OR (timestamp === `cursorTime` AND id < `cursorId`).
2. **Fix Timezone Date Normalization**:
   - Normalize `startDate` and `endDate` parameters to `Asia/Ho_Chi_Minh` boundaries (+07:00) before passing into Prisma `where` clauses.
3. **Add Tests**:
   - Add unit tests verifying deep pagination beyond 60 items across multiple pages.
   - Add unit tests verifying date boundary behavior for `Asia/Ho_Chi_Minh` timezone.
