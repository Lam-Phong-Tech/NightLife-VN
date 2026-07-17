import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  MaxLength,
  Min,
  ValidateIf,
} from 'class-validator';

export class AdminCommissionOverrideQueryDto {
  @ApiPropertyOptional({ description: 'Filter overrides by store id.' })
  @IsOptional()
  @IsUUID()
  storeId?: string;

  @ApiPropertyOptional({
    description: 'Filter overrides by coupon campaign id.',
  })
  @IsOptional()
  @IsUUID()
  couponId?: string;
}

export class CreateCommissionOverrideDto {
  @ApiProperty({
    description:
      'Deprecated input. Commission override APIs are disabled and return 410 Gone.',
  })
  @IsUUID()
  storeId: string;

  @ApiPropertyOptional({
    description: 'Coupon campaign id. Required when couponCode is omitted.',
  })
  @ValidateIf((dto: CreateCommissionOverrideDto) => !dto.couponCode)
  @IsUUID()
  couponId?: string;

  @ApiPropertyOptional({
    description: 'Coupon code. Required when couponId is omitted.',
  })
  @ValidateIf((dto: CreateCommissionOverrideDto) => !dto.couponId)
  @IsString()
  @MaxLength(80)
  couponCode?: string;

  @ApiProperty({
    example: 18,
    minimum: 0,
    maximum: 100,
    description:
      'Deprecated input. Commission override APIs are disabled and return 410 Gone.',
  })
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(100)
  commissionPercent: number;

  @ApiPropertyOptional({ example: 'Launch campaign override approved by PM.' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  note?: string;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  active?: boolean;
}

export class UpdateCommissionOverrideDto {
  @ApiPropertyOptional({
    example: 18,
    minimum: 0,
    maximum: 100,
    description:
      'Deprecated input. Commission override APIs are disabled and return 410 Gone.',
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(100)
  commissionPercent?: number;

  @ApiPropertyOptional({ example: 'Adjusted after PM review.' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  note?: string;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  active?: boolean;
}
