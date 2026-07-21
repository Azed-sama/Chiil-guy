import { cn } from '@/lib/utils'

/**
 * Bloc de chargement avec effet shimmer (balayage lumineux),
 * plus premium qu'un simple animate-pulse plat.
 */
export function Skeleton({ className }: { className?: string }) {
  return (
    <div className={cn('relative overflow-hidden rounded bg-paper-muted', className)}>
      <div
        className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-ink/[0.06] to-transparent"
        aria-hidden="true"
      />
    </div>
  )
}