CREATE TYPE "TourBookingStatus" AS ENUM (
  'REQUESTED',
  'CONFIRMED',
  'IN_PROGRESS',
  'COMPLETED',
  'CANCELLED',
  'NO_SHOW'
);

CREATE TYPE "TourBookingQrStatus" AS ENUM (
  'ACTIVE',
  'COMPLETED',
  'EXPIRED',
  'REVOKED'
);

CREATE TABLE "tour_bookings" (
  "id" UUID NOT NULL,
  "booking_code" VARCHAR(15) NOT NULL,
  "tour_id" UUID NOT NULL,
  "user_id" UUID,
  "guest_id" UUID NOT NULL,
  "status" "TourBookingStatus" NOT NULL DEFAULT 'REQUESTED',
  "scheduled_at" TIMESTAMP(3) NOT NULL,
  "party_size" INTEGER NOT NULL DEFAULT 1,
  "duration_hours_snapshot" INTEGER NOT NULL,
  "title_snapshot" TEXT NOT NULL,
  "itinerary_snapshot" JSONB NOT NULL,
  "note" TEXT,
  "completed_at" TIMESTAMP(3),
  "cancelled_at" TIMESTAMP(3),
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "tour_bookings_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "tour_booking_qrs" (
  "id" UUID NOT NULL,
  "tour_booking_id" UUID NOT NULL,
  "code" TEXT NOT NULL,
  "qr_payload_hash" TEXT NOT NULL,
  "status" "TourBookingQrStatus" NOT NULL DEFAULT 'ACTIVE',
  "valid_from" TIMESTAMP(3) NOT NULL,
  "expires_at" TIMESTAMP(3) NOT NULL,
  "completed_at" TIMESTAMP(3),
  "revoked_at" TIMESTAMP(3),
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "tour_booking_qrs_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "bookings"
ADD COLUMN "tour_booking_id" UUID,
ADD COLUMN "tour_stop_id" UUID,
ADD COLUMN "tour_stop_order" INTEGER;

CREATE TABLE "tour_booking_check_ins" (
  "id" UUID NOT NULL,
  "tour_booking_id" UUID NOT NULL,
  "booking_id" UUID NOT NULL,
  "tour_booking_qr_id" UUID NOT NULL,
  "store_id" UUID NOT NULL,
  "actor_id" UUID,
  "idempotency_key" TEXT,
  "source" TEXT NOT NULL DEFAULT 'ONLINE',
  "client_scanned_at" TIMESTAMP(3),
  "checked_in_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "tour_booking_check_ins_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "tour_bookings_booking_code_key" ON "tour_bookings"("booking_code");
CREATE INDEX "tour_bookings_tour_id_idx" ON "tour_bookings"("tour_id");
CREATE INDEX "tour_bookings_user_id_idx" ON "tour_bookings"("user_id");
CREATE INDEX "tour_bookings_guest_id_idx" ON "tour_bookings"("guest_id");
CREATE INDEX "tour_bookings_status_idx" ON "tour_bookings"("status");
CREATE INDEX "tour_bookings_scheduled_at_idx" ON "tour_bookings"("scheduled_at");

CREATE UNIQUE INDEX "tour_booking_qrs_tour_booking_id_key" ON "tour_booking_qrs"("tour_booking_id");
CREATE UNIQUE INDEX "tour_booking_qrs_code_key" ON "tour_booking_qrs"("code");
CREATE UNIQUE INDEX "tour_booking_qrs_qr_payload_hash_key" ON "tour_booking_qrs"("qr_payload_hash");
CREATE INDEX "tour_booking_qrs_status_idx" ON "tour_booking_qrs"("status");
CREATE INDEX "tour_booking_qrs_expires_at_idx" ON "tour_booking_qrs"("expires_at");

CREATE INDEX "bookings_tour_booking_id_idx" ON "bookings"("tour_booking_id");
CREATE INDEX "bookings_tour_stop_id_idx" ON "bookings"("tour_stop_id");
CREATE UNIQUE INDEX "bookings_tour_booking_id_store_id_key" ON "bookings"("tour_booking_id", "store_id");

CREATE UNIQUE INDEX "tour_booking_check_ins_booking_id_key" ON "tour_booking_check_ins"("booking_id");
CREATE UNIQUE INDEX "tour_booking_check_ins_idempotency_key_key" ON "tour_booking_check_ins"("idempotency_key");
CREATE INDEX "tour_booking_check_ins_tour_booking_id_idx" ON "tour_booking_check_ins"("tour_booking_id");
CREATE INDEX "tour_booking_check_ins_tour_booking_qr_id_idx" ON "tour_booking_check_ins"("tour_booking_qr_id");
CREATE INDEX "tour_booking_check_ins_store_id_idx" ON "tour_booking_check_ins"("store_id");
CREATE INDEX "tour_booking_check_ins_actor_id_idx" ON "tour_booking_check_ins"("actor_id");
CREATE INDEX "tour_booking_check_ins_checked_in_at_idx" ON "tour_booking_check_ins"("checked_in_at");

ALTER TABLE "tour_bookings"
ADD CONSTRAINT "tour_bookings_tour_id_fkey"
FOREIGN KEY ("tour_id") REFERENCES "tours"("id")
ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "tour_bookings"
ADD CONSTRAINT "tour_bookings_user_id_fkey"
FOREIGN KEY ("user_id") REFERENCES "users"("id")
ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "tour_bookings"
ADD CONSTRAINT "tour_bookings_guest_id_fkey"
FOREIGN KEY ("guest_id") REFERENCES "guests"("id")
ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "bookings"
ADD CONSTRAINT "bookings_tour_booking_id_fkey"
FOREIGN KEY ("tour_booking_id") REFERENCES "tour_bookings"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "bookings"
ADD CONSTRAINT "bookings_tour_stop_id_fkey"
FOREIGN KEY ("tour_stop_id") REFERENCES "tour_stops"("id")
ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "tour_booking_qrs"
ADD CONSTRAINT "tour_booking_qrs_tour_booking_id_fkey"
FOREIGN KEY ("tour_booking_id") REFERENCES "tour_bookings"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "tour_booking_check_ins"
ADD CONSTRAINT "tour_booking_check_ins_tour_booking_id_fkey"
FOREIGN KEY ("tour_booking_id") REFERENCES "tour_bookings"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "tour_booking_check_ins"
ADD CONSTRAINT "tour_booking_check_ins_booking_id_fkey"
FOREIGN KEY ("booking_id") REFERENCES "bookings"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "tour_booking_check_ins"
ADD CONSTRAINT "tour_booking_check_ins_tour_booking_qr_id_fkey"
FOREIGN KEY ("tour_booking_qr_id") REFERENCES "tour_booking_qrs"("id")
ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "tour_booking_check_ins"
ADD CONSTRAINT "tour_booking_check_ins_store_id_fkey"
FOREIGN KEY ("store_id") REFERENCES "stores"("id")
ON DELETE RESTRICT ON UPDATE CASCADE;
