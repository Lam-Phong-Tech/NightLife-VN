# Analysis & Implementation Design: Booking Discounts Integration (R1, R2, R3)

This report details the architectural analysis and recommended implementation strategy for integrating default tier discounts, preserving bar campaigns, and administering/validating global admin coupons in the booking and billing flows.

---

## 1. Observation

Based on the investigation of the database schema (`backend/prisma/schema.prisma`) and the nightlife data service code (`backend/src/nightlife-data/nightlife-data.service.ts`), the following elements were observed:

### A. Database Models & Schema
- **User Tiers**: Defined in the `UserTier` enum (line 18):
  ```prisma
  enum UserTier {
    FREE
    MEMBER
    PREMIUM
    VIP
  }
  ```
- **Shared Tier Coupons**: The seeds (`backend/prisma/seed/07-coupons.ts`, line 22) contain the default tier coupons `GUEST5` (5% discount, line 24), `MEMBER8` (8% discount, line 37), and `VIP10` (10% discount, line 50). These coupons are assigned to specific store slugs (e.g. `moonlight-bar`, `velvet-club`, `sakura-lounge`) by default.
- **Booking & Bill relations**: `Booking` (line 604) and `Bill` (line 804) have relations to standard `Coupon` and `CouponIssue` via:
  - `couponId` and `couponIssueId` foreign keys.
  - `discountSnapshot` (Prisma JSON) on Booking and `discountRuleSnapshot` (Prisma JSON) on Bill.
- **Admin Coupons**: Defined via `AdminCoupon` (line 1223) and `AdminCouponIssue` (line 1262):
  - `AdminCoupon` has `targetStores String[]` (line 1230) and `targetAudiences String[]` (line 1231) columns.
  - `Booking` and `Bill` models **do not** have explicit DB foreign keys for `AdminCoupon` or `AdminCouponIssue`.

### B. Code Structures & Core Logic in Service
- **Booking Creation**: `createBookingRecord` (lines 10104-10183) handles the transaction for inserting a booking:
  - Calls `resolveBookingCouponLink` (lines 9266-9382) to validate the input `couponId` and `couponIssueId`.
  - Enforces matching store ID via:
    ```typescript
    if (issue.coupon.storeId !== input.target.store.id) {
      throw new UnprocessableEntityException(
        'Coupon issue does not belong to the booking store',
      );
    }
    ```
  - Calls `issueBookingCouponQr` (lines 9952-10060) to generate a `CouponIssue` record if a raw `couponId` was resolved.
  - Snapshotting: Saves coupon IDs to `booking.discountSnapshot` (lines 10170-10173).
- **Bill Submission**: `submitMemberBill` (lines 5434-5604) creates a `Bill` record from a `Booking`, copying the `couponId` and `couponIssueId` from `couponLink`.
- **Bill Review/Approval**: `reviewSensitiveBill` (lines 6831-7092) handles verifying the bill:
  - Calls `buildBillRevenueApprovalSnapshot` (line 8219), which calls `resolveBillApprovalDiscount` (line 8296) to calculate discounts.
  - `resolveBillApprovalDiscount` resolves the discount percentage from `bill.couponIssue.metadata.discountRuleSnapshot` OR `bill.discountRuleSnapshot` (lines 8320-8324).
- **Claiming Coupons**: `claimGuestCoupon` (line 2696) and `claimMemberCoupon` (line 2707) are disabled in the current version, returning `GoneException(INDEPENDENT_COUPON_CLAIM_REMOVED_MESSAGE)`.

---

## 2. Logic Chain

The step-by-step reasoning from these observations to the designed solutions:

1. **R1 (Default Tier Discounts) Strategy**:
   - *Requirement*: Apply tier discounts (FREE/Guest -> 5% `GUEST5`, MEMBER/PREMIUM -> 8% `MEMBER8`, VIP -> 10% `VIP10`) automatically on normal bookings.
   - *Reasoning*: A "normal booking" is one where no custom coupon inputs (`couponId`, `couponIssueId`, or `adminCouponIssueId`) are provided in the `CreateBookingDto`.
   - *Action*: During `createBookingRecord`, if no coupon is provided, resolve the default coupon code by mapping the user tier (or Guest status) to the respective code:
     - `FREE` or guest -> `GUEST5`
     - `MEMBER` or `PREMIUM` -> `MEMBER8`
     - `VIP` -> `VIP10`
   - *Reasoning for bypassing store validation*: These defaults are global shared coupons but seeded with a dummy `storeId` (e.g. `moonlight-bar`). Therefore, standard store checks must be bypassed for these three codes.
   - *Action*: In both `resolveBookingCouponLink` (when validating explicit coupon issues) and `issueBookingCouponQr` (when querying the raw coupon by ID), skip the `storeId` validation if the coupon's code is `GUEST5`, `MEMBER8`, or `VIP10`.

2. **R2 (Preserve Bar Campaign) Strategy**:
   - *Requirement*: Preserve campaign coupons and do not overwrite with tier defaults.
   - *Reasoning*: If a user submits a specific coupon/campaign (such as `WELCOME100K`), it is resolved and validated explicitly.
   - *Action*: In `createBookingRecord`, only run the auto-resolution of default tier discounts when the request fields `couponId`, `couponIssueId`, and `adminCouponIssueId` are all falsy. If any is specified, skip default tier coupon generation.

