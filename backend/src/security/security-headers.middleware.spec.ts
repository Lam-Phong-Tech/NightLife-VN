import type { NextFunction, Request, Response } from 'express';
import { createSecurityHeadersMiddleware } from './security-headers.middleware';

describe('security headers middleware', () => {
  it('sets strict API headers and HSTS in production', () => {
    const headers = new Map<string, string>();
    const next = jest.fn() as NextFunction;
    const middleware = createSecurityHeadersMiddleware(true);

    middleware(
      { path: '/auth/login' } as Request,
      createResponse(headers),
      next,
    );

    expect(headers.get('Content-Security-Policy')).toContain(
      "default-src 'none'",
    );
    expect(headers.get('Strict-Transport-Security')).toBe(
      'max-age=31536000; includeSubDomains; preload',
    );
    expect(headers.get('X-Frame-Options')).toBe('DENY');
    expect(headers.get('X-Content-Type-Options')).toBe('nosniff');
    expect(next).toHaveBeenCalledTimes(1);
  });

  it('allows Swagger assets without allowing framing', () => {
    const headers = new Map<string, string>();
    const middleware = createSecurityHeadersMiddleware(false);

    middleware(
      { path: '/api/documentation' } as Request,
      createResponse(headers),
      jest.fn(),
    );

    expect(headers.get('Content-Security-Policy')).toContain(
      "script-src 'self' 'unsafe-inline'",
    );
    expect(headers.get('Content-Security-Policy')).toContain(
      "frame-ancestors 'none'",
    );
    expect(headers.has('Strict-Transport-Security')).toBe(false);
  });
});

function createResponse(headers: Map<string, string>) {
  return {
    setHeader: jest.fn((name: string, value: string) => {
      headers.set(name, value);
    }),
  } as unknown as Response;
}
