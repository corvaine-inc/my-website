/**
 * API Route Authentication Wrapper
 * 
 * Higher-order function that wraps route handlers with automatic authentication.
 * This eliminates human error by enforcing auth checks declaratively.
 * 
 * SECURITY PRINCIPLES:
 * 1. FAIL-CLOSED: withAuth() without explicit options DENIES all access
 * 2. MINIMAL CONTEXT: Only userId, role, distributorStatus exposed to handlers
 * 3. PUBLIC = GET ONLY: publicRoute() restricted to GET for non-sensitive data
 * 4. EXPLICIT ACCESS: Every route must explicitly declare its access level
 * 
 * Usage:
 *   export const GET = publicRoute(handler)           // GET only, non-sensitive
 *   export const GET = protectedRoute(handler)        // Any authenticated user
 *   export const POST = adminRoute(handler)           // Admin only
 *   export const GET = distributorRoute(handler)      // Active distributor or admin
 */

import { NextRequest, NextResponse } from 'next/server'
import { sessionStore, type StoredSession } from './session-store'
import { SESSION_COOKIE_NAME, type UserRole, type DistributorStatus } from './index'

// =============================================================================
// Types
// =============================================================================

/**
 * Authentication options for route protection
 * 
 * SECURITY: Default behavior with empty options is DENY ALL.
 * You must explicitly set allowPublic: true for public routes.
 */
export interface WithAuthOptions {
  /**
   * Allow unauthenticated access (public route)
   * RESTRICTED: Only valid for GET requests
   * Default: false (authenticated access required)
   */
  allowPublic?: boolean
  
  /**
   * Require any authenticated user
   * Default: true (unless allowPublic is set)
   */
  requireAuth?: boolean
  
  /**
   * Require admin role
   * Implies requireAuth: true
   */
  requireAdmin?: boolean
  
  /**
   * Require active distributor or admin
   * Implies requireAuth: true
   */
  requireActiveDistributor?: boolean
  
  /**
   * Enable audit logging for this route
   * Structure only - implementation deferred
   */
  audit?: boolean
}

/**
 * Minimal auth context passed to handlers
 * SECURITY: No full session or user object exposed
 */
export interface AuthContext {
  /** User ID if authenticated, null otherwise */
  userId: string | null
  /** User role if authenticated, null otherwise */
  role: UserRole | null
  /** Distributor status if applicable, null otherwise */
  distributorStatus: DistributorStatus | null
  /** Convenience: true if session exists and is valid */
  isAuthenticated: boolean
  /** Convenience: true if role is admin */
  isAdmin: boolean
  /** Convenience: true if active distributor or admin */
  isActiveDistributor: boolean
}

/**
 * Audit context for logging (structure only)
 */
export interface AuditContext {
  method: string
  path: string
  userId: string | null
  role: UserRole | null
  timestamp: number
  // Future: Add request ID, IP, user agent, etc.
}

/**
 * Handler function signature with auth context
 */
export type AuthenticatedHandler<TParams = unknown> = (
  request: NextRequest,
  context: { params: Promise<TParams>; auth: AuthContext }
) => Promise<NextResponse> | NextResponse

/**
 * Handler function signature without params (for routes without dynamic segments)
 */
export type AuthenticatedHandlerNoParams = (
  request: NextRequest,
  context: { auth: AuthContext }
) => Promise<NextResponse> | NextResponse

// =============================================================================
// Core Implementation
// =============================================================================

/**
 * Get session from request cookies
 */
async function getSessionFromRequest(request: NextRequest): Promise<StoredSession | null> {
  const sessionId = request.cookies.get(SESSION_COOKIE_NAME)?.value
  if (!sessionId) return null
  return sessionStore.get(sessionId)
}

/**
 * Build minimal auth context from session
 * SECURITY: Only exposes userId, role, distributorStatus
 */
function buildAuthContext(session: StoredSession | null): AuthContext {
  const isAuthenticated = session !== null
  const isAdmin = session?.role === 'admin'
  const isActiveDistributor = 
    session?.role === 'admin' || 
    (session?.role === 'distributor' && session?.distributor_status === 'active')

  return {
    userId: session?.user_id ?? null,
    role: session?.role ?? null,
    distributorStatus: session?.distributor_status ?? null,
    isAuthenticated,
    isAdmin,
    isActiveDistributor,
  }
}

