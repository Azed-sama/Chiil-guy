'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Minus, Plus, Trash2, ImageOff, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { formatPrice, getEffectivePrice, cn } from '@/lib/utils'
import { updateCartItemQuantity, removeCartItem } from '@/app/(shop)/panier/actions'
import type { CartItemWithProduct } from '@/lib/data/cart'

export function CartItemRow({ item }: { item: CartItemWithProduct }) {
  const router = useRouter()
  const [isPending, setIsPending] = useState(false)
  const [isRemoving, setIsRemoving] = useState(false)
  const { price } = getEffectivePrice(item.product)
  
  async function handleQuantityChange(nextQuantity: number) {
    if (nextQuantity < 1 || isPending) return
    
    setIsPending(true)
    const result = await updateCartItemQuantity({ cartItemId: item.id, quantity: nextQuantity })
    setIsPending(false)
    
    if (!result.success) {
      toast.error(result.error)
      return
    }
    router.refresh()
  }
  
  async function handleRemove() {
    setIsPending(true)
    const result = await removeCartItem({ cartItemId: item.id })
    
    if (!result.success) {
      setIsPending(false)
      toast.error(result.error)
      return
    }
    
    // Joue l'animation de sortie avant de rafraîchir la liste
    setIsRemoving(true)
    toast.success('Article retiré du panier')
    setTimeout(() => router.refresh(), 250)
  }
  
  return (
    <AnimatePresence>
      {!isRemoving && (
        <motion.div
          layout
          initial={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0, marginTop: 0, marginBottom: 0 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          className="overflow-hidden"
        >
          <div
            className={cn(
              'flex gap-4 border-b border-border py-6 transition-opacity duration-200 last:border-0',
              isPending && 'opacity-60'
            )}
          >
            <Link
              href={`/produits/${item.product.slug}`}
              className="relative h-24 w-24 shrink-0 overflow-hidden rounded bg-paper-muted"
            >
              {item.product.image ? (
                <Image
                  src={item.product.image.url}
                  alt={item.product.image.alt_text || item.product.name}
                  fill
                  sizes="96px"
                  className="object-cover"
                />
              ) : (
                <div className="flex h-full items-center justify-center text-ink-muted">
                  <ImageOff className="h-6 w-6" aria-hidden="true" />
                </div>
              )}
            </Link>

            <div className="flex flex-1 flex-col justify-between">
              <div className="flex items-start justify-between gap-4">
                <Link
                  href={`/produits/${item.product.slug}`}
                  className="text-sm font-medium text-ink hover:text-accent"
                >
                  {item.product.name}
                </Link>
                <button
                  type="button"
                  onClick={handleRemove}
                  disabled={isPending}
                  aria-label="Retirer du panier"
                  className="text-ink-muted transition-colors hover:text-danger disabled:opacity-40"
                >
                  {isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                  ) : (
                    <Trash2 className="h-4 w-4" />
                  )}
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center rounded border border-border">
                  <button
                    type="button"
                    onClick={() => handleQuantityChange(item.quantity - 1)}
                    disabled={isPending || item.quantity <= 1}
                    aria-label="Diminuer la quantité"
                    className="flex h-9 w-9 items-center justify-center text-ink-muted transition-colors hover:text-ink disabled:opacity-40"
                  >
                    <Minus className="h-3.5 w-3.5" />
                  </button>
                  <span className="w-8 text-center text-sm font-medium" aria-live="polite">
                    {item.quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleQuantityChange(item.quantity + 1)}
                    disabled={isPending || item.quantity >= item.product.stock_quantity}
                    aria-label="Augmenter la quantité"
                    className="flex h-9 w-9 items-center justify-center text-ink-muted transition-colors hover:text-ink disabled:opacity-40"
                  >
                    <Plus className="h-3.5 w-3.5" />
                  </button>
                </div>

                <motion.span
                  key={price * item.quantity}
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                  className="font-display text-base"
                >
                  {formatPrice(price * item.quantity)}
                </motion.span>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}