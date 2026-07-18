import Link from 'next/link'
import Image from 'next/image'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { ArrowLeft, ImageOff } from 'lucide-react'
import { getMyOrderById } from '@/lib/data/account'
import { OrderStatusBadge } from '@/components/admin/order-status-badge'
import { ReviewForm } from '@/components/account/review-form'
import { formatPrice } from '@/lib/utils'

export const metadata: Metadata = { title: 'Détail de la commande' }

interface OrderDetailPageProps {
  params: { id: string }
}

function orderReference(id: string) {
  return `CMD-${id.slice(0, 8).toUpperCase()}`
}

export default async function OrderDetailPage({ params }: OrderDetailPageProps) {
  const order = await getMyOrderById(params.id)

  if (!order) {
    notFound()
  }

  return (
    <div>
      <Link
        href="/account/commandes"
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-ink-muted hover:text-ink"
      >
        <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
        Retour à mes commandes
      </Link>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl">{orderReference(order.id)}</h1>
          <p className="mt-1 text-sm text-ink-muted">
            {new Date(order.createdAt).toLocaleDateString('fr-FR', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            })}
          </p>
        </div>
        <OrderStatusBadge status={order.status} />
      </div>

      <div className="mt-8 space-y-4">
        {order.items.map((item) => (
          <div key={item.id} className="rounded-lg border border-border p-4">
            <div className="flex gap-4">
              <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded bg-paper-muted">
                {item.productImageUrl ? (
                  <Image
                    src={item.productImageUrl}
                    alt={item.productName}
                    fill
                    sizes="64px"
                    className="object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-ink-muted">
                    <ImageOff className="h-5 w-5" aria-hidden="true" />
                  </div>
                )}
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-ink">{item.productName}</p>
                <p className="mt-0.5 text-xs text-ink-muted">
                  {item.quantity} × {formatPrice(item.unitPrice)}
                </p>
              </div>
              <span className="font-display text-sm">{formatPrice(item.subtotal)}</span>
            </div>

            {order.status === 'delivered' && item.productId && (
              <div className="mt-4 border-t border-border pt-4">
                {item.hasReview ? (
                  <p className="text-xs text-accent">Tu as déjà laissé un avis pour ce produit ✓</p>
                ) : (
                  <ReviewForm productId={item.productId} orderId={order.id} productName={item.productName} />
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div>
          {order.shippingAddress && (
            <div className="text-sm text-ink-muted">
              <p className="font-medium text-ink">Livraison</p>
              <p>{order.shippingAddress.fullName}</p>
              <p>
                {order.shippingAddress.city}, {order.shippingAddress.address}
              </p>
              {order.contactPhone && <p>{order.contactPhone}</p>}
            </div>
          )}
        </div>

        <div className="space-y-2 rounded-lg border border-border p-4 sm:justify-self-end">
          <div className="flex justify-between gap-8 text-sm">
            <span className="text-ink-muted">Sous-total</span>
            <span className="text-ink">{formatPrice(order.subtotal)}</span>
          </div>
          <div className="flex justify-between gap-8 text-sm">
            <span className="text-ink-muted">Livraison</span>
            <span className="text-ink">{formatPrice(order.shippingCost)}</span>
          </div>
          <div className="flex justify-between gap-8 border-t border-border pt-2 font-display text-base">
            <span>Total</span>
            <span>{formatPrice(order.totalAmount)}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
