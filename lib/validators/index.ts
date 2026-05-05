/**
 * Validation utilities and schemas
 * Add Zod schemas, validation functions, and form validators here
 */

/**
 * Email validation regex
 */
export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

/**
 * Password requirements
 */
export const PASSWORD_REQUIREMENTS = {
  minLength: 8,
  requireUppercase: true,
  requireLowercase: true,
  requireNumber: true,
  requireSpecialChar: false,
} as const

/**
 * Common validation error messages
 */
export const ValidationMessages = {
  required: (field: string) => `${field} is required`,
  email: 'Please enter a valid email address',
  passwordMinLength: `Password must be at least ${PASSWORD_REQUIREMENTS.minLength} characters`,
  passwordRequirements: 'Password must contain uppercase, lowercase, and a number',
  phoneFormat: 'Please enter a valid phone number',
  positiveNumber: (field: string) => `${field} must be a positive number`,
} as const

/**
 * Validation result type
 */
export type ValidationResult = {
  valid: boolean
  errors: Record<string, string>
}
