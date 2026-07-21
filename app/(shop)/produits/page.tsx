import type { Metadata } from 'next'
import { getProducts, type ProductSort } from '@/lib/data/products'
import { getCategories } from '@/lib/data/categories'
import { ProductGrid } from '@/components/shop/product-grid'
import { ProductFilters } from '@/components/shop/product-filters'
import { Pagination } from '@/components/shop/pagination'
import { ChevronDown } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Catalogue',
  description: 'Découvre toute notre collection de produits.',
}

interface CatalogPageProps {
  searchParams: {
    q ? : string
    categorie ? : string
    tri ? : string
    min ? : string
    max ? : string
    page ? : string
  }
}

const VALID_SORTS: ProductSort[] = ['prix-asc', 'prix-desc', 'nouveautes']

export default async function CatalogPage({ searchParams }: CatalogPageProps) {
  const page = Number(searchParams.page) > 0 ? Number(searchParams.page) : 1
  const tri = VALID_SORTS.includes(searchParams.tri as ProductSort) ?
    (searchParams.tri as ProductSort) :
    undefined
  
  const [{ products, count, pageSize }, categories] = await Promise.all([
    getProducts({
      q: searchParams.q,
      categorie: searchParams.categorie,
      tri,
      min: searchParams.min ? Number(searchParams.min) : undefined,
      max: searchParams.max ? Number(searchParams.max) : undefined,
      page,
    }),
    getCategories(),
  ])
  
  const totalPages = Math.max(1, Math.ceil(count / pageSize))
  const filtersContent = <ProductFilters categories={categories} searchParams={searchParams} />
  const activeFilterCount = [
    searchParams.q,
    searchParams.categorie,
    searchParams.tri,
    searchParams.min,
    searchParams.max,
  ].filter(Boolean).length
  
  return (
    <main>
      <section className="border-b border-border bg-paper-muted">
        <div className="container py-12">
          <p className="font-mono text-xs uppercase tracking-widest text-accent">Catalogue</p>
          <h1 className="mt-2 font-display text-4xl">Toute la collection</h1>
        </div>
      </section>

      <div className="container grid grid-cols-1 gap-10 py-10 lg:grid-cols-[16rem_1fr]">
        <aside>
          {/* Mobile : panneau repliable, sans JavaScript (natif HTML) */}
          <details className="group mb-6 rounded-lg border border-border lg:hidden">
            <summary className="flex cursor-pointer list-none items-center justify-between px-4 py-3 text-sm font-medium">
              <span className="flex items-center gap-2">
                Filtres et tri
                {activeFilterCount > 0 && (
                  <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-accent px-1.5 text-xs font-medium text-accent-foreground">
                    {activeFilterCount}
                  </span>
                )}
              </span>
              <ChevronDown className="h-4 w-4 transition-transform group-open:rotate-180" />
            </summary>
            <div className="border-t border-border p-4">{filtersContent}</div>
          </details>

          {/* Desktop : toujours visible */}
          <div className="hidden lg:block">{filtersContent}</div>
        </aside>

        <div>
          <p className="mb-6 text-sm text-ink-muted">
            {count} produit{count > 1 ? 's' : ''}
          </p>
          <ProductGrid products={products} />
          <Pagination page={page} totalPages={totalPages} searchParams={searchParams} />
        </div>
      </div>
    </main>
  )
}