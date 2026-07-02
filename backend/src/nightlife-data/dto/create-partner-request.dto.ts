import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  IsArray,
  IsBoolean,
  IsEmail,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';

export class PartnerRequestCastDto {
  @ApiProperty({ example: 'Yuna' })
  @IsNotEmpty()
  @IsString()
  @MaxLength(120)
  stageName: string;

  @ApiPropertyOptional({
    example: 'Friendly hostess, Japanese and English speaking.',
  })
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

  @ApiPropertyOptional({
    example: ['https://cdn.example.com/casts/yuna.jpg'],
  })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(8)
  @IsUrl({ require_tld: false }, { each: true })
  mediaUrls?: string[];
}

export class CreatePartnerRequestDto {
  @ApiProperty({ example: 'Neon Club' })
  @IsNotEmpty()
  @IsString()
  @MaxLength(160)
  businessName: string;

  @ApiPropertyOptional({ example: 'Club / Lounge' })
  @IsOptional()
  @IsString()
  @MaxLength(80)
  businessType?: string;

  @ApiPropertyOptional({ example: 'Ha Noi - Tay Ho' })
  @IsOptional()
  @IsString()
  @MaxLength(120)
  area?: string;

  @ApiPropertyOptional({ example: 'Neon Club Tay Ho' })
  @IsOptional()
  @IsString()
  @MaxLength(160)
  storeName?: string;

  @ApiPropertyOptional({ example: 'CLUB' })
  @IsOptional()
  @IsString()
  @MaxLength(40)
  storeCategory?: string;

  @ApiPropertyOptional({
    example: 'Premium lounge with live DJ, private tables, and late-night menu.',
  })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  storeDescription?: string;

  @ApiPropertyOptional({ example: '12 Dang Thai Mai' })
  @IsOptional()
  @IsString()
  @MaxLength(240)
  storeAddress?: string;

  @ApiPropertyOptional({ example: 'Ha Noi' })
  @IsOptional()
  @IsString()
  @MaxLength(80)
  storeCity?: string;

  @ApiPropertyOptional({ example: 'Tay Ho' })
  @IsOptional()
  @IsString()
  @MaxLength(120)
  storeDistrict?: string;

  @ApiPropertyOptional({ example: '18:00 - 02:00 daily' })
  @IsOptional()
  @IsString()
  @MaxLength(240)
  openingHours?: string;

  @ApiPropertyOptional({
    example: 'Bottle service from 2,500,000 VND; cocktails from 180,000 VND.',
  })
  @IsOptional()
  @IsString()
  @MaxLength(1500)
  menuSummary?: string;

  @ApiPropertyOptional({
    example: ['https://cdn.example.com/stores/neon-hero.jpg'],
  })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(12)
  @IsUrl({ require_tld: false }, { each: true })
  mediaUrls?: string[];

  @ApiPropertyOptional({ type: [PartnerRequestCastDto] })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(12)
  @ValidateNested({ each: true })
  @Type(() => PartnerRequestCastDto)
  castProfiles?: PartnerRequestCastDto[];

  @ApiProperty({ example: 'Nguyen Van A' })
  @IsNotEmpty()
  @IsString()
  @MaxLength(120)
  contactName: string;

  @ApiProperty({ example: '+84901234567' })
  @IsNotEmpty()
  @IsString()
  @MaxLength(32)
  contactPhone: string;

  @ApiPropertyOptional({ example: 'owner@example.com' })
  @IsOptional()
  @IsEmail()
  @MaxLength(160)
  contactEmail?: string;

  @ApiPropertyOptional({
    example: 'We want to join the booking and coupon program.',
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  note?: string;
}

export class ReviewPartnerRequestDto {
  @ApiProperty({ example: true })
  @IsBoolean()
  approve: boolean;

  @ApiProperty({
    example: 'Thong tin hop le, duyet public store/cast/menu/media.',
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(500)
  reason: string;
}
