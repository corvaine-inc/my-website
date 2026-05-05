/**
 * Cart Validation Service
 * 
 * Server-side validation of cart items.
 * NEVER trusts frontend pricing - all amounts computed here.
 * 
 * SECURITY PRINCIPLES:
 * 1. All pricing from database/config, not client
 * 2. MOQ enforcement
 * 3. Inventory availability check
 * 4. Product status validation
 */

import { 
  CartItem, 
  ValidatedCartItem, 
  CartValidationResult, 
  CartValidationError,
  PricingTier,
  ProductPricing,
} from './types'

// =============================================================================
// Mock Data (Replace with Database Queries)
// =============================================================================

/**
 * MOCK: Product catalog
 * Replace with database query: SELECT * FROM products WHERE id IN (...)
 */
interface MockProduct {
  id: string
  name: string
  sku: string
  status: 'active' | 'inactive' | 'archived'
  available_quantity: number
}

const mockProducts: Map<string, MockProduct> = new Map([
  ['prod_1', { id: 'prod_1', name: 'Product A', sku: 'SKU-001', status: 'active', available_quantity: 100 }],
  ['prod_2', { id: 'prod_2', name: 'Product B', sku: 'SKU-002', status: 'active', available_quantity: 50 }],
  ['prod_3', { id: 'prod_3', name: 'Product C', sku: 'SKU-003', status: 'inactive', available_quantity: 0 }],
])

/**
 * MOCK: Pricing tiers
 * Replace with database query: SELECT * FROM product_pricing WHERE product_id IN (...)
 */
const mockPricing: Map<string, ProductPricing> = new Map([
  ['prod_1', { 
    product_id: 'prod_1', 
    base_price: 10000, // $100.00 in cents
    tier_prices: { retail: 10000, silver: 9000, gold: 8000, platinum: 7000 },
    moq: 1,
  }],
  ['prod_2', { 
    product_id: 'prod_2', 
    base_price: 25000, // $250.00 in cents
    tier_prices: { retail: 25000, silver: 22500, gold: 20000, platinum: 17500 },
    moq: 5, // Minimum 5 units
  }],
  ['prod_3', { 
    product_id: 'prod_3', 
    base_price: 5000,
    tier_prices: { retail: 5000, silver: 4500, gold: 4000, platinum: 3500 },
    moq: 1,
  }],
])

// =============================================================================
// Cart Validation Service
// =============================================================================

export interface CartValidationServiceInterface {
  validate(items: CartItem[], pricingTier: PricingTier): Promise<CartValidationResult>
  getProductPricing(productId: string, tier: PricingTier): Promise<number | null>
}

class CartValidationService implements CartValidationServiceInterface {
  /**
   * Validate cart items and compute totals
   * 
   * @param items - Cart items from client (only product_id and quantity trusted)
   * @param pricingTier - Distributor's pricing tier
   * @returns Validation result with computed prices
   */
  async validate(items: CartItem[], pricingTier: PricingTier): Promise<CartValidationResult> {
    const validatedItems: ValidatedCartItem[] = []
    const errors: CartValidationError[] = []
    let totalAmount = 0

    for (const item of items) {
      const validationResult = await this.validateItem(item, pricingTier)
      
      if (validationResult.error) {
        errors.push(validationResult.error)
      } else if (validationResult.item) {
        validatedItems.push(validationResult.item)
        totalAmount += validationResult.item.line_total
      }
    }

    return {
      valid: errors.length === 0,
      items: validatedItems,
      total_amount: totalAmount,
      errors,
    }
  }

  /**
   * Get price for a product at a specific tier
   */
  async getProductPricing(productId: string, tier: PricingTier): Promise<number | null> {
    // TODO: Replace with database query
    const pricing = mockPricing.get(productId)
    if (!pricing) return null
    return pricing.tier_prices[tier] ?? pricing.base_price
  }

  /**
   * Validate a single cart item
   */
  private async validateItem(
    item: CartItem, 
    pricingTier: PricingTier
  ): Promise<{ item?: ValidatedCartItem; error?: CartValidationError }> {
    // Get product from database
    // TODO: Replace with actual database query
    const product = mockProducts.get(item.product_id)
    
    if (!product) {
      return {
        error: {
          product_id: item.product_id,
          code: 'INVALID_PRODUCT',
          message: 'Product not found',
        },
      }
    }

    // Check product status
    if (product.status !== 'active') {
      return {
        error: {
          product_id: item.product_id,
          code: 'INACTIVE_PRODUCT',
          message: 'Product is not available for purchase',
        },
      }
    }

    // Get pricing
    const pricing = mockPricing.get(item.product_id)
    if (!pricing) {
      return {
        error: {
          product_id: item.product_id,
          code: 'INVALID_PRODUCT',
          message: 'Product pricing not found',
        },
      }
    }

    // Check MOQ
    if (item.quantity < pricing.moq) {
      return {
        error: {
          product_id: item.product_id,
          code: 'BELOW_MOQ',
          message: `Minimum order quantity is ${pricing.moq}`,
        },
      }
    }

    // Check inventory
    if (item.quantity > product.available_quantity) {
      return {
        error: {
          product_id: item.product_id,
          code: 'INSUFFICIENT_INVENTORY',
          message: `Only ${product.available_quantity} units available`,
        },
      }
    }

    // Calculate price (NEVER trust frontend)
    const unitPrice = pricing.tier_prices[pricingTier] ?? pricing.base_price
    const lineTotal = unitPrice * item.quantity

    return {
      item: {
        product_id: item.product_id,
        product_name: product.name,
        sku: product.sku,
        quantity: item.quantity,
        unit_price: unitPrice,
        line_total: lineTotal,
        available_quantity: product.available_quantity,
      },
    }
  }
}

// =============================================================================
// Export Singleton
// =============================================================================

export const cartValidationService: CartValidationServiceInterface = new CartValidationService()

// =============================================================================
// Database Query Templates
// =============================================================================

/**
 * SQL TEMPLATES FOR DATABASE IMPLEMENTATION
 * 
 * Get products by IDs:
 * SELECT id, name, sku, status, available_quantity 
 * FROM products 
 * WHERE id = ANY($1::uuid[])
 * 
 * Get pricing by product IDs:
 * SELECT product_id, base_price, tier_prices, moq
 * FROM product_pricing
 * WHERE product_id = ANY($1::uuid[])
 * 
 * Check inventory (with row lock for update):
 * SELECT id, available_quantity
 * FROM products
 * WHERE id = ANY($1::uuid[])
 * FOR UPDATE
 */
