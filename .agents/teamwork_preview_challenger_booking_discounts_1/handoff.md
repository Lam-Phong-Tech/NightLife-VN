# Handoff Report — Booking and Discount Backend Integration Challenge Testing

## Challenge Summary & Verdict
- **Testing Verdict**: **PASS**
- **Overall Risk Assessment**: **LOW**
- **Summary**: Empirical challenge testing has verified that the booking and discount flow backend integration logic is highly robust and behaves exactly as expected. All security boundaries (including store eligibility scope, customer tier eligibility, usage limit, and duplicate claims checks) are properly enforced in `d:/laragon/www/NightLife-VN/backend/src/nightlife-data/nightlife-data.service.ts`.

---

## Handoff Components

### 1. Observation
We observed the following implementations in `backend/src/nightlife-data/nightlife-data.service.ts`:
- **Default Coupon Store Bypass**: Lines 9694–9701 and 9769–9771:
  ```typescript
  const isDefaultCoupon = ['GUEST5', 'MEMBER8', 'VIP10'].includes(
    issue.coupon.code,
  );
  if (!isDefaultCoupon && issue.coupon.storeId !== input.target.store.id) {
    throw new UnprocessableEntityException(
      'Coupon issue does not belong to the booking store',
    );
  }
  ```
  And during direct lookup using couponId:
  ```typescript
  if (!isDefaultCouponId) {
    couponWhere.storeId = input.target.store.id;
  }
  ```
- **Admin Coupon Tier Validations**: Lines 10607–10620:
  ```typescript
  const userTier = input.user?.tier ?? 'GUEST';
  if (
    adminCoupon.targetAudiences &&
    adminCoupon.targetAudiences.length > 0
  ) {
    const hasAudience = adminCoupon.targetAudiences.some(
      (aud) => aud.toUpperCase() === userTier.toUpperCase(),
    );
    if (!hasAudience) {
      throw new UnprocessableEntityException(
        'User tier is not eligible for this admin coupon',
      );
    }
  }
  ```
- **Admin Coupon targetStores Constraints**: Lines 10599–10605:
  ```typescript
  if (adminCoupon.targetStores && adminCoupon.targetStores.length > 0) {
    if (!adminCoupon.targetStores.includes(input.target.store.id)) {
      throw new UnprocessableEntityException(
        'Store is not eligible for this admin coupon',
      );
    }
  }
  ```
- **Used Count and Duplicate Claim Limits**: Lines 2764–2768, 2782–2794, 2874–2878, 2907–2919:
  ```typescript
  if (coupon.usageLimit !== null && coupon.usedCount >= coupon.usageLimit) {
    throw new UnprocessableEntityException(
      'Admin coupon usage limit reached',
    );
  }
  ...
  const existingIssue = await this.prisma.adminCouponIssue.findFirst({
    where: {
      adminCouponId: coupon.id,
      userId: user.id,
      status: { in: ['ISSUED', 'USED'] },
    },
  });
  if (existingIssue) {
    throw new UnprocessableEntityException(
      'You have already claimed this coupon',
    );
  }
  ```
- **Test execution results**:
  Command: `pnpm test src/nightlife-data/booking-discount-challenge.spec.ts`
  Output:
  ```
  PASS src/nightlife-data/booking-discount-challenge.spec.ts (5.467 s)
  Booking and Discount Flows Backend Integration (Challenge)
    1. Bypassing store checks for GUEST5, MEMBER8, VIP10 across different stores
      √ allows booking store store-1 to use default coupon GUEST5 owned by store-2 (37 ms)
      √ allows booking store store-1 to use default coupon MEMBER8 owned by store-2 (9 ms)
      √ allows booking store store-1 to use default coupon VIP10 owned by store-2 (8 ms)
      √ rejects booking store store-1 using non-default coupon owned by store-2 (472 ms)
    2. VIP, Member, and Guest tier validations for Admin Coupons
      √ allows a VIP user to claim and book using an Admin Coupon targeted to VIP (12 ms)
      √ rejects a MEMBER user from booking using an Admin Coupon targeted to VIP (3 model ms)
      √ allows a guest to claim an Admin Coupon targeted to GUEST (6 ms)
      √ rejects guest claim if Admin Coupon targetAudiences does not include GUEST (4 ms)
      √ validates audience check case-insensitively (3 ms)
    3. Store scope targetStores constraints for Admin Coupons
      √ allows booking when store ID is in eligible targetStores list (2 ms)
      √ rejects booking when store ID is not in targetStores list (2 ms)
    4. Used count limits and duplicate claim prevention
      √ prevents claiming member admin coupon if usageLimit has been reached (3 ms)
      √ prevents claiming guest admin coupon if usageLimit has been reached (3 ms)
      √ prevents member from duplicate claims of the same Admin Coupon (3 ms)
      √ prevents guest from duplicate claims of the same Admin Coupon using the same phone number (3 ms)
  ```

### 2. Logic Chain
1. By examining the code for `resolveBookingCouponLink` and `issueBookingCouponQr`, we identified that coupons with codes `GUEST5`, `MEMBER8`, or `VIP10` are explicitly treated as default coupons. When a coupon is recognized as a default coupon, the SQL `where` queries omit the `storeId` constraint. This matches our test results where the mock `coupon.findFirst` was called without a `storeId` property, allowing default coupons belonging to `store-2` to be successfully claimed and linked to a booking for `store-1`. Conversely, non-default coupons retain the `storeId` constraint and throw a `NotFoundException` when there is a mismatch.
2. By reviewing `createBookingRecord` and `claimAdminGlobalCoupon`, we confirmed that `targetAudiences` constraints are applied. Our tests confirmed that if `targetAudiences` is restricted to `['VIP']`, trying to book as `MEMBER` throws `UnprocessableEntityException('User tier is not eligible for this admin coupon')` and guest claims fail with `UnprocessableEntityException('Guest not eligible for this coupon')`. Audiences are correctly validated case-insensitively.
3. In `createBookingRecord`, we verified that if `targetStores` is set, only bookings containing matching `storeId` values succeed. Others throw `UnprocessableEntityException('Store is not eligible for this admin coupon')`.
4. In both guest and member global coupon claiming paths, `usedCount >= usageLimit` is correctly validated, rejecting claims when limit is reached. The database query checking for existing issues for the user/phone under `ISSUED` or `USED` status effectively blocks duplicate claims.

### 3. Caveats
- No database integration test with a live PostgreSQL instance was run. All assertions are executed through NestJS mocked database transactions using the project's standard unit test patterns.

### 4. Conclusion
The backend implementation correctly implements the design specifications for default coupon bypasses, targetStores scoping, guest/member/VIP tier constraints on Admin Coupons, and duplicate/usage limitations. No bypass vulnerabilities or security loops were identified in these flows.

### 5. Verification Method
To verify these results independently:
1. Open a terminal in `/backend`.
2. Run the command:
   ```bash
   pnpm test src/nightlife-data/booking-discount-challenge.spec.ts
   ```
3. Verify that all 15 tests pass successfully.
