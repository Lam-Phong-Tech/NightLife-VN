# Handoff Report - Booking Discounts Integration Strategy

This report details the backend analysis and implementation strategy for integrating default tier discounts (R1), preserving bar campaign discounts (R2), and admin global coupons claiming & validation (R3).

---

## 1. Observation

Direct observations made in the codebase and schema:

1. **Prisma Schema (`backend/prisma/schema.prisma`):**
   - **`UserTier` Enum (Lines 18-23):**
     ```prisma
     enum UserTier {
       FREE
       MEMBER
       PREMIUM
       VIP
     }
     ```
   - **`Booking` Model (Lines 604-650):**
     - Contains `couponId` (refers to `Coupon`), `couponIssueId` (refers to `CouponIssue`, unique).
     - Contains `discountSnapshot` (`Json? @map("discount_rule_snapshot")`) for rule-capturing.
     - Does **not** contain direct database relationships to `AdminCoupon` or `AdminCouponIssue`.
   - **`AdminCoupon` Model (Lines 1223-1247):**
     - Contains `targetStores String[] @default([])` and `targetAudiences String[] @default([])`.
     - Contains `startsAt`, `endsAt`, `usageLimit`, and `usedCount`.
   - **`AdminCouponIssue` Model (Lines 1262-1291):**
     - Holds relations to `AdminCoupon`, `User`, `Guest`, and `Store`.
     - Has `status` (`CouponIssueStatus`), `expiresAt`, `usedAt`, and `metadata`.
   - **`Campaign` Model (Lines 1343-1360):**
     - Represents store campaigns with `targetStoreId` and active dates.

2. **Booking Flow in `nightlife-data.service.ts`:**
   - **`createBookingRecord` (Lines 10104-10183):**
     - Resolves coupon links via `resolveBookingCouponLink`.
     - Issues booking coupon QRs via `issueBookingCouponQr`.
     - Saves `discountSnapshot` with `couponId` and `couponIssueId`.
   - **`resolveBookingCouponLink` (Lines 9266-9382):**
     - Validates the manual `couponId` or `couponIssueId` provided in the DTO.
     - Checks store ownership: `issue.coupon.storeId === target.store.id` (Line 9316). Throws `UnprocessableEntityException` if they do not match.

3. **Bill Approval & Calculation in `nightlife-data.service.ts`:**
   - **`buildBillRevenueApprovalSnapshot` (Lines 8219-8279):**
     - Performs synchronous calculation via `resolveBillApprovalDiscount`.
     - Reads `bill.couponIssue?.metadata` to extract the `discountRuleSnapshot` (Lines 8319-8322).
   - **`reviewSensitiveBill` (Lines 6831-7092):**
     - Executes status change inside a transaction: `this.prisma.$transaction(async (tx) => { ... })` (Line 6916).

---

## 2. Logic Chain

1. **R1 (Default Tier Discounts) Logic:**
   - The shared tier coupons (`GUEST5`, `MEMBER8`, `VIP10`) are represented as entries in the `Coupon` table. Since `Coupon.code` is `@unique` globally and has a non-nullable `storeId` field, a single global record for each code must point to *some* store ID.
   - When users place bookings at other stores, the store-ownership check (`issue.coupon.storeId !== input.target.store.id`) will trigger an exception. Thus, `resolveBookingCouponLink` and `issueBookingCouponQr` must bypass this store validation specifically for these three shared codes (Observation 2).
   - On "normal bookings" (where no coupon is passed in `CreateBookingDto`), the system must determine the user tier and select the appropriate code:
     - `FREE` (or guest with no user account) maps to `GUEST5` (5% discount).
     - `MEMBER` or `PREMIUM` maps to `MEMBER8` (8% discount).
     - `VIP` maps to `VIP10` (10% discount).
   - The service will automatically look up or create the global `Coupon` record, issue a `CouponIssue` on-the-fly, and save the metadata rule snapshot in the booking's `discountSnapshot` (Observation 1 & 2).

2. **R2 (Preserving Bar Campaigns) Logic:**
   - If the store has an active campaign in the `Campaign` table (Observation 1), applying the default tier discount would overwrite the campaign rate.
   - Therefore, prior to auto-resolving tier defaults, we must check if an active store-level `Campaign` exists. If one is active, we bypass auto-resolving tier defaults (preserving the campaign rate).

