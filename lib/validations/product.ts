import { z } from 'zod'

export const productSchema = z
  .object({
    name: z.string().min(2, 'Le nom doit contenir au moins 2 caractères').max(200, 'Nom trop long'),
    slug: z
      .string()
      .min(2, 'Slug trop court')
      .max(200, 'Slug trop long')
      .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Minuscules et tirets uniquement (ex: mon-produit)'),
    description: z.string().max(5000, 'Description trop longue').optional().or(z.literal('')),
    categoryId: z.string().uuid().nullable().optional(),
    price: z.coerce.number().min(0, 'Le prix doit être positif ou nul'),
    salePrice: z.coerce.number().min(0).nullable().optional(),
    saleStartsAt: z.string().nullable().optional(),
    saleEndsAt: z.string().nullable().optional(),
    sku: z.string().max(100).nullable().optional(),
    stockQuantity: z.coerce.number().int().min(0, 'Le stock ne peut pas être négatif'),
    isFeatured: z.boolean().default(false),
    isActive: z.boolean().default(true),
  })
  .refine((data) => !data.salePrice || data.salePrice < data.price, {
    message: 'Le prix promotionnel doit être inférieur au prix normal',
    path: ['salePrice'],
  })

export type ProductInput = z.infer<typeof productSchema>
