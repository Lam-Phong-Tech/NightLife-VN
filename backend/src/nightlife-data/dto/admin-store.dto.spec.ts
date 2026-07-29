import 'reflect-metadata';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { StoreCategory } from '@prisma/client';
import { CreateAdminStoreDto } from './admin-store.dto';

const validStore = (openingHours: Record<string, unknown>) =>
  plainToInstance(CreateAdminStoreDto, {
    name: 'JOJO BAR',
    category: StoreCategory.BAR,
    city: 'Ho Chi Minh City',
    address: '1 Nguyen Hue',
    openingHours,
  });

describe('admin store opening hours validation', () => {
  it('accepts calendar-day ranges ending at 24:00', async () => {
    const errors = await validate(
      validStore({
        'Thứ 2': { isOff: false, hours: '19:00 - 24:00' },
        'Thứ 3': { isOff: false, hours: '00:00 - 02:00, 19:00 - 24:00' },
      }),
    );

    expect(errors).toEqual([]);
  });

  it('rejects a direct overnight range', async () => {
    const errors = await validate(
      validStore({
        'Thứ 2': { isOff: false, hours: '19:00 - 02:00' },
      }),
    );

    expect(errors.some((error) => error.property === 'openingHours')).toBe(
      true,
    );
  });

  it('rejects overlapping ranges in the same calendar day', async () => {
    const errors = await validate(
      validStore({
        'Thứ 3': { isOff: false, hours: '00:00 - 03:00, 02:00 - 04:00' },
      }),
    );

    expect(errors.some((error) => error.property === 'openingHours')).toBe(
      true,
    );
  });
});
