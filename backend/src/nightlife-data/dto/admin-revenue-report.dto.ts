import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDateString,
  IsIn,
  IsOptional,
  IsUUID,
  Matches,
} from 'class-validator';

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
    example: '2026-07-01',
    description:
      'Local service usage date start. The backend converts this date using timezone.',
  })
  @IsOptional()
  @Matches(/^\d{4}-\d{2}-\d{2}$/)
  fromDate?: string;

  @ApiPropertyOptional({
    example: '2026-07-31',
    description:
      'Local service usage date end. The backend converts this date using timezone.',
  })
  @IsOptional()
  @Matches(/^\d{4}-\d{2}-\d{2}$/)
  toDate?: string;

  @ApiPropertyOptional({
    example: 'Asia/Ho_Chi_Minh',
    description:
      'Timezone used for service usage date filters and date grouping.',
    default: 'Asia/Ho_Chi_Minh',
  })
  @IsOptional()
  @IsIn(['Asia/Ho_Chi_Minh', 'UTC'])
  timezone?: string;

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

  @ApiPropertyOptional({
    example: '550e8400-e29b-41d4-a716-446655440030',
    description: 'Optional partner-account filter for the P2 revenue report.',
  })
  @IsOptional()
  @IsUUID()
  partnerAccountId?: string;

  @ApiPropertyOptional({
    example: '550e8400-e29b-41d4-a716-446655440040',
    description: 'Optional area filter for the P2 revenue report.',
  })
  @IsOptional()
  @IsUUID()
  areaId?: string;

  @ApiPropertyOptional({
    example: '550e8400-e29b-41d4-a716-446655440050',
    description: 'Optional requested-cast filter for the P2 revenue report.',
  })
  @IsOptional()
  @IsUUID()
  castId?: string;
}
