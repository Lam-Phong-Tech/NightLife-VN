import {
  IsString,
  IsNotEmpty,
  IsEnum,
  IsInt,
  IsOptional,
  IsArray,
  Min,
  Max,
  ArrayNotEmpty,
} from 'class-validator';
import { Type } from 'class-transformer';

export enum CreateAdminCouponDiscountType {
  PERCENT = 'PERCENT',
  FIXED_AMOUNT = 'FIXED_AMOUNT',
}

export class CreateAdminCouponDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEnum(CreateAdminCouponDiscountType)
  discountType: CreateAdminCouponDiscountType;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  discountValue: number;

  /** Empty array = toàn hệ thống, otherwise list of storeIds */
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  targetStores?: string[] = [];

  /** e.g. ["GUEST","MEMBER","VIP"] */
  @IsArray()
  @IsString({ each: true })
  @ArrayNotEmpty()
  targetAudiences: string[];

  /** Duration in days (7, 14, 30, 90) */
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(365)
  durationDays: number;

  /** null = unlimited */
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  usageLimit?: number;
}
