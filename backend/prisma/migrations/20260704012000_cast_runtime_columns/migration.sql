-- Align public cast profiles and seed data with the current Prisma schema.
ALTER TABLE "casts"
ADD COLUMN IF NOT EXISTS "birth_month" INTEGER,
ADD COLUMN IF NOT EXISTS "zodiac_sign" TEXT,
ADD COLUMN IF NOT EXISTS "height_cm" INTEGER,
ADD COLUMN IF NOT EXISTS "measurements" TEXT,
ADD COLUMN IF NOT EXISTS "hobbies" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
ADD COLUMN IF NOT EXISTS "style_tags" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];
