import { cache } from 'react'
import { createClient } from '@/lib/supabase/server'

/**
 * Utilisateur courant + son statut admin, en un seul appel.
 *
 * IMPORTANT (Guest Checkout) : depuis l'activation de l'authentification
 * anonyme Supabase (voir middleware.ts), TOUT visiteur a une session
 * `user` non-nulle — y compris un simple visiteur jamais inscrit, via
 * `user.is_anonymous`. `isAuthenticated` ne doit donc jamais être basé
 * sur `!!user` seul : ça afficherait "Mon compte" à un pur visiteur
 * anonyme. On expose donc `isAuthenticated` déjà filtré ici.
 */
export const getCurrentUser = cache(async () => {
  const supabase = createClient()
  
  const {
    data: { user },
  } = await supabase.auth.getUser()
  
  const isAuthenticated = !!user && !user.is_anonymous
  
  if (!isAuthenticated) {
    return { user: null, isAuthenticated: false, isAdmin: false }
  }
  
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .maybeSingle()
  
  return { user, isAuthenticated: true, isAdmin: profile?.role === 'admin' }
})