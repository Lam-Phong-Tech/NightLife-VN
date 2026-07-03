import { validateEnv } from './env.validation';

describe('validateEnv', () => {
  it('requires a dedicated coupon QR secret in production', () => {
    expect(() =>
      validateEnv({
        NODE_ENV: 'production',
        COUPON_QR_PARTNER_URL: 'https://nightlife.vn/partner',
      }),
    ).toThrow('COUPON_QR_SECRET is required in production');
  });

  it('rejects the dev coupon QR secret in production', () => {
    expect(() =>
      validateEnv({
        NODE_ENV: 'production',
        COUPON_QR_SECRET: 'nightlife-dev-coupon-qr-secret',
        COUPON_QR_PARTNER_URL: 'https://nightlife.vn/partner',
      }),
    ).toThrow('COUPON_QR_SECRET must not use the dev fallback');
  });

  it('requires a production partner QR URL', () => {
    expect(() =>
      validateEnv({
        NODE_ENV: 'production',
        COUPON_QR_SECRET: '0123456789abcdef0123456789abcdef',
      }),
    ).toThrow('COUPON_QR_PARTNER_URL is required in production');
  });

  it('requires https for the production partner QR URL', () => {
    expect(() =>
      validateEnv({
        NODE_ENV: 'production',
        COUPON_QR_SECRET: '0123456789abcdef0123456789abcdef',
        COUPON_QR_PARTNER_URL: 'http://nightlife.vn/partner',
      }),
    ).toThrow('COUPON_QR_PARTNER_URL must use https in production');
  });

  it('allows local development to use fallback coupon QR settings', () => {
    expect(
      validateEnv({
        NODE_ENV: 'test',
        COUPON_QR_PARTNER_URL: 'http://localhost:3000/partner',
      }),
    ).toEqual(
      expect.objectContaining({
        NODE_ENV: 'test',
      }),
    );
  });
});
