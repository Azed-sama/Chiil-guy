import { z } from 'zod'

export const contactFormSchema = z.object({
  name: z.string().min(2, 'Le nom doit contenir au moins 2 caractères').max(100, 'Nom trop long'),
  email: z
    .string()
    .min(1, "L'adresse email est requise")
    .email('Adresse email invalide'),
  subject: z.string().max(150, 'Sujet trop long').optional().or(z.literal('')),
  message: z
    .string()
    .min(10, 'Le message doit contenir au moins 10 caractères')
    .max(2000, 'Message trop long'),
})

export type ContactFormInput = z.infer<typeof contactFormSchema>
