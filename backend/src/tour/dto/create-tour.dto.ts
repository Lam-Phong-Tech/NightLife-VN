import { IsString, IsNumber, IsOptional, IsEnum, IsArray } from 'class-validator';
import { ProfileStatus } from '@prisma/client';

export class CreateTourDto {
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  subtitle?: string;

  @IsString()
  city: string;

  @IsNumber()
  durationHours: number;

  @IsNumber()
  priceTier: number;

  @IsOptional()
  @IsString()
  coverUrl?: string;

  @IsOptional()
  @IsEnum(ProfileStatus)
  status?: ProfileStatus;

  @IsArray()
  @IsString({ each: true })
  departureTimes: string[];

  @IsArray()
  stops: { storeId: string; order: number }[];
}
