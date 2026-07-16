# Handoff Report — Seeding Tours & Admin Coupons/Campaigns

## 1. Observation

In `backend/prisma/schema.prisma`:
- **Tour** model (lines 1363-1381):
  ```prisma
  model Tour {
    id             String          @id @default(uuid()) @db.Uuid
    title          String
    subtitle       String?
    city           String          @default("Hanoi")
    durationHours  Int             @default(4)       @map("duration_hours")
    priceTier      Int             @default(3)       @map("price_tier")
    coverUrl       String?         @map("cover_url")
    status         ProfileStatus   @default(ACTIVE)
    stops          TourStop[]
    departureTimes String[]        @default([])      @map("departure_times")
    ...
  ```
- **TourStop** model (lines 1383-1396):
  ```prisma
  model TourStop {
    id        String   @id @default(uuid()) @db.Uuid
    tourId    String   @map("tour_id") @db.Uuid
    storeId   String   @map("store_id") @db.Uuid
    order     Int      @default(1)
    tour      Tour     @relation(fields: [tourId], references: [id], onDelete: Cascade)
    store     Store    @relation(fields: [storeId], references: [id], onDelete: Cascade)
    createdAt DateTime @default(now())   @map("created_at")

    @@unique([tourId, storeId])
    ...
  ```
- **AdminCoupon** model (lines 1224-1248):
  ```prisma
  model AdminCoupon {
    id              String             @id @default(uuid()) @db.Uuid
    code            String             @unique
    qrPayloadHash   String             @unique @map("qr_payload_hash")
    name            String
    discountType    DiscountType       @map("discount_type")
    discountValue   Int                @map("discount_value")
    targetStores    String[]           @default([]) @map("target_stores")
    targetAudiences String[]           @default([]) @map("target_audiences")
    startsAt        DateTime           @map("starts_at")
    endsAt          DateTime?          @map("ends_at")
    usageLimit      Int?               @map("usage_limit")
    usedCount       Int                @default(0) @map("used_count")
    status          CouponStatus       @default(ACTIVE)
    scans           AdminCouponScan[]
    issues          AdminCouponIssue[]
    ...
  ```
- **AdminCouponScan** model (lines 1250-1261):
  ```prisma
  model AdminCouponScan {
    id              String      @id @default(uuid()) @db.Uuid
    adminCouponId   String      @map("admin_coupon_id") @db.Uuid
    adminCoupon     AdminCoupon @relation(fields: [adminCouponId], references: [id], onDelete: Restrict)
    storeId         String      @map("store_id") @db.Uuid
    scannedByUserId String?     @map("scanned_by_user_id") @db.Uuid
    scannedAt       DateTime    @default(now()) @map("scanned_at")
    ...
  ```
- **AdminCouponIssue** model (lines 1263-1292):
  ```prisma
  model AdminCouponIssue {
    id              String            @id @default(uuid()) @db.Uuid
    adminCouponId   String            @map("admin_coupon_id") @db.Uuid
    userId          String?           @map("user_id") @db.Uuid
    guestId         String?           @map("guest_id") @db.Uuid
    storeId         String?           @map("store_id") @db.Uuid
    scannedByUserId String?           @map("scanned_by_user_id") @db.Uuid
    adminCoupon     AdminCoupon       @relation(fields: [adminCouponId], references: [id], onDelete: Restrict)
    user            User?             @relation("AdminCouponIssueUser", fields: [userId], references: [id], onDelete: SetNull)
    guest           Guest?            @relation(fields: [guestId], references: [id], onDelete: SetNull)
    store           Store?            @relation(fields: [storeId], references: [id], onDelete: SetNull)
    scannedBy       User?             @relation("AdminCouponIssueScanner", fields: [scannedByUserId], references: [id], onDelete: SetNull)
    code            String            @unique
    qrPayloadHash   String            @unique @map("qr_payload_hash")
    status          CouponIssueStatus @default(ISSUED)
    expiresAt       DateTime?         @map("expires_at")
    usedAt          DateTime?         @map("used_at")
    revokedAt       DateTime?         @map("revoked_at")
    ...
  ```
- **Campaign** model (lines 1344-1355):
  ```prisma
  model Campaign {
    id              String         @id @default(uuid()) @db.Uuid
    name            String
    discountType    DiscountType   @map("discount_type")
    discountValue   Int            @map("discount_value")
    targetStoreId   String?        @map("target_store_id") @db.Uuid
    targetStore     Store?         @relation(fields: [targetStoreId], references: [id], onDelete: SetNull)
    startsAt        DateTime?      @map("starts_at")
    endsAt          DateTime?      @map("ends_at")
    status          CampaignStatus @default(DRAFT)
    ...
  ```

---

## 2. Logic Chain

1. **Upsert Constraint Resolution**:
   - `Tour` and `Campaign` have only `id` as unique constraints. Direct upserts on these models require deterministic IDs (Observation 1).
   - Generate deterministic UUIDs using `seedUuid('tour-' + key)` and `seedUuid('campaign-' + key)` to allow safe, idempotent seeding (Observation 1).
   - `TourStop` has compound unique key `[tourId, storeId]`. Upserting should target `tourId_storeId` to guarantee unique mappings (Observation 1).
   - `AdminCoupon` and `AdminCouponIssue` have unique `code` and `qrPayloadHash` constraints. Resolved by querying by `code` in the `where` clause and defining a deterministic `qrPayloadHash` using the existing `seedHash` helper (Observation 1).
   - `AdminCouponScan` has only `id` which can be generated deterministically via `seedUuid('admin-coupon-scan-' + scanKey)` (Observation 1).
2. **Relationships & Integration**:
   - `TourStop` and `AdminCouponScan`/`Issue` relate to `Store` (Observation 1). These should resolve stores using the slugs returned by `seedStores` in `04-stores.ts` (Observation 2).
   - `AdminCouponIssue` relates to walk-in `Guest` profiles. These are resolved by mapping keys to the `guests` record returned from `seedBookingsAndBills` in `12-bookings-bills.ts` (Observation 2).
   - `AdminCouponIssue` also relates to registered `User` profiles (e.g. `member`, `vip`). These should be resolved from the `users` object returned by `seedUsers` in `01-users.ts` (Observation 2).

---

## 3. Caveats

- We assumed that `Tour` and `Campaign` do not have hidden business logic requirements for custom uniqueness constraints that are not declared in `schema.prisma`. 
- Seeding utilizes existing guest profiles `g1`, `g2` etc. If the seed data in `12-bookings-bills.ts` is changed or removed, the corresponding mappings in `17-admin-coupons-campaigns.ts` must be adjusted accordingly.

---

## 4. Conclusion

The plan is actionable and complete. The new seed scripts `16-tours.ts` and `17-admin-coupons-campaigns.ts` will integrate seamlessly into `index.ts` right after `seedSystemConfigs(prisma)`. All data matches the Prisma schema validations and compound index uniqueness.

---

## 5. Verification Method

To verify the implementation once executed by the implementing agent:
1. Run compilation/build:
   ```bash
   npm run build
   ```
2. Execute the Prisma database seeding command:
   ```bash
   npx prisma db seed
   ```
3. Run the verification script:
   ```bash
   npm run seed:check
   ```
4. Verify that counts for `Tour`, `TourStop`, `AdminCoupon`, `AdminCouponScan`, `AdminCouponIssue`, and `Campaign` are non-zero.
