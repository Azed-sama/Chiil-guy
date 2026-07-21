import Link from 'next/link'
import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react'
import { buildHref, cn } from '@/lib/utils'

interface PaginationProps {
  page: number
  totalPages: number
  searchParams: Record < string,
  string | undefined >
}

/**
 * Construit une liste compacte de pages à afficher : toujours la
 * première, la dernière, la page courante et ses voisines directes.
 * Les trous sont représentés par `'ellipsis'`. Évite un débordement
 * horizontal sur mobile quand il y a beaucoup de pages (ex: 40 pages
 * n'affiche plus 40 boutons collés).
 */
function getPageRange(page: number, totalPages: number): (number | 'ellipsis')[] {
  const range: (number | 'ellipsis')[] = []
  const delta = 1
  
  for (let p = 1; p <= totalPages; p++) {
    const isEdge = p === 1 || p === totalPages
    const isNearCurrent = Math.abs(p - page) <= delta
    
    if (isEdge || isNearCurrent) {
      range.push(p)
    } else if (range[range.length - 1] !== 'ellipsis') {
      range.push('ellipsis')
    }
  }
  
  return range
}

export function Pagination({ page, totalPages, searchParams }: PaginationProps) {
  if (totalPages <= 1) return null
  
  const pages = getPageRange(page, totalPages)
  
  return (
    <nav
      aria-label="Pagination du catalogue"
      className="mt-10 flex items-center justify-center gap-1 overflow-x-auto px-1 py-1"
    >
      <Link
        href={buildHref('/produits', searchParams, { page: String(Math.max(1, page - 1)) })}
        aria-disabled={page === 1}
        aria-label="Page précédente"
        className={cn(
          'flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-border transition-colors sm:h-9 sm:w-9',
          page === 1 ? 'pointer-events-none opacity-40' : 'hover:bg-paper-muted'
        )}
      >
        <ChevronLeft className="h-4 w-4" />
      </Link>

      {pages.map((p, i) =>
        p === 'ellipsis' ? (
          <span
            key={`ellipsis-${i}`}
            aria-hidden="true"
            className="flex h-10 w-10 shrink-0 items-center justify-center text-ink-muted sm:h-9 sm:w-9"
          >
            <MoreHorizontal className="h-4 w-4" />
          </span>
        ) : (
          <Link
            key={p}
            href={buildHref('/produits', searchParams, { page: String(p) })}
            aria-current={p === page ? 'page' : undefined}
            className={cn(
              'flex h-10 min-w-10 shrink-0 items-center justify-center rounded-lg border px-2 text-sm transition-colors sm:h-9 sm:min-w-9',
              p === page
                ? 'border-accent bg-accent text-accent-foreground'
                : 'border-border hover:bg-paper-muted'
            )}
          >
            {p}
          </Link>
        )
      )}

      <Link
        href={buildHref('/produits', searchParams, { page: String(Math.min(totalPages, page + 1)) })}
        aria-disabled={page === totalPages}
        aria-label="Page suivante"
        className={cn(
          'flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-border transition-colors sm:h-9 sm:w-9',
          page === totalPages ? 'pointer-events-none opacity-40' : 'hover:bg-paper-muted'
        )}
      >
        <ChevronRight className="h-4 w-4" />
      </Link>
    </nav>
  )
}