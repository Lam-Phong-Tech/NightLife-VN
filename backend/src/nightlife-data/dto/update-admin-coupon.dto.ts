import {
  IsString,
  IsEnum,
  IsInt,
  IsOptional,
  IsArray,
  Min,
  IsDateString,
} from 'class-validator';
import { Type } from 'class-transformer';
import { DiscountType, CouponStatus } from '@prisma/client';

export class UpdateAdminCouponDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsEnum(DiscountType)
  @IsOptional()
  discountType?: DiscountType;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  discountValue?: number;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  targetStores?: string[];

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  targetAudiences?: string[];

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  usageLimit?: number;

  @IsEnum(CouponStatus)
  @IsOptional()
  status?: CouponStatus;

  @IsDateString()
  @IsOptional()
  startsAt?: string;

  @IsDateString()
  @IsOptional()
  endsAt?: string;
}
