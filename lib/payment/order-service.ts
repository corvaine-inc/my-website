/**
 * Order Service
 * 
 * Handles order creation with ATOMIC operations.
 * Implements strong inventory checks and dual idempotency.
 * 
 * SECURITY PRINCIPLES:
 * 1. Orders created ONLY after payment verification
 * 2. Inventory updated atomically - decrement only if sufficient stock
 * 3. DUAL idempotency - unique on payment_session_id AND transaction_id
 * 4. Partial failure recovery - check existing order before create
 * 5. Full rollback on any failure
 * 
 * ATOMICITY LIMITATION:
 * Current implementation uses best-effort rollback with in-memory locking.
 * For production, migrate to database transactions with SERIALIZABLE isolation.
 * See SQL template at bottom of file for proper implementation.
 */

import { 
  Order, 
  OrderItem, 
  CreateOrderInput,
  ServiceResult,
} from './types'

// =============================================================================
// In-Memory Store (Development Only)
// =============================================================================

const orders = new Map<string, Order>()
const ordersByPaymentSession = new Map<string, string>() // payment_session_id -> order_id
const ordersByTransactionId = new Map<string, string>() // helcim_transaction_id -> order_id

// Mock inventory with atomic operations
interface InventoryRecord {
  available: number
  reserved: number
}

const inventory = new Map<string, InventoryRecord>([
  ['prod_1', { available: 100, reserved: 0 }],
  ['prod_2', { available: 50, reserved: 0 }],
  ['prod_3', { available: 0, reserved: 0 }],
])

// Global mutex for inventory operations (in-memory only)
let inventoryMutex = false
const MUTEX_TIMEOUT_MS = 5000

// =============================================================================
// Order Service Interface
// =============================================================================

export interface OrderServiceInterface {
  create(input: CreateOrderInput): Promise<ServiceResult<Order>>
  getByPaymentSession(paymentSessionId: string): Promise<Order | null>
  getByTransactionId(transactionId: string): Promise<Order | null>
  getById(orderId: string): Promise<Order | null>
}

// =============================================================================
// Atomic Inventory Operations
// =============================================================================

/**
 * Atomic inventory decrement - ONLY succeeds if sufficient stock
 * Returns false if insufficient stock (no partial decrement)
 */
function atomicDecrementInventory(
  productId: string, 
  quantity: number
): { success: boolean; error?: string } {
  const record = inventory.get(productId)
  
  if (!record) {
    return { success: false, error: `Product ${productId} not found` }
  }
  
  // ATOMIC CHECK: Must have sufficient available stock
  if (record.available < quantity) {
    return { 
      success: false, 
      error: `Insufficient stock for ${productId}: need ${quantity}, have ${record.available}` 
    }
  }
  
  // ATOMIC DECREMENT: Only executes if check passed
  record.available -= quantity
  record.reserved += quantity
  inventory.set(productId, record)
  
  return { success: true }
}

/**
 * Rollback inventory decrement
 */
function rollbackInventoryDecrement(productId: string, quantity: number): void {
  const record = inventory.get(productId)
  if (record) {
    record.available += quantity
    record.reserved -= quantity
    inventory.set(productId, record)
  }
}

/**
 * Acquire inventory mutex with timeout
 */
async function acquireInventoryMutex(): Promise<boolean> {
  const startTime = Date.now()
  
  while (inventoryMutex) {
    if (Date.now() - startTime > MUTEX_TIMEOUT_MS) {
      return false // Timeout
    }
    await new Promise(resolve => setTimeout(resolve, 10))
  }
  
  inventoryMutex = true
  return true
}

function releaseInventoryMutex(): void {
  inventoryMutex = false
}

// =============================================================================
// Order Service Implementation
// =============================================================================

