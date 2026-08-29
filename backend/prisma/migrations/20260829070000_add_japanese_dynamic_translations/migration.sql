ALTER TABLE "stores"
ADD COLUMN "description_ja" TEXT,
ADD COLUMN "street_name_ja" TEXT;

ALTER TABLE "casts"
ADD COLUMN "public_bio_ja" TEXT;

-- Seed the shared street-name dictionary for existing production records.
-- Street fields containing a building/floor prefix still resolve to the
-- underlying street name in Japanese.
UPDATE "stores"
SET "street_name_ja" = CASE "street_name"
  WHEN 'Thái Văn Lung' THEN 'タイヴァンルン'
  WHEN 'Linh Lang' THEN 'リンラン'
  WHEN 'Lê Thánh Tôn' THEN 'レタントン'
  WHEN 'Phan Kế Bính' THEN 'ファンケビン'
  WHEN 'Kim Mã' THEN 'キンマー'
  WHEN 'Đào Tấn' THEN 'ダオタン'
  WHEN 'Kim Mã Thượng' THEN 'キンマートゥオン'
  WHEN 'Mê Linh' THEN 'メーリン'
  WHEN 'Nguyễn Công Trứ' THEN 'グエンコンチュー'
  WHEN 'Nguyễn Văn Ngọc' THEN 'グエンヴァンゴック'
  WHEN 'Phạm Viết Chánh' THEN 'ファムヴィエットチャン'
  WHEN 'Thi Sách' THEN 'ティーサック'
  WHEN 'Triệu Việt Vương' THEN 'チェウヴィエットヴオン'
  WHEN 'Bùi Thị Xuân' THEN 'ブイティスアン'
  WHEN 'Mạc Đĩnh Chi' THEN 'マックディンチ'
  WHEN 'Ngô Văn Năm' THEN 'ゴーヴァンナム'
  WHEN 'Tôn Đức Thắng' THEN 'トンドゥックタン'
  WHEN '24 Ng. 12 Đào Tấn' THEN 'ダオタン'
  WHEN '2F /47 P. Linh Lang' THEN 'リンラン'
  ELSE "street_name_ja"
END
WHERE "street_name" IS NOT NULL;
