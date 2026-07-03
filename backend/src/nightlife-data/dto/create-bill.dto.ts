import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsDateString,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateBillDto {
  @ApiPropertyOptional({
    example: '550e8400-e29b-41d4-a716-446655440010',
    description:
      'Optional booking id to connect this bill to a member booking.',
  })
  @IsOptional()
  @IsUUID()
  bookingId?: string;

  @ApiPropertyOptional({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'Store id. Required when bookingId is not provided.',
  })
  @IsOptional()
  @IsUUID()
  storeId?: string;

  @ApiPropertyOptional({
    example: 'neon-club',
    description:
      'Store slug. Required when bookingId and storeId are not provided.',
  })
  @IsOptional()
  @IsString()
  @MaxLength(120)
  storeSlug?: string;

  @ApiPropertyOptional({
    example: '550e8400-e29b-41d4-a716-446655440020',
    description:
      'Optional direct coupon campaign id to connect this bill. Direct campaign links must still be ACTIVE at submit time; use couponIssueId for historical reconciliation.',
  })
  @IsOptional()
  @IsUUID()
  couponId?: string;

  @ApiPropertyOptional({
    example: '550e8400-e29b-41d4-a716-446655440021',
    description:
      'Optional issued coupon id to connect this bill for reconciliation. Store can be inferred from the issue when bookingId/store are omitted.',
  })
  @IsOptional()
  @IsUUID()
  couponIssueId?: string;

  @ApiProperty({
    example: 1800000,
    minimum: 1,
    description:
      'Original bill total in VND. Do not submit item or service details.',
  })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(1_000_000_000)
  totalVnd: number;

  @ApiProperty({
    example: '2026-06-30T14:00:00.000Z',
    description:
      'Service usage time. Bill submissions are accepted only within 10 days of this time.',
  })
  @IsDateString()
  usedAt: string;
}

export class AdminSensitiveBillQueryDto {
  @ApiPropertyOptional({
    example: '550e8400-e29b-41d4-a716-446655440010',
    description: 'Filter sensitive bills by linked booking id.',
  })
  @IsOptional()
  @IsUUID()
  bookingId?: string;

  @ApiPropertyOptional({
    example: '550e8400-e29b-41d4-a716-446655440020',
    description: 'Filter sensitive bills by linked coupon campaign id.',
  })
  @IsOptional()
  @IsUUID()
  couponId?: string;

  @ApiPropertyOptional({
    example: '550e8400-e29b-41d4-a716-446655440021',
    description: 'Filter sensitive bills by linked coupon issue id.',
  })
  @IsOptional()
  @IsUUID()
  couponIssueId?: string;
}
