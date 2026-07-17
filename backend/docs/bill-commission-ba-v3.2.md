# Bill commission rule ba-v3.2

## Deprecated

Commission configuration is no longer used by product decision.

- `CommissionConfig` records are cleared by migration `20260717000000_disable_commission_config`.
- Bill approval no longer requires an active `CommissionConfig`.
- Bill approval records `commissionAmountVnd = 0`.
- `commissionRuleSnapshot.source` is `COMMISSION_DISABLED`.
- Campaign commission override CRUD is disabled and returns `410 Gone`.

The revenue formula still records bill money fields:

- `grossRevenueVnd` / `subtotalVnd`: original bill amount before customer discount.
- `discountVnd`: customer discount resolved from coupon issue snapshot, bill snapshot, or coupon campaign.
- `netRevenueVnd` / `totalVnd`: `max(0, grossRevenueVnd - discountVnd)`.
- `payableVnd` / `paidVnd`: `netRevenueVnd + serviceChargeVnd + taxVnd`.
- `commissionAmountVnd`: always `0`.

Service charge and tax are not part of net revenue. They are carried separately in `payableVnd`.

## QA checklist

- Approving a submitted bill succeeds without any `CommissionConfig` row.
- Approval response and database row show `commissionAmountVnd = 0`.
- Approval `commissionRuleSnapshot` includes `source: "COMMISSION_DISABLED"` and `flags: []`.
- `/admin/commission-overrides` list returns an empty disabled result.
- Create/update/delete under `/admin/commission-overrides` returns `410 Gone`.
