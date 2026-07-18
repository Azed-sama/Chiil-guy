import { createClient } from '@/lib/supabase/server'
import type { Category } from '@/types/supabase'

export interface AdminCategoryListItem {
  id: string
  name: string
  slug: string
  imageUrl: string | null
  displayOrder: number
  isActive: boolean
  productCount: number
}

/**
 * Toutes les catégories (actives ET désactivées), triées par ordre
 * d'affichage, avec le nombre de produits rattachés à chacune.
 */
export async function getAllCategoriesAdmin(): Promise<AdminCategoryListItem[]> {
  const supabase = createClient()

  const { data: categories, error } = await supabase
    .from('categories')
    .select('id, name, slug, image_url, display_order, is_active')
    .order('display_order', { ascending: true })

  if (error) {
    console.error('getAllCategoriesAdmin error:', error.message)
    return []
  }
  if (!categories || categories.length === 0) return []

  const categoryIds = categories.map((c) => c.id)
  const { data: products } = await supabase
    .from('products')
    .select('category_id')
    .in('category_id', categoryIds)

  const countByCategory = new Map<string, number>()
  for (const p of products ?? []) {
    if (!p.category_id) continue
    countByCategory.set(p.category_id, (countByCategory.get(p.category_id) ?? 0) + 1)
  }

  return categories.map((c) => ({
    id: c.id,
    name: c.name,
    slug: c.slug,
    imageUrl: c.image_url,
    displayOrder: c.display_order,
    isActive: c.is_active,
    productCount: countByCategory.get(c.id) ?? 0,
  }))
}

/**
 * Détail complet d'une catégorie pour le formulaire d'édition admin.
 */
export async function getCategoryByIdAdmin(id: string): Promise<Category | null> {
  const supabase = createClient()

  const { data, error } = await supabase.from('categories').select('*').eq('id', id).maybeSingle()

  if (error || !data) {
    if (error) console.error('getCategoryByIdAdmin error:', error.message)
    return null
  }

  return data
}
