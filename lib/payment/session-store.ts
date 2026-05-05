/**
 * Payment Session Store
 * 
 * In-memory implementation for development.
 * Production: Replace with database-backed implementation with TTL indexes.
 * 
 * SECURITY:
 * - Sessions expire after TTL (default 30 minutes)
 * - Status transitions are one-way
 * - Transaction IDs enforce uniqueness (idempotency)
 * 
 * CLEANUP STRATEGY:
 * - NO background timers (edge-safe)
 * - TTL-based expiration checked on read
 * - Explicit cleanup via cleanupExpired() - call from cron/scheduled job
 */

import { 
  PaymentSession, 
  PaymentSessionStatus, 
  PaymentSessionItem 
} from './types'

// =============================================================================
// Configuration
// =============================================================================

const SESSION_TTL_MS = 30 * 60 * 1000 // 30 minutes

/** Maximum age of terminal sessions before hard delete (24 hours) */
const MAX_SESSION_AGE_MS = 24 * 60 * 60 * 1000

// =============================================================================
// In-Memory Store (Development Only)
// =============================================================================

const sessions = new Map<string, PaymentSession>()
const transactionIdIndex = new Map<string, string>() // transaction_id -> session_id
const helcimSessionIndex = new Map<string, string>() // helcim_session_id -> session_id

// =============================================================================
// Store Interface
// =============================================================================

export interface PaymentSessionStoreInterface {
  create(params: CreateSessionParams): Promise<PaymentSession>
  get(sessionId: string): Promise<PaymentSession | null>
  getByTransactionId(transactionId: string): Promise<PaymentSession | null>
  getByHelcimSessionId(helcimSessionId: string): Promise<PaymentSession | null>
  updateStatus(sessionId: string, status: PaymentSessionStatus): Promise<boolean>
  setTransactionId(sessionId: string, transactionId: string): Promise<boolean>
  setOrderId(sessionId: string, orderId: string): Promise<boolean>
  isExpired(session: PaymentSession): boolean
  cleanupExpired(): Promise<{ markedExpired: number; deleted: number }>
}

export interface CreateSessionParams {
  user_id: string
  distributor_id: string
  amount_expected: number
  currency: string
  items: PaymentSessionItem[]
  helcim_session_id: string
}

// =============================================================================
// Store Implementation
// =============================================================================

class InMemoryPaymentSessionStore implements PaymentSessionStoreInterface {
  /**
   * Create a new payment session
   */
  async create(params: CreateSessionParams): Promise<PaymentSession> {
    const now = Date.now()
    const session: PaymentSession = {
      id: crypto.randomUUID(),
      user_id: params.user_id,
      distributor_id: params.distributor_id,
      amount_expected: params.amount_expected,
      currency: params.currency,
      status: 'pending',
      items: params.items,
      helcim_session_id: params.helcim_session_id,
      helcim_transaction_id: null,
      created_at: now,
      expires_at: now + SESSION_TTL_MS,
      order_id: null,
    }
    
    sessions.set(session.id, session)
    helcimSessionIndex.set(params.helcim_session_id, session.id)
    return session
  }

  /**
   * Get session by ID
   * Checks TTL on read - marks expired sessions but does NOT delete
   */
  async get(sessionId: string): Promise<PaymentSession | null> {
    const session = sessions.get(sessionId)
    if (!session) return null
    
    // TTL check on read
    if (session.status === 'pending' && this.isExpired(session)) {
      session.status = 'expired'
      sessions.set(sessionId, session)
    }
    
    return session
  }

  /**
   * Get session by Helcim transaction ID
   */
  async getByTransactionId(transactionId: string): Promise<PaymentSession | null> {
    const sessionId = transactionIdIndex.get(transactionId)
    if (!sessionId) return null
    return this.get(sessionId)
  }

  /**
   * Get session by Helcim session ID
   */
  async getByHelcimSessionId(helcimSessionId: string): Promise<PaymentSession | null> {
    const sessionId = helcimSessionIndex.get(helcimSessionId)
    if (!sessionId) return null
    return this.get(sessionId)
  }

  /**
   * Update session status
   * SECURITY: Status transitions are one-way
   */
  async updateStatus(sessionId: string, status: PaymentSessionStatus): Promise<boolean> {
    const session = sessions.get(sessionId)
    if (!session) return false

    // Validate status transition
    if (!this.isValidTransition(session.status, status)) {
      return false
    }

    session.status = status
    sessions.set(sessionId, session)
    return true
  }

  /**
   * Set Helcim transaction ID
   * SECURITY: Once set, cannot be changed (idempotency)
   */
  async setTransactionId(sessionId: string, transactionId: string): Promise<boolean> {
    const session = sessions.get(sessionId)
    if (!session) return false

    // Already has a transaction ID
    if (session.helcim_transaction_id) {
      return session.helcim_transaction_id === transactionId
    }

    // Check if transaction ID is already used by another session
    if (transactionIdIndex.has(transactionId)) {
      return false
    }

    session.helcim_transaction_id = transactionId
    sessions.set(sessionId, session)
    transactionIdIndex.set(transactionId, sessionId)
    return true
  }

