CREATE TABLE IF NOT EXISTS "tours" (
  "id" UUID NOT NULL,
  "title" TEXT NOT NULL,
  "subtitle" TEXT,
  "city" TEXT NOT NULL DEFAULT 'Hanoi',
  "duration_hours" INTEGER NOT NULL DEFAULT 4,
  "price_tier" INTEGER NOT NULL DEFAULT 3,
  "cover_url" TEXT,
  "status" "ProfileStatus" NOT NULL DEFAULT 'ACTIVE',
  "departure_times" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  "deleted_at" TIMESTAMP(3),
  CONSTRAINT "tours_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "tour_stops" (
  "id" UUID NOT NULL,
  "tour_id" UUID NOT NULL,
  "store_id" UUID NOT NULL,
  "order" INTEGER NOT NULL DEFAULT 1,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "tour_stops_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "tours_status_idx" ON "tours"("status");
CREATE INDEX IF NOT EXISTS "tours_city_idx" ON "tours"("city");
CREATE UNIQUE INDEX IF NOT EXISTS "tour_stops_tour_id_store_id_key" ON "tour_stops"("tour_id", "store_id");
CREATE INDEX IF NOT EXISTS "tour_stops_tour_id_idx" ON "tour_stops"("tour_id");
CREATE INDEX IF NOT EXISTS "tour_stops_store_id_idx" ON "tour_stops"("store_id");

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'tour_stops_tour_id_fkey'
  ) THEN
    ALTER TABLE "tour_stops"
    ADD CONSTRAINT "tour_stops_tour_id_fkey"
    FOREIGN KEY ("tour_id") REFERENCES "tours"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'tour_stops_store_id_fkey'
  ) THEN
    ALTER TABLE "tour_stops"
    ADD CONSTRAINT "tour_stops_store_id_fkey"
    FOREIGN KEY ("store_id") REFERENCES "stores"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;