class OrderService implements OrderServiceInterface {
  /**
   * Create order with ATOMIC inventory update and DUAL idempotency
   * 
   * FLOW:
   * 1. Check existing order by payment_session_id (idempotent recovery)
   * 2. Check existing order by transaction_id (idempotent recovery)
   * 3. Acquire inventory mutex
   * 4. Atomic inventory decrement for each item
   * 5. Create order record
   * 6. On any failure: rollback and release mutex
   */
  async create(input: CreateOrderInput): Promise<ServiceResult<Order>> {
    // =======================================================================
    // PARTIAL FAILURE SAFETY - Check if order already exists
    // This handles case where previous attempt failed after order creation
    // =======================================================================
    
    // Check 1: Order exists for this payment session
    const existingBySession = ordersByPaymentSession.get(input.payment_session_id)
    if (existingBySession) {
      const existingOrder = orders.get(existingBySession)
      if (existingOrder) {
        // Idempotent recovery - return existing order
        return { success: true, data: existingOrder }
      }
    }

    // Check 2: Order exists for this transaction ID
    const existingByTransaction = ordersByTransactionId.get(input.helcim_transaction_id)
    if (existingByTransaction) {
      const existingOrder = orders.get(existingByTransaction)
      if (existingOrder) {
        // Idempotent recovery - return existing order
        return { success: true, data: existingOrder }
      }
    }

    // =======================================================================
    // ACQUIRE MUTEX FOR ATOMIC OPERATION
    // =======================================================================
    
    const mutexAcquired = await acquireInventoryMutex()
    if (!mutexAcquired) {
      return {
        success: false,
        error: {
          code: 'INVENTORY_BUSY',
          message: 'Inventory is currently being updated. Please retry.',
        },
      }
    }

    // Track inventory changes for rollback
    const inventoryChanges: Array<{ product_id: string; quantity: number }> = []
    let orderId: string | null = null

    try {
      // =======================================================================
      // STRONG INVENTORY UPDATE - Atomic decrement only if sufficient
      // =======================================================================
      
      for (const item of input.items) {
        const result = atomicDecrementInventory(item.product_id, item.quantity)
        
        if (!result.success) {
          // Insufficient stock - rollback all previous decrements
          for (const change of inventoryChanges) {
            rollbackInventoryDecrement(change.product_id, change.quantity)
          }
          
          return {
            success: false,
            error: {
              code: 'INSUFFICIENT_INVENTORY',
              message: result.error || 'Insufficient inventory',
            },
          }
        }
        
        // Track for potential rollback
        inventoryChanges.push({ product_id: item.product_id, quantity: item.quantity })
      }

      // =======================================================================
      // CREATE ORDER RECORD
      // =======================================================================
      
      const now = Date.now()
      orderId = crypto.randomUUID()

      const orderItems: OrderItem[] = input.items.map((item, index) => ({
        id: `${orderId}_item_${index}`,
        order_id: orderId!,
        product_id: item.product_id,
        product_name: item.product_name,
        sku: item.sku,
        quantity: item.quantity,
        unit_price: item.unit_price,
        line_total: item.quantity * item.unit_price,
      }))

      const order: Order = {
        id: orderId,
        user_id: input.user_id,
        distributor_id: input.distributor_id,
        payment_session_id: input.payment_session_id,
        helcim_transaction_id: input.helcim_transaction_id,
        status: 'pending',
        items: orderItems,
        total_amount: input.total_amount,
        created_at: now,
        updated_at: now,
      }

      // =======================================================================
      // STORE ORDER WITH DUAL IDEMPOTENCY INDEXES
      // =======================================================================
      
      orders.set(orderId, order)
      ordersByPaymentSession.set(input.payment_session_id, orderId)
      ordersByTransactionId.set(input.helcim_transaction_id, orderId)

      // =======================================================================
      // SUCCESS
      // =======================================================================
      
      releaseInventoryMutex()
      return { success: true, data: order }

    } catch (error) {
      // =======================================================================
      // ROLLBACK ON ANY FAILURE
      // =======================================================================
      
      // Rollback inventory changes
      for (const change of inventoryChanges) {
        rollbackInventoryDecrement(change.product_id, change.quantity)
      }

      // Rollback order storage if created
      if (orderId) {
        orders.delete(orderId)
        ordersByPaymentSession.delete(input.payment_session_id)
        ordersByTransactionId.delete(input.helcim_transaction_id)
      }

      releaseInventoryMutex()

      return {
        success: false,
        error: {
          code: 'ORDER_CREATION_FAILED',
          message: error instanceof Error ? error.message : 'Unknown error',
        },
      }
    }
  }

