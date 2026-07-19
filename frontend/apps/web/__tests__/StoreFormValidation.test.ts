import { describe, expect, it } from 'vitest';

import {
  normalizeStoreName,
  validateStoreName,
  validateVietnamStorePhone,
} from '../src/lib/store-form-validation';

describe('store name validation', () => {
  it.each([
    'Vy',
    'Mộc',
    'An',
    'Cà phê Trung Nguyên',
    "Bob's Burger",
    'A&B Cafe',
    'Bar 1900, Hà Nội.',
  ])('accepts valid store name "%s"', (name) => {
    expect(validateStoreName(name)).toBe('');
  });

  it('trims surrounding whitespace and normalizes Vietnamese text', () => {
    expect(normalizeStoreName('  Mộc  ')).toBe('Mộc');
  });

  it.each([
    ['', 'Vui lòng nhập tên quán.'],
    ['   ', 'Vui lòng nhập tên quán.'],
    ['A', 'Tên quán phải có ít nhất 2 ký tự.'],
    ['<b>Club</b>', 'Tên quán không được chứa thẻ HTML hoặc các ký tự <, >, {, }.'],
    ['Club {VIP}', 'Tên quán không được chứa thẻ HTML hoặc các ký tự <, >, {, }.'],
    ['Club @ Home', "Tên quán chỉ được gồm chữ cái, chữ số, khoảng trắng và các ký tự & ' - . ,"],
    ['--', 'Tên quán phải có ít nhất một chữ cái hoặc chữ số.'],
  ])('rejects invalid store name "%s"', (name, message) => {
    expect(validateStoreName(name)).toBe(message);
  });
});

describe('Vietnam store phone validation', () => {
  it.each([
    '',
    '0901234567',
    '+84901234567',
    '(090) 123-4567',
    '02873051234',
    '+84 28 7305 1234',
  ])('accepts valid optional phone "%s"', (phone) => {
    expect(validateVietnamStorePhone(phone)).toBe('');
  });

  it.each([
    ['0123456789', 'Số điện thoại Việt Nam không hợp lệ. Dùng số di động 10 số hoặc số bàn 11 số.'],
    ['091234567', 'Số điện thoại Việt Nam không hợp lệ. Dùng số di động 10 số hoặc số bàn 11 số.'],
    ['09123456789', 'Số điện thoại Việt Nam không hợp lệ. Dùng số di động 10 số hoặc số bàn 11 số.'],
    ['84901234567', 'Số điện thoại Việt Nam phải bắt đầu bằng 0 hoặc +84.'],
    ['09012abc67', 'Số điện thoại chỉ được gồm số, dấu +, khoảng trắng, dấu chấm, gạch ngang hoặc ngoặc đơn.'],
  ])('rejects invalid phone "%s"', (phone, message) => {
    expect(validateVietnamStorePhone(phone)).toBe(message);
  });
});
