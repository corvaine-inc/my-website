/**
 * POST /api/webhooks/helcim-d1
 * 
 * D1 Database-backed Helcim payment webhook handler.
 * Uses atomic database transactions - NO in-memory state.
 * 
 * SECURITY FLOW:
 * 1. Verify webhook signature (HMAC with RAW body)
 * 2. Parse and validate payload
 * 3. PAYMENT STATUS VALIDATION - only accept confirmed/settled
 * 4. IDEMPOTENCY CHECK - BEFORE any mutation (database-backed)
 * 5. Find matching payment_session
 * 6. EXACT AMOUNT MATCH - integer cents, currency must match
 * 7. ATOMIC order creation via D1 batch transaction
 * 8. Session status update included in transaction
 * 
 * ATOMICITY:
 * All inventory decrements, order creation, and session updates
 * happen in a single D1 batch() call - automatic rollback on failure.
 */

import { NextRequest, NextResponse } from 'next/server'
import { getD1Database, type D1Database } from '@/lib/db/d1-client'
import { d1PaymentSessionStore } from '@/lib/payment/session-store-d1'
import { d1OrderService } from '@/lib/payment/order-service-d1'
import { helcimService } from '@/lib/payment/helcim-service'
import type { CreateOrderInput, OrderItemInput } from '@/lib/payment/types'

// =============================================================================
// Valid Payment Statuses
// =============================================================================

const VALID_PAYMENT_STATUSES = new Set([
  'approved',
  'settled',
  'captured',
  'confirmed',
  'completed',
])

// =============================================================================
// Logging
// =============================================================================

interface WebhookLogEntry {
  timestamp: number
  event_type: string
  session_id: string | null
  transaction_id: string | null
  status: 'received' | 'processed' | 'failed' | 'duplicate' | 'rejected'
  error?: string
  details?: Record<string, unknown>
}

function logWebhookEvent(entry: WebhookLogEntry): void {
  console.log('[WEBHOOK-D1]', JSON.stringify(entry))
}

// =============================================================================
// Amount Validation (EXACT MATCH - No tolerance)
// =============================================================================

function validateAmount(
  expectedCents: number,
  expectedCurrency: string,
  receivedAmount: number,
  receivedCurrency: string
): { valid: boolean; error?: string } {
  const receivedCents = Math.round(receivedAmount * 100)
  
  if (receivedCurrency.toUpperCase() !== expectedCurrency.toUpperCase()) {
    return {
      valid: false,
      error: `Currency mismatch: expected ${expectedCurrency}, received ${receivedCurrency}`,
    }
  }

  if (receivedCents !== expectedCents) {
    return {
      valid: false,
      error: `Amount mismatch: expected ${expectedCents} cents, received ${receivedCents} cents`,
    }
  }

  return { valid: true }
}

// =============================================================================
// Get D1 Database from Request Context
// =============================================================================

function getDatabase(request: NextRequest): D1Database {
  // In Cloudflare Workers/Pages, the D1 binding is available via:
  // - request.cf.env.DB (Workers)
  // - context.env.DB (Pages Functions)
  
  // For Next.js on Cloudflare, access via the request context
  // This assumes you've configured the D1 binding in wrangler.toml
  
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const env = (request as any).cf?.env || (globalThis as any).process?.env || {}
  return getD1Database(env)
}

// =============================================================================
// Route Handler
// =============================================================================

