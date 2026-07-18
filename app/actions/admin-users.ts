'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import type { UserRole } from '@/types/supabase'

type ActionResult = { success: true } | { success: false; error: string }

async function requireAdmin() {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { supabase, adminId: null as string | null, error: 'Non authentifié.' as const }
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, is_blocked')
    .eq('id', user.id)
    .single()

  if (!profile || profile.role !== 'admin' || profile.is_blocked) {
    return { supabase, adminId: null as string | null, error: 'Accès réservé aux administrateurs.' as const }
  }

  return { supabase, adminId: user.id, error: null }
}

export async function updateUserRole(userId: string, role: UserRole): Promise<ActionResult> {
  const { supabase, adminId, error: authError } = await requireAdmin()
  if (authError) return { success: false, error: authError }

  // Un admin ne peut pas se retirer lui-même ses droits — il perdrait
  // l'accès au dashboard sans qu'un autre admin ne puisse les lui
  // redonner depuis l'interface.
  if (userId === adminId && role !== 'admin') {
    return { success: false, error: 'Tu ne peux pas retirer ton propre rôle administrateur.' }
  }

  const { error } = await supabase.from('profiles').update({ role }).eq('id', userId)

  if (error) {
    console.error('updateUserRole error:', error.message)
    return { success: false, error: 'Impossible de modifier le rôle.' }
  }

  revalidatePath('/admin/users')
  return { success: true }
}

export async function toggleUserBlocked(userId: string, isBlocked: boolean): Promise<ActionResult> {
  const { supabase, adminId, error: authError } = await requireAdmin()
  if (authError) return { success: false, error: authError }

  if (userId === adminId && isBlocked) {
    return { success: false, error: 'Tu ne peux pas bloquer ton propre compte.' }
  }

  const { error } = await supabase.from('profiles').update({ is_blocked: isBlocked }).eq('id', userId)

  if (error) {
    console.error('toggleUserBlocked error:', error.message)
    return { success: false, error: 'Impossible de mettre à jour le statut du compte.' }
  }

  revalidatePath('/admin/users')
  return { success: true }
}