  /**
   * Set order ID after successful order creation
   */
  async setOrderId(sessionId: string, orderId: string): Promise<boolean> {
    const session = sessions.get(sessionId)
    if (!session) return false
    if (session.order_id) return false // Already has an order

    session.order_id = orderId
    sessions.set(sessionId, session)
    return true
  }

  /**
   * Check if session is expired
   */
  isExpired(session: PaymentSession): boolean {
    return Date.now() > session.expires_at
  }

  /**
   * Valid status transitions (one-way)
   */
  private isValidTransition(from: PaymentSessionStatus, to: PaymentSessionStatus): boolean {
    const validTransitions: Record<PaymentSessionStatus, PaymentSessionStatus[]> = {
      pending: ['paid', 'expired', 'failed'],
      paid: [], // Terminal state
      expired: ['paid'], // Allow expired -> paid for late webhook processing
      failed: [], // Terminal state
    }
    return validTransitions[from]?.includes(to) ?? false
  }

  /**
   * Cleanup expired sessions
   * Call from scheduled job (cron, CloudWatch Events, etc.)
   * NOT from background timer (edge-safe)
   * 
   * @returns Count of sessions marked expired and deleted
   */
  async cleanupExpired(): Promise<{ markedExpired: number; deleted: number }> {
    const now = Date.now()
    let markedExpired = 0
    let deleted = 0

    for (const [id, session] of sessions) {
      // Mark pending sessions as expired if past TTL
      if (session.status === 'pending' && now > session.expires_at) {
        session.status = 'expired'
        sessions.set(id, session)
        markedExpired++
      }
      
      // Hard delete very old terminal sessions
      const sessionAge = now - session.created_at
      const isTerminal = ['paid', 'expired', 'failed'].includes(session.status)
      
      if (isTerminal && sessionAge > MAX_SESSION_AGE_MS) {
        sessions.delete(id)
        
        // Clean up indexes
        if (session.helcim_session_id) {
          helcimSessionIndex.delete(session.helcim_session_id)
        }
        if (session.helcim_transaction_id) {
          transactionIdIndex.delete(session.helcim_transaction_id)
        }
        
        deleted++
      }
    }

    return { markedExpired, deleted }
  }
}

// =============================================================================
// Export Singleton
// =============================================================================

export const paymentSessionStore: PaymentSessionStoreInterface = new InMemoryPaymentSessionStore()

// =============================================================================
// Database Implementation Template
// =============================================================================

/**
 * DATABASE IMPLEMENTATION NOTES:
 * 
 * For production, use database TTL features:
 * 
 * PostgreSQL:
 * - Use pg_cron or external scheduler to run cleanup queries
 * - CREATE INDEX idx_sessions_expires ON payment_sessions(expires_at) WHERE status = 'pending';
 * - UPDATE payment_sessions SET status = 'expired' WHERE status = 'pending' AND expires_at < NOW();
 * - DELETE FROM payment_sessions WHERE status IN ('paid', 'expired', 'failed') AND created_at < NOW() - INTERVAL '24 hours';
 * 
 * Redis:
 * - Use EXPIRE or EXPIREAT for automatic TTL
 * - Keys automatically deleted after TTL
 * 
 * DynamoDB:
 * - Use TTL attribute for automatic deletion
 * - Set ttl = expires_at as Unix timestamp
 * 
 * MongoDB:
 * - Create TTL index: createIndex({ expires_at: 1 }, { expireAfterSeconds: 0 })
 * 
 * SQL Schema:
 * 
 * CREATE TABLE payment_sessions (
 *   id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
 *   user_id UUID NOT NULL,
 *   distributor_id UUID NOT NULL,
 *   amount_expected INTEGER NOT NULL,  -- Stored in cents
 *   currency VARCHAR(3) NOT NULL DEFAULT 'CAD',
 *   status VARCHAR(20) NOT NULL DEFAULT 'pending',
 *   items JSONB NOT NULL,
 *   helcim_session_id VARCHAR(255) UNIQUE,
 *   helcim_transaction_id VARCHAR(255) UNIQUE,
 *   order_id UUID UNIQUE,
 *   created_at TIMESTAMPTZ DEFAULT NOW(),
 *   expires_at TIMESTAMPTZ NOT NULL,
 *   
 *   CONSTRAINT valid_status CHECK (status IN ('pending', 'paid', 'expired', 'failed')),
 *   CONSTRAINT positive_amount CHECK (amount_expected > 0)
 * );
 * 
 * -- Indexes for common queries
 * CREATE INDEX idx_sessions_user ON payment_sessions(user_id);
 * CREATE INDEX idx_sessions_status ON payment_sessions(status) WHERE status = 'pending';
 * CREATE INDEX idx_sessions_expires ON payment_sessions(expires_at) WHERE status = 'pending';
 * CREATE INDEX idx_sessions_created ON payment_sessions(created_at);
 */
