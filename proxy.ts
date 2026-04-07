import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Routes that require authentication
const PROTECTED_API_ROUTES = [
  '/api/cards',
];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Protect card mutation API routes (POST, PUT, DELETE)
  const isProtectedApi = PROTECTED_API_ROUTES.some((route) =>
    pathname.startsWith(route)
  );

  if (isProtectedApi && request.method !== 'GET') {
    const sessionCookie = request.cookies.get('ssd_session');
    if (!sessionCookie?.value) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/api/:path*'],
};
