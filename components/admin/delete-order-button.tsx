'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { deleteOrder } from '@/app/actions/admin'
import { Button } from '@/components/ui/button'

export function DeleteOrderButton({ orderId }: { orderId: string }) {
  const router = useRouter()
  const [isPending, setIsPending] = useState(false)

  async function handleDelete() {
    if (
      !window.confirm(
        'Supprimer définitivement cette commande ? Cette action est irréversible.'
      )
    ) {
      return
    }

    setIsPending(true)
    const result = await deleteOrder({ orderId })
    setIsPending(false)

    if (!result.success) {
      toast.error(result.error)
      return
    }

    toast.success('Commande supprimée.')
    router.refresh()
  }

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      disabled={isPending}
      onClick={handleDelete}
      aria-label="Supprimer la commande"
      className="text-danger hover:bg-danger/10 hover:text-danger"
    >
      <Trash2 className="h-4 w-4" />
    </Button>
  )
}