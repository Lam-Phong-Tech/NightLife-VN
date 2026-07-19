import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

export class BillOcrPreviewDto {
  @ApiPropertyOptional({
    example: 'bill-total-1800000-used-2026-07-03-21-30.png',
    description:
      'Original uploaded file name for audit/display only. It is not used as an OCR extraction source.',
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  fileName?: string;

  @ApiPropertyOptional({
    example: 'Tong cong: 1.800.000 VND\nNgay: 03/07/2026 21:30',
    description:
      'Optional text extracted by a real OCR/text extraction step before calling the preview endpoint.',
  })
  @IsOptional()
  @IsString()
  @MaxLength(8000)
  text?: string;
}

export class ReverseBillDto {
  @ApiPropertyOptional({
    example: 'Duplicate/fake bill confirmed during reconciliation.',
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  reason?: string;
}

export class AutoReverseBillsDto {
  @ApiPropertyOptional({
    example: true,
    description:
      'When false or omitted, returns candidates only. When true, reverses eligible high-risk bills.',
  })
  @IsOptional()
  @IsBoolean()
  execute?: boolean;

  @ApiPropertyOptional({
    example: 10,
    description: 'Maximum number of eligible bills to reverse in one run.',
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(25)
  limit?: number;

  @ApiPropertyOptional({
    example: 'Auto reversal for confirmed duplicate/fake bill signals.',
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  reason?: string;
}
