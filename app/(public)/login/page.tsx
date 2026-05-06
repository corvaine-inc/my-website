export const runtime = 'edge'
import { LoginForm } from './login-form'

interface LoginPageProps {
  searchParams: Promise<{ callbackUrl?: string }>
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams
  const callbackUrl = params.callbackUrl || '/'
  
  return <LoginForm callbackUrl={callbackUrl} />
}
