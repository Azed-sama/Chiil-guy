'use client'

import { useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { Minus, Plus, ShoppingBag } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { addToCart } from '@/app/(shop)/panier/actions'

interface AddToCartButtonProps {
  productId: string
  stockQuantity: number
  isAuthenticated: boolean
}

export function AddToCartButton({ productId, stockQuantity, isAuthenticated }: AddToCartButtonProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [quantity, setQuantity] = useState(1)
  const [isPending, setIsPending] = useState(false)
  const isOutOfStock = stockQuantity <= 0

  async function handleAddToCart() {
    if (!isAuthenticated) {
      router.push(`/connexion?redirect=${encodeURIComponent(pathname)}`)
      return
    }

    setIsPending(true)
    const result = await addToCart({ productId, quantity })
    setIsPending(false)

    if (!result.success) {
      toast.error(result.error)
      return
    }

    toast.success('Ajouté au panier', {
      description: `${quantity} exemplaire${quantity > 1 ? 's' : ''} ajouté${quantity > 1 ? 's' : ''}.`,
    })
    router.refresh()
  }

  if (isOutOfStock) {
    return (
      <Button disabled className="w-full" size="lg">
        Rupture de stock
      </Button>
    )
  }

  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center rounded border border-border">
        <button
          type="button"
          onClick={() => setQuantity((q) => Math.max(1, q - 1))}
          disabled={quantity <= 1}
          aria-label="Diminuer la quantité"
          className="flex h-11 w-11 items-center justify-center text-ink-muted transition-colors hover:text-ink disabled:opacity-40"
        >
          <Minus className="h-4 w-4" />
        </button>
        <span className="w-8 text-center text-sm font-medium" aria-live="polite">
          {quantity}
        </span>
        <button
          type="button"
          onClick={() => setQuantity((q) => Math.min(stockQuantity, q + 1))}
          disabled={quantity >= stockQuantity}
          aria-label="Augmenter la quantité"
          className="flex h-11 w-11 items-center justify-center text-ink-muted transition-colors hover:text-ink disabled:opacity-40"
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>

      <Button onClick={handleAddToCart} size="lg" className="flex-1" isLoading={isPending}>
        <ShoppingBag className="h-4 w-4" aria-hidden="true" />
        Ajouter au panier
      </Button>
    </div>
  )
}
