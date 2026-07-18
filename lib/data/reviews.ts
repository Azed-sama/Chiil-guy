import { createClient } from '@/lib/supabase/server'

export interface ProductReview {
  id: string
  rating: number
  comment: string | null
  created_at: string
  authorName: string
}

/**
 * Avis approuvés d'un produit, avec le nom de l'auteur résolu séparément
 * (reviews.user_id référence auth.users, pas directement profiles :
 * on ne peut pas compter sur l'embed automatique PostgREST ici, donc
 * on résout les profils en une seconde requête groupée).
 */
export async function getProductReviews(productId: string): Promise<ProductReview[]> {
  const supabase = createClient()

  const { data: reviews, error } = await supabase
    .from('reviews')
    .select('id, rating, comment, created_at, user_id')
    .eq('product_id', productId)
    .eq('is_approved', true)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('getProductReviews error:', error.message)
    return []
  }
  if (!reviews || reviews.length === 0) return []

  const userIds = [...new Set(reviews.map((r) => r.user_id))]
  const { data: profiles } = await supabase.from('profiles').select('id, full_name').in('id', userIds)

  const nameById = new Map((profiles ?? []).map((p) => [p.id, p.full_name]))

  return reviews.map((r) => ({
    id: r.id,
    rating: r.rating,
    comment: r.comment,
    created_at: r.created_at,
    authorName: nameById.get(r.user_id) || 'Client vérifié',
  }))
}

export async function getProductRatingSummary(productId: string) {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('reviews')
    .select('rating')
    .eq('product_id', productId)
    .eq('is_approved', true)

  if (error) {
    console.error('getProductRatingSummary error:', error.message)
    return { average: 0, count: 0 }
  }

  const ratings = data ?? []
  const count = ratings.length
  const average = count > 0 ? ratings.reduce((sum, r) => sum + r.rating, 0) / count : 0

  return { average, count }
}