3. **R3 (Admin Global Coupons) Strategy**:
   - *Requirement*: Claiming (generating `AdminCouponIssue` for members and guests), validating (`targetAudiences` and `targetStores`), reconciling during booking, and marking `USED` on bill approval.
   - *Claiming Logic*: Implement two customer-facing POST endpoints:
     - `/admin-coupons/:couponId/member-claims` (Member claims, maps to `claimAdminGlobalCouponForMember`)
     - `/admin-coupons/:couponId/guest-claims` (Guest claims, maps to `claimAdminGlobalCouponForGuest` using `ClaimGuestCouponDto`)
     - *Validation*:
       - Fetch `AdminCoupon` by ID, assert active status and valid timeframe.
       - Assert usage limits: `usedCount < usageLimit`.
       - Check `targetAudiences`: check user's tier (or `GUEST` for guest) against the `targetAudiences` array (if populated).
       - Check uniqueness: prevent claiming if the user/guest already holds an active/used `AdminCouponIssue` of the same coupon.
   - *Booking Reconciliation Logic*:
     - Support an optional `adminCouponIssueId` or `adminCouponIssueCode` in booking creation (can be mapped directly or parsed via checking `couponIssueId` if no standard coupon issue matches).
     - Fetch the `AdminCouponIssue` and its parent `AdminCoupon`.
     - Validate that the booking's `storeId` is included in `targetStores` (if `targetStores` is not empty).
     - Reconcile it on the booking by storing the entire coupon snapshot (`adminCouponIssueId`, `adminCouponId`, `discountType`, `discountValue`, `code`) inside the `booking.discountSnapshot` JSON.
   - *Billing Submission Logic*:
     - In `submitMemberBill`/`submitPartnerBill`, copy `booking.discountSnapshot` directly to the `bill.discountRuleSnapshot` so the Admin Coupon snapshot resides on the bill.
   - *Marking USED Logic*:
     - During bill review approval (`reviewSensitiveBill`), when `dto.approve` is true and the bill becomes `VERIFIED`:
       - Parse `bill.discountRuleSnapshot` (or `revenueApproval.discountRuleSnapshot`) to extract `adminCouponIssueId`.
       - Perform a transactional update: set the status of that `AdminCouponIssue` to `USED` and set `usedAt = now`.
       - Increment the global `AdminCoupon.usedCount` by 1.

---

## 3. Caveats

- **No Schema Migration**: This strategy relies entirely on utilizing the existing `Json` fields `discountSnapshot` on Bookings and `discountRuleSnapshot` on Bills to hold `AdminCouponIssue` details, thereby bypassing the need for database migrations to add `adminCouponIssueId` foreign keys to the Booking and Bill tables. If explicit database relationships are desired in the future, schema migrations will be required.
- **Seeded Store Mapping for Tier Coupons**: The three shared coupons (`GUEST5`, `MEMBER8`, `VIP10`) must exist in the database (which is true under current seeds). If they are missing, booking creation without custom coupons will fail with a `NotFoundException`. The service should handle this gracefully (e.g. falling back to no discount or logging a warning).

---

## 4. Conclusion

The recommended strategy is highly performant, requires **zero database schema modifications**, and aligns with the existing transaction structures. 

### Key Implementation Actions:
1. **Service (`nightlife-data.service.ts`)**:
   - Update `resolveBookingCouponLink` and `issueBookingCouponQr` to bypass the store validation checks for `['GUEST5', 'MEMBER8', 'VIP10']`.
   - Update `createBookingRecord` to check if coupon inputs are omitted, and if so, fetch the corresponding default tier coupon and generate a `CouponIssue` for the booking.
   - Add `claimAdminGlobalCouponForMember` and `claimAdminGlobalCouponForGuest` methods incorporating validation checks (`targetAudiences`, usage limits).
   - Update booking reconciliation to validate `AdminCouponIssue` (checking `targetStores` and user tier eligibility) and store the snapshot in `booking.discountSnapshot`.
   - Update bill creation to copy `booking.discountSnapshot` to `bill.discountRuleSnapshot`.
   - Update `reviewSensitiveBill` to check for `adminCouponIssueId` in the snapshot and transition its status to `USED` (along with setting `usedAt` and incrementing the `AdminCoupon.usedCount`).
2. **Controller (`nightlife-data.controller.ts`)**:
   - Add `@Post('admin-coupons/:couponId/member-claims')` and `@Post('admin-coupons/:couponId/guest-claims')` routing requests to the respective service methods.

---

## 5. Verification Method

To independently verify the implementation:

### 1. Test Command
Run the Jest tests inside the `backend` folder:
```powershell
npm run test
```
To run end-to-end tests or specific integrations:
```powershell
npm run test:e2e
```

### 2. Files to Inspect
- `backend/src/nightlife-data/nightlife-data.service.ts`
- `backend/src/nightlife-data/nightlife-data.controller.ts`
- `backend/prisma/schema.prisma`

### 3. Invalidation Conditions
- If a guest is allowed to claim an admin coupon targeted only at `VIP` users, the validation logic is flawed.
- If a tier default discount overrides a campaign coupon explicitly passed during booking (e.g. `WELCOME100K`), the resolution logic is broken.
- If an admin global coupon is applied to a booking at a store not listed in the coupon's `targetStores`, the store scope validation is invalid.
- If the `AdminCouponIssue` status remains `ISSUED` even after the bill has been approved and verified, the hook in `reviewSensitiveBill` is not executing correctly.
