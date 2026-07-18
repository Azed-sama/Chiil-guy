'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { settingsSchema, type SettingsInput } from '@/lib/validations/settings'

type ActionResult = { success: true } | { success: false; error: string }

async function requireAdmin() {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { supabase, error: 'Non authentifié.' as const }
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, is_blocked')
    .eq('id', user.id)
    .single()

  if (!profile || profile.role !== 'admin' || profile.is_blocked) {
    return { supabase, error: 'Accès réservé aux administrateurs.' as const }
  }

  return { supabase, error: null }
}

export async function updateSettings(input: SettingsInput): Promise<ActionResult> {
  const parsed = settingsSchema.safeParse(input)
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0]?.message ?? 'Données invalides.' }
  }

  const { supabase, error: authError } = await requireAdmin()
  if (authError) return { success: false, error: authError }

  const { error } = await supabase
    .from('settings')
    .update({
      store_name: parsed.data.storeName,
      store_description: parsed.data.storeDescription || null,
      contact_email: parsed.data.contactEmail || null,
      whatsapp_number: parsed.data.whatsappNumber,
    })
    .eq('id', 1)

  if (error) {
    console.error('updateSettings error:', error.message)
    return { success: false, error: 'Impossible de mettre à jour les paramètres.' }
  }

  // Ces paramètres impactent tout le site : header, footer, contact,
  // commande WhatsApp, métadonnées SEO.
  revalidatePath('/', 'layout')
  return { success: true }
}
