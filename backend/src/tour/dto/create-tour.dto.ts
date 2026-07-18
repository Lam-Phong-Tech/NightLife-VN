import {
  ArrayUnique,
  IsBoolean,
  IsDefined,
  IsString,
  IsNumber,
  IsOptional,
  IsEnum,
  IsArray,
  Matches,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ProfileStatus } from '@prisma/client';

const departureTimePattern = /^([01]\d|2[0-3]):[0-5]\d$/;

export class TourDepartureDayDto {
  @IsBoolean()
  isOff: boolean;

  @IsArray()
  @ArrayUnique()
  @Matches(departureTimePattern, { each: true })
  times: string[];
}

export class TourDepartureScheduleDto {
  @IsDefined()
  @ValidateNested()
  @Type(() => TourDepartureDayDto)
  monday: TourDepartureDayDto;

  @IsDefined()
  @ValidateNested()
  @Type(() => TourDepartureDayDto)
  tuesday: TourDepartureDayDto;

  @IsDefined()
  @ValidateNested()
  @Type(() => TourDepartureDayDto)
  wednesday: TourDepartureDayDto;

  @IsDefined()
  @ValidateNested()
  @Type(() => TourDepartureDayDto)
  thursday: TourDepartureDayDto;

  @IsDefined()
  @ValidateNested()
  @Type(() => TourDepartureDayDto)
  friday: TourDepartureDayDto;

  @IsDefined()
  @ValidateNested()
  @Type(() => TourDepartureDayDto)
  saturday: TourDepartureDayDto;

  @IsDefined()
  @ValidateNested()
  @Type(() => TourDepartureDayDto)
  sunday: TourDepartureDayDto;
}

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

  @IsOptional()
  @ValidateNested()
  @Type(() => TourDepartureScheduleDto)
  departureSchedule?: TourDepartureScheduleDto;

  @IsArray()
  stops: { storeId: string; order: number }[];
}
