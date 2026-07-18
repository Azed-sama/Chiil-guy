import type { Metadata } from 'next'
import { PackageSearch } from 'lucide-react'
import { getAllOrders } from '@/lib/data/admin/orders'
import { OrderStatusBadge } from '@/components/admin/order-status-badge'
import { OrderStatusSelect } from '@/components/admin/order-status-select'
import { formatPrice } from '@/lib/utils'

export const metadata: Metadata = { title: 'Commandes — Administration' }

function formatOrderDate(iso: string) {
  return new Date(iso).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })
}

function orderReference(id: string) {
  return `CMD-${id.slice(0, 8).toUpperCase()}`
}

export default async function AdminOrdersPage() {
  const orders = await getAllOrders()

  return (
    <main className="container py-8">
      <h1 className="font-display text-2xl">Commandes</h1>
      <p className="mt-1 text-sm text-ink-muted">
        {orders.length} commande{orders.length > 1 ? 's' : ''} au total
      </p>

      {orders.length === 0 ? (
        <div className="mt-10 flex flex-col items-center gap-3 rounded-lg border border-dashed border-border py-24 text-center">
          <PackageSearch className="h-8 w-8 text-ink-muted" aria-hidden="true" />
          <p className="text-sm text-ink-muted">Aucune commande pour le moment.</p>
        </div>
      ) : (
        <>
          {/* Vue tableau — écrans sm et plus */}
          <div className="mt-6 hidden overflow-x-auto rounded-lg border border-border sm:block">
            <table className="w-full text-left text-sm">
              <thead className="bg-paper-muted text-xs uppercase tracking-wide text-ink-muted">
                <tr>
                  <th scope="col" className="px-4 py-3 font-medium">
                    Référence
                  </th>
                  <th scope="col" className="px-4 py-3 font-medium">
                    Client
                  </th>
                  <th scope="col" className="px-4 py-3 font-medium">
                    Articles
                  </th>
                  <th scope="col" className="px-4 py-3 font-medium">
                    Total
                  </th>
                  <th scope="col" className="px-4 py-3 font-medium">
                    Date
                  </th>
                  <th scope="col" className="px-4 py-3 font-medium">
                    Statut
                  </th>
                  <th scope="col" className="px-4 py-3 font-medium">
                    Modifier
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {orders.map((order) => (
                  <tr key={order.id} className="align-middle">
                    <td className="whitespace-nowrap px-4 py-3 font-mono text-xs text-ink-muted">
                      {orderReference(order.id)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-medium text-ink">{order.customerName}</div>
                      {order.contactPhone && (
                        <div className="text-xs text-ink-muted">{order.contactPhone}</div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-ink-muted">{order.itemCount}</td>
                    <td className="whitespace-nowrap px-4 py-3 font-display">
                      {formatPrice(order.totalAmount)}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-ink-muted">
                      {formatOrderDate(order.createdAt)}
                    </td>
                    <td className="px-4 py-3">
                      <OrderStatusBadge status={order.status} />
                    </td>
                    <td className="px-4 py-3">
                      <OrderStatusSelect orderId={order.id} status={order.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Vue cartes — mobile */}
          <div className="mt-6 space-y-4 sm:hidden">
            {orders.map((order) => (
              <div key={order.id} className="rounded-lg border border-border p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-mono text-xs text-ink-muted">{orderReference(order.id)}</p>
                    <p className="mt-0.5 font-medium text-ink">{order.customerName}</p>
                    {order.contactPhone && <p className="text-xs text-ink-muted">{order.contactPhone}</p>}
                  </div>
                  <OrderStatusBadge status={order.status} />
                </div>

                <div className="mt-3 flex items-center justify-between text-sm">
                  <span className="text-ink-muted">
                    {order.itemCount} article{order.itemCount > 1 ? 's' : ''}
                  </span>
                  <span className="font-display text-base">{formatPrice(order.totalAmount)}</span>
                </div>

                <p className="mt-1 text-xs text-ink-muted">{formatOrderDate(order.createdAt)}</p>

                <div className="mt-3">
                  <OrderStatusSelect orderId={order.id} status={order.status} />
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </main>
  )
}
