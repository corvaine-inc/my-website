import { NextRequest, NextResponse } from 'next/server'
import { sessionStore } from '@/lib/auth/session-store'
import {
  type LogoutResponse,
  SESSION_COOKIE_NAME,
} from '@/lib/auth'

/**
 * POST /api/auth/logout
 * 
 * Destroys the user session server-side and clears the session cookie.
 * 
 * Security:
 * - Session is deleted from server-side store
 * - Cookie is cleared with maxAge: 0
 * - Works even if session is already invalid
 */
export async function POST(request: NextRequest) {
  try {
    const sessionId = request.cookies.get(SESSION_COOKIE_NAME)?.value

    // Delete session from server-side store if exists
    if (sessionId) {
      await sessionStore.delete(sessionId)
    }

    // Clear the session cookie regardless of whether deletion succeeded
    const response = NextResponse.json<LogoutResponse>({
      success: true,
    })

    response.cookies.set(SESSION_COOKIE_NAME, '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      maxAge: 0, // Expire immediately
    })

    return response
  } catch (error) {
    console.error('Logout error:', error)
    
    // Even on error, clear the cookie
    const response = NextResponse.json<LogoutResponse>(
      { success: true }, // Report success to client even on server error
      { status: 200 }
    )
    
    response.cookies.set(SESSION_COOKIE_NAME, '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      maxAge: 0,
    })

    return response
  }
}
