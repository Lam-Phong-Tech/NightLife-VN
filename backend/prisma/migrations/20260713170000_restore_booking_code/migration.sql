-- Restore the booking code column required by the current Prisma schema.
-- A prior alignment migration removed the legacy column, which breaks booking
-- creation and partner booking QR scans after the app starts selecting it.

ALTER TABLE "bookings"
ADD COLUMN IF NOT EXISTS "booking_code" TEXT;

UPDATE "bookings"
SET "booking_code" = NULL
WHERE "booking_code" IS NOT NULL
  AND BTRIM("booking_code") = '';

WITH invalid_or_missing AS (
  SELECT "id"
  FROM "bookings"
  WHERE "booking_code" IS NULL
    OR UPPER(REGEXP_REPLACE(BTRIM("booking_code"), '^#', '')) !~ '^BK-[A-Z0-9-]{4,12}$'
    OR LENGTH(UPPER(REGEXP_REPLACE(BTRIM("booking_code"), '^#', ''))) > 15
)
UPDATE "bookings" AS booking
SET "booking_code" = 'BK-' || UPPER(SUBSTRING(MD5(booking."id"::TEXT), 1, 12))
WHERE booking."id" IN (SELECT "id" FROM invalid_or_missing);

UPDATE "bookings"
SET "booking_code" = UPPER(REGEXP_REPLACE(BTRIM("booking_code"), '^#', ''))
WHERE "booking_code" IS NOT NULL;

WITH duplicate_codes AS (
  SELECT "booking_code"
  FROM "bookings"
  GROUP BY "booking_code"
  HAVING COUNT(*) > 1
),
ranked_duplicates AS (
  SELECT
    booking."id",
    ROW_NUMBER() OVER (
      PARTITION BY booking."booking_code"
      ORDER BY booking."created_at", booking."id"
    ) AS duplicate_rank
  FROM "bookings" AS booking
  WHERE booking."booking_code" IN (SELECT "booking_code" FROM duplicate_codes)
)
UPDATE "bookings" AS booking
SET "booking_code" = 'BK-' || UPPER(SUBSTRING(MD5(booking."id"::TEXT || ':' || ranked.duplicate_rank::TEXT), 1, 12))
FROM ranked_duplicates AS ranked
WHERE booking."id" = ranked."id"
  AND ranked.duplicate_rank > 1;

DROP INDEX IF EXISTS "bookings_booking_code_key";

ALTER TABLE "bookings"
ALTER COLUMN "booking_code" TYPE VARCHAR(15) USING "booking_code"::VARCHAR(15),
ALTER COLUMN "booking_code" SET NOT NULL;

CREATE UNIQUE INDEX "bookings_booking_code_key"
ON "bookings"("booking_code");
