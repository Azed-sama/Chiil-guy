'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Star } from 'lucide-react'
import { toast } from 'sonner'
import { createReview } from '@/app/account/actions'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'

export function ReviewForm({
  productId,
  orderId,
  productName,
}: {
  productId: string
  orderId: string
  productName: string
}) {
  const router = useRouter()
  const [rating, setRating] = useState(0)
  const [hoverRating, setHoverRating] = useState(0)
  const [comment, setComment] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  async function handleSubmit() {
    if (rating < 1) {
      toast.error('Merci de choisir une note.')
      return
    }

    setIsSubmitting(true)
    const result = await createReview(productId, orderId, { rating, comment })
    setIsSubmitting(false)

    if (!result.success) {
      toast.error(result.error)
      return
    }

    setSubmitted(true)
    toast.success('Merci pour ton avis !')
    router.refresh()
  }

  if (submitted) {
    return <p className="text-xs text-accent">Avis envoyé, merci !</p>
  }

  return (
    <div className="space-y-3">
      <p className="text-xs font-medium text-ink">Laisser un avis sur « {productName} »</p>

      <div className="flex gap-1" role="radiogroup" aria-label="Note">
        {[1, 2, 3, 4, 5].map((value) => (
          <button
            key={value}
            type="button"
            role="radio"
            aria-checked={rating === value}
            aria-label={`${value} étoile${value > 1 ? 's' : ''}`}
            onMouseEnter={() => setHoverRating(value)}
            onMouseLeave={() => setHoverRating(0)}
            onClick={() => setRating(value)}
          >
            <Star
              className={cn(
                'h-6 w-6 transition-colors',
                (hoverRating || rating) >= value ? 'fill-gold text-gold' : 'fill-none text-border'
              )}
            />
          </button>
        ))}
      </div>

      <Textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        rows={2}
        placeholder="Ton avis sur ce produit (optionnel)"
      />

      <Button type="button" size="sm" onClick={handleSubmit} isLoading={isSubmitting}>
        Envoyer mon avis
      </Button>
    </div>
  )
}
