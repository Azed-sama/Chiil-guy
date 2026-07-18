import { createClient } from '@/lib/supabase/server'
import type { Category, Product, ProductImage } from '@/types/supabase'

export type ProductWithRelations = Product & {
  category: Pick<Category, 'id' | 'name' | 'slug'> | null
  images: Pick<ProductImage, 'url' | 'alt_text' | 'display_order'>[]
}

export type ProductSort = 'prix-asc' | 'prix-desc' | 'nouveautes' | undefined

export interface ProductFilters {
  q?: string
  categorie?: string
  tri?: ProductSort
  min?: number
  max?: number
  page?: number
}

export const PRODUCTS_PAGE_SIZE = 12

const PRODUCT_SELECT =
  '*, category:categories(id, name, slug), images:product_images(url, alt_text, display_order)'

function withSortedImages(product: ProductWithRelations): ProductWithRelations {
  return {
    ...product,
    images: [...(product.images ?? [])].sort((a, b) => a.display_order - b.display_order),
  }
}

/**
 * Liste paginée des produits actifs, avec recherche, filtre catégorie,
 * filtre de prix et tri. Toute la logique de filtrage vit ici pour
 * rester réutilisable (page catalogue, futures recherches admin, etc.).
 */
export async function getProducts(filters: ProductFilters = {}) {
  const supabase = createClient()
  const page = filters.page && filters.page > 0 ? filters.page : 1
  const from = (page - 1) * PRODUCTS_PAGE_SIZE
  const to = from + PRODUCTS_PAGE_SIZE - 1

  let query = supabase
    .from('products')
    .select(PRODUCT_SELECT, { count: 'exact' })
    .eq('is_active', true)

  if (filters.categorie) {
    const { data: category } = await supabase
      .from('categories')
      .select('id')
      .eq('slug', filters.categorie)
      .maybeSingle()

    // Slug de catégorie inconnu : on force un résultat vide plutôt
    // qu'une erreur ou (pire) qu'un catalogue non filtré.
    query = query.eq('category_id', category?.id ?? '00000000-0000-0000-0000-000000000000')
  }

  if (filters.q?.trim()) {
    const term = filters.q.trim().replace(/[%_]/g, '')
    query = query.or(`name.ilike.%${term}%,description.ilike.%${term}%`)
  }

  if (filters.min !== undefined) {
    query = query.gte('price', filters.min)
  }
  if (filters.max !== undefined) {
    query = query.lte('price', filters.max)
  }

  switch (filters.tri) {
    case 'prix-asc':
      query = query.order('price', { ascending: true })
      break
    case 'prix-desc':
      query = query.order('price', { ascending: false })
      break
    case 'nouveautes':
      query = query.order('created_at', { ascending: false })
      break
    default:
      // Tri par défaut : produits en vedette d'abord, puis les plus récents
      query = query.order('is_featured', { ascending: false }).order('created_at', { ascending: false })
  }

  const { data, count, error } = await query.range(from, to)

  if (error) {
    console.error('getProducts error:', error.message)
    return { products: [] as ProductWithRelations[], count: 0, page, pageSize: PRODUCTS_PAGE_SIZE }
  }

  return {
    products: ((data ?? []) as ProductWithRelations[]).map(withSortedImages),
    count: count ?? 0,
    page,
    pageSize: PRODUCTS_PAGE_SIZE,
  }
}

export async function getProductBySlug(slug: string): Promise<ProductWithRelations | null> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('products')
    .select(PRODUCT_SELECT)
    .eq('slug', slug)
    .eq('is_active', true)
    .maybeSingle()

  if (error || !data) {
    if (error) console.error('getProductBySlug error:', error.message)
    return null
  }

  return withSortedImages(data as ProductWithRelations)
}

export async function getFeaturedProducts(limit = 4): Promise<ProductWithRelations[]> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('products')
    .select(PRODUCT_SELECT)
    .eq('is_active', true)
    .eq('is_featured', true)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) {
    console.error('getFeaturedProducts error:', error.message)
    return []
  }

  return ((data ?? []) as ProductWithRelations[]).map(withSortedImages)
}

export async function getRelatedProducts(
  categoryId: string | null,
  excludeProductId: string,
  limit = 4
): Promise<ProductWithRelations[]> {
  if (!categoryId) return []

  const supabase = createClient()

  const { data, error } = await supabase
    .from('products')
    .select(PRODUCT_SELECT)
    .eq('is_active', true)
    .eq('category_id', categoryId)
    .neq('id', excludeProductId)
    .limit(limit)

  if (error) {
    console.error('getRelatedProducts error:', error.message)
    return []
  }

  return ((data ?? []) as ProductWithRelations[]).map(withSortedImages)
}
