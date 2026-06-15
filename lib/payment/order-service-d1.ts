/**
 * Order Service - D1 Database Implementation
 * 
 * Handles order creation with TRUE ATOMIC SQL transactions.
 * Uses explicit BEGIN/COMMIT/ROLLBACK for real atomicity.
 * 
 * CRITICAL: DO NOT use db.batch() - it does NOT guarantee atomicity.
 * 
 * SECURITY PRINCIPLES:
 * 1. Orders created ONLY after payment verification
 * 2. Inventory updated atomically via conditional UPDATE with row count check
 * 3. DUAL idempotency - UNIQUE constraints on payment_session_id AND transaction_id
 * 4. All operations in single BEGIN/COMMIT block - explicit ROLLBACK on failure
 * 
 * NO IN-MEMORY STATE - Everything is database-backed.
 */

import {
  D1Database,
  buildOrderByTransactionIdQuery,
  buildOrderByPaymentSessionQuery,
  buildAtomicInventoryDecrement,
  buildOrderInsert,
  buildOrderItemInsert,
  buildPaymentSessionStatusUpdate,
} from '@/lib/db/d1-client'

import {
  Order,
  OrderItem,
  CreateOrderInput,
  ServiceResult,
} from './types'

// =============================================================================
// Custom Error for Insufficient Inventory
// =============================================================================

class InsufficientInventoryError extends Error {
  constructor(public productId: string) {
    super(`Insufficient stock for product: ${productId}`)
    this.name = 'InsufficientInventoryError'
  }
}

// =============================================================================
// Order Service Interface
// =============================================================================

export interface D1OrderServiceInterface {
  create(db: D1Database, input: CreateOrderInput): Promise<ServiceResult<Order>>
  getByPaymentSession(db: D1Database, paymentSessionId: string): Promise<Order | null>
  getByTransactionId(db: D1Database, transactionId: string): Promise<Order | null>
  getById(db: D1Database, orderId: string): Promise<Order | null>
}

// =============================================================================
// Database Row Types
// =============================================================================

interface OrderRow {
  id: string
  user_id: string
  distributor_id: string
  payment_session_id: string
  helcim_transaction_id: string
  total_amount: number
  currency: string
  status: string
  created_at: number
  updated_at: number
}

interface OrderItemRow {
  id: string
  order_id: string
  product_id: string
  product_name: string
  sku: string
  quantity: number
  price_per_unit: number
  line_total: number
}

// =============================================================================
// Order Service Implementation
// =============================================================================

