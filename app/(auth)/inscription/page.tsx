import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { RegisterForm } from '@/components/auth/register-form'

export const metadata: Metadata = { title: 'Créer un compte' }

export default async function RegisterPage() {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (user) {
    redirect('/account')
  }

  return (
    <div>
      <h1 className="mb-6 font-display text-2xl">Créer un compte</h1>
      <RegisterForm />
    </div>
  )
}
