import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { DiscountType, MediaType, StoreCategory } from '@prisma/client';

export class PublicDiscoveryMetaDto {
  @ApiProperty({ example: 42 })
  total!: number;

  @ApiProperty({ example: 1 })
  page!: number;

  @ApiProperty({ example: 24 })
  limit!: number;

  @ApiProperty({ example: 0 })
  offset!: number;

  @ApiProperty({ example: true })
  hasMore!: boolean;

  @ApiProperty({ enum: ['newest', 'nearest', 'priority'], example: 'newest' })
  sort!: 'newest' | 'nearest' | 'priority';
}

export class PublicAreaDto {
  @ApiProperty({ example: 'area_01' })
  id!: string;

  @ApiProperty({ example: 'hn-tayho' })
  code!: string;

  @ApiProperty({ example: 'Tay Ho' })
  name!: string;

  @ApiProperty({ example: 'Ha Noi' })
  city!: string;

  @ApiPropertyOptional({ example: 'hn' })
  cityCode?: string;

  @ApiPropertyOptional({ example: 'Tay Ho', nullable: true })
  district?: string | null;

  @ApiPropertyOptional({ example: 'Quang An', nullable: true })
  ward?: string | null;
}

export class PublicStoreDto {
  @ApiProperty({ example: 'store_01' })
  id!: string;

  @ApiProperty({ example: 'Neon Club' })
  name!: string;

  @ApiProperty({ example: 'neon-club' })
  slug!: string;

  @ApiProperty({ enum: StoreCategory, example: StoreCategory.CLUB })
  category!: StoreCategory;

  @ApiPropertyOptional({
    example: 'Club by West Lake with DJ nights and VIP tables.',
    nullable: true,
  })
  description?: string | null;

  @ApiPropertyOptional({ example: '200 Nghi Tam, Tay Ho', nullable: true })
  address?: string | null;

  @ApiProperty({ example: 'Ha Noi' })
  city!: string;

  @ApiPropertyOptional({ example: 'hn' })
  cityCode?: string;

  @ApiPropertyOptional({ example: 'Tay Ho', nullable: true })
  district?: string | null;

  @ApiPropertyOptional({ type: () => PublicAreaDto, nullable: true })
  area?: PublicAreaDto | null;

  @ApiPropertyOptional({ example: 21.063, nullable: true })
  latitude?: number | null;

  @ApiPropertyOptional({ example: 105.822, nullable: true })
  longitude?: number | null;

  @ApiPropertyOptional({ example: null, nullable: true })
  thumbnailUrl?: string | null;

  @ApiPropertyOptional({ example: 1.4, nullable: true })
  distanceKm?: number | null;
}

export class PublicCastDto {
  @ApiProperty({ example: 'cast_01' })
  id!: string;

  @ApiProperty({ example: 'yuna-neon' })
  slug!: string;

  @ApiProperty({ example: 'Yuna' })
  stageName!: string;

  @ApiProperty({ example: 'Yuna' })
  name!: string;

  @ApiPropertyOptional({ example: 'Yuna', nullable: true })
  publicAlias?: string | null;

  @ApiPropertyOptional({ example: 'Party host', nullable: true })
  publicHeadline?: string | null;

  @ApiProperty({ type: [String], example: ['party', 'vip'] })
  tags!: string[];

  @ApiProperty({ type: [String], example: ['ja', 'vi'] })
  languages!: string[];

  @ApiPropertyOptional({ example: 600000, nullable: true })
  hourlyRateVnd?: number | null;

  @ApiPropertyOptional({ example: null, nullable: true })
  thumbnailUrl?: string | null;

  @ApiPropertyOptional({ example: 1.4, nullable: true })
  distanceKm?: number | null;

  @ApiProperty({ type: () => PublicStoreDto })
  store!: PublicStoreDto;
}

export class PublicStoreGalleryItemDto {
  @ApiProperty({ example: 'media_01' })
  id!: string;

  @ApiProperty({ enum: MediaType, example: MediaType.IMAGE })
  type!: MediaType;