3. **R3 (Admin Global Coupons) Logic:**
   - **Claiming:** Since `AdminCouponIssue` has relations to users and guests, a custom claiming service will validate the `AdminCoupon` parameters (target audiences, starts/ends dates, usage limits) and create the `AdminCouponIssue` record.
   - **Booking Reconciliation:** Since `Booking` lacks an `adminCouponIssueId` column (Observation 1), the API must allow passing the admin coupon issue's ID or code in the existing `couponIssueId` payload. `resolveBookingCouponLink` will fall back to querying the `AdminCouponIssue` table. We validate that:
     - The store ID is listed in the admin coupon's `targetStores`.
     - The user's tier is listed in the `targetAudiences`.
     - The issue belongs to the user/guest and is active.
     The resolved ID and discount rules are saved directly within `Booking.discountSnapshot`.
   - **Bill Approval & Applying Discount:** In `buildBillRevenueApprovalSnapshot` (Observation 3), we check if the bill's booking has a linked `adminCouponIssueId` in `discountSnapshot`. We load the issue and parent coupon asynchronously and inject them as standard `couponIssue` and `coupon` mock properties before calculating the discount. This lets the existing calculation logic (Observation 3) run unchanged.
   - **Updating to USED:** On bill approval in the transaction within `reviewSensitiveBill` (Observation 3), we fetch the booking's `discountSnapshot`, extract the `adminCouponIssueId`, update its status to `USED`, set `usedAt = now`, and increment `AdminCoupon.usedCount`.

---

## 3. Caveats

1. **Coupon Global Uniqueness constraint:** Because `Coupon.code` is marked `@unique` in the database, the shared coupons (`GUEST5`, `MEMBER8`, `VIP10`) can only exist once. When dynamically created, they will be associated with the first store ID where they are triggered. The bypassed validation ensures this mismatch does not cause failures on subsequent stores.
2. **Admin Coupon DTO fields:** Rather than modifying the public NestJS DTOs or contract interfaces, the strategy leverages fallback lookup logic in the existing `couponIssueId` and `couponId` fields.
3. **No direct relational column for Admin Coupons on Booking/Bill:** Keeping this in `discountSnapshot` JSON ensures zero database migrations are needed.

---

## 4. Conclusion & Actionable Proposals

### 4.1. Helper Methods for Tier Discount & Campaigns (R1, R2)
Add the following helper methods to `nightlife-data.service.ts`:

```typescript
  private async hasActiveStoreCampaign(storeId: string, prisma: Prisma.TransactionClient): Promise<boolean> {
    const now = new Date();
    const campaign = await prisma.campaign.findFirst({
      where: {
        targetStoreId: storeId,
        status: 'ACTIVE',
        OR: [
          { startsAt: null },
          { startsAt: { lte: now } },
        ],
        OR: [
          { endsAt: null },
          { endsAt: { gte: now } },
        ],
      },
      select: { id: true },
    });
    return !!campaign;
  }

  private resolveTierCouponCode(user?: AuthenticatedUser): string {
    if (!user) return 'GUEST5';
    const tier = user.tier;
    if (tier === 'VIP') return 'VIP10';
    if (tier === 'MEMBER' || tier === 'PREMIUM') return 'MEMBER8';
    return 'GUEST5';
  }

  private async getOrCreateTierCoupon(code: string, storeId: string, prisma: Prisma.TransactionClient) {
    let coupon = await prisma.coupon.findUnique({
      where: { code },
    });
    if (!coupon) {
      coupon = await prisma.coupon.create({
        data: {
          code,
          name: code === 'GUEST5' ? 'Guest 5%' : code === 'MEMBER8' ? 'Member 8%' : 'VIP 10%',
          discountType: 'PERCENT',
          discountValue: code === 'GUEST5' ? 5 : code === 'MEMBER8' ? 8 : 10,
          storeId,
          status: 'ACTIVE',
          startsAt: new Date(),
        },
      });
    }
    return coupon;
  }

  private isSharedTierCoupon(code: string): boolean {
    return ['GUEST5', 'MEMBER8', 'VIP10'].includes(code);
  }
```

