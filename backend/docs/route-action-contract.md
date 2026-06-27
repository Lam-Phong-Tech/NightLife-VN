# Route/action contract v1.1

This contract standardizes the public, auth, member, partner, operator, and admin surfaces. Swagger samples live on controller decorators and render at `/api`.

## Version

| Version | Date       | Scope                                                                 |
| ------- | ---------- | --------------------------------------------------------------------- |
| v1.1    | 2026-06-27 | P1/P2 RBAC, OPERATOR role, sessions, audit snapshots, store policies. |

Older deltas live in `backend/docs/route-action-changelog.md`.

## Error contract

| Status | When it is returned                                               | Example                                                                                             |
| ------ | ----------------------------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| 400    | Request body fails DTO validation or contains unsupported fields  | `{"statusCode":400,"message":["email must be an email"],"error":"Bad Request"}`                     |
| 401    | Bearer token is missing, invalid, revoked, or session inactive    | `{"statusCode":401,"message":"Unauthorized"}`                                                       |
| 403    | Authenticated user lacks the route role, action, or store scope   | `{"statusCode":403,"message":"Forbidden resource","error":"Forbidden"}`                             |
| 404    | Target coupon, coupon issue, bill, or store scoped item is absent | `{"statusCode":404,"message":"Coupon not found","error":"Not Found"}`                               |
| 422    | Request is valid but violates a business rule                     | `{"statusCode":422,"message":"Coupon usage limit has been reached","error":"Unprocessable Entity"}` |

## Routes

| Surface | Method + route                          | Action                     | Auth guard                                                               | Request sample                                                                                                                     | Response sample                                                                                                                                                                            |
| ------- | --------------------------------------- | -------------------------- | ------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Public  | `GET /areas`                            | List active P0 areas       | None                                                                     | Optional query `city=hn`; P0 supports `hn`, `hcm`, `all`                                                                           | `[{"id":"area_01","code":"hn-tayho","name":"Tay Ho","cityCode":"hn"}]`                                                                                                                     |
| Public  | `GET /stores`                           | Search active P0 stores    | None                                                                     | Optional query `q=neon&city=hn&category=club&hasActiveCoupon=true&sort=priority&limit=24&page=1`; categories use the 8 P0 taxonomy | `{"data":[{"id":"store_01","name":"Neon Club","slug":"neon-club","category":"CLUB","cityCode":"hn"}],"meta":{"total":1,"page":1,"limit":24,"offset":0,"hasMore":false,"sort":"priority"}}` |
| Public  | `GET /casts`                            | Search active P0 casts     | None                                                                     | Optional query `q=yuna&city=hn&language=ja&tag=ktv&hasActiveCoupon=true&sort=newest&offset=0`                                      | `{"data":[{"id":"cast_01","stageName":"Yuna","store":{"id":"store_01","slug":"neon-club"}}],"meta":{"total":1,"page":1,"limit":24,"offset":0,"hasMore":false,"sort":"newest"}}`            |
| Public  | `GET /coupons`                          | List active public coupons | None                                                                     | None                                                                                                                               | `[{"id":"coupon_01","code":"WELCOME20","name":"Welcome 20%","discountType":"PERCENT","discountValue":20}]`                                                                                 |
| Coupon  | `POST /coupons/:couponId/guest-claims`  | Guest claims a coupon      | None                                                                     | `{"phone":"+84901234567","displayName":"Guest Name","email":"guest@example.com"}`                                                  | `{"issue":{"id":"issue_01","code":"GUEST-550e8400-e29b-41d4-a716-446655440000","status":"ISSUED"},"guest":{"id":"guest_01"}}`                                                              |
| Coupon  | `POST /coupons/:couponId/member-claims` | Member claims a coupon     | `JwtAuthGuard`, `RolesGuard(USER)`, `ActionPolicy(canClaimMemberCoupon)` | Bearer token                                                                                                                       | `{"id":"issue_02","code":"MEMBER-550e8400-e29b-41d4-a716-446655440000","status":"ISSUED","expiresAt":"2026-07-03T10:00:00.000Z"}`                                                          |

