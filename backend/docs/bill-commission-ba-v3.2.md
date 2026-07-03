# Bill commission rule ba-v3.2

## Revenue formula

- `grossRevenueVnd` / `subtotalVnd`: original bill amount before customer discount.
- `discountVnd`: customer discount resolved from coupon issue snapshot, bill snapshot, or coupon campaign.
- `netRevenueVnd` / `totalVnd`: `max(0, grossRevenueVnd - discountVnd)`.
- `payableVnd` / `paidVnd`: `netRevenueVnd + serviceChargeVnd + taxVnd`.
- `commissionAmountVnd`: gross commission minus customer discount.

Service charge and tax are not part of net revenue. They are carried separately in `payableVnd`.

## Approval guardrails

- Bill approval requires an active `CommissionConfig` for the bill store.
- If the store has no active config, approval returns `422` with:
  - `code`: `MISSING_ACTIVE_COMMISSION_CONFIG`
  - `flags`: `["MISSING_ACTIVE_COMMISSION_CONFIG"]`
  - `reason`: admin must create or activate commission config first.
- Negative commission no longer becomes public/verified immediately. Approval first moves the bill to `PENDING_PM_BA` with:
  - `NEGATIVE_COMMISSION_PM_BA_CONFIRMATION_REQUIRED`
  - `requiresPmBaConfirmation: true`
  - `pmBaConfirmationReason`
- PM/BA confirmation requires `PATCH /admin/sensitive-bills/:billId/confirm-negative-commission` with a reason before the bill becomes `VERIFIED`.
- Admin can call `GET /admin/sensitive-bills/:billId/approval-preview` before approval to see gross/net/payable/commission/loyalty impact without changing bill status.
- Admin can call `PATCH /admin/sensitive-bills/:billId/void` after `VERIFIED`, `PAID`, or `PENDING_PM_BA`; if the bill already posted loyalty points, a `REVERSE` point ledger is written idempotently.

## Campaign commission override

- Admin CRUD is exposed under `/admin/commission-overrides`.
- Overrides are persisted inside the active store `CommissionConfig.ruleSnapshot` as `campaignCommissionOverrides` and mirrored into `campaignCommissionRates` for rule calculation.
- Explicit override priority is higher than campaign group fallback in the ba-v3.2 commission resolver.
- Each override update writes an `AuditLog` with before/after rule snapshot.

## Reporting and BI

- `GET /admin/reports/revenue` exposes `grossVnd`, `netVnd`, `payableVnd`, `commissionVnd`, and P2 breakdowns by:
  - day
  - store
  - campaign/coupon
  - cast
  - partner account
  - area
- Admin filters include `flag=NEGATIVE_COMMISSION_PM_BA_CONFIRMATION_REQUIRED` and `flag=MISSING_ACTIVE_COMMISSION_CONFIG`.
- Admin UI shows flag badges, approval preview, PM/BA confirm action, void/reversal action, campaign override controls, and BI breakdown panels.

## Changelog

- `2026-07-04`: Added `PENDING_PM_BA` workflow for negative commission instead of immediate verify.
- `2026-07-04`: Added admin approval preview endpoint and UI button.
- `2026-07-04`: Added campaign commission override CRUD backed by active `CommissionConfig.ruleSnapshot`.
- `2026-07-04`: Added bill void/refund endpoint with idempotent loyalty point reversal ledger.
- `2026-07-04`: Added P2 revenue report breakdowns by store/coupon/campaign/cast plus flag filters.
- `2026-07-03`: Locked ba-v3.2 net revenue formula as `grossRevenueVnd - discountVnd`; service charge/tax live in `payableVnd`.

## Runtime evidence checklist

- Backend: `pnpm exec prisma generate` passed on 2026-07-03.
- Backend: `pnpm test --runInBand` passed on 2026-07-03 with 9 suites and 116 tests.
- Backend: `pnpm build` passed on 2026-07-03.
- Backend e2e: `pnpm exec jest --config ./test/jest-e2e.json test/bill-approval.e2e-spec.ts --runInBand` passed on 2026-07-03 with 2 tests.
- Backend e2e full: `pnpm exec jest --config ./test/jest-e2e.json --runInBand` passed on 2026-07-03 with 8 suites passed, 1 skipped, 49 tests passed, 1 skipped.
- Frontend: `pnpm exec eslint src/app/admin/AdminConsole.tsx` passed on 2026-07-03.
- Frontend: `pnpm build --webpack` passed on 2026-07-03.
- Frontend: `pnpm check-types` is blocked by existing unrelated errors in `src/app/admin/layout.tsx` and `src/app/admin/stores/page.tsx`.
- API/screenshot evidence after approve should show:
  - `subtotalVnd`
  - `discountVnd`
  - `serviceChargeVnd`
  - `taxVnd`
  - `totalVnd`
  - `paidVnd`
  - `commissionAmountVnd`
  - `discountRuleSnapshot`
  - `commissionRuleSnapshot`
  - `flags` when commission is negative

## Backlog

- Automatic payment gateway refund reconciliation.
- Dedicated PM/BA queue ownership and SLA reminders.
- BI dashboard export by store/campaign/coupon/cast.
