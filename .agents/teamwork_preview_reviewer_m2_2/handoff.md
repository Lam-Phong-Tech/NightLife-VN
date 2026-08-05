# Handoff Report — Milestone 2 (PR 2 Edge Case & Performance Review)

## 1. Observation
- Tested backend unit tests: `cd backend && npm test -- nightlife-data.service.spec.ts` passed 185/185 unit tests.
- Tested frontend type check: `cd frontend/apps/web && pnpm check-types` passed with 0 errors.
- Inspected implementation in `backend/src/nightlife-data/nightlife-data.service.ts`:
  - Lines 3991–4027, 4059–4093, 4122–4157: Database queries `bill.findMany`, `couponIssue.findMany`, `booking.findMany` fetch `take: limit * 3` from offset 0 without applying `cursor` filtering in the Prisma `where` clause.
  - Lines 4198–4206: In-memory filtering (`itemTime < cursorTime || (itemTime === cursorTime && item.id < decodedCursor.id)`) drops items prior to cursor, but because DB queries only fetch the top `limit * 3` newest items, pagination truncates prematurely at item index 60 (for default `limit = 20`).
  - Lines 3984–3985: `const startDate = dto.startDate ? new Date(dto.startDate) : undefined;` converts date strings naively without `Asia/Ho_Chi_Minh` (+07:00) timezone offset alignment, causing a 7-hour shift in date window queries.
  - Lines 4062: `bill: { is: null }` successfully deduplicates standalone `CouponIssue` records from `Bill` entries.
- Integrity verification: No hardcoded test returns, facade implementations, or self-certifying shortcuts were detected.

## 2. Logic Chain
1. In `getPartnerActivities()`, database queries retrieve the top `limit * 3` newest candidates across bills, coupons, and bookings regardless of whether `cursor` is present.
2. For page 1 (`limit = 20`), the top 20 of 60 fetched items are returned.
3. For page 2, the DB returns the same top 60 items. The in-memory filter drops items 0–19, returning items 20–39.
4. For page 4 (requesting items past index 60), the DB still returns the top 60 items (indices 0–59). In-memory filtering drops ALL 60 items because they are newer than or equal to the cursor.
5. The method returns `{ data: [], hasMore: false, nextCursor: null }`, truncating pagination and preventing clients from accessing activity history beyond position 60.
6. In addition, naive ISO date parsing for `startDate` and `endDate` causes date boundaries to be interpreted in UTC instead of `Asia/Ho_Chi_Minh` (+07:00), excluding events occurring between 00:00:00 AM and 06:59:59 AM VN time.

## 3. Caveats
- No caveats regarding current review findings; the logic chain and code locations are fully verified.

## 4. Conclusion
- Verdict: **REQUEST_CHANGES**.
- Milestone 2 (PR 2) requires fixes for:
  1. Keyset cursor SQL filtering in `getPartnerActivities` to support deep pagination past 60 items.
  2. `Asia/Ho_Chi_Minh` (+07:00) date boundary normalization for `startDate` and `endDate`.

## 5. Verification Method
- Code Inspection: Inspect `backend/src/nightlife-data/nightlife-data.service.ts` lines 3984–4206.
- Unit Test Run: `cd backend && npm test -- nightlife-data.service.spec.ts`.
- Frontend Check: `cd frontend/apps/web && pnpm check-types`.
