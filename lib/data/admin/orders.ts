import { createClient } from '@/lib/supabase/server'
import type { OrderStatus } from '@/types/supabase'

export interface AdminOrderListItem {
  id: string
  status: OrderStatus
  totalAmount: number
  contactEmail: string
  contactPhone: string | null
  customerName: string
  itemCount: number
  createdAt: string
}

/**
 * Toutes les commandes (tous statuts confondus), triées de la plus
 * récente à la plus ancienne, avec le nom du client résolu et le
 * nombre total d'articles par commande.
 *
 * Protégée par le RLS (`orders_select_admin`, réservé à is_admin())
 * et par le middleware qui bloque déjà /admin aux non-admins — cette
 * fonction ne doit donc être appelée que depuis des pages admin.
 */
export async function getAllOrders(): Promise<AdminOrderListItem[]> {
  const supabase = createClient()

  const { data: orders, error } = await supabase
    .from('orders')
    .select('id, status, total_amount, contact_email, contact_phone, user_id, created_at')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('getAllOrders error:', error.message)
    return []
  }
  if (!orders || orders.length === 0) return []

  const userIds = [...new Set(orders.map((o) => o.user_id).filter((id): id is string => !!id))]
  const orderIds = orders.map((o) => o.id)

  // orders.user_id référence auth.users, pas directement profiles :
  // on résout les noms séparément plutôt que de compter sur un embed
  // PostgREST automatique (même limitation que pour les avis produits).
  const [{ data: profiles }, { data: orderItems }] = await Promise.all([
    userIds.length > 0
      ? supabase.from('profiles').select('id, full_name').in('id', userIds)
      : Promise.resolve({ data: [] as { id: string; full_name: string | null }[] }),
    supabase.from('order_items').select('order_id, quantity').in('order_id', orderIds),
  ])

  const nameById = new Map((profiles ?? []).map((p) => [p.id, p.full_name]))

  const itemCountByOrder = new Map<string, number>()
  for (const item of orderItems ?? []) {
    itemCountByOrder.set(item.order_id, (itemCountByOrder.get(item.order_id) ?? 0) + item.quantity)
  }

  return orders.map((order) => ({
    id: order.id,
    status: order.status,
    totalAmount: order.total_amount,
    contactEmail: order.contact_email,
    contactPhone: order.contact_phone,
    customerName: (order.user_id && nameById.get(order.user_id)) || 'Client',
    itemCount: itemCountByOrder.get(order.id) ?? 0,
    createdAt: order.created_at,
  }))
}
