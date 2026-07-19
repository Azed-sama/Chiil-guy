'use client'

import { useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { ShoppingBag, Check } from 'lucide-react'
import { toast } from 'sonner'
import { addToCart } from '@/app/(shop)/panier/actions'
import { cn } from '@/lib/utils'

interface QuickAddButtonProps {
  productId: string
  isAuthenticated: boolean
  className?: string
}

export function QuickAddButton({ productId, isAuthenticated, className }: QuickAddButtonProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [state, setState] = useState<'idle' | 'pending' | 'done'>('idle')

  async function handleClick(e: React.MouseEvent) {
    // Empêche la navigation du <Link> parent qui enveloppe la carte
    e.preventDefault()
    e.stopPropagation()

    if (!isAuthenticated) {
      router.push(`/connexion?redirect=${encodeURIComponent(pathname)}`)
      return
    }

    setState('pending')
    const result = await addToCart({ productId, quantity: 1 })

    if (!result.success) {
      setState('idle')
      toast.error(result.error)
      return
    }

    setState('done')
    toast.success('Ajouté au panier')
    router.refresh()

    setTimeout(() => setState('idle'), 1500)
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={state === 'pending'}
      aria-label="Ajouter au panier"
      className={cn(
        'flex h-10 w-10 items-center justify-center rounded-full bg-paper text-ink shadow-md',
        'transition-all duration-200 hover:scale-105 hover:bg-accent hover:text-accent-foreground',
        'disabled:pointer-events-none disabled:opacity-70',
        className
      )}
    >
      {state === 'done' ? (
        <Check className="h-4 w-4 animate-fade-in" aria-hidden="true" />
      ) : (
        <ShoppingBag className="h-4 w-4" aria-hidden="true" />
      )}
    </button>
  )
}