/**
 * Build audit context (structure only - no logging implemented)
 */
function buildAuditContext(
  request: NextRequest,
  userId: string | null,
  role: UserRole | null
): AuditContext {
  return {
    method: request.method,
    path: request.nextUrl.pathname,
    userId,
    role,
    timestamp: Date.now(),
  }
}

/**
 * Audit hook placeholder - structure only
 * TODO: Implement actual audit logging when required
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function auditLog(_context: AuditContext): void {
  // Placeholder for future implementation
  // This would send to audit service, log to database, etc.
}

/**
 * Create error response for unauthorized access
 */
function unauthorizedResponse(message: string, status: 401 | 403 = 401): NextResponse {
  return NextResponse.json(
    { error: message },
    { status }
  )
}

/**
 * Create error response for method not allowed
 */
function methodNotAllowedResponse(message: string): NextResponse {
  return NextResponse.json(
    { error: message },
    { status: 405 }
  )
}

/**
 * Wrap an API route handler with authentication enforcement
 * 
 * SECURITY: FAIL-CLOSED by default
 * - Without explicit options, ALL requests are denied
 * - Public routes MUST use allowPublic: true AND are restricted to GET
 * 
 * @param handler - The route handler function
 * @param options - Authentication requirements (REQUIRED - no implicit public)
 * @returns Wrapped handler that enforces auth before calling original handler
 * 
 * @example
 * // DENIED - no options provided (fail-closed)
 * export const GET = withAuth(handler)  // ERROR: Options required
 * 
 * // Public GET route (explicit)
 * export const GET = withAuth(handler, { allowPublic: true })
 * 
 * // Require any authenticated user
 * export const GET = withAuth(handler, { requireAuth: true })
 * 
 * // Require admin role
 * export const POST = withAuth(handler, { requireAdmin: true })
 * 
 * // Require active distributor with audit logging
 * export const GET = withAuth(handler, { requireActiveDistributor: true, audit: true })
 */
export function withAuth<TParams = unknown>(
  handler: AuthenticatedHandler<TParams>,
  options?: WithAuthOptions
): (request: NextRequest, context: { params: Promise<TParams> }) => Promise<NextResponse> {
  
  // SECURITY: Fail-closed - no options = deny all
  if (!options) {
    return async (): Promise<NextResponse> => {
      return unauthorizedResponse('Access denied: No access level declared', 403)
    }
  }

  // Normalize options
  const allowPublic = options.allowPublic ?? false
  const requireAdmin = options.requireAdmin ?? false
  const requireActiveDistributor = options.requireActiveDistributor ?? false
  const auditEnabled = options.audit ?? false
  
  // If any elevated permission is required, auth is required
  const requireAuth = !allowPublic && (
    (options.requireAuth ?? true) || requireAdmin || requireActiveDistributor
  )

  return async (request: NextRequest, routeContext: { params: Promise<TParams> }): Promise<NextResponse> => {
    // SECURITY: Public routes are GET-only
    if (allowPublic && request.method !== 'GET') {
      return methodNotAllowedResponse('Public routes only allow GET requests')
    }

    // Get session
    const session = await getSessionFromRequest(request)
    const authContext = buildAuthContext(session)

    // Audit logging hook (structure only)
    if (auditEnabled) {
      const auditContext = buildAuditContext(request, authContext.userId, authContext.role)
      auditLog(auditContext)
    }

    // Check authentication if required
    if (requireAuth && !authContext.isAuthenticated) {
      return unauthorizedResponse('Authentication required', 401)
    }

    // Check admin role if required
    if (requireAdmin && !authContext.isAdmin) {
      return unauthorizedResponse('Admin access required', 403)
    }

    // Check active distributor if required
    if (requireActiveDistributor && !authContext.isActiveDistributor) {
      if (authContext.role === 'distributor') {
        if (authContext.distributorStatus === 'pending') {
          return unauthorizedResponse('Account pending approval', 403)
        }
        if (authContext.distributorStatus === 'suspended') {
          return unauthorizedResponse('Account suspended', 403)
        }
      }
      return unauthorizedResponse('Active distributor access required', 403)
    }

    // All checks passed - call the handler with minimal auth context
    return handler(request, {
      params: routeContext.params,
      auth: authContext,
    })
  }
}

