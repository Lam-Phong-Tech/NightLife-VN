import { ExecutionContext, HttpException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { Request, Response } from 'express';
import { AuthRateLimit } from './auth-rate-limit.decorator';
import { AuthRateLimitGuard } from './auth-rate-limit.guard';

@AuthRateLimit({
  scope: 'auth-test',
  limit: 2,
  windowMs: 60_000,
})
class RateLimitedController {
  list() {
    return true;
  }

  @AuthRateLimit({
    scope: 'login-test',
    limit: 10,
    identityLimit: 2,
    windowMs: 60_000,
  })
  login() {
    return true;
  }
}

describe('AuthRateLimitGuard', () => {
  const headers = new Map<string, string>();
  const response = {
    setHeader: jest.fn((name: string, value: string) => {
      headers.set(name, value);
    }),
  } as unknown as Response;

  beforeEach(() => {
    headers.clear();
    jest.clearAllMocks();
  });

  it('limits every endpoint covered by the controller policy', () => {
    const guard = new AuthRateLimitGuard(new Reflector());
    const request = createRequest('203.0.113.10');
    const context = createContext('list', request, response);

    expect(guard.canActivate(context)).toBe(true);
    expect(guard.canActivate(context)).toBe(true);
    expect(() => guard.canActivate(context)).toThrow(HttpException);
    expect(headers.get('Retry-After')).toBe('60');
  });

  it('applies the stricter per-email limit to login attempts', () => {
    const guard = new AuthRateLimitGuard(new Reflector());
    const request = createRequest('203.0.113.11', 'Member@Nightlife.vn');
    const context = createContext('login', request, response);

    expect(guard.canActivate(context)).toBe(true);
    expect(guard.canActivate(context)).toBe(true);
    expect(() => guard.canActivate(context)).toThrow(HttpException);
    expect(headers.get('RateLimit-Limit')).toBe('2');
    expect(headers.get('RateLimit-Remaining')).toBe('0');
  });

  it('keeps account buckets separate while sharing the IP bucket', () => {
    const guard = new AuthRateLimitGuard(new Reflector());
    const firstAccount = createContext(
      'login',
      createRequest('203.0.113.12', 'one@example.com'),
      response,
    );
    const secondAccount = createContext(
      'login',
      createRequest('203.0.113.12', 'two@example.com'),
      response,
    );

    expect(guard.canActivate(firstAccount)).toBe(true);
    expect(guard.canActivate(firstAccount)).toBe(true);
    expect(guard.canActivate(secondAccount)).toBe(true);
  });
});

function createRequest(ip: string, email?: string) {
  return {
    ip,
    body: email ? { email } : {},
    socket: {},
    connection: {},
  } as Request;
}

function createContext(
  method: keyof RateLimitedController,
  request: Request,
  response: Response,
) {
  return {
    getClass: () => RateLimitedController,
    getHandler: () => RateLimitedController.prototype[method],
    switchToHttp: () => ({
      getRequest: () => request,
      getResponse: () => response,
    }),
  } as unknown as ExecutionContext;
}
