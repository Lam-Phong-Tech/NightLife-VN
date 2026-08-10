import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';

export class LegalPageSectionDto {
  @IsString()
  @MaxLength(180)
  heading!: string;

  @IsString()
  @MaxLength(30000)
  body!: string;
}

export class UpdateLegalPageDto {
  @IsInt()
  @Min(1)
  @Max(1000000)
  expectedVersion!: number;

  @IsOptional()
  @IsString()
  @MaxLength(180)
  title?: string;

  @IsOptional()
  @IsString()
  @MaxLength(320)
  excerpt?: string;

  @IsOptional()
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(50)
  @ValidateNested({ each: true })
  @Type(() => LegalPageSectionDto)
  sections?: LegalPageSectionDto[];

  @IsOptional()
  @IsBoolean()
  noindex?: boolean;
}
