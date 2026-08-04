ALTER TABLE "campaigns"
ADD COLUMN IF NOT EXISTS "home_position" INTEGER;

ALTER TABLE "campaigns"
DROP CONSTRAINT IF EXISTS "campaigns_home_position_range_check";

ALTER TABLE "campaigns"
ADD CONSTRAINT "campaigns_home_position_range_check"
CHECK ("home_position" IS NULL OR "home_position" BETWEEN 1 AND 6);

CREATE UNIQUE INDEX IF NOT EXISTS "campaigns_home_position_key"
ON "campaigns"("home_position")
WHERE "home_position" IS NOT NULL;

CREATE INDEX IF NOT EXISTS "campaigns_home_position_idx"
ON "campaigns"("home_position");
