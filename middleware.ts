import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Allow access to the maintenance page itself to avoid redirect loop
  if (pathname.startsWith("/maintenance")) {
    return NextResponse.next();
  }

  // Redirect all other routes to maintenance page
  const baseUrl = request.nextUrl.origin;
  return NextResponse.redirect(`${baseUrl}/maintenance`);
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - maintenance page itself
     */
    "/((?!api|_next/static|_next/image|favicon.ico|maintenance).*)",
  ],
};
