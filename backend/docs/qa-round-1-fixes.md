# QA/UAT Round 1 P0/P1/P2 Fixes

Date: 2026-07-07
Status: Ready for PM review and QA recheck
Regression evidence:
[qa-round-1-regression.log](./qa-round-1-regression.log),
[qa-round-1-p2-regression.log](./qa-round-1-p2-regression.log),
[qa-round-1-p2-build.log](./qa-round-1-p2-build.log)
QA sign-off: Pending QA confirmation on staging for booking, coupon, bill, admin, and partner flows.

## PM Summary

This release note consolidates the QA/UAT round 1 P0/P1/P2 fixes and follow-up items by module. The current blocker status for the implemented scope is **0 known P0 blockers after local regression**, pending QA sign-off on staging evidence.

## P0/P1 Fix Matrix

| Priority | Module                   | QA/UAT issue                                                                                                  | Fix delivered                                                                                                                                             | Test / evidence                                                                                           | Status               |
| -------- | ------------------------ | ------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- | -------------------- |
| P0       | Booking                  | Booking actions could be unclear near cutoff, and old bookings should not be edited directly.                 | Enforced cancel-before-cutoff behavior, no inline edit of old booking details, change request/rebook/admin contact path, and per-booking history actions. | Booking service/e2e coverage and booking history screenshot checklist.                                    | Ready for QA recheck |
| P0       | Coupon / QR              | Coupon QR lifecycle needed a single source of truth and stronger controls.                                    | Kept `CouponIssue` as lifecycle source of truth, hardened active/used/expired handling, token guard, revoke/rotate, and partner scan/check-in flow.       | Coupon issue service/e2e coverage, admin coupon detail, member wallet, partner scan screenshot checklist. | Ready for QA recheck |
| P0       | Coupon wallet            | Member wallet must show only coupons saved/issued to the member, not public discovery data.                   | Split `/vi-uu-dai` as member saved-coupon wallet and kept `/uu-dai` as public discovery/claim surface.                                                    | Browser/request evidence checklist for `/member/coupon-issues`; wallet screenshot checklist.              | Ready for QA recheck |
| P0       | Bill                     | Bill submission and reconciliation needed booking/coupon/coupon issue linkage.                                | Added bill submit linkage fields, optional evidence flow, 10-day usage rule, admin reconciliation fields, and audit linkage.                              | Bill service tests, `/gui-hoa-don` screenshots, admin reconciliation screenshot checklist.                | Ready for QA recheck |
| P0       | Admin / Partner          | Admin/partner flows needed role scope, sensitive-data protection, and no release blocker across core modules. | Tightened auth/RBAC/action policies, partner store scoping, guest phone masking, suspended/deleted user rejection, and logout revoke support.             | RBAC matrix e2e, role-scoped Swagger/Postman or UI screenshots.                                           | Ready for QA recheck |
| P1       | Admin bill alias         | Alias `/admin/bills/:id/status` must reject missing reason when `status=REJECTED`.                            | Added alias DTO validation and mapped alias to existing bill review service/audit path.                                                                   | `rbac-matrix.e2e-spec.ts`: approve, reject with reason, reject missing reason.                            | Fixed                |
| P1       | Admin coupon detail      | Admin needed evidence fields to verify QR lifecycle.                                                          | Added admin coupon detail surfaces for payload hash, campaign snapshot, audit logs, revoke/rotate action, metrics, and CSV/export review path.            | Admin coupon detail test/screenshot checklist.                                                            | Ready for QA recheck |
| P1       | Bill review / commission | Bill review needed clearer PM/BA status, commission override, reverse/void and audit behavior.                | Added review/commission workflow support, reviewer timestamps/ids, reverse/void handling, and admin console surfaces.                                     | Backend service tests, frontend admin test/build, admin review screenshot checklist.                      | Ready for QA recheck |
| P1       | Admin notification       | Admin should receive notification for important booking/bill actions.                                         | Completed admin Telegram notification service/module and related docs.                                                                                    | Telegram log/test-message evidence if bot token is configured; local service test evidence otherwise.     | Ready for QA recheck |
| P1       | Release documentation    | Release note must be module-by-module, not only bill/commission/report.                                       | Added this module-by-module release note with bug, module, fix, test/evidence, and status.                                                                | This file plus regression logs.                                                                           | Fixed                |

