import { createBrowserClient } from '@supabase/ssr'
import type { Database } from '@/types/supabase'

/**
 * Client Supabase à utiliser UNIQUEMENT dans les composants client
 * ("use client"). Utilise la clé anonyme (anon key) — toutes les
 * requêtes passent par le RLS défini en base.
 */
export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
