import { z } from 'zod'

export const profileSchema = z.object({
  fullName: z
    .string()
    .min(2, 'Le nom complet doit contenir au moins 2 caractères')
    .max(100, 'Nom trop long'),
  phone: z
    .string()
    .max(20, 'Numéro trop long')
    .regex(/^[0-9+\s-]*$/, 'Le numéro ne doit contenir que des chiffres')
    .optional()
    .or(z.literal('')),
})
export type ProfileInput = z.infer<typeof profileSchema>

export const reviewSchema = z.object({
  rating: z.coerce.number().int().min(1, 'Merci de choisir une note').max(5),
  comment: z.string().max(1000, 'Avis trop long').optional().or(z.literal('')),
})
export type ReviewInput = z.infer<typeof reviewSchema>
