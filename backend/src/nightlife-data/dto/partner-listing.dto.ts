import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  IsBoolean,
  IsArray,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';

export class PartnerListingCastDto {
  @ApiProperty({ example: 'Yuki' })
  @IsNotEmpty()
  @IsString()
  @MaxLength(120)
  stageName: string;

  @ApiPropertyOptional({ example: 'Gentle support for quiet guests.' })
  @IsOptional()
  @IsString()
  @MaxLength(180)
  publicHeadline?: string;

  @ApiPropertyOptional({ example: 'Japanese and English speaking host.' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  bio?: string;

  @ApiPropertyOptional({ example: ['hostess', 'english'] })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(12)
  @IsString({ each: true })
  @MaxLength(40, { each: true })
  tags?: string[];

  @ApiPropertyOptional({ example: ['vi', 'en', 'ja'] })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(8)
  @IsString({ each: true })
  @MaxLength(20, { each: true })
  languages?: string[];

  @ApiPropertyOptional({ example: 8 })
  @IsOptional()
  @IsInt()
  @Min(1)
  birthMonth?: number;

  @ApiPropertyOptional({ example: 'Leo' })
  @IsOptional()
  @IsString()
  @MaxLength(40)
  zodiacSign?: string;

  @ApiPropertyOptional({ example: 165 })
  @IsOptional()
  @IsInt()
  @Min(0)
  heightCm?: number;

  @ApiPropertyOptional({ example: '82-58-84' })
  @IsOptional()
  @IsString()
  @MaxLength(40)
  measurements?: string;

  @ApiPropertyOptional({ example: ['spa', 'cocktail'] })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(12)
  @IsString({ each: true })
  @MaxLength(40, { each: true })
  hobbies?: string[];

  @ApiPropertyOptional({ example: ['https://youtube.com/watch?v=abc'] })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(8)
  @IsUrl({ require_tld: false }, { each: true })
  youtubeLinks?: string[];

  @ApiPropertyOptional({ example: 1200000 })
  @IsOptional()
  @IsInt()
  @Min(0)
  hourlyRateVnd?: number;

  @ApiPropertyOptional({ example: ['https://cdn.example.com/casts/yuki.jpg'] })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(8)
  @IsUrl({ require_tld: false }, { each: true })
  mediaUrls?: string[];
}

export class PartnerListingPricingDto {
  @ApiProperty({ example: 'VIP room' })
  @IsNotEmpty()
  @IsString()
  @MaxLength(120)
  label: string;

  @ApiProperty({ example: '2,500,000d - 6,000,000d' })
  @IsNotEmpty()
  @IsString()
  @MaxLength(120)
  value: string;

  @ApiPropertyOptional({ example: 'Priority for VIP guests' })
  @IsOptional()
  @IsString()
  @MaxLength(240)
  note?: string;
}

export class PartnerListingOpeningHourDto {
  @ApiProperty({ example: 'Thứ 2' })
  @IsNotEmpty()
  @IsString()
  @MaxLength(24)
  day: string;

  @ApiPropertyOptional({ example: false })
  @IsOptional()
  @IsBoolean()
  isOff?: boolean;

  @ApiPropertyOptional({ example: '19:00 - 02:00' })
  @IsOptional()
  @IsString()
  @MaxLength(120)
  hours?: string;
}

export class PartnerListingMenuItemDto {
  @ApiProperty({ example: 'Bottle service' })
  @IsNotEmpty()
  @IsString()
  @MaxLength(120)
  name: string;

  @ApiPropertyOptional({ example: 'VIP table package' })
  @IsOptional()
  @IsString()
  @MaxLength(240)
  description?: string;

  @ApiPropertyOptional({ example: '$$$' })
  @IsOptional()
  @IsString()
  @MaxLength(12)
  priceTier?: string;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  isHot?: boolean;

  @ApiPropertyOptional({ example: 'https://cdn.example.com/menu/bottle.jpg' })
  @IsOptional()
  @IsUrl({ require_tld: false })
  imageUrl?: string;
}

export class PartnerListingMenuGroupDto {
  @ApiProperty({ example: 'VIP packages' })
  @IsNotEmpty()
  @IsString()
  @MaxLength(120)
  name: string;

  @ApiPropertyOptional({ type: [PartnerListingMenuItemDto] })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(20)
  @ValidateNested({ each: true })
  @Type(() => PartnerListingMenuItemDto)
  items?: PartnerListingMenuItemDto[];
}

export class PartnerListingDraftDto {
  @ApiProperty({ example: 'Velvet Club' })
  @IsNotEmpty()
  @IsString()
  @MaxLength(160)
  storeName: string;

  @ApiPropertyOptional({ example: 'Lounge / Bar / Karaoke' })
  @IsOptional()
  @IsString()
  @MaxLength(80)
  businessType?: string;

  @ApiPropertyOptional({ example: 'LOUNGE' })
  @IsOptional()
  @IsString()
  @MaxLength(40)
  storeCategory?: string;

  @ApiPropertyOptional({ example: 'Quan 1, Ho Chi Minh City' })
  @IsOptional()
  @IsString()
  @MaxLength(120)
  area?: string;

  @ApiPropertyOptional({ example: 'Ho Chi Minh City' })
  @IsOptional()
  @IsString()
  @MaxLength(80)
  storeCity?: string;

  @ApiPropertyOptional({ example: 'Quan 1' })
  @IsOptional()
  @IsString()
  @MaxLength(120)
  storeDistrict?: string;

  @ApiPropertyOptional({ example: 'Ben Nghe' })
  @IsOptional()
  @IsString()
  @MaxLength(120)
  ward?: string;

  @ApiPropertyOptional({ example: '12 Nguyen Hue' })
  @IsOptional()
  @IsString()
  @MaxLength(180)
  streetAddress?: string;

  @ApiPropertyOptional({ example: '12 Nguyen Hue, Ben Nghe' })
  @IsOptional()
  @IsString()
  @MaxLength(240)
  storeAddress?: string;

  @ApiPropertyOptional({ example: '+84901234567' })
  @IsOptional()
  @IsString()
  @MaxLength(32)
  phone?: string;

  @ApiPropertyOptional({ example: '18:00 - 02:00' })
  @IsOptional()
  @IsString()
  @MaxLength(240)
  openingHours?: string;

  @ApiPropertyOptional({ type: [PartnerListingOpeningHourDto] })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(14)
  @ValidateNested({ each: true })
  @Type(() => PartnerListingOpeningHourDto)
  openingHourItems?: PartnerListingOpeningHourDto[];

  @ApiPropertyOptional({ example: '500,000d - 3,000,000d' })
  @IsOptional()
  @IsString()
  @MaxLength(240)
  priceRange?: string;

  @ApiPropertyOptional({ example: 'Premium lounge for late-night bookings.' })
  @IsOptional()
  @IsString()
  @MaxLength(1500)
  description?: string;

  @ApiPropertyOptional({ example: 'Please review new weekend media.' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  note?: string;

  @ApiPropertyOptional({ example: 'Bottle service and cocktail menu.' })
  @IsOptional()
  @IsString()
  @MaxLength(1500)
  menuSummary?: string;

  @ApiPropertyOptional({ type: [PartnerListingMenuGroupDto] })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(12)
  @ValidateNested({ each: true })
  @Type(() => PartnerListingMenuGroupDto)
  menuGroups?: PartnerListingMenuGroupDto[];

  @ApiPropertyOptional({ example: 'https://maps.google.com/?q=21.063,105.822' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  mapUrl?: string;

  @ApiPropertyOptional({ example: ['Club', 'VIP table'] })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(16)
  @IsString({ each: true })
  @MaxLength(40, { each: true })
  tags?: string[];

  @ApiPropertyOptional({ example: 'https://cdn.example.com/store/hero.jpg' })
  @IsOptional()
  @IsUrl({ require_tld: false })
  coverImageUrl?: string;

  @ApiPropertyOptional({ example: ['https://cdn.example.com/store/gallery.jpg'] })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(12)
  @IsUrl({ require_tld: false }, { each: true })
  galleryUrls?: string[];

  @ApiPropertyOptional({ example: ['https://youtube.com/watch?v=abc'] })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(8)
  @IsUrl({ require_tld: false }, { each: true })
  videoUrls?: string[];

  @ApiPropertyOptional({ type: [PartnerListingPricingDto] })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(12)
  @ValidateNested({ each: true })
  @Type(() => PartnerListingPricingDto)
  pricingItems?: PartnerListingPricingDto[];

  @ApiPropertyOptional({ type: [PartnerListingCastDto] })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(12)
  @ValidateNested({ each: true })
  @Type(() => PartnerListingCastDto)
  castProfiles?: PartnerListingCastDto[];

  @ApiPropertyOptional({ example: ['https://cdn.example.com/store/hero.jpg'] })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(12)
  @IsUrl({ require_tld: false }, { each: true })
  mediaUrls?: string[];
}
