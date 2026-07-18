import type { OrderStatus } from '@/types/supabase'

export const ORDER_STATUS_OPTIONS: OrderStatus[] = [
  'pending',
  'paid',
  'processing',
  'shipped',
  'delivered',
  'cancelled',
  'refunded',
]

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  pending: 'En attente',
  paid: 'Payée',
  processing: 'En traitement',
  shipped: 'Expédiée',
  delivered: 'Livrée',
  cancelled: 'Annulée',
  refunded: 'Remboursée',
}

export const ORDER_STATUS_BADGE_VARIANT: Record<
  OrderStatus,
  'neutral' | 'accent' | 'gold' | 'success' | 'danger'
> = {
  pending: 'neutral',
  paid: 'accent',
  processing: 'gold',
  shipped: 'accent',
  delivered: 'success',
  cancelled: 'danger',
  refunded: 'danger',
}
