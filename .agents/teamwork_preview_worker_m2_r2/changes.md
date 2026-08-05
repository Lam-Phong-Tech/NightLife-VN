# Changes — Milestone 2 Iteration 2 Remediation Fixes

## Overview
Remediated PR 2 technical defects in backend activity contracts and pagination:
1. Fixed Keyset Cursor Deep Pagination Truncation Defect by passing database-level cursor conditions into Prisma `where.AND` queries for `Bill`, `CouponIssue`, and `Booking`.
2. Implemented `Asia/Ho_Chi_Minh` (+07:00) date boundary normalization (`parseVietnamDateBoundary`) for `startDate` and `endDate` query parameters.
3. Added unit test coverage for deep cursor pagination (>60 items) and `Asia/Ho_Chi_Minh` date boundary normalization in `nightlife-data.service.spec.ts`.

## Files Modified
1. `backend/src/nightlife-data/nightlife-data.service.ts`:
   - Implemented `parseVietnamDateBoundary(dateStr: string, isEnd: boolean): Date` helper method.
   - Updated `getPartnerActivities()` to apply `parseVietnamDateBoundary` to `dto.startDate` and `dto.endDate`.
   - Extracted `cursorTime`, `rawBillId`, `rawCouponId`, and `rawBookingId` from `decodedCursor`.
   - Constructed `billCursorWhere`, `couponCursorWhere`, and `bookingCursorWhere` and attached them inside `where.AND` for Prisma `findMany` queries for `Bill`, `CouponIssue`, and `Booking`.
2. `backend/src/nightlife-data/nightlife-data.service.spec.ts`:
   - Added `it('applies database-level cursor filtering for deep pagination past 60 items')` unit test.
   - Added `it('normalizes YYYY-MM-DD date range inputs to Asia/Ho_Chi_Minh (+07:00) day boundaries')` unit test.

## Verification
- Backend Unit Tests: 187/187 passed (`npm test -- nightlife-data.service.spec.ts`).
- Frontend Type Check: `pnpm check-types` passed with 0 errors.
