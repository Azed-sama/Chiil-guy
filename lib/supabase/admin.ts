import 'server-only'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/types/supabase'

/**
 * ⚠️ CLIENT SENSIBLE — clé service_role, CONTOURNE LE RLS.
 *
 * À utiliser UNIQUEMENT dans :
 *  - les Route Handlers serveur (ex: /api/webhooks/stripe)
 *  - des Server Actions admin déjà protégées par une vérification de rôle
 *
 * Ne jamais importer ce fichier depuis un composant client ("use client")
 * ni l'exposer, directement ou indirectement, au navigateur.
 * Le package "server-only" fait échouer le build si c'est le cas.
 */
export function createAdminClient() {
  return createSupabaseClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  )
}
