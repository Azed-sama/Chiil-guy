import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/data/auth'
import { RegisterForm } from '@/components/auth/register-form'

export const metadata: Metadata = { title: 'Créer un compte' }

export default async function RegisterPage() {
  const { isAuthenticated } = await getCurrentUser()
  
  if (isAuthenticated) {
    redirect('/account')
  }
  
  return (
    <div>
      <h1 className="mb-6 font-display text-2xl">Créer un compte</h1>
      <RegisterForm />
    </div>
  )
}