-- Align store read/write paths and seed data with the current Prisma schema.
ALTER TABLE "stores"
ADD COLUMN IF NOT EXISTS "pricing_info" JSONB,
ADD COLUMN IF NOT EXISTS "staff_profile_info" JSONB,
ADD COLUMN IF NOT EXISTS "supported_languages" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
ADD COLUMN IF NOT EXISTS "seo_title" TEXT,
ADD COLUMN IF NOT EXISTS "seo_description" TEXT;
