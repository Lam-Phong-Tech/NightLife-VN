# Route/action contract changelog

## v1.1 - 2026-06-27

- Added explicit `OPERATOR` role separate from `STAFF`.
- Added DB-backed action policies to protected member, partner, operator, and admin routes.
- Added `store_permissions` scope model for per-store multi-store partner permissions.
- Added `UserSession` backed login/logout session management.
- Added bill review audit `beforeJson` and `afterJson` snapshots.
- Added public discovery routes to the contract table.
- Kept `POST /partner/check-ins/:couponIssueId/confirm` as a compatibility alias.

## v1.0 - 2026-06-26

- Established the baseline public coupon, member, partner, operator, and admin route surface.
- Documented standard 400/401/403/404/422 error response shapes.
- Documented guest coupon 24-hour expiry cap, member 7-day expiry cap, and bill review response samples.
