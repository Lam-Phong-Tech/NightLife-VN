-- Bring the migration history in line with schema.prisma without dropping
-- legacy booking columns that may still be useful to existing installations.

ALTER TYPE "CastStatus" ADD VALUE IF NOT EXISTS 'PENDING_REVIEW';

CREATE TYPE "BookingQrStatus" AS ENUM (
  'ACTIVE',
  'USED',
  'EXPIRED',
  'REVOKED'
);

ALTER TABLE "casts"
ADD COLUMN "youtube_links" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];

ALTER TABLE "bookings"
ADD COLUMN "cancel_reason" TEXT;

DROP INDEX IF EXISTS "bookings_booking_code_key";

ALTER TABLE "bookings"
DROP COLUMN "booking_code",
DROP COLUMN "completed_at",
DROP COLUMN "customer_email_snapshot",
DROP COLUMN "customer_name_snapshot",
DROP COLUMN "customer_type",
DROP COLUMN "discount_snapshot",
DROP COLUMN "expires_at",
DROP COLUMN "source";

ALTER TABLE "bills"
ADD COLUMN "submitted_by_partner_account_id" UUID,
ADD COLUMN "submitted_by_user_id" UUID,
ADD COLUMN "submitter_type" TEXT;

UPDATE "bills"
SET "submitter_type" = CASE
  WHEN "user_id" IS NOT NULL THEN 'MEMBER'
  ELSE 'PARTNER'
END
WHERE "submitter_type" IS NULL;

ALTER TABLE "bills"
ALTER COLUMN "submitter_type" SET NOT NULL;

UPDATE "guests"
SET "email" = CONCAT('legacy-', "id"::text, '@guest.nightlife.vn')
WHERE "email" IS NULL;

ALTER TABLE "guests"
ALTER COLUMN "email" SET NOT NULL;

CREATE TABLE "booking_qrs" (
  "id" UUID NOT NULL,
  "booking_id" UUID NOT NULL,
  "store_id" UUID NOT NULL,
  "code" TEXT NOT NULL,
  "qr_payload_hash" TEXT NOT NULL,
  "discount_snapshot" JSONB NOT NULL,
  "valid_from" TIMESTAMP(3) NOT NULL,
  "expires_at" TIMESTAMP(3) NOT NULL,
  "status" "BookingQrStatus" NOT NULL DEFAULT 'ACTIVE',
  "used_at" TIMESTAMP(3),
  "scanned_by_partner_account_id" UUID,
  "revoked_at" TIMESTAMP(3),
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "booking_qrs_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "booking_qrs_booking_id_key"
ON "booking_qrs"("booking_id");

CREATE UNIQUE INDEX "booking_qrs_code_key"
ON "booking_qrs"("code");

CREATE UNIQUE INDEX "booking_qrs_qr_payload_hash_key"
ON "booking_qrs"("qr_payload_hash");

CREATE INDEX "booking_qrs_store_id_idx"
ON "booking_qrs"("store_id");

CREATE INDEX "booking_qrs_scanned_by_partner_account_id_idx"
ON "booking_qrs"("scanned_by_partner_account_id");

CREATE INDEX "booking_qrs_status_idx"
ON "booking_qrs"("status");

ALTER TABLE "booking_qrs"
ADD CONSTRAINT "booking_qrs_booking_id_fkey"
FOREIGN KEY ("booking_id") REFERENCES "bookings"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "booking_qrs"
ADD CONSTRAINT "booking_qrs_store_id_fkey"
FOREIGN KEY ("store_id") REFERENCES "stores"("id")
ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "booking_qrs"
ADD CONSTRAINT "booking_qrs_scanned_by_partner_account_id_fkey"
FOREIGN KEY ("scanned_by_partner_account_id") REFERENCES "partner_accounts"("id")
ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "bills"
ADD CONSTRAINT "bills_submitted_by_user_id_fkey"
FOREIGN KEY ("submitted_by_user_id") REFERENCES "users"("id")
ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "bills"
ADD CONSTRAINT "bills_submitted_by_partner_account_id_fkey"
FOREIGN KEY ("submitted_by_partner_account_id") REFERENCES "partner_accounts"("id")
ON DELETE SET NULL ON UPDATE CASCADE;

CREATE TABLE "categories" (
  "id" UUID NOT NULL,
  "name" TEXT NOT NULL,
  "slug" TEXT NOT NULL,
  "description" TEXT,
  "type" TEXT NOT NULL DEFAULT 'BLOG',
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "categories_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "categories_slug_key" ON "categories"("slug");

ALTER INDEX "ranking_configs_target_type_city_code_category_scope_pin_rank_i"
RENAME TO "ranking_configs_target_type_city_code_category_scope_pin_ra_idx";
