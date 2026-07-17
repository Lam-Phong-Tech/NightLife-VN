import 'reflect-metadata';

import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';

import {
  ConfirmTourBookingCheckInDto,
  CreateTourBookingDto,
  ScanTourBookingQrDto,
} from './tour-booking.dto';

describe('Tour booking DTOs', () => {
  it('accepts structured cast selections grouped by tour store', async () => {
    const dto = plainToInstance(CreateTourBookingDto, {
      displayName: 'Nguyen Van A',
      email: ' Guest@Example.com ',
      scheduledAt: '2099-07-17T13:00:00.000Z',
      partySize: '4',
      castSelections: [
        {
          storeId: '11111111-1111-4111-8111-111111111111',
          castIds: ['22222222-2222-4222-8222-222222222222'],
        },
      ],
    });

    await expect(validate(dto)).resolves.toHaveLength(0);
    expect(dto.email).toBe('guest@example.com');
    expect(dto.partySize).toBe(4);
  });

  it('rejects a scan when the active partner store is not a UUID', async () => {
    const dto = plainToInstance(ScanTourBookingQrDto, {
      payload: 'https://nightlife.vn/partner?tourScanToken=signed.token',
      activeStoreId: 'wrong-store',
    });

    const errors = await validate(dto);
    expect(errors.some((error) => error.property === 'activeStoreId')).toBe(
      true,
    );
  });

  it('accepts an idempotent confirmation payload', async () => {
    const dto = plainToInstance(ConfirmTourBookingCheckInDto, {
      scanSessionToken: 'signed.session',
      idempotencyKey: '33333333-3333-4333-8333-333333333333',
      clientScannedAt: '2099-07-17T13:05:00.000Z',
      offline: false,
    });

    await expect(validate(dto)).resolves.toHaveLength(0);
  });
});
