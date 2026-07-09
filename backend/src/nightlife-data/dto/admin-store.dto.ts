import {
  IsOptional,
  IsString,
  IsInt,
  Min,
  IsEnum,
  IsArray,
  IsObject,
  IsNotEmpty,
  ValidateIf,
  registerDecorator,
  type ValidationArguments,
  type ValidationOptions,
} from 'class-validator';
import { Type } from 'class-transformer';
import { StoreCategory, StoreStatus } from '@prisma/client';

const adminOpeningTimeRangePattern = /^(\d{1,2}):(\d{2})\s*[-–—]\s*(\d{1,2}):(\d{2})$/;

const isRecord = (value: unknown): value is Record<string, unknown> =>
  Boolean(value) && typeof value === 'object' && !Array.isArray(value);

const isValidAdminOpeningSlot = (slot: string) => {
  const match = slot.trim().match(adminOpeningTimeRangePattern);
  if (!match) return false;

  const openHour = Number(match[1]);
  const openMinute = Number(match[2]);
  const closeHour = Number(match[3]);
  const closeMinute = Number(match[4]);

  if (openHour > 23 || closeHour > 23 || openMinute > 59 || closeMinute > 59) {
    return false;
  }

  const openTotal = openHour * 60 + openMinute;
  const closeTotal = closeHour * 60 + closeMinute;
  return openTotal !== closeTotal;
};

const isValidAdminOpeningHours = (value: unknown) => {
  if (value === undefined || value === null) return true;
  if (!isRecord(value)) return false;

  return Object.values(value).every((entry) => {
    if (!isRecord(entry)) return false;
    if (entry.isOff === true) return true;
    if (entry.isOff !== undefined && typeof entry.isOff !== 'boolean') return false;
    if (typeof entry.hours !== 'string') return false;

    const slots = entry.hours.split(',').map((slot) => slot.trim());
    if (slots.length === 0 || slots.some((slot) => !slot)) return false;
    return slots.every(isValidAdminOpeningSlot);
  });
};

function IsAdminOpeningHours(validationOptions?: ValidationOptions) {
  return (object: object, propertyName: string) => {
    registerDecorator({
      name: 'isAdminOpeningHours',
      target: object.constructor,
      propertyName,
      options: validationOptions,
      validator: {
        validate(value: unknown) {
          return isValidAdminOpeningHours(value);
        },
        defaultMessage(args: ValidationArguments) {
          return `${args.property} must use HH:mm - HH:mm ranges for every open day`;
        },
      },
    });
  };
}

export class AdminStoreQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 10;

  @IsOptional()
  @IsString()
  type?: string;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsString()
  includeDeleted?: string;
}

export class CreateAdminStoreDto {
  @IsString()
  name: string;

  @IsEnum(StoreCategory)
  category: StoreCategory;

  @IsString()
  city: string;

  @IsNotEmpty()
  @IsString()
  address: string;

  @IsOptional()
  @IsString()
  mapUrl?: string;

  @IsOptional()
  @IsObject()
  @IsAdminOpeningHours()
  openingHours?: any;

  @IsOptional()
  @IsObject()
  pricingInfo?: any;

  @IsOptional()
  @IsEnum(StoreStatus)
  status?: StoreStatus;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  mediaIds?: string[];

  @ValidateIf((_, value) => value !== undefined && value !== null)
  @IsString()
  partnerAccountId?: string | null;
}

export class UpdateAdminStoreDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsEnum(StoreCategory)
  category?: StoreCategory;

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsString()
  mapUrl?: string;

  @IsOptional()
  @IsObject()
  @IsAdminOpeningHours()
  openingHours?: any;

  @IsOptional()
  @IsObject()
  pricingInfo?: any;

  @IsOptional()
  @IsEnum(StoreStatus)
  status?: StoreStatus;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  mediaIds?: string[];

  @ValidateIf((_, value) => value !== undefined && value !== null)
  @IsString()
  partnerAccountId?: string | null;
}

export class LinkAdminStorePartnerAccountDto {
  @ValidateIf((_, value) => value !== undefined && value !== null)
  @IsString()
  partnerAccountId?: string | null;
}
