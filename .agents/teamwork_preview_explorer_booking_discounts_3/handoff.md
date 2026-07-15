# Handoff Report: Backend Booking & Discount Integration

## 1. Observation

### Backend Code Structure & Files
We inspected the backend workspace and located the following relevant files:
- **Prisma Schema**: `backend/prisma/schema.prisma` defines the database models.
- **Service Layer**: `backend/src/nightlife-data/nightlife-data.service.ts` contains all core transactional logic for booking creation, coupon resolution, bill submission, and bill review.
- **Controller Layer**: `backend/src/nightlife-data/nightlife-data.controller.ts` exposes API endpoints.
- **DTOs**: `backend/src/nightlife-data/dto/` contains request body validations (e.g. `CreateBookingDto` in `dto/create-booking.dto.ts`).

### Schema Models Details
1. **Store Coupon System**:
   - `Coupon` model (lines 742-769) represents store-specific campaigns and is mapped to a specific `storeId` (not nullable).
   - `CouponIssue` model (lines 771-801) records specific coupon allocations to users or guests.
   - `Booking` model (lines 604-650) has nullable foreign keys `couponId` and `couponIssueId` linking to the store coupon tables. It also has a `discountSnapshot` JSON field.
   
2. **Admin Global Coupon System**:
   - `AdminCoupon` model (lines 1223-1247) represents admin-created global campaigns. It includes validation properties `targetStores` (array of store IDs) and `targetAudiences` (array of user tiers).
   - `AdminCouponIssue` model (lines 1262-1291) tracks issues of these global coupons.
   - Neither `Booking` nor `Bill` has foreign key relationships to `AdminCoupon` or `AdminCouponIssue` in the database schema.

### Existing Logic Tracing
1. **Booking Creation**:
   - `createGuestBooking` (line 3146) and `createMemberBooking` (line 3191) both delegate to `createBookingRecord` (line 10104).
   - `createBookingRecord` calls `resolveBookingCouponLink` (line 9266) to validate manually-passed store coupons and then calls `issueBookingCouponQr` to generate a new QR-based `CouponIssue` if a coupon template is specified.
   
2. **Coupon/Campaign Validation**:
   - `resolveBookingCouponLink` validates store ownership. If `issue.coupon.storeId !== input.target.store.id`, it throws an `UnprocessableEntityException` (lines 9316-9320).
   
3. **Bill Review & Approval**:
   - `reviewSensitiveBill` (line 6831) is the transaction handler for admin reviews. When a bill is approved, its status updates to `VERIFIED` and a revenue/loyalty ledger snapshot is generated via `buildBillRevenueApprovalSnapshot` (line 6856).

---

## 2. Logic Chain

### R1 & R2: Default Tier Discount Integration on Normal Bookings
1. **Automatic Tier Mapping**:
   - In `createBookingRecord`, if the booking payload (`CreateBookingDto`) does not contain `couponId` or `couponIssueId` (meaning it is a "normal booking"), we apply the tier discount automatically.
   - For members, map `user.tier` to coupon code:
     - `FREE` -> `GUEST5`
     - `MEMBER` or `PREMIUM` -> `MEMBER8`
     - `VIP` -> `VIP10`
   - For guests, map to `GUEST5`.
2. **Automatic Issue Generation**:
   - Look up the template `Coupon` record by code (globally).
   - Dynamically create a `CouponIssue` for that template coupon using `issueBookingCouponQr` (or a duplicate database insertion sequence). This satisfies the requirement to link an automatically generated, valid `CouponIssue` to the booking.
3. **Validation Bypass**:
   - The default tier coupons (`GUEST5`, `MEMBER8`, `VIP10`) are seeded under specific stores (e.g. `moonlight-bar`). To make them reusable globally across all stores, we must bypass the store-matching check.
   - In `resolveBookingCouponLink` (line 9316) and direct check-in verification, if the coupon code is in `['GUEST5', 'MEMBER8', 'VIP10']`, skip throwing the store mismatch exception.
4. **Preserving Campaigns (R2)**:
   - If `CreateBookingDto` contains an explicit `couponId` or `couponIssueId` (or admin coupon identifier), skip the auto-tier assignment. This preserves custom bar campaign coupons and avoids overwriting them with defaults.

