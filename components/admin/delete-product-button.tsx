'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { deleteProduct } from '@/app/actions/admin-products'
import { Button } from '@/components/ui/button'

export function DeleteProductButton({
  productId,
  productName,
}: {
  productId: string
  productName: string
}) {
  const router = useRouter()
  const [isPending, setIsPending] = useState(false)

  async function handleDelete() {
    if (!window.confirm(`Supprimer "${productName}" ? Cette action est irréversible.`)) return

    setIsPending(true)
    const result = await deleteProduct(productId)
    setIsPending(false)

    if (!result.success) {
      toast.error(result.error)
      return
    }

    toast.success(
      result.deactivatedInstead
        ? "Produit désactivé (déjà commandé, conservé pour l'historique)."
        : 'Produit supprimé.'
    )
    router.refresh()
  }

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      onClick={handleDelete}
      disabled={isPending}
      aria-label={`Supprimer ${productName}`}
      className="text-danger hover:bg-danger/10 hover:text-danger"
    >
      <Trash2 className="h-4 w-4" />
    </Button>
  )
}
