import 'reflect-metadata';

import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';

import { CreateBookingDto } from './create-booking.dto';

const validBookingPayload = {
  displayName: 'Nguyen Van A',
  email: 'guest@gmail.com',
  partySize: 4,
  scheduledAt: '2099-07-08T14:00:00.000Z',
  storeSlug: 'tokyo-kitchen',
};

describe('CreateBookingDto', () => {
  const validateBookingEmail = async (email: string) => {
    const dto = plainToInstance(CreateBookingDto, {
      ...validBookingPayload,
      email,
    });

    return validate(dto);
  };

  it('rejects non-gmail booking email domains', async () => {
    for (const email of [
      'guest@gmai.com',
      'guest@gmeo.com',
      'guest@gmail.con',
      'guest@yahoo.com',
    ]) {
      const errors = await validateBookingEmail(email);
      const emailError = errors.find((error) => error.property === 'email');

      expect(emailError?.constraints).toMatchObject({
        isGmailAddress: 'email must be a gmail.com address',
      });
    }
  });

  it('accepts a normalized valid booking email domain', async () => {
    await expect(
      validateBookingEmail(' Guest@Gmail.COM '),
    ).resolves.toHaveLength(0);
  });
});
