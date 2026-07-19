import Link from 'next/link'
import { Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { buildHref, cn } from '@/lib/utils'
import type { Category } from '@/types/supabase'

interface ProductFiltersProps {
  categories: Category[]
  searchParams: Record<string, string | undefined>
}

/**
 * Panneau de filtres entièrement fonctionnel sans JavaScript :
 * - recherche / prix / tri passent par un <form method="get"> natif
 * - les catégories sont de simples liens qui fusionnent les filtres
 *   déjà actifs (recherche, prix, tri) via buildHref()
 * Résultat : navigation instantanée, indexable, fonctionne sans JS.
 */
export function ProductFilters({ categories, searchParams }: ProductFiltersProps) {
  const currentCategory = searchParams.categorie
  const hasActiveFilters = Boolean(
    searchParams.q || searchParams.categorie || searchParams.tri || searchParams.min || searchParams.max
  )

  return (
    <div className="space-y-7">
      <div>
        <h3 className="mb-3 text-xs font-medium uppercase tracking-wide text-ink-muted">Catégories</h3>
        <div className="flex flex-wrap gap-2">
          <Link
            href={buildHref('/produits', searchParams, { categorie: undefined, page: undefined })}
            className={cn(
              'rounded-full border px-3.5 py-1.5 text-sm transition-colors',
              !currentCategory
                ? 'border-accent bg-accent text-accent-foreground'
                : 'border-border text-ink-muted hover:border-ink-muted hover:text-ink'
            )}
          >
            Toutes
          </Link>
          {categories.map((category) => (
            <Link
              key={category.id}
              href={buildHref('/produits', searchParams, { categorie: category.slug, page: undefined })}
              className={cn(
                'rounded-full border px-3.5 py-1.5 text-sm transition-colors',
                currentCategory === category.slug
                  ? 'border-accent bg-accent text-accent-foreground'
                  : 'border-border text-ink-muted hover:border-ink-muted hover:text-ink'
              )}
            >
              {category.name}
            </Link>
          ))}
        </div>
      </div>

      <div className="border-t border-border pt-6">
        <form method="get" action="/produits" className="space-y-5">
          {currentCategory && <input type="hidden" name="categorie" value={currentCategory} />}

          <div>
            <label htmlFor="q" className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-ink-muted">
              Rechercher
            </label>
            <div className="relative">
              <Search
                className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted"
                aria-hidden="true"
              />
              <input
                id="q"
                name="q"
                type="search"
                defaultValue={searchParams.q ?? ''}
                placeholder="Nom du produit..."
                className="h-11 w-full rounded border border-border bg-paper pl-9 pr-3 text-sm text-ink placeholder:text-ink-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 focus-visible:border-accent"
              />
            </div>
          </div>

          <fieldset>
            <legend className="mb-1.5 text-xs font-medium uppercase tracking-wide text-ink-muted">
              Prix (FCFA)
            </legend>
            <div className="flex items-center gap-2">
              <input
                type="number"
                name="min"
                min={0}
                inputMode="numeric"
                placeholder="Min"
                defaultValue={searchParams.min ?? ''}
                aria-label="Prix minimum"
                className="h-11 w-full rounded border border-border bg-paper px-3 text-sm text-ink placeholder:text-ink-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 focus-visible:border-accent"
              />
              <span className="text-ink-muted" aria-hidden="true">
                –
              </span>
              <input
                type="number"
                name="max"
                min={0}
                inputMode="numeric"
                placeholder="Max"
                defaultValue={searchParams.max ?? ''}
                aria-label="Prix maximum"
                className="h-11 w-full rounded border border-border bg-paper px-3 text-sm text-ink placeholder:text-ink-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 focus-visible:border-accent"
              />
            </div>
          </fieldset>

          <div>
            <label htmlFor="tri" className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-ink-muted">
              Trier par
            </label>
            <select
              id="tri"
              name="tri"
              defaultValue={searchParams.tri ?? ''}
              className="h-11 w-full rounded border border-border bg-paper px-3 text-sm text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 focus-visible:border-accent"
            >
              <option value="">Nos coups de cœur</option>
              <option value="nouveautes">Nouveautés</option>
              <option value="prix-asc">Prix croissant</option>
              <option value="prix-desc">Prix décroissant</option>
            </select>
          </div>

          <Button type="submit" variant="outline" className="w-full">
            Appliquer
          </Button>

          {hasActiveFilters && (
            <Link
              href="/produits"
              className="block text-center text-sm text-ink-muted underline-offset-4 hover:text-ink hover:underline"
            >
              Réinitialiser les filtres
            </Link>
          )}
        </form>
      </div>
    </div>
  )
}