import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, PackageSearch } from 'lucide-react'
import { getOrderById } from '@/lib/data/admin/orders'
import { OrderStatusBadge } from '@/components/admin/order-status-badge'
import { OrderStatusSelect } from '@/components/admin/order-status-select'
import { ExportReceiptButton } from '@/components/admin/export-receipt-button'
import { formatPrice } from '@/lib/utils'

export const metadata: Metadata = { title: 'Détail commande — Administration' }

function formatOrderDate(iso: string) {
  return new Date(iso).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function orderReference(id: string) {
  return `CMD-${id.slice(0, 8).toUpperCase()}`
}

function formatShippingAddress(address: unknown): string {
  if (!address || typeof address !== 'object') return 'Non renseignée'
  const a = address as Record<string, unknown>
  const parts = [a.street, a.city, a.region, a.country].filter(
    (part): part is string => typeof part === 'string' && part.length > 0
  )
  return parts.length > 0 ? parts.join(', ') : 'Non renseignée'
}

export default async function AdminOrderDetailPage({ params }: { params: { id: string } }) {
  const order = await getOrderById(params.id)

  if (!order) {
    notFound()
  }

  return (
    <main className="container py-8">
      <Link
        href="/admin/orders"
        className="inline-flex items-center gap-1.5 text-sm text-ink-muted transition-colors hover:text-ink"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        Retour aux commandes
      </Link>

      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="font-display text-2xl">{orderReference(order.id)}</h1>
          <p className="mt-1 text-sm text-ink-muted">{formatOrderDate(order.createdAt)}</p>
        </div>
        <OrderStatusBadge status={order.status} />
      </div>

      {/* Infos client */}
      <div className="mt-6 rounded-lg border border-border p-4">
        <h2 className="text-sm font-medium uppercase tracking-wide text-ink-muted">Client</h2>
        <div className="mt-3 space-y-1.5 text-sm">
          <p className="font-medium text-ink">{order.customerName}</p>
          {order.contactEmail && <p className="text-ink-muted">{order.contactEmail}</p>}
          {order.contactPhone && <p className="text-ink-muted">{order.contactPhone}</p>}
          <p className="text-ink-muted">{formatShippingAddress(order.shippingAddress)}</p>
        </div>
      </div>

      {/* Articles */}
      <div className="mt-6 rounded-lg border border-border p-4">
        <h2 className="text-sm font-medium uppercase tracking-wide text-ink-muted">
          Articles ({order.items.length})
        </h2>

        {order.items.length === 0 ? (
          <div className="mt-4 flex flex-col items-center gap-2 py-8 text-center">
            <PackageSearch className="h-6 w-6 text-ink-muted" aria-hidden="true" />
            <p className="text-sm text-ink-muted">Aucun article trouvé pour cette commande.</p>
          </div>
        ) : (
          <div className="mt-3 divide-y divide-border">
            {order.items.map((item) => (
              <div key={item.id} className="flex items-center justify-between gap-3 py-3">
                <div>
                  <p className="text-sm font-medium text-ink">{item.productName}</p>
                  <p className="text-xs text-ink-muted">
                    {item.quantity} × {formatPrice(item.unitPrice)}
                  </p>
                </div>
                <p className="font-display text-sm">{formatPrice(item.subtotal)}</p>
              </div>
            ))}
          </div>
        )}

        <div className="mt-4 space-y-1.5 border-t border-border pt-4 text-sm">
          <div className="flex items-center justify-between text-ink-muted">
            <span>Sous-total</span>
            <span>{formatPrice(order.subtotal)}</span>
          </div>
          <div className="flex items-center justify-between text-ink-muted">
            <span>Livraison</span>
            <span>{formatPrice(order.shippingCost)}</span>
          </div>
          <div className="flex items-center justify-between font-display text-base text-ink">
            <span>Total</span>
            <span>{formatPrice(order.totalAmount)}</span>
          </div>
        </div>
      </div>

      {order.notes && (
        <div className="mt-6 rounded-lg border border-border p-4">
          <h2 className="text-sm font-medium uppercase tracking-wide text-ink-muted">Notes</h2>
          <p className="mt-2 text-sm text-ink-muted">{order.notes}</p>
        </div>
      )}

      {/* Actions */}
      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="sm:w-64">
          <OrderStatusSelect orderId={order.id} status={order.status} />
        </div>
        <ExportReceiptButton order={order} />
      </div>
    </main>
  )
}