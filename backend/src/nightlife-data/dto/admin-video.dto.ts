import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsInt,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';

export class AdminStoreVideoQueryDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  cityCode?: string;

  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ default: 50 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 50;
}

export class UpdateHotVideosDto {
  @ApiProperty({ type: [String] })
  @IsArray()
  @IsString({ each: true })
  mediaIds: string[];
}

export class PublicHomeContentQueryDto {
  @ApiPropertyOptional({ example: 'hn' })
  @IsOptional()
  @IsString()
  cityCode?: string;

  @ApiPropertyOptional({ example: 'LOUNGE,CLUB' })
  @IsOptional()
  @IsString()
  categories?: string;

  @ApiPropertyOptional({ example: 'moonlight-bar,neon-club' })
  @IsOptional()
  @IsString()
  storeSlugs?: string;

  @ApiPropertyOptional({ default: 8, maximum: 24 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(24)
  limit?: number = 8;
}

export class PublicHotVideoInteractionDto {
  @ApiPropertyOptional({ example: 'home_video' })
  @IsOptional()
  @IsString()
  source?: string;

  @ApiPropertyOptional({ example: 'mobile_home' })
  @IsOptional()
  @IsString()
  surface?: string;

  @ApiPropertyOptional({ example: 'anon_abc123' })
  @IsOptional()
  @IsString()
  anonymousId?: string;

  @ApiPropertyOptional({ example: 'moonlight-bar' })
  @IsOptional()
  @IsString()
  storeSlug?: string;
}
