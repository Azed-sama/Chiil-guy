import { z } from 'zod'

export const settingsSchema = z.object({
  storeName: z.string().min(2, 'Le nom doit contenir au moins 2 caractères').max(100, 'Nom trop long'),
  storeDescription: z.string().max(300, 'Description trop longue').optional().or(z.literal('')),
  contactEmail: z.string().email('Adresse email invalide').optional().or(z.literal('')),
  whatsappNumber: z
    .string()
    .min(8, 'Numéro invalide')
    .max(20, 'Numéro invalide')
    .regex(/^[0-9]+$/, 'Uniquement des chiffres, sans "+" ni espaces (ex: 22912345678)'),
})

export type SettingsInput = z.infer<typeof settingsSchema>
