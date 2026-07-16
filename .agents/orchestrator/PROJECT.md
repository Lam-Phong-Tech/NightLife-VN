# Project: Seed Data Sync & 100% Schema Coverage

## Architecture
- **Database Seeding**:
  - Update `backend/prisma/seed/13-api-fixtures.ts` to seed `MemberFavoriteStore`, `SupportTicket`, and `SupportMessage`.
  - Create `backend/prisma/seed/16-tours.ts` to seed `Tour` and `TourStop`.
  - Create `backend/prisma/seed/17-admin-coupons-campaigns.ts` to seed `AdminCoupon`, `AdminCouponScan`, `AdminCouponIssue`, and `Campaign`.
  - Update `backend/prisma/seed/index.ts` to import and call the seeding functions, output summaries, and verify coverage.
- **Verification**:
  - Update `backend/prisma/seed/verify.ts` to add check functions and assertions for all 9 new entities to ensure 100% coverage.
- **VPS Deployment**:
  - Create `backend/seed_vps_full.py` using `paramiko` to upload the prisma seed directory files and execute the seed script on the remote VPS (45.119.83.233).

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|---|---|---|---|
| 1 | Explore & Analyze | Examine schema.prisma, current seed files, verify.ts, and existing scripts | None | IN_PROGRESS |
| 2 | Implement Seed Fixtures | Update 13-api-fixtures.ts, create 16-tours.ts, create 17-admin-coupons-campaigns.ts | M1 | PLANNED |
| 3 | Integrate and Verify | Update index.ts and verify.ts, run local seeds and check coverage | M2 | PLANNED |
| 4 | Deploy VPS Script | Create seed_vps_full.py, execute tests/dry-run checks | M3 | PLANNED |
| 5 | Forensic Audit & Commit | Run Forensic Auditor checks, run git add, commit, and push | M4 | PLANNED |

## Code Layout
- Schema definition: `backend/prisma/schema.prisma`
- Seeding Index: `backend/prisma/seed/index.ts`
- Seeding Fixtures:
  - `backend/prisma/seed/13-api-fixtures.ts` (Update)
  - `backend/prisma/seed/16-tours.ts` (Create)
  - `backend/prisma/seed/17-admin-coupons-campaigns.ts` (Create)
- Seeding Verification: `backend/prisma/seed/verify.ts` (Update)
- VPS script: `backend/seed_vps_full.py` (Create)