class D1OrderService implements D1OrderServiceInterface {
  /**
   * Create order with REAL SQL transaction using BEGIN/COMMIT/ROLLBACK
   * 
   * TRANSACTION FLOW:
   * 1. Check existing order (idempotency) - BEFORE transaction
   * 2. BEGIN transaction
   * 3. For each item: atomic inventory decrement (fails if insufficient)
   * 4. Insert order record
   * 5. Insert order items
   * 6. Update payment session status to 'paid'
   * 7. COMMIT on success, ROLLBACK on any failure
   */
  async create(db: D1Database, input: CreateOrderInput): Promise<ServiceResult<Order>> {
    // =======================================================================
    // STEP 1: IDEMPOTENCY CHECK - BEFORE transaction starts
    // =======================================================================
    
    // Check by payment session ID
    const existingBySession = await this.getByPaymentSession(db, input.payment_session_id)
    if (existingBySession) {
      return { success: true, data: existingBySession }
    }

    // Check by transaction ID
    const existingByTransaction = await this.getByTransactionId(db, input.helcim_transaction_id)
    if (existingByTransaction) {
      return { success: true, data: existingByTransaction }
    }

    // =======================================================================
    // STEP 2: BEGIN TRANSACTION
    // =======================================================================
    
    const now = Date.now()
    const orderId = crypto.randomUUID()
    let transactionStarted = false

    try {
      await db.exec('BEGIN IMMEDIATE')
      transactionStarted = true
      // =====================================================================
      // STEP 3: ATOMIC INVENTORY DECREMENTS
      // Each update fails if insufficient stock (WHERE available_quantity >= ?)
      // If ANY fails, we throw and trigger ROLLBACK
      // =====================================================================
      
      for (const item of input.items) {
        const inventoryResult = await buildAtomicInventoryDecrement(
          db, 
          item.product_id, 
          item.quantity
        ).run()
        
        // Check if update affected any rows
        if (!inventoryResult.meta || inventoryResult.meta.changes === 0) {
          throw new InsufficientInventoryError(item.product_id)
        }
      }

      // =====================================================================
      // STEP 4: INSERT ORDER RECORD
      // =====================================================================
      
      const orderResult = await buildOrderInsert(db, {
        id: orderId,
        user_id: input.user_id,
        distributor_id: input.distributor_id,
        payment_session_id: input.payment_session_id,
        helcim_transaction_id: input.helcim_transaction_id,
        total_amount: input.total_amount,
        currency: 'CAD',
        status: 'pending',
      }).run()

      if (!orderResult.success) {
        throw new Error('Failed to insert order record')
      }

      // =====================================================================
      // STEP 5: INSERT ORDER ITEMS
      // =====================================================================
      
      for (let i = 0; i < input.items.length; i++) {
        const item = input.items[i]
        const itemResult = await buildOrderItemInsert(db, {
          id: `${orderId}_item_${i}`,
          order_id: orderId,
          product_id: item.product_id,
          product_name: item.product_name,
          sku: item.sku,
          quantity: item.quantity,
          price_per_unit: item.unit_price,
          line_total: item.quantity * item.unit_price,
        }).run()

        if (!itemResult.success) {
          throw new Error(`Failed to insert order item: ${item.product_id}`)
        }
      }

      // =====================================================================
      // STEP 6: UPDATE PAYMENT SESSION STATUS
      // =====================================================================
      
      const sessionResult = await buildPaymentSessionStatusUpdate(
        db, 
        input.payment_session_id, 
        'paid', 
        orderId
      ).run()

      if (!sessionResult.success) {
        throw new Error('Failed to update payment session status')
      }

      // =====================================================================
      // STEP 7: COMMIT TRANSACTION
      // =====================================================================
      
      await db.exec('COMMIT')
      transactionStarted = false

      // =====================================================================
      // STEP 8: FETCH AND RETURN CREATED ORDER
      // =====================================================================
      
      const order = await this.getById(db, orderId)
      if (!order) {
        return {
          success: false,
          error: {
            code: 'ORDER_FETCH_FAILED',
            message: 'Order created but failed to fetch',
          },
        }
      }

      return { success: true, data: order }

    } catch (error) {
      // =====================================================================
      // ROLLBACK ON ANY ERROR - Only if transaction was started
      // =====================================================================
      
      if (transactionStarted) {
        try {
          await db.exec('ROLLBACK')
        } catch (rollbackError) {
          // Log rollback error but DO NOT override original error
          console.error('[D1] Rollback failed:', rollbackError)
        }
      }

      // Handle specific error types
      if (error instanceof InsufficientInventoryError) {
        return {
          success: false,
          error: {
            code: 'INSUFFICIENT_INVENTORY',
            message: error.message,
          },
        }
      }

      const message = error instanceof Error ? error.message : ''
      
      // Check for unique constraint violations (idempotency protection)
      // Use defensive detection - match multiple possible error formats
      if (
        message.includes('UNIQUE constraint failed') ||
        message.includes('constraint failed')
      ) {
        // Race condition - another request created the order
        // Fetch and return existing order
        const existing = await this.getByTransactionId(db, input.helcim_transaction_id)
        if (existing) {
          return { success: true, data: existing }
        }
      }

      return {
        success: false,
        error: {
          code: 'ORDER_CREATION_FAILED',
          message: message || 'Unknown error',
        },
      }
    }
  }

  /**
   * Get order by payment session ID
   */
  async getByPaymentSession(db: D1Database, paymentSessionId: string): Promise<Order | null> {
    const result = await buildOrderByPaymentSessionQuery(db, paymentSessionId).first<OrderRow>()
    if (!result) return null
    return this.buildOrderFromRow(db, result)
  }

  /**
   * Get order by Helcim transaction ID
   */
  async getByTransactionId(db: D1Database, transactionId: string): Promise<Order | null> {
    const result = await buildOrderByTransactionIdQuery(db, transactionId).first<OrderRow>()
    if (!result) return null
    return this.buildOrderFromRow(db, result)
  }

  /**
   * Get order by ID
   */
  async getById(db: D1Database, orderId: string): Promise<Order | null> {
    const result = await db.prepare(`
      SELECT id, user_id, distributor_id, payment_session_id, helcim_transaction_id,
             total_amount, currency, status, created_at, updated_at
      FROM orders
      WHERE id = ?
    `).bind(orderId).first<OrderRow>()
    
    if (!result) return null
    return this.buildOrderFromRow(db, result)
  }

  /**
   * Build Order object from database row
   */
  private async buildOrderFromRow(db: D1Database, row: OrderRow): Promise<Order> {
    // Fetch order items
    const itemsResult = await db.prepare(`
      SELECT id, order_id, product_id, product_name, sku, quantity, price_per_unit, line_total
      FROM order_items
      WHERE order_id = ?
    `).bind(row.id).all<OrderItemRow>()

    const items: OrderItem[] = (itemsResult.results || []).map(item => ({
      id: item.id,
      order_id: item.order_id,
      product_id: item.product_id,
      product_name: item.product_name,
      sku: item.sku,
      quantity: item.quantity,
      unit_price: item.price_per_unit,
      line_total: item.line_total,
    }))

    return {
      id: row.id,
      user_id: row.user_id,
      distributor_id: row.distributor_id,
      payment_session_id: row.payment_session_id,
      helcim_transaction_id: row.helcim_transaction_id,
      status: row.status as Order['status'],
      items,
      total_amount: row.total_amount,
      created_at: row.created_at,
      updated_at: row.updated_at,
    }
  }
}

// =============================================================================
// Export Singleton
// =============================================================================

export const d1OrderService: D1OrderServiceInterface = new D1OrderService()
