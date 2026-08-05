# Handoff Report — PR 2: Backend Activity Contracts & Stable Pagination

## 1. Observation
- **Codebase & Schema Inspection**:
  - `backend/prisma/schema.prisma` lines 807–901: `Bill` and `CouponIssue` are linked via `Bill.couponIssueId` (`@unique`).
  - `backend/src/nightlife-data/nightlife-data.service.ts`: Contains existing partner methods (`getPartnerLiteDashboard`, `listPartnerCoupons`, `listPartnerBills`) utilizing `accessService.getAccessibleStoreIds(user, 'store.partner.view')`.
  - `backend/src/access/access.service.ts`: Evaluates `StorePermission` for `STAFF` and `PARTNER` role guards.
  - DTO `backend/src/nightlife-data/dto/partner-activity-query.dto.ts` is currently missing and needs to be created for PR 2.
  - Endpoint contracts `GET /partner/home`, `GET /partner/activity`, and `GET /partner/activity/:activityId` need implementation in `nightlife-data.controller.ts` and `nightlife-data.service.ts`.

---

## 2. Logic Chain
1. **Data Model Relationship**: A used coupon (`CouponIssue` with `status = USED`) can either be used standalone or attached to a `Bill` record (`Bill.couponIssueId`).
2. **Deduplication Logic**: Querying both tables independently results in duplicate activity items for the same customer visit. By applying `bill: { is: null }` to `CouponIssue` queries, we strictly isolate standalone coupon events and delegate bill-associated coupon events to `Bill` activity items.
3. **Stable Keyset Pagination**: Offsets degrade performance and cause feed duplication under concurrent inserts. Keyset cursors formatted as `<activityAt_iso>_<id>` combined with descending comparison logic `(activityAt DESC, id DESC)` guarantee O(1) stable pagination.
4. **Multi-Tenant Security**: Wrapping store queries in `AccessService.getAccessibleStoreIds` enforces store-level isolation. Staff accounts attempting to query unassigned stores will receive a HTTP 403 Forbidden error.

---

## 3. Caveats
- **Read-Only Scope**: This report is produced by a read-only explorer agent (`teamwork_preview_explorer`). No backend source code modifications were performed in `backend/src/`.
- **Database Schema**: No schema changes or Prisma migrations are required for PR 2; existing fields `Bill.couponIssueId`, `CouponIssue.status`, `CouponIssue.usedAt`, `Bill.usedAt`, `Bill.submittedAt` fully satisfy all requirements.

---

## 4. Conclusion
The implementation spec for Milestone 2 (PR 2) is fully defined and ready for implementer execution:
- Create `backend/src/nightlife-data/dto/partner-activity-query.dto.ts`.
- Implement `GET /partner/home`, `GET /partner/activity`, `GET /partner/activity/:activityId` in `nightlife-data.controller.ts` & `nightlife-data.service.ts`.
- Apply `bill: { is: null }` filter for standalone `CouponIssue` usages.
- Use `(activityAt DESC, id DESC)` cursor pagination with base64 encoding.
- Enforce `AccessService` store scoping and return 403 for unauthorized Staff store access.

---

## 5. Verification Method
1. **Unit Test Verification**:
   - Run NestJS unit tests for `NightlifeDataService`:
     ```bash
     cd d:\laragon\www\NightLife-VN\backend
     npm test -- nightlife-data.service.spec.ts
     ```
2. **Deduplication Assertions**:
   - Create a `CouponIssue` with status `USED` and link it to a `Bill` record.
   - Execute `getPartnerActivities(user)`.
   - Assert that `data.length === 1` and `data[0].sourceType === 'BILL'`.
3. **Cursor Sorting Assertions**:
   - Seed items with identical `activityAt` timestamps but different UUIDs.
   - Assert secondary sorting orders by `id DESC`.
4. **Staff Access 403 Assertions**:
   - Query `/partner/activity?storeId=<unauthorized_store>` as a `STAFF` user.
   - Assert HTTP 403 Forbidden response.
