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

Customer-facing booking status is grouped into three PM labels:

- `Mới`: `REQUESTED` or `CONFIRMED`.
- `Hoàn tất`: `CHECKED_IN` or `COMPLETED`.
- `Đã hủy`: `CANCELLED` or `NO_SHOW`.

Booking details are not edited in place. Guests cancel with booking id + submitted phone, or look up a guest booking with `GET /bookings/:bookingCode?phone=...`; members cancel with bearer token. Self-service cancel and reschedule use the store cutoff policy (`Store.bookingCancelCutoffMinutes`) and accepted values are 30, 60, or 120 minutes. If customer information changes after cutoff, the customer contacts Admin via LINE OA / Mail.

## BookingChangeRequestStatus

- `REQUESTED`: guest/member requested a booking schedule change.
- `APPROVED`: Admin/Operator approved the request and `Booking.scheduledAt` was updated.
- `REJECTED`: Admin/Operator rejected the request; original booking schedule remains unchanged.
- `CANCELLED`: request was cancelled before review.
- `EXPIRED`: request is no longer actionable.

`BookingChangeRequest.type` is currently `RESCHEDULE`. This keeps the workflow separate from `BookingStatus` and avoids direct booking edits from customer surfaces.

## BookingChat

- `BookingChatSenderType`: `GUEST`, `MEMBER`, `ADMIN`, `OPERATOR`, or `SYSTEM`.
- `BookingChatTopic`: `GENERAL`, `RESCHEDULE`, or `CANCEL`.
- Chat messages are persisted in `booking_chat_messages` and emitted via socket event `booking_chat_message_created` to room `booking_{bookingId}`.

Admin and Operator can cancel a booking on behalf of the customer with a reason after store access checks. This staff cancel path bypasses the self-service cutoff but still rejects `CHECKED_IN`, `COMPLETED`, `NO_SHOW`, and already `CANCELLED` bookings.

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
- `GIRLS_BAR`: girls bar or hostess-bar venue.
- `KARAOKE`: karaoke venue.
- `MASSAGE_SPA`: massage/spa venue.
- `RESTAURANT`: restaurant venue.
- `CASINO`: casino venue.

Public discovery accepts legacy aliases such as `spa` and `massage-spa` and maps
them to `MASSAGE_SPA`. The persisted enum intentionally matches the BA P0
taxonomy; no `EVENT`, `OTHER`, or plain `SPA` category is used in P0.

## CouponIssue Scan Actor

Coupon inventory uses `Coupon` as the campaign/rule and `CouponIssue` as the issued, scannable coupon instance.

- `CouponIssue.issuedById`: admin/partner/operator actor who issued the coupon instance.
- `CouponIssue.scannedById`: admin/partner/operator actor who scanned or redeemed the issued coupon.
- `CouponIssue.userId` / `guestId`: customer or guest receiving the coupon.
- `CouponIssue.status`: `ISSUED`, `USED`, `EXPIRED`, or `REVOKED`.
  PM-facing labels map `ISSUED` to `Đang giữ chỗ`, `USED` to `Đã sử dụng`,
  and `EXPIRED` to `Hết hạn`; `REVOKED` remains an operational cancel state.
- `Bill.couponIssueId` and `Booking.couponIssueId`: attach the scanned coupon to a booking or bill.

For MVP scan evidence, set `CouponIssue.scannedById`, `CouponIssue.usedAt`, and `CouponIssue.status = USED`. Successful redemption also writes `AuditLog.action = COUPON_ISSUE_USED` and queues `NotificationLog.templateKey = coupon.issue.used.v1`.

Guest coupon issues expire at `min(now + 24h, Coupon.endsAt)` when `endsAt`
exists and snapshot a 5% discount. Member coupon issues expire at
`min(now + 7 days, Coupon.endsAt)` and snapshot an 8% member discount or 10%
VIP discount in `CouponIssue.metadata`.

Each issued coupon stores the QR payload, campaign/store snapshot, user type,
and immutable discount percent snapshot in `CouponIssue.metadata`.
Stale `ISSUED` issues are marked `EXPIRED` before partner scan/check-in and
before member wallet responses. A Nest scheduler runs every 5 minutes and
expires stale issued coupon issues globally. Check-in uses a conditional
`status = ISSUED` write so each coupon issue is one-time only.
Partner scan/check-in responses return only masked customer summary fields
(`customer.type`, `customer.label`) and never raw member/guest contact details.

`Coupon.usageLimit` is the maximum number of successful redemptions. It is
compared with `Coupon.usedCount`, and `usedCount` increments only after a
coupon issue is confirmed `USED`; it is not the number of claimed/issued codes.

## Audit And Session Security

- Bill review writes `AuditLog` with actor, action, target bill, review metadata, and `beforeJson` / `afterJson` snapshots.
- Booking cancellation writes `AuditLog.action = BOOKING_CANCELLED` with `beforeStatus`, `afterStatus`, `reason`, and `actorId` when available. Coupon check-in writes `BOOKING_STATUS_CHANGED` for the linked booking and queues the customer status notification.
- Login writes `UserSession` by JWT `jti`; logout writes `TokenBlacklist`, marks the session revoked, and `JwtStrategy` rejects blacklisted or inactive-session tokens.
- Admin impersonation, if enabled later, should write `AuditLog.action = admin.impersonation.start` and `admin.impersonation.stop`.

## Booking P2 Dashboard

- `GET /admin/bookings/cancel-analytics` and `GET /operator/bookings/cancel-analytics` aggregate cancel rate by store, cast, and channel (`MEMBER` / `GUEST`).
- `PATCH /admin/stores/:storeId/booking-policy` and `PATCH /operator/stores/:storeId/booking-policy` update the per-store cutoff policy.
