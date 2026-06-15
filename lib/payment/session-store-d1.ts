/**
 * Payment Session Store - D1 Database Implementation
 * 
 * Fully database-backed session management.
 * NO in-memory state.
 * 
 * SECURITY:
 * - Sessions expire after TTL (stored in database)
 * - Status transitions are validated
 * - Transaction IDs enforce uniqueness via UNIQUE constraint
 */

import {
  D1Database,
  buildPaymentSessionQuery,
  buildPaymentSessionByHelcimIdQuery,
  buildPaymentSessionStatusUpdate,
  buildPaymentSessionTransactionIdUpdate,
} from '@/lib/db/d1-client'

import {
  PaymentSession,
  PaymentSessionStatus,
  PaymentSessionItem,
} from './types'

// =============================================================================
// Configuration
// =============================================================================

const SESSION_TTL_MS = 30 * 60 * 1000 // 30 minutes

// =============================================================================
// Database Row Types
// =============================================================================

interface PaymentSessionRow {
  id: string
  user_id: string
  distributor_id: string
  amount_expected: number
  currency: string
  status: string
  items: string  // JSON string
  helcim_session_id: string | null
  helcim_transaction_id: string | null
  order_id: string | null
  created_at: number
  expires_at: number
}

// =============================================================================
// Store Interface
// =============================================================================

export interface D1PaymentSessionStoreInterface {
  create(db: D1Database, params: D1CreateSessionParams): Promise<PaymentSession>
  get(db: D1Database, sessionId: string): Promise<PaymentSession | null>
  getByTransactionId(db: D1Database, transactionId: string): Promise<PaymentSession | null>
  getByHelcimSessionId(db: D1Database, helcimSessionId: string): Promise<PaymentSession | null>
  updateStatus(db: D1Database, sessionId: string, status: PaymentSessionStatus): Promise<boolean>
  setTransactionId(db: D1Database, sessionId: string, transactionId: string): Promise<boolean>
  setOrderId(db: D1Database, sessionId: string, orderId: string): Promise<boolean>
  isExpired(session: PaymentSession): boolean
}

export interface D1CreateSessionParams {
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

class D1PaymentSessionStore implements D1PaymentSessionStoreInterface {
  /**
   * Create a new payment session
   */
  async create(db: D1Database, params: D1CreateSessionParams): Promise<PaymentSession> {
    const now = Date.now()
    const id = crypto.randomUUID()
    const expiresAt = now + SESSION_TTL_MS

    await db.prepare(`
      INSERT INTO payment_sessions (
        id, user_id, distributor_id, amount_expected, currency, status,
        items, helcim_session_id, helcim_transaction_id, order_id,
        created_at, expires_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NULL, NULL, ?, ?)
    `).bind(
      id,
      params.user_id,
      params.distributor_id,
      params.amount_expected,
      params.currency,
      'pending',
      JSON.stringify(params.items),
      params.helcim_session_id,
      now,
      expiresAt
    ).run()

    return {
      id,
      user_id: params.user_id,
      distributor_id: params.distributor_id,
      amount_expected: params.amount_expected,
      currency: params.currency,
      status: 'pending',
      items: params.items,
      helcim_session_id: params.helcim_session_id,
      helcim_transaction_id: null,
      created_at: now,
      expires_at: expiresAt,
      order_id: null,
    }
  }

  /**
   * Get session by ID
   * Automatically marks expired pending sessions
   */
  async get(db: D1Database, sessionId: string): Promise<PaymentSession | null> {
    const row = await buildPaymentSessionQuery(db, sessionId).first<PaymentSessionRow>()
    if (!row) return null

    const session = this.rowToSession(row)

    // Auto-expire pending sessions past TTL
    if (session.status === 'pending' && this.isExpired(session)) {
      await this.updateStatus(db, sessionId, 'expired')
      session.status = 'expired'
    }

    return session
  }

  /**
   * Get session by Helcim transaction ID
   */
  async getByTransactionId(db: D1Database, transactionId: string): Promise<PaymentSession | null> {
    const row = await db.prepare(`
      SELECT id, user_id, distributor_id, amount_expected, currency, status,
             items, helcim_session_id, helcim_transaction_id, order_id,
             created_at, expires_at
      FROM payment_sessions
      WHERE helcim_transaction_id = ?
    `).bind(transactionId).first<PaymentSessionRow>()

    if (!row) return null
    return this.rowToSession(row)
  }

  /**
   * Get session by Helcim session ID
   */
  async getByHelcimSessionId(db: D1Database, helcimSessionId: string): Promise<PaymentSession | null> {
    const row = await buildPaymentSessionByHelcimIdQuery(db, helcimSessionId).first<PaymentSessionRow>()
    if (!row) return null

    const session = this.rowToSession(row)

    // Auto-expire pending sessions past TTL
    if (session.status === 'pending' && this.isExpired(session)) {
      await this.updateStatus(db, session.id, 'expired')
      session.status = 'expired'
    }

    return session
  }

  /**
   * Update session status
   */
  async updateStatus(db: D1Database, sessionId: string, status: PaymentSessionStatus): Promise<boolean> {
    // First validate the transition is allowed
    const current = await this.get(db, sessionId)
    if (!current) return false

    if (!this.isValidTransition(current.status, status)) {
      return false
    }

    const result = await buildPaymentSessionStatusUpdate(db, sessionId, status).run()
    return result.meta?.changes ? result.meta.changes > 0 : false
  }

  /**
   * Set Helcim transaction ID
   * Uses conditional update - only succeeds if transaction_id is NULL
   */
  async setTransactionId(db: D1Database, sessionId: string, transactionId: string): Promise<boolean> {
    const result = await buildPaymentSessionTransactionIdUpdate(db, sessionId, transactionId).run()
    return result.meta?.changes ? result.meta.changes > 0 : false
  }

  /**
   * Set order ID after successful order creation
   */
  async setOrderId(db: D1Database, sessionId: string, orderId: string): Promise<boolean> {
    const result = await db.prepare(`
      UPDATE payment_sessions
      SET order_id = ?
      WHERE id = ? AND order_id IS NULL
    `).bind(orderId, sessionId).run()
    
    return result.meta?.changes ? result.meta.changes > 0 : false
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
   * Convert database row to PaymentSession object
   */
  private rowToSession(row: PaymentSessionRow): PaymentSession {
    return {
      id: row.id,
      user_id: row.user_id,
      distributor_id: row.distributor_id,
      amount_expected: row.amount_expected,
      currency: row.currency,
      status: row.status as PaymentSessionStatus,
      items: JSON.parse(row.items) as PaymentSessionItem[],
      helcim_session_id: row.helcim_session_id,
      helcim_transaction_id: row.helcim_transaction_id,
      created_at: row.created_at,
      expires_at: row.expires_at,
      order_id: row.order_id,
    }
  }
}

// =============================================================================
// Export Singleton
// =============================================================================

export const d1PaymentSessionStore: D1PaymentSessionStoreInterface = new D1PaymentSessionStore()
