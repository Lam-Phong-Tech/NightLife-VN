import {
  IsOptional,
  IsString,
  IsInt,
  Min,
  IsEnum,
  IsIn,
  IsArray,
  IsObject,
  IsNotEmpty,
  ValidateIf,
  registerDecorator,
  type ValidationArguments,
  type ValidationOptions,
} from 'class-validator';
import { Transform, type TransformFnParams, Type } from 'class-transformer';
import { StoreCategory, StoreStatus } from '@prisma/client';
import {
  IsStoreName,
  IsVietnamStorePhone,
  normalizeStoreName,
  normalizeStorePhone,
} from '../../common/validation/store-fields.validation';

const transformStoreName = ({ value }: TransformFnParams): unknown =>
  typeof value === 'string' ? normalizeStoreName(value) : (value as unknown);

const transformStorePhone = ({ value }: TransformFnParams): unknown =>
  typeof value === 'string' ? normalizeStorePhone(value) : (value as unknown);

const adminOpeningTimeRangePattern =
  /^(\d{1,2}):(\d{2})\s*[-–—]\s*(\d{1,2}):(\d{2})$/;

const isRecord = (value: unknown): value is Record<string, unknown> =>
  Boolean(value) && typeof value === 'object' && !Array.isArray(value);

const parseAdminOpeningSlot = (slot: string) => {
  const match = slot.trim().match(adminOpeningTimeRangePattern);
  if (!match) return null;

  const openHour = Number(match[1]);
  const openMinute = Number(match[2]);
  const closeHour = Number(match[3]);
  const closeMinute = Number(match[4]);

  if (
    openHour > 23 ||
    openMinute > 59 ||
    closeHour > 24 ||
    closeMinute > 59 ||
    (closeHour === 24 && closeMinute !== 0)
  ) {
    return null;
  }

  const openTotal = openHour * 60 + openMinute;
  const closeTotal = closeHour * 60 + closeMinute;
  if (closeTotal <= openTotal) return null;

  return { start: openTotal, end: closeTotal };
};

const isValidAdminOpeningHours = (value: unknown) => {
  if (value === undefined || value === null) return true;
  if (!isRecord(value)) return false;

  return Object.values(value).every((entry) => {
    if (!isRecord(entry)) return false;
    if (entry.isOff === true) return true;
    if (entry.isOff !== undefined && typeof entry.isOff !== 'boolean')
      return false;
    if (typeof entry.hours !== 'string') return false;

    const slots = entry.hours.split(',').map((slot) => slot.trim());
    if (slots.length === 0 || slots.some((slot) => !slot)) return false;
    const intervals = slots.map(parseAdminOpeningSlot);
    if (intervals.some((interval) => !interval)) return false;

    return intervals.every((interval, index) =>
      intervals.slice(index + 1).every((candidate) => {
        if (!interval || !candidate) return false;
        return (
          Math.max(interval.start, candidate.start) >=
          Math.min(interval.end, candidate.end)
        );
      }),
    );
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
  @IsIn(['all', 'name'])
  searchField?: 'all' | 'name';

  @IsOptional()
  @IsString()
  includeDeleted?: string;

  /**
   * Used only by admin pickers that configure public or operational features.
   * The normal admin list deliberately continues to include records awaiting review.
   */
  @IsOptional()
  @IsIn(['true', 'false', '1', '0'])
  eligibleOnly?: string;
}

export class CreateAdminStoreDto {
  @Transform(transformStoreName)
  @IsString()
  @IsStoreName()
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
  streetName?: string;

  @IsOptional()
  @IsString()
  ward?: string;

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
  @Transform(transformStorePhone)
  @IsVietnamStorePhone()
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
  @Transform(transformStoreName)
  @IsString()
  @IsStoreName()
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
  streetName?: string;

  @IsOptional()
  @IsString()
  ward?: string;

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
  @Transform(transformStorePhone)
  @IsVietnamStorePhone()
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
