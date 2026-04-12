import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

// Routes that require authentication
const protectedRoutes = ['/menu-extractor', '/quotation', '/products']
// Routes that require owner role
const ownerRoutes = ['/admin']
// Routes that should redirect to home if already logged in
const authRoutes = ['/login', '/access-denied']

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Create response object that can be modified
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  // Create Supabase client to check session
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value)
            response.cookies.set(name, value, options)
          })
        },
      },
    }
  )

  // Get current user session
  const { data: { user } } = await supabase.auth.getUser()

  // Check if accessing protected route without auth
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route))
  const isOwnerRoute = ownerRoutes.some(route => pathname.startsWith(route))
  const isAuthRoute = authRoutes.some(route => pathname.startsWith(route))

  if (isProtectedRoute && !user) {
    // Not logged in, redirect to login
    const url = new URL('/login', request.url)
    url.searchParams.set('redirect', pathname)
    return NextResponse.redirect(url)
  }

  if (isOwnerRoute && user) {
    // Check if user is owner
    const { data: allowedUser } = await supabase
      .from('allowed_users')
      .select('role')
      .eq('email', user.email)
      .eq('is_active', true)
      .single()

    if (!allowedUser || allowedUser.role !== 'owner') {
      return NextResponse.redirect(new URL('/access-denied', request.url))
    }
  }

  if (isAuthRoute && user) {
    // Already logged in, redirect to home
    return NextResponse.redirect(new URL('/', request.url))
  }

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|api/|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
