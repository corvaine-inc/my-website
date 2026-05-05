'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Spinner } from '@/components/ui/spinner'
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Logo } from '@/components/shared'
import type { LoginRequest, LoginResponse } from '@/lib/auth'

interface LoginFormProps {
  callbackUrl: string
}

export function LoginForm({ callbackUrl }: LoginFormProps) {
  const router = useRouter()
  
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password } as LoginRequest),
      })

      const data: LoginResponse = await response.json()

      if (!data.success) {
        setError(data.message || 'Login failed')
        return
      }

      // Redirect on success
      router.push(data.redirectUrl || callbackUrl)
      router.refresh()
      
    } catch {
      setError('An unexpected error occurred. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-4 text-center">
          <div className="flex justify-center">
            <Logo size="lg" colorScheme="light" />
          </div>
          <div className="space-y-2">
            <CardTitle className="text-2xl">Sign in to your account</CardTitle>
            <CardDescription>
              Enter your email and password to access your account
            </CardDescription>
          </div>
        </CardHeader>
        
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  disabled={isLoading}
                />
              </Field>
              
              <Field>
                <FieldLabel htmlFor="password">Password</FieldLabel>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  disabled={isLoading}
                />
              </Field>
            </FieldGroup>
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
                  Signing in...
                </>
              ) : (
                'Sign in'
              )}
            </Button>
            
            <p className="text-center text-sm text-muted-foreground">
              {"Don't have an account?"}{' '}
              <Link 
                href="/register" 
                className="font-medium text-primary underline-offset-4 hover:underline"
              >
                Register as a distributor
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
