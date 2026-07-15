# Project: NightLife-VN Booking & Discount Flows Integration

## Architecture
Integrating three core discount flow requirements in the backend:
1. **R1. Default Tier Discount on Normal Bookings**: Bypassing manual coupon input to auto-resolve `GUEST5`, `MEMBER8`, or `VIP10` based on user tier (FREE -> GUEST5, MEMBER/PREMIUM -> MEMBER8, VIP -> VIP10). Auto-generates `CouponIssue`, links to booking, and snapshots the rule. Bypasses store-ownership checks for these shared tier coupons.
2. **R2. Bar Campaigns**: Keep original campaign discount rates, do not override with tier defaults.
3. **R3. Admin Global Coupon**:
   - APIs to claim `AdminCoupon` (generating `AdminCouponIssue`) for members and guests.
   - Validation constraints: check user/guest tier eligibility (`targetAudiences`) and store eligibility (`targetStores`).
   - Reconcile during booking (allow referencing `AdminCouponIssue` code/ID, stored in snapshot).
   - Apply discount on bill approval, and update `AdminCouponIssue` status to `USED` and set `usedAt`.

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|---|---|---|---|
| 1 | Explore & Design | Locate files and define integration architecture | None | DONE |
| 2 | Implementation | Integrate R1, R2, and R3 in nightlife-data.service.ts and controller | M1 | DONE |
| 3 | Verification | Run Jest tests and E2E validation | M2 | DONE |
| 4 | Forensic Audit | Run integrity checks | M3 | DONE |

## Code Layout
- Backend controllers and services: `backend/src/nightlife-data/`
- Prisma Schema: `backend/prisma/schema.prisma`
- Test files: `backend/test/`
