import Link from 'next/link'
import Image from 'next/image'
import { ImageOff } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { formatPrice, getEffectivePrice, cn } from '@/lib/utils'
import type { ProductWithRelations } from '@/lib/data/products'

export function ProductCard({ product }: { product: ProductWithRelations }) {
  const { price, originalPrice, isOnSale, discountPercent } = getEffectivePrice(product)
  const cover = product.images[0]
  const isOutOfStock = product.stock_quantity <= 0

  return (
    <Link
      href={`/produits/${product.slug}`}
      className="group flex flex-col overflow-hidden rounded-lg border border-border bg-paper transition-shadow hover:shadow-md"
    >
      <div className="relative aspect-square overflow-hidden bg-paper-muted">
        {cover ? (
          <Image
            src={cover.url}
            alt={cover.alt_text || product.name}
            fill
            sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
            className={cn(
              'object-cover transition-transform duration-500 group-hover:scale-105',
              isOutOfStock && 'opacity-60 grayscale'
            )}
          />
        ) : (
          <div className="flex h-full items-center justify-center text-ink-muted">
            <ImageOff className="h-8 w-8" aria-hidden="true" />
          </div>
        )}

        <div className="absolute left-3 top-3 flex flex-col gap-1.5">
          {product.is_featured && <Badge variant="gold">En vedette</Badge>}
          {isOnSale && <Badge variant="danger">-{discountPercent}%</Badge>}
        </div>

        {isOutOfStock && (
          <div className="absolute bottom-3 left-3">
            <Badge variant="neutral">Rupture de stock</Badge>
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-1.5 p-4">
        {product.category && (
          <span className="text-xs uppercase tracking-wide text-ink-muted">{product.category.name}</span>
        )}
        <h3 className="line-clamp-2 text-sm font-medium text-ink">{product.name}</h3>

        <div className="mt-auto flex items-baseline gap-2 pt-2">
          <span className="font-display text-lg">{formatPrice(price)}</span>
          {isOnSale && (
            <span className="text-sm text-ink-muted line-through">{formatPrice(originalPrice)}</span>
          )}
        </div>
      </div>
    </Link>
  )
}
