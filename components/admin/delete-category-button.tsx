'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { deleteCategory } from '@/app/actions/admin-categories'
import { Button } from '@/components/ui/button'

export function DeleteCategoryButton({
  categoryId,
  categoryName,
}: {
  categoryId: string
  categoryName: string
}) {
  const router = useRouter()
  const [isPending, setIsPending] = useState(false)

  async function handleDelete() {
    if (!window.confirm(`Supprimer la catégorie "${categoryName}" ?`)) return

    setIsPending(true)
    const result = await deleteCategory(categoryId)
    setIsPending(false)

    if (!result.success) {
      toast.error(result.error)
      return
    }
    toast.success('Catégorie supprimée.')
    router.refresh()
  }

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      onClick={handleDelete}
      disabled={isPending}
      aria-label={`Supprimer ${categoryName}`}
      className="text-danger hover:bg-danger/10 hover:text-danger"
    >
      <Trash2 className="h-4 w-4" />
    </Button>
  )
}
