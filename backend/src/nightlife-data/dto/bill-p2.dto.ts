import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';

export class BillOcrPreviewDto {
  @ApiPropertyOptional({
    example: 'bill-total-1800000-used-2026-07-03-21-30.png',
    description: 'Original uploaded file name used as OCR fallback context.',
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  fileName?: string;

  @ApiPropertyOptional({
    example: 'Tong cong: 1.800.000 VND\nNgay: 03/07/2026 21:30',
    description:
      'Optional text extracted client-side from a text/PDF bill before calling the preview endpoint.',
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
