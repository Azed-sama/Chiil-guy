import Link from 'next/link'
import Image from 'next/image'
import { ImageOff } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { QuickAddButton } from '@/components/shop/quick-add-button'
import { formatPrice, getEffectivePrice, cn } from '@/lib/utils'
import type { ProductWithRelations } from '@/lib/data/products'

interface ProductCardProps {
  product: ProductWithRelations
}

export function ProductCard({ product }: ProductCardProps) {
  const { price, originalPrice, isOnSale, discountPercent } = getEffectivePrice(product)
  const cover = product.images[0]
  const isOutOfStock = product.stock_quantity <= 0
  
  return (
    <Link
      href={`/produits/${product.slug}`}
      className={cn(
        'group relative flex flex-col overflow-hidden rounded-xl border border-border bg-paper',
        'transition-all duration-300 ease-out will-change-transform',
        'hover:-translate-y-1.5 hover:border-transparent hover:shadow-premium-lg'
      )}
    >
      <div className="relative aspect-square overflow-hidden bg-paper-muted">
        {cover ? (
          <Image
            src={cover.url}
            alt={cover.alt_text || product.name}
            fill
            sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
            className={cn(
              'object-cover transition-transform duration-700 ease-out group-hover:scale-110',
              isOutOfStock && 'opacity-60 grayscale'
            )}
          />
        ) : (
          <div className="flex h-full items-center justify-center text-ink-muted">
            <ImageOff className="h-8 w-8" aria-hidden="true" />
          </div>
        )}

        {/* Voile léger au hover, pour que le bouton quick-add reste lisible */}
        <div
          className="absolute inset-0 bg-gradient-to-t from-ink/25 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          aria-hidden="true"
        />

        <div className="absolute left-3 top-3 flex flex-col gap-1.5">
          {product.is_featured && <Badge variant="gold">En vedette</Badge>}
          {isOnSale && <Badge variant="danger">-{discountPercent}%</Badge>}
        </div>

        {isOutOfStock && (
          <div className="absolute bottom-3 left-3">
            <Badge variant="neutral">Rupture de stock</Badge>
          </div>
        )}

        {!isOutOfStock && (
          <div
            className={cn(
              'absolute bottom-3 right-3 translate-y-2 opacity-0 transition-all duration-300',
              'group-hover:translate-y-0 group-hover:opacity-100',
              // Toujours visible sur mobile (pas de hover tactile fiable)
              'max-md:translate-y-0 max-md:opacity-100'
            )}
          >
            <QuickAddButton productId={product.id} />
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-1.5 p-4">
        {product.category && (
          <span className="text-xs uppercase tracking-wide text-ink-muted">{product.category.name}</span>
        )}
        <h3 className="line-clamp-2 text-sm font-medium text-ink transition-colors group-hover:text-accent">
          {product.name}
        </h3>

        <div className="mt-auto flex items-baseline gap-2 pt-2">
          <span className={cn('font-display text-lg', isOnSale && 'text-danger')}>
            {formatPrice(price)}
          </span>
          {isOnSale && (
            <span className="text-sm text-ink-muted line-through">{formatPrice(originalPrice)}</span>
          )}
        </div>
      </div>
    </Link>
  )
}