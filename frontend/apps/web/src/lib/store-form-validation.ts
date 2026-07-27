const storePhoneCharacterPattern = /^[0-9+\-\s().]+$/;
const vietnamMobilePattern = /^0(?:3[2-9]|5[25689]|7[06-9]|8[1-689]|9\d)\d{7}$/;
const vietnamLandlinePattern = /^02\d{9}$/;

export const normalizeStoreName = (value: string) => value.normalize('NFC').trim();

export const normalizeStorePhone = (value: string) => value.trim();

export const validateStoreName = (value: string): string => {
  const normalizedName = normalizeStoreName(value);

  if (!normalizedName) {
    return 'Vui lòng nhập tên quán.';
  }

  return '';
};

export const validateVietnamStorePhone = (value: string): string => {
  const normalizedPhone = normalizeStorePhone(value);
  if (!normalizedPhone) return '';

  if (!storePhoneCharacterPattern.test(normalizedPhone)) {
    return 'Số điện thoại chỉ được gồm số, dấu +, khoảng trắng, dấu chấm, gạch ngang hoặc ngoặc đơn.';
  }

  const compactPhone = normalizedPhone.replace(/[\s().-]/g, '');
  if (!compactPhone.startsWith('0') && !compactPhone.startsWith('+84')) {
    return 'Số điện thoại Việt Nam phải bắt đầu bằng 0 hoặc +84.';
  }

  const nationalPhone = compactPhone.startsWith('+84')
    ? `0${compactPhone.slice(3)}`
    : compactPhone;

  if (
    !vietnamMobilePattern.test(nationalPhone) &&
    !vietnamLandlinePattern.test(nationalPhone)
  ) {
    return 'Số điện thoại Việt Nam không hợp lệ. Dùng số di động 10 số hoặc số bàn 11 số.';
  }

  return '';
};
