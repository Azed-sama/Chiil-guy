import { Badge } from '@/components/ui/badge'
import { ORDER_STATUS_LABELS, ORDER_STATUS_BADGE_VARIANT } from '@/lib/constants/order-status'
import type { OrderStatus } from '@/types/supabase'

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  return <Badge variant={ORDER_STATUS_BADGE_VARIANT[status]}>{ORDER_STATUS_LABELS[status]}</Badge>
}
