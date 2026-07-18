import { z } from 'zod'

export const shippingInfoSchema = z.object({
  fullName: z
    .string()
    .min(2, 'Le nom complet doit contenir au moins 2 caractères')
    .max(100, 'Le nom complet est trop long'),
  phone: z
    .string()
    .min(8, 'Numéro de téléphone invalide')
    .max(20, 'Numéro de téléphone invalide')
    .regex(/^[0-9+\s-]+$/, 'Le numéro ne doit contenir que des chiffres'),
  city: z
    .string()
    .min(2, 'Merci d\'indiquer la ville ou le quartier')
    .max(100, 'Trop long'),
  address: z
    .string()
    .min(5, 'Merci de préciser une adresse ou un repère')
    .max(300, 'Trop long'),
  notes: z.string().max(500, 'Note trop longue').optional().or(z.literal('')),
})
export type ShippingInfoInput = z.infer<typeof shippingInfoSchema>
