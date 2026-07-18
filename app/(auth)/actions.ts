'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import {
  loginSchema,
  registerSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  type LoginInput,
  type RegisterInput,
  type ForgotPasswordInput,
  type ResetPasswordInput,
} from '@/lib/validations/auth'

type ActionResult = { success: true } | { success: false; error: string }

// Message générique volontaire : ne jamais préciser si c'est l'email
// ou le mot de passe qui est incorrect (protection anti-énumération
// de comptes). C'est aussi Supabase Auth qui applique nativement un
// rate limiting sur les tentatives de connexion et d'inscription.
const GENERIC_LOGIN_ERROR = 'Email ou mot de passe incorrect.'
const GENERIC_SERVER_ERROR = 'Une erreur est survenue. Réessaie dans quelques instants.'

export async function signIn(input: LoginInput): Promise<ActionResult> {
  const parsed = loginSchema.safeParse(input)
  if (!parsed.success) {
    return { success: false, error: 'Merci de vérifier les informations saisies.' }
  }

  const supabase = createClient()
  const { error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  })

  if (error) {
    return { success: false, error: GENERIC_LOGIN_ERROR }
  }

  revalidatePath('/', 'layout')
  return { success: true }
}

export async function signUp(input: RegisterInput): Promise<ActionResult> {
  const parsed = registerSchema.safeParse(input)
  if (!parsed.success) {
    return { success: false, error: 'Merci de vérifier les informations saisies.' }
  }

  const supabase = createClient()
  const { error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      data: { full_name: parsed.data.fullName },
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
    },
  })

  if (error) {
    // Message générique même si le compte existe déjà, pour ne pas
    // révéler quelles adresses email sont déjà inscrites.
    return { success: false, error: GENERIC_SERVER_ERROR }
  }

  return { success: true }
}

export async function signOut() {
  const supabase = createClient()
  await supabase.auth.signOut()
  revalidatePath('/', 'layout')
  redirect('/')
}

export async function forgotPassword(input: ForgotPasswordInput): Promise<ActionResult> {
  const parsed = forgotPasswordSchema.safeParse(input)
  if (!parsed.success) {
    return { success: false, error: 'Adresse email invalide.' }
  }

  const supabase = createClient()
  await supabase.auth.resetPasswordForEmail(parsed.data.email, {
    redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback?next=/mettre-a-jour-mot-de-passe`,
  })

  // Toujours un succès, que l'email corresponde à un compte ou non :
  // sinon on permettrait de deviner quels emails sont enregistrés.
  return { success: true }
}

export async function updatePassword(input: ResetPasswordInput): Promise<ActionResult> {
  const parsed = resetPasswordSchema.safeParse(input)
  if (!parsed.success) {
    return { success: false, error: 'Le mot de passe ne respecte pas les critères requis.' }
  }

  const supabase = createClient()

  // Nécessite une session de récupération active (obtenue via le lien
  // reçu par email, échangé dans /auth/callback).
  const { error } = await supabase.auth.updateUser({ password: parsed.data.password })

  if (error) {
    return {
      success: false,
      error: 'Impossible de mettre à jour le mot de passe. Le lien a peut-être expiré, redemande un nouveau lien.',
    }
  }

  return { success: true }
}
