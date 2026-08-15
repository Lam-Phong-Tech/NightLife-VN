import 'reflect-metadata';

import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';

import { CreateBookingDto } from './create-booking.dto';

const validBookingPayload = {
  displayName: 'Nguyen Van A',
  email: 'guest@example.com',
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

  it('accepts valid booking email domains', async () => {
    for (const email of [
      'guest@gmail.com',
      'guest@outlook.com',
      'guest@yahoo.com',
      'guest@company.vn',
    ]) {
      const errors = await validateBookingEmail(email);

      expect(errors).toHaveLength(0);
    }
  });

  it('accepts a normalized booking email address', async () => {
    await expect(
      validateBookingEmail(' Guest@Company.VN '),
    ).resolves.toHaveLength(0);
  });

  it('rejects invalid booking email addresses', async () => {
    const errors = await validateBookingEmail('guest@company');
    const emailError = errors.find((error) => error.property === 'email');

    expect(emailError?.constraints).toHaveProperty('isEmail');
  });
});
