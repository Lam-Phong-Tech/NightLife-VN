ALTER TABLE "tours"
ADD COLUMN IF NOT EXISTS "home_rank" INTEGER;

CREATE INDEX IF NOT EXISTS "tours_home_rank_idx" ON "tours"("home_rank");
