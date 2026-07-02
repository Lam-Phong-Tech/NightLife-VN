# Coupon QR Jira Evidence Checklist

Attach these command outputs to Jira for the coupon QR lifecycle review:

```bash
pnpm build
pnpm test
pnpm test:e2e
```

Runtime/API evidence covered by `backend/test/coupon-qr-flow.e2e-spec.ts`:

- Guest claim returns `ISSUED`, `discountPercent = 5`, and `expiresAt` within 24 hours.
- Member claim returns `ISSUED`, `discountPercent = 8`, and `expiresAt` within 7 days.
- VIP claim returns `ISSUED` and `discountPercent = 10`.
- Partner signed QR scan returns `ISSUED`.
- Partner confirm returns `USED`.
- Duplicate confirm returns `422 Coupon issue has already been used`.
- Scheduled expiry changes stale `ISSUED` coupon issues to `EXPIRED`.
- Member wallet responses hide the scannable QR image for `USED` and `EXPIRED` issues.

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
