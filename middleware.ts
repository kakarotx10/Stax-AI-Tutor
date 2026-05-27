import { NextResponse, type NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

const PROTECTED_PAGE_PREFIXES = [
  '/dashboard',
  '/profile',
  '/subject',
  '/contests',
  '/duels',
  '/standoffs',
  '/marathons',
  '/interviews',
  '/stax-interview',
];

const AUTH_PAGES = ['/login', '/signup'];
const PUBLIC_API_PREFIXES = ['/api/auth'];

function matchesPathPrefix(pathname: string, prefix: string) {
  return pathname === prefix || pathname.startsWith(`${prefix}/`);
}

function matchesAnyPathPrefix(pathname: string, prefixes: string[]) {
  return prefixes.some((prefix) => matchesPathPrefix(pathname, prefix));
}

export async function middleware(req: NextRequest) {
  const { pathname, search } = req.nextUrl;
  const isApiRoute = pathname.startsWith('/api/');
  const isAuthPage = matchesAnyPathPrefix(pathname, AUTH_PAGES);
  const isPublicApiRoute = matchesAnyPathPrefix(pathname, PUBLIC_API_PREFIXES);
  const isProtectedPage = matchesAnyPathPrefix(pathname, PROTECTED_PAGE_PREFIXES);
  const isProtectedApiRoute = isApiRoute && !isPublicApiRoute;
  const requiresAuth = isProtectedPage || isProtectedApiRoute;

  const token =
    isAuthPage || requiresAuth
      ? await getToken({
          req,
          secret: process.env.NEXTAUTH_SECRET,
        })
      : null;

  if (isAuthPage && token) {
    return NextResponse.redirect(new URL('/dashboard', req.url));
  }

  if (requiresAuth && !token) {
    if (isApiRoute) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const loginUrl = new URL('/login', req.url);
    loginUrl.searchParams.set('callbackUrl', `${pathname}${search}`);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|images|.*\\.).*)',
    '/api/:path*',
  ],
};
