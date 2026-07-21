import * as React from 'react'
import { cn } from '@/lib/utils'

export const Textarea = React.forwardRef < HTMLTextAreaElement,
  React.TextareaHTMLAttributes < HTMLTextAreaElement >> (
    ({ className, ...props }, ref) => (
      <textarea
      ref={ref}
      className={cn(
        'flex w-full rounded-lg border border-border bg-paper px-3.5 py-2.5 text-sm text-ink transition-all duration-200',
        'placeholder:text-ink-muted',
        'focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-accent/15 focus-visible:border-accent',
        'disabled:cursor-not-allowed disabled:opacity-50',
        'aria-[invalid=true]:border-danger aria-[invalid=true]:focus-visible:ring-danger/15',
        className
      )}
      {...props}
    />
    )
  )
Textarea.displayName = 'Textarea'