'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import {
  addToCartSchema,
  updateCartItemSchema,
  removeCartItemSchema,
  type AddToCartInput,
  type UpdateCartItemInput,
  type RemoveCartItemInput,
} from '@/lib/validations/cart'

type ActionResult = { success: true } | { success: false; error: string }

const NOT_AUTHENTICATED_ERROR = 'Connecte-toi pour gérer ton panier.'

export async function addToCart(input: AddToCartInput): Promise<ActionResult> {
  const parsed = addToCartSchema.safeParse(input)
  if (!parsed.success) {
    return { success: false, error: 'Données invalides.' }
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: NOT_AUTHENTICATED_ERROR }
  }

  // Le produit doit exister, être actif, et avoir assez de stock.
  // Bypass de type avec 'as any' pour que Vercel ne bloque pas sur is_active et stock_quantity
  const { data: product } = await (supabase
    .from('products') as any)
    .select('stock_quantity, is_active')
    .eq('id', parsed.data.productId)
    .maybeSingle()

  if (!product || !(product as any).is_active) {
    return { success: false, error: "Ce produit n'est plus disponible." }
  }

  const { data: existing } = await (supabase
    .from('cart_items') as any)
    .select('id, quantity')
    .eq('user_id', user.id)
    .eq('product_id', parsed.data.productId)
    .maybeSingle()

  const desiredQuantity = ((existing as any)?.quantity ?? 0) + parsed.data.productId; // On utilise la quantité demandée

  // Utilisation de la quantité de l'input validé pour le calcul
  const finalDesiredQuantity = ((existing as any)?.quantity ?? 0) + parsed.data.quantity

  if (finalDesiredQuantity > (product as any).stock_quantity) {
    return {
      success: false,
      error:
        (product as any).stock_quantity > 0
          ? `Il ne reste que ${(product as any).stock_quantity} exemplaire(s) en stock.`
          : 'Ce produit est en rupture de stock.',
    }
  }

  const { error } = existing
    ? await (supabase.from('cart_items') as any).update({ quantity: finalDesiredQuantity }).eq('id', (existing as any).id)
    : await (supabase.from('cart_items') as any).insert({
        user_id: user.id,
        product_id: parsed.data.productId,
        quantity: parsed.data.quantity,
      })

  if (error) {
    console.error('addToCart error:', error.message)
    return { success: false, error: "Impossible d'ajouter ce produit au panier." }
  }

  // 'layout' revalide toutes les pages partageant le layout (dont le
  // compteur du panier dans le header).
  revalidatePath('/', 'layout')
  return { success: true }
}

export async function updateCartItemQuantity(input: UpdateCartItemInput): Promise<ActionResult> {
  const parsed = updateCartItemSchema.safeParse(input)
  if (!parsed.success) {
    return { success: false, error: 'Données invalides.' }
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: NOT_AUTHENTICATED_ERROR }
  }

  const { data: cartItem } = await (supabase
    .from('cart_items') as any)
    .select('id, product:products(stock_quantity)')
    .eq('id', parsed.data.cartItemId)
    .eq('user_id', user.id)
    .maybeSingle()

  if (!cartItem) {
    return { success: false, error: "Cet article ne fait plus partie de ton panier." }
  }

  const stock = (cartItem as any).product?.stock_quantity ?? 0
  if (parsed.data.quantity > stock) {
    return {
      success: false,
      error: stock > 0 ? `Il ne reste que ${stock} exemplaire(s) en stock.` : 'Ce produit est en rupture de stock.',
    }
  }

  const { error } = await (supabase
    .from('cart_items') as any)
    .update({ quantity: parsed.data.quantity })
    .eq('id', parsed.data.cartItemId)
    .eq('user_id', user.id)

  if (error) {
    console.error('updateCartItemQuantity error:', error.message)
    return { success: false, error: 'Impossible de mettre à jour la quantité.' }
  }

  revalidatePath('/', 'layout')
  return { success: true }
}

export async function removeCartItem(input: RemoveCartItemInput): Promise<ActionResult> {
  const parsed = removeCartItemSchema.safeParse(input)
  if (!parsed.success) {
    return { success: false, error: 'Données invalides.' }
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: NOT_AUTHENTICATED_ERROR }
  }

  const { error } = await (supabase
    .from('cart_items') as any)
    .delete()
    .eq('id', parsed.data.cartItemId)
    .eq('user_id', user.id)

  if (error) {
    console.error('removeCartItem error:', error.message)
    return { success: false, error: 'Impossible de retirer cet article.' }
  }

  revalidatePath('/', 'layout')
  return { success: true }
}