/**
 * Variant for routes without dynamic params
 * Same security guarantees as withAuth
 */
export function withAuthNoParams(
  handler: AuthenticatedHandlerNoParams,
  options?: WithAuthOptions
): (request: NextRequest) => Promise<NextResponse> {
  
  // SECURITY: Fail-closed - no options = deny all
  if (!options) {
    return async (): Promise<NextResponse> => {
      return unauthorizedResponse('Access denied: No access level declared', 403)
    }
  }

  const allowPublic = options.allowPublic ?? false
  const requireAdmin = options.requireAdmin ?? false
  const requireActiveDistributor = options.requireActiveDistributor ?? false
  const auditEnabled = options.audit ?? false
  const requireAuth = !allowPublic && (
    (options.requireAuth ?? true) || requireAdmin || requireActiveDistributor
  )

  return async (request: NextRequest): Promise<NextResponse> => {
    // SECURITY: Public routes are GET-only
    if (allowPublic && request.method !== 'GET') {
      return methodNotAllowedResponse('Public routes only allow GET requests')
    }

    const session = await getSessionFromRequest(request)
    const authContext = buildAuthContext(session)

    if (auditEnabled) {
      const auditContext = buildAuditContext(request, authContext.userId, authContext.role)
      auditLog(auditContext)
    }

    if (requireAuth && !authContext.isAuthenticated) {
      return unauthorizedResponse('Authentication required', 401)
    }

    if (requireAdmin && !authContext.isAdmin) {
      return unauthorizedResponse('Admin access required', 403)
    }

    if (requireActiveDistributor && !authContext.isActiveDistributor) {
      if (authContext.role === 'distributor') {
        if (authContext.distributorStatus === 'pending') {
          return unauthorizedResponse('Account pending approval', 403)
        }
        if (authContext.distributorStatus === 'suspended') {
          return unauthorizedResponse('Account suspended', 403)
        }
      }
      return unauthorizedResponse('Active distributor access required', 403)
    }

    return handler(request, { auth: authContext })
  }
}

// =============================================================================
// Convenience Wrappers
// =============================================================================

/**
 * Public route - no authentication required
 * SECURITY: Restricted to GET requests only
 * Use for: Public product listings, public pages, health checks
 */
export function publicRoute<TParams = unknown>(
  handler: AuthenticatedHandler<TParams>
) {
  return withAuth(handler, { allowPublic: true })
}

/**
 * Public route without params - no authentication required
 * SECURITY: Restricted to GET requests only
 */
export function publicRouteNoParams(
  handler: AuthenticatedHandlerNoParams
) {
  return withAuthNoParams(handler, { allowPublic: true })
}

/**
 * Protected route - any authenticated user
 */
export function protectedRoute<TParams = unknown>(
  handler: AuthenticatedHandler<TParams>
) {
  return withAuth(handler, { requireAuth: true })
}

/**
 * Protected route without params - any authenticated user
 */
export function protectedRouteNoParams(
  handler: AuthenticatedHandlerNoParams
) {
  return withAuthNoParams(handler, { requireAuth: true })
}

/**
 * Admin route - admin role required
 */
export function adminRoute<TParams = unknown>(
  handler: AuthenticatedHandler<TParams>
) {
  return withAuth(handler, { requireAdmin: true })
}

/**
 * Admin route without params - admin role required
 */
export function adminRouteNoParams(
  handler: AuthenticatedHandlerNoParams
) {
  return withAuthNoParams(handler, { requireAdmin: true })
}

/**
 * Distributor route - active distributor or admin required
 */
export function distributorRoute<TParams = unknown>(
  handler: AuthenticatedHandler<TParams>
) {
  return withAuth(handler, { requireActiveDistributor: true })
}

/**
 * Distributor route without params - active distributor or admin required
 */
export function distributorRouteNoParams(
  handler: AuthenticatedHandlerNoParams
) {
  return withAuthNoParams(handler, { requireActiveDistributor: true })
}
