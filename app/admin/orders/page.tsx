import type { Metadata } from 'next'
import Link from 'next/link'
import { getAllOrders } from '@/lib/data/admin/orders'
import { OrderStatusBadge } from '@/components/admin/order-status-badge'
import { OrderStatusSelect } from '@/components/admin/order-status-select'
import { DeleteOrderButton } from '@/components/admin/delete-order-button'
import { AdminEmptyState } from '@/components/admin/admin-empty-state'
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
    <div>
      <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-display text-2xl text-ink sm:text-3xl">Commandes</h1>
          <p className="mt-1.5 text-sm text-ink-muted">
            {orders.length} commande{orders.length > 1 ? 's' : ''} au total
          </p>
        </div>
      </div>

      {orders.length === 0 ? (
        <div className="mt-6">
          <AdminEmptyState
            title="Aucune commande pour le moment"
            description="Dès qu'un client passera commande sur la boutique, elle apparaîtra ici avec tous les détails nécessaires pour la traiter."
          />
        </div>
      ) : (
        <>
          {/* Vue tableau — écrans lg et plus */}
          <div className="mt-6 hidden overflow-hidden rounded-xl border border-border bg-paper-muted lg:block">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-border text-xs uppercase tracking-wide text-ink-muted">
                <tr>
                  <th scope="col" className="px-5 py-3.5 font-medium">
                    Référence
                  </th>
                  <th scope="col" className="px-5 py-3.5 font-medium">
                    Client
                  </th>
                  <th scope="col" className="px-5 py-3.5 font-medium">
                    Articles
                  </th>
                  <th scope="col" className="px-5 py-3.5 font-medium">
                    Total
                  </th>
                  <th scope="col" className="px-5 py-3.5 font-medium">
                    Date
                  </th>
                  <th scope="col" className="px-5 py-3.5 font-medium">
                    Statut
                  </th>
                  <th scope="col" className="px-5 py-3.5 font-medium">
                    Modifier
                  </th>
                  <th scope="col" className="px-5 py-3.5 font-medium">
                    <span className="sr-only">Voir</span>
                  </th>
                  <th scope="col" className="px-5 py-3.5 font-medium">
                    <span className="sr-only">Supprimer</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {orders.map((order) => (
                  <tr key={order.id} className="align-middle transition-colors hover:bg-paper">
                    <td className="whitespace-nowrap px-5 py-4 font-mono text-xs text-ink-muted">
                      {orderReference(order.id)}
                    </td>
                    <td className="px-5 py-4">
                      <div className="font-medium text-ink">{order.customerName}</div>
                      {order.contactPhone && (
                        <div className="text-xs text-ink-muted">{order.contactPhone}</div>
                      )}
                    </td>
                    <td className="px-5 py-4 text-ink-muted">{order.itemCount}</td>
                    <td className="whitespace-nowrap px-5 py-4 font-display">
                      {formatPrice(order.totalAmount)}
                    </td>
                    <td className="whitespace-nowrap px-5 py-4 text-ink-muted">
                      {formatOrderDate(order.createdAt)}
                    </td>
                    <td className="px-5 py-4">
                      <OrderStatusBadge status={order.status} />
                    </td>
                    <td className="px-5 py-4">
                      <OrderStatusSelect orderId={order.id} status={order.status} />
                    </td>
                    <td className="px-5 py-4">
                      <Link
                        href={`/admin/orders/${order.id}`}
                        className="text-sm text-accent transition-colors hover:text-accent/80 hover:underline"
                      >
                        Voir
                      </Link>
                    </td>
                    <td className="px-5 py-4">
                      <DeleteOrderButton orderId={order.id} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Vue cartes — mobile et tablette */}
          <div className="mt-6 space-y-3.5 lg:hidden">
            {orders.map((order) => (
              <div
                key={order.id}
                className="rounded-xl border border-border bg-paper-muted p-4 transition-shadow hover:shadow-xs"
              >
                <div className="flex items-start justify-between gap-3">
                  <Link href={`/admin/orders/${order.id}`} className="min-w-0">
                    <p className="font-mono text-xs text-ink-muted">{orderReference(order.id)}</p>
                    <p className="mt-0.5 font-medium text-ink">{order.customerName}</p>
                    {order.contactPhone && <p className="text-xs text-ink-muted">{order.contactPhone}</p>}
                  </Link>
                  <OrderStatusBadge status={order.status} />
                </div>

                <div className="mt-3 flex items-center justify-between text-sm">
                  <span className="text-ink-muted">
                    {order.itemCount} article{order.itemCount > 1 ? 's' : ''}
                  </span>
                  <span className="font-display text-base text-ink">{formatPrice(order.totalAmount)}</span>
                </div>

                <p className="mt-1 text-xs text-ink-muted">{formatOrderDate(order.createdAt)}</p>

                <div className="mt-3.5 flex items-center gap-2">
                  <div className="flex-1">
                    <OrderStatusSelect orderId={order.id} status={order.status} />
                  </div>
                  <DeleteOrderButton orderId={order.id} />
                </div>

                <Link
                  href={`/admin/orders/${order.id}`}
                  className="mt-3 block rounded-lg border border-border py-2 text-center text-sm text-accent transition-colors hover:bg-paper"
                >
                  Voir le détail
                </Link>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}