/**
 * Helcim Payment Service
 * 
 * Integration with Helcim payment gateway.
 * Handles payment session creation and webhook signature verification.
 * 
 * SECURITY:
 * 1. Webhook signatures verified with HMAC
 * 2. Session IDs are opaque tokens
 * 3. All sensitive operations logged
 */

import { ServiceResult } from './types'

// =============================================================================
// Configuration
// =============================================================================

const HELCIM_API_URL = process.env.HELCIM_API_URL || 'https://api.helcim.com'
const HELCIM_API_KEY = process.env.HELCIM_API_KEY || ''
const HELCIM_WEBHOOK_SECRET = process.env.HELCIM_WEBHOOK_SECRET || ''

// =============================================================================
// Types
// =============================================================================

export interface CreateHelcimSessionParams {
  amount: number // In cents
  currency: string
  customer_id: string
  metadata: Record<string, string>
  return_url: string
  cancel_url: string
}

export interface HelcimSessionResponse {
  session_id: string
  checkout_url: string
}

export interface HelcimWebhookData {
  event_type: string
  transaction_id: string
  session_id: string
  amount: number
  currency: string
  status: string
  timestamp: string
}

// =============================================================================
// Helcim Service Interface
// =============================================================================

export interface HelcimServiceInterface {
  createPaymentSession(params: CreateHelcimSessionParams): Promise<ServiceResult<HelcimSessionResponse>>
  verifyWebhookSignature(signature: string, rawBody: string): Promise<boolean>
  parseWebhookPayload(rawBody: string): HelcimWebhookData | null
}

// =============================================================================
// Helcim Service Implementation
// =============================================================================

class HelcimService implements HelcimServiceInterface {
  /**
   * Create a payment session with Helcim
   * Returns a checkout URL for the hosted payment page
   */
  async createPaymentSession(
    params: CreateHelcimSessionParams
  ): Promise<ServiceResult<HelcimSessionResponse>> {
    // In production, this would call the actual Helcim API
    // For development, return a mock response
    
    if (!HELCIM_API_KEY) {
      // Mock response for development
      const mockSessionId = `helcim_session_${Date.now()}_${Math.random().toString(36).substring(7)}`
      return {
        success: true,
        data: {
          session_id: mockSessionId,
          checkout_url: `https://checkout.helcim.com/pay/${mockSessionId}`,
        },
      }
    }

    try {
      const response = await fetch(`${HELCIM_API_URL}/v2/payment/sessions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${HELCIM_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: params.amount,
          currency: params.currency,
          customer_id: params.customer_id,
          metadata: params.metadata,
          success_url: params.return_url,
          cancel_url: params.cancel_url,
        }),
      })

      if (!response.ok) {
        const errorBody = await response.text()
        return {
          success: false,
          error: {
            code: 'HELCIM_API_ERROR',
            message: `Helcim API error: ${response.status} - ${errorBody}`,
          },
        }
      }

      const data = await response.json()
      return {
        success: true,
        data: {
          session_id: data.session_id,
          checkout_url: data.checkout_url,
        },
      }
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'HELCIM_CONNECTION_ERROR',
          message: error instanceof Error ? error.message : 'Failed to connect to Helcim',
        },
      }
    }
  }

  /**
   * Verify webhook signature using HMAC
   * CRITICAL: Always verify before processing webhook data
   */
  async verifyWebhookSignature(signature: string, rawBody: string): Promise<boolean> {
    if (!HELCIM_WEBHOOK_SECRET) {
      // Development mode - skip verification
      console.warn('[SECURITY] Webhook signature verification skipped - no secret configured')
      return true
    }

    try {
      // HMAC-SHA256 verification
      const encoder = new TextEncoder()
      const key = await crypto.subtle.importKey(
        'raw',
        encoder.encode(HELCIM_WEBHOOK_SECRET),
        { name: 'HMAC', hash: 'SHA-256' },
        false,
        ['sign']
      )

      const signatureBytes = await crypto.subtle.sign(
        'HMAC',
        key,
        encoder.encode(rawBody)
      )

      const expectedSignature = Array.from(new Uint8Array(signatureBytes))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('')

      // Timing-safe comparison
      return this.timingSafeEqual(signature, expectedSignature)
    } catch {
      return false
    }
  }

  /**
   * Parse webhook payload
   */
  parseWebhookPayload(rawBody: string): HelcimWebhookData | null {
    try {
      const data = JSON.parse(rawBody)
      
      // Validate required fields
      if (!data.event_type || !data.transaction_id || !data.session_id) {
        return null
      }

      return {
        event_type: data.event_type,
        transaction_id: data.transaction_id,
        session_id: data.session_id,
        amount: data.amount,
        currency: data.currency || 'USD',
        status: data.status,
        timestamp: data.timestamp || new Date().toISOString(),
      }
    } catch {
      return null
    }
  }

  /**
   * Timing-safe string comparison to prevent timing attacks
   */
  private timingSafeEqual(a: string, b: string): boolean {
    if (a.length !== b.length) return false
    
    let result = 0
    for (let i = 0; i < a.length; i++) {
      result |= a.charCodeAt(i) ^ b.charCodeAt(i)
    }
    return result === 0
  }
}

// =============================================================================
// Export Singleton
// =============================================================================

export const helcimService: HelcimServiceInterface = new HelcimService()
