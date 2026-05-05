'use client'

import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Logo } from '@/components/shared'
import { Clock } from 'lucide-react'

export default function PendingApprovalPage() {
  const router = useRouter()

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/')
    router.refresh()
  }

  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-4 text-center">
          <div className="flex justify-center">
            <Logo size="lg" />
          </div>
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-amber-100">
            <Clock className="h-6 w-6 text-amber-600" />
          </div>
          <div className="space-y-2">
            <CardTitle className="text-2xl">Account Pending Approval</CardTitle>
            <CardDescription>
              Your distributor account is currently under review
            </CardDescription>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <Alert>
            <AlertDescription>
              Our team is reviewing your application. You will receive an email notification once your account has been approved.
            </AlertDescription>
          </Alert>
          
          <div className="space-y-2 text-sm text-muted-foreground">
            <p className="font-medium text-foreground">What happens next?</p>
            <ul className="list-inside list-disc space-y-1">
              <li>We verify your business information</li>
              <li>Review typically takes 1-2 business days</li>
              <li>{"You'll receive an email once approved"}</li>
              <li>Full portal access will be enabled</li>
            </ul>
          </div>
        </CardContent>
        
        <CardFooter className="flex flex-col space-y-3">
          <Button 
            variant="outline"
            onClick={() => router.push('/')} 
            className="w-full"
          >
            Return to Home
          </Button>
          <Button 
            variant="ghost"
            onClick={handleLogout} 
            className="w-full"
          >
            Sign out
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
