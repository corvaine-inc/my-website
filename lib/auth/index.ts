/**
 * Authentication Types and Contracts
 * 
 * This module defines the authentication system contracts.
 * All session management uses HTTP-only secure cookies storing ONLY the session_id.
 * Session data is stored server-side in a session store.
 */

// Re-export session store
export * from './session-store'

// Re-export API guard helpers (legacy - prefer withAuth wrapper)
export * from './api-guard'

// Re-export withAuth wrapper (recommended)
export * from './with-auth'

// =============================================================================
// User & Role Types
// =============================================================================

export type UserRole = 'admin' | 'distributor'

export type DistributorStatus = 'pending' | 'active' | 'suspended'

export interface AuthUser {
  id: string
  email: string
  role: UserRole
  firstName: string
  lastName: string
  distributorStatus?: DistributorStatus
}

// =============================================================================
// Cookie Configuration
// =============================================================================

export const SESSION_COOKIE_NAME = '__session_id' as const

export const SESSION_DURATION_MS = 7 * 24 * 60 * 60 * 1000 // 7 days

export const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict' as const,
  path: '/',
  maxAge: 60 * 60 * 24 * 7, // 7 days in seconds
}

// =============================================================================
// Route Configuration
// =============================================================================

export const PROTECTED_ROUTES = {
  admin: ['/admin'],
  portal: ['/portal'],
} as const

export const AUTH_ROUTES = ['/login', '/register'] as const

export const PUBLIC_ROUTES = ['/', '/products', '/about', '/contact'] as const

// =============================================================================
// API Request/Response Types
// =============================================================================

// Login
export interface LoginRequest {
  email: string
  password: string
}

export interface LoginResponse {
  success: boolean
  message?: string
  redirectUrl?: string
}

// Registration
export interface RegisterRequest {
  email: string
  password: string
  firstName: string
  lastName: string
  companyName: string
  taxId?: string
}

export interface RegisterResponse {
  success: boolean
  message: string
}

// Session - minimal response, no sensitive data
export interface SessionResponse {
  authenticated: boolean
  role?: UserRole
}

// Logout
export interface LogoutResponse {
  success: boolean
}

// =============================================================================
// Validation Helpers
// =============================================================================

export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export function isValidPassword(password: string): { valid: boolean; message?: string } {
  if (password.length < 8) {
    return { valid: false, message: 'Password must be at least 8 characters' }
  }
  if (!/[A-Z]/.test(password)) {
    return { valid: false, message: 'Password must contain at least one uppercase letter' }
  }
  if (!/[a-z]/.test(password)) {
    return { valid: false, message: 'Password must contain at least one lowercase letter' }
  }
  if (!/[0-9]/.test(password)) {
    return { valid: false, message: 'Password must contain at least one number' }
  }
  return { valid: true }
}

// =============================================================================
// Authorization Helpers
// =============================================================================

import type { StoredSession } from './session-store'

/**
 * Check if a session can access admin routes
 */
export function canAccessAdmin(session: StoredSession | null): boolean {
  return session?.role === 'admin'
}

/**
 * Check if a session can access portal routes
 * Distributors must be active (not pending) to access portal
 */
export function canAccessPortal(session: StoredSession | null): boolean {
  if (!session) return false
  if (session.role === 'admin') return true
  if (session.role === 'distributor') {
    return session.distributor_status === 'active'
  }
  return false
}

/**
 * Get the appropriate redirect URL based on session
 */
export function getDefaultRedirect(session: StoredSession): string {
  if (session.role === 'admin') {
    return '/admin'
  }
  if (session.role === 'distributor' && session.distributor_status === 'active') {
    return '/portal'
  }
  // Pending distributors go to pending page
  if (session.role === 'distributor' && session.distributor_status === 'pending') {
    return '/pending-approval'
  }
  return '/'
}
