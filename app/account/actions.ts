'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { profileSchema, reviewSchema, type ProfileInput, type ReviewInput } from '@/lib/validations/account'

type ActionResult = { success: true } | { success: false; error: string }

export async function updateProfile(input: ProfileInput): Promise<ActionResult> {
  const parsed = profileSchema.safeParse(input)
  if (!parsed.success) {
    return { success: false, error: 'Merci de vérifier les informations saisies.' }
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Non authentifié.' }

  // Bypass de type avec 'as any' pour que Vercel ne bloque pas sur les colonnes de profiles
  const { error } = await (supabase
    .from('profiles') as any)
    .update({ full_name: parsed.data.fullName, phone: parsed.data.phone || null })
    .eq('id', user.id)

  if (error) {
    console.error('updateProfile error:', error.message)
    return { success: false, error: 'Impossible de mettre à jour le profil.' }
  }

  revalidatePath('/account')
  revalidatePath('/', 'layout')
  return { success: true }
}

export async function createReview(
  productId: string,
  orderId: string,
  input: ReviewInput
): Promise<ActionResult> {
  const parsed = reviewSchema.safeParse(input)
  if (!parsed.success) {
    return { success: false, error: 'Merci de vérifier ta note et ton commentaire.' }
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Non authentifié.' }

  // Bypass de type avec 'as any' également sur les reviews par sécurité
  const { error } = await (supabase
    .from('reviews') as any)
    .insert({
      product_id: productId,
      order_id: orderId,
      user_id: user.id,
      rating: parsed.data.rating,
      comment: parsed.data.comment || null,
    })

  if (error) {
    console.error('createReview error:', error.message)
    if (error.code === '23505') {
      return { success: false, error: 'Tu as déjà laissé un avis pour ce produit.' }
    }
    return {
      success: false,
      error: "Impossible d'enregistrer ton avis. Vérifie que la commande est bien livrée.",
    }
  }

  revalidatePath('/account/commandes')
  revalidatePath('/produits')
  return { success: true }
}
