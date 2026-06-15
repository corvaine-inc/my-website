export const runtime = 'edge'

import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  // TODO: Implement webhook handler
  // - Verify webhook signature
  // - Parse event type
  // - Route to appropriate handler
  // - Return acknowledgment
  
  return NextResponse.json(
    { error: 'Not implemented' },
    { status: 501 }
  )
}
