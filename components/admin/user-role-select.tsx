'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { updateUserRole } from '@/app/actions/admin-users'
import { cn } from '@/lib/utils'
import type { UserRole } from '@/types/supabase'

const ROLE_LABELS: Record<UserRole, string> = {
  customer: 'Client',
  admin: 'Administrateur',
}

export function UserRoleSelect({
  userId,
  role,
  disabled,
}: {
  userId: string
  role: UserRole
  disabled?: boolean
}) {
  const router = useRouter()
  const [isPending, setIsPending] = useState(false)
  const [currentRole, setCurrentRole] = useState(role)

  async function handleChange(nextRole: UserRole) {
    if (nextRole === currentRole) return

    if (
      nextRole === 'admin' &&
      !window.confirm('Accorder les droits administrateur à ce compte ? Il aura accès à tout le dashboard.')
    ) {
      return
    }
    if (nextRole === 'customer' && !window.confirm('Retirer les droits administrateur de ce compte ?')) {
      return
    }

    setIsPending(true)
    const result = await updateUserRole(userId, nextRole)
    setIsPending(false)

    if (!result.success) {
      toast.error(result.error)
      return
    }

    setCurrentRole(nextRole)
    toast.success(`Rôle mis à jour : ${ROLE_LABELS[nextRole]}`)
    router.refresh()
  }

  return (
    <select
      value={currentRole}
      disabled={isPending || disabled}
      onChange={(e) => handleChange(e.target.value as UserRole)}
      aria-label="Modifier le rôle"
      title={disabled ? 'Tu ne peux pas modifier ton propre rôle' : undefined}
      className={cn(
        'h-9 rounded border border-border bg-paper px-2 text-sm text-ink transition-colors',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 focus-visible:border-accent',
        (isPending || disabled) && 'opacity-50'
      )}
    >
      <option value="customer">Client</option>
      <option value="admin">Administrateur</option>
    </select>
  )
}
