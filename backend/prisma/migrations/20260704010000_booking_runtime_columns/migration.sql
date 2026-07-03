-- Keep booking creation/read paths aligned with the current Prisma schema.
ALTER TABLE "bookings"
ADD COLUMN IF NOT EXISTS "discount_snapshot" JSONB NOT NULL DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS "booking_code" TEXT,
ADD COLUMN IF NOT EXISTS "customer_type" TEXT NOT NULL DEFAULT 'GUEST',
ADD COLUMN IF NOT EXISTS "customer_name_snapshot" TEXT NOT NULL DEFAULT '',
ADD COLUMN IF NOT EXISTS "customer_email_snapshot" TEXT NOT NULL DEFAULT '',
ADD COLUMN IF NOT EXISTS "source" TEXT,
ADD COLUMN IF NOT EXISTS "expires_at" TIMESTAMP(3),
ADD COLUMN IF NOT EXISTS "completed_at" TIMESTAMP(3);

ALTER TABLE "bookings" ALTER COLUMN "discount_snapshot" DROP DEFAULT;
ALTER TABLE "bookings" ALTER COLUMN "customer_type" DROP DEFAULT;
ALTER TABLE "bookings" ALTER COLUMN "customer_name_snapshot" DROP DEFAULT;
ALTER TABLE "bookings" ALTER COLUMN "customer_email_snapshot" DROP DEFAULT;

CREATE UNIQUE INDEX IF NOT EXISTS "bookings_booking_code_key" ON "bookings"("booking_code");
