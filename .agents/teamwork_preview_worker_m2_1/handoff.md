# Handoff Report — Milestone 2 (PR 2: Backend Activity Contracts & Stable Pagination)

## 1. Observation
- `backend/src/nightlife-data/dto/partner-activity-query.dto.ts`: Created with `PartnerActivityQueryDto` (`limit`, `cursor`, `type`, `startDate`, `endDate`, `search`, `storeId`) and base64 cursor encoder/decoder (`<activityAt_iso>_<id>`).
- `backend/src/nightlife-data/nightlife-data.contract.ts`: Exported `PartnerHomeContract`, `PartnerActivitiesContract`, `PartnerActivityDetailContract`.
- `backend/src/nightlife-data/nightlife-data.controller.ts`: Added `@Get('partner/home')`, `@Get('partner/activity')`, `@Get('partner/activity/:activityId')` decorated with `@Roles('PARTNER', 'ADMIN')` & `@UseGuards(JwtAuthGuard, RolesGuard)` (returning 403 Forbidden for `STAFF`).
- `backend/src/nightlife-data/nightlife-data.service.ts`: Implemented `getPartnerHome`, `getPartnerActivities`, and `getPartnerActivityDetail`.
  - Deduplication rule enforced: `CouponIssue` items with `status = USED` filter `bill: { is: null }`.
  - Keyset cursor pagination uses compound ordering `(activityAt DESC, id DESC)`.
  - StoreScope checks via `AccessService`.
- `backend/src/nightlife-data/nightlife-data.service.spec.ts`: Added unit tests for all endpoints, pagination, deduplication, and error cases.

## 2. Logic Chain
- Standardized cursor token `<activityAt_iso>_<id>` ensures deterministic sorting when multiple events occur at the exact same millisecond.
- Standalone coupon scan events (`status = USED`) are filtered with `bill: { is: null }` so that bill-associated coupon events are consolidated under `Bill` activity items without duplicate feed entries.
- Applying `@Roles('PARTNER', 'ADMIN')` with `RolesGuard` guarantees `STAFF` users receive HTTP 403 Forbidden on management activity routes.

## 3. Caveats
- `getPartnerActivities` fetches up to `limit * 3` candidates per active stream (`bills`, `couponIssues`, `bookings`) prior to merge-sort and threshold filtering. For extreme data volumes per store, database-level UNION views can be evaluated if needed in the future.

## 4. Conclusion
- Milestone 2 (PR 2: Backend Activity Contracts & Stable Pagination) is fully implemented, verified, committed, and pushed to GitHub main branch.

## 5. Verification Method
- Backend Unit Tests:
  `cd backend && npm test -- nightlife-data.service.spec.ts` (185/185 passed).
- Frontend Typecheck:
  `cd frontend/apps/web && pnpm check-types` (0 errors).
- Git Commit & Push:
  Commit `36788a17` pushed to `origin/main`.
