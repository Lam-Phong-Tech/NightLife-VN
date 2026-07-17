export const emailValidationLimits = {
  maxEmailLength: 254,
  maxEmailLocalLength: 64,
  maxEmailDomainLength: 253,
} as const;

const emailLocalPartPattern = /^[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*$/i;
const emailDomainLabelPattern = /^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/i;
const emailTopLevelDomainPattern = /^[a-z]{2,63}$/i;
const invalidEmailFormatMessage = "Email chưa đúng định dạng.";
const invalidEmailDomainMessage = "Phần sau dấu @ phải là tên miền hợp lệ, ví dụ gmail.com.";
const emailLocalPartTooLongMessage = `Phần trước dấu @ không được vượt quá ${emailValidationLimits.maxEmailLocalLength} ký tự.`;
const emailDomainTooLongMessage = `Phần sau dấu @ không được vượt quá ${emailValidationLimits.maxEmailDomainLength} ký tự.`;
const emailDomainLabelTooLongMessage =
  "Mỗi phần của tên miền sau dấu @ không được vượt quá 63 ký tự.";
const commonEmailDomainTypoLabels = new Set([
  "gmai",
  "gmeo",
  "gmial",
  "gamil",
  "gnail",
  "gmal",
  "gmali",
  "gmaiil",
]);
const commonEmailDomainTypos = new Set([
  "gmail.cm",
  "gmail.cmo",
  "gmail.con",
  "gmail.coom",
  "gmail.om",
  "gmail.comm",
]);

export const normalizeEmailAddress = (value: string) => value.trim().toLowerCase();

const hasCommonEmailDomainTypo = (domainPart: string, domainLabels: string[]) => {
  const rootDomainLabel = domainLabels[0] ?? "";

  return commonEmailDomainTypoLabels.has(rootDomainLabel) || commonEmailDomainTypos.has(domainPart);
};

export function validateEmailAddress(value: string) {
  const normalized = normalizeEmailAddress(value);

  if (!normalized) {
    return "Vui lòng nhập email.";
  }

  if (normalized.length > emailValidationLimits.maxEmailLength) {
    return `Email không được vượt quá ${emailValidationLimits.maxEmailLength} ký tự.`;
  }

  if (/[\s<>()[\]\\,;:"]/.test(normalized)) {
    return invalidEmailFormatMessage;
  }

  const atParts = normalized.split("@");
  if (atParts.length !== 2) {
    return invalidEmailFormatMessage;
  }

  const [localPart, domainPart] = atParts;

  if (!localPart) {
    return invalidEmailFormatMessage;
  }

  if (localPart.length > emailValidationLimits.maxEmailLocalLength) {
    return emailLocalPartTooLongMessage;
  }

  if (!emailLocalPartPattern.test(localPart)) {
    return invalidEmailFormatMessage;
  }

  if (!domainPart) {
    return invalidEmailFormatMessage;
  }

  if (domainPart.length > emailValidationLimits.maxEmailDomainLength) {
    return emailDomainTooLongMessage;
  }

  const domainLabels = domainPart.split(".");
  const topLevelDomain = domainLabels.at(-1) ?? "";
  const hasTooLongDomainLabel = domainLabels.some((label) => label.length > 63);

  if (hasTooLongDomainLabel) {
    return emailDomainLabelTooLongMessage;
  }

  if (
    domainLabels.length < 2 ||
    domainLabels.some(
      (label) => !label || label.length > 63 || !emailDomainLabelPattern.test(label),
    ) ||
    !emailTopLevelDomainPattern.test(topLevelDomain)
  ) {
    return invalidEmailDomainMessage;
  }

  if (hasCommonEmailDomainTypo(domainPart, domainLabels)) {
    return invalidEmailFormatMessage;
  }

  return "";
}
