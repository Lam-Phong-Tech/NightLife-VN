ALTER TABLE "ranking_configs"
ADD COLUMN "area_id" UUID,
ADD COLUMN "city_code" TEXT NOT NULL DEFAULT 'all',
ADD COLUMN "category" "StoreCategory",
ADD COLUMN "scope" TEXT NOT NULL DEFAULT 'global',
ADD COLUMN "sponsored" BOOLEAN NOT NULL DEFAULT false;

UPDATE "ranking_configs"
SET "sponsored" = true
WHERE "pin_rank" = 1
  AND "status" = 'ACTIVE'
  AND "deleted_at" IS NULL;

CREATE INDEX "ranking_configs_area_id_idx" ON "ranking_configs"("area_id");
CREATE INDEX "ranking_configs_target_type_city_code_category_scope_pin_rank_idx"
ON "ranking_configs"("target_type", "city_code", "category", "scope", "pin_rank");

CREATE UNIQUE INDEX "ranking_configs_unique_pinned_scope_all_category_idx"
ON "ranking_configs"("target_type", "city_code", "scope", "pin_rank")
WHERE "pin_rank" IS NOT NULL
  AND "category" IS NULL
  AND "deleted_at" IS NULL;

CREATE UNIQUE INDEX "ranking_configs_unique_pinned_scope_category_idx"
ON "ranking_configs"("target_type", "city_code", "category", "scope", "pin_rank")
WHERE "pin_rank" IS NOT NULL
  AND "category" IS NOT NULL
  AND "deleted_at" IS NULL;

ALTER TABLE "ranking_configs"
ADD CONSTRAINT "ranking_configs_area_id_fkey"
FOREIGN KEY ("area_id") REFERENCES "areas"("id")
ON DELETE SET NULL ON UPDATE CASCADE;
