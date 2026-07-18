import { z } from 'zod'

export const categorySchema = z.object({
  name: z.string().min(2, 'Le nom doit contenir au moins 2 caractères').max(100, 'Nom trop long'),
  slug: z
    .string()
    .min(2, 'Slug trop court')
    .max(100, 'Slug trop long')
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Minuscules et tirets uniquement (ex: mon-produit)'),
  description: z.string().max(1000, 'Description trop longue').optional().or(z.literal('')),
  imageUrl: z.string().nullable().optional(),
  isActive: z.boolean().default(true),
})

export type CategoryInput = z.infer<typeof categorySchema>
