# Route/action contract

This contract standardizes the public, booking, coupon, bill, admin, and partner
surfaces. Swagger samples live on the controller decorators and render at
`/api`.

## Error contract

| Status | When it is returned                                              | Example                                                                                             |
| ------ | ---------------------------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| 400    | Request body fails DTO validation or contains unsupported fields | `{"statusCode":400,"message":["email must be an email"],"error":"Bad Request"}`                     |
| 401    | Bearer token is missing or invalid on protected routes           | `{"statusCode":401,"message":"Unauthorized"}`                                                       |
| 403    | Authenticated user does not satisfy the route role guard         | `{"statusCode":403,"message":"Forbidden resource","error":"Forbidden"}`                             |
| 404    | Target coupon or bill is not found, inactive, or deleted         | `{"statusCode":404,"message":"Coupon not found","error":"Not Found"}`                               |
| 422    | Request is valid but violates a business rule                    | `{"statusCode":422,"message":"Coupon usage limit has been reached","error":"Unprocessable Entity"}` |

## Routes

| Surface | Method + route                                | Action                            | Auth guard                                   | Request sample                                                                    | Response sample                                                                                                                                                                |
| ------- | --------------------------------------------- | --------------------------------- | -------------------------------------------- | --------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Public  | `GET /coupons`                                | List active public coupons        | None                                         | None                                                                              | `[{"id":"coupon_01","code":"WELCOME20","name":"Welcome 20%","discountType":"PERCENT","discountValue":20,"store":{"id":"store_01","name":"Luna Lounge","slug":"luna-lounge"}}]` |
| Coupon  | `POST /coupons/:couponId/guest-claims`        | Guest claims a coupon             | None                                         | `{"phone":"+84901234567","displayName":"Guest Name","email":"guest@example.com"}` | `{"issue":{"id":"issue_01","code":"GUEST-550e8400-e29b-41d4-a716-446655440000","status":"ISSUED"},"guest":{"id":"guest_01"}}`                                                  |
| Partner | `GET /partner/stores`                         | Partner lists accessible stores   | `JwtAuthGuard`, `RolesGuard(PARTNER, ADMIN)` | Bearer token                                                                      | `[{"id":"store_01","name":"Luna Lounge","slug":"luna-lounge","status":"ACTIVE"}]`                                                                                              |
| Coupon  | `GET /partner/coupons`                        | Partner lists accessible coupons  | `JwtAuthGuard`, `RolesGuard(PARTNER, ADMIN)` | Bearer token                                                                      | `[{"id":"coupon_01","storeId":"store_01","code":"WELCOME20","status":"ACTIVE","usedCount":12,"usageLimit":100}]`                                                               |
| Booking | `GET /partner/bookings`                       | Partner lists accessible bookings | `JwtAuthGuard`, `RolesGuard(PARTNER, ADMIN)` | Bearer token                                                                      | `[{"id":"booking_01","storeId":"store_01","status":"CONFIRMED","partySize":4,"totalVnd":1800000}]`                                                                             |
| Bill    | `GET /partner/bills`                          | Partner lists accessible bills    | `JwtAuthGuard`, `RolesGuard(PARTNER, ADMIN)` | Bearer token                                                                      | `[{"id":"bill_01","billNumber":"BILL-2026-0001","status":"SUBMITTED","totalVnd":1800000}]`                                                                                     |
| Booking | `GET /member/bookings`                        | Member lists own bookings         | `JwtAuthGuard`                               | Bearer token                                                                      | `[{"id":"booking_01","status":"CONFIRMED","partySize":4,"totalVnd":1800000}]`                                                                                                  |
| Coupon  | `GET /member/coupon-issues`                   | Member lists own coupon issues    | `JwtAuthGuard`                               | Bearer token                                                                      | `[{"id":"issue_01","code":"MEMBER-2026-0001","status":"ISSUED","coupon":{"id":"coupon_01","code":"WELCOME20"}}]`                                                               |
| Admin   | `GET /admin/sensitive-bills`                  | Admin lists bill review queue     | `JwtAuthGuard`, `RolesGuard(ADMIN)`          | Bearer token                                                                      | `[{"id":"bill_01","status":"SUBMITTED","discountRuleSnapshot":{"type":"PERCENT","value":10},"commissionRuleSnapshot":{"rate":0.1},"pointRuleSnapshot":{"vndPerPoint":10000}}]` |
| Admin   | `PATCH /admin/sensitive-bills/:billId/review` | Admin approves or rejects a bill  | `JwtAuthGuard`, `RolesGuard(ADMIN)`          | `{"approve":false,"rejectReason":"Invoice total does not match upload."}`         | `{"id":"bill_01","status":"REJECTED","verifiedAt":null,"rejectedAt":"2026-06-26T10:15:00.000Z","rejectReason":"Invoice total does not match upload."}`                         |

## Notes

- Validation is enforced globally with DTO whitelist, type transform, and unknown
  field rejection.
- `rejectReason` is required when an admin rejects a bill.
- Coupon usage exhaustion and already verified bill review return `422` because
  the payload shape is valid but the business action is not allowed.
