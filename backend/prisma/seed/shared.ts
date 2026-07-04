import { createHash, createHmac } from 'crypto';
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

export type SeedProfile = 'demo' | 'full';

export type SeedOptions = {
  profile: SeedProfile;
  now: Date;
};

export function resolveSeedProfile(
  argv: string[] = process.argv.slice(2),
  envValue = process.env.SEED_PROFILE,
): SeedProfile {
  const argument = argv.find((value) => value.startsWith('--profile='));
  const requested = argument?.split('=')[1] ?? envValue ?? 'demo';

  if (requested !== 'demo' && requested !== 'full') {
    throw new Error(
      `Unsupported seed profile "${requested}". Expected "demo" or "full".`,
    );
  }

  return requested;
}

export function seedUuid(key: string): string {
  const hex = createHash('sha256')
    .update(`nightlife-vn-seed:${key}`)
    .digest('hex');

  return [
    hex.slice(0, 8),
    hex.slice(8, 12),
    `4${hex.slice(13, 16)}`,
    `8${hex.slice(17, 20)}`,
    hex.slice(20, 32),
  ].join('-');
}

export function seedDate(
  now: Date,
  dayOffset: number,
  hour = 20,
  minute = 0,
): Date {
  const value = new Date(now);
  value.setHours(hour, minute, 0, 0);
  value.setDate(value.getDate() + dayOffset);
  return value;
}

export function seedHash(value: string): string {
  return createHash('sha256').update(value).digest('hex');
}

export function materializeSeedUpload(
  storageKey: string,
  contents: Buffer | string,
) {
  if (
    !storageKey ||
    storageKey.includes('/') ||
    storageKey.includes('\\') ||
    storageKey.includes('..')
  ) {
    throw new Error(`Seed storage key must be a flat filename: ${storageKey}`);
  }

  const uploadDir = join(
    process.cwd(),
    process.env.STORAGE_LOCAL_DIR ?? 'uploads',
  );
  mkdirSync(uploadDir, { recursive: true });
  writeFileSync(join(uploadDir, storageKey), contents);
}

export function seedStorageUrl(
  access: 'PUBLIC' | 'PROTECTED',
  storageKey: string,
) {
  const publicBase =
    process.env.PUBLIC_BASE_URL ??
    `http://localhost:${process.env.PORT ?? '3001'}`;
  return `${publicBase.replace(/\/$/, '')}/storage/${
    access === 'PUBLIC' ? 'public' : 'files'
  }/${storageKey}`;
}

export function buildSeedCouponQr(issueId: string, now: Date, key: string) {
  const secret =
    process.env.COUPON_QR_SECRET ??
    process.env.JWT_SECRET ??
    'nightlife-dev-coupon-qr-secret';
  const encodedPayload = Buffer.from(
    JSON.stringify({
      v: 1,
      type: 'coupon_issue',
      issueId,
      nonce: `seed-${key}`,
      iat: now.getTime(),
    }),
  ).toString('base64url');
  const signature = createHmac('sha256', secret)
    .update(encodedPayload)
    .digest('base64url');
  const token = `${encodedPayload}.${signature}`;
  const baseUrl =
    process.env.COUPON_QR_PARTNER_URL ??
    `${(process.env.NEXT_PUBLIC_APP_URL ?? 'https://nightlife.vn').replace(/\/$/, '')}/partner`;
  const payload = new URL(baseUrl);
  payload.searchParams.set('scanToken', token);

  return {
    payload: payload.toString(),
    payloadHash: seedHash(payload.toString()),
    tokenHash: seedHash(token),
  };
}
