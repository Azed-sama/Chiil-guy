'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowUp, ArrowDown } from 'lucide-react'
import { toast } from 'sonner'
import { reorderCategory } from '@/app/actions/admin-categories'

export function ReorderCategoryButtons({
  categoryId,
  isFirst,
  isLast,
}: {
  categoryId: string
  isFirst: boolean
  isLast: boolean
}) {
  const router = useRouter()
  const [isPending, setIsPending] = useState(false)

  async function handleMove(direction: 'up' | 'down') {
    setIsPending(true)
    const result = await reorderCategory(categoryId, direction)
    setIsPending(false)

    if (!result.success) {
      toast.error(result.error)
      return
    }
    router.refresh()
  }

  return (
    <div className="flex shrink-0 flex-col gap-1">
      <button
        type="button"
        onClick={() => handleMove('up')}
        disabled={isPending || isFirst}
        aria-label="Monter"
        className="flex h-7 w-7 items-center justify-center rounded border border-border text-ink-muted transition-colors hover:text-ink disabled:opacity-30"
      >
        <ArrowUp className="h-3.5 w-3.5" />
      </button>
      <button
        type="button"
        onClick={() => handleMove('down')}
        disabled={isPending || isLast}
        aria-label="Descendre"
        className="flex h-7 w-7 items-center justify-center rounded border border-border text-ink-muted transition-colors hover:text-ink disabled:opacity-30"
      >
        <ArrowDown className="h-3.5 w-3.5" />
      </button>
    </div>
  )
}
