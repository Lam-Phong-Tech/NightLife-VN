export const emailValidationLimits = {
  maxEmailLength: 254,
  maxEmailLocalLength: 64,
  maxEmailDomainLength: 253,
} as const;

const emailLocalPartPattern = /^[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*$/i;
const emailDomainLabelPattern = /^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/i;
const emailTopLevelDomainPattern = /^[a-z]{2,63}$/i;

export const normalizeEmailAddress = (value: string) => value.trim().toLowerCase();

export function validateEmailAddress(value: string) {
  const normalized = normalizeEmailAddress(value);

  if (!normalized) {
    return "Vui lòng nhập email.";
  }

  if (normalized.length > emailValidationLimits.maxEmailLength) {
    return `Email không được vượt quá ${emailValidationLimits.maxEmailLength} ký tự.`;
  }

  if (/[\s<>()[\]\\,;:"]/.test(normalized)) {
    return "Email chưa đúng định dạng.";
  }

  const atParts = normalized.split("@");
  if (atParts.length !== 2) {
    return "Email chưa đúng định dạng.";
  }

  const [localPart, domainPart] = atParts;

  if (
    !localPart ||
    localPart.length > emailValidationLimits.maxEmailLocalLength ||
    !emailLocalPartPattern.test(localPart)
  ) {
    return "Email chưa đúng định dạng.";
  }

  if (!domainPart || domainPart.length > emailValidationLimits.maxEmailDomainLength) {
    return "Email chưa đúng định dạng.";
  }

  const domainLabels = domainPart.split(".");
  const topLevelDomain = domainLabels.at(-1) ?? "";

  if (
    domainLabels.length < 2 ||
    domainLabels.some(
      (label) => !label || label.length > 63 || !emailDomainLabelPattern.test(label),
    ) ||
    !emailTopLevelDomainPattern.test(topLevelDomain)
  ) {
    return "Email chưa đúng định dạng.";
  }

  return "";
}
