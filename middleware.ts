import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { sessionStore, type StoredSession } from '@/lib/auth/session-store'
import {
  SESSION_COOKIE_NAME,
  PROTECTED_ROUTES,
  AUTH_ROUTES,
  canAccessAdmin,
  canAccessPortal,
  getDefaultRedirect,
} from '@/lib/auth'

/**
 * Middleware for route protection
 * 
 * Security features:
 * - Session validated against server-side store only
 * - Role-based access control
 * - Pending distributors blocked from portal
 * - No trust in client-side state
 */

// =============================================================================
// Session Validation (Server-Side Only)
// =============================================================================

async function getValidSession(request: NextRequest): Promise<StoredSession | null> {
  const sessionId = request.cookies.get(SESSION_COOKIE_NAME)?.value
  
  if (!sessionId) {
    return null
  }

  // Query server-side session store - this is the ONLY source of truth
  const session = await sessionStore.get(sessionId)
  
  // Session store already handles expiration checks
  return session
}

// =============================================================================
// Route Checking
// =============================================================================

function isAdminRoute(pathname: string): boolean {
  return PROTECTED_ROUTES.admin.some(route => pathname.startsWith(route))
}

function isPortalRoute(pathname: string): boolean {
  return PROTECTED_ROUTES.portal.some(route => pathname.startsWith(route))
}

function isAuthRoute(pathname: string): boolean {
  return AUTH_ROUTES.some(route => pathname.startsWith(route))
}

// =============================================================================
// Response Helpers
// =============================================================================

function redirectTo(request: NextRequest, path: string): NextResponse {
  return NextResponse.redirect(new URL(path, request.url))
}

function redirectToLogin(request: NextRequest, callbackUrl: string): NextResponse {
  const loginUrl = new URL('/login', request.url)
  loginUrl.searchParams.set('callbackUrl', callbackUrl)
  return NextResponse.redirect(loginUrl)
}

function clearSessionCookie(response: NextResponse): NextResponse {
  response.cookies.set(SESSION_COOKIE_NAME, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
    maxAge: 0,
  })
  return response
}

// =============================================================================
// Middleware Handler
// =============================================================================

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // Validate session against server-side store
  const session = await getValidSession(request)
  const isAuthenticated = session !== null

  // Check route types
  const adminRoute = isAdminRoute(pathname)
  const portalRoute = isPortalRoute(pathname)
  const authRoute = isAuthRoute(pathname)
  const protectedRoute = adminRoute || portalRoute

  // ---------------------------------------------------------------------------
  // Unauthenticated users trying to access protected routes
  // ---------------------------------------------------------------------------
  if (protectedRoute && !isAuthenticated) {
    return redirectToLogin(request, pathname)
  }

  // ---------------------------------------------------------------------------
  // Admin routes: require admin role
  // ---------------------------------------------------------------------------
  if (adminRoute && !canAccessAdmin(session)) {
    // User is authenticated but not admin
    return redirectTo(request, '/')
  }

  // ---------------------------------------------------------------------------
  // Portal routes: require active distributor or admin role
  // ---------------------------------------------------------------------------
  if (portalRoute && !canAccessPortal(session)) {
    if (session?.role === 'distributor' && session?.distributor_status === 'pending') {
      // Pending distributor - redirect to pending approval page
      return redirectTo(request, '/pending-approval')
    }
    // User doesn't have portal access
    return redirectTo(request, '/')
  }

  // ---------------------------------------------------------------------------
  // Auth routes: redirect authenticated users away
  // ---------------------------------------------------------------------------
  if (authRoute && isAuthenticated && session) {
    const callbackUrl = request.nextUrl.searchParams.get('callbackUrl')
    
    // Validate callback URL to prevent open redirect attacks
    let redirectUrl = getDefaultRedirect(session)
    if (callbackUrl && callbackUrl.startsWith('/') && !callbackUrl.startsWith('//')) {
      // Additional validation: ensure callback isn't an auth route
      if (!isAuthRoute(callbackUrl)) {
        redirectUrl = callbackUrl
      }
    }
    
    return redirectTo(request, redirectUrl)
  }

  return NextResponse.next()
}

// =============================================================================
// Matcher Configuration
// =============================================================================

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder assets
     * - API routes (have their own auth checks)
     */
    '/((?!_next/static|_next/image|favicon.ico|public|api).*)',
  ],
}