### 4.2. Bypass Store Checks in `resolveBookingCouponLink` & `issueBookingCouponQr`
In `resolveBookingCouponLink` (Line 9316):
```typescript
      // Before: if (issue.coupon.storeId !== input.target.store.id)
      const isShared = this.isSharedTierCoupon(issue.coupon.code);
      if (!isShared && issue.coupon.storeId !== input.target.store.id) {
        throw new UnprocessableEntityException('Coupon issue does not belong to the booking store');
      }
```

In `issueBookingCouponQr` (Line 9964):
```typescript
    // Look up the coupon by ID first to check code
    const couponBasic = await prisma.coupon.findUnique({
      where: { id: input.couponId },
      select: { code: true }
    });
    const isShared = couponBasic && this.isSharedTierCoupon(couponBasic.code);

    const coupon = await prisma.coupon.findFirst({
      where: {
        id: input.couponId,
        ...(isShared ? {} : { storeId: input.target.store.id }),
        status: 'ACTIVE',
        deletedAt: null,
        OR: [{ endsAt: null }, { endsAt: { gt: now } }],
      },
      // select block ...
    });
```

### 4.3. Inject Tier Discount into `createBookingRecord`
In `createBookingRecord` (Line 10131):
```typescript
      let couponLink = await this.resolveBookingCouponLink({
        dto: input.dto,
        target: input.target,
        userId: input.userId,
        phone: input.phone,
        prisma,
      });

      // Automatically apply default tier coupon if no coupon is specified
      // and there are no active campaigns on the store
      if (!couponLink.couponId && !couponLink.couponIssueId) {
        const hasCampaign = await this.hasActiveStoreCampaign(input.target.store.id, prisma);
        if (!hasCampaign) {
          const tierCode = this.resolveTierCouponCode(input.user);
          const tierCoupon = await this.getOrCreateTierCoupon(tierCode, input.target.store.id, prisma);
          couponLink = {
            couponId: tierCoupon.id,
          };
        }
      }
```

Ensure `issueBookingCouponQr` sets `userType` based on code for shared coupons to avoid tier mismatch:
```typescript
    let userType = input.user
      ? this.resolveCouponUserType(input.user)
      : 'GUEST';
    if (coupon.code === 'GUEST5') {
      userType = 'GUEST';
    } else if (coupon.code === 'MEMBER8') {
      userType = 'MEMBER';
    } else if (coupon.code === 'VIP10') {
      userType = 'VIP';
    }
```

### 4.4. Claiming Admin Coupons (R3)
Add service methods `claimAdminCouponForMember` and `claimAdminCouponForGuest` following this logic:
```typescript
  async claimAdminCouponForMember(couponIdOrCode: string, user: AuthenticatedUser) {
    const now = new Date();
    const coupon = await this.prisma.adminCoupon.findFirst({
      where: { OR: [{ id: couponIdOrCode }, { code: couponIdOrCode }], status: 'ACTIVE', deletedAt: null },
    });
    if (!coupon) throw new NotFoundException('Admin coupon not found');
    if (coupon.startsAt > now || (coupon.endsAt && coupon.endsAt <= now)) {
      throw new UnprocessableEntityException('Admin coupon is inactive or expired');
    }
    if (coupon.usageLimit !== null && coupon.usedCount >= coupon.usageLimit) {
      throw new UnprocessableEntityException('Coupon usage limit reached');
    }
    if (coupon.targetAudiences?.length > 0 && !coupon.targetAudiences.includes(user.tier)) {
      throw new UnprocessableEntityException('Member tier not eligible');
    }
    // Check duplicate claim
    const existing = await this.prisma.adminCouponIssue.findFirst({
      where: { adminCouponId: coupon.id, userId: user.id, status: 'ISSUED' },
    });
    if (existing) throw new UnprocessableEntityException('Already claimed');

    const issueId = randomUUID();
    const issueCode = `ADMIN-${randomUUID()}`;
    const qrPayload = this.buildCouponQrPayload(issueId);

    return this.prisma.adminCouponIssue.create({
      data: {
        id: issueId,
        adminCouponId: coupon.id,
        userId: user.id,
        code: issueCode,
        qrPayloadHash: this.buildCouponQrPayloadHash(qrPayload),
        status: 'ISSUED',
        expiresAt: coupon.endsAt,
        metadata: {
          sourceFlow: 'CLAIM_API',
          discountPercent: coupon.discountValue,
          discountRuleSnapshot: {
            type: coupon.discountType,
            value: coupon.discountValue,
            userType: 'MEMBER',
            tier: user.tier,
            sourceType: coupon.discountType,
            sourceValue: coupon.discountValue,
          },
        },
      },
    });
  }
```

