-- Product decision: commission configuration is no longer used.
-- Keep the table for backward-compatible Prisma/client contracts, but clear
-- existing records so bill approval no longer depends on or surfaces them.
DO $$
BEGIN
  IF to_regclass('public.commission_configs') IS NOT NULL THEN
    DELETE FROM "commission_configs";
  END IF;
END $$;
