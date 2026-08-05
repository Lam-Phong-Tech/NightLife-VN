import 'reflect-metadata';

import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';

import { CreatePartnerRequestDto } from './create-partner-request.dto';

const validPartnerRequestPayload = {
  businessName: 'Neon Partner',
  businessType: 'BAR',
  contactName: 'Nguyen Van A',
  contactPhone: '+84901234567',
  password: '12345678',
};

describe('CreatePartnerRequestDto', () => {
  it('rejects partner registration passwords shorter than 8 characters', async () => {
    const dto = plainToInstance(CreatePartnerRequestDto, {
      ...validPartnerRequestPayload,
      password: '123456',
    });

    const errors = await validate(dto);
    const passwordError = errors.find((error) => error.property === 'password');

    expect(passwordError?.constraints).toMatchObject({
      minLength: 'password must be longer than or equal to 8 characters',
    });
  });

  it('accepts an 8 character partner registration password', async () => {
    const dto = plainToInstance(
      CreatePartnerRequestDto,
      validPartnerRequestPayload,
    );

    await expect(validate(dto)).resolves.toHaveLength(0);
  });
});
