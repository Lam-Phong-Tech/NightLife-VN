# Summary of Changes — Milestone 2 (PR 2)

## Implemented Features
1. **Partner Activity Query DTO & Keyset Cursor Helpers**:
   - Created `backend/src/nightlife-data/dto/partner-activity-query.dto.ts` defining `PartnerActivityQueryDto` (`limit`, `cursor`, `type`, `startDate`, `endDate`, `search`, `storeId`).
   - Implemented `encodeCursor` and `decodeCursor` functions handling base64 opaque tokens encoding `<activityAt_iso>_<id>`.
   - Exported `PartnerActivityItem` and `PartnerActivityResponse` interfaces.

2. **Controller Endpoint Contracts & Routing**:
   - Added OpenAPI contracts `PartnerHomeContract`, `PartnerActivitiesContract`, `PartnerActivityDetailContract` to `backend/src/nightlife-data/nightlife-data.contract.ts`.
   - Added `@Get('partner/home')`, `@Get('partner/activity')`, and `@Get('partner/activity/:activityId')` routes to `backend/src/nightlife-data/nightlife-data.controller.ts`.
   - Applied `@Roles('PARTNER', 'ADMIN')` and `@UseGuards(JwtAuthGuard, RolesGuard)` ensuring `STAFF` role attempts return HTTP 403 Forbidden.

3. **Service Logic Implementation**:
   - Implemented `getPartnerHome(user, storeId)`: Aggregates total revenue, bill count, booking count, active coupons count, and top 5 recent activities for authorized store scope.
   - Implemented `getPartnerActivities(user, dto)`:
     - Enforces StoreScope authorization via `AccessService`.
     - Deduplicates coupon scan events: Standalone `CouponIssue` items (`status = USED`) are filtered with `bill: { is: null }` so bill-associated coupon usages are merged under `Bill` activity items.
     - Implemented stable keyset cursor pagination with compound sorting `(activityAt DESC, id DESC)`.
   - Implemented `getPartnerActivityDetail(user, activityId, storeId)`: Returns full activity detail object or throws 404 / 403.

4. **Unit Test Suite Coverage**:
   - Added `Partner Activity Contracts & Stable Pagination (PR2)` test suite in `backend/src/nightlife-data/nightlife-data.service.spec.ts`.
   - Passed all 185 unit tests (100% pass rate).

5. **Verification & Git Delivery**:
   - `npm test -- nightlife-data.service.spec.ts`: PASSED (185/185 tests pass).
   - `pnpm check-types` in `frontend/apps/web`: PASSED (0 errors).
   - Git committed and pushed: commit `36788a17` (`feat(backend): implement partner activity contracts and stable cursor pagination (PR 2)`).
