import Link from 'next/link'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { buildHref, cn } from '@/lib/utils'

interface PaginationProps {
  page: number
  totalPages: number
  searchParams: Record<string, string | undefined>
}

export function Pagination({ page, totalPages, searchParams }: PaginationProps) {
  if (totalPages <= 1) return null

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1)

  return (
    <nav aria-label="Pagination du catalogue" className="mt-10 flex items-center justify-center gap-1">
      <Link
        href={buildHref('/produits', searchParams, { page: String(Math.max(1, page - 1)) })}
        aria-disabled={page === 1}
        aria-label="Page précédente"
        className={cn(
          'flex h-9 w-9 items-center justify-center rounded border border-border transition-colors',
          page === 1 ? 'pointer-events-none opacity-40' : 'hover:bg-paper-muted'
        )}
      >
        <ChevronLeft className="h-4 w-4" />
      </Link>

      {pages.map((p) => (
        <Link
          key={p}
          href={buildHref('/produits', searchParams, { page: String(p) })}
          aria-current={p === page ? 'page' : undefined}
          className={cn(
            'flex h-9 min-w-9 items-center justify-center rounded border px-2 text-sm transition-colors',
            p === page
              ? 'border-accent bg-accent text-accent-foreground'
              : 'border-border hover:bg-paper-muted'
          )}
        >
          {p}
        </Link>
      ))}

      <Link
        href={buildHref('/produits', searchParams, { page: String(Math.min(totalPages, page + 1)) })}
        aria-disabled={page === totalPages}
        aria-label="Page suivante"
        className={cn(
          'flex h-9 w-9 items-center justify-center rounded border border-border transition-colors',
          page === totalPages ? 'pointer-events-none opacity-40' : 'hover:bg-paper-muted'
        )}
      >
        <ChevronRight className="h-4 w-4" />
      </Link>
    </nav>
  )
}
