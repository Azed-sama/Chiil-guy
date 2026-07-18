'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { updateOrderStatus } from '@/app/actions/admin'
import { ORDER_STATUS_LABELS, ORDER_STATUS_OPTIONS } from '@/lib/constants/order-status'
import { cn } from '@/lib/utils'
import type { OrderStatus } from '@/types/supabase'

export function OrderStatusSelect({ orderId, status }: { orderId: string; status: OrderStatus }) {
  const router = useRouter()
  const [isPending, setIsPending] = useState(false)
  const [currentStatus, setCurrentStatus] = useState(status)

  async function handleChange(nextStatus: OrderStatus) {
    if (nextStatus === currentStatus) return

    // Avertissement explicite : ce changement décrémente le stock.
    if (
      nextStatus === 'processing' &&
      !window.confirm(
        'Confirmer le passage à "En traitement" ? Le stock des produits de cette commande sera décrémenté automatiquement.'
      )
    ) {
      return
    }

    setIsPending(true)
    const result = await updateOrderStatus({ orderId, status: nextStatus })
    setIsPending(false)

    if (!result.success) {
      toast.error(result.error)
      return
    }

    setCurrentStatus(nextStatus)
    toast.success(`Statut mis à jour : ${ORDER_STATUS_LABELS[nextStatus]}`)
    router.refresh()
  }

  return (
    <select
      value={currentStatus}
      disabled={isPending}
      onChange={(e) => handleChange(e.target.value as OrderStatus)}
      aria-label="Modifier le statut de la commande"
      className={cn(
        'h-9 rounded border border-border bg-paper px-2 text-sm text-ink transition-colors',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 focus-visible:border-accent',
        isPending && 'opacity-50'
      )}
    >
      {ORDER_STATUS_OPTIONS.map((option) => (
        <option key={option} value={option}>
          {ORDER_STATUS_LABELS[option]}
        </option>
      ))}
    </select>
  )
}
