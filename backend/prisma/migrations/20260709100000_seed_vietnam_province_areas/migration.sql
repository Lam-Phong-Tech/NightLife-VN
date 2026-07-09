-- Seed current Vietnam province-level general areas and backfill stores
-- that were created before area_id was required for public discovery.

WITH province_areas(id, code, city) AS (
    VALUES
        ('98c39c8f-e5d6-42a1-8cc8-6ad473b9a964'::uuid, 'caobang-tong-hop', 'Cao Bằng'),
        ('ecef3155-923b-47fd-bbfa-039835d56e6b'::uuid, 'dienbien-tong-hop', 'Điện Biên'),
        ('6a53391d-5c75-4dc8-b3d5-3bde7db138a1'::uuid, 'hatinh-tong-hop', 'Hà Tĩnh'),
        ('d09a719e-fa5f-41a2-b1db-df60b8fb52ff'::uuid, 'laichau-tong-hop', 'Lai Châu'),
        ('fd5d02a4-7c5c-40ec-ac2f-a0d4f7eaa74f'::uuid, 'langson-tong-hop', 'Lạng Sơn'),
        ('98aee358-c734-468d-aa13-05abf359e9a1'::uuid, 'nghean-tong-hop', 'Nghệ An'),
        ('35640c58-787b-4515-81f1-7a4681531947'::uuid, 'quangninh-tong-hop', 'Quảng Ninh'),
        ('cd2749d7-bd79-453e-a128-41ee498c8318'::uuid, 'sonla-tong-hop', 'Sơn La'),
        ('5abbc177-7d47-4af7-918b-55cb925e0a9c'::uuid, 'thanhhoa-tong-hop', 'Thanh Hóa'),
        ('48aefd26-ce50-4cbf-89fa-f2a70ce20997'::uuid, 'hn-tong-hop', 'Hà Nội'),
        ('028065df-4b4a-4de4-88e1-26cc73a4bf01'::uuid, 'hue-tong-hop', 'Huế'),
        ('94790a15-0e77-4287-9d39-a3eae8203c57'::uuid, 'laocai-tong-hop', 'Lào Cai'),
        ('464bb0b4-0aa4-4a70-a217-6864231cbfda'::uuid, 'thainguyen-tong-hop', 'Thái Nguyên'),
        ('cb42ae8d-ce1f-4241-8665-4f05221b5a1a'::uuid, 'phutho-tong-hop', 'Phú Thọ'),
        ('e8e56eaa-1b38-4916-8dc6-7ea4dd1b8f1c'::uuid, 'bacninh-tong-hop', 'Bắc Ninh'),
        ('4ce5fa38-baa3-4f10-9573-3dc96965f69a'::uuid, 'hungyen-tong-hop', 'Hưng Yên'),
        ('ada08494-ea38-47c6-91ea-2ab64c720319'::uuid, 'hp-tong-hop', 'Hải Phòng'),
        ('a8b35698-6326-4deb-923b-eb890be43942'::uuid, 'ninhbinh-tong-hop', 'Ninh Bình'),
        ('ed2e8004-2a35-4769-9c04-c13ce55af2d0'::uuid, 'quangtri-tong-hop', 'Quảng Trị'),
        ('46cc7aec-72f2-4dfa-91fe-b2151013d4f5'::uuid, 'dn-tong-hop', 'Đà Nẵng'),
        ('88cc7c30-e2b1-45ed-9b1e-0154f9c2016a'::uuid, 'quangngai-tong-hop', 'Quảng Ngãi'),
        ('1813283d-af1f-424a-951c-d9fc77f1e681'::uuid, 'gialai-tong-hop', 'Gia Lai'),
        ('e2bad896-9724-4b22-b803-ed1f46f3f619'::uuid, 'khanhhoa-tong-hop', 'Khánh Hòa'),
        ('35583173-b66f-4847-9c20-e0471efeb3fb'::uuid, 'lamdong-tong-hop', 'Lâm Đồng'),
        ('a330e1f8-a871-4ccc-bc6d-68f5b622b55f'::uuid, 'daklak-tong-hop', 'Đắk Lắk'),
        ('cde3faf9-2a97-408b-bd0b-7519488698e6'::uuid, 'hcm-tong-hop', 'Hồ Chí Minh'),
        ('e97596a1-3e27-4e94-9c51-8f8c5567de58'::uuid, 'dongnai-tong-hop', 'Đồng Nai'),
        ('05dd18a4-38e2-4f94-8aed-50f0605eeac6'::uuid, 'tayninh-tong-hop', 'Tây Ninh'),
        ('6b289cd7-b04e-49d8-93b6-8d28e89c2c5a'::uuid, 'cantho-tong-hop', 'Cần Thơ'),
        ('5ade2a23-a40d-4ca6-bb66-b09f5cd77244'::uuid, 'vinhlong-tong-hop', 'Vĩnh Long'),
        ('fbf88099-52cf-4de7-a65f-63d952732b82'::uuid, 'dongthap-tong-hop', 'Đồng Tháp'),
        ('7123583f-b61b-44e8-a2bb-f56de636d302'::uuid, 'camau-tong-hop', 'Cà Mau'),
        ('dbe96b11-3756-49e7-a60b-c60124205ddb'::uuid, 'angiang-tong-hop', 'An Giang'),
        ('0ca23333-b49d-4f69-beb2-68904b22b505'::uuid, 'tuyenquang-tong-hop', 'Tuyên Quang')
)
INSERT INTO "areas" (
    "id",
    "code",
    "name",
    "city",
    "district",
    "ward",
    "status",
    "created_at",
    "updated_at",
    "deleted_at"
)
SELECT
    id,
    code,
    'Tổng hợp',
    city,
    'Tổng hợp',
    NULL,
    'ACTIVE'::"AreaStatus",
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP,
    NULL
