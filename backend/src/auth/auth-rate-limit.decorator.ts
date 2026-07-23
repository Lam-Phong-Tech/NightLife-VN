import { SetMetadata } from '@nestjs/common';

export const AUTH_RATE_LIMIT_POLICY = 'auth-rate-limit-policy';

export type AuthRateLimitPolicy = {
  scope: string;
  limit: number;
  windowMs: number;
  identityLimit?: number;
};

export const AuthRateLimit = (policy: AuthRateLimitPolicy) =>
  SetMetadata(AUTH_RATE_LIMIT_POLICY, policy);
