import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsDateString,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import { VIETNAM_CITY_FILTER_CODES } from '../vietnam-admin-units';

export class AdminRankingQueryDto {
  @IsOptional()
  @IsString()
  @IsIn(['CAST', 'STORE', 'cast', 'store'])
  targetType?: string;

  @IsOptional()
  @IsString()
  @IsIn(VIETNAM_CITY_FILTER_CODES)
  city?: string;

  @IsOptional()
  @IsString()
  @MaxLength(32)
  category?: string;

  @IsOptional()
  @IsString()
  @MaxLength(40)
  scope?: string;
}

export class AdminRankingTargetOptionsQueryDto extends AdminRankingQueryDto {
  @IsOptional()
  @IsString()
  @MaxLength(80)
  q?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number;
}

export class CreateAdminRankingConfigDto {
  @IsString()
  @IsIn(['CAST', 'STORE', 'cast', 'store'])
  targetType!: string;

  @IsUUID()
  targetId!: string;

  @IsOptional()
  @IsUUID()
  areaId?: string | null;

  @IsOptional()
  @IsString()
  @IsIn(VIETNAM_CITY_FILTER_CODES)
  cityCode?: string;

  @IsOptional()
  @IsString()
  @MaxLength(32)
  category?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(40)
  scope?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(8, { message: 'Ranking P0 chỉ hỗ trợ Top 1-8' })
  pinRank?: number | null;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(100000)
  manualScore?: number;

  @IsOptional()
  @IsBoolean()
  sponsored?: boolean;

  @IsOptional()
  @IsString()
  @IsIn(['ACTIVE', 'PAUSED', 'EXPIRED'])
  status?: string;

  @IsOptional()
  @IsDateString()
  startsAt?: string | null;

  @IsOptional()
  @IsDateString()
  endsAt?: string | null;
}

export class UpdateAdminRankingConfigDto {
  @IsOptional()
  @IsString()
  @IsIn(['CAST', 'STORE', 'cast', 'store'])
  targetType?: string;

  @IsOptional()
  @IsUUID()
  targetId?: string;

  @IsOptional()
  @IsUUID()
  areaId?: string | null;

  @IsOptional()
  @IsString()
  @IsIn(VIETNAM_CITY_FILTER_CODES)
  cityCode?: string;

  @IsOptional()
  @IsString()
  @MaxLength(32)
  category?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(40)
  scope?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(8, { message: 'Ranking P0 chỉ hỗ trợ Top 1-8' })
  pinRank?: number | null;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(100000)
  manualScore?: number;

  @IsOptional()
  @IsBoolean()
  sponsored?: boolean;

  @IsOptional()
  @IsString()
  @IsIn(['ACTIVE', 'PAUSED', 'EXPIRED'])
  status?: string;

  @IsOptional()
  @IsDateString()
  startsAt?: string | null;

  @IsOptional()
  @IsDateString()
  endsAt?: string | null;
}
