export const runtime = 'edge'

import { NextRequest, NextResponse } from 'next/server'
import {
  type RegisterRequest,
  type RegisterResponse,
  isValidEmail,
  isValidPassword,
} from '@/lib/auth'

/**
 * POST /api/auth/register
 * 
 * Creates a new distributor account with pending status.
 * User cannot access portal until approved by admin.
 * 
 * Security:
 * - Password hashed with bcrypt before storage
 * - No automatic login after registration (security best practice)
 * - Distributor created with status='pending'
 */

/**
 * Check if email already exists
 * 
 * TODO: Replace with actual database lookup
 */
async function checkEmailExists(email: string): Promise<boolean> {
  // PLACEHOLDER: Check database
  // const user = await db.users.findByEmail(email.toLowerCase())
  // return !!user
  void email
  return false
}

/**
 * Create distributor account
 * 
 * TODO: Replace with actual database operations
 */
async function createDistributor(data: RegisterRequest): Promise<{ id: string } | null> {
  // PLACEHOLDER: Implement actual registration
  //
  // 1. Hash password
  // const passwordHash = await bcrypt.hash(data.password, 12)
  //
  // 2. Create user record
  // const user = await db.users.create({
  //   email: data.email.toLowerCase(),
  //   passwordHash,
  //   firstName: data.firstName,
  //   lastName: data.lastName,
  //   role: 'distributor',
  //   status: 'active',
  // })
  //
  // 3. Create distributor record
  // await db.distributors.create({
  //   userId: user.id,
  //   companyName: data.companyName,
  //   taxId: data.taxId,
  //   status: 'pending',
  // })
  //
  // return { id: user.id }
  
  void data
  return null
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as RegisterRequest
    const { email, password, firstName, lastName, companyName, taxId } = body

    // Input validation
    if (!email || !password || !firstName || !lastName || !companyName) {
      return NextResponse.json<RegisterResponse>(
        { success: false, message: 'All required fields must be provided' },
        { status: 400 }
      )
    }

    if (!isValidEmail(email)) {
      return NextResponse.json<RegisterResponse>(
        { success: false, message: 'Invalid email format' },
        { status: 400 }
      )
    }

    const passwordValidation = isValidPassword(password)
    if (!passwordValidation.valid) {
      return NextResponse.json<RegisterResponse>(
        { success: false, message: passwordValidation.message || 'Invalid password' },
        { status: 400 }
      )
    }

    if (firstName.trim().length < 1 || lastName.trim().length < 1) {
      return NextResponse.json<RegisterResponse>(
        { success: false, message: 'First and last name are required' },
        { status: 400 }
      )
    }

    if (companyName.trim().length < 2) {
      return NextResponse.json<RegisterResponse>(
        { success: false, message: 'Company name must be at least 2 characters' },
        { status: 400 }
      )
    }

    // Check if email already exists
    const emailExists = await checkEmailExists(email)
    if (emailExists) {
      // Generic error to prevent user enumeration
      return NextResponse.json<RegisterResponse>(
        { success: false, message: 'Unable to create account. Please try again or contact support.' },
        { status: 400 }
      )
    }

    // Create distributor account
    const distributor = await createDistributor({
      email,
      password,
      firstName,
      lastName,
      companyName,
      taxId,
    })

    if (!distributor) {
      return NextResponse.json<RegisterResponse>(
        { success: false, message: 'Registration service not configured. Please connect a database.' },
        { status: 501 }
      )
    }

    // NOTE: No automatic login - user must log in after registration
    // This is a security best practice
    return NextResponse.json<RegisterResponse>({
      success: true,
      message: 'Registration successful. Your account is pending approval. You will be notified when approved.',
    })
  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json<RegisterResponse>(
      { success: false, message: 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}
