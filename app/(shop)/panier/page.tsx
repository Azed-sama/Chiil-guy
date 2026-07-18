import Link from 'next/link'
import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { ShoppingBag } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { getCartItems } from '@/lib/data/cart'
import { CartItemRow } from '@/components/shop/cart-item-row'
import { Button } from '@/components/ui/button'
import { formatPrice, getEffectivePrice } from '@/lib/utils'

export const metadata: Metadata = { title: 'Mon panier' }

export default async function CartPage() {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/connexion?redirect=/panier')
  }

  const items = await getCartItems()
  const subtotal = items.reduce(
    (sum, item) => sum + getEffectivePrice(item.product).price * item.quantity,
    0
  )

  if (items.length === 0) {
    return (
      <main className="container flex flex-col items-center gap-4 py-32 text-center">
        <ShoppingBag className="h-10 w-10 text-ink-muted" aria-hidden="true" />
        <h1 className="font-display text-2xl">Ton panier est vide</h1>
        <p className="max-w-sm text-sm text-ink-muted">
          Découvre notre catalogue et ajoute tes coups de cœur.
        </p>
        <Button asChild className="mt-2">
          <Link href="/produits">Voir le catalogue</Link>
        </Button>
      </main>
    )
  }

  return (
    <main className="container py-10">
      <h1 className="mb-8 font-display text-3xl">Mon panier</h1>

      <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1fr_20rem]">
        <div>
          {items.map((item) => (
            <CartItemRow key={item.id} item={item} />
          ))}
        </div>

        <aside className="h-fit rounded-lg border border-border p-6">
          <h2 className="font-display text-lg">Récapitulatif</h2>

          <div className="mt-4 flex items-center justify-between text-sm">
            <span className="text-ink-muted">Sous-total</span>
            <span className="font-medium text-ink">{formatPrice(subtotal)}</span>
          </div>
          <p className="mt-1 text-xs text-ink-muted">Frais de livraison calculés à l'étape suivante.</p>

          <Button asChild className="mt-6 w-full" size="lg">
            <Link href="/commander">Passer commande</Link>
          </Button>

          <Link
            href="/produits"
            className="mt-3 block text-center text-sm text-ink-muted underline-offset-4 hover:text-ink hover:underline"
          >
            Continuer mes achats
          </Link>
        </aside>
      </div>
    </main>
  )
}