  @ApiProperty({ example: 'https://images.unsplash.com/photo.jpg' })
  url!: string;

  @ApiPropertyOptional({ example: 'Hero image', nullable: true })
  purpose?: string | null;

  @ApiPropertyOptional({ example: 'image/jpeg', nullable: true })
  mimeType?: string | null;

  @ApiPropertyOptional({ example: 'Neon Club hero', nullable: true })
  alt?: string | null;
}

export class PublicStoreDetailCastDto {
  @ApiProperty({ example: 'cast_01' })
  id!: string;

  @ApiProperty({ example: 'yuna-neon' })
  slug!: string;

  @ApiProperty({ example: 'Yuna' })
  stageName!: string;

  @ApiPropertyOptional({ example: 'Yuna Neon', nullable: true })
  publicAlias?: string | null;

  @ApiPropertyOptional({ example: 'Party host', nullable: true })
  publicHeadline?: string | null;

  @ApiPropertyOptional({ example: null, nullable: true })
  thumbnailUrl?: string | null;

  @ApiProperty({ type: [String], example: ['party', 'vip'] })
  tags!: string[];

  @ApiProperty({ type: [String], example: ['ja', 'vi'] })
  languages!: string[];

  @ApiPropertyOptional({ example: 600000, nullable: true })
  hourlyRateVnd?: number | null;
}

export class PublicStoreDetailPriceItemDto {
  @ApiProperty({ example: 'Cast theo gio' })
  label!: string;

  @ApiPropertyOptional({ example: 600000, nullable: true })
  amountVnd?: number | null;

  @ApiPropertyOptional({ example: 'hour', nullable: true })
  unit?: string | null;

  @ApiPropertyOptional({ example: 'Confirmed by admin', nullable: true })
  note?: string | null;
}

export class PublicStoreDetailPriceReferenceDto {
  @ApiProperty({ example: 'VND' })
  currency!: string;

  @ApiPropertyOptional({ example: 600000, nullable: true })
  startingFromVnd?: number | null;

  @ApiPropertyOptional({ example: 'Gia tham khao, admin xac nhan lai' })
  note?: string | null;

  @ApiProperty({ type: [PublicStoreDetailPriceItemDto] })
  items!: PublicStoreDetailPriceItemDto[];
}

export class PublicStoreDetailCouponDto {
  @ApiProperty({ example: 'coupon_01' })
  id!: string;

  @ApiProperty({ example: 'WELCOME20' })
  code!: string;

  @ApiProperty({ example: 'Welcome 20%' })
  name!: string;

  @ApiPropertyOptional({ example: '20% off for first booking', nullable: true })
  description?: string | null;

  @ApiProperty({ enum: DiscountType, example: DiscountType.PERCENT })
  discountType!: DiscountType;

  @ApiProperty({ example: 20 })
  discountValue!: number;

  @ApiPropertyOptional({ example: 200000, nullable: true })
  maxDiscountVnd?: number | null;

  @ApiPropertyOptional({ example: 1000000, nullable: true })
  minSpendVnd?: number | null;

  @ApiProperty({ example: '2026-06-01T00:00:00.000Z' })
  startsAt!: Date;

  @ApiPropertyOptional({ example: '2026-07-01T00:00:00.000Z', nullable: true })
  endsAt?: Date | null;
}

export class PublicStoreCampaignDto {
  @ApiProperty({ example: 'coupon_01' })
  id!: string;

  @ApiProperty({ example: 'Welcome 20%' })
  title!: string;

  @ApiPropertyOptional({ example: '20% off for first booking', nullable: true })
  description?: string | null;

  @ApiProperty({ example: 'coupon' })
  source!: 'coupon';

  @ApiProperty({ example: 'coupon_01' })
  couponId!: string;
}

export class PublicRelatedStoreDto {
  @ApiProperty({ example: 'store_02' })
  id!: string;

  @ApiProperty({ example: 'crimson-bar' })
  slug!: string;

  @ApiProperty({ example: 'Crimson Bar' })
  name!: string;

