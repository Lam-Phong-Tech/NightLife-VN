import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
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
