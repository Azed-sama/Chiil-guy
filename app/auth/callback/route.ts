import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * Point d'entrée unique pour :
 *  - la confirmation d'email après inscription
 *  - le lien reçu lors d'une demande de réinitialisation de mot de passe
 * Supabase redirige ici avec un "code" à échanger contre une session.
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/'

  if (code) {
    const supabase = createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  // Code manquant ou invalide/expiré
  return NextResponse.redirect(`${origin}/connexion?error=lien_invalide`)
}
