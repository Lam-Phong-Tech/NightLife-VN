# Coupon QR Jira Evidence Checklist

Attach these command outputs to Jira for the coupon QR lifecycle review:

```bash
pnpm build
pnpm test
NIGHTLIFE_RUN_DB_E2E=true pnpm test:e2e
```

CI coverage:

- `.github/workflows/deploy-backend.yml` starts Postgres, runs Prisma migrate, sets `NIGHTLIFE_RUN_DB_E2E=true`, then runs `pnpm test` and `pnpm test:e2e`.
- The same CI job fails if production QR runtime evidence is missing: `COUPON_QR_SECRET` must be set, must not equal the dev fallback, and `COUPON_QR_PARTNER_URL` must be an absolute URL.

Runtime/API evidence covered by `backend/test/coupon-qr-flow.e2e-spec.ts`:

- Guest claim returns `ISSUED`, `discountPercent = 5`, and `expiresAt` within 24 hours.
- Member claim returns `ISSUED`, `discountPercent = 8`, and `expiresAt` within 7 days.
- VIP claim returns `ISSUED` and `discountPercent = 10`.
- Partner signed QR scan returns `ISSUED`.
- Partner confirm returns `USED`.
- Duplicate confirm returns `422 Coupon issue has already been used`.
- Scheduled expiry changes stale `ISSUED` coupon issues to `EXPIRED`.
- Member wallet responses hide the scannable QR image for `USED` and `EXPIRED` issues.
- `backend/test/coupon-issue-db-concurrency.e2e-spec.ts` runs against a real database when `NIGHTLIFE_RUN_DB_E2E=true` and proves one-time update concurrency plus rollback when booking creation fails after Booking QR issue creation begins.

Production environment evidence to attach as a masked deploy/CI screenshot:

```bash
NODE_ENV=production
COUPON_QR_SECRET=<strong-random-secret-32+ chars>
COUPON_QR_PARTNER_URL=https://domain/partner
```

Do not paste the real `COUPON_QR_SECRET` value into Jira. A masked secret screenshot or CI variable evidence is enough, as long as it proves production does not use the dev fallback.

Security note for signed scan:

- `POST /partner/coupon-issues/scan` receives only an opaque signed token, so controller-level `ActionPolicyGuard` cannot safely check store scope before the token is resolved.
- The service resolves the token to a coupon issue, then calls `ensureStoreAccess(user, issue.coupon.storeId, 'coupon.scan')` before returning scan evidence or writing audit/notification logs.

P1 admin/partner evidence:

- `GET /admin/coupon-issues` returns `qrPayloadHash`, `campaignSnapshot`, and related `auditLogs` for admin detail review.
- Admin Coupon Issue panel has a detail action for QR hash, campaign snapshot, and audit log rows, plus filter coverage for `ISSUED`, `USED`, `EXPIRED`, and `REVOKED`.
- Admin can use `PATCH /admin/coupon-issues/:issueId/revoke-qr` to revoke a leaked token and `POST /admin/coupon-issues/:issueId/rotate-qr` to rotate the signed token while keeping the issue `ISSUED`.
- Partner demo should open the dedicated `MVP P0 Scan/check-in` tab first; dashboard, settlement, listing CMS, and settings are P1 panels.

Source-of-truth note:

- `CouponIssue` is the source-of-truth for Booking QR coupon/discount lifecycle, token hash revocation, campaign snapshot, booking link, bill link, and reconciliation export.
- `BookingQr` is the booking attendance/email QR model only; do not use it to decide coupon discount state or campaign coupon reconciliation.

P2 backlog/QA tasks kept separate from MVP sign-off:

- Offline queue QA: airplane-mode/no-network scan, replay after reconnect, max 3 retry attempts, cleanup after 24 hours, and duplicate replay prevention evidence.
- Fraud analytics: current claim signals include masked IP/device/session/user-agent fingerprints; admin report funnel now uses `CouponIssue` for claim -> scan -> confirm USED -> bill.
- Analytics dashboard/export: Admin Coupon Issue panel exports QR lifecycle CSV for campaign reconciliation.
- QR rotation/token revocation: revoke leaked QR tokens, rotate issue token, keep signing-secret overlap through `COUPON_QR_PREVIOUS_SECRETS`, and reject revoked token hashes at scan time.
