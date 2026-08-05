# Challenge Report — Milestone 2 (PR 2) Verification & Stress Testing

## Challenge Summary

**Overall risk assessment**: HIGH

Empirical testing confirmed that while basic cursor encoding/decoding, filter combinations, and compound sorting for identical timestamps work as designed, there is a **critical pagination truncation flaw** when paginating past `limit * 3` items in the database.

---

## Challenges

### [HIGH] Challenge 1: DB Query Limit (`take: limit * 3`) Truncates Pagination for Activity Datasets > `limit * 3`

- **Assumption challenged**: The implementation assumes that querying `take: limit * 3` records from Prisma without DB-level cursor conditions is sufficient to serve all pages of pagination.
- **Attack scenario**:
  1. A store has 100 activity items (e.g. 100 bills).
  2. Page 1 (limit=20): Fetches DB items 1..60, returns items 1..20 (`nextCursor` = item 20).
  3. Page 2 (limit=20, cursor=item 20): Fetches DB items 1..60, filters items > item 20, returns items 21..40 (`nextCursor` = item 40).
  4. Page 3 (limit=20, cursor=item 40): Fetches DB items 1..60, filters items > item 40, leaving items 41..60 (20 items).
  5. `hasMore` evaluates `allActivities.length > limit` -> `20 > 20` -> `false`!
  6. The API returns `data` (items 41..60) with `hasMore: false` and `nextCursor: null`.
  7. Client stops paginating. Items 61..100 in the database are **completely truncated and unreachable**.
- **Blast radius**: Any partner store with more than 60 total activity items will be unable to access historical activities past page 3.
- **Mitigation**:
  1. Push cursor filtering into the database `where` clauses (`submittedAt: { lte: cursorTime }`, `usedAt: { lte: cursorTime }`, `scheduledAt: { lte: cursorTime }`).
  2. Use composite cursor conditions in SQL/Prisma or query records starting from/after the cursor rather than always fetching from the top of the table.

### [MEDIUM] Challenge 2: Discrepancy Between `localeCompare` Sorting and `<` Filtering

- **Assumption challenged**: The implementation uses `b.id.localeCompare(a.id)` for sorting in memory and `item.id < decodedCursor.id` for threshold filtering, assuming both string comparisons behave identically.
- **Attack scenario**:
  - `String.prototype.localeCompare` collation rules depend on the environment locale, whereas `<` evaluates UTF-16 code unit values.
  - If activity IDs contain mixed case or special characters, `localeCompare` and `<` can produce conflicting orderings, causing items to be skipped or duplicated during cursor traversal.
- **Blast radius**: Intermittent missing or duplicate items on page boundaries for certain ID formats.
- **Mitigation**: Standardize comparison logic — use `<` / `>` explicitly for both sorting and threshold filtering.

---

## Stress Test Results

| Scenario | Description | Expected Behavior | Actual Behavior | Result |
|---|---|---|---|---|
| **1. Identical Timestamps** | 4 items sharing exact timestamp `2026-08-05T12:00:00.000Z` | Deterministic ordering by `id DESC` (`coupon:c1` > `booking:bk1` > `bill:b2` > `bill:b1`) | Sorted and paginated deterministically | **PASS** |
| **1. Pagination Depth (> limit * 3)** | 10 items in DB, page size limit = 2 (limit * 3 = 6) | Allow paginating through all 10 items | Page 3 returns items 5 & 6 but sets `hasMore: false` and `nextCursor: null`, truncating items 7-10 | **FAIL (BUG CONFIRMED)** |
| **2. Base64 Token Parsing** | Valid Base64 cursor token encoding/decoding | Correct ISO string and ID extraction | Encodes/decodes correctly | **PASS** |
| **2. Malformed Cursors** | Empty, null, non-Base64, missing separator, invalid date | Graceful handling returning `null` | Returns `null` without throwing unhandled exceptions | **PASS** |
| **2. Edge-of-Page Cursor** | Cursor pointing to the final record | Return `data: []`, `hasMore: false`, `nextCursor: null` | Handled gracefully | **PASS** |
| **3. Type Filters** | `type` query parameter (`ALL`, `BILL_PAYMENT`, `COUPON_USAGE`, `BOOKING_CHECKIN`) | Filter Prisma queries to requested entity types | Correctly isolates model queries and deduplicates coupons | **PASS** |
| **3. Date & Search Filters** | `startDate`, `endDate`, `search` query parameters | Filter by ISO dates and case-insensitive string match | Correctly constructs Prisma `where` queries | **PASS** |
| **4. Unit Tests** | `npm test -- nightlife-data.service.spec.ts` | All unit tests pass | 185 / 185 tests pass | **PASS** |
| **4. Empirical Stress Spec** | `npm test -- partner-activity-empirical-challenge.spec.ts` | Execute empirical test suite | 8 / 8 tests pass (exposing the truncation bug) | **PASS** |
| **4. Frontend Types** | `pnpm check-types` in `frontend/apps/web` | Clean type-check output | 0 TypeScript errors | **PASS** |

---

## Unchallenged Areas

- Frontend hook consumption (`usePartnerActivity.ts`) — out of scope for this backend contract verification, covered in PR 4.
- DB Index performance on `(submittedAt, id)`, `(usedAt, id)`, `(scheduledAt, id)` under high load — requires full integration test environment with populated DB.
