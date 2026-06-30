import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
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

  @ApiPropertyOptional({ example: 2000000, minimum: 0 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(1_000_000_000)
  subtotalVnd?: number;

  @ApiPropertyOptional({ example: 200000, minimum: 0 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(1_000_000_000)
  discountVnd?: number;

  @ApiPropertyOptional({ example: 100000, minimum: 0 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(1_000_000_000)
  serviceChargeVnd?: number;

  @ApiPropertyOptional({ example: 180000, minimum: 0 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(1_000_000_000)
  taxVnd?: number;

  @ApiProperty({ example: 1800000, minimum: 1 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(1_000_000_000)
  totalVnd: number;

  @ApiPropertyOptional({
    example: 1800000,
    description: 'Actual amount paid by customer. Defaults to totalVnd.',
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(1_000_000_000)
  paidVnd?: number;
}
