-- Create admin coupon tables that are present in the Prisma schema but were
-- missing from the original migration chain. Use IF NOT EXISTS so existing
-- staging databases can recover safely while fresh CI databases can migrate.

CREATE TABLE IF NOT EXISTS "admin_coupons" (
    "id" UUID NOT NULL,
    "code" TEXT NOT NULL,
    "qr_payload_hash" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "discount_type" "DiscountType" NOT NULL,
    "discount_value" INTEGER NOT NULL,
    "target_stores" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "target_audiences" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "starts_at" TIMESTAMP(3) NOT NULL,
    "ends_at" TIMESTAMP(3),
    "usage_limit" INTEGER,
    "used_count" INTEGER NOT NULL DEFAULT 0,
    "status" "CouponStatus" NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "admin_coupons_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "admin_coupon_scans" (
    "id" UUID NOT NULL,
    "admin_coupon_id" UUID NOT NULL,
    "store_id" UUID NOT NULL,
    "scanned_by_user_id" UUID,
    "scanned_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "admin_coupon_scans_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "admin_coupon_issues" (
    "id" UUID NOT NULL,
    "admin_coupon_id" UUID NOT NULL,
    "user_id" UUID,
    "guest_id" UUID,
    "store_id" UUID,
    "scanned_by_user_id" UUID,
    "code" TEXT NOT NULL,
    "qr_payload_hash" TEXT NOT NULL,
    "status" "CouponIssueStatus" NOT NULL DEFAULT 'ISSUED',
    "expires_at" TIMESTAMP(3),
    "used_at" TIMESTAMP(3),
    "revoked_at" TIMESTAMP(3),
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "admin_coupon_issues_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "admin_coupons" ADD COLUMN IF NOT EXISTS "deleted_at" TIMESTAMP(3);

CREATE UNIQUE INDEX IF NOT EXISTS "admin_coupons_code_key" ON "admin_coupons"("code");
CREATE UNIQUE INDEX IF NOT EXISTS "admin_coupons_qr_payload_hash_key" ON "admin_coupons"("qr_payload_hash");
CREATE INDEX IF NOT EXISTS "admin_coupons_status_idx" ON "admin_coupons"("status");
CREATE INDEX IF NOT EXISTS "admin_coupons_starts_at_ends_at_idx" ON "admin_coupons"("starts_at", "ends_at");
CREATE INDEX IF NOT EXISTS "admin_coupons_deleted_at_idx" ON "admin_coupons"("deleted_at");

CREATE INDEX IF NOT EXISTS "admin_coupon_scans_admin_coupon_id_idx" ON "admin_coupon_scans"("admin_coupon_id");
CREATE INDEX IF NOT EXISTS "admin_coupon_scans_store_id_idx" ON "admin_coupon_scans"("store_id");

CREATE UNIQUE INDEX IF NOT EXISTS "admin_coupon_issues_code_key" ON "admin_coupon_issues"("code");
CREATE UNIQUE INDEX IF NOT EXISTS "admin_coupon_issues_qr_payload_hash_key" ON "admin_coupon_issues"("qr_payload_hash");
CREATE INDEX IF NOT EXISTS "admin_coupon_issues_admin_coupon_id_idx" ON "admin_coupon_issues"("admin_coupon_id");
CREATE INDEX IF NOT EXISTS "admin_coupon_issues_user_id_idx" ON "admin_coupon_issues"("user_id");
CREATE INDEX IF NOT EXISTS "admin_coupon_issues_guest_id_idx" ON "admin_coupon_issues"("guest_id");
CREATE INDEX IF NOT EXISTS "admin_coupon_issues_store_id_idx" ON "admin_coupon_issues"("store_id");
CREATE INDEX IF NOT EXISTS "admin_coupon_issues_scanned_by_user_id_idx" ON "admin_coupon_issues"("scanned_by_user_id");
CREATE INDEX IF NOT EXISTS "admin_coupon_issues_status_idx" ON "admin_coupon_issues"("status");

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'admin_coupon_scans_admin_coupon_id_fkey'
  ) THEN
    ALTER TABLE "admin_coupon_scans"
      ADD CONSTRAINT "admin_coupon_scans_admin_coupon_id_fkey"
      FOREIGN KEY ("admin_coupon_id") REFERENCES "admin_coupons"("id")
      ON DELETE RESTRICT ON UPDATE CASCADE;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'admin_coupon_scans_store_id_fkey'
  ) THEN
    ALTER TABLE "admin_coupon_scans"
      ADD CONSTRAINT "admin_coupon_scans_store_id_fkey"
      FOREIGN KEY ("store_id") REFERENCES "stores"("id")
      ON DELETE RESTRICT ON UPDATE CASCADE;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'admin_coupon_scans_scanned_by_user_id_fkey'
  ) THEN
    ALTER TABLE "admin_coupon_scans"
      ADD CONSTRAINT "admin_coupon_scans_scanned_by_user_id_fkey"
      FOREIGN KEY ("scanned_by_user_id") REFERENCES "users"("id")
      ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'admin_coupon_issues_admin_coupon_id_fkey'
  ) THEN
    ALTER TABLE "admin_coupon_issues"
      ADD CONSTRAINT "admin_coupon_issues_admin_coupon_id_fkey"
      FOREIGN KEY ("admin_coupon_id") REFERENCES "admin_coupons"("id")
      ON DELETE RESTRICT ON UPDATE CASCADE;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'admin_coupon_issues_user_id_fkey'
  ) THEN
    ALTER TABLE "admin_coupon_issues"
      ADD CONSTRAINT "admin_coupon_issues_user_id_fkey"
      FOREIGN KEY ("user_id") REFERENCES "users"("id")
      ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'admin_coupon_issues_guest_id_fkey'
  ) THEN
    ALTER TABLE "admin_coupon_issues"
      ADD CONSTRAINT "admin_coupon_issues_guest_id_fkey"
      FOREIGN KEY ("guest_id") REFERENCES "guests"("id")
      ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'admin_coupon_issues_store_id_fkey'
  ) THEN
    ALTER TABLE "admin_coupon_issues"
      ADD CONSTRAINT "admin_coupon_issues_store_id_fkey"
      FOREIGN KEY ("store_id") REFERENCES "stores"("id")
      ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'admin_coupon_issues_scanned_by_user_id_fkey'
  ) THEN
    ALTER TABLE "admin_coupon_issues"
      ADD CONSTRAINT "admin_coupon_issues_scanned_by_user_id_fkey"
      FOREIGN KEY ("scanned_by_user_id") REFERENCES "users"("id")
      ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;
