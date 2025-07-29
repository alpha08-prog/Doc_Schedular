import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isAuth = request.cookies.get('auth')?.value === 'true';

  // Allow access to login and otp pages without authentication
  if (pathname.startsWith('/login') || pathname.startsWith('/otp')) {
    if (isAuth && pathname.startsWith('/login')) {
      // If already logged in, redirect from login to home
      return NextResponse.redirect(new URL('/', request.url));
    }
    return NextResponse.next();
  }

  // Redirect all other pages to login if not authenticated
  if (!isAuth) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],
};