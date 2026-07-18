import Link from 'next/link'
import type { Metadata } from 'next'
import Image from 'next/image'
import { Plus, Star, ImageOff, Pencil } from 'lucide-react'
import { getAllProducts } from '@/lib/data/admin/products'
import { DeleteProductButton } from '@/components/admin/delete-product-button'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { formatPrice } from '@/lib/utils'

export const metadata: Metadata = { title: 'Produits — Administration' }

function StockBadge({ stock }: { stock: number }) {
  if (stock <= 0) return <Badge variant="danger">Rupture</Badge>
  if (stock <= 5) return <Badge variant="gold">Stock faible ({stock})</Badge>
  return <Badge variant="neutral">{stock} en stock</Badge>
}

export default async function AdminProductsPage() {
  const products = await getAllProducts()

  return (
    <main className="container py-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl">Produits</h1>
          <p className="mt-1 text-sm text-ink-muted">
            {products.length} produit{products.length > 1 ? 's' : ''} au catalogue
          </p>
        </div>
        <Button asChild size="lg" className="w-full sm:w-auto">
          <Link href="/admin/products/nouveau">
            <Plus className="h-4 w-4" aria-hidden="true" />
            Ajouter un produit
          </Link>
        </Button>
      </div>

      {products.length === 0 ? (
        <div className="mt-10 flex flex-col items-center gap-3 rounded-lg border border-dashed border-border py-24 text-center">
          <ImageOff className="h-8 w-8 text-ink-muted" aria-hidden="true" />
          <p className="text-sm text-ink-muted">Aucun produit pour le moment.</p>
          <Button asChild className="mt-2">
            <Link href="/admin/products/nouveau">Ajouter ton premier produit</Link>
          </Button>
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => (
            <div key={product.id} className="flex gap-3 rounded-lg border border-border p-3">
              <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded bg-paper-muted">
                {product.imageUrl ? (
                  <Image
                    src={product.imageUrl}
                    alt={product.name}
                    fill
                    sizes="80px"
                    className="object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-ink-muted">
                    <ImageOff className="h-5 w-5" aria-hidden="true" />
                  </div>
                )}
              </div>

              <div className="flex min-w-0 flex-1 flex-col justify-between">
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <h2 className="line-clamp-2 text-sm font-medium text-ink">{product.name}</h2>
                    {product.isFeatured && (
                      <Star className="h-4 w-4 shrink-0 fill-gold text-gold" aria-hidden="true" />
                    )}
                  </div>
                  {product.categoryName && (
                    <p className="mt-0.5 text-xs text-ink-muted">{product.categoryName}</p>
                  )}
                  <div className="mt-1.5 flex items-baseline gap-2">
                    <span className="font-display text-sm">
                      {formatPrice(product.salePrice ?? product.price)}
                    </span>
                    {product.salePrice && (
                      <span className="text-xs text-ink-muted line-through">
                        {formatPrice(product.price)}
                      </span>
                    )}
                  </div>
                </div>

                <div className="mt-2 flex flex-wrap items-center gap-1.5">
                  <StockBadge stock={product.stockQuantity} />
                  {!product.isActive && <Badge variant="neutral">Désactivé</Badge>}
                </div>
              </div>

              <div className="flex shrink-0 flex-col gap-1">
                <Button asChild variant="ghost" size="icon" aria-label={`Modifier ${product.name}`}>
                  <Link href={`/admin/products/${product.id}/modifier`}>
                    <Pencil className="h-4 w-4" />
                  </Link>
                </Button>
                <DeleteProductButton productId={product.id} productName={product.name} />
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  )
}