### R3: Admin Global Coupons Integration
1. **Claiming**:
   - Expose two new endpoints in `nightlife-data.controller.ts`:
     - `POST /admin-coupons/:couponIdOrCode/member-claims` (JwtAuthGuard/RolesGuard for members).
     - `POST /admin-coupons/:couponIdOrCode/guest-claims` (Guest validation/ClaimGuestCouponDto).
   - In `nightlife-data.service.ts`, validate that the `AdminCoupon` is active. Check `targetAudiences` eligibility (e.g. user tier must match, guests are treated as `FREE`). Generate `AdminCouponIssue` with unique code and deep-link QR payload, and save to database.
2. **Validation and Booking Reconciliation**:
   - Extend `CreateBookingDto` to accept an optional `adminCouponIssueId` or code.
   - In `resolveBookingCouponLink` (or a helper method), look up the `AdminCouponIssue` by ID or Code.
   - Validate status (`ISSUED`) and expiry. Validate store eligibility: check if the booking's `storeId` is in `AdminCoupon.targetStores` (if not empty). Validate target audience.
   - In `createBookingRecord`, save the reconciled coupon details (ID, code, discount type/value) inside the booking's `discountSnapshot` JSON (bypassing foreign keys since they are not present in schema).
3. **Bill Approval & Update to USED**:
   - When a bill is submitted, it copies the booking's `discountSnapshot` to the bill's `discountRuleSnapshot`.
   - In `reviewSensitiveBill` (when verification is successful and status transitions to `VERIFIED`):
     - Check if the bill's `discountRuleSnapshot` has a valid `adminCouponIssueId`.
     - If yes, update `AdminCouponIssue` in the database transaction (`tx`):
       - Set `status` to `USED`.
       - Set `usedAt` to the current time.
     - Increment `usedCount` on the parent `AdminCoupon`.

---

## 3. Caveats
- **Schema Modification Constraint**: The database schema does not have direct foreign key columns connecting bookings/bills to global admin coupons. We assume storing reconciliation references in the `discountSnapshot` JSON field is acceptable and aligns with the instruction to store snapshots on the booking.
- **Seeded Store Codes**: We assume the default tier coupons `GUEST5`, `MEMBER8`, and `VIP10` are already seeded in the database. If they are missing, the automatic tier logic must fallback safely to no discount rather than crashing the booking flow.
- **Admin Coupon Target Stores**: We assume the values inside the `targetStores` array of the `AdminCoupon` model are store IDs (UUIDs) or store slugs. Our design checks for store ID matching.

---

## 4. Conclusion
Integrating tier discounts and global admin coupons can be successfully achieved within the NestJS backend without modifying the database schema. By leveraging JSON snapshots on the booking/bill, bypassing store checks for shared codes (`GUEST5`, `MEMBER8`, `VIP10`), and hooking into the bill verification transaction to update `AdminCouponIssue` status, we maintain codebase integrity and fulfill all requirements.

---

## 5. Verification Method

### 1. Manual/Test Suite Execution
Run the existing test suite to ensure no regressions:
```bash
npm run test
```
Or specifically:
```bash
npm run test -- backend/src/nightlife-data/nightlife-data.service.spec.ts
```

### 2. Scenario-Specific Assertions
- **Auto Tier Discount Test**: Create a member booking without passing any coupons. Verify that `couponId` and `couponIssueId` are populated with the UUIDs corresponding to the user's tier coupon (e.g. `MEMBER8` for a MEMBER user).
- **Shared Code Bypass Test**: Create a booking for store `A` using a `CouponIssue` of code `GUEST5` (which belongs to Moonlight Bar). Verify that the booking is successfully created and store validation checks do not throw.
- **Admin Coupon Store Scope Test**: Claim an admin coupon targeting Store `A`. Attempt to book on Store `B` using the issue code. Verify it throws an `UnprocessableEntityException`.
- **Admin Coupon Used Status Test**: Submit a bill for a booking reconciled with an admin coupon. Approve/verify the bill. Query `AdminCouponIssue` and assert that `status` is updated to `USED` and `usedAt` is set.
