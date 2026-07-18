import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import type { UserRole } from '@/types/supabase'

export interface AdminUserListItem {
  id: string
  email: string
  fullName: string | null
  role: UserRole
  isBlocked: boolean
  createdAt: string
  orderCount: number
}

/**
 * Tous les comptes utilisateurs, avec email résolu via le client
 * service_role (l'email n'est pas dupliqué dans `profiles` par design —
 * il vit uniquement dans auth.users, géré par Supabase Auth).
 *
 * NOTE : `listUsers` est paginé côté Supabase (perPage max conseillé).
 * Pour une boutique de taille raisonnable, un seul appel à 1000 suffit.
 * Au-delà, il faudra itérer sur les pages.
 */
export async function getAllUsers(): Promise<AdminUserListItem[]> {
  const supabase = createClient()
  const adminClient = createAdminClient()

  const [{ data: profiles, error: profilesError }, { data: authData, error: authError }] = await Promise.all([
    supabase.from('profiles').select('id, full_name, role, is_blocked, created_at'),
    adminClient.auth.admin.listUsers({ perPage: 1000 }),
  ])

  if (profilesError) {
    console.error('getAllUsers profiles error:', profilesError.message)
    return []
  }
  if (authError) {
    console.error('getAllUsers auth error:', authError.message)
  }

  const emailById = new Map((authData?.users ?? []).map((u) => [u.id, u.email ?? '—']))

  const { data: orders } = await supabase.from('orders').select('user_id')
  const orderCountById = new Map<string, number>()
  for (const order of orders ?? []) {
    if (!order.user_id) continue
    orderCountById.set(order.user_id, (orderCountById.get(order.user_id) ?? 0) + 1)
  }

  return (profiles ?? [])
    .map((profile) => ({
      id: profile.id,
      email: emailById.get(profile.id) ?? '—',
      fullName: profile.full_name,
      role: profile.role,
      isBlocked: profile.is_blocked,
      createdAt: profile.created_at,
      orderCount: orderCountById.get(profile.id) ?? 0,
    }))
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
}
