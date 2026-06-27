ALTER TABLE "stores" ALTER COLUMN "category" DROP DEFAULT;

ALTER TYPE "StoreCategory" RENAME TO "StoreCategory_old";

CREATE TYPE "StoreCategory" AS ENUM (
  'BAR',
  'CLUB',
  'LOUNGE',
  'GIRLS_BAR',
  'KARAOKE',
  'MASSAGE_SPA',
  'RESTAURANT',
  'CASINO'
);

ALTER TABLE "stores"
  ALTER COLUMN "category" TYPE "StoreCategory"
  USING (
    CASE "category"::text
      WHEN 'SPA' THEN 'MASSAGE_SPA'
      WHEN 'EVENT' THEN 'LOUNGE'
      WHEN 'OTHER' THEN 'LOUNGE'
      ELSE "category"::text
    END
  )::"StoreCategory";

DROP TYPE "StoreCategory_old";
