export const runtime = 'edge'

import { NextRequest, NextResponse } from 'next/server'
import { publicRoute, adminRoute, type AuthContext } from '@/lib/auth'

/**
 * GET /api/products
 * 
 * Public endpoint - returns product listing
 * No authentication required for browsing products
 * SECURITY: publicRoute() is restricted to GET only
 */
export const GET = publicRoute(async (
  request: NextRequest,
  { auth }: { params: Promise<unknown>; auth: AuthContext }
) => {
  // Minimal auth context is available even on public routes
  // Can be used for personalization (e.g., show distributor pricing)
  // Only userId, role, distributorStatus are exposed - no full session
  void auth.userId
  
  // TODO: Implement product listing
  // - Parse query params (pagination, filters, search)
  // - Fetch products from database
  // - Return paginated response
  
  return NextResponse.json(
    { error: 'Not implemented' },
    { status: 501 }
  )
})

/**
 * POST /api/products
 * 
 * Admin only - creates a new product
 * Authentication is enforced automatically by adminRoute wrapper
 * SECURITY: Only userId, role, distributorStatus exposed via auth context
 */
export const POST = adminRoute(async (
  request: NextRequest,
  { auth }: { params: Promise<unknown>; auth: AuthContext }
) => {
  // auth.userId is guaranteed to exist and role is 'admin' here
  const adminId = auth.userId
  void adminId

  // TODO: Implement product creation
  // - Validate product data
  // - Create product record in database
  // - Return created product

  return NextResponse.json(
    { error: 'Not implemented' },
    { status: 501 }
  )
})
