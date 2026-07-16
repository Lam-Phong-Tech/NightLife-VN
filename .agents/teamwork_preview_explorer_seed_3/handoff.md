# Handoff Report — Seed Data & VPS Deployment Planning

## 1. Observation
- **Models defined in `backend/prisma/schema.prisma`:**
  - `MemberFavoriteStore` defined at line 591:
    ```prisma
    model MemberFavoriteStore {
      id        String   @id @default(uuid()) @db.Uuid
      userId    String   @map("user_id") @db.Uuid
      storeId   String   @map("store_id") @db.Uuid
      user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
      store     Store    @relation(fields: [storeId], references: [id], onDelete: Cascade)
      createdAt DateTime @default(now()) @map("created_at")

      @@unique([userId, storeId])
      ...
    }
    ```
  - `AdminCoupon` defined at line 1224.
  - `AdminCouponScan` defined at line 1250.
  - `AdminCouponIssue` defined at line 1263.
  - `SupportTicket` defined at line 1307.
  - `SupportMessage` defined at line 1327.
  - `Campaign` defined at line 1344.
  - `Tour` defined at line 1363.
  - `TourStop` defined at line 1383.
- **Seeding implementation inside `backend/prisma/seed/index.ts`:**
  - Imports all seed sub-modules (00 to 15) and executes them inside `seedAll` (lines 29-75).
  - Verification is run at line 74: `await verifySeedCoverage(prisma, options.profile, options.now);`.
  - A summary log is printed to console (lines 79-110).
- **Verification checks inside `backend/prisma/seed/verify.ts`:**
  - Standard counts verification checked in `modelCounts` (lines 46-79) for 32 models.
  - Enum and status validation assertions performed when `profile === 'full'` (lines 425-580).
  - Missing entities: None of the 9 new models nor the existing `SystemConfig` model are currently counted/checked.
- **Remote deployment setup:**
  - `backend/seed_vps.py` connects to `45.119.83.233` with user `root` and password `Tailoc@2026` via Paramiko (lines 4-8), creates an inline string `seed-test-bills.ts` on the remote server, and runs it using `npx tsx seed-test-bills.ts` (lines 116-129).
  - Seeding command defined in `backend/package.json` under `"seed"` config (line 27): `"seed": "ts-node prisma/seed.ts"`.

---

## 2. Logic Chain
1. To integrate the new tours and admin-coupons-campaigns seeds, new modules (`16-tours.ts` and `17-admin-coupons-campaigns.ts`) must be created because they seed distinct entities that aren't addressed by older modules (00 to 15).
2. `MemberFavoriteStore`, `SupportTicket`, and `SupportMessage` relate directly to user/guest workflows and must be integrated into `13-api-fixtures.ts` to leverage existing user and store mappings without creating separate seed modules.
3. To reach 100% schema coverage in `verify.ts`, the `modelCounts` and `demoRequiredModels`/`requiredModels` arrays must include all 9 new models plus the currently missing `SystemConfig` model. This brings the checked model count to 42.
4. During full lifecycle profile validation, distinct status/senderType enum values must be queried and compared using `requireStatuses`/`requireValues` to guarantee all possible transitions are seeded.
5. In order to deploy the new seed code to the VPS, the script must copy the entire updated local `backend/prisma/seed/` folder and `backend/prisma/seed.ts` file over to the remote path (`/var/www/api.demonightlight.test9.io.vn/prisma`) before executing `npx prisma db seed`. A new Python script, `seed_vps_full.py`, will accomplish this via Paramiko SSH/SFTP PUT commands.

---

## 3. Caveats
- Since this is a read-only investigation, the connection to VPS IP `45.119.83.233` could not be tested directly. We assume that the root credentials and SSH/SFTP access configured in `backend/seed_vps.py` remain valid and accessible.
- We assumed that the local `STORAGE_LOCAL_DIR` and remote storage paths do not require special permissions beyond the default root setup on the VPS.

---

## 4. Conclusion
1. **Seeding Plan:** Implement favorite store, support ticket, and message seeding in `13-api-fixtures.ts`. Create new modules `16-tours.ts` and `17-admin-coupons-campaigns.ts`. Wire them into `seedAll` inside `index.ts`, logging details of the new seeding metrics.
2. **Coverage/Verification Plan:** Update `verify.ts` to count all 42 models, check for non-zero counts of the 9 new entities + `SystemConfig`, and check that all statuses for the new enums (`SupportTicketStatus`, `SupportSenderType`, `CampaignStatus`, `AdminCoupon`, `AdminCouponIssue`) are fully covered when running under `full` profile.
3. **VPS Deployment Plan:** Add `seed_vps_full.py` to recursively copy local seed files to `/var/www/api.demonightlight.test9.io.vn/prisma` and run `npx prisma db seed` on the remote server.

---

## 5. Verification Method
- **Local Verification:**
  - Run `npm run seed` locally to execute the seed process under `demo` profile. Ensure it passes without exceptions.
  - Run `npm run seed:full` to verify coverage of all 42 models and their distinct status configurations.
- **Remote Verification:**
  - Execute `python backend/seed_vps_full.py` and inspect console outputs to verify successful upload logs and remote execution return codes (Exit Status: 0).
