import * as React from 'react'
import { cn } from '@/lib/utils'

export const Input = React.forwardRef < HTMLInputElement,
  React.InputHTMLAttributes < HTMLInputElement >> (
    ({ className, type, ...props }, ref) => (
      <input
      type={type}
      ref={ref}
      className={cn(
        'flex h-11 w-full rounded-lg border border-border bg-paper px-3.5 text-sm text-ink transition-all duration-200',
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
Input.displayName = 'Input'