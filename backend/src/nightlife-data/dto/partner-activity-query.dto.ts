import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsDateString,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';

export class PartnerActivityQueryDto {
  @ApiPropertyOptional({
    description: 'Number of items to return per page',
    default: 20,
    minimum: 1,
    maximum: 50,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(50)
  limit?: number = 20;

  @ApiPropertyOptional({
    description: 'Base64 opaque token encoding <activityAt_iso>_<id>',
  })
  @IsOptional()
  @IsString()
  cursor?: string;

  @ApiPropertyOptional({
    description: 'Filter by activity type',
    enum: ['ALL', 'COUPON_USAGE', 'BILL_PAYMENT', 'BOOKING_CHECKIN'],
    default: 'ALL',
  })
  @IsOptional()
  @IsString()
  @IsIn(['ALL', 'COUPON_USAGE', 'BILL_PAYMENT', 'BOOKING_CHECKIN'])
  type?: string = 'ALL';

  @ApiPropertyOptional({
    description: 'Start date boundary (ISO 8601 string)',
  })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({
    description: 'End date boundary (ISO 8601 string)',
  })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiPropertyOptional({
    description: 'Search string matching bill number, booking code, coupon code, or customer name/phone',
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    description: 'Optional store ID filter',
  })
  @IsOptional()
  @IsString()
  storeId?: string;
}

export type PartnerActivityType =
  | 'COUPON_USAGE'
  | 'BILL_PAYMENT'
  | 'BOOKING_CHECKIN';

export interface PartnerActivityItem {
  id: string;
  rawId: string;
  sourceType: 'BILL' | 'COUPON_ISSUE' | 'BOOKING';
  activityType: PartnerActivityType;
  activityAt: string;
  storeId: string;
  storeName: string;
  customerName?: string | null;
  customerPhone?: string | null;
  customerTier?: string | null;
  summary: string;
  totalVnd?: number | null;
  discountVnd?: number | null;
  couponCode?: string | null;
  billNumber?: string | null;
  bookingCode?: string | null;
  status: string;
  statusLabel?: string;
  badgeTone?: 'success' | 'warning' | 'danger' | 'info';
  linkedEntities?: {
    bookingId?: string | null;
    couponIssueId?: string | null;
    billId?: string | null;
  };
}

export interface PartnerActivityResponse {
  data: PartnerActivityItem[];
  nextCursor: string | null;
  hasMore: boolean;
}

export interface DecodedCursor {
  activityAt: string;
  id: string;
}

export function encodeCursor(activityAt: Date | string, id: string): string {
  const iso =
    activityAt instanceof Date
      ? activityAt.toISOString()
      : new Date(activityAt).toISOString();
  const str = `${iso}_${id}`;
  return Buffer.from(str, 'utf-8').toString('base64');
}

export function decodeCursor(cursor?: string): DecodedCursor | null {
  if (!cursor) return null;
  try {
    const decoded = Buffer.from(cursor, 'base64').toString('utf-8');
    const firstUnderscore = decoded.indexOf('_');
    if (firstUnderscore === -1) return null;
    const activityAt = decoded.substring(0, firstUnderscore);
    const id = decoded.substring(firstUnderscore + 1);
    if (!activityAt || !id || isNaN(Date.parse(activityAt))) return null;
    return { activityAt, id };
  } catch {
    return null;
  }
}
