import { IsOptional, IsString, Matches, MaxLength } from 'class-validator';

const decimalNumberPattern = /^-?\d+(\.\d+)?$/;

export class PublicDiscoveryQueryDto {
  @IsOptional()
  @IsString()
  @MaxLength(80)
  q?: string;

  @IsOptional()
  @IsString()
  @MaxLength(24)
  city?: string;

  @IsOptional()
  @IsString()
  @MaxLength(64)
  area?: string;

  @IsOptional()
  @IsString()
  @MaxLength(32)
  category?: string;

  @IsOptional()
  @IsString()
  @MaxLength(16)
  language?: string;

  @IsOptional()
  @IsString()
  @MaxLength(40)
  tag?: string;

  @IsOptional()
  @Matches(decimalNumberPattern)
  lat?: string;

  @IsOptional()
  @Matches(decimalNumberPattern)
  lng?: string;

  @IsOptional()
  @Matches(/^\d{1,3}$/)
  limit?: string;
}
