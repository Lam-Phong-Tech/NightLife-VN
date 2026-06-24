import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // For demonstration, extracting token from standard authorization or cookie
  const token = request.cookies.get('auth_token')?.value;
  const userRole = request.cookies.get('user_role')?.value || 'public';

  // Define protected paths
  const memberPaths = ['/tai-khoan', '/da-luu', '/lich-su-dat-cho', '/dat-cho', '/gui-hoa-don', '/vi-uu-dai'];
  const isMemberPath = memberPaths.some(p => pathname.startsWith(p));
  const isPartnerPath = pathname.startsWith('/partner');
  const isAdminPath = pathname.startsWith('/admin');

  // Protect paths requiring authentication
  if ((isMemberPath || isPartnerPath || isAdminPath) && !token) {
    const loginUrl = new URL('/dang-nhap', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Protect admin routes
  if (isAdminPath && userRole !== 'admin') {
    return NextResponse.redirect(new URL('/', request.url));
  }

  // Protect partner routes
  if (isPartnerPath && userRole !== 'partner' && userRole !== 'admin') {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
