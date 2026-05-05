/**
 * Cloudflare D1 Database Client
 * 
 * Provides typed access to D1 database with REAL SQL transactions.
 * 
 * CRITICAL: Uses explicit BEGIN/COMMIT/ROLLBACK for true atomicity.
 * DO NOT use db.batch() - it does NOT provide transaction guarantees.
 */

// =============================================================================
// D1 Types (from @cloudflare/workers-types)
// =============================================================================

export interface D1Database {
  prepare(query: string): D1PreparedStatement
  exec(query: string): Promise<D1ExecResult>
}

export interface D1PreparedStatement {
  bind(...values: unknown[]): D1PreparedStatement
  first<T = unknown>(colName?: string): Promise<T | null>
  run(): Promise<D1Result>
  all<T = unknown>(): Promise<D1Result<T>>
  raw<T = unknown>(): Promise<T[]>
}

export interface D1Result<T = unknown> {
  results?: T[]
  success: boolean
  error?: string
  meta?: {
    duration: number
    changes: number
    last_row_id: number
    changed_db: boolean
    size_after: number
    rows_read: number
    rows_written: number
  }
}

export interface D1ExecResult {
  count: number
  duration: number
}

// =============================================================================
// Database Context
// =============================================================================

/**
 * Get D1 database from environment
 * In Cloudflare Workers/Pages, this is available as env.DB
 */
export function getD1Database(env: { DB?: D1Database }): D1Database {
  if (!env.DB) {
    throw new Error('D1 database not configured. Set DB binding in wrangler.toml')
  }
  return env.DB
}

// =============================================================================
// Query Builders
// =============================================================================

/**
 * Build a conditional inventory update statement
 * Only decrements if sufficient stock available
 * 
 * CRITICAL: Use with runAtomicInventoryDecrement() to check affected rows
 */
export function buildAtomicInventoryDecrement(
  db: D1Database,
  productId: string,
  quantity: number
): D1PreparedStatement {
  return db.prepare(`
    UPDATE inventory
    SET 
      available_quantity = available_quantity - ?,
      reserved_quantity = reserved_quantity + ?,
      updated_at = ?
    WHERE product_id = ?
      AND available_quantity >= ?
  `).bind(quantity, quantity, Date.now(), productId, quantity)
}

/**
 * Build idempotency check for order by transaction ID
 */
export function buildOrderByTransactionIdQuery(
  db: D1Database,
  transactionId: string
): D1PreparedStatement {
  return db.prepare(`
    SELECT id, status, user_id, distributor_id, payment_session_id, 
           helcim_transaction_id, total_amount, currency, created_at, updated_at
    FROM orders 
    WHERE helcim_transaction_id = ?
  `).bind(transactionId)
}

/**
 * Build idempotency check for order by payment session ID
 */
export function buildOrderByPaymentSessionQuery(
  db: D1Database,
  paymentSessionId: string
): D1PreparedStatement {
  return db.prepare(`
    SELECT id, status, user_id, distributor_id, payment_session_id, 
           helcim_transaction_id, total_amount, currency, created_at, updated_at
    FROM orders 
    WHERE payment_session_id = ?
  `).bind(paymentSessionId)
}

/**
 * Build payment session fetch query
 */
export function buildPaymentSessionQuery(
  db: D1Database,
  sessionId: string
): D1PreparedStatement {
  return db.prepare(`
    SELECT id, user_id, distributor_id, amount_expected, currency, status,
           items, helcim_session_id, helcim_transaction_id, order_id,
           created_at, expires_at
    FROM payment_sessions
    WHERE id = ?
  `).bind(sessionId)
}

/**
 * Build payment session by Helcim session ID query
 */
export function buildPaymentSessionByHelcimIdQuery(
  db: D1Database,
  helcimSessionId: string
): D1PreparedStatement {
  return db.prepare(`
    SELECT id, user_id, distributor_id, amount_expected, currency, status,
           items, helcim_session_id, helcim_transaction_id, order_id,
           created_at, expires_at
    FROM payment_sessions
    WHERE helcim_session_id = ?
  `).bind(helcimSessionId)
}

/**
 * Build order insert statement
 */
export function buildOrderInsert(
  db: D1Database,
  order: {
    id: string
    user_id: string
    distributor_id: string
    payment_session_id: string
    helcim_transaction_id: string
    total_amount: number
    currency: string
    status: string
  }
): D1PreparedStatement {
  const now = Date.now()
  return db.prepare(`
    INSERT INTO orders (
      id, user_id, distributor_id, payment_session_id, helcim_transaction_id,
      total_amount, currency, status, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).bind(
    order.id,
    order.user_id,
    order.distributor_id,
    order.payment_session_id,
    order.helcim_transaction_id,
    order.total_amount,
    order.currency,
    order.status,
    now,
    now
  )
}

/**
 * Build order item insert statement
 */
export function buildOrderItemInsert(
  db: D1Database,
  item: {
    id: string
    order_id: string
    product_id: string
    product_name: string
    sku: string
    quantity: number
    price_per_unit: number
    line_total: number
  }
): D1PreparedStatement {
  return db.prepare(`
    INSERT INTO order_items (
      id, order_id, product_id, product_name, sku, quantity, price_per_unit, line_total
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).bind(
    item.id,
    item.order_id,
    item.product_id,
    item.product_name,
    item.sku,
    item.quantity,
    item.price_per_unit,
    item.line_total
  )
}

/**
 * Build payment session status update
 */
export function buildPaymentSessionStatusUpdate(
  db: D1Database,
  sessionId: string,
  status: string,
  orderId?: string
): D1PreparedStatement {
  if (orderId) {
    return db.prepare(`
      UPDATE payment_sessions
      SET status = ?, order_id = ?
      WHERE id = ?
    `).bind(status, orderId, sessionId)
  }
  return db.prepare(`
    UPDATE payment_sessions
    SET status = ?
    WHERE id = ?
  `).bind(status, sessionId)
}

/**
 * Build payment session transaction ID update
 */
export function buildPaymentSessionTransactionIdUpdate(
  db: D1Database,
  sessionId: string,
  transactionId: string
): D1PreparedStatement {
  return db.prepare(`
    UPDATE payment_sessions
    SET helcim_transaction_id = ?
    WHERE id = ? AND helcim_transaction_id IS NULL
  `).bind(transactionId, sessionId)
}
