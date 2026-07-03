import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsOptional, IsUUID } from 'class-validator';

export class AdminRevenueReportQueryDto {
  @ApiPropertyOptional({
    example: '2026-07-01T00:00:00.000Z',
    description:
      'Filter by service usage date/time (Bill.usedAt), inclusive start.',
  })
  @IsOptional()
  @IsDateString()
  from?: string;

  @ApiPropertyOptional({
    example: '2026-07-31T23:59:59.999Z',
    description:
      'Filter by service usage date/time (Bill.usedAt), inclusive end.',
  })
  @IsOptional()
  @IsDateString()
  to?: string;

  @ApiPropertyOptional({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'Optional store filter for the P0 report.',
  })
  @IsOptional()
  @IsUUID()
  storeId?: string;

  @ApiPropertyOptional({
    example: '550e8400-e29b-41d4-a716-446655440020',
    description: 'Optional coupon campaign filter for the P0 report.',
  })
  @IsOptional()
  @IsUUID()
  couponId?: string;
}
