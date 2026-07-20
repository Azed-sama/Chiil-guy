import { Suspense } from 'react'
import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/data/auth'
import { LoginForm } from '@/components/auth/login-form'

export const metadata: Metadata = { title: 'Connexion' }

export default async function LoginPage() {
  const { isAuthenticated } = await getCurrentUser()

  if (isAuthenticated) {
    redirect('/account')
  }

  return (
    <div>
      <h1 className="mb-6 font-display text-2xl">Content de te revoir</h1>
      <Suspense>
        <LoginForm />
      </Suspense>
    </div>
  )
}