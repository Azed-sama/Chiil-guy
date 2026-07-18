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
  const {
    data: { user },
  } = await supabase.auth.getUser()

  return { response, user, supabase }
}
