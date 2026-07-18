import { z } from 'zod'

// ---------------------------------------------------------
// Règle de mot de passe partagée (inscription + reset)
// ---------------------------------------------------------
const passwordRule = z
  .string()
  .min(8, 'Le mot de passe doit contenir au moins 8 caractères')
  .regex(/[A-Z]/, 'Le mot de passe doit contenir au moins une majuscule')
  .regex(/[a-z]/, 'Le mot de passe doit contenir au moins une minuscule')
  .regex(/[0-9]/, 'Le mot de passe doit contenir au moins un chiffre')

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, "L'adresse email est requise")
    .email('Adresse email invalide'),
  password: z.string().min(1, 'Le mot de passe est requis'),
})
export type LoginInput = z.infer<typeof loginSchema>

export const registerSchema = z
  .object({
    fullName: z
      .string()
      .min(2, 'Le nom complet doit contenir au moins 2 caractères')
      .max(100, 'Le nom complet est trop long'),
    email: z
      .string()
      .min(1, "L'adresse email est requise")
      .email('Adresse email invalide'),
    password: passwordRule,
    confirmPassword: z.string().min(1, 'Merci de confirmer le mot de passe'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Les mots de passe ne correspondent pas',
    path: ['confirmPassword'],
  })
export type RegisterInput = z.infer<typeof registerSchema>

export const forgotPasswordSchema = z.object({
  email: z
    .string()
    .min(1, "L'adresse email est requise")
    .email('Adresse email invalide'),
})
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>

export const resetPasswordSchema = z
  .object({
    password: passwordRule,
    confirmPassword: z.string().min(1, 'Merci de confirmer le mot de passe'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Les mots de passe ne correspondent pas',
    path: ['confirmPassword'],
  })
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>
