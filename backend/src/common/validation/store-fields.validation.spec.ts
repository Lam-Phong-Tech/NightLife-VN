import 'reflect-metadata';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { StoreCategory } from '@prisma/client';
import {
  CreateAdminStoreDto,
  UpdateAdminStoreDto,
} from '../../nightlife-data/dto/admin-store.dto';
import {
  isValidStoreName,
  isValidVietnamStorePhone,
  normalizeStoreName,
} from './store-fields.validation';

describe('store field validation', () => {
  it.each([
    'Vy',
    'Mộc',
    'Cà phê Trung Nguyên',
    "Bob's Burger",
    'A&B Cafe',
    'Bar 1900, Hà Nội.',
  ])('accepts valid store name "%s"', (name) => {
    expect(isValidStoreName(name)).toBe(true);
  });

  it('normalizes and trims a store name', () => {
    expect(normalizeStoreName('  Mộc  ')).toBe('Mộc');
  });

  it.each(['', ' ', 'A', '<b>Club</b>', 'Club {VIP}', 'Club @ Home', '--'])(
    'rejects invalid store name "%s"',
    (name) => {
      expect(isValidStoreName(name)).toBe(false);
    },
  );

  it.each([
    '',
    '0901234567',
    '+84901234567',
    '(090) 123-4567',
    '02873051234',
    '+84 28 7305 1234',
  ])('accepts valid optional Vietnam phone "%s"', (phone) => {
    expect(isValidVietnamStorePhone(phone)).toBe(true);
  });

  it.each([
    '0123456789',
    '091234567',
    '09123456789',
    '84901234567',
    '09012abc67',
  ])('rejects invalid Vietnam phone "%s"', (phone) => {
    expect(isValidVietnamStorePhone(phone)).toBe(false);
  });

  it('trims valid create payload fields before the service receives them', async () => {
    const dto = plainToInstance(CreateAdminStoreDto, {
      name: '  Mộc  ',
      category: StoreCategory.CLUB,
      city: 'Hanoi',
      address: '12 Nguyễn Huệ',
      phone: '  +84901234567  ',
    });

    await expect(validate(dto)).resolves.toHaveLength(0);
    expect(dto.name).toBe('Mộc');
    expect(dto.phone).toBe('+84901234567');
  });

  it('rejects invalid name and phone on update payloads', async () => {
    const dto = plainToInstance(UpdateAdminStoreDto, {
      name: '<b>Club</b>',
      phone: '0123456789',
    });
    const errors = await validate(dto);

    expect(errors.map((error) => error.property)).toEqual(
      expect.arrayContaining(['name', 'phone']),
    );
  });
});
