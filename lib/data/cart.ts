import { cache } from 'react'
import { createClient } from '@/lib/supabase/server'
import { getEffectivePrice } from '@/lib/utils'

export interface CartItemWithProduct {
  id: string
  quantity: number
  product: {
    id: string
    name: string
    slug: string
    price: number
    sale_price: number | null
    sale_starts_at: string | null
    sale_ends_at: string | null
    stock_quantity: number
    image: { url: string; alt_text: string | null } | null
  }
}

/**
 * Panier de l'utilisateur courant (vide si non connecté).
 * Enveloppé dans React.cache() : dédupliqué automatiquement si appelé
 * plusieurs fois dans le même rendu serveur (layout + page par ex.).
 */
export const getCartItems = cache(async (): Promise<CartItemWithProduct[]> => {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return []

  const { data, error } = await supabase
    .from('cart_items')
    .select(
      `id, quantity,
       product:products (
         id, name, slug, price, sale_price, sale_starts_at, sale_ends_at, stock_quantity,
         images:product_images (url, alt_text, display_order)
       )`
    )
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('getCartItems error:', error.message)
    return []
  }

  return (data ?? []).map((item: any) => {
    const sortedImages = [...(item.product?.images ?? [])].sort(
      (a, b) => a.display_order - b.display_order
    )

    return {
      id: item.id,
      quantity: item.quantity,
      product: {
        id: item.product.id,
        name: item.product.name,
        slug: item.product.slug,
        price: item.product.price,
        sale_price: item.product.sale_price,
        sale_starts_at: item.product.sale_starts_at,
        sale_ends_at: item.product.sale_ends_at,
        stock_quantity: item.product.stock_quantity,
        image: sortedImages[0] ?? null,
      },
    }
  })
})

export async function getCartSummary() {
  const items = await getCartItems()
  const count = items.reduce((sum, item) => sum + item.quantity, 0)
  const subtotal = items.reduce(
    (sum, item) => sum + getEffectivePrice(item.product).price * item.quantity,
    0
  )
  return { items, count, subtotal }
}
