import { cache } from 'react'
import { createClient } from '@/lib/supabase/server'

/**
 * Utilisateur courant + son statut admin, en un seul appel.
 * Renvoie isAdmin: false si non connecté ou si le profil n'existe pas.
 */
export const getCurrentUser = cache(async () => {
  const supabase = createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { user: null, isAdmin: false }
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .maybeSingle()

  return { user, isAdmin: profile?.role === 'admin' }
})