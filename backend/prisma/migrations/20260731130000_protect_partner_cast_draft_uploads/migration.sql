-- Cast media uploaded before review must never remain publicly accessible as store media.
UPDATE "media_files"
SET
  "access" = 'PROTECTED',
  "url" = REPLACE("url", '/storage/public/', '/storage/files/')
WHERE
  "store_id" IS NOT NULL
  AND "cast_id" IS NULL
  AND "purpose" IN ('PARTNER_CAST_IMAGE', 'PARTNER_CAST_VIDEO')
  AND "access" = 'PUBLIC';
