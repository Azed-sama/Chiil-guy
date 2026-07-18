import { createClient } from '@/lib/supabase/server'
import type { Category } from '@/types/supabase'

/**
 * Catégories actives, triées pour affichage (menu, filtres catalogue).
 */
export async function getCategories(): Promise<Category[]> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('is_active', true)
    .order('display_order', { ascending: true })

  if (error) {
    console.error('getCategories error:', error.message)
    return []
  }

  return data ?? []
}

export async function getCategoryBySlug(slug: string): Promise<Category | null> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('slug', slug)
    .eq('is_active', true)
    .maybeSingle()

  if (error) {
    console.error('getCategoryBySlug error:', error.message)
    return null
  }

  return data
}
