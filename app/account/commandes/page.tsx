import Link from 'next/link'
import type { Metadata } from 'next'
import { PackageSearch, ChevronRight } from 'lucide-react'
import { getMyOrders } from '@/lib/data/account'
import { OrderStatusBadge } from '@/components/admin/order-status-badge'
import { formatPrice } from '@/lib/utils'

export const metadata: Metadata = { title: 'Mes commandes' }

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
}

function orderReference(id: string) {
  return `CMD-${id.slice(0, 8).toUpperCase()}`
}

export default async function MyOrdersPage() {
  const orders = await getMyOrders()

  return (
    <div>
      <h1 className="font-display text-2xl">Mes commandes</h1>
      <p className="mt-1 text-sm text-ink-muted">
        {orders.length} commande{orders.length > 1 ? 's' : ''}
      </p>

      {orders.length === 0 ? (
        <div className="mt-10 flex flex-col items-center gap-3 rounded-lg border border-dashed border-border py-24 text-center">
          <PackageSearch className="h-8 w-8 text-ink-muted" aria-hidden="true" />
          <p className="text-sm text-ink-muted">Tu n'as pas encore passé de commande.</p>
          <Link href="/produits" className="text-sm text-accent hover:underline">
            Découvrir le catalogue
          </Link>
        </div>
      ) : (
        <ul className="mt-6 space-y-3">
          {orders.map((order) => (
            <li key={order.id}>
              <Link
                href={`/account/commandes/${order.id}`}
                className="flex flex-col gap-3 rounded-lg border border-border p-4 transition-colors hover:bg-paper-muted sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="font-mono text-xs text-ink-muted">{orderReference(order.id)}</p>
                  <p className="mt-1 text-sm text-ink-muted">
                    {order.itemCount} article{order.itemCount > 1 ? 's' : ''} · {formatDate(order.createdAt)}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <OrderStatusBadge status={order.status} />
                  <span className="font-display text-sm">{formatPrice(order.totalAmount)}</span>
                  <ChevronRight className="h-4 w-4 text-ink-muted" aria-hidden="true" />
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
