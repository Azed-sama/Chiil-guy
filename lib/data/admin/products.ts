import { createClient } from '@/lib/supabase/server'

export interface AdminProductListItem {
  id: string
  name: string
  slug: string
  sku: string | null
  price: number
  salePrice: number | null
  stockQuantity: number
  isActive: boolean
  isFeatured: boolean
  categoryName: string | null
  imageUrl: string | null
  createdAt: string
}

export interface AdminProductDetail {
  id: string
  name: string
  slug: string
  description: string | null
  categoryId: string | null
  price: number
  salePrice: number | null
  saleStartsAt: string | null
  saleEndsAt: string | null
  sku: string | null
  stockQuantity: number
  isFeatured: boolean
  isActive: boolean
  images: { url: string; altText: string | null }[]
}

/**
 * Détail complet d'un produit pour le formulaire d'édition admin.
 */
export async function getProductById(id: string): Promise<AdminProductDetail | null> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('products')
    .select('*, images:product_images (url, alt_text, display_order)')
    .eq('id', id)
    .maybeSingle()

  if (error || !data) {
    if (error) console.error('getProductById error:', error.message)
    return null
  }

  const sortedImages = [...(data.images ?? [])].sort(
    (a: any, b: any) => a.display_order - b.display_order
  )

  return {
    id: data.id,
    name: data.name,
    slug: data.slug,
    description: data.description,
    categoryId: data.category_id,
    price: data.price,
    salePrice: data.sale_price,
    saleStartsAt: data.sale_starts_at,
    saleEndsAt: data.sale_ends_at,
    sku: data.sku,
    stockQuantity: data.stock_quantity,
    isFeatured: data.is_featured,
    isActive: data.is_active,
    images: sortedImages.map((img: any) => ({ url: img.url, altText: img.alt_text })),
  }
}

/**
 * Tous les produits (actifs ET désactivés — l'admin doit pouvoir les
 * voir tous), avec catégorie et image principale résolues.
 * Protégée par le RLS (`products_all_admin`) + le middleware /admin.
 */
export async function getAllProducts(): Promise<AdminProductListItem[]> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('products')
    .select(
      `id, name, slug, sku, price, sale_price, stock_quantity, is_active, is_featured, created_at,
       category:categories (name),
       images:product_images (url, display_order)`
    )
    .order('created_at', { ascending: false })

  if (error) {
    console.error('getAllProducts error:', error.message)
    return []
  }

  return (data ?? []).map((product: any) => {
    const sortedImages = [...(product.images ?? [])].sort(
      (a: any, b: any) => a.display_order - b.display_order
    )

    return {
      id: product.id,
      name: product.name,
      slug: product.slug,
      sku: product.sku,
      price: product.price,
      salePrice: product.sale_price,
      stockQuantity: product.stock_quantity,
      isActive: product.is_active,
      isFeatured: product.is_featured,
      categoryName: product.category?.name ?? null,
      imageUrl: sortedImages[0]?.url ?? null,
      createdAt: product.created_at,
    }
  })
}
