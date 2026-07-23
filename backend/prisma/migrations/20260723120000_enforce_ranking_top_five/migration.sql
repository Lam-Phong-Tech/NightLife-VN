-- Normalize existing active ranking groups to Top 5.
-- Rows outside the first five are preserved as PAUSED so no historical
-- configuration is destroyed.
WITH ranked AS (
  SELECT
    "id",
    ROW_NUMBER() OVER (
      PARTITION BY "target_type", "city_code", "category", "scope"
      ORDER BY
        "pin_rank" ASC NULLS LAST,
        "manual_score" DESC,
        "updated_at" DESC,
        "id" ASC
    ) AS "position"
  FROM "ranking_configs"
  WHERE "status" = 'ACTIVE'
    AND "deleted_at" IS NULL
)
UPDATE "ranking_configs" AS ranking
SET
  "pin_rank" = CASE
    WHEN ranked."position" <= 5 THEN ranked."position"::INTEGER
    ELSE NULL
  END,
  "status" = CASE
    WHEN ranked."position" <= 5 THEN ranking."status"
    ELSE 'PAUSED'::"RankingConfigStatus"
  END
FROM ranked
WHERE ranking."id" = ranked."id";

-- Old paused/expired rows may still contain legacy ranks above five.
UPDATE "ranking_configs"
SET "pin_rank" = NULL
WHERE "pin_rank" IS NOT NULL
  AND "pin_rank" NOT BETWEEN 1 AND 5;

ALTER TABLE "ranking_configs"
ADD CONSTRAINT "ranking_configs_pin_rank_top_five_check"
CHECK ("pin_rank" IS NULL OR "pin_rank" BETWEEN 1 AND 5);

-- Enforce one active item per numbered position, including groups whose
-- category is NULL.
CREATE UNIQUE INDEX "ranking_configs_active_pin_top_five_key"
ON "ranking_configs" (
  "target_type",
  "city_code",
  "category",
  "scope",
  "pin_rank"
) NULLS NOT DISTINCT
WHERE "status" = 'ACTIVE'
  AND "deleted_at" IS NULL
  AND "pin_rank" IS NOT NULL;

-- A CHECK constraint cannot count sibling rows. This trigger keeps direct SQL
-- writes and application writes from creating a sixth active row in a group.
CREATE OR REPLACE FUNCTION "enforce_ranking_group_top_five"()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  active_count INTEGER;
  group_lock_key TEXT;
BEGIN
  IF NEW."status" = 'ACTIVE' AND NEW."deleted_at" IS NULL THEN
    group_lock_key :=
      NEW."target_type"::TEXT || '|' ||
      NEW."city_code" || '|' ||
      COALESCE(NEW."category"::TEXT, '__ALL__') || '|' ||
      NEW."scope";

    PERFORM pg_advisory_xact_lock(hashtext(group_lock_key));

    SELECT COUNT(*)
    INTO active_count
    FROM "ranking_configs" AS existing
    WHERE existing."id" <> NEW."id"
      AND existing."target_type" = NEW."target_type"
      AND existing."city_code" = NEW."city_code"
      AND existing."category" IS NOT DISTINCT FROM NEW."category"
      AND existing."scope" = NEW."scope"
      AND existing."status" = 'ACTIVE'
      AND existing."deleted_at" IS NULL;

    IF active_count >= 5 THEN
      RAISE EXCEPTION
        'Ranking group supports at most 5 active items.'
        USING ERRCODE = '23514';
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER "ranking_configs_top_five_guard"
BEFORE INSERT OR UPDATE OF
  "target_type",
  "city_code",
  "category",
  "scope",
  "status",
  "deleted_at"
ON "ranking_configs"
FOR EACH ROW
EXECUTE FUNCTION "enforce_ranking_group_top_five"();
