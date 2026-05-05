import { NextRequest, NextResponse } from 'next/server'
import { sessionStore } from '@/lib/auth/session-store'
import {
  type SessionResponse,
  SESSION_COOKIE_NAME,
} from '@/lib/auth'

/**
 * GET /api/auth/session
 * 
 * Returns minimal session data for UI state.
 * 
 * Response:
 * - authenticated: boolean
 * - role: UserRole | undefined
 * 
 * Security:
 * - Session validated against server-side store
 * - Never exposes sensitive user data, tokens, or session internals
 * - Clears stale cookies if session is invalid
 */
export async function GET(request: NextRequest) {
  try {
    const sessionId = request.cookies.get(SESSION_COOKIE_NAME)?.value

    if (!sessionId) {
      return NextResponse.json<SessionResponse>({
        authenticated: false,
      })
    }

    // Validate session against server-side store
    const session = await sessionStore.get(sessionId)

    if (!session) {
      // Session not found or expired - clear stale cookie
      const response = NextResponse.json<SessionResponse>({
        authenticated: false,
      })

      response.cookies.set(SESSION_COOKIE_NAME, '', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        path: '/',
        maxAge: 0,
      })

      return response
    }

    // Return minimal data only - no sensitive information
    return NextResponse.json<SessionResponse>({
      authenticated: true,
      role: session.role,
    })
  } catch (error) {
    console.error('Session check error:', error)
    return NextResponse.json<SessionResponse>({
      authenticated: false,
    })
  }
}
