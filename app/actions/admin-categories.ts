'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { categorySchema, type CategoryInput } from '@/lib/validations/category'

type ActionResult<T = undefined> = { success: true; data?: T } | { success: false; error: string }

async function requireAdmin() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { supabase, error: 'Non authentifié.' as const }
  }

  const { data: profile } = await (supabase
    .from('profiles') as any)
    .select('role, is_blocked')
    .eq('id', user.id)
    .single()

  if (!profile || (profile as any).role !== 'admin' || (profile as any).is_blocked) {
    return { supabase, error: 'Accès réservé aux administrateurs.' as const }
  }

  return { supabase, error: null }
}

export async function createCategory(input: CategoryInput): Promise<ActionResult<{ id: string }>> {
  const parsed = categorySchema.safeParse(input)
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0]?.message ?? 'Données invalides.' }
  }

  const { supabase, error: authError } = await requireAdmin()
  if (authError) return { success: false, error: authError }

  const { data: existing } = await (supabase
    .from('categories') as any)
    .select('id')
    .eq('slug', parsed.data.slug)
    .maybeSingle()

  if (existing) {
    return { success: false, error: 'Ce slug est déjà utilisé par une autre catégorie.' }
  }

  // La nouvelle catégorie est ajoutée en dernière position d'affichage
  const { data: maxOrderRow } = await (supabase
    .from('categories') as any)
    .select('display_order')
    .order('display_order', { ascending: false })
    .limit(1)
    .maybeSingle()

  const nextOrder = ((maxOrderRow as any)?.display_order ?? -1) + 1

  const { data: category, error } = await (supabase
    .from('categories') as any)
    .insert({
      name: parsed.data.name,
      slug: parsed.data.slug,
      description: parsed.data.description || null,
      image_url: parsed.data.imageUrl || null,
      is_active: parsed.data.isActive,
      display_order: nextOrder,
    })
    .select('id')
    .single()

  if (error || !category) {
    console.error('createCategory error:', error?.message)
    return { success: false, error: 'Impossible de créer la catégorie.' }
  }

  revalidatePath('/admin/categories')
  revalidatePath('/produits')
  return { success: true, data: { id: (category as any).id } }
}

export async function updateCategory(categoryId: string, input: CategoryInput): Promise<ActionResult> {
  const parsed = categorySchema.safeParse(input)
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0]?.message ?? 'Données invalides.' }
  }

  const { supabase, error: authError } = await requireAdmin()
  if (authError) return { success: false, error: authError }

  const { data: existing } = await (supabase
    .from('categories') as any)
    .select('id')
    .eq('slug', parsed.data.slug)
    .neq('id', categoryId)
    .maybeSingle()

  if (existing) {
    return { success: false, error: 'Ce slug est déjà utilisé par une autre catégorie.' }
  }

  const { error } = await (supabase
    .from('categories') as any)
    .update({
      name: parsed.data.name,
      slug: parsed.data.slug,
      description: parsed.data.description || null,
      image_url: parsed.data.imageUrl || null,
      is_active: parsed.data.isActive,
    })
    .eq('id', categoryId)

  if (error) {
    console.error('updateCategory error:', error.message)
    return { success: false, error: 'Impossible de modifier la catégorie.' }
  }

  revalidatePath('/admin/categories')
  revalidatePath('/produits')
  return { success: true }
}

export async function deleteCategory(categoryId: string): Promise<ActionResult> {
  const { supabase, error: authError } = await requireAdmin()
  if (authError) return { success: false, error: authError }

  // On refuse la suppression tant que des produits y sont rattachés
  const { count } = await (supabase
    .from('products') as any)
    .select('id', { count: 'exact', head: true })
    .eq('category_id', categoryId)

  if (count && count > 0) {
    return {
      success: false,
      error: `Impossible de supprimer : ${count} produit(s) sont encore rattachés à cette catégorie. Réaffecte-les d'abord.`,
    }
  }

  const { error } = await (supabase.from('categories') as any).delete().eq('id', categoryId)

  if (error) {
    console.error('deleteCategory error:', error.message)
    return { success: false, error: 'Impossible de supprimer la catégorie.' }
  }

  revalidatePath('/admin/categories')
  revalidatePath('/produits')
  return { success: true }
}

export async function reorderCategory(
  categoryId: string,
  direction: 'up' | 'down'
): Promise<ActionResult> {
  const { supabase, error: authError } = await requireAdmin()
  if (authError) return { success: false, error: authError }

  const { data: categories, error: fetchError } = await (supabase
    .from('categories') as any)
    .select('id, display_order')
    .order('display_order', { ascending: true })

  if (fetchError || !categories) {
    return { success: false, error: 'Impossible de récupérer les catégories.' }
  }

  const index = categories.findIndex((c: any) => c.id === categoryId)
  if (index === -1) {
    return { success: false, error: 'Catégorie introuvable.' }
  }

  const targetIndex = direction === 'up' ? index - 1 : index + 1
  if (targetIndex < 0 || targetIndex >= categories.length) {
    return { success: true } // déjà en première/dernière position
  }

  const current = categories[index]
  const target = categories[targetIndex]

  const [{ error: error1 }, { error: error2 }] = await Promise.all([
    (supabase.from('categories') as any).update({ display_order: target.display_order }).eq('id', current.id),
    (supabase.from('categories') as any).update({ display_order: current.display_order }).eq('id', target.id),
  ])

  if (error1 || error2) {
    console.error('reorderCategory error:', error1?.message, error2?.message)
    return { success: false, error: 'Impossible de réorganisation les catégories.' }
  }

  revalidatePath('/admin/categories')
  revalidatePath('/produits')
  return { success: true }
}
