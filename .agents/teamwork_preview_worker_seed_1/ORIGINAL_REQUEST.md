## 2026-07-16T10:20:47Z
Implement the comprehensive database seed data sync to cover 9 missing entities and write a VPS deployment script.

### Tasks to Perform:
1. Update `backend/prisma/seed/13-api-fixtures.ts` to seed `MemberFavoriteStore`, `SupportTicket`, and `SupportMessage` using Prisma upsert with stable, deterministic UUIDs (refer to the Explorer 1 report).
2. Create `backend/prisma/seed/16-tours.ts` to seed `Tour` and `TourStop` models (refer to Explorer 2/3 reports).
3. Create `backend/prisma/seed/17-admin-coupons-campaigns.ts` to seed `AdminCoupon`, `AdminCouponScan`, `AdminCouponIssue`, and `Campaign` models (refer to Explorer 2/3 reports).
4. Update `backend/prisma/seed/index.ts` to integrate the new files, call the seeding functions, and output summary logs for the new entities.
5. Update `backend/prisma/seed/14-full-fixtures.ts` to include extra states/statuses for these new models (e.g. SupportTicket CLOSED, SupportMessage SYSTEM, Campaign PAUSED/DRAFT/EXPIRED/DELETED, Tour HIDDEN/DELETED, AdminCoupon DRAFT/PAUSED/EXPIRED/ARCHIVED/DELETED, AdminCouponIssue EXPIRED/REVOKED) under the `full` profile.
6. Update `backend/prisma/seed/verify.ts` to include assertions and distinct status check queries for all 9 new entities + `SystemConfig` (bringing total checked models from 32 to 42 for 100% schema coverage).
7. Create `backend/seed_vps_full.py` using paramiko to connect to VPS (45.119.83.233), copy/deploy new seed files, and execute the prisma seed command.

### Verification:
1. Run local build to verify no compilation issues:
   `pnpm run build` inside backend directory.
2. Run database migration and seed:
   `pnpm run seed` and `pnpm run seed:full` inside backend.
3. Run verification check script:
   `pnpm run seed:check` inside backend, verifying it returns 100% success (42/42 required models covered).
4. Verify the python deployment script runs or compiles correctly.

### Git Rules:
- Git add, commit and push changes:
  `git add .`
  `git commit -m "feat(seed): implement seed data sync for 9 missing entities and VPS deployment"`
  `git push`
