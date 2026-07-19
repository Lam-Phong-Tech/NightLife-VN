import { registerDecorator, type ValidationOptions } from 'class-validator';

const storeNamePattern = /^[\p{L}\p{N} &'.,-]+$/u;
const storeNameContentPattern = /[\p{L}\p{N}]/u;
const storeNameBlockedCharacterPattern = /[<>{}]/;
const storePhoneCharacterPattern = /^[0-9+\-\s().]+$/;
const vietnamMobilePattern = /^0(?:3[2-9]|5[25689]|7[06-9]|8[1-689]|9\d)\d{7}$/;
const vietnamLandlinePattern = /^02\d{9}$/;

export const normalizeStoreName = (value: string) =>
  value.normalize('NFC').trim();

export const normalizeStorePhone = (value: string) => value.trim();

export const isValidStoreName = (value: unknown) => {
  if (typeof value !== 'string') return false;

  const normalizedName = normalizeStoreName(value);
  return (
    normalizedName.length >= 2 &&
    !storeNameBlockedCharacterPattern.test(normalizedName) &&
    storeNamePattern.test(normalizedName) &&
    storeNameContentPattern.test(normalizedName)
  );
};

export const isValidVietnamStorePhone = (value: unknown) => {
  if (typeof value !== 'string') return false;

  const normalizedPhone = normalizeStorePhone(value);
  if (!normalizedPhone) return true;
  if (!storePhoneCharacterPattern.test(normalizedPhone)) return false;

  const compactPhone = normalizedPhone.replace(/[\s().-]/g, '');
  if (!compactPhone.startsWith('0') && !compactPhone.startsWith('+84')) {
    return false;
  }

  const nationalPhone = compactPhone.startsWith('+84')
    ? `0${compactPhone.slice(3)}`
    : compactPhone;

  return (
    vietnamMobilePattern.test(nationalPhone) ||
    vietnamLandlinePattern.test(nationalPhone)
  );
};

export function IsStoreName(validationOptions?: ValidationOptions) {
  return (object: object, propertyName: string) => {
    registerDecorator({
      name: 'isStoreName',
      target: object.constructor,
      propertyName,
      options: validationOptions,
      validator: {
        validate: isValidStoreName,
        defaultMessage() {
          return "Tên quán phải có ít nhất 2 ký tự và chỉ gồm chữ cái, chữ số, khoảng trắng, &, ', -, ., ,.";
        },
      },
    });
  };
}

export function IsVietnamStorePhone(validationOptions?: ValidationOptions) {
  return (object: object, propertyName: string) => {
    registerDecorator({
      name: 'isVietnamStorePhone',
      target: object.constructor,
      propertyName,
      options: validationOptions,
      validator: {
        validate: isValidVietnamStorePhone,
        defaultMessage() {
          return 'Số điện thoại Việt Nam không hợp lệ. Dùng số di động 10 số hoặc số bàn 11 số, bắt đầu bằng 0 hoặc +84.';
        },
      },
    });
  };
}
