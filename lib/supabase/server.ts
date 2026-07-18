import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import type { Database } from '@/types/supabase'

/**
 * Client Supabase à utiliser dans les Server Components, Route Handlers
 * et Server Actions. Utilise la clé anonyme — toutes les requêtes
 * passent par le RLS, avec la session de l'utilisateur courant lue
 * depuis les cookies.
 */
export function createClient() {
  const cookieStore = cookies()

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // Appelé depuis un Server Component (lecture seule) : l'écriture
            // du cookie est ignorée ici, elle est déjà gérée par le
            // middleware qui rafraîchit la session à chaque requête.
          }
        },
      },
    }
  )
}
