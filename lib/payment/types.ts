/**
 * Payment and Order Processing Types
 * 
 * SECURITY PRINCIPLES:
 * 1. Never trust frontend pricing - all amounts computed server-side
 * 2. Payment sessions expire (30 min default)
 * 3. Idempotency enforced via unique transaction IDs
 * 4. Status transitions are one-way (pending -> paid/expired/failed)
 */

// =============================================================================
// Payment Session Types
// =============================================================================

export type PaymentSessionStatus = 
  | 'pending'    // Session created, awaiting payment
  | 'paid'       // Payment verified via webhook
  | 'expired'    // Session TTL exceeded
  | 'failed'     // Payment failed or validation error

export interface PaymentSession {
  /** Unique session ID (UUID) */
  id: string
  
  /** User ID who initiated the session */
  user_id: string
  
  /** Distributor ID for pricing tier lookup */
  distributor_id: string
  
  /** Expected amount in cents (calculated server-side) */
  amount_expected: number
  
  /** Currency code (ISO 4217) */
  currency: string
  
  /** Current session status */
  status: PaymentSessionStatus
  
  /** Cart items snapshot at session creation */
  items: PaymentSessionItem[]
  
  /** Helcim session ID for payment page */
  helcim_session_id: string | null
  
  /** Helcim transaction ID (set on payment confirmation) */
  helcim_transaction_id: string | null
  
  /** Session creation timestamp */
  created_at: number
  
  /** Session expiration timestamp */
  expires_at: number
  
  /** Order ID if payment was successful */
  order_id: string | null
}

export interface PaymentSessionItem {
  /** Product ID */
  product_id: string
  
  /** Quantity ordered */
  quantity: number
  
  /** Unit price at time of session creation (server-calculated) */
  unit_price: number
  
  /** Line total (quantity * unit_price) */
  line_total: number
}

// =============================================================================
// Cart Validation Types
// =============================================================================

export interface CartItem {
  product_id: string
  quantity: number
}

export interface ValidatedCartItem extends CartItem {
  /** Product name for order records */
  product_name: string
  
  /** Product SKU */
  sku: string
  
  /** Unit price (from pricing tier) */
  unit_price: number
  
  /** Line total */
  line_total: number
  
  /** Available inventory */
  available_quantity: number
}

export interface CartValidationResult {
  valid: boolean
  items: ValidatedCartItem[]
  total_amount: number
  errors: CartValidationError[]
}

export interface CartValidationError {
  product_id: string
  code: 'INVALID_PRODUCT' | 'INSUFFICIENT_INVENTORY' | 'BELOW_MOQ' | 'INACTIVE_PRODUCT'
  message: string
}

// =============================================================================
// Pricing Types
// =============================================================================

export type PricingTier = 'retail' | 'silver' | 'gold' | 'platinum'

export interface ProductPricing {
  product_id: string
  base_price: number
  tier_prices: Record<PricingTier, number>
  moq: number // Minimum Order Quantity
}

// =============================================================================
// Order Types
// =============================================================================

export type OrderStatus = 
  | 'pending'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'cancelled'

export interface CreateOrderInput {
  user_id: string
  distributor_id: string
  payment_session_id: string
  helcim_transaction_id: string
  items: OrderItemInput[]
  total_amount: number
}

export interface OrderItemInput {
  product_id: string
  product_name: string
  sku: string
  quantity: number
  unit_price: number
}

export interface Order {
  id: string
  user_id: string
  distributor_id: string
  payment_session_id: string
  helcim_transaction_id: string
  status: OrderStatus
  items: OrderItem[]
  total_amount: number
  created_at: number
  updated_at: number
}

export interface OrderItem {
  id: string
  order_id: string
  product_id: string
  product_name: string
  sku: string
  quantity: number
  unit_price: number
  line_total: number
}

// =============================================================================
// Webhook Types
// =============================================================================

export interface HelcimWebhookPayload {
  event_type: 'payment.success' | 'payment.failed' | 'payment.refunded'
  transaction_id: string
  session_id: string
  amount: number
  currency: string
  timestamp: string
  // Additional fields from Helcim
  [key: string]: unknown
}

// =============================================================================
// Service Result Types
// =============================================================================

export interface ServiceResult<T> {
  success: boolean
  data?: T
  error?: {
    code: string
    message: string
  }
}

export interface PaymentSessionCreateResult {
  session_id: string
  checkout_url: string
  expires_at: number
}
