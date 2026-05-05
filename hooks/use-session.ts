'use client'

import useSWR from 'swr'
import { useRouter } from 'next/navigation'
import type { SessionResponse, UserRole } from '@/lib/auth'

const fetcher = (url: string) => fetch(url).then(res => res.json())

/**
 * Client-side session hook
 * 
 * Uses SWR to fetch and cache session state.
 * Session is validated server-side - this hook only reads the result.
 * 
 * Security notes:
 * - Session token is NEVER exposed to client
 * - Minimal data returned (authenticated, role only)
 * - Hook provides read-only access to auth state
 */
export function useSession() {
  const router = useRouter()
  
  const { data, error, isLoading, mutate } = useSWR<SessionResponse>(
    '/api/auth/session',
    fetcher,
    {
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
      dedupingInterval: 5000,
    }
  )

  const role: UserRole | null = data?.role ?? null
  const isAuthenticated = data?.authenticated ?? false

  /**
   * Logout and clear session
   */
  async function logout() {
    await fetch('/api/auth/logout', { method: 'POST' })
    await mutate({ authenticated: false }, false)
    router.push('/')
    router.refresh()
  }

  /**
   * Refresh session data
   */
  async function refreshSession() {
    await mutate()
  }

  return {
    role,
    isAuthenticated,
    isLoading,
    error,
    logout,
    refreshSession,
  }
}

/**
 * Check if user has specific role
 */
export function useHasRole(targetRole: 'admin' | 'distributor') {
  const { role } = useSession()
  return role === targetRole
}

/**
 * Check if user is admin
 */
export function useIsAdmin() {
  const { role } = useSession()
  return role === 'admin'
}
