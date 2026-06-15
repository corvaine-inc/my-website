/**
 * API Route Protection Helpers
 * 
 * Use these helpers in API routes to enforce authentication and authorization.
 * All protected API routes must verify session and role server-side.
 */

import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { sessionStore, type StoredSession } from './session-store'
import { SESSION_COOKIE_NAME, type UserRole } from './index'

// =============================================================================
// Types
// =============================================================================

export interface AuthResult {
  authenticated: boolean
  session: StoredSession | null
  error?: NextResponse
}

export interface AuthorizedResult extends AuthResult {
  authorized: boolean
}

// =============================================================================
// Session Retrieval
// =============================================================================

/**
 * Get current session from request
 * Returns null if no valid session exists
 */
export async function getSession(request: NextRequest): Promise<StoredSession | null> {
  const sessionId = request.cookies.get(SESSION_COOKIE_NAME)?.value
  
  if (!sessionId) {
    return null
  }

  return sessionStore.get(sessionId)
}

/**
 * Get current session from cookies (for use in Server Components or Route Handlers)
 */
export async function getSessionFromCookies(): Promise<StoredSession | null> {
  const cookieStore = await cookies()
  const sessionId = cookieStore.get(SESSION_COOKIE_NAME)?.value
  
  if (!sessionId) {
    return null
  }

  return sessionStore.get(sessionId)
}

// =============================================================================
// Authentication Guards
// =============================================================================

/**
 * Require authentication for an API route
 * Returns an error response if not authenticated
 */
export async function requireAuth(request: NextRequest): Promise<AuthResult> {
  const session = await getSession(request)
  
  if (!session) {
    return {
      authenticated: false,
      session: null,
      error: NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      ),
    }
  }

  return {
    authenticated: true,
    session,
  }
}

/**
 * Require specific role(s) for an API route
 * Returns an error response if not authorized
 */
export async function requireRole(
  request: NextRequest,
  allowedRoles: UserRole[]
): Promise<AuthorizedResult> {
  const authResult = await requireAuth(request)
  
  if (!authResult.authenticated || !authResult.session) {
    return {
      ...authResult,
      authorized: false,
    }
  }

  const hasRole = allowedRoles.includes(authResult.session.role)
  
  if (!hasRole) {
    return {
      authenticated: true,
      session: authResult.session,
      authorized: false,
      error: NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      ),
    }
  }

  return {
    authenticated: true,
    session: authResult.session,
    authorized: true,
  }
}

/**
 * Require admin role for an API route
 */
export async function requireAdmin(request: NextRequest): Promise<AuthorizedResult> {
  return requireRole(request, ['admin'])
}

/**
 * Require distributor role with active status for an API route
 */
export async function requireActiveDistributor(request: NextRequest): Promise<AuthorizedResult> {
  const authResult = await requireAuth(request)
  
  if (!authResult.authenticated || !authResult.session) {
    return {
      ...authResult,
      authorized: false,
    }
  }

  const session = authResult.session
  
  // Admin can access distributor routes
  if (session.role === 'admin') {
    return {
      authenticated: true,
      session,
      authorized: true,
    }
  }

  // Distributor must be active
  if (session.role === 'distributor' && session.distributor_status === 'active') {
    return {
      authenticated: true,
      session,
      authorized: true,
    }
  }

  // Pending or suspended distributor
  return {
    authenticated: true,
    session,
    authorized: false,
    error: NextResponse.json(
      { 
        error: session.distributor_status === 'pending' 
          ? 'Account pending approval' 
          : 'Account suspended' 
      },
      { status: 403 }
    ),
  }
}

// =============================================================================
// Usage Examples
// =============================================================================

/*
// In an API route:

import { requireAuth, requireAdmin, requireActiveDistributor } from '@/lib/auth/api-guard'

// Require any authenticated user
export async function GET(request: NextRequest) {
  const auth = await requireAuth(request)
  if (auth.error) return auth.error
  
  // auth.session is guaranteed to exist here
  const userId = auth.session.user_id
  // ... handle request
}

// Require admin role
export async function POST(request: NextRequest) {
  const auth = await requireAdmin(request)
  if (auth.error) return auth.error
  
  // Only admins reach here
  // ... handle request
}

// Require active distributor
export async function GET(request: NextRequest) {
  const auth = await requireActiveDistributor(request)
  if (auth.error) return auth.error
  
  // Only active distributors or admins reach here
  // ... handle request
}
*/
