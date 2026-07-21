import { SearchX } from 'lucide-react'
import { ProductCard } from '@/components/shop/product-card'
import { AnimatedGrid } from '@/components/shop/animated-grid'
import type { ProductWithRelations } from '@/lib/data/products'

interface ProductGridProps {
  products: ProductWithRelations[]
}

export function ProductGrid({ products }: ProductGridProps) {
  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed border-border py-24 text-center">
        <SearchX className="h-8 w-8 text-ink-muted" aria-hidden="true" />
        <p className="font-display text-lg">Aucun produit trouvé</p>
        <p className="max-w-xs text-sm text-ink-muted">
          Essaie d'élargir ta recherche ou de retirer certains filtres.
        </p>
      </div>
    )
  }
  
  return (
    <AnimatedGrid>
      {products.map((product, index) => (
        <ProductCard key={product.id} product={product} priority={index < 4} />
      ))}
    </AnimatedGrid>
  )
}