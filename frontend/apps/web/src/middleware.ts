import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Example dummy auth check
  const isAuthenticated = request.cookies.has('auth_token');
  const userRole = request.cookies.get('user_role')?.value || 'public';

  // Protect (member) routes implicitly by checking path segments if needed
  // Or match against a predefined list of protected paths
  const memberPaths = ['/tai-khoan', '/da-luu', '/lich-su-dat-cho', '/dat-cho'];
  if (memberPaths.some(p => pathname.startsWith(p)) && !isAuthenticated) {
    return NextResponse.redirect(new URL('/dang-nhap', request.url));
  }

  // Protect (admin) routes
  if (pathname.startsWith('/admin') && userRole !== 'admin') {
    return NextResponse.redirect(new URL('/dang-nhap', request.url));
  }

  // Protect (partner) routes
  if (pathname.startsWith('/partner') && userRole !== 'partner' && userRole !== 'admin') {
    return NextResponse.redirect(new URL('/dang-nhap', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
