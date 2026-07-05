import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type, type TransformFnParams } from 'class-transformer';
import {
  IsEmail,
  IsInt,
  IsISO8601,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  Matches,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';

const trimOptionalString = ({ value }: TransformFnParams): unknown => {
  if (typeof value !== 'string') return value;
  const trimmed = value.trim();
  return trimmed || undefined;
};

const trimDisplayName = ({ value }: TransformFnParams): unknown =>
  typeof value === 'string' ? value.trim().replace(/\s+/g, ' ') : value;

const trimLowerEmail = ({ value }: TransformFnParams): unknown => {
  if (typeof value !== 'string') return value;
  const trimmed = value.trim().toLowerCase();
  return trimmed || undefined;
};

export class CreateBookingDto {
  @ApiPropertyOptional({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'Store id. Use either storeId or storeSlug.',
  })
  @Transform(trimOptionalString)
  @IsOptional()
  @IsUUID()
  storeId?: string;

  @ApiPropertyOptional({
    example: 'neon-club',
    description: 'Store slug. Use either storeId or storeSlug.',
  })
  @Transform(trimOptionalString)
  @IsOptional()
  @IsString()
  @MaxLength(120)
  storeSlug?: string;

  @ApiPropertyOptional({
    example: '550e8400-e29b-41d4-a716-446655440001',
    description: 'Cast id for cast bookings. Use either castId or castSlug.',
  })
  @Transform(trimOptionalString)
  @IsOptional()
  @IsUUID()
  castId?: string;

  @ApiPropertyOptional({
    example: 'yuna-neon',
    description: 'Cast slug for cast bookings. Use either castId or castSlug.',
  })
  @Transform(trimOptionalString)
  @IsOptional()
  @IsString()
  @MaxLength(120)
  castSlug?: string;

  @ApiPropertyOptional({
    example: '550e8400-e29b-41d4-a716-446655440002',
    description:
      'Optional coupon campaign id to attach to this booking for reconciliation.',
  })
  @Transform(trimOptionalString)
  @IsOptional()
  @IsUUID()
  couponId?: string;

  @ApiPropertyOptional({
    example: '550e8400-e29b-41d4-a716-446655440003',
    description:
      'Optional issued coupon id to attach to this booking for QR/check-in reconciliation.',
  })
  @Transform(trimOptionalString)
  @IsOptional()
  @IsUUID()
  couponIssueId?: string;

  @ApiProperty({ example: 'Nguyen Van A' })
  @Transform(trimDisplayName)
  @IsNotEmpty()
  @IsString()
  @MinLength(2)
  @MaxLength(80)
  @Matches(/^[\p{L}\s]+$/u, {
    message: 'displayName must contain letters and spaces only',
  })
  displayName: string;

  @ApiPropertyOptional({
    example: 'guest@example.com',
    description:
      'Email used for guest booking confirmation and QR delivery. Required for new guest booking forms.',
  })
  @Transform(trimLowerEmail)
  @IsOptional()
  @IsEmail()
  @MaxLength(160)
  email?: string;

  @ApiPropertyOptional({
    example: '+84901234567',
    description:
      'Legacy phone contact. Kept optional for existing guest coupon and self-service flows.',
  })
  @Transform(trimOptionalString)
  @IsOptional()
  @IsString()
  @MaxLength(20)
  @Matches(/^[0-9+\-\s().]{8,20}$/, {
    message: 'phone must be a valid phone number',
  })
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
  @Transform(trimOptionalString)
  @IsOptional()
  @IsString()
  @MaxLength(300)
  note?: string;
}
