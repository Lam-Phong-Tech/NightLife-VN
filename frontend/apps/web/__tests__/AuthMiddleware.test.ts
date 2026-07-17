import { NextRequest } from 'next/server';
import { describe, expect, it } from 'vitest';

import { middleware } from '@/middleware';

const createToken = (role: string, expiresAt = Math.floor(Date.now() / 1000) + 3600) => {
  const encode = (value: object) =>
    btoa(JSON.stringify(value))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');

  return `${encode({ alg: 'none', typ: 'JWT' })}.${encode({
    role,
    exp: expiresAt,
  })}.test`;
};

const runMiddleware = (pathname: string, cookies: Record<string, string> = {}) => {
  const cookieHeader = Object.entries(cookies)
    .map(([name, value]) => `${name}=${value}`)
    .join('; ');
  const request = new NextRequest(`https://nightlife.test${pathname}`, {
    headers: cookieHeader ? { cookie: cookieHeader } : undefined,
  });

  return middleware(request);
};

describe('auth middleware login-page redirects', () => {
  it.each(['/admin/dang-nhap', '/dang-nhap-doi-tac', '/dang-nhap'])(
    'redirects an authenticated admin away from %s',
    (pathname) => {
      const response = runMiddleware(pathname, {
        admin_auth_token: createToken('SUPER_ADMIN'),
      });

      expect(response.headers.get('location')).toBe('https://nightlife.test/admin');
    },
  );

  it('redirects an authenticated partner to the partner portal', () => {
    const response = runMiddleware('/dang-nhap-doi-tac', {
      partner_auth_token: createToken('PARTNER'),
    });

    expect(response.headers.get('location')).toBe('https://nightlife.test/partner');
  });

  it('redirects an authenticated member to the member account page', () => {
    const response = runMiddleware('/dang-nhap', {
      auth_token: createToken('USER'),
    });

    expect(response.headers.get('location')).toBe('https://nightlife.test/tai-khoan');
  });

  it('allows the login page when the stored token has expired', () => {
    const response = runMiddleware('/admin/dang-nhap', {
      admin_auth_token: createToken('ADMIN', Math.floor(Date.now() / 1000) - 60),
    });

    expect(response.headers.get('location')).toBeNull();
    expect(response.headers.get('x-middleware-next')).toBe('1');
  });

  it('allows the login page when the browser profile has no session', () => {
    const response = runMiddleware('/dang-nhap');

    expect(response.headers.get('location')).toBeNull();
    expect(response.headers.get('x-middleware-next')).toBe('1');
  });
});