## P2 Delivered

| Priority | Item                            | Delivered fix                                                                                                                                                                               | Status                          |
| -------- | ------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------- |
| P2       | Advanced auto fraud/reversal    | Added `POST /admin/bills/:billId/fraud-reversal` with dry-run capable risk scoring, duplicate bill/coupon issue checks, fraud alert checks, bill voiding, point ledger reversal, and audit. | Delivered, ready for QA recheck |
| P2       | Export audit trail QA/release   | Added `GET /admin/qa/audit-trail` with module filters and optional CSV payload for release evidence.                                                                                        | Delivered, ready for QA recheck |
| P2       | Dashboard bug trend/SLA sau UAT | Added `GET /admin/qa/uat-dashboard` summarizing bug trend by module/priority/day and SLA breach status from audit/notification events.                                                      | Delivered, ready for QA recheck |

## Regression Evidence

Attach one of the following before final PM/QA sign-off:

- CI run URL: pending, if GitHub Actions run is available for the final branch/commit.
- Raw local log: [qa-round-1-regression.log](./qa-round-1-regression.log).
- Raw P2 local log: [qa-round-1-p2-regression.log](./qa-round-1-p2-regression.log).
- Backend build log: [qa-round-1-p2-build.log](./qa-round-1-p2-build.log).
- P0/P1 targeted regression result: `rbac-matrix.e2e-spec.ts` passed with 1 suite / 16 tests.
- Latest P2 regression result: `nightlife-data.service.spec.ts` passed with 1 suite / 95 tests and `rbac-matrix.e2e-spec.ts` passed with 1 suite / 20 tests.
- Latest backend build result: `nest build` passed after regenerating Prisma Client from the current schema.
- Screenshots/demo: booking, coupon wallet, coupon QR admin, bill submit/review, admin filter/export, partner scan/check-in, P2 fraud reversal dry-run, audit trail export, and UAT dashboard.

## QA Sign-Off Checklist

| Flow    | Sign-off item                                                                                                        | Current status                  |
| ------- | -------------------------------------------------------------------------------------------------------------------- | ------------------------------- |
| Booking | Create booking, cancel before cutoff, block cancellation near cutoff, history action belongs to the correct booking. | Pending QA staging confirmation |
| Coupon  | Save/issue coupon, show wallet-only saved coupons, active QR visible, used/expired QR not scannable.                 | Pending QA staging confirmation |
| Bill    | Submit bill, reject with required reason, approve bill, reconcile booking/coupon/coupon issue linkage.               | Pending QA staging confirmation |
| Admin   | Review bill/coupon evidence, export/filter data, confirm notification evidence.                                      | Pending QA staging confirmation |
| Partner | Store-scoped data, scan/check-in coupon, no sensitive customer detail leakage.                                       | Pending QA staging confirmation |
| P2      | Fraud reversal dry-run/action, QA audit trail export, and UAT dashboard trend/SLA metrics.                           | Pending QA staging confirmation |

## Release Note

- Fixed QA/UAT round 1 P0/P1 blockers across booking, coupon/QR, bill, admin, and partner workflows.
- Added module-by-module evidence requirements so PM/QA can verify each flow independently.
- Enforced `rejectReason` for the admin bill status alias when rejecting a bill.
- Added alias regression coverage for approve, reject with reason, and reject missing reason.
- Delivered P2 fraud/reversal automation, QA audit-trail export, and UAT trend/SLA dashboard endpoints with targeted regression evidence.
