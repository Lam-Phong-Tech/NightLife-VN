import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

type JwtPayload = {
  role?: unknown;
  exp?: unknown;
};

const loginPaths = new Set(['/dang-nhap', '/dang-nhap-doi-tac', '/admin/dang-nhap']);
const portalSessions = [
  {
    prefix: 'admin_',
    roles: ['ADMIN', 'SUPER_ADMIN'],
    homePath: '/admin',
  },
  {
    prefix: 'partner_',
    roles: ['PARTNER'],
    homePath: '/partner',
  },
  {
    prefix: '',
    roles: ['USER'],
    homePath: '/tai-khoan',
  },
] as const;

/**
 * Dummy function to parse JWT payload without external dependencies in Edge Runtime.
 * In a real app, use `jose` to verify the signature as well.
 */
function parseJwtPayload(token: string): JwtPayload | null {
  try {
    const base64Url = token.split('.')[1];
    if (!base64Url) return null;
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload) as JwtPayload;
  } catch {
    return null;
  }
}

function getSessionRole(request: NextRequest, token: string, prefix: string) {
  const payload = parseJwtPayload(token);
  if (
    typeof payload?.exp === 'number' &&
    payload.exp <= Math.floor(Date.now() / 1000)
  ) {
    return null;
  }

  if (payload?.role) {
    return String(payload.role).toUpperCase();
  }

  // Fallback for local demo sessions whose token is not a signed JWT.
  return (request.cookies.get(`${prefix}user_role`)?.value || 'PUBLIC').toUpperCase();
}

function getAuthenticatedHomePath(request: NextRequest) {
  for (const session of portalSessions) {
    const token = request.cookies.get(`${session.prefix}auth_token`)?.value;
    if (!token) continue;

    const role = getSessionRole(request, token, session.prefix);
    if (role && session.roles.some((allowedRole) => allowedRole === role)) {
      return session.homePath;
    }
  }

  return null;
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const memberPaths = ['/tai-khoan', '/bao-mat-tai-khoan', '/da-luu', '/gui-hoa-don', '/vi-uu-dai'];
  const isMemberPath = memberPaths.some(p => pathname.startsWith(p));
  const isPartnerPath = pathname.startsWith('/partner');
  const isAdminLoginPath = pathname === '/admin/dang-nhap';
  const isAdminPath = pathname.startsWith('/admin') && !isAdminLoginPath;

  if (loginPaths.has(pathname)) {
    const authenticatedHomePath = getAuthenticatedHomePath(request);
    if (authenticatedHomePath) {
      return NextResponse.redirect(new URL(authenticatedHomePath, request.url));
    }
  }

  const prefix = pathname.startsWith('/admin') ? 'admin_' : pathname.startsWith('/partner') ? 'partner_' : '';
  
  // Extract token from standard authorization or cookie
  const authHeader = request.headers.get('authorization');
  const token = authHeader?.startsWith('Bearer ') 
    ? authHeader.substring(7) 
    : request.cookies.get(`${prefix}auth_token`)?.value;

  const userRole = token ? getSessionRole(request, token, prefix) : null;

  // Protect paths requiring authentication
  if ((isMemberPath || isPartnerPath || isAdminPath) && (!token || !userRole)) {
    const loginUrl = new URL(isPartnerPath ? '/dang-nhap-doi-tac' : isAdminPath ? '/admin/dang-nhap' : '/dang-nhap', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Protect admin routes
  if (isAdminPath && userRole !== 'ADMIN' && userRole !== 'SUPER_ADMIN') {
    return NextResponse.redirect(new URL('/', request.url));
  }

  // Protect partner routes
  if (isPartnerPath && userRole !== 'PARTNER' && userRole !== 'ADMIN' && userRole !== 'SUPER_ADMIN') {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - SVG, icons (public assets)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|SVG|icons).*)',
  ],
};
