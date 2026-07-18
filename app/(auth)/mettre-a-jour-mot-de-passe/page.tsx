import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { UpdatePasswordForm } from '@/components/auth/update-password-form'

export const metadata: Metadata = { title: 'Nouveau mot de passe' }

export default async function UpdatePasswordPage() {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Cette page nécessite une session de récupération valide, obtenue
  // en cliquant sur le lien reçu par email (échangé via /auth/callback).
  // Sans session active, on redirige vers la demande de lien.
  if (!user) {
    redirect('/mot-de-passe-oublie')
  }

  return <UpdatePasswordForm />
}
