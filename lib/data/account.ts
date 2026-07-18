import { createClient } from '@/lib/supabase/server'
import type { OrderStatus } from '@/types/supabase'

// ---------------------------------------------------------
// Profil
// ---------------------------------------------------------

export async function getMyProfile() {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return null

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, phone')
    .eq('id', user.id)
    .maybeSingle()

  return {
    email: user.email ?? '',
    fullName: profile?.full_name ?? '',
    phone: profile?.phone ?? '',
  }
}

// ---------------------------------------------------------
// Historique des commandes
// ---------------------------------------------------------

export interface MyOrderListItem {
  id: string
  status: OrderStatus
  totalAmount: number
  itemCount: number
  createdAt: string
}

export async function getMyOrders(): Promise<MyOrderListItem[]> {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return []

  const { data: orders, error } = await supabase
    .from('orders')
    .select('id, status, total_amount, created_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('getMyOrders error:', error.message)
    return []
  }
  if (!orders || orders.length === 0) return []

  const orderIds = orders.map((o) => o.id)
  const { data: items } = await supabase
    .from('order_items')
    .select('order_id, quantity')
    .in('order_id', orderIds)

  const countByOrder = new Map<string, number>()
  for (const item of items ?? []) {
    countByOrder.set(item.order_id, (countByOrder.get(item.order_id) ?? 0) + item.quantity)
  }

  return orders.map((o) => ({
    id: o.id,
    status: o.status,
    totalAmount: o.total_amount,
    itemCount: countByOrder.get(o.id) ?? 0,
    createdAt: o.created_at,
  }))
}

// ---------------------------------------------------------
// Détail d'une commande (avec statut d'avis par article)
// ---------------------------------------------------------

export interface MyOrderItemDetail {
  id: string
  productId: string | null
  productName: string
  productImageUrl: string | null
  unitPrice: number
  quantity: number
  subtotal: number
  hasReview: boolean
}

export interface MyOrderDetail {
  id: string
  status: OrderStatus
  subtotal: number
  shippingCost: number
  totalAmount: number
  shippingAddress: { fullName?: string; city?: string; address?: string } | null
  contactPhone: string | null
  notes: string | null
  createdAt: string
  items: MyOrderItemDetail[]
}

/**
 * Détail d'une commande — vérifie explicitement `user_id = auth.uid()`
 * en plus du RLS, pour ne renvoyer `null` (404) proprement si le
 * client tente d'accéder à la commande d'un autre utilisateur.
 */
export async function getMyOrderById(orderId: string): Promise<MyOrderDetail | null> {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return null

  const { data: order, error } = await supabase
    .from('orders')
    .select('*')
    .eq('id', orderId)
    .eq('user_id', user.id)
    .maybeSingle()

  if (error || !order) {
    if (error) console.error('getMyOrderById error:', error.message)
    return null
  }

  const { data: items } = await supabase
    .from('order_items')
    .select('id, product_id, product_name, product_image_url, unit_price, quantity, subtotal')
    .eq('order_id', orderId)

  let reviewedProductIds = new Set<string>()
  if (order.status === 'delivered' && items && items.length > 0) {
    const productIds = items.map((i) => i.product_id).filter((id): id is string => !!id)
    if (productIds.length > 0) {
      const { data: reviews } = await supabase
        .from('reviews')
        .select('product_id')
        .eq('user_id', user.id)
        .in('product_id', productIds)
      reviewedProductIds = new Set((reviews ?? []).map((r) => r.product_id))
    }
  }

  return {
    id: order.id,
    status: order.status,
    subtotal: order.subtotal,
    shippingCost: order.shipping_cost,
    totalAmount: order.total_amount,
    shippingAddress: order.shipping_address as { fullName?: string; city?: string; address?: string } | null,
    contactPhone: order.contact_phone,
    notes: order.notes,
    createdAt: order.created_at,
    items: (items ?? []).map((item) => ({
      id: item.id,
      productId: item.product_id,
      productName: item.product_name,
      productImageUrl: item.product_image_url,
      unitPrice: item.unit_price,
      quantity: item.quantity,
      subtotal: item.subtotal,
      hasReview: item.product_id ? reviewedProductIds.has(item.product_id) : true,
    })),
  }
}