  /**
   * Get order by payment session ID
   */
  async getByPaymentSession(paymentSessionId: string): Promise<Order | null> {
    const orderId = ordersByPaymentSession.get(paymentSessionId)
    if (!orderId) return null
    return orders.get(orderId) ?? null
  }

  /**
   * Get order by Helcim transaction ID
   */
  async getByTransactionId(transactionId: string): Promise<Order | null> {
    const orderId = ordersByTransactionId.get(transactionId)
    if (!orderId) return null
    return orders.get(orderId) ?? null
  }

  /**
   * Get order by ID
   */
  async getById(orderId: string): Promise<Order | null> {
    return orders.get(orderId) ?? null
  }
}

// =============================================================================
// Export Singleton
// =============================================================================

export const orderService: OrderServiceInterface = new OrderService()

// =============================================================================
// ATOMICITY LIMITATION DOCUMENTATION
// =============================================================================

/**
 * CURRENT LIMITATION:
 * 
 * This implementation uses in-memory mutex and best-effort rollback.
 * It is NOT truly atomic - a crash between steps could leave inconsistent state.
 * 
 * FOR PRODUCTION, migrate to database transactions:
 * 
 * 1. Use SERIALIZABLE isolation level
 * 2. Use SELECT ... FOR UPDATE to lock inventory rows
 * 3. Use UNIQUE constraints on payment_session_id and transaction_id
 * 4. All operations in a single transaction - automatic rollback on failure
 */

// =============================================================================
// Database Transaction Template (For Production)
// =============================================================================

/**
 * SQL TEMPLATE FOR TRUE ATOMIC ORDER CREATION
 * 
 * -- Begin transaction with SERIALIZABLE isolation
 * BEGIN ISOLATION LEVEL SERIALIZABLE;
 * 
 * -- DUAL IDEMPOTENCY: Check payment_session_id
 * SELECT id, status FROM orders WHERE payment_session_id = $1;
 * -- If exists, COMMIT and return existing order
 * 
 * -- DUAL IDEMPOTENCY: Check transaction_id  
 * SELECT id, status FROM orders WHERE helcim_transaction_id = $2;
 * -- If exists, COMMIT and return existing order
 * 
 * -- Lock inventory rows for update
 * SELECT product_id, available_quantity
 * FROM inventory
 * WHERE product_id = ANY($3::uuid[])
 * FOR UPDATE;
 * 
 * -- STRONG INVENTORY: Atomic decrement only if sufficient
 * UPDATE inventory
 * SET 
 *   available_quantity = available_quantity - $quantity,
 *   reserved_quantity = reserved_quantity + $quantity,
 *   updated_at = NOW()
 * WHERE product_id = $product_id
 *   AND available_quantity >= $quantity
 * RETURNING product_id;
 * -- If no row returned for any product, ROLLBACK (insufficient stock)
 * 
 * -- Create order with unique constraints
 * INSERT INTO orders (
 *   id, user_id, distributor_id, payment_session_id, 
 *   helcim_transaction_id, status, total_amount, created_at
 * ) VALUES ($1, $2, $3, $4, $5, 'pending', $6, NOW())
 * RETURNING *;
 * -- UNIQUE(payment_session_id) and UNIQUE(helcim_transaction_id) 
 * -- constraints prevent duplicates at DB level
 * 
 * -- Create order items
 * INSERT INTO order_items (order_id, product_id, quantity, unit_price, line_total)
 * VALUES ...;
 * 
 * -- All succeeded - commit
 * COMMIT;
 * 
 * -- On any failure, transaction is automatically rolled back
 */
