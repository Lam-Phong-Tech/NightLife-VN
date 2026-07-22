import {
  IsOptional,
  IsString,
  IsInt,
  IsEnum,
  IsArray,
  IsBoolean,
  Min,
  Max,
} from 'class-validator';
import { CastStatus } from '@prisma/client';

export class CreateAdminCastDto {
  @IsString()
  stageName: string;

  @IsString()
  storeId: string;

  @IsOptional()
  @IsString()
  bio?: string;

  @IsOptional()
  @IsInt()
  birthMonth?: number;

  @IsOptional()
  @IsString()
  zodiacSign?: string;

  @IsOptional()
  @IsInt()
  @Min(50)
  @Max(250)
  heightCm?: number;

  @IsOptional()
  @IsString()
  measurements?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  languages?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  hobbies?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  youtubeLinks?: string[];

  @IsOptional()
  @IsBoolean()
  isPublic?: boolean;

  @IsOptional()
  @IsEnum(CastStatus)
  status?: CastStatus;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  mediaIds?: string[];
}

export class UpdateAdminCastDto {
  @IsOptional()
  @IsString()
  stageName?: string;

  @IsOptional()
  @IsString()
  storeId?: string;

  @IsOptional()
  @IsString()
  bio?: string;

  @IsOptional()
  @IsInt()
  birthMonth?: number;

  @IsOptional()
  @IsString()
  zodiacSign?: string;

  @IsOptional()
  @IsInt()
  @Min(50)
  @Max(250)
  heightCm?: number;

  @IsOptional()
  @IsString()
  measurements?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  languages?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  hobbies?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  youtubeLinks?: string[];

  @IsOptional()
  @IsBoolean()
  isPublic?: boolean;

  @IsOptional()
  @IsEnum(CastStatus)
  status?: CastStatus;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  mediaIds?: string[];
}
