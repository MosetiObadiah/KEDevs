import { type NextRequest, NextResponse } from 'next/server';


const PUBLIC_PATHS = [
  '/',
  '/login',
  '/register',
  '/verify-email',
  '/reset-password',
  '/forgot-password',
];

// Routes that require ADMIN role
const ADMIN_PATHS = ['/admin'];

// Routes that require authentication (protected)
const PROTECTED_PREFIXES = [
  '/dashboard',
  '/jobs',
  '/developers',
  '/employers',
  '/profile',
  '/payments',
  '/notifications',
  '/admin',
];

function isPublicPath(pathname: string): boolean {
  return PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}

function isProtectedPath(pathname: string): boolean {
  return PROTECTED_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}

function isAdminPath(pathname: string): boolean {
  return ADMIN_PATHS.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}

// Minimal JWT decode — reads role from payload without verification
// (middleware cannot do full verification; trust the API's 401 responses)
function getRoleFromToken(token: string): string | null {
  try {
    const [, payload] = token.split('.');
    const decoded = JSON.parse(Buffer.from(payload, 'base64url').toString('utf-8'));
    return (decoded.role as string) ?? null;
  } catch {
    return null;
  }
}

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Skip Next.js internals and static files
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api/') ||
    pathname.includes('.') // static files
  ) {
    return NextResponse.next();
  }

  const accessToken = req.cookies.get('access_token')?.value;

  // If accessing a protected route without a token → redirect to login
  if (isProtectedPath(pathname) && !accessToken) {
    const url = req.nextUrl.clone();
    url.pathname = '/login';
    url.searchParams.set('from', pathname);
    return NextResponse.redirect(url);
  }

  // If accessing an admin route, verify ADMIN role
  if (isAdminPath(pathname) && accessToken) {
    const role = getRoleFromToken(accessToken);
    if (role !== 'ADMIN') {
      const url = req.nextUrl.clone();
      url.pathname = '/dashboard';
      url.searchParams.delete('from');
      return NextResponse.redirect(url);
    }
  }

  // If already authenticated and hitting auth pages → redirect to feed
  if (isPublicPath(pathname) && pathname !== '/' && accessToken) {
    const role = getRoleFromToken(accessToken);
    const url = req.nextUrl.clone();
    url.pathname = role === 'ADMIN' ? '/admin' : '/dashboard';
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export default proxy;

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
