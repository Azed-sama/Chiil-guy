import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import type { Database } from '@/types/supabase'

/**
 * Rafraîchit la session Supabase à chaque requête (les tokens JWT
 * expirent régulièrement). Doit être appelé depuis middleware.ts.
 * Retourne aussi le user courant et le client, pour éviter de
 * recréer un client dans le middleware lui-même.
 */
export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({
    request: { headers: request.headers },
  })

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          response = NextResponse.next({ request: { headers: request.headers } })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // IMPORTANT : ne pas retirer cet appel. Il rafraîchit le token et
  // garantit que auth.uid() est à jour pour les policies RLS.
  let {
    data: { user },
  } = await supabase.auth.getUser()

  // ---------------------------------------------------------
  // Guest checkout : si personne n'est connecté, on crée une
  // session anonyme Supabase (auth.uid() existe alors, sans email
  // ni mot de passe). Le panier et la commande fonctionnent ainsi
  // pour les visiteurs non inscrits, sans changer la moindre policy
  // RLS (elles reposent toutes sur auth.uid()).
  //
  // Nécessite d'avoir activé "Allow anonymous sign-ins" dans
  // Supabase > Authentication > Providers, sinon signInAnonymously()
  // échoue silencieusement et le visiteur reste non connecté (repli
  // sans casse : /account et /admin redirigent alors normalement).
  //
  // Exclusions volontaires :
  // - /account et /admin : ces espaces restent réservés aux vrais
  //   comptes, pas la peine d'y créer une session anonyme.
  // - robots d'indexation évidents : on évite de gonfler le nombre
  //   d'utilisateurs anonymes avec du trafic non-humain.
  // ---------------------------------------------------------
  const { pathname } = request.nextUrl
  const skipAnonAuth =
    pathname.startsWith('/account') ||
    pathname.startsWith('/admin') ||
    /bot|crawl|spider|slurp|facebookexternalhit|whatsapp/i.test(
      request.headers.get('user-agent') ?? ''
    )

  if (!user && !skipAnonAuth) {
    const { data, error } = await supabase.auth.signInAnonymously()
    if (!error) {
      user = data.user
    }
  }

  return { response, user, supabase }
}
