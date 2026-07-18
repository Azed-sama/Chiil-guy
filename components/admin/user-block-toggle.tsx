'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { toggleUserBlocked } from '@/app/actions/admin-users'
import { Switch } from '@/components/ui/switch'

export function UserBlockToggle({
  userId,
  isBlocked,
  disabled,
}: {
  userId: string
  isBlocked: boolean
  disabled?: boolean
}) {
  const router = useRouter()
  const [isPending, setIsPending] = useState(false)
  const [blocked, setBlocked] = useState(isBlocked)

  async function handleChange(nextBlocked: boolean) {
    if (nextBlocked && !window.confirm('Bloquer ce compte ? Il ne pourra plus se connecter ni commander.')) {
      return
    }

    setIsPending(true)
    const result = await toggleUserBlocked(userId, nextBlocked)
    setIsPending(false)

    if (!result.success) {
      toast.error(result.error)
      return
    }

    setBlocked(nextBlocked)
    toast.success(nextBlocked ? 'Compte bloqué.' : 'Compte débloqué.')
    router.refresh()
  }

  return (
    <Switch
      checked={!blocked}
      onCheckedChange={(checked) => handleChange(!checked)}
      disabled={isPending || disabled}
      id={`block-toggle-${userId}`}
    />
  )
}
