'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { productSchema, type ProductInput } from '@/lib/validations/product'

type ActionResult<T = undefined> = { success: true; data?: T } | { success: false; error: string }

type DeleteResult =
  | { success: true; deactivatedInstead: boolean }
  | { success: false; error: string }

/**
 * Vérifie que l'utilisateur courant est un admin actif. Centralisé ici
 * pour ne pas dupliquer cette logique dans chacune des 3 actions.
 */
async function requireAdmin() {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { supabase, error: 'Non authentifié.' as const }
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, is_blocked')
    .eq('id', user.id)
    .single()

  if (!profile || profile.role !== 'admin' || profile.is_blocked) {
    return { supabase, error: 'Accès réservé aux administrateurs.' as const }
  }

  return { supabase, error: null }
}

function toProductRow(data: ProductInput) {
  return {
    name: data.name,
    slug: data.slug,
    description: data.description || null,
    category_id: data.categoryId || null,
    price: data.price,
    sale_price: data.salePrice || null,
    sale_starts_at: data.saleStartsAt || null,
    sale_ends_at: data.saleEndsAt || null,
    sku: data.sku || null,
    stock_quantity: data.stockQuantity,
    is_featured: data.isFeatured,
    is_active: data.isActive,
  }
}

export async function createProduct(input: ProductInput): Promise<ActionResult<{ id: string }>> {
  const parsed = productSchema.safeParse(input)
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0]?.message ?? 'Données invalides.' }
  }

  const { supabase, error: authError } = await requireAdmin()
  if (authError) return { success: false, error: authError }

  // Le slug est unique en base (contrainte SQL) : on vérifie ici pour
  // renvoyer un message clair plutôt qu'une erreur SQL brute.
  const { data: existing } = await supabase
    .from('products')
    .select('id')
    .eq('slug', parsed.data.slug)
    .maybeSingle()

  if (existing) {
    return { success: false, error: 'Ce slug est déjà utilisé par un autre produit.' }
  }

  const { data: product, error } = await supabase
    .from('products')
    .insert(toProductRow(parsed.data))
    .select('id')
    .single()

  if (error || !product) {
    console.error('createProduct error:', error?.message)
    return { success: false, error: 'Impossible de créer le produit.' }
  }

  revalidatePath('/admin/products')
  revalidatePath('/produits')
  return { success: true, data: { id: product.id } }
}

export async function updateProduct(productId: string, input: ProductInput): Promise<ActionResult> {
  const parsed = productSchema.safeParse(input)
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0]?.message ?? 'Données invalides.' }
  }

  const { supabase, error: authError } = await requireAdmin()
  if (authError) return { success: false, error: authError }

  const { data: existing } = await supabase
    .from('products')
    .select('id')
    .eq('slug', parsed.data.slug)
    .neq('id', productId)
    .maybeSingle()

  if (existing) {
    return { success: false, error: 'Ce slug est déjà utilisé par un autre produit.' }
  }

  const { error } = await supabase
    .from('products')
    .update(toProductRow(parsed.data))
    .eq('id', productId)

  if (error) {
    console.error('updateProduct error:', error.message)
    return { success: false, error: 'Impossible de modifier le produit.' }
  }

  revalidatePath('/admin/products')
  revalidatePath('/produits')
  revalidatePath(`/produits/${parsed.data.slug}`)
  return { success: true }
}

/**
 * Remplace l'intégralité des images d'un produit par la liste fournie
 * (stratégie "tout remplacer" plutôt qu'un diff fin — plus simple et
 * fiable pour un outil admin). L'ordre du tableau détermine
 * display_order (le premier élément est l'image principale).
 */
export async function saveProductImages(
  productId: string,
  images: { url: string; altText: string }[]
): Promise<ActionResult> {
  const { supabase, error: authError } = await requireAdmin()
  if (authError) return { success: false, error: authError }

  const { error: deleteError } = await supabase
    .from('product_images')
    .delete()
    .eq('product_id', productId)

  if (deleteError) {
    console.error('saveProductImages delete error:', deleteError.message)
    return { success: false, error: 'Impossible de mettre à jour les images.' }
  }

  if (images.length === 0) {
    revalidatePath('/admin/products')
    return { success: true }
  }

  const rows = images.map((img, index) => ({
    product_id: productId,
    url: img.url,
    alt_text: img.altText || null,
    display_order: index,
  }))

  const { error: insertError } = await supabase.from('product_images').insert(rows)

  if (insertError) {
    console.error('saveProductImages insert error:', insertError.message)
    return { success: false, error: "Impossible d'enregistrer les images." }
  }

  revalidatePath('/admin/products')
  revalidatePath('/produits')
  return { success: true }
}

export async function deleteProduct(productId: string): Promise<DeleteResult> {
  const { supabase, error: authError } = await requireAdmin()
  if (authError) return { success: false, error: authError }

  // Un produit déjà commandé n'est jamais supprimé physiquement (on
  // perdrait la cohérence de l'historique des commandes passées) :
  // on le désactive à la place. Seul un produit jamais commandé est
  // réellement supprimé.
  const { count } = await supabase
    .from('order_items')
    .select('id', { count: 'exact', head: true })
    .eq('product_id', productId)

  if (count && count > 0) {
    const { error: deactivateError } = await supabase
      .from('products')
      .update({ is_active: false })
      .eq('id', productId)

    if (deactivateError) {
      console.error('deleteProduct deactivate error:', deactivateError.message)
      return { success: false, error: 'Impossible de désactiver ce produit.' }
    }

    revalidatePath('/admin/products')
    revalidatePath('/produits')
    return { success: true, deactivatedInstead: true }
  }

  const { error } = await supabase.from('products').delete().eq('id', productId)

  if (error) {
    console.error('deleteProduct error:', error.message)
    return { success: false, error: 'Impossible de supprimer le produit.' }
  }

  revalidatePath('/admin/products')
  revalidatePath('/produits')
  return { success: true, deactivatedInstead: false }
}
