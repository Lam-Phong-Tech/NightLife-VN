import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsEmail,
  IsInt,
  IsISO8601,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';

export class CreateBookingDto {
  @ApiPropertyOptional({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'Store id. Use either storeId or storeSlug.',
  })
  @IsOptional()
  @IsUUID()
  storeId?: string;

  @ApiPropertyOptional({
    example: 'neon-club',
    description: 'Store slug. Use either storeId or storeSlug.',
  })
  @IsOptional()
  @IsString()
  @MaxLength(120)
  storeSlug?: string;

  @ApiPropertyOptional({
    example: '550e8400-e29b-41d4-a716-446655440001',
    description: 'Cast id for cast bookings. Use either castId or castSlug.',
  })
  @IsOptional()
  @IsUUID()
  castId?: string;

  @ApiPropertyOptional({
    example: 'yuna-neon',
    description: 'Cast slug for cast bookings. Use either castId or castSlug.',
  })
  @IsOptional()
  @IsString()
  @MaxLength(120)
  castSlug?: string;

  @ApiPropertyOptional({
    example: '550e8400-e29b-41d4-a716-446655440002',
    description:
      'Optional coupon campaign id to attach to this booking for reconciliation.',
  })
  @IsOptional()
  @IsUUID()
  couponId?: string;

  @ApiPropertyOptional({
    example: '550e8400-e29b-41d4-a716-446655440003',
    description:
      'Optional issued coupon id to attach to this booking for QR/check-in reconciliation.',
  })
  @IsOptional()
  @IsUUID()
  couponIssueId?: string;

  @ApiProperty({ example: 'Nguyen Van A' })
  @IsNotEmpty()
  @IsString()
  @MinLength(2)
  @MaxLength(80)
  displayName: string;

  @ApiPropertyOptional({
    example: 'guest@example.com',
    description:
      'Email used for guest booking confirmation and QR delivery. Required for new guest booking forms.',
  })
  @IsOptional()
  @IsEmail()
  @MaxLength(160)
  email?: string;

  @ApiPropertyOptional({
    example: '+84901234567',
    description:
      'Legacy phone contact. Kept optional for existing guest coupon and self-service flows.',
  })
  @IsOptional()
  @IsString()
  @MaxLength(32)
  phone?: string;

  @ApiProperty({ example: '2026-06-30T14:00:00.000Z' })
  @IsNotEmpty()
  @IsISO8601()
  scheduledAt: string;

  @ApiProperty({ example: 4, minimum: 1, maximum: 50 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(50)
  partySize: number;

  @ApiPropertyOptional({
    example: 'Can phong VIP, uu tien nhan vien noi tieng Nhat.',
  })
  @IsOptional()
  @IsString()
  @MaxLength(300)
  note?: string;
}
