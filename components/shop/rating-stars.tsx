import { Star } from 'lucide-react'
import { cn } from '@/lib/utils'

export function RatingStars({
  rating,
  size = 16,
  className,
}: {
  rating: number
  size?: number
  className?: string
}) {
  const percent = Math.max(0, Math.min(100, (rating / 5) * 100))

  return (
    <span
      role="img"
      aria-label={`Note : ${rating.toFixed(1)} sur 5`}
      className={cn('relative inline-flex', className)}
    >
      {/* Étoiles vides (base) */}
      <span className="flex text-border" aria-hidden="true">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star key={i} width={size} height={size} fill="currentColor" strokeWidth={0} />
        ))}
      </span>
      {/* Étoiles pleines (superposées, largeur = pourcentage de la note) */}
      <span
        className="absolute inset-0 flex overflow-hidden text-gold"
        style={{ width: `${percent}%` }}
        aria-hidden="true"
      >
        {Array.from({ length: 5 }).map((_, i) => (
          <Star key={i} width={size} height={size} fill="currentColor" strokeWidth={0} />
        ))}
      </span>
    </span>
  )
}
