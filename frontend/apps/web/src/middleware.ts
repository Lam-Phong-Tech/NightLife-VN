import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Dummy function to parse JWT payload without external dependencies in Edge Runtime.
 * In a real app, use `jose` to verify the signature as well.
 */
function parseJwtPayload(token: string) {
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
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Extract token from standard authorization or cookie
  const authHeader = request.headers.get('authorization');
  const token = authHeader?.startsWith('Bearer ') 
    ? authHeader.substring(7) 
    : request.cookies.get('auth_token')?.value;

  let userRole = 'PUBLIC';
  
  if (token) {
    const payload = parseJwtPayload(token);
    if (payload && payload.role) {
      userRole = String(payload.role).toUpperCase();
    } else {
      // Fallback to cookie for development if token is not a valid JWT
      userRole = (request.cookies.get('user_role')?.value || 'PUBLIC').toUpperCase();
    }
  }

  // Define protected paths
  const memberPaths = ['/tai-khoan', '/bao-mat-tai-khoan', '/da-luu', '/gui-hoa-don', '/vi-uu-dai'];
  const isMemberPath = memberPaths.some(p => pathname.startsWith(p));
  const isPartnerPath = pathname.startsWith('/partner');
  const isAdminLoginPath = pathname === '/admin/dang-nhap';
  const isAdminPath = pathname.startsWith('/admin') && !isAdminLoginPath;

  // Protect paths requiring authentication
  if ((isMemberPath || isPartnerPath || isAdminPath) && !token) {
    const loginUrl = new URL(isPartnerPath ? '/dang-nhap-doi-tac' : isAdminPath ? '/admin/dang-nhap' : '/dang-nhap', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Protect admin routes
  if (isAdminPath && userRole !== 'ADMIN') {
    return NextResponse.redirect(new URL('/', request.url));
  }

  // Protect partner routes
  if (isPartnerPath && userRole !== 'PARTNER' && userRole !== 'ADMIN') {
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
