import Link from 'next/link'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { ChevronRight } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { getProductBySlug, getRelatedProducts } from '@/lib/data/products'
import { getProductReviews, getProductRatingSummary } from '@/lib/data/reviews'
import { ProductGallery } from '@/components/shop/product-gallery'
import { AddToCartButton } from '@/components/shop/add-to-cart-button'
import { RatingStars } from '@/components/shop/rating-stars'
import { ProductGrid } from '@/components/shop/product-grid'
import { Badge } from '@/components/ui/badge'
import { formatPrice, getEffectivePrice } from '@/lib/utils'

interface ProductPageProps {
  params: { slug: string }
}

export async function generateMetadata({ params }: ProductPageProps): Promise < Metadata > {
  const product = await getProductBySlug(params.slug)
  
  if (!product) {
    return { title: 'Produit introuvable' }
  }
  
  return {
    title: product.name,
    description: product.description?.slice(0, 155) || undefined,
    openGraph: {
      images: product.images[0] ? [{ url: product.images[0].url }] : undefined,
    },
  }
}

export default async function ProductPage({ params }: ProductPageProps) {
  const product = await getProductBySlug(params.slug)
  
  if (!product) {
    notFound()
  }
  
  const [relatedProducts, reviews, ratingSummary, { data: { user } }] = await Promise.all([
    getRelatedProducts(product.category_id, product.id),
    getProductReviews(product.id),
    getProductRatingSummary(product.id),
    createClient().auth.getUser(),
  ])
  
  const { price, originalPrice, isOnSale, discountPercent } = getEffectivePrice(product)
  
  return (
    <main className="container py-8">
      {/* Fil d'Ariane */}
      <nav aria-label="Fil d'Ariane" className="mb-8 flex items-center gap-1.5 text-sm text-ink-muted">
        <Link href="/" className="hover:text-ink">
          Accueil
        </Link>
        <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
        <Link href="/produits" className="hover:text-ink">
          Catalogue
        </Link>
        {product.category && (
          <>
            <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
            <Link href={`/produits?categorie=${product.category.slug}`} className="hover:text-ink">
              {product.category.name}
            </Link>
          </>
        )}
        <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
        <span className="truncate text-ink">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 gap-10 lg:grid-cols-2 lg:gap-16">
        <ProductGallery images={product.images} productName={product.name} />

        <div>
          <div className="mb-3 flex flex-wrap gap-2">
            {product.is_featured && <Badge variant="gold">En vedette</Badge>}
            {isOnSale && <Badge variant="danger">-{discountPercent}%</Badge>}
          </div>

          <h1 className="font-display text-3xl leading-tight balance">{product.name}</h1>

          {ratingSummary.count > 0 && (
            <div className="mt-3 flex items-center gap-2">
              <RatingStars rating={ratingSummary.average} />
              <span className="text-sm text-ink-muted">
                {ratingSummary.average.toFixed(1)} ({ratingSummary.count} avis)
              </span>
            </div>
          )}

          <div className="mt-5 flex items-baseline gap-3">
            <span className="font-display text-3xl">{formatPrice(price)}</span>
            {isOnSale && (
              <span className="text-lg text-ink-muted line-through">{formatPrice(originalPrice)}</span>
            )}
          </div>

          <p className="mt-1 text-sm text-ink-muted">
            {product.stock_quantity > 0
              ? product.stock_quantity <= 5
                ? `Il ne reste que ${product.stock_quantity} exemplaire${product.stock_quantity > 1 ? 's' : ''}`
                : 'En stock'
              : 'Actuellement indisponible'}
          </p>

          {product.description && (
            <p className="mt-6 whitespace-pre-line leading-relaxed text-ink-muted">{product.description}</p>
          )}

          <div className="mt-8">
            <AddToCartButton
              productId={product.id}
              stockQuantity={product.stock_quantity}
              isAuthenticated={!!user}
            />
          </div>
        </div>
      </div>

      {/* Avis clients */}
      <section className="mt-20 border-t border-border pt-12">
        <h2 className="font-display text-2xl">Avis clients</h2>

        {reviews.length === 0 ? (
          <p className="mt-4 text-sm text-ink-muted">
            Aucun avis pour ce produit pour le moment. Les avis sont laissés uniquement par des clients ayant
            reçu leur commande.
          </p>
        ) : (
          <ul className="mt-6 space-y-6">
            {reviews.map((review) => (
              <li key={review.id} className="border-b border-border pb-6 last:border-0">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <RatingStars rating={review.rating} size={14} />
                    <span className="text-sm font-medium text-ink">{review.authorName}</span>
                  </div>
                  <time dateTime={review.created_at} className="text-xs text-ink-muted">
                    {new Date(review.created_at).toLocaleDateString('fr-FR', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </time>
                </div>
                {review.comment && <p className="mt-2 text-sm text-ink-muted">{review.comment}</p>}
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Produits similaires */}
      {relatedProducts.length > 0 && (
        <section className="mt-20 border-t border-border pt-12">
          <h2 className="mb-6 font-display text-2xl">Produits similaires</h2>
          <ProductGrid products={relatedProducts} isAuthenticated={!!user} />
        </section>
      )}
    </main>
  )
}