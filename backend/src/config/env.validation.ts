const DEV_COUPON_QR_SECRET = 'nightlife-dev-coupon-qr-secret';
const MIN_PRODUCTION_SECRET_LENGTH = 32;

export function validateEnv(
  config: Record<string, unknown>,
): Record<string, unknown> {
  const nodeEnv = String(config.NODE_ENV ?? '').trim();
  const couponQrSecret = stringValue(config.COUPON_QR_SECRET);
  const couponQrPartnerUrl = stringValue(config.COUPON_QR_PARTNER_URL);

  if (couponQrPartnerUrl) {
    assertValidUrl(couponQrPartnerUrl, 'COUPON_QR_PARTNER_URL');
  }

  if (nodeEnv !== 'production') {
    return config;
  }

  if (!couponQrSecret) {
    throw new Error('COUPON_QR_SECRET is required in production');
  }

  if (couponQrSecret === DEV_COUPON_QR_SECRET) {
    throw new Error('COUPON_QR_SECRET must not use the dev fallback');
  }

  if (couponQrSecret.length < MIN_PRODUCTION_SECRET_LENGTH) {
    throw new Error(
      `COUPON_QR_SECRET must be at least ${MIN_PRODUCTION_SECRET_LENGTH} characters in production`,
    );
  }

  if (!couponQrPartnerUrl) {
    throw new Error('COUPON_QR_PARTNER_URL is required in production');
  }

  assertHttpsUrl(couponQrPartnerUrl, 'COUPON_QR_PARTNER_URL');

  return config;
}

function stringValue(value: unknown) {
  return typeof value === 'string' ? value.trim() : '';
}

function assertValidUrl(value: string, key: string) {
  try {
    new URL(value);
  } catch {
    throw new Error(`${key} must be a valid absolute URL`);
  }
}

function assertHttpsUrl(value: string, key: string) {
  const url = new URL(value);
  if (url.protocol !== 'https:') {
    throw new Error(`${key} must use https in production`);
  }
}