export async function POST(request: NextRequest): Promise<NextResponse> {
  const timestamp = Date.now()
  
  // Get D1 database
  let db: D1Database
  try {
    db = getDatabase(request)
  } catch {
    return NextResponse.json(
      { error: 'Database not configured' },
      { status: 500 }
    )
  }

  // Get signature from header
  const signature = request.headers.get('x-helcim-signature')
  
  if (!signature) {
    logWebhookEvent({
      timestamp,
      event_type: 'unknown',
      session_id: null,
      transaction_id: null,
      status: 'failed',
      error: 'Missing signature header',
    })
    return NextResponse.json({ error: 'Missing signature' }, { status: 401 })
  }

  // =======================================================================
  // CRITICAL: Read raw body for signature verification
  // =======================================================================
  const rawBody = await request.text()

  // Verify webhook signature
  const isValidSignature = await helcimService.verifyWebhookSignature(signature, rawBody)
  if (!isValidSignature) {
    logWebhookEvent({
      timestamp,
      event_type: 'unknown',
      session_id: null,
      transaction_id: null,
      status: 'failed',
      error: 'Invalid signature',
    })
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
  }

  // Parse webhook payload
  const webhookData = helcimService.parseWebhookPayload(rawBody)
  if (!webhookData) {
    logWebhookEvent({
      timestamp,
      event_type: 'unknown',
      session_id: null,
      transaction_id: null,
      status: 'failed',
      error: 'Invalid payload format',
    })
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
  }

  // =======================================================================
  // PAYMENT STATUS VALIDATION
  // =======================================================================
  
  const paymentStatus = webhookData.status?.toLowerCase() || ''
  
  if (!VALID_PAYMENT_STATUSES.has(paymentStatus)) {
    logWebhookEvent({
      timestamp,
      event_type: webhookData.event_type,
      session_id: webhookData.session_id,
      transaction_id: webhookData.transaction_id,
      status: 'rejected',
      error: `Payment not confirmed: status=${paymentStatus}`,
    })
    
    return NextResponse.json({ 
      received: true, 
      processed: false,
      reason: 'Payment not in confirmed/settled state',
    })
  }

  // Only process payment.success events
  if (webhookData.event_type !== 'payment.success') {
    logWebhookEvent({
      timestamp,
      event_type: webhookData.event_type,
      session_id: webhookData.session_id,
      transaction_id: webhookData.transaction_id,
      status: 'received',
    })
    return NextResponse.json({ received: true })
  }

  // =======================================================================
  // IDEMPOTENCY CHECK - BEFORE ANY MUTATION (Database-backed)
  // =======================================================================
  
  // Check 1: Order exists by transaction ID
  const existingOrder = await d1OrderService.getByTransactionId(db, webhookData.transaction_id)
  if (existingOrder) {
    logWebhookEvent({
      timestamp,
      event_type: webhookData.event_type,
      session_id: webhookData.session_id,
      transaction_id: webhookData.transaction_id,
      status: 'duplicate',
      details: { existing_order_id: existingOrder.id },
    })
    return NextResponse.json({ 
      received: true, 
      duplicate: true,
      order_id: existingOrder.id,
    })
  }

  // Check 2: Session already processed
  const existingSession = await d1PaymentSessionStore.getByTransactionId(db, webhookData.transaction_id)
  if (existingSession?.status === 'paid') {
    logWebhookEvent({
      timestamp,
      event_type: webhookData.event_type,
      session_id: existingSession.id,
      transaction_id: webhookData.transaction_id,
      status: 'duplicate',
    })
    return NextResponse.json({ 
      received: true, 
      duplicate: true,
      order_id: existingSession.order_id,
    })
  }

  // =======================================================================
  // FIND PAYMENT SESSION
  // =======================================================================
  
  const paymentSession = await d1PaymentSessionStore.getByHelcimSessionId(db, webhookData.session_id)
  
  if (!paymentSession) {
    logWebhookEvent({
      timestamp,
      event_type: webhookData.event_type,
      session_id: null,
      transaction_id: webhookData.transaction_id,
      status: 'failed',
      error: 'Payment session not found',
    })
    return NextResponse.json({ error: 'Session not found' }, { status: 404 })
  }

  // =======================================================================
  // VALIDATE SESSION STATUS
  // =======================================================================
  
  if (paymentSession.status === 'paid') {
    return NextResponse.json({ 
      received: true, 
      duplicate: true,
      order_id: paymentSession.order_id,
    })
  }

  if (paymentSession.status === 'failed') {
    logWebhookEvent({
      timestamp,
      event_type: webhookData.event_type,
      session_id: paymentSession.id,
      transaction_id: webhookData.transaction_id,
      status: 'failed',
      error: 'Session has failed status',
    })
    return NextResponse.json({ error: 'Session failed' }, { status: 400 })
  }

  // Note: Expired sessions ARE allowed if payment is valid
  const isExpired = d1PaymentSessionStore.isExpired(paymentSession)

  // =======================================================================
  // EXACT AMOUNT VALIDATION
  // =======================================================================
  
  const amountValidation = validateAmount(
    paymentSession.amount_expected,
    paymentSession.currency,
    webhookData.amount,
    webhookData.currency
  )

  if (!amountValidation.valid) {
    logWebhookEvent({
      timestamp,
      event_type: webhookData.event_type,
      session_id: paymentSession.id,
      transaction_id: webhookData.transaction_id,
      status: 'failed',
      error: amountValidation.error,
    })
    return NextResponse.json({ error: 'Amount mismatch' }, { status: 400 })
  }

  // =======================================================================
  // SET TRANSACTION ID (Database constraint enforces uniqueness)
  // =======================================================================
  
  const transactionIdSet = await d1PaymentSessionStore.setTransactionId(
    db,
    paymentSession.id,
    webhookData.transaction_id
  )
  
  if (!transactionIdSet) {
    logWebhookEvent({
      timestamp,
      event_type: webhookData.event_type,
      session_id: paymentSession.id,
      transaction_id: webhookData.transaction_id,
      status: 'failed',
      error: 'Transaction ID conflict',
    })
    return NextResponse.json({ error: 'Transaction conflict' }, { status: 409 })
  }

  // =======================================================================
  // ATOMIC ORDER CREATION (D1 batch transaction)
  // =======================================================================
  
  const orderInput: CreateOrderInput = {
    user_id: paymentSession.user_id,
    distributor_id: paymentSession.distributor_id,
    payment_session_id: paymentSession.id,
    helcim_transaction_id: webhookData.transaction_id,
    items: paymentSession.items.map((item): OrderItemInput => ({
      product_id: item.product_id,
      product_name: `Product ${item.product_id}`, // TODO: Fetch from DB
      sku: `SKU-${item.product_id}`,
      quantity: item.quantity,
      unit_price: item.unit_price,
    })),
    total_amount: paymentSession.amount_expected,
  }

  const orderResult = await d1OrderService.create(db, orderInput)

  if (!orderResult.success || !orderResult.data) {
    // Note: Session status update is part of the transaction, so if order
    // creation failed, session status was NOT updated
    logWebhookEvent({
      timestamp,
      event_type: webhookData.event_type,
      session_id: paymentSession.id,
      transaction_id: webhookData.transaction_id,
      status: 'failed',
      error: orderResult.error?.message || 'Order creation failed',
    })
    return NextResponse.json(
      { error: 'Order creation failed', code: orderResult.error?.code },
      { status: 500 }
    )
  }

  // =======================================================================
  // SUCCESS
  // =======================================================================
  
  logWebhookEvent({
    timestamp,
    event_type: webhookData.event_type,
    session_id: paymentSession.id,
    transaction_id: webhookData.transaction_id,
    status: 'processed',
    details: {
      order_id: orderResult.data.id,
      amount_cents: paymentSession.amount_expected,
      currency: paymentSession.currency,
      was_expired: isExpired,
    },
  })

  return NextResponse.json({
    received: true,
    order_id: orderResult.data.id,
  })
}
