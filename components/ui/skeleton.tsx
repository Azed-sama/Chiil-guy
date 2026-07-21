import { cn } from '@/lib/utils'

/**
 * Bloc de chargement générique avec effet "shimmer".
 * Utilisé pour remplacer les zones de contenu (images, texte, cartes)
 * pendant le chargement des données serveur.
 */
export function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-md bg-paper-muted',
        'before:absolute before:inset-0 before:animate-shimmer',
        'before:bg-[length:200%_100%] before:bg-gradient-to-r',
        'before:from-transparent before:via-ink/[0.06] before:to-transparent',
        className
      )}
      aria-hidden="true"
      {...props}
    />
  )
}

/** Squelette d'une carte produit — même structure que ProductCard. */
export function ProductCardSkeleton() {
  return (
    <div className="flex flex-col overflow-hidden rounded-lg border border-border bg-paper">
      <Skeleton className="aspect-square rounded-none" />
      <div className="flex flex-col gap-2 p-4">
        <Skeleton className="h-3 w-16" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
        <Skeleton className="mt-2 h-5 w-20" />
      </div>
    </div>
  )
}

/** Grille de squelettes pour les pages de listing produits. */
export function ProductGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  )
}
