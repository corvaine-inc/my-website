/**
 * POST /api/payment/create-session
 * 
 * Creates a payment session with server-side validation.
 * 
 * SECURITY FLOW:
 * 1. Require authenticated active distributor
 * 2. Receive cart items (product_id, quantity ONLY)
 * 3. Server validates: MOQ, pricing tiers, inventory
 * 4. Server calculates total (NEVER trust frontend prices)
 * 5. Create payment_session record
 * 6. Call Helcim to generate hosted payment page
 * 7. Return redirect URL
 * 
 * NEVER trust frontend pricing - all amounts computed server-side
 */

import { NextResponse } from 'next/server'
import { distributorRouteNoParams, type AuthContext } from '@/lib/auth'
import {
  paymentSessionStore,
  cartValidationService,
  helcimService,
  type CartItem,
  type PricingTier,
  type PaymentSessionItem,
} from '@/lib/payment'

// =============================================================================
// Request/Response Types
// =============================================================================

interface PaymentSessionRequest {
  /** Cart items - ONLY product_id and quantity are trusted */
  items: Array<{
    product_id: string
    quantity: number
  }>
  /** Return URL after successful payment */
  return_url?: string
  /** Cancel URL if payment is cancelled */
  cancel_url?: string
}

interface PaymentSessionResponse {
  session_id: string
  checkout_url: string
  expires_at: number
  total_amount: number
  currency: string
}

// =============================================================================
// Mock Distributor Lookup (Replace with Database)
// =============================================================================

interface DistributorInfo {
  id: string
  pricing_tier: PricingTier
}

async function getDistributorByUserId(userId: string): Promise<DistributorInfo | null> {
  // TODO: Replace with database query
  // SELECT id, tier FROM distributors WHERE user_id = $1 AND status = 'active'
  
  // Mock response
  return {
    id: `dist_${userId}`,
    pricing_tier: 'gold' as PricingTier,
  }
}

// =============================================================================
// Route Handler
// =============================================================================

export const POST = distributorRouteNoParams(async (
  request,
  { auth }: { auth: AuthContext }
): Promise<NextResponse<PaymentSessionResponse | { error: string; details?: unknown }>> => {
  // Parse request body
  let body: PaymentSessionRequest
  try {
    body = await request.json()
  } catch {
    return NextResponse.json(
      { error: 'Invalid request body' },
      { status: 400 }
    )
  }

  // Validate request structure
  if (!body.items || !Array.isArray(body.items) || body.items.length === 0) {
    return NextResponse.json(
      { error: 'Items array is required and must not be empty' },
      { status: 400 }
    )
  }

  // Extract only trusted fields (product_id, quantity)
  const cartItems: CartItem[] = body.items.map(item => ({
    product_id: String(item.product_id),
    quantity: Number(item.quantity) || 0,
  }))

  // Validate quantities are positive integers
  for (const item of cartItems) {
    if (!Number.isInteger(item.quantity) || item.quantity <= 0) {
      return NextResponse.json(
        { error: `Invalid quantity for product ${item.product_id}` },
        { status: 400 }
      )
    }
  }

  // Get distributor info for pricing tier
  const distributor = await getDistributorByUserId(auth.userId!)
  if (!distributor) {
    return NextResponse.json(
      { error: 'Distributor account not found' },
      { status: 403 }
    )
  }

  // SERVER-SIDE VALIDATION: MOQ, pricing, inventory
  const validationResult = await cartValidationService.validate(
    cartItems, 
    distributor.pricing_tier
  )

  if (!validationResult.valid) {
    return NextResponse.json(
      { 
        error: 'Cart validation failed', 
        details: validationResult.errors 
      },
      { status: 400 }
    )
  }

  // Prepare payment session items (with server-calculated prices)
  const sessionItems: PaymentSessionItem[] = validationResult.items.map(item => ({
    product_id: item.product_id,
    quantity: item.quantity,
    unit_price: item.unit_price,
    line_total: item.line_total,
  }))

  // Get base URL for return/cancel URLs
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  const returnUrl = body.return_url || `${baseUrl}/portal/orders?status=success`
  const cancelUrl = body.cancel_url || `${baseUrl}/portal/orders?status=cancelled`

  // Create Helcim payment session
  const helcimResult = await helcimService.createPaymentSession({
    amount: validationResult.total_amount,
    currency: 'USD',
    customer_id: auth.userId!,
    metadata: {
      distributor_id: distributor.id,
      user_id: auth.userId!,
    },
    return_url: returnUrl,
    cancel_url: cancelUrl,
  })

  if (!helcimResult.success || !helcimResult.data) {
    return NextResponse.json(
      { error: helcimResult.error?.message || 'Failed to create payment session' },
      { status: 502 }
    )
  }

  // Create payment session record
  const paymentSession = await paymentSessionStore.create({
    user_id: auth.userId!,
    distributor_id: distributor.id,
    amount_expected: validationResult.total_amount,
    currency: 'USD',
    items: sessionItems,
    helcim_session_id: helcimResult.data.session_id,
  })

  // Return checkout URL
  return NextResponse.json({
    session_id: paymentSession.id,
    checkout_url: helcimResult.data.checkout_url,
    expires_at: paymentSession.expires_at,
    total_amount: paymentSession.amount_expected,
    currency: paymentSession.currency,
  })
})
