import { NextResponse } from 'next/server'

export function middleware(request) {
  // If the request is for an API route or an internal Next.js asset, let it pass
  if (
    request.nextUrl.pathname.startsWith('/api') ||
    request.nextUrl.pathname.startsWith('/_next') ||
    request.nextUrl.pathname.includes('.')
  ) {
    return NextResponse.next()
  }

  // Otherwise, if they are not already at the root, rewrite their request to the root (the maintenance page)
  if (request.nextUrl.pathname !== '/') {
    return NextResponse.rewrite(new URL('/', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}
