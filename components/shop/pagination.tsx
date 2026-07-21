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
 * Construit la liste des pages à afficher, avec troncature ("...")
 * quand il y a trop de pages. Garde toujours : la première page, la
 * dernière page, et une fenêtre de pages autour de la page courante.
 *
 * Exemple avec page=7, totalPages=20 :
 * [1, '...', 6, 7, 8, '...', 20]
 */
function getPageRange(page: number, totalPages: number): (number | '...')[] {
  const siblingCount = 1
  const totalVisible = siblingCount * 2 + 5 // premier + dernier + courante + 2 "..." potentiels
  
  if (totalPages <= totalVisible) {
    return Array.from({ length: totalPages }, (_, i) => i + 1)
  }
  
  const leftSibling = Math.max(page - siblingCount, 1)
  const rightSibling = Math.min(page + siblingCount, totalPages)
  
  const showLeftDots = leftSibling > 2
  const showRightDots = rightSibling < totalPages - 1
  
  if (!showLeftDots && showRightDots) {
    const leftRange = Array.from({ length: 3 + siblingCount * 2 }, (_, i) => i + 1)
    return [...leftRange, '...', totalPages]
  }
  
  if (showLeftDots && !showRightDots) {
    const rightRangeLength = 3 + siblingCount * 2
    const rightRange = Array.from({ length: rightRangeLength },
      (_, i) => totalPages - rightRangeLength + i + 1
    )
    return [1, '...', ...rightRange]
  }
  
  const middleRange = Array.from({ length: rightSibling - leftSibling + 1 }, (_, i) => leftSibling + i)
  return [1, '...', ...middleRange, '...', totalPages]
}

export function Pagination({ page, totalPages, searchParams }: PaginationProps) {
  if (totalPages <= 1) return null
  
  const pageRange = getPageRange(page, totalPages)
  
  return (
    <nav aria-label="Pagination du catalogue" className="mt-10 flex items-center justify-center gap-1.5">
      <Link
        href={buildHref('/produits', searchParams, { page: String(Math.max(1, page - 1)) })}
        aria-disabled={page === 1}
        aria-label="Page précédente"
        className={cn(
          'flex h-9 w-9 items-center justify-center rounded border border-border transition-all duration-150 active:scale-95',
          page === 1 ? 'pointer-events-none opacity-40' : 'hover:border-ink-muted hover:bg-paper-muted'
        )}
      >
        <ChevronLeft className="h-4 w-4" />
      </Link>

      {pageRange.map((p, index) =>
        p === '...' ? (
          <span
            key={`dots-${index}`}
            aria-hidden="true"
            className="flex h-9 w-9 items-center justify-center text-ink-muted"
          >
            <MoreHorizontal className="h-4 w-4" />
          </span>
        ) : (
          <Link
            key={p}
            href={buildHref('/produits', searchParams, { page: String(p) })}
            aria-current={p === page ? 'page' : undefined}
            className={cn(
              'flex h-9 min-w-9 items-center justify-center rounded border px-2 text-sm transition-all duration-150 active:scale-95',
              p === page
                ? 'border-accent bg-accent text-accent-foreground'
                : 'border-border hover:border-ink-muted hover:bg-paper-muted'
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
          'flex h-9 w-9 items-center justify-center rounded border border-border transition-all duration-150 active:scale-95',
          page === totalPages ? 'pointer-events-none opacity-40' : 'hover:border-ink-muted hover:bg-paper-muted'
        )}
      >
        <ChevronRight className="h-4 w-4" />
      </Link>
    </nav>
  )
}