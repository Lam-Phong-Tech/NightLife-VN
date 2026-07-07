import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

export class AutoBillFraudReversalDto {
  @ApiPropertyOptional({
    example: 'Duplicate/fake bill confirmed during QA fraud review.',
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  reason?: string;

  @ApiPropertyOptional({
    example: true,
    description: 'When true, returns fraud analysis without voiding the bill.',
  })
  @IsOptional()
  @IsBoolean()
  dryRun?: boolean;
}

export class AdminQaAuditTrailQueryDto {
  @ApiPropertyOptional({ example: 14 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(90)
  days?: number;

  @ApiPropertyOptional({
    enum: ['booking', 'coupon', 'bill', 'admin', 'partner', 'all'],
    example: 'bill',
  })
  @IsOptional()
  @IsIn(['booking', 'coupon', 'bill', 'admin', 'partner', 'all'])
  module?: 'booking' | 'coupon' | 'bill' | 'admin' | 'partner' | 'all';

  @ApiPropertyOptional({ enum: ['json', 'csv'], example: 'csv' })
  @IsOptional()
  @IsIn(['json', 'csv'])
  format?: 'json' | 'csv';
}

export class AdminUatDashboardQueryDto {
  @ApiPropertyOptional({ example: 14 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(90)
  days?: number;
}
