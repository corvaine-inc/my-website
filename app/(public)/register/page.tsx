'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Spinner } from '@/components/ui/spinner'
import { Field, FieldGroup, FieldLabel, FieldDescription } from '@/components/ui/field'
import { Logo } from '@/components/shared'
import type { RegisterRequest, RegisterResponse } from '@/lib/auth'

export default function RegisterPage() {
  const router = useRouter()
  
  const [formData, setFormData] = useState<RegisterRequest>({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    companyName: '',
    taxId: '',
  })
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  function updateField(field: keyof RegisterRequest, value: string) {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setSuccess(false)
    setIsLoading(true)

    // Client-side validation
    if (formData.password !== confirmPassword) {
      setError('Passwords do not match')
      setIsLoading(false)
      return
    }

    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters')
      setIsLoading(false)
      return
    }

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      const data: RegisterResponse = await response.json()

      if (!data.success) {
        setError(data.message || 'Registration failed')
        return
      }

      // Show success message
      setSuccess(true)
      
    } catch {
      setError('An unexpected error occurred. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  if (success) {
    return (
      <div className="flex min-h-[80vh] items-center justify-center px-4">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-4 text-center">
            <div className="flex justify-center">
              <Logo size="lg" colorScheme="light" />
            </div>
            <div className="space-y-2">
              <CardTitle className="text-2xl">Registration Submitted</CardTitle>
              <CardDescription>
                Your distributor account has been created and is pending approval.
              </CardDescription>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-4">
            <Alert>
              <AlertDescription>
                {"We'll review your application and notify you by email once your account is approved. This typically takes 1-2 business days."}
              </AlertDescription>
            </Alert>
          </CardContent>
          
          <CardFooter>
            <Button 
              onClick={() => router.push('/login')} 
              className="w-full"
            >
              Go to Login
            </Button>
          </CardFooter>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4 py-8">
      <Card className="w-full max-w-lg">
        <CardHeader className="space-y-4 text-center">
          <div className="flex justify-center">
            <Logo size="lg" colorScheme="light" />
          </div>
          <div className="space-y-2">
            <CardTitle className="text-2xl">Register as a Distributor</CardTitle>
            <CardDescription>
              Create your distributor account to access wholesale pricing
            </CardDescription>
          </div>
        </CardHeader>
        
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-6">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            {/* Account Information */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-foreground">Account Information</h3>
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="email">Email</FieldLabel>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@company.com"
                    value={formData.email}
                    onChange={(e) => updateField('email', e.target.value)}
                    required
                    autoComplete="email"
                    disabled={isLoading}
                  />
                </Field>
                
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field>
                    <FieldLabel htmlFor="password">Password</FieldLabel>
                    <Input
                      id="password"
                      type="password"
                      placeholder="Min. 8 characters"
                      value={formData.password}
                      onChange={(e) => updateField('password', e.target.value)}
                      required
                      autoComplete="new-password"
                      disabled={isLoading}
                    />
                  </Field>
                  
                  <Field>
                    <FieldLabel htmlFor="confirmPassword">Confirm Password</FieldLabel>
                    <Input
                      id="confirmPassword"
                      type="password"
                      placeholder="Re-enter password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      autoComplete="new-password"
                      disabled={isLoading}
                    />
                  </Field>
                </div>
              </FieldGroup>
            </div>
            
            {/* Personal Information */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-foreground">Personal Information</h3>
              <FieldGroup>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field>
                    <FieldLabel htmlFor="firstName">First Name</FieldLabel>
                    <Input
                      id="firstName"
                      type="text"
                      placeholder="John"
                      value={formData.firstName}
                      onChange={(e) => updateField('firstName', e.target.value)}
                      required
                      autoComplete="given-name"
                      disabled={isLoading}
                    />
                  </Field>
                  
                  <Field>
                    <FieldLabel htmlFor="lastName">Last Name</FieldLabel>
                    <Input
                      id="lastName"
                      type="text"
                      placeholder="Doe"
                      value={formData.lastName}
                      onChange={(e) => updateField('lastName', e.target.value)}
                      required
                      autoComplete="family-name"
                      disabled={isLoading}
                    />
                  </Field>
                </div>
              </FieldGroup>
            </div>
            
            {/* Business Information */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-foreground">Business Information</h3>
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="companyName">Company Name</FieldLabel>
                  <Input
                    id="companyName"
                    type="text"
                    placeholder="Your Company LLC"
                    value={formData.companyName}
                    onChange={(e) => updateField('companyName', e.target.value)}
                    required
                    autoComplete="organization"
                    disabled={isLoading}
                  />
                </Field>
                
                <Field>
                  <FieldLabel htmlFor="taxId">Tax ID / EIN (Optional)</FieldLabel>
                  <Input
                    id="taxId"
                    type="text"
                    placeholder="XX-XXXXXXX"
                    value={formData.taxId}
                    onChange={(e) => updateField('taxId', e.target.value)}
                    disabled={isLoading}
                  />
                  <FieldDescription>Required for tax-exempt purchases</FieldDescription>
                </Field>
              </FieldGroup>
            </div>
          </CardContent>
          
          <CardFooter className="flex flex-col space-y-4">
            <Button 
              type="submit" 
              className="w-full" 
              disabled={isLoading || true}
            >
              {isLoading ? (
                <>
                  <Spinner className="mr-2" />
                  Creating account...
                </>
              ) : (
                'Create Distributor Account'
              )}
            </Button>
            
            <p className="text-center text-sm text-muted-foreground">
              Already have an account?{' '}
              <Link 
                href="/login" 
                className="font-medium text-primary underline-offset-4 hover:underline"
              >
                Sign in
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