FROM province_areas
ON CONFLICT ("code") DO UPDATE SET
    "name" = EXCLUDED."name",
    "city" = EXCLUDED."city",
    "district" = EXCLUDED."district",
    "ward" = NULL,
    "status" = 'ACTIVE'::"AreaStatus",
    "deleted_at" = NULL,
    "updated_at" = CURRENT_TIMESTAMP;

WITH city_aliases(code, aliases) AS (
    VALUES
        ('caobang-tong-hop', ARRAY['Cao Bằng', 'Tỉnh Cao Bằng', 'Cao Bang', 'Tinh Cao Bang']::text[]),
        ('dienbien-tong-hop', ARRAY['Điện Biên', 'Tỉnh Điện Biên', 'Dien Bien', 'Tinh Dien Bien']::text[]),
        ('hatinh-tong-hop', ARRAY['Hà Tĩnh', 'Tỉnh Hà Tĩnh', 'Ha Tinh', 'Tinh Ha Tinh']::text[]),
        ('laichau-tong-hop', ARRAY['Lai Châu', 'Tỉnh Lai Châu', 'Lai Chau', 'Tinh Lai Chau']::text[]),
        ('langson-tong-hop', ARRAY['Lạng Sơn', 'Tỉnh Lạng Sơn', 'Lang Son', 'Tinh Lang Son']::text[]),
        ('nghean-tong-hop', ARRAY['Nghệ An', 'Tỉnh Nghệ An', 'Nghe An', 'Tinh Nghe An']::text[]),
        ('quangninh-tong-hop', ARRAY['Quảng Ninh', 'Tỉnh Quảng Ninh', 'Quang Ninh', 'Tinh Quang Ninh', 'Hạ Long', 'Ha Long']::text[]),
        ('sonla-tong-hop', ARRAY['Sơn La', 'Tỉnh Sơn La', 'Son La', 'Tinh Son La']::text[]),
        ('thanhhoa-tong-hop', ARRAY['Thanh Hóa', 'Tỉnh Thanh Hóa', 'Thanh Hoa', 'Tinh Thanh Hoa']::text[]),
        ('hn-tong-hop', ARRAY['Hà Nội', 'Thành phố Hà Nội', 'Ha Noi', 'Hanoi', 'Thanh pho Ha Noi', 'HN']::text[]),
        ('hue-tong-hop', ARRAY['Huế', 'Thành phố Huế', 'Hue', 'Thanh pho Hue', 'Thừa Thiên Huế', 'Thua Thien Hue']::text[]),
        ('laocai-tong-hop', ARRAY['Lào Cai', 'Tỉnh Lào Cai', 'Lao Cai', 'Tinh Lao Cai', 'Yên Bái', 'Tỉnh Yên Bái', 'Yen Bai', 'Tinh Yen Bai']::text[]),
        ('thainguyen-tong-hop', ARRAY['Thái Nguyên', 'Tỉnh Thái Nguyên', 'Thai Nguyen', 'Tinh Thai Nguyen', 'Bắc Kạn', 'Tỉnh Bắc Kạn', 'Bac Kan', 'Tinh Bac Kan']::text[]),
        ('phutho-tong-hop', ARRAY['Phú Thọ', 'Tỉnh Phú Thọ', 'Phu Tho', 'Tinh Phu Tho', 'Vĩnh Phúc', 'Tỉnh Vĩnh Phúc', 'Vinh Phuc', 'Tinh Vinh Phuc', 'Hòa Bình', 'Tỉnh Hòa Bình', 'Hoa Binh', 'Tinh Hoa Binh']::text[]),
        ('bacninh-tong-hop', ARRAY['Bắc Ninh', 'Tỉnh Bắc Ninh', 'Bac Ninh', 'Tinh Bac Ninh', 'Bắc Giang', 'Tỉnh Bắc Giang', 'Bac Giang', 'Tinh Bac Giang']::text[]),
        ('hungyen-tong-hop', ARRAY['Hưng Yên', 'Tỉnh Hưng Yên', 'Hung Yen', 'Tinh Hung Yen', 'Thái Bình', 'Tỉnh Thái Bình', 'Thai Binh', 'Tinh Thai Binh']::text[]),
        ('hp-tong-hop', ARRAY['Hải Phòng', 'Thành phố Hải Phòng', 'Hai Phong', 'Thanh pho Hai Phong', 'Hải Dương', 'Tỉnh Hải Dương', 'Hai Duong', 'Tinh Hai Duong']::text[]),
        ('ninhbinh-tong-hop', ARRAY['Ninh Bình', 'Tỉnh Ninh Bình', 'Ninh Binh', 'Tinh Ninh Binh', 'Hà Nam', 'Tỉnh Hà Nam', 'Ha Nam', 'Tinh Ha Nam', 'Nam Định', 'Tỉnh Nam Định', 'Nam Dinh', 'Tinh Nam Dinh']::text[]),
        ('quangtri-tong-hop', ARRAY['Quảng Trị', 'Tỉnh Quảng Trị', 'Quang Tri', 'Tinh Quang Tri', 'Quảng Bình', 'Tỉnh Quảng Bình', 'Quang Binh', 'Tinh Quang Binh']::text[]),
        ('dn-tong-hop', ARRAY['Đà Nẵng', 'Thành phố Đà Nẵng', 'Da Nang', 'Thanh pho Da Nang', 'Quảng Nam', 'Tỉnh Quảng Nam', 'Quang Nam', 'Tinh Quang Nam', 'Hội An', 'Hoi An']::text[]),
        ('quangngai-tong-hop', ARRAY['Quảng Ngãi', 'Tỉnh Quảng Ngãi', 'Quang Ngai', 'Tinh Quang Ngai', 'Kon Tum', 'Tỉnh Kon Tum', 'Tinh Kon Tum']::text[]),
        ('gialai-tong-hop', ARRAY['Gia Lai', 'Tỉnh Gia Lai', 'Tinh Gia Lai', 'Bình Định', 'Tỉnh Bình Định', 'Binh Dinh', 'Tinh Binh Dinh']::text[]),
        ('khanhhoa-tong-hop', ARRAY['Khánh Hòa', 'Tỉnh Khánh Hòa', 'Khanh Hoa', 'Tinh Khanh Hoa', 'Ninh Thuận', 'Tỉnh Ninh Thuận', 'Ninh Thuan', 'Tinh Ninh Thuan', 'Nha Trang']::text[]),
        ('lamdong-tong-hop', ARRAY['Lâm Đồng', 'Tỉnh Lâm Đồng', 'Lam Dong', 'Tinh Lam Dong', 'Đắk Nông', 'Tỉnh Đắk Nông', 'Dak Nong', 'Tinh Dak Nong', 'Bình Thuận', 'Tỉnh Bình Thuận', 'Binh Thuan', 'Tinh Binh Thuan', 'Đà Lạt', 'Da Lat']::text[]),
        ('daklak-tong-hop', ARRAY['Đắk Lắk', 'Tỉnh Đắk Lắk', 'Dak Lak', 'Tinh Dak Lak', 'Đak Lak', 'Tỉnh Đak Lak', 'Phú Yên', 'Tỉnh Phú Yên', 'Phu Yen', 'Tinh Phu Yen']::text[]),
        ('hcm-tong-hop', ARRAY['Hồ Chí Minh', 'Thành phố Hồ Chí Minh', 'Ho Chi Minh', 'Ho Chi Minh City', 'Thanh pho Ho Chi Minh', 'TP.HCM', 'TP HCM', 'HCM', 'Sài Gòn', 'Sai Gon', 'Saigon', 'Bình Dương', 'Tỉnh Bình Dương', 'Binh Duong', 'Tinh Binh Duong', 'Bà Rịa Vũng Tàu', 'Tỉnh Bà Rịa Vũng Tàu', 'Ba Ria Vung Tau', 'Tinh Ba Ria Vung Tau']::text[]),
        ('dongnai-tong-hop', ARRAY['Đồng Nai', 'Tỉnh Đồng Nai', 'Dong Nai', 'Tinh Dong Nai', 'Bình Phước', 'Tỉnh Bình Phước', 'Binh Phuoc', 'Tinh Binh Phuoc']::text[]),
        ('tayninh-tong-hop', ARRAY['Tây Ninh', 'Tỉnh Tây Ninh', 'Tay Ninh', 'Tinh Tay Ninh', 'Long An', 'Tỉnh Long An', 'Tinh Long An']::text[]),
        ('cantho-tong-hop', ARRAY['Cần Thơ', 'Thành phố Cần Thơ', 'Can Tho', 'Thanh pho Can Tho', 'Sóc Trăng', 'Tỉnh Sóc Trăng', 'Soc Trang', 'Tinh Soc Trang', 'Hậu Giang', 'Tỉnh Hậu Giang', 'Hau Giang', 'Tinh Hau Giang']::text[]),
        ('vinhlong-tong-hop', ARRAY['Vĩnh Long', 'Tỉnh Vĩnh Long', 'Vinh Long', 'Tinh Vinh Long', 'Bến Tre', 'Tỉnh Bến Tre', 'Ben Tre', 'Tinh Ben Tre', 'Trà Vinh', 'Tỉnh Trà Vinh', 'Tra Vinh', 'Tinh Tra Vinh']::text[]),
        ('dongthap-tong-hop', ARRAY['Đồng Tháp', 'Tỉnh Đồng Tháp', 'Dong Thap', 'Tinh Dong Thap', 'Tiền Giang', 'Tỉnh Tiền Giang', 'Tien Giang', 'Tinh Tien Giang', 'Mỹ Tho', 'My Tho']::text[]),
        ('camau-tong-hop', ARRAY['Cà Mau', 'Tỉnh Cà Mau', 'Ca Mau', 'Tinh Ca Mau', 'Bạc Liêu', 'Tỉnh Bạc Liêu', 'Bac Lieu', 'Tinh Bac Lieu']::text[]),
        ('angiang-tong-hop', ARRAY['An Giang', 'Tỉnh An Giang', 'Tinh An Giang', 'Kiên Giang', 'Tỉnh Kiên Giang', 'Kien Giang', 'Tinh Kien Giang', 'Phú Quốc', 'Phu Quoc']::text[]),
        ('tuyenquang-tong-hop', ARRAY['Tuyên Quang', 'Tỉnh Tuyên Quang', 'Tuyen Quang', 'Tinh Tuyen Quang', 'Hà Giang', 'Tỉnh Hà Giang', 'Ha Giang', 'Tinh Ha Giang']::text[])
)
UPDATE "stores" store
SET
    "area_id" = area."id",
    "updated_at" = CURRENT_TIMESTAMP
FROM city_aliases alias_group
JOIN "areas" area ON area."code" = alias_group.code
WHERE store."area_id" IS NULL
  AND store."deleted_at" IS NULL
  AND EXISTS (
      SELECT 1
      FROM unnest(alias_group.aliases) alias_name
      WHERE lower(store."city") = lower(alias_name)
  );
