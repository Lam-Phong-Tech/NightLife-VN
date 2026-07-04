import { Type } from 'class-transformer';
import {
  IsDateString,
  IsIn,
  IsInt,
  IsObject,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

export class PublicContentQueryDto {
  @IsOptional()
  @IsString()
  @IsIn(['BLOG', 'POLICY', 'BANNER', 'blog', 'policy', 'banner'])
  type?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  q?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number;
}

export class AdminContentQueryDto extends PublicContentQueryDto {
  @IsOptional()
  @IsString()
  @IsIn(['DRAFT', 'PUBLISHED', 'ARCHIVED', 'DELETED', 'draft', 'published', 'archived', 'deleted'])
  status?: string;
}

export class CreateAdminContentDto {
  @IsString()
  @IsIn(['BLOG', 'POLICY', 'BANNER', 'blog', 'policy', 'banner'])
  type!: string;

  @IsString()
  @MaxLength(180)
  title!: string;

  @IsOptional()
  @IsString()
  @MaxLength(180)
  slug?: string;

  @IsOptional()
  @IsString()
  @IsIn(['DRAFT', 'PUBLISHED', 'ARCHIVED', 'draft', 'published', 'archived'])
  status?: string;

  @IsOptional()
  @IsString()
  @MaxLength(320)
  excerpt?: string | null;

  @IsOptional()
  @IsString()
  body?: string | null;

  @IsOptional()
  @IsObject()
  metadata?: Record<string, unknown> | null;

  @IsOptional()
  @IsDateString()
  publishedAt?: string | null;

  @IsOptional()
  @IsUUID()
  storeId?: string | null;
}

export class UpdateAdminContentDto {
  @IsOptional()
  @IsString()
  @IsIn(['BLOG', 'POLICY', 'BANNER', 'blog', 'policy', 'banner'])
  type?: string;

  @IsOptional()
  @IsString()
  @MaxLength(180)
  title?: string;

  @IsOptional()
  @IsString()
  @MaxLength(180)
  slug?: string;

  @IsOptional()
  @IsString()
  @IsIn(['DRAFT', 'PUBLISHED', 'ARCHIVED', 'draft', 'published', 'archived'])
  status?: string;

  @IsOptional()
  @IsString()
  @MaxLength(320)
  excerpt?: string | null;

  @IsOptional()
  @IsString()
  body?: string | null;

  @IsOptional()
  @IsObject()
  metadata?: Record<string, unknown> | null;

  @IsOptional()
  @IsDateString()
  publishedAt?: string | null;

  @IsOptional()
  @IsUUID()
  storeId?: string | null;
}