### 4.5. Admin Coupon Reconciliation during Booking
In `resolveBookingCouponLink`, add a fallback block:
```typescript
      if (!issue) {
        // Fallback to AdminCouponIssue
        const adminIssue = await prisma.adminCouponIssue.findFirst({
          where: {
            OR: [{ id: couponIssueId }, { code: couponIssueId }],
            adminCoupon: { deletedAt: null },
          },
          include: { adminCoupon: true },
        });

        if (adminIssue) {
          // Validate AdminCouponIssue
          await this.validateAdminCouponIssueForBooking({
            issue: adminIssue,
            storeId: input.target.store.id,
            user: input.user,
            guestId: input.guestId,
            now,
          });

          return {
            adminCouponId: adminIssue.adminCouponId,
            adminCouponIssueId: adminIssue.id,
          };
        }
        throw new NotFoundException('Coupon issue not found');
      }
```

### 4.6. Inject Admin Coupon into Bill Calculation & Status USED on Approval
In `buildBillRevenueApprovalSnapshot` (Line 8219):
```typescript
    let adminCouponIssue: any = null;
    let adminCoupon: any = null;

    if (bill.booking?.id) {
      const booking = await this.prisma.booking.findUnique({
        where: { id: bill.booking.id },
        select: { discountSnapshot: true },
      });
      const adminCouponIssueId = (booking?.discountSnapshot as any)?.adminCouponIssueId;
      if (adminCouponIssueId) {
        adminCouponIssue = await this.prisma.adminCouponIssue.findUnique({
          where: { id: adminCouponIssueId },
          select: { id: true, code: true, status: true, metadata: true, adminCouponId: true },
        });
        if (adminCouponIssue) {
          adminCoupon = await this.prisma.adminCoupon.findUnique({
            where: { id: adminCouponIssue.adminCouponId },
            select: { id: true, code: true, name: true, discountType: true, discountValue: true },
          });
        }
      }
    }

    const billDecorated = {
      ...bill,
      couponIssue: bill.couponIssue ?? adminCouponIssue,
      coupon: bill.coupon ?? adminCoupon,
    };
```
Then use `billDecorated` throughout the calculation calls in `buildBillRevenueApprovalSnapshot`.

Update `AdminCouponIssue` status in `reviewSensitiveBill` (Line 6916 transaction):
```typescript
      if (reviewedBill.status === 'VERIFIED' && bill.booking?.id) {
        const booking = await tx.booking.findUnique({
          where: { id: bill.booking.id },
          select: { discountSnapshot: true },
        });
        const adminCouponIssueId = (booking?.discountSnapshot as any)?.adminCouponIssueId;
        if (adminCouponIssueId) {
          const updatedIssue = await tx.adminCouponIssue.update({
            where: { id: adminCouponIssueId },
            data: { status: 'USED', usedAt: now },
            select: { adminCouponId: true },
          });
          await tx.adminCoupon.update({
            where: { id: updatedIssue.adminCouponId },
            data: { usedCount: { increment: 1 } },
          });
        }
      }
```

---

## 5. Verification Method

To independently verify these integration logic:

1. **Admin Coupon Claim Verification:**
   - Create mock `AdminCoupon` with `targetAudiences: ["VIP"]` and `targetStores: ["store-1"]`.
   - Verify that VIP member can claim successfully.
   - Verify that FREE member claim fails with `UnprocessableEntityException` (due to targetAudiences constraint).
2. **Reconciliation & Validation:**
   - Attempt booking at `store-2` using the claimed coupon. Verify booking fails with `UnprocessableEntityException` (store scope mismatch).
   - Book at `store-1`. Verify booking completes and `discountSnapshot` holds `adminCouponIssueId`.
3. **Bill Approval Verification:**
   - Submit a bill for the successful booking.
   - Approve the bill. Verify the discount applies correctly to the approved totals.
   - Confirm the `AdminCouponIssue` status in DB updates to `USED` and its `usedAt` is set.
4. **Project Tests Execution:**
   - Run NestJS unit tests to ensure no regressions:
     ```bash
     pnpm run test src/nightlife-data/nightlife-data.service.spec.ts
     ```
