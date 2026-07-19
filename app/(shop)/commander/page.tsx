import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getCartItems } from '@/lib/data/cart'
import { ShippingForm } from '@/components/shop/shipping-form'
import { formatPrice, getEffectivePrice } from '@/lib/utils'

export const metadata: Metadata = { title: 'Finaliser la commande' }

export default async function CheckoutPage() {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Avec la session anonyme créée par le middleware, `user` existe
  // presque toujours ici (guest checkout). Ce garde-fou ne se
  // déclenche que si l'authentification anonyme est désactivée côté
  // Supabase (Authentication > Providers > Allow anonymous sign-ins).
  if (!user) {
    redirect('/connexion?redirect=/commander')
  }

  const items = await getCartItems()
  if (items.length === 0) {
    redirect('/panier')
  }

  const subtotal = items.reduce(
    (sum, item) => sum + getEffectivePrice(item.product).price * item.quantity,
    0
  )

  return (
    <main className="container py-10">
      <h1 className="mb-8 font-display text-3xl">Finaliser la commande</h1>

      <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1fr_20rem]">
        <div>
          <h2 className="mb-4 font-display text-lg">Informations de livraison</h2>
          <ShippingForm />
          {user.is_anonymous && (
            <p className="mt-4 text-center text-xs text-ink-muted">
              <a href="/inscription" className="underline underline-offset-4 hover:text-ink">
                Créer un compte
              </a>{' '}
              pour suivre tes prochaines commandes (facultatif).
            </p>
          )}
        </div>

        <aside className="h-fit rounded-lg border border-border p-6">
          <h2 className="font-display text-lg">Récapitulatif</h2>

          <ul className="mt-4 space-y-3">
            {items.map((item) => (
              <li key={item.id} className="flex justify-between gap-3 text-sm">
                <span className="text-ink-muted">
                  {item.quantity} × {item.product.name}
                </span>
                <span className="shrink-0 font-medium text-ink">
                  {formatPrice(getEffectivePrice(item.product).price * item.quantity)}
                </span>
              </li>
            ))}
          </ul>

          <div className="mt-4 flex items-center justify-between border-t border-border pt-4 text-sm">
            <span className="text-ink-muted">Sous-total</span>
            <span className="font-medium text-ink">{formatPrice(subtotal)}</span>
          </div>
          <p className="mt-1 text-xs text-ink-muted">Livraison à négocier directement sur WhatsApp.</p>

          <div className="mt-3 flex items-center justify-between border-t border-border pt-3 text-base">
            <span className="font-display">Total</span>
            <span className="font-display">{formatPrice(subtotal)}</span>
          </div>
        </aside>
      </div>
    </main>
  )
}
