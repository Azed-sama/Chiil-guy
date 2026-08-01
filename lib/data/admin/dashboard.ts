import { createClient } from '@/lib/supabase/server'

export interface DashboardStats {
  salesToday: number
  salesThisWeek: number
  salesThisMonth: number
  pendingOrdersCount: number
  topProducts: { productName: string; totalQuantity: number; totalRevenue: number }[]
}

function startOfDayIso(date: Date): string {
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  return d.toISOString()
}

function startOfWeekIso(date: Date): string {
  const d = new Date(date)
  const day = d.getDay() // 0 = dimanche
  const diffToMonday = day === 0 ? 6 : day - 1
  d.setDate(d.getDate() - diffToMonday)
  d.setHours(0, 0, 0, 0)
  return d.toISOString()
}

function startOfMonthIso(date: Date): string {
  const d = new Date(date.getFullYear(), date.getMonth(), 1)
  return d.toISOString()
}

// Statuts considérés comme une vente effective (on exclut les commandes
// annulées/remboursées des totaux de chiffre d'affaires).
const REVENUE_STATUSES = ['paid', 'processing', 'shipped', 'delivered']

/**
 * Statistiques clés pour le tableau de bord admin : ventes sur
 * différentes périodes, commandes en attente, et produits les plus
 * vendus (calculé sur les order_items des 90 derniers jours pour
 * rester pertinent et limiter le volume de données).
 *
 * Protégée par le RLS (`orders_select_admin`) et le middleware admin.
 */
export async function getDashboardStats(): Promise<DashboardStats> {
  const supabase = createClient()
  const now = new Date()

  const todayIso = startOfDayIso(now)
  const weekIso = startOfWeekIso(now)
  const monthIso = startOfMonthIso(now)
  const ninetyDaysAgoIso = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000).toISOString()

  const [{ data: monthOrders, error: monthError }, { count: pendingCount }, { data: recentItems }] =
    await Promise.all([
      supabase
        .from('orders')
        .select('total_amount, status, created_at')
        .gte('created_at', monthIso)
        .in('status', REVENUE_STATUSES),
      supabase.from('orders').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
      supabase
        .from('order_items')
        .select('product_name, quantity, subtotal, orders!inner(status, created_at)')
        .gte('orders.created_at', ninetyDaysAgoIso)
        .in('orders.status', REVENUE_STATUSES),
    ])

  if (monthError) {
    console.error('getDashboardStats error:', monthError.message)
  }

  let salesToday = 0
  let salesThisWeek = 0
  let salesThisMonth = 0

  for (const order of monthOrders ?? []) {
    salesThisMonth += order.total_amount
    if (order.created_at >= weekIso) salesThisWeek += order.total_amount
    if (order.created_at >= todayIso) salesToday += order.total_amount
  }

  const productTotals = new Map<string, { totalQuantity: number; totalRevenue: number }>()
  for (const item of recentItems ?? []) {
    const existing = productTotals.get(item.product_name) ?? { totalQuantity: 0, totalRevenue: 0 }
    existing.totalQuantity += item.quantity
    existing.totalRevenue += item.subtotal
    productTotals.set(item.product_name, existing)
  }

  const topProducts = [...productTotals.entries()]
    .map(([productName, totals]) => ({ productName, ...totals }))
    .sort((a, b) => b.totalQuantity - a.totalQuantity)
    .slice(0, 5)

  return {
    salesToday,
    salesThisWeek,
    salesThisMonth,
    pendingOrdersCount: pendingCount ?? 0,
    topProducts,
  }
}