  @ApiProperty({ enum: StoreCategory, example: StoreCategory.BAR })
  category!: StoreCategory;

  @ApiProperty({ example: 'Ha Noi' })
  city!: string;

  @ApiPropertyOptional({ example: 'Hoan Kiem', nullable: true })
  district?: string | null;

  @ApiPropertyOptional({ type: () => PublicAreaDto, nullable: true })
  area?: PublicAreaDto | null;

  @ApiPropertyOptional({ example: null, nullable: true })
  thumbnailUrl?: string | null;
}

export class PublicStoreSeoMetadataDto {
  @ApiProperty({ example: 'Neon Club | NightLife VN' })
  title!: string;

  @ApiProperty({ example: 'Neon Club tai Tay Ho, Ha Noi.' })
  description!: string;

  @ApiProperty({ example: '/stores/neon-club' })
  canonicalPath!: string;

  @ApiPropertyOptional({ example: null, nullable: true })
  ogImage?: string | null;
}

export class PublicStoreDetailResponseDto {
  @ApiProperty({ example: 'store_01' })
  id!: string;

  @ApiProperty({ example: 'neon-club' })
  slug!: string;

  @ApiProperty({ example: 'Neon Club' })
  name!: string;

  @ApiProperty({ enum: StoreCategory, example: StoreCategory.CLUB })
  category!: StoreCategory;

  @ApiPropertyOptional({ example: 'Club by West Lake.', nullable: true })
  description?: string | null;

  @ApiPropertyOptional({ type: () => PublicAreaDto, nullable: true })
  area?: PublicAreaDto | null;

  @ApiPropertyOptional({ example: '200 Nghi Tam, Tay Ho', nullable: true })
  address?: string | null;

  @ApiProperty({ example: 'Ha Noi' })
  city!: string;

  @ApiPropertyOptional({ example: 'Tay Ho', nullable: true })
  district?: string | null;

  @ApiPropertyOptional({ example: '+84243456007', nullable: true })
  phone?: string | null;

  @ApiPropertyOptional({ example: 21.063, nullable: true })
  latitude?: number | null;

  @ApiPropertyOptional({ example: 105.822, nullable: true })
  longitude?: number | null;

  @ApiPropertyOptional({
    example: 'https://maps.google.com/?q=21.063,105.822',
    nullable: true,
  })
  mapUrl?: string | null;

  @ApiPropertyOptional({ nullable: true })
  openingHours?: unknown;

  @ApiPropertyOptional({ nullable: true })
  holidaySchedule?: unknown;

  @ApiProperty({ type: [PublicStoreGalleryItemDto] })
  gallery!: PublicStoreGalleryItemDto[];

  @ApiProperty({ type: [PublicStoreDetailCastDto] })
  casts!: PublicStoreDetailCastDto[];

  @ApiProperty({ type: () => PublicStoreDetailPriceReferenceDto })
  priceReference!: PublicStoreDetailPriceReferenceDto;

  @ApiProperty({ type: [PublicStoreDetailCouponDto] })
  activeCoupons!: PublicStoreDetailCouponDto[];

  @ApiProperty({ type: [PublicStoreCampaignDto] })
  campaigns!: PublicStoreCampaignDto[];

  @ApiProperty({ type: [PublicRelatedStoreDto] })
  relatedStores!: PublicRelatedStoreDto[];

  @ApiProperty({ type: () => PublicStoreSeoMetadataDto })
  seo!: PublicStoreSeoMetadataDto;
}

export class PublicStoreListResponseDto {
  @ApiProperty({ type: [PublicStoreDto] })
  data!: PublicStoreDto[];

  @ApiProperty({ type: () => PublicDiscoveryMetaDto })
  meta!: PublicDiscoveryMetaDto;
}

export class PublicCastListResponseDto {
  @ApiProperty({ type: [PublicCastDto] })
  data!: PublicCastDto[];

  @ApiProperty({ type: () => PublicDiscoveryMetaDto })
  meta!: PublicDiscoveryMetaDto;
}
