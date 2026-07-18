-- Keep the UUID primary key for internal relations while adding a stable,
-- human-readable sequence number for admin booking lists.
BEGIN;

LOCK TABLE "bookings" IN ACCESS EXCLUSIVE MODE;

ALTER TABLE "bookings"
ADD COLUMN "booking_number" INTEGER;

CREATE SEQUENCE "bookings_booking_number_seq"
AS INTEGER
INCREMENT BY 1
MINVALUE 1
START WITH 1
OWNED BY "bookings"."booking_number";

WITH numbered_bookings AS (
  SELECT
    "id",
    ROW_NUMBER() OVER (ORDER BY "created_at" ASC, "id" ASC)::INTEGER AS "booking_number"
  FROM "bookings"
)
UPDATE "bookings" AS booking
SET "booking_number" = numbered."booking_number"
FROM numbered_bookings AS numbered
WHERE booking."id" = numbered."id";

SELECT SETVAL(
  '"bookings_booking_number_seq"',
  COALESCE(MAX("booking_number"), 1),
  MAX("booking_number") IS NOT NULL
)
FROM "bookings";

ALTER TABLE "bookings"
ALTER COLUMN "booking_number"
SET DEFAULT NEXTVAL('"bookings_booking_number_seq"');

ALTER TABLE "bookings"
ALTER COLUMN "booking_number"
SET NOT NULL;

CREATE UNIQUE INDEX "bookings_booking_number_key"
ON "bookings"("booking_number");

COMMIT;