Public discovery P0 intentionally returns only HN/HCM data for `city=hn`, `city=hcm`, or aggregate `city=all`/empty. Da Nang and Hai Phong seed records are reserved for later phases and are filtered out of P0 public listing.
| Auth | `POST /auth/login/operator` | Operator login | None | `{"email":"operator@nightlife.vn","password":"..."}` | `{"accessToken":"...","user":{"role":"OPERATOR"}}` |
| Auth | `POST /auth/logout` | Revoke current session token | `JwtAuthGuard` | Bearer token | `{"revoked":true}` |
| Partner | `GET /partner/stores` | Partner lists accessible stores | `JwtAuthGuard`, `RolesGuard(PARTNER, ADMIN)`, `ActionPolicy(canViewPartnerStore)` | Bearer token | `[{"id":"store_01","name":"Luna Lounge","slug":"luna-lounge","status":"ACTIVE"}]` |
| Coupon | `GET /partner/coupons` | Partner lists accessible coupons | `JwtAuthGuard`, `RolesGuard(PARTNER, ADMIN)`, `ActionPolicy(canViewPartnerCoupon)` | Bearer token | `[{"id":"coupon_01","storeId":"store_01","code":"WELCOME20","status":"ACTIVE","usedCount":12,"usageLimit":100}]` |
| Booking | `GET /partner/bookings` | Partner lists accessible bookings | `JwtAuthGuard`, `RolesGuard(PARTNER, ADMIN)`, `ActionPolicy(canViewPartnerBooking)` | Bearer token | `[{"id":"booking_01","storeId":"store_01","status":"CONFIRMED","partySize":4,"totalVnd":1800000}]` |
| Coupon | `POST /partner/coupon-issues/:code/scan` | Partner scans coupon QR | `JwtAuthGuard`, `RolesGuard(PARTNER, ADMIN, OPERATOR)`, `ActionPolicy(canScanCoupon)` | Bearer token | `{"id":"issue_01","code":"GUEST-...","status":"ISSUED","guest":{"id":"guest_01","displayName":"Guest Name"}}` |
| Booking | `POST /partner/coupon-issues/:id/confirm-check-in` | Partner confirms check-in | `JwtAuthGuard`, `RolesGuard(PARTNER, ADMIN, OPERATOR)`, `ActionPolicy(canConfirmCheckIn)` | Bearer token | `{"id":"issue_01","status":"USED","usedAt":"2026-06-26T10:15:00.000Z","scannedById":"partner_01"}` |
| Bill | `GET /partner/bills` | Partner lists accessible bills | `JwtAuthGuard`, `RolesGuard(PARTNER, ADMIN)`, `ActionPolicy(canViewPartnerBill)` | Bearer token | `[{"id":"bill_01","billNumber":"BILL-2026-0001","status":"SUBMITTED","totalVnd":1800000}]` |
| Booking | `GET /operator/bookings` | Operator lists operational bookings | `JwtAuthGuard`, `RolesGuard(OPERATOR, ADMIN)`, `ActionPolicy(canViewPartnerBooking)` | Bearer token | `[{"id":"booking_01","storeId":"store_01","status":"CONFIRMED","partySize":4,"totalVnd":1800000}]` |
| Bill | `GET /operator/bills` | Operator lists operational bills | `JwtAuthGuard`, `RolesGuard(OPERATOR, ADMIN)`, `ActionPolicy(canViewPartnerBill)` | Bearer token | `[{"id":"bill_01","billNumber":"BILL-2026-0001","status":"SUBMITTED","totalVnd":1800000}]` |
| Bill | `PATCH /operator/bills/:billId/review` | Operator reviews submitted bill | `JwtAuthGuard`, `RolesGuard(OPERATOR, ADMIN)`, `ActionPolicy(canReviewBill)` | `{"approve":true}` | `{"id":"bill_01","status":"VERIFIED","reviewedById":"operator_01","verifiedById":"operator_01"}` |
| Booking | `GET /member/bookings` | Member lists own bookings | `JwtAuthGuard`, `RolesGuard(USER)`, `ActionPolicy(canViewMemberBooking)` | Bearer token | `[{"id":"booking_01","status":"CONFIRMED","partySize":4,"totalVnd":1800000}]` |
| Coupon | `GET /member/coupon-issues` | Member lists own coupon issues | `JwtAuthGuard`, `RolesGuard(USER)`, `ActionPolicy(canViewMemberCoupon)` | Bearer token | `[{"id":"issue_01","code":"MEMBER-2026-0001","status":"ISSUED","coupon":{"id":"coupon_01","code":"WELCOME20"}}]` |
| Admin | `GET /admin/sensitive-bills` | Admin lists bill review queue | `JwtAuthGuard`, `RolesGuard(ADMIN)`, `ActionPolicy(canViewSensitiveBill)` | Bearer token | `[{"id":"bill_01","status":"SUBMITTED","discountRuleSnapshot":{"type":"PERCENT","value":10},"commissionRuleSnapshot":{"rate":0.1},"pointRuleSnapshot":{"vndPerPoint":10000}}]` |
| Admin | `PATCH /admin/sensitive-bills/:billId/review` | Admin approves or rejects a bill | `JwtAuthGuard`, `RolesGuard(ADMIN)`, `ActionPolicy(canReviewBill)` | `{"approve":false,"rejectReason":"Invoice total does not match upload."}` | `{"id":"bill_01","status":"REJECTED","verifiedAt":null,"rejectedAt":"2026-06-26T10:15:00.000Z","rejectReason":"Invoice total does not match upload."}` |

## Notes

- `POST /partner/check-ins/:couponIssueId/confirm` remains a compatibility alias for partner check-in confirmation.
- `OPERATOR` is a distinct database role. `STAFF` remains a separate support role and does not pass operator review routes.
- Protected business routes use role guards plus DB-backed `permissions` / `role_permissions`; store-scoped actions also consult `store_permissions`.
- Partner list responses expose `guest.id` and `guest.displayName` only; phone/email stays out of partner surfaces.
- Sensitive bill queues are field-masked for non-admin reviewers.
- Bill review writes `AuditLog` with `metadata`, `beforeJson`, and `afterJson`.
- Logout writes `TokenBlacklist`, marks `UserSession` revoked, and `JwtStrategy` rejects revoked or inactive-session tokens.
