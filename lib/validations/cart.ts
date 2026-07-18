import { z } from 'zod'

export const addToCartSchema = z.object({
  productId: z.string().uuid(),
  quantity: z.coerce.number().int().min(1, 'Quantité invalide').max(99, 'Quantité trop élevée'),
})
export type AddToCartInput = z.infer<typeof addToCartSchema>

export const updateCartItemSchema = z.object({
  cartItemId: z.string().uuid(),
  quantity: z.coerce.number().int().min(1, 'Quantité invalide').max(99, 'Quantité trop élevée'),
})
export type UpdateCartItemInput = z.infer<typeof updateCartItemSchema>

export const removeCartItemSchema = z.object({
  cartItemId: z.string().uuid(),
})
export type RemoveCartItemInput = z.infer<typeof removeCartItemSchema>
