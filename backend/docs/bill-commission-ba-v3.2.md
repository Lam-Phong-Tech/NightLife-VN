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
- Negative commission is still approved by the existing MVP flow, but the snapshot includes:
  - `NEGATIVE_COMMISSION_PM_BA_CONFIRMATION_REQUIRED`
  - `requiresPmBaConfirmation: true`
  - `pmBaConfirmationReason`

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

- Partner/Admin workflow for negative commission: Pending PM/BA -> Confirmed -> Approved.
- Bill reversal on cancellation/refund.
- Recalculate preview before approve.
- BI dashboard by store/campaign/coupon/cast.
