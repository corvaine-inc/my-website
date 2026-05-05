/**
 * Server-Side Session Store
 * 
 * This module provides the session storage abstraction.
 * Cookie stores ONLY the session_id - all session data lives server-side.
 * 
 * IMPORTANT: This is an in-memory implementation for development only.
 * For production, replace with a proper database-backed store.
 */

import type { UserRole, DistributorStatus } from './index'

// Use Web Crypto API (compatible with Cloudflare Workers/Pages)

// =============================================================================
// Session Model
// =============================================================================

export interface StoredSession {
  session_id: string
  user_id: string
  role: UserRole
  distributor_status?: DistributorStatus
  expires_at: number // Unix timestamp in milliseconds
  created_at: number
  ip_address?: string
  user_agent?: string
}

// =============================================================================
// Session Store Interface
// =============================================================================

export interface SessionStore {
  create(data: Omit<StoredSession, 'session_id' | 'created_at'>): Promise<StoredSession>
  get(sessionId: string): Promise<StoredSession | null>
  delete(sessionId: string): Promise<boolean>
  deleteAllForUser(userId: string): Promise<number>
  cleanup(): Promise<number> // Remove expired sessions
}

// =============================================================================
// In-Memory Session Store (Development Only)
// =============================================================================

/**
 * WARNING: This is for development/demonstration only.
 * Sessions are lost on server restart.
 * 
 * For production, implement one of:
 * - PostgreSQL/MySQL backed store
 * - Redis backed store (recommended for performance)
 * - Supabase/Neon database
 */
class InMemorySessionStore implements SessionStore {
  private sessions: Map<string, StoredSession> = new Map()

  async create(data: Omit<StoredSession, 'session_id' | 'created_at'>): Promise<StoredSession> {
    const session: StoredSession = {
      ...data,
      session_id: crypto.randomUUID(),
      created_at: Date.now(),
    }
    this.sessions.set(session.session_id, session)
    return session
  }

  async get(sessionId: string): Promise<StoredSession | null> {
    const session = this.sessions.get(sessionId)
    
    if (!session) {
      return null
    }

    // Check expiration
    if (session.expires_at < Date.now()) {
      this.sessions.delete(sessionId)
      return null
    }

    return session
  }

  async delete(sessionId: string): Promise<boolean> {
    return this.sessions.delete(sessionId)
  }

  async deleteAllForUser(userId: string): Promise<number> {
    let count = 0
    for (const [sessionId, session] of this.sessions.entries()) {
      if (session.user_id === userId) {
        this.sessions.delete(sessionId)
        count++
      }
    }
    return count
  }

  async cleanup(): Promise<number> {
    const now = Date.now()
    let count = 0
    for (const [sessionId, session] of this.sessions.entries()) {
      if (session.expires_at < now) {
        this.sessions.delete(sessionId)
        count++
      }
    }
    return count
  }
}

// =============================================================================
// Database Session Store (Production Template)
// =============================================================================

/**
 * Template for production database-backed session store.
 * Uncomment and configure when connecting to a real database.
 */
/*
class DatabaseSessionStore implements SessionStore {
  async create(data: Omit<StoredSession, 'session_id' | 'created_at'>): Promise<StoredSession> {
    const session_id = crypto.randomUUID()
    const created_at = Date.now()
    
    // Example: Supabase/PostgreSQL
    // const { data: session, error } = await supabase
    //   .from('sessions')
    //   .insert({
    //     session_id,
    //     user_id: data.user_id,
    //     role: data.role,
    //     distributor_status: data.distributor_status,
    //     expires_at: new Date(data.expires_at),
    //     created_at: new Date(created_at),
    //     ip_address: data.ip_address,
    //     user_agent: data.user_agent,
    //   })
    //   .select()
    //   .single()
    
    return {
      session_id,
      created_at,
      ...data,
    }
  }

  async get(sessionId: string): Promise<StoredSession | null> {
    // Example: Supabase/PostgreSQL
    // const { data: session } = await supabase
    //   .from('sessions')
    //   .select('*')
    //   .eq('session_id', sessionId)
    //   .gt('expires_at', new Date().toISOString())
    //   .single()
    // 
    // if (!session) return null
    // return {
    //   session_id: session.session_id,
    //   user_id: session.user_id,
    //   role: session.role,
    //   distributor_status: session.distributor_status,
    //   expires_at: new Date(session.expires_at).getTime(),
    //   created_at: new Date(session.created_at).getTime(),
    //   ip_address: session.ip_address,
    //   user_agent: session.user_agent,
    // }
    
    return null
  }

  async delete(sessionId: string): Promise<boolean> {
    // Example: Supabase/PostgreSQL
    // const { error } = await supabase
    //   .from('sessions')
    //   .delete()
    //   .eq('session_id', sessionId)
    // return !error
    
    return false
  }

  async deleteAllForUser(userId: string): Promise<number> {
    // Example: Supabase/PostgreSQL
    // const { count } = await supabase
    //   .from('sessions')
    //   .delete({ count: 'exact' })
    //   .eq('user_id', userId)
    // return count ?? 0
    
    return 0
  }

  async cleanup(): Promise<number> {
    // Example: Supabase/PostgreSQL
    // const { count } = await supabase
    //   .from('sessions')
    //   .delete({ count: 'exact' })
    //   .lt('expires_at', new Date().toISOString())
    // return count ?? 0
    
    return 0
  }
}
*/

// =============================================================================
// Export Session Store Instance
// =============================================================================

// For development: in-memory store
// For production: replace with DatabaseSessionStore
export const sessionStore: SessionStore = new InMemorySessionStore()

// =============================================================================
// Session Validation Helper
// =============================================================================

export interface ValidatedSession {
  valid: boolean
  session: StoredSession | null
  reason?: 'no_session' | 'expired' | 'invalid_role' | 'inactive_distributor'
}

export async function validateSession(sessionId: string | undefined): Promise<ValidatedSession> {
  if (!sessionId) {
    return { valid: false, session: null, reason: 'no_session' }
  }

  const session = await sessionStore.get(sessionId)
  
  if (!session) {
    return { valid: false, session: null, reason: 'expired' }
  }

  // Session is valid
  return { valid: true, session }
}

export async function validateSessionWithRole(
  sessionId: string | undefined,
  requiredRoles: UserRole[]
): Promise<ValidatedSession> {
  const result = await validateSession(sessionId)
  
  if (!result.valid || !result.session) {
    return result
  }

  // Check role
  if (!requiredRoles.includes(result.session.role)) {
    return { valid: false, session: result.session, reason: 'invalid_role' }
  }

  // For distributors, check if active
  if (result.session.role === 'distributor' && result.session.distributor_status !== 'active') {
    return { valid: false, session: result.session, reason: 'inactive_distributor' }
  }

  return result
}
