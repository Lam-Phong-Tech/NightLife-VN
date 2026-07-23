import {
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { createHash } from 'node:crypto';
import type { Request, Response } from 'express';
import {
  AUTH_RATE_LIMIT_POLICY,
  type AuthRateLimitPolicy,
} from './auth-rate-limit.decorator';

type RateLimitBucket = {
  count: number;
  resetAt: number;
};

type RateLimitResult = {
  exceeded: boolean;
  limit: number;
  remaining: number;
  resetAt: number;
};

const MAX_BUCKETS = 50_000;
const SWEEP_INTERVAL_MS = 60_000;

@Injectable()
export class AuthRateLimitGuard implements CanActivate {
  private readonly buckets = new Map<string, RateLimitBucket>();
  private lastSweepAt = 0;

  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const policy = this.reflector.getAllAndOverride<AuthRateLimitPolicy>(
      AUTH_RATE_LIMIT_POLICY,
      [context.getHandler(), context.getClass()],
    );

    if (!policy) {
      return true;
    }

    const http = context.switchToHttp();
    const request = http.getRequest<Request>();
    const response = http.getResponse<Response>();
    const now = Date.now();
    this.sweepExpiredBuckets(now);

    const ipResult = this.consume(
      `${policy.scope}:ip:${this.clientIp(request)}`,
      policy.limit,
      policy.windowMs,
      now,
    );
    this.writeHeaders(response, ipResult, policy.windowMs, now);

    if (ipResult.exceeded) {
      this.reject(response, ipResult, now);
    }

    const identity = this.requestIdentity(request);
    if (identity && policy.identityLimit) {
      const identityResult = this.consume(
        `${policy.scope}:identity:${identity}`,
        policy.identityLimit,
        policy.windowMs,
        now,
      );

      if (identityResult.remaining < ipResult.remaining) {
        this.writeHeaders(response, identityResult, policy.windowMs, now);
      }

      if (identityResult.exceeded) {
        this.reject(response, identityResult, now);
      }
    }

    return true;
  }

  private consume(
    key: string,
    limit: number,
    windowMs: number,
    now: number,
  ): RateLimitResult {
    let bucket = this.buckets.get(key);

    if (!bucket || bucket.resetAt <= now) {
      this.ensureCapacity(now);
      bucket = {
        count: 0,
        resetAt: now + windowMs,
      };
      this.buckets.set(key, bucket);
    }

    bucket.count += 1;

    return {
      exceeded: bucket.count > limit,
      limit,
      remaining: Math.max(0, limit - bucket.count),
      resetAt: bucket.resetAt,
    };
  }

  private requestIdentity(request: Request) {
    const body = request.body as Record<string, unknown> | undefined;
    const email = body?.email;

    if (typeof email !== 'string' || !email.trim()) {
      return null;
    }

    return createHash('sha256')
      .update(email.trim().toLowerCase())
      .digest('hex');
  }

  private clientIp(request: Request) {
    const ip =
      request.ip ||
      request.socket?.remoteAddress ||
      request.connection?.remoteAddress ||
      'unknown';

    return ip.replace(/^::ffff:/, '');
  }

  private writeHeaders(
    response: Response,
    result: RateLimitResult,
    windowMs: number,
    now: number,
  ) {
    response.setHeader('RateLimit-Limit', String(result.limit));
    response.setHeader('RateLimit-Remaining', String(result.remaining));
    response.setHeader(
      'RateLimit-Reset',
      String(Math.max(1, Math.ceil((result.resetAt - now) / 1000))),
    );
    response.setHeader(
      'RateLimit-Policy',
      `${result.limit};w=${Math.ceil(windowMs / 1000)}`,
    );
  }

  private reject(
    response: Response,
    result: RateLimitResult,
    now: number,
  ): never {
    const retryAfterSeconds = Math.max(
      1,
      Math.ceil((result.resetAt - now) / 1000),
    );
    response.setHeader('Retry-After', String(retryAfterSeconds));

    throw new HttpException(
      {
        statusCode: HttpStatus.TOO_MANY_REQUESTS,
        message: 'Quá nhiều yêu cầu. Vui lòng thử lại sau.',
        retryAfterSeconds,
      },
      HttpStatus.TOO_MANY_REQUESTS,
    );
  }

  private sweepExpiredBuckets(now: number) {
    if (
      now - this.lastSweepAt < SWEEP_INTERVAL_MS &&
      this.buckets.size < MAX_BUCKETS
    ) {
      return;
    }

    for (const [key, bucket] of this.buckets) {
      if (bucket.resetAt <= now) {
        this.buckets.delete(key);
      }
    }
    this.lastSweepAt = now;
  }

  private ensureCapacity(now: number) {
    if (this.buckets.size < MAX_BUCKETS) {
      return;
    }

    this.sweepExpiredBuckets(now);
    if (this.buckets.size < MAX_BUCKETS) {
      return;
    }

    const oldestKey = this.buckets.keys().next().value as string | undefined;
    if (oldestKey) {
      this.buckets.delete(oldestKey);
    }
  }
}
