# MVP Enum Mapping

This document pins the NightLife MVP enum meanings so DEV/TEST can use the same state names in API, database, and QA evidence.

## UserRole

- `USER`: member account. Membership tier is stored separately in `User.tier`.
- `PARTNER`: store partner account.
- `OPERATOR`: operational reviewer account. `POST /auth/login/operator` authenticates this role.
- `STAFF`: internal support staff role. It is separate from `OPERATOR` and does not pass operator bill-review routes by default.
- `ADMIN`: platform administrator.

## Action Policies

Routes use role checks plus action policies for scoped business permissions:

- `canViewPartnerStore`: `ADMIN` and scoped `PARTNER`.
- `canViewPartnerCoupon`: `ADMIN` and scoped `PARTNER`.
- `canViewPartnerBooking`: `ADMIN`, `OPERATOR`, and scoped `PARTNER`.
- `canViewPartnerBill`: `ADMIN`, `OPERATOR`, and scoped `PARTNER`.
- `canScanCoupon`: `ADMIN`, `OPERATOR`, and scoped `PARTNER`.
- `canConfirmCheckIn`: `ADMIN`, `OPERATOR`, and scoped `PARTNER`.
- `canReviewBill`: `ADMIN` and `OPERATOR`.
- `canViewSensitiveBill`: `ADMIN` for admin queue access.
- `canViewMemberBooking`, `canViewMemberCoupon`, and `canClaimMemberCoupon`: authenticated member own-resource actions.

The seed writes the DB-driven permission matrix into `permissions` and `role_permissions`, then writes example per-store grants into `store_permissions`.

## BookingStatus

- `REQUESTED`: customer or guest submitted a booking request.
- `CONFIRMED`: store/partner accepted the booking.
- `CHECKED_IN`: customer arrived or staff checked the booking in.
- `COMPLETED`: booking finished and can be billed or reviewed.
- `CANCELLED`: booking was cancelled before completion.
- `NO_SHOW`: customer did not arrive.

## BillStatus

- `DRAFT`: bill is being created.
- `SUBMITTED`: bill or receipt evidence was submitted for verification.
- `VERIFIED`: staff/admin verified the bill.
- `REJECTED`: bill evidence failed verification; use `rejectReason`.
- `PAID`: bill is paid or marked paid.
- `VOIDED`: bill is cancelled and should not count toward points or commission.

## StoreCategory

- `BAR`: bar/pub venue.
- `CLUB`: nightlife club.
- `LOUNGE`: lounge venue.
- `KARAOKE`: karaoke venue.
- `RESTAURANT`: restaurant venue.
- `SPA`: spa/service venue.
- `EVENT`: event-focused venue.
- `OTHER`: fallback category while onboarding.

## CouponIssue Scan Actor

Coupon inventory uses `Coupon` as the campaign/rule and `CouponIssue` as the issued, scannable coupon instance.

- `CouponIssue.issuedById`: admin/partner/operator actor who issued the coupon instance.
- `CouponIssue.scannedById`: admin/partner/operator actor who scanned or redeemed the issued coupon.
- `CouponIssue.userId` / `guestId`: customer or guest receiving the coupon.
- `CouponIssue.status`: `ISSUED`, `USED`, `EXPIRED`, or `REVOKED`.
- `Bill.couponIssueId` and `Booking.couponIssueId`: attach the scanned coupon to a booking or bill.

For MVP scan evidence, set `CouponIssue.scannedById`, `CouponIssue.usedAt`, and `CouponIssue.status = USED`.

Guest coupon issues expire at `min(now + 24h, Coupon.endsAt)` when `endsAt` exists. Member coupon issues expire at `min(now + 7 days, Coupon.endsAt)` and store the tier/discount snapshot in `CouponIssue.metadata`.

VIP member claim snapshots enforce at least a 10% percent discount rule when the source coupon is percentage-based.

## Audit And Session Security

- Bill review writes `AuditLog` with actor, action, target bill, review metadata, and `beforeJson` / `afterJson` snapshots.
- Login writes `UserSession` by JWT `jti`; logout writes `TokenBlacklist`, marks the session revoked, and `JwtStrategy` rejects blacklisted or inactive-session tokens.
- Admin impersonation, if enabled later, should write `AuditLog.action = admin.impersonation.start` and `admin.impersonation.stop`